<?php
require_once __DIR__ . '/conexao.php';
require_once __DIR__ . '/funcoes.php';

session_set_cookie_params(['httponly' => true, 'samesite' => 'Strict']);
session_start();

if (!isset($_SESSION['id_usuario'])) {
    header('Location: login.php');
    exit;
}

if (time() - $_SESSION['ultimo_acesso'] > 900) {
    session_destroy();
    header('Location: login.php?expirou=1');
    exit;
}
$_SESSION['ultimo_acesso'] = time();

$pdo = conectar();
