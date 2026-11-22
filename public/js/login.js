import { api, mostrarMensagem } from './api.js';

const msg = new URLSearchParams(location.search).get('msg');
if (msg) {
  mostrarMensagem(msg, true);
}

document.getElementById('form-login').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const form = evento.target;

  try {
    const dados = await api('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email: form.email.value, senha: form.senha.value }),
    });
    sessionStorage.setItem('token', dados.token);
    sessionStorage.setItem('nome', dados.nome);
    location.href = '/painel.html';
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
});
