import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularTotal, validarProduto, proximoStatus, formatarMoeda } from '../../src/regras.js';

test('calcula o total do pedido', () => {
  const itens = [
    { preco: 6.5, quantidade: 2 },
    { preco: 5, quantidade: 1 },
  ];
  assert.equal(calcularTotal(itens), 18);
});

test('total de pedido vazio é zero', () => {
  assert.equal(calcularTotal([]), 0);
});

test('total arredonda os centavos', () => {
  assert.equal(calcularTotal([{ preco: 0.1, quantidade: 3 }]), 0.3);
});

test('produto válido não tem erros', () => {
  assert.deepEqual(validarProduto('Coxinha', 6.5), []);
});

test('produto com preço zero é inválido', () => {
  assert.ok(validarProduto('Coxinha', 0).includes('O preço deve ser maior que zero.'));
});

test('produto com nome curto é inválido', () => {
  assert.equal(validarProduto('X', 5).length, 1);
});

test('produto com preço em texto é inválido', () => {
  assert.notEqual(validarProduto('Coxinha', 'abc').length, 0);
});

test('status do pedido segue a ordem certa', () => {
  assert.equal(proximoStatus('RECEBIDO'), 'PREPARANDO');
  assert.equal(proximoStatus('PREPARANDO'), 'PRONTO');
  assert.equal(proximoStatus('PRONTO'), 'ENTREGUE');
});

test('pedido entregue não avança', () => {
  assert.equal(proximoStatus('ENTREGUE'), null);
});

test('formata valor em reais', () => {
  assert.equal(formatarMoeda(1234.5), 'R$ 1.234,50');
});
