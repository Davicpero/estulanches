<?php
header('Content-Type: application/json');
try {
    require_once __DIR__ . '/../app/conexao.php';
    conectar()->query('SELECT 1');
    echo json_encode(['status' => 'ok', 'banco' => 'ok']);
} catch (Exception $e) {
    http_response_code(503);
    echo json_encode(['status' => 'erro', 'banco' => 'indisponivel']);
}
