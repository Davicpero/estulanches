<?php
require __DIR__ . '/../app/sessao.php';

$msg = '';
$erros = [];

// CADASTRAR
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $erros = validar_produto($_POST['nome'], $_POST['preco']);
    if (!$erros) {
        cadastrar_produto($pdo, $_POST['nome'], $_POST['categoria'], $_POST['preco']);
        $msg = 'Produto cadastrado!';
    }
}

// LIGAR/DESLIGAR disponibilidade
if (isset($_GET['alternar'])) {
    $pdo->prepare('UPDATE produtos SET disponivel = 1 - disponivel WHERE id_produto = ?')->execute([$_GET['alternar']]);
    $msg = 'Disponibilidade alterada!';
}

// EXCLUIR
if (isset($_GET['excluir'])) {
    try {
        $pdo->prepare('DELETE FROM produtos WHERE id_produto = ?')->execute([$_GET['excluir']]);
        $msg = 'Produto excluído!';
    } catch (PDOException $e) {
        $msg = 'Produto já foi vendido, não pode ser excluído. Deixe-o indisponível.';
    }
}

$produtos = listar_produtos($pdo);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Cardápio - EstuLanches</title>
    <link rel="stylesheet" href="estilo.css">
</head>
<body>
<?php include __DIR__ . '/../app/menu.php'; ?>
<main>
    <h1>Cardápio</h1>
    <?php if ($msg): ?><p class="msg"><?= $msg ?></p><?php endif; ?>
    <?php foreach ($erros as $e): ?><p class="erro"><?= $e ?></p><?php endforeach; ?>

    <h2>Novo produto</h2>
    <form method="post" class="form">
        <input name="nome" placeholder="Nome" required>
        <select name="categoria">
            <option>Salgado</option><option>Lanche</option><option>Bebida</option><option>Doce</option>
        </select>
        <input name="preco" type="number" step="0.01" min="0.01" placeholder="Preço" required>
        <button type="submit">Cadastrar</button>
    </form>

    <table>
        <tr><th>Produto</th><th>Categoria</th><th>Preço</th><th>Situação</th><th></th></tr>
        <?php foreach ($produtos as $p): ?>
        <tr>
            <td><?= htmlspecialchars($p['nome']) ?></td>
            <td><?= htmlspecialchars($p['categoria']) ?></td>
            <td><?= formatar_moeda($p['preco']) ?></td>
            <td><?= $p['disponivel'] ? '✅ Disponível' : '⛔ Em falta' ?></td>
            <td>
                <a href="?alternar=<?= $p['id_produto'] ?>">Alterar situação</a> |
                <a href="?excluir=<?= $p['id_produto'] ?>" onclick="return confirm('Excluir?')">Excluir</a>
            </td>
        </tr>
        <?php endforeach; ?>
    </table>
</main>
</body>
</html>
