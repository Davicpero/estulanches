import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool, query } from './db.js';
import { calcularTotal, validarProduto, proximoStatus } from './regras.js';

const pasta = path.dirname(fileURLToPath(import.meta.url));
const TEMPO_SESSAO = 15 * 60 * 1000;
const sessoes = new Map();

export const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('Referrer-Policy', 'no-referrer');
  next();
});
app.use(express.static(path.join(pasta, '..', 'public')));

function exigirLogin(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const sessao = sessoes.get(token);

  if (!sessao) {
    return res.status(401).json({ erro: 'Faça login.' });
  }
  if (Date.now() - sessao.ultimoAcesso > TEMPO_SESSAO) {
    sessoes.delete(token);
    return res.status(401).json({ erro: 'Sessão expirada. Entre novamente.' });
  }
  sessao.ultimoAcesso = Date.now();
  req.usuario = sessao;
  next();
}

app.get('/saude', async (req, res) => {
  try {
    await query('SELECT 1');
    res.json({ status: 'ok', banco: 'ok' });
  } catch {
    res.status(503).json({ status: 'erro', banco: 'indisponivel' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ erro: 'Preencha e-mail e senha.' });
  }

  const { rows } = await query('SELECT * FROM usuarios WHERE email = $1', [email]);
  const usuario = rows[0];

  if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
    return res.status(401).json({ erro: 'Usuário ou senha inválidos.' });
  }

  const token = crypto.randomUUID();
  sessoes.set(token, { id: usuario.id_usuario, nome: usuario.nome, ultimoAcesso: Date.now() });
  res.json({ token, nome: usuario.nome });
});

app.post('/api/logout', exigirLogin, (req, res) => {
  sessoes.delete(req.headers.authorization.replace('Bearer ', ''));
  res.json({ ok: true });
});

app.get('/api/resumo', exigirLogin, async (req, res) => {
  const { rows } = await query(`
    SELECT
      (SELECT COUNT(*) FROM pedidos WHERE status <> 'ENTREGUE')::int AS abertos,
      (SELECT COUNT(*) FROM produtos WHERE disponivel)::int AS produtos,
      (SELECT COALESCE(SUM(total), 0) FROM pedidos WHERE criado_em::date = CURRENT_DATE) AS vendido_hoje
  `);
  res.json({ ...rows[0], usuario: req.usuario.nome });
});

app.get('/api/produtos', exigirLogin, async (req, res) => {
  const filtro = req.query.disponiveis === '1' ? 'WHERE disponivel' : '';
  const { rows } = await query(`SELECT * FROM produtos ${filtro} ORDER BY categoria, nome`);
  res.json(rows);
});

app.post('/api/produtos', exigirLogin, async (req, res) => {
  const { nome, categoria, preco } = req.body;
  const erros = validarProduto(nome, preco);
  if (erros.length) {
    return res.status(400).json({ erro: erros.join(' ') });
  }

  const { rows } = await query(
    'INSERT INTO produtos (nome, categoria, preco) VALUES ($1, $2, $3) RETURNING *',
    [nome.trim(), categoria, preco]
  );
  res.status(201).json(rows[0]);
});

app.patch('/api/produtos/:id/disponivel', exigirLogin, async (req, res) => {
  await query('UPDATE produtos SET disponivel = NOT disponivel WHERE id_produto = $1', [req.params.id]);
  res.json({ ok: true });
});

app.delete('/api/produtos/:id', exigirLogin, async (req, res) => {
  try {
    await query('DELETE FROM produtos WHERE id_produto = $1', [req.params.id]);
    res.json({ ok: true });
  } catch {
    res.status(409).json({ erro: 'Produto já foi vendido, não pode ser excluído. Deixe-o em falta.' });
  }
});

app.get('/api/pedidos', exigirLogin, async (req, res) => {
  const { rows } = await query(`
    SELECT p.*, u.nome AS atendente,
           STRING_AGG(i.quantidade || 'x ' || pr.nome, ', ' ORDER BY i.id_item) AS itens
      FROM pedidos p
      JOIN usuarios u      ON u.id_usuario  = p.id_usuario
      JOIN itens_pedido i  ON i.id_pedido   = p.id_pedido
      JOIN produtos pr     ON pr.id_produto = i.id_produto
     GROUP BY p.id_pedido, u.nome
     ORDER BY p.criado_em DESC, p.id_pedido DESC
  `);
  res.json(rows);
});

app.post('/api/pedidos', exigirLogin, async (req, res) => {
  const { cliente, itens = [] } = req.body;
  const escolhidos = itens.filter((i) => Number(i.quantidade) > 0);

  if (!cliente || !cliente.trim()) {
    return res.status(400).json({ erro: 'Informe o nome do cliente.' });
  }
  if (!escolhidos.length) {
    return res.status(400).json({ erro: 'Escolha pelo menos um produto.' });
  }

  const conexao = await pool.connect();
  try {
    const itensComPreco = [];
    for (const item of escolhidos) {
      const { rows } = await conexao.query(
        'SELECT preco FROM produtos WHERE id_produto = $1 AND disponivel', [item.id_produto]
      );
      if (!rows.length) {
        return res.status(400).json({ erro: 'Produto indisponível.' });
      }
      itensComPreco.push({ id_produto: item.id_produto, quantidade: Number(item.quantidade), preco: rows[0].preco });
    }

    await conexao.query('BEGIN');
    const { rows } = await conexao.query(
      'INSERT INTO pedidos (cliente, id_usuario, total) VALUES ($1, $2, $3) RETURNING id_pedido, total, status',
      [cliente.trim(), req.usuario.id, calcularTotal(itensComPreco)]
    );
    const pedido = rows[0];

    for (const item of itensComPreco) {
      await conexao.query(
        'INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario) VALUES ($1, $2, $3, $4)',
        [pedido.id_pedido, item.id_produto, item.quantidade, item.preco]
      );
    }
    await conexao.query('COMMIT');
    res.status(201).json(pedido);
  } catch (erro) {
    await conexao.query('ROLLBACK');
    throw erro;
  } finally {
    conexao.release();
  }
});

app.patch('/api/pedidos/:id/avancar', exigirLogin, async (req, res) => {
  const { rows } = await query('SELECT status FROM pedidos WHERE id_pedido = $1', [req.params.id]);
  if (!rows.length) {
    return res.status(404).json({ erro: 'Pedido não encontrado.' });
  }

  const novo = proximoStatus(rows[0].status);
  if (!novo) {
    return res.status(400).json({ erro: 'Pedido já foi entregue.' });
  }
  await query('UPDATE pedidos SET status = $1 WHERE id_pedido = $2', [novo, req.params.id]);
  res.json({ status: novo });
});

app.use((erro, req, res, next) => {
  console.error(erro.message);
  res.status(500).json({ erro: 'Erro interno no servidor.' });
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const porta = process.env.PORT || 3000;
  app.listen(porta, () => console.log(`EstuLanches rodando na porta ${porta}`));
}
