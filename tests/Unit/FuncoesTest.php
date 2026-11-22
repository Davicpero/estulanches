<?php
use PHPUnit\Framework\TestCase;

class FuncoesTest extends TestCase
{
    public function test_calcula_total_do_pedido(): void
    {
        $itens = [
            ['preco' => 6.50, 'quantidade' => 2],
            ['preco' => 5.00, 'quantidade' => 1],
        ];
        $this->assertSame(18.0, calcular_total($itens));
    }

    public function test_total_de_pedido_vazio_e_zero(): void
    {
        $this->assertSame(0.0, calcular_total([]));
    }

    public function test_total_arredonda_centavos(): void
    {
        $this->assertSame(0.3, calcular_total([['preco' => 0.1, 'quantidade' => 3]]));
    }

    public function test_produto_valido_nao_tem_erros(): void
    {
        $this->assertSame([], validar_produto('Coxinha', 6.50));
    }

    public function test_produto_com_preco_zero_e_invalido(): void
    {
        $this->assertContains('O preço deve ser maior que zero.', validar_produto('Coxinha', 0));
    }

    public function test_produto_com_nome_curto_e_invalido(): void
    {
        $this->assertCount(1, validar_produto('X', 5));
    }

    public function test_produto_com_preco_texto_e_invalido(): void
    {
        $this->assertNotEmpty(validar_produto('Coxinha', 'abc'));
    }

    public function test_fluxo_de_status_do_pedido(): void
    {
        $this->assertSame('PREPARANDO', proximo_status('RECEBIDO'));
        $this->assertSame('PRONTO', proximo_status('PREPARANDO'));
        $this->assertSame('ENTREGUE', proximo_status('PRONTO'));
    }

    public function test_pedido_entregue_nao_avanca(): void
    {
        $this->assertNull(proximo_status('ENTREGUE'));
    }

    public function test_formata_moeda_em_real(): void
    {
        $this->assertSame('R$ 1.234,50', formatar_moeda(1234.5));
    }
}
