import { api, moeda, iniciarPagina } from './api.js';

await iniciarPagina();

const resumo = await api('/api/resumo');
document.getElementById('nome').textContent = resumo.usuario;
document.getElementById('abertos').textContent = resumo.abertos;
document.getElementById('produtos').textContent = resumo.produtos;
document.getElementById('vendido').textContent = moeda(resumo.vendido_hoje);
