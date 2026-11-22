import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../../src/server.js';
import { pool, query } from '../../src/db.js';

let servidor;
let url;
let token;
const pedidosCriados = [];
const produtosCriados = [];

async function chamar(caminho, opcoes = {}) {
  const resposta = await fetch(url + caminho, {
    ...opcoes,
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
  });
  return { status: resposta.status, dados: await resposta.json() };
}

before(async () => {
  servidor = app.listen(0);
  url = `http://localhost:${servidor.address().port}`;
  const login = await chamar('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@estulanches.com', senha: 'admin123' }),
  });
  token = login.dados.token;
});

after(async () => {
  for (const id of pedidosCriados) {
    await query('DELETE FROM pedidos WHERE id_pedido = $1', [id]);
  }
  for (const id of produtosCriados) {
    await query('DELETE FROM produtos WHERE id_produto = $1', [id]);
  }
  servidor.close();
  await pool.end();
});

test('banco responde e as tabelas existem', async () => {
  const { rows } = await query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  const tabelas = rows.map((r) => r.table_name);
  for (const t of ['usuarios', 'produtos', 'pedidos', 'itens_pedido']) {
    assert.ok(tabelas.includes(t), `tabela ${t} não existe`);
  }
});

test('rota /saude confirma app e banco funcionando', async () => {
  const { status, dados } = await chamar('/saude');
  assert.equal(status, 200);
  assert.deepEqual(dados, { status: 'ok', banco: 'ok' });
});

test('login com senha correta devolve token', async () => {
  assert.ok(token);
});

test('login com senha errada é recusado', async () => {
  const { status, dados } = await chamar('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@estulanches.com', senha: 'errada' }),
  });
  assert.equal(status, 401);
  assert.equal(dados.erro, 'Usuário ou senha inválidos.');
});

test('senha não fica em texto puro no banco', async () => {
  const { rows } = await query("SELECT senha FROM usuarios WHERE email = 'admin@estulanches.com'");
  assert.notEqual(rows[0].senha, 'admin123');
  assert.match(rows[0].senha, /^\$2[aby]\$/);
});

test('rota protegida sem login é bloqueada', async () => {
  const resposta = await fetch(url + '/api/produtos');
  assert.equal(resposta.status, 401);
});

test('cadastra produto e ele aparece no cardápio', async () => {
  const { status, dados } = await chamar('/api/produtos', {
    method: 'POST',
    body: JSON.stringify({ nome: 'Pastel de teste', categoria: 'Salgado', preco: 7 }),
  });
  assert.equal(status, 201);
  produtosCriados.push(dados.id_produto);

  const lista = await chamar('/api/produtos');
  assert.ok(lista.dados.some((p) => p.nome === 'Pastel de teste'));
});

test('cria pedido com o total calculado pelo servidor', async () => {
  const { status, dados } = await chamar('/api/pedidos', {
    method: 'POST',
    body: JSON.stringify({
      cliente: 'Aluno Teste',
      itens: [{ id_produto: 1, quantidade: 2 }, { id_produto: 4, quantidade: 1 }],
    }),
  });
  assert.equal(status, 201);
  pedidosCriados.push(dados.id_pedido);
  assert.equal(dados.total, 18);
  assert.equal(dados.status, 'RECEBIDO');
});

test('não vende produto em falta', async () => {
  const { status, dados } = await chamar('/api/pedidos', {
    method: 'POST',
    body: JSON.stringify({ cliente: 'Aluno Teste', itens: [{ id_produto: 6, quantidade: 1 }] }),
  });
  assert.equal(status, 400);
  assert.equal(dados.erro, 'Produto indisponível.');
});

test('avança o status e o pedido aparece na fila', async () => {
  const criado = await chamar('/api/pedidos', {
    method: 'POST',
    body: JSON.stringify({ cliente: 'Aluno Fila', itens: [{ id_produto: 2, quantidade: 3 }] }),
  });
  pedidosCriados.push(criado.dados.id_pedido);

  const avancado = await chamar(`/api/pedidos/${criado.dados.id_pedido}/avancar`, { method: 'PATCH' });
  assert.equal(avancado.dados.status, 'PREPARANDO');

  const fila = await chamar('/api/pedidos');
  const pedido = fila.dados.find((p) => p.id_pedido === criado.dados.id_pedido);
  assert.equal(pedido.itens, '3x Pão de queijo');
});
