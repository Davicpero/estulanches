<?php
require __DIR__ . '/../app/sessao.php';

$msg = '';
$erro = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $id = criar_pedido($pdo, $_POST['cliente'], $_SESSION['id_usuario'], $_POST['qtd'] ?? []);
        $msg = "Pedido nº $id registrado!";
    } catch (InvalidArgumentException $e) {
        $erro = $e->getMessage();
    }
}

if (isset($_GET['avancar'])) {
    avancar_pedido($pdo, (int) $_GET['avancar']);
    $msg = 'Status atualizado!';
}

$produtos = listar_produtos($pdo, true);
$pedidos  = listar_pedidos($pdo);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Pedidos - EstuLanches</title>
    <link rel="stylesheet" href="estilo.css">
</head>
<body>
<?php include __DIR__ . '/../app/menu.php'; ?>
<main>
    <h1>Pedidos</h1>
    <?php if ($msg): ?><p class="msg"><?= $msg ?></p><?php endif; ?>
    <?php if ($erro): ?><p class="erro"><?= $erro ?></p><?php endif; ?>

    <h2>Novo pedido</h2>
    <form method="post">
        <input name="cliente" placeholder="Nome do aluno / turma" required class="cliente">
        <div class="produtos">
            <?php foreach ($produtos as $p): ?>
            <label>
                <?= htmlspecialchars($p['nome']) ?> <small><?= formatar_moeda($p['preco']) ?></small>
                <input type="number" name="qtd[<?= $p['id_produto'] ?>]" min="0" max="20" value="0">
            </label>
            <?php endforeach; ?>
        </div>
        <button type="submit">Registrar pedido</button>
    </form>

    <h2>Fila de pedidos</h2>
    <table>
        <tr><th>Nº</th><th>Cliente</th><th>Itens</th><th>Total</th><th>Status</th><th>Hora</th><th></th></tr>
        <?php foreach ($pedidos as $p): ?>
        <tr>
            <td><?= $p['id_pedido'] ?></td>
            <td><?= htmlspecialchars($p['cliente']) ?></td>
            <td><?= htmlspecialchars($p['itens']) ?></td>
            <td><?= formatar_moeda($p['total']) ?></td>
            <td><span class="status <?= strtolower($p['status']) ?>"><?= $p['status'] ?></span></td>
            <td><?= date('d/m H:i', strtotime($p['criado_em'])) ?></td>
            <td>
                <?php if (proximo_status($p['status'])): ?>
                    <a href="?avancar=<?= $p['id_pedido'] ?>">→ <?= proximo_status($p['status']) ?></a>
                <?php endif; ?>
            </td>
        </tr>
        <?php endforeach; ?>
    </table>
</main>
</body>
</html>
