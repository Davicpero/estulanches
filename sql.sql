CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nome       VARCHAR(100) NOT NULL,
    email      VARCHAR(100) NOT NULL UNIQUE,
    senha      VARCHAR(255) NOT NULL
);

CREATE TABLE produtos (
    id_produto SERIAL PRIMARY KEY,
    nome       VARCHAR(100) NOT NULL,
    categoria  VARCHAR(50)  NOT NULL,
    preco      NUMERIC(8,2) NOT NULL CHECK (preco > 0),
    disponivel BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE pedidos (
    id_pedido  SERIAL PRIMARY KEY,
    cliente    VARCHAR(100) NOT NULL,
    id_usuario INT NOT NULL REFERENCES usuarios(id_usuario),
    status     VARCHAR(20)  NOT NULL DEFAULT 'RECEBIDO'
               CHECK (status IN ('RECEBIDO', 'PREPARANDO', 'PRONTO', 'ENTREGUE')),
    total      NUMERIC(8,2) NOT NULL,
    criado_em  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE itens_pedido (
    id_item        SERIAL PRIMARY KEY,
    id_pedido      INT NOT NULL REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    id_produto     INT NOT NULL REFERENCES produtos(id_produto),
    quantidade     INT NOT NULL CHECK (quantidade > 0),
    preco_unitario NUMERIC(8,2) NOT NULL
);

INSERT INTO usuarios (nome, email, senha) VALUES
('Administrador', 'admin@estulanches.com',   '$2a$10$W1Zw4anv5vv6p9vNLd4heuiNmg43oyCoa9EXGUIhfU7a7zdb1Iv9q'),
('Dona Maria',    'cantina@estulanches.com', '$2a$10$dZvzIHl9lG4fmKUnxI3ykeJu3P570mlpvXxD6tA11BMicooGnfzxK'),
('Caixa',         'caixa@estulanches.com',   '$2a$10$VpLDFW9724ZVxQHp7qsm4ecq33vkLCXJEuMV8bcRIFB1h8LE0N/BG');

INSERT INTO produtos (nome, categoria, preco, disponivel) VALUES
('Coxinha',            'Salgado',  6.50, TRUE),
('Pão de queijo',      'Salgado',  4.00, TRUE),
('X-Burguer',          'Lanche',  14.00, TRUE),
('Suco natural 300ml', 'Bebida',   5.00, TRUE),
('Refrigerante lata',  'Bebida',   6.00, TRUE),
('Bolo de cenoura',    'Doce',     5.50, FALSE);

INSERT INTO pedidos (cliente, id_usuario, status, total) VALUES
('Ana - 2º Info',  2, 'ENTREGUE',   11.50),
('Bruno - 3º ADM', 2, 'PREPARANDO', 20.00),
('Carla - 1º Mec', 3, 'RECEBIDO',    8.00);

INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario) VALUES
(1, 1, 1, 6.50),
(1, 4, 1, 5.00),
(2, 3, 1, 14.00),
(2, 5, 1, 6.00),
(3, 2, 2, 4.00);
