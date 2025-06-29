-- Garante que usaremos o UUID como gerador de IDs únicos
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela para guardar as diferentes empresas que usarão o sistema
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de usuários, cada um pertencendo a uma empresa
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela principal de clientes, cada um também pertencendo a uma empresa
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id),
    name VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    rg VARCHAR(20),
    cnpj VARCHAR(18),
    birth_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para os múltiplos contatos de cada cliente
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- Ex: 'Celular', 'Email', 'Residencial'
    value VARCHAR(255) NOT NULL, -- Ex: '99999-9999' ou 'cliente@email.com'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inserindo uma empresa e um usuário de exemplo para testes
INSERT INTO companies (name) VALUES ('Minha Empresa Teste');

-- ATENÇÃO: A senha '123456' é apenas para exemplo. Em produção,
-- o hash seria gerado pelo backend.
-- Supondo que o ID da 'Minha Empresa Teste' seja o primeiro gerado.
INSERT INTO users (company_id, email, password_hash) VALUES (
    (SELECT id FROM companies WHERE name = 'Minha Empresa Teste' LIMIT 1),
    'teste@email.com',
    'senha_hash_exemplo' -- Em um sistema real, isso seria um hash tipo bcrypt
);