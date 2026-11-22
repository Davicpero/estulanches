<?php
require __DIR__ . '/../app/sessao.php';

$abertos  = $pdo->query("SELECT COUNT(*) FROM pedidos WHERE status <> 'ENTREGUE'")->fetchColumn();
$produtos = $pdo->query("SELECT COUNT(*) FROM produtos WHERE disponivel = 1")->fetchColumn();
$hoje     = $pdo->query("SELECT COALESCE(SUM(total), 0) FROM pedidos WHERE DATE(criado_em) = CURDATE()")->fetchColumn();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Painel - EstuLanches</title>
    <link rel="stylesheet" href="estilo.css">
</head>
<body>
<?php include __DIR__ . '/../app/menu.php'; ?>
<main>
    <h1>Olá, <?= htmlspecialchars($_SESSION['nome']) ?>!</h1>

    <div class="cards">
        <a href="pedidos.php"><span><?= $abertos ?></span>Pedidos em aberto</a>
        <a href="cardapio.php"><span><?= $produtos ?></span>Produtos no cardápio</a>
        <a href="pedidos.php"><span><?= formatar_moeda($hoje) ?></span>Vendido hoje</a>
    </div>
</main>
</body>
</html>
