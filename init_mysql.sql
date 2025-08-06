-- Script de inicialização do banco de dados para MySQL

-- Desativar verificações de chave estrangeira temporariamente
SET FOREIGN_KEY_CHECKS = 0;

-- Dropar tabelas existentes se elas existirem (para garantir um estado limpo)
DROP TABLE IF EXISTS auditoria;
DROP TABLE IF EXISTS profissionais;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS equipamentos;
DROP TABLE IF EXISTS cidades;

-- Criar tabela cidades
CREATE TABLE cidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'ativo',
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela equipamentos
CREATE TABLE equipamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE,
    descricao TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'ativo',
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    nivel_acesso INT NOT NULL DEFAULT 1,
    cidade_id INT,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cidade_id) REFERENCES cidades(id) ON DELETE SET NULL
);

-- Criar tabela profissionais
CREATE TABLE profissionais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_completo VARCHAR(255) NOT NULL,
    data_nascimento DATE,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    rg VARCHAR(20) NOT NULL,
    data_expedicao_rg DATE,
    escolaridade VARCHAR(100),
    profissao VARCHAR(100),
    cargo VARCHAR(100),
    vinculo_institucional VARCHAR(100),
    telefone VARCHAR(20),
    email VARCHAR(255),
    data_inicio_trabalho DATE,
    endereco_residencial TEXT,
    cidade_id INT,
    equipamento_id INT,
    ativo TINYINT(1) DEFAULT 1,
    motivo_inativacao TEXT,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cidade_id) REFERENCES cidades(id) ON DELETE SET NULL,
    FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE SET NULL
);

-- Criar tabela auditoria
CREATE TABLE auditoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    acao VARCHAR(50) NOT NULL,
    tabela VARCHAR(100) NOT NULL,
    registro_id INT,
    dados_antigos JSON,
    dados_novos JSON,
    ip_origem VARCHAR(45),
    data_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Inserir cidades de exemplo
INSERT INTO cidades (nome, status, data_cadastro) VALUES 
("São Paulo", "ativo", NOW()),
("Rio de Janeiro", "ativo", NOW()),
("Belo Horizonte", "ativo", NOW()),
("Salvador", "ativo", NOW()),
("Brasília", "ativo", NOW());

-- Inserir equipamentos de exemplo
INSERT INTO equipamentos (nome, descricao, status, data_cadastro) VALUES 
("CRAS Centro", "Centro de Referência de Assistência Social - Região Central", "ativo", NOW()),
("CRAS Norte", "Centro de Referência de Assistência Social - Região Norte", "ativo", NOW()),
("CREAS", "Centro de Referência Especializado de Assistência Social", "ativo", NOW()),
("CAPS", "Centro de Atenção Psicossocial", "ativo", NOW()),
("UBS Central", "Unidade Básica de Saúde Central", "ativo", NOW());

-- Inserir usuário administrador padrão
-- Senha: admin123 (hash bcrypt)
INSERT INTO usuarios (nome_completo, email, senha_hash, nivel_acesso, cidade_id, data_cadastro) VALUES 
("Administrador do Sistema", "admin@sistema.com", "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5u", 4, NULL, NOW()),
("Gestor São Paulo", "gestor.sp@sistema.com", "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5u", 3, 1, NOW()),
("Editor Rio de Janeiro", "editor.rj@sistema.com", "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5u", 2, 2, NOW());

-- Reativar verificações de chave estrangeira
SET FOREIGN_KEY_CHECKS = 1;


