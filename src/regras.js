export const STATUS = ['RECEBIDO', 'PREPARANDO', 'PRONTO', 'ENTREGUE'];

export function calcularTotal(itens) {
  const total = itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
  return Math.round(total * 100) / 100;
}

export function validarProduto(nome, preco) {
  const erros = [];
  if (typeof nome !== 'string' || nome.trim().length < 3) {
    erros.push('O nome deve ter pelo menos 3 letras.');
  }
  if (preco === '' || preco === null || isNaN(Number(preco)) || Number(preco) <= 0) {
    erros.push('O preço deve ser maior que zero.');
  }
  return erros;
}

export function proximoStatus(status) {
  const i = STATUS.indexOf(status);
  if (i === -1 || i === STATUS.length - 1) {
    return null;
  }
  return STATUS[i + 1];
}

export function formatarMoeda(valor) {
  return 'R$ ' + Number(valor).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
