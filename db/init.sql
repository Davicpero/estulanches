SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS estulanches CHARACTER SET utf8mb4;
USE estulanches;

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome       VARCHAR(100) NOT NULL,
    email      VARCHAR(100) NOT NULL UNIQUE,
    senha      VARCHAR(255) NOT NULL
);

CREATE TABLE produtos (
    id_produto INT AUTO_INCREMENT PRIMARY KEY,
    nome       VARCHAR(100) NOT NULL,
    categoria  VARCHAR(50)  NOT NULL,
    preco      DECIMAL(8,2) NOT NULL,
    disponivel TINYINT(1)   NOT NULL DEFAULT 1
);

CREATE TABLE pedidos (
    id_pedido  INT AUTO_INCREMENT PRIMARY KEY,
    cliente    VARCHAR(100) NOT NULL,
    id_usuario INT NOT NULL,
    status     ENUM('RECEBIDO','PREPARANDO','PRONTO','ENTREGUE') NOT NULL DEFAULT 'RECEBIDO',
    total      DECIMAL(8,2) NOT NULL,
    criado_em  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE itens_pedido (
    id_item        INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido      INT NOT NULL,
    id_produto     INT NOT NULL,
    quantidade     INT NOT NULL,
    preco_unitario DECIMAL(8,2) NOT NULL,
    FOREIGN KEY (id_pedido)  REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto)
);

INSERT INTO usuarios (nome, email, senha) VALUES
('Administrador', 'admin@estulanches.com',   '$2y$10$Sm9pCxPsE9X2XvtJl1Y6h./hJRSKsnVKaR.ngMK/Mwox4.lYTxdLe'),
('Dona Maria',    'cantina@estulanches.com', '$2y$10$0VrpCVu6L7WevuaGiENPTeBtkmK9uC4m1Q9y3x54a8pW8NGMvRWnu'),
('Caixa',         'caixa@estulanches.com',   '$2y$10$fi28ts9vcTa.da7aKza7te4ddyTWDmQIAR7BqM4WdtsouqHvccCs6');

INSERT INTO produtos (nome, categoria, preco, disponivel) VALUES
('Coxinha',            'Salgado', 6.50, 1),
('Pão de queijo',      'Salgado', 4.00, 1),
('X-Burguer',          'Lanche', 14.00, 1),
('Suco natural 300ml', 'Bebida',  5.00, 1),
('Refrigerante lata',  'Bebida',  6.00, 1),
('Bolo de cenoura',    'Doce',    5.50, 0);

INSERT INTO pedidos (cliente, id_usuario, status, total) VALUES
('Ana - 2º Info',    2, 'ENTREGUE',   11.50),
('Bruno - 3º ADM',   2, 'PREPARANDO', 20.00),
('Carla - 1º Mec',   3, 'RECEBIDO',    8.00);

INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario) VALUES
(1, 1, 1, 6.50),
(1, 4, 1, 5.00),
(2, 3, 1, 14.00),
(2, 5, 1, 6.00),
(3, 2, 2, 4.00);
