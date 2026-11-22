export async function api(url, opcoes = {}) {
  const resposta = await fetch(url, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + sessionStorage.getItem('token'),
    },
  });
  const dados = await resposta.json();

  if (resposta.status === 401 && url !== '/api/login') {
    sessionStorage.clear();
    location.replace('/?msg=' + encodeURIComponent(dados.erro));
    return new Promise(() => {});
  }
  if (!resposta.ok) {
    throw new Error(dados.erro);
  }
  return dados;
}

export function moeda(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function iniciarPagina() {
  if (!sessionStorage.getItem('token')) {
    location.replace('/?msg=' + encodeURIComponent('Faça login.'));
    return new Promise(() => {});
  }
  document.getElementById('usuario').textContent = sessionStorage.getItem('nome');
  document.getElementById('sair').addEventListener('click', async () => {
    await api('/api/logout', { method: 'POST' });
    sessionStorage.clear();
    location.href = '/';
  });
  return Promise.resolve();
}

export function mostrarMensagem(texto, erro = false) {
  const elemento = document.getElementById('mensagem');
  elemento.textContent = texto;
  elemento.style.color = erro ? 'red' : 'green';
}
