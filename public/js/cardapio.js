import { api, moeda, iniciarPagina, mostrarMensagem } from './api.js';

await iniciarPagina();

async function carregar() {
  const produtos = await api('/api/produtos');
  const lista = document.getElementById('lista');
  lista.innerHTML = '';

  for (const p of produtos) {
    const linha = lista.insertRow();
    linha.insertCell().textContent = p.nome;
    linha.insertCell().textContent = p.categoria;
    linha.insertCell().textContent = moeda(p.preco);
    linha.insertCell().textContent = p.disponivel ? '✅ Disponível' : '⛔ Em falta';

    const acoes = linha.insertCell();

    const alternar = document.createElement('button');
    alternar.textContent = p.disponivel ? 'Marcar em falta' : 'Marcar disponível';
    alternar.onclick = async () => {
      await api(`/api/produtos/${p.id_produto}/disponivel`, { method: 'PATCH' });
      mostrarMensagem('Situação alterada!');
      carregar();
    };

    const excluir = document.createElement('button');
    excluir.textContent = 'Excluir';
    excluir.onclick = async () => {
      if (!confirm('Excluir este produto?')) return;
      try {
        await api(`/api/produtos/${p.id_produto}`, { method: 'DELETE' });
        mostrarMensagem('Produto excluído!');
        carregar();
      } catch (erro) {
        mostrarMensagem(erro.message, true);
      }
    };

    acoes.append(alternar, ' ', excluir);
  }
}

document.getElementById('form-produto').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const form = evento.target;

  try {
    await api('/api/produtos', {
      method: 'POST',
      body: JSON.stringify({ nome: form.nome.value, categoria: form.categoria.value, preco: form.preco.value }),
    });
    mostrarMensagem('Produto cadastrado!');
    form.reset();
    carregar();
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
});

carregar();
