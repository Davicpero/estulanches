<?php
use PHPUnit\Framework\TestCase;

class BancoTest extends TestCase
{
    private PDO $pdo;
    private array $pedidos_criados = [];
    private array $produtos_criados = [];

    protected function setUp(): void
    {
        $this->pdo = conectar();
    }

    protected function tearDown(): void
    {
        foreach ($this->pedidos_criados as $id) {
            $this->pdo->prepare('DELETE FROM pedidos WHERE id_pedido = ?')->execute([$id]);
        }
        foreach ($this->produtos_criados as $id) {
            $this->pdo->prepare('DELETE FROM produtos WHERE id_produto = ?')->execute([$id]);
        }
    }

    public function test_conecta_no_banco_e_tabelas_existem(): void
    {
        $tabelas = $this->pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);
        foreach (['usuarios', 'produtos', 'pedidos', 'itens_pedido'] as $t) {
            $this->assertContains($t, $tabelas);
        }
    }

    public function test_login_com_senha_correta(): void
    {
        $usuario = autenticar($this->pdo, 'admin@estulanches.com', 'admin123');
        $this->assertSame('Administrador', $usuario['nome']);
    }

    public function test_login_com_senha_errada_falha(): void
    {
        $this->assertNull(autenticar($this->pdo, 'admin@estulanches.com', 'senhaErrada'));
    }

    public function test_senha_nao_fica_em_texto_puro_no_banco(): void
    {
        $senha = $this->pdo->query("SELECT senha FROM usuarios WHERE email = 'admin@estulanches.com'")->fetchColumn();
        $this->assertNotSame('admin123', $senha);
        $this->assertStringStartsWith('$2y$', $senha);
    }

    public function test_cadastra_produto_e_ele_aparece_no_cardapio(): void
    {
        $id = cadastrar_produto($this->pdo, 'Pastel de teste', 'Salgado', 7.00);
        $this->produtos_criados[] = $id;

        $nomes = array_column(listar_produtos($this->pdo), 'nome');
        $this->assertContains('Pastel de teste', $nomes);
    }

    public function test_cria_pedido_com_total_calculado_pelo_banco(): void
    {
        $id = criar_pedido($this->pdo, 'Aluno Teste', 1, [1 => 2, 4 => 1]);
        $this->pedidos_criados[] = $id;

        $pedido = $this->pdo->query("SELECT * FROM pedidos WHERE id_pedido = $id")->fetch();
        $this->assertEquals(18.00, $pedido['total']);
        $this->assertSame('RECEBIDO', $pedido['status']);

        $itens = $this->pdo->query("SELECT COUNT(*) FROM itens_pedido WHERE id_pedido = $id")->fetchColumn();
        $this->assertEquals(2, $itens);
    }

    public function test_nao_vende_produto_indisponivel(): void
    {
        $this->expectException(InvalidArgumentException::class);
        criar_pedido($this->pdo, 'Aluno Teste', 1, [6 => 1]);
    }

    public function test_pedido_sem_itens_e_recusado(): void
    {
        $this->expectException(InvalidArgumentException::class);
        criar_pedido($this->pdo, 'Aluno Teste', 1, [1 => 0]);
    }

    public function test_avanca_status_do_pedido(): void
    {
        $id = criar_pedido($this->pdo, 'Aluno Teste', 1, [2 => 1]);
        $this->pedidos_criados[] = $id;

        avancar_pedido($this->pdo, $id);
        $status = $this->pdo->query("SELECT status FROM pedidos WHERE id_pedido = $id")->fetchColumn();
        $this->assertSame('PREPARANDO', $status);
    }

    public function test_pedido_aparece_na_fila_com_itens(): void
    {
        $id = criar_pedido($this->pdo, 'Aluno Fila', 1, [2 => 3]);
        $this->pedidos_criados[] = $id;

        $pedido = array_values(array_filter(listar_pedidos($this->pdo), fn($p) => $p['id_pedido'] == $id))[0];
        $this->assertSame('3x Pão de queijo', $pedido['itens']);
    }
}
