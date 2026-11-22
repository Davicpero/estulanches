import { api, moeda, iniciarPagina, mostrarMensagem } from './api.js';

await iniciarPagina();

const PROXIMO = { RECEBIDO: 'PREPARANDO', PREPARANDO: 'PRONTO', PRONTO: 'ENTREGUE' };

async function carregarProdutos() {
  const produtos = await api('/api/produtos?disponiveis=1');
  const tabela = document.getElementById('produtos');
  tabela.innerHTML = '';

  for (const p of produtos) {
    const linha = tabela.insertRow();
    linha.insertCell().textContent = p.nome;
    linha.insertCell().textContent = moeda(p.preco);

    const campo = document.createElement('input');
    campo.type = 'number';
    campo.min = 0;
    campo.max = 20;
    campo.defaultValue = '0';
    campo.dataset.id = p.id_produto;
    linha.insertCell().append(campo);
  }
}

async function carregarFila() {
  const pedidos = await api('/api/pedidos');
  const fila = document.getElementById('fila');
  fila.innerHTML = '';

  for (const p of pedidos) {
    const linha = fila.insertRow();
    linha.insertCell().textContent = p.id_pedido;
    linha.insertCell().textContent = p.cliente;
    linha.insertCell().textContent = p.itens;
    linha.insertCell().textContent = moeda(p.total);
    linha.insertCell().textContent = p.status;
    linha.insertCell().textContent = new Date(p.criado_em).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

    const acao = linha.insertCell();
    if (PROXIMO[p.status]) {
      const botao = document.createElement('button');
      botao.textContent = '→ ' + PROXIMO[p.status];
      botao.onclick = async () => {
        await api(`/api/pedidos/${p.id_pedido}/avancar`, { method: 'PATCH' });
        mostrarMensagem('Status atualizado!');
        carregarFila();
      };
      acao.append(botao);
    }
  }
}

document.getElementById('form-pedido').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const form = evento.target;
  const itens = [...form.querySelectorAll('input[type=number]')].map((campo) => ({
    id_produto: Number(campo.dataset.id),
    quantidade: Number(campo.value),
  }));

  try {
    const pedido = await api('/api/pedidos', {
      method: 'POST',
      body: JSON.stringify({ cliente: form.cliente.value, itens }),
    });
    mostrarMensagem(`Pedido nº ${pedido.id_pedido} registrado! Total: ${moeda(pedido.total)}`);
    form.reset();
    carregarFila();
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
});

carregarProdutos();
carregarFila();
