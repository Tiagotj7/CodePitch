-- Criação do banco de dados CodePitch
CREATE DATABASE IF NOT EXISTS codepitch;
USE codepitch;

-- Tabela de usuários
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    foto_perfil VARCHAR(255),
    biografia TEXT,
    contato VARCHAR(50),
    ultimo_acesso DATETIME
);

-- Tabela de categorias de projetos
CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    descricao TEXT
);

-- Tabela de projetos
CREATE TABLE projetos (
    id_projeto INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data_publicacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('disponivel', 'vendido', 'pausado') DEFAULT 'disponivel',
    id_categoria INT,
    visualizacoes INT DEFAULT 0,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria)
);

-- Tabela de imagens de projetos
CREATE TABLE imagens_projeto (
    id_imagem INT AUTO_INCREMENT PRIMARY KEY,
    id_projeto INT NOT NULL,
    url VARCHAR(255) NOT NULL,
    ordem INT DEFAULT 0,
    FOREIGN KEY (id_projeto) REFERENCES projetos(id_projeto) ON DELETE CASCADE
);

-- Tabela de favoritos
CREATE TABLE favoritos (
    id_usuario INT NOT NULL,
    id_projeto INT NOT NULL,
    data_favoritado DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_usuario, id_projeto),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_projeto) REFERENCES projetos(id_projeto) ON DELETE CASCADE
);

-- Tabela de mensagens entre usuários
CREATE TABLE mensagens (
    id_mensagem INT AUTO_INCREMENT PRIMARY KEY,
    id_remetente INT NOT NULL,
    id_destinatario INT NOT NULL,
    id_projeto INT,
    conteudo TEXT NOT NULL,
    data_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
    lida BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_remetente) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_destinatario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_projeto) REFERENCES projetos(id_projeto) ON DELETE SET NULL
);

-- Tabela de vendas/transações
CREATE TABLE vendas (
    id_venda INT AUTO_INCREMENT PRIMARY KEY,
    id_projeto INT NOT NULL,
    id_vendedor INT NOT NULL,
    id_comprador INT NOT NULL,
    valor_venda DECIMAL(10,2) NOT NULL,
    data_venda DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pendente', 'concluida', 'cancelada') DEFAULT 'pendente',
    FOREIGN KEY (id_projeto) REFERENCES projetos(id_projeto) ON DELETE CASCADE,
    FOREIGN KEY (id_vendedor) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_comprador) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- Tabela de avaliações
CREATE TABLE avaliacoes (
    id_avaliacao INT AUTO_INCREMENT PRIMARY KEY,
    id_venda INT NOT NULL,
    id_avaliador INT NOT NULL,
    id_avaliado INT NOT NULL,
    nota INT NOT NULL CHECK (nota BETWEEN 1 AND 5),
    comentario TEXT,
    data_avaliacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_venda) REFERENCES vendas(id_venda) ON DELETE CASCADE,
    FOREIGN KEY (id_avaliador) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_avaliado) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- Tabela de tags
CREATE TABLE tags (
    id_tag INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
);

-- Tabela de relacionamento entre projetos e tags
CREATE TABLE projeto_tag (
    id_projeto INT NOT NULL,
    id_tag INT NOT NULL,
    PRIMARY KEY (id_projeto, id_tag),
    FOREIGN KEY (id_projeto) REFERENCES projetos(id_projeto) ON DELETE CASCADE,
    FOREIGN KEY (id_tag) REFERENCES tags(id_tag) ON DELETE CASCADE
);

-- Inserindo algumas categorias iniciais
INSERT INTO categorias (nome, descricao) VALUES
('Web Development', 'Projetos relacionados a desenvolvimento web, sites e aplicações web'),
('Mobile Apps', 'Aplicativos para dispositivos móveis iOS e Android'),
('E-commerce', 'Plataformas e soluções de comércio eletrônico'),
('API/Microserviços', 'APIs, microserviços e integrações'),
('Jogos', 'Jogos e aplicações interativas'),
('Desktop', 'Aplicações para computadores desktop'),
('AI/Machine Learning', 'Projetos envolvendo inteligência artificial e aprendizado de máquina'),
('Outros', 'Outros tipos de projetos');

-- Índices para otimização de consultas
CREATE INDEX idx_projeto_usuario ON projetos(id_usuario);
CREATE INDEX idx_projeto_categoria ON projetos(id_categoria);
CREATE INDEX idx_projeto_status ON projetos(status);
CREATE INDEX idx_vendas_comprador ON vendas(id_comprador);
CREATE INDEX idx_vendas_vendedor ON vendas(id_vendedor);
CREATE INDEX idx_mensagens_destinatario ON mensagens(id_destinatario);