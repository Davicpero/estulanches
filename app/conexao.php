<?php
// Conexão com o banco.
// Os dados vêm de VARIÁVEIS DE AMBIENTE (definidas no docker-compose.yml),
// assim nenhuma senha fica escrita no código.
function conectar(): PDO
{
    $host  = getenv('DB_HOST') ?: 'localhost';
    $banco = getenv('DB_NAME') ?: 'estulanches';
    $user  = getenv('DB_USER') ?: 'root';
    $senha = getenv('DB_PASS') ?: '';

    $pdo = new PDO("mysql:host=$host;dbname=$banco;charset=utf8mb4", $user, $senha);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    return $pdo;
}
