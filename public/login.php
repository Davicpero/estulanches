<?php
require_once __DIR__ . '/../app/conexao.php';
require_once __DIR__ . '/../app/funcoes.php';
session_set_cookie_params(['httponly' => true, 'samesite' => 'Strict']);
session_start();

$erro = isset($_GET['expirou']) ? 'Sessão expirada. Entre novamente.' : '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $senha = $_POST['senha'] ?? '';

    if ($email === '' || $senha === '') {
        $erro = 'Preencha e-mail e senha.';
    } else {
        $usuario = autenticar(conectar(), $email, $senha);
        if ($usuario) {
            session_regenerate_id(true);
            $_SESSION['id_usuario']    = $usuario['id_usuario'];
            $_SESSION['nome']          = $usuario['nome'];
            $_SESSION['ultimo_acesso'] = time();
            header('Location: painel.php');
            exit;
        }
        $erro = 'Usuário ou senha inválidos.';
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Login - EstuLanches</title>
    <link rel="stylesheet" href="estilo.css">
</head>
<body>
<div class="login">
    <h1>🥪 EstuLanches</h1>
    <p>Cantina escolar</p>
    <?php if ($erro): ?><p class="erro"><?= $erro ?></p><?php endif; ?>
    <form method="post">
        <label>E-mail</label>
        <input type="email" name="email">
        <label>Senha</label>
        <input type="password" name="senha">
        <button type="submit">Entrar</button>
    </form>
</div>
</body>
</html>
