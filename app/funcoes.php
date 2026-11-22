<?php
const STATUS_PEDIDO = ['RECEBIDO', 'PREPARANDO', 'PRONTO', 'ENTREGUE'];

function calcular_total(array $itens): float
{
    $total = 0;
    foreach ($itens as $item) {
        $total += $item['preco'] * $item['quantidade'];
    }
    return round($total, 2);
}

function validar_produto(string $nome, $preco): array
{
    $erros = [];
    if (strlen(trim($nome)) < 3) {
        $erros[] = 'O nome deve ter pelo menos 3 letras.';
    }
    if (!is_numeric($preco) || $preco <= 0) {
        $erros[] = 'O preço deve ser maior que zero.';
    }
    return $erros;
}

function proximo_status(string $status): ?string
{
    $i = array_search($status, STATUS_PEDIDO);
    if ($i === false || $i === count(STATUS_PEDIDO) - 1) {
        return null;
    }
    return STATUS_PEDIDO[$i + 1];
}

function formatar_moeda($valor): string
{
    return 'R$ ' . number_format((float) $valor, 2, ',', '.');
}

function autenticar(PDO $pdo, string $email, string $senha): ?array
{
    $sql = $pdo->prepare('SELECT * FROM usuarios WHERE email = ?');
    $sql->execute([$email]);
    $usuario = $sql->fetch();

    if ($usuario && password_verify($senha, $usuario['senha'])) {
        return $usuario;
    }
    return null;
}

function listar_produtos(PDO $pdo, bool $so_disponiveis = false): array
{
    $sql = 'SELECT * FROM produtos';
    if ($so_disponiveis) {
        $sql .= ' WHERE disponivel = 1';
    }
    return $pdo->query($sql . ' ORDER BY categoria, nome')->fetchAll();
}

function cadastrar_produto(PDO $pdo, string $nome, string $categoria, $preco): int
{
    $sql = $pdo->prepare('INSERT INTO produtos (nome, categoria, preco) VALUES (?, ?, ?)');
    $sql->execute([trim($nome), $categoria, $preco]);
    return (int) $pdo->lastInsertId();
}

function criar_pedido(PDO $pdo, string $cliente, int $id_usuario, array $quantidades): int
{
    $itens = [];
    foreach ($quantidades as $id_produto => $qtd) {
        $qtd = (int) $qtd;
        if ($qtd <= 0) {
            continue;
        }
        $sql = $pdo->prepare('SELECT preco FROM produtos WHERE id_produto = ? AND disponivel = 1');
        $sql->execute([$id_produto]);
        $produto = $sql->fetch();
        if (!$produto) {
            throw new InvalidArgumentException('Produto indisponível.');
        }
        $itens[] = ['id_produto' => $id_produto, 'quantidade' => $qtd, 'preco' => $produto['preco']];
    }

    if (trim($cliente) === '') {
        throw new InvalidArgumentException('Informe o nome do cliente.');
    }
    if (!$itens) {
        throw new InvalidArgumentException('Escolha pelo menos um produto.');
    }

    $pdo->beginTransaction();
    try {
        $sql = $pdo->prepare('INSERT INTO pedidos (cliente, id_usuario, total) VALUES (?, ?, ?)');
        $sql->execute([trim($cliente), $id_usuario, calcular_total($itens)]);
        $id_pedido = (int) $pdo->lastInsertId();

        $sql = $pdo->prepare('INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario) VALUES (?, ?, ?, ?)');
        foreach ($itens as $item) {
            $sql->execute([$id_pedido, $item['id_produto'], $item['quantidade'], $item['preco']]);
        }
        $pdo->commit();
        return $id_pedido;
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
}

function avancar_pedido(PDO $pdo, int $id_pedido): void
{
    $sql = $pdo->prepare('SELECT status FROM pedidos WHERE id_pedido = ?');
    $sql->execute([$id_pedido]);
    $atual = $sql->fetchColumn();

    $novo = $atual ? proximo_status($atual) : null;
    if ($novo) {
        $pdo->prepare('UPDATE pedidos SET status = ? WHERE id_pedido = ?')->execute([$novo, $id_pedido]);
    }
}

function listar_pedidos(PDO $pdo): array
{
    return $pdo->query(
        "SELECT p.*, u.nome AS atendente,
                GROUP_CONCAT(CONCAT(i.quantidade, 'x ', pr.nome) SEPARATOR ', ') AS itens
           FROM pedidos p
           JOIN usuarios u      ON u.id_usuario = p.id_usuario
           JOIN itens_pedido i  ON i.id_pedido  = p.id_pedido
           JOIN produtos pr     ON pr.id_produto = i.id_produto
          GROUP BY p.id_pedido
          ORDER BY p.criado_em DESC, p.id_pedido DESC"
    )->fetchAll();
}
