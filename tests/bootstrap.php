<?php
// Carrega o autoload do Composer (dentro do container) e o código do sistema
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require __DIR__ . '/../vendor/autoload.php';
}
require __DIR__ . '/../app/conexao.php';
require __DIR__ . '/../app/funcoes.php';
