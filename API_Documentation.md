# Documentação da API - Sistema de Gerenciamento de Profissionais

## Visão Geral

Esta API REST foi desenvolvida em Flask para gerenciar profissionais de equipamentos públicos como CRAS, CREAS, CAPS, etc. O sistema oferece funcionalidades completas de CRUD, sistema de autenticação com JWT, controle de acesso por níveis, auditoria completa e geração de relatórios.

### Informações Técnicas

- **Framework**: Flask 2.3.3
- **Banco de Dados**: SQLite (desenvolvimento) / PostgreSQL (produção)
- **Autenticação**: JWT (JSON Web Tokens)
- **Documentação**: OpenAPI 3.0
- **Porta**: 5000 (desenvolvimento)
- **Base URL**: `http://localhost:5000/api`

### Níveis de Acesso

1. **Visualização (1)**: Apenas leitura de dados
2. **Editor (2)**: CRUD de profissionais + visualização
3. **Admin Cidade (3)**: Gestão completa da cidade + usuários + relatórios
4. **Admin Global (4)**: Acesso total ao sistema

## Autenticação

### POST /auth/login

Realiza login no sistema e retorna token JWT.

**Request Body:**
```json
{
  "email": "admin@sistema.com",
  "senha": "admin123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "usuario": {
    "id": 1,
    "nome_completo": "Administrador do Sistema",
    "email": "admin@sistema.com",
    "nivel_acesso": 4,
    "cidade_id": null
  }
}
```

**Response (401):**
```json
{
  "error": "Credenciais inválidas"
}
```

### GET /auth/me

Retorna informações do usuário autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": 1,
  "nome_completo": "Administrador do Sistema",
  "email": "admin@sistema.com",
  "nivel_acesso": 4,
  "cidade_id": null
}
```

### POST /auth/refresh

Renova o token JWT.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```



## Profissionais

### GET /profissionais

Lista profissionais com filtros opcionais.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (string): "ativo", "inativo", "todos" (default: "ativo")
- `cidade_id` (integer): Filtrar por cidade
- `equipamento_id` (integer): Filtrar por equipamento
- `profissao` (string): Filtrar por profissão
- `cargo` (string): Filtrar por cargo
- `page` (integer): Página (default: 1)
- `per_page` (integer): Itens por página (default: 10)

**Response (200):**
```json
{
  "profissionais": [
    {
      "id": 1,
      "nome_completo": "João Silva Santos",
      "cpf": "123.456.789-00",
      "rg": "12.345.678-9",
      "data_nascimento": "1985-03-15",
      "data_expedicao_rg": "2010-05-20",
      "escolaridade": "Ensino Superior Completo",
      "profissao": "Assistente Social",
      "cargo": "Coordenador",
      "vinculo_institucional": "Servidor Público",
      "telefone": "(11) 99999-9999",
      "email": "joao.silva@cidade.gov.br",
      "data_inicio_trabalho": "2020-01-15",
      "endereco_residencial": "Rua das Flores, 123, Centro",
      "cidade_id": 1,
      "equipamento_id": 1,
      "ativo": true,
      "motivo_inativacao": null,
      "data_cadastro": "2024-01-15T10:30:00",
      "data_atualizacao": "2024-01-15T10:30:00"
    }
  ],
  "total": 1,
  "pages": 1,
  "current_page": 1
}
```

### GET /profissionais/{id}

Retorna um profissional específico.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": 1,
  "nome_completo": "João Silva Santos",
  "cpf": "123.456.789-00",
  "rg": "12.345.678-9",
  "data_nascimento": "1985-03-15",
  "data_expedicao_rg": "2010-05-20",
  "escolaridade": "Ensino Superior Completo",
  "profissao": "Assistente Social",
  "cargo": "Coordenador",
  "vinculo_institucional": "Servidor Público",
  "telefone": "(11) 99999-9999",
  "email": "joao.silva@cidade.gov.br",
  "data_inicio_trabalho": "2020-01-15",
  "endereco_residencial": "Rua das Flores, 123, Centro",
  "cidade_id": 1,
  "equipamento_id": 1,
  "ativo": true,
  "motivo_inativacao": null,
  "data_cadastro": "2024-01-15T10:30:00",
  "data_atualizacao": "2024-01-15T10:30:00"
}
```

**Response (404):**
```json
{
  "error": "Profissional não encontrado"
}
```

### POST /profissionais

Cria um novo profissional.

**Headers:**
```
Authorization: Bearer <token>
```

**Permissão Necessária:** Nível 2 (Editor) ou superior

**Request Body:**
```json
{
  "nome_completo": "Maria Oliveira Costa",
  "cpf": "987.654.321-00",
  "rg": "98.765.432-1",
  "data_nascimento": "1990-07-22",
  "data_expedicao_rg": "2015-03-10",
  "escolaridade": "Ensino Superior Completo",
  "profissao": "Psicólogo",
  "cargo": "Técnico",
  "vinculo_institucional": "CLT",
  "telefone": "(11) 88888-8888",
  "email": "maria.oliveira@cidade.gov.br",
  "data_inicio_trabalho": "2021-06-01",
  "endereco_residencial": "Av. Principal, 456, Jardim",
  "cidade_id": 1,
  "equipamento_id": 2
}
```

**Response (201):**
```json
{
  "id": 2,
  "nome_completo": "Maria Oliveira Costa",
  "cpf": "987.654.321-00",
  "rg": "98.765.432-1",
  "data_nascimento": "1990-07-22",
  "data_expedicao_rg": "2015-03-10",
  "escolaridade": "Ensino Superior Completo",
  "profissao": "Psicólogo",
  "cargo": "Técnico",
  "vinculo_institucional": "CLT",
  "telefone": "(11) 88888-8888",
  "email": "maria.oliveira@cidade.gov.br",
  "data_inicio_trabalho": "2021-06-01",
  "endereco_residencial": "Av. Principal, 456, Jardim",
  "cidade_id": 1,
  "equipamento_id": 2,
  "ativo": true,
  "motivo_inativacao": null,
  "data_cadastro": "2024-01-15T11:00:00",
  "data_atualizacao": "2024-01-15T11:00:00"
}
```

### PUT /profissionais/{id}

Atualiza um profissional existente.

**Headers:**
```
Authorization: Bearer <token>
```

**Permissão Necessária:** Nível 2 (Editor) ou superior

**Request Body:** (mesma estrutura do POST, todos os campos opcionais)

**Response (200):** (mesma estrutura do GET)

### DELETE /profissionais/{id}/inativar

Inativa um profissional (soft delete).

**Headers:**
```
Authorization: Bearer <token>
```

**Permissão Necessária:** Nível 2 (Editor) ou superior

**Request Body:**
```json
{
  "motivo_inativacao": "Transferência para outro município"
}
```

**Response (200):**
```json
{
  "message": "Profissional inativado com sucesso"
}
```

### POST /profissionais/{id}/reativar

Reativa um profissional inativo.

**Headers:**
```
Authorization: Bearer <token>
```

**Permissão Necessária:** Nível 2 (Editor) ou superior

**Response (200):**
```json
{
  "message": "Profissional reativado com sucesso"
}
```


## Cidades

### GET /cidades

Lista todas as cidades.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "nome": "São Paulo",
    "status": "ativo",
    "data_cadastro": "2024-01-01T00:00:00"
  },
  {
    "id": 2,
    "nome": "Rio de Janeiro",
    "status": "ativo",
    "data_cadastro": "2024-01-01T00:00:00"
  }
]
```

### POST /cidades

Cria uma nova cidade.

**Headers:**
```
Authorization: Bearer <token>
```

**Permissão Necessária:** Nível 3 (Admin Cidade) ou superior

**Request Body:**
```json
{
  "nome": "Belo Horizonte",
  "status": "ativo"
}
```

**Response (201):**
```json
{
  "id": 3,
  "nome": "Belo Horizonte",
  "status": "ativo",
  "data_cadastro": "2024-01-15T12:00:00"
}
```

### PUT /cidades/{id}

Atualiza uma cidade existente.

**Headers:**
```
Authorization: Bearer <token>
```

**Permissão Necessária:** Nível 3 (Admin Cidade) ou superior

### DELETE /cidades/{id}

Inativa uma cidade.

**Headers:**
```
Authorization: Bearer <token>
```

**Permissão Necessária:** Nível 3 (Admin Cidade) ou superior

## Equipamentos

### GET /equipamentos

Lista todos os equipamentos.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "nome": "CRAS Centro",
    "descricao": "Centro de Referência de Assistência Social - Região Central",
    "status": "ativo",
    "data_cadastro": "2024-01-01T00:00:00"
  },
  {
    "id": 2,
    "nome": "CREAS Norte",
    "descricao": "Centro de Referência Especializado de Assistência Social - Região Norte",
    "status": "ativo",
    "data_cadastro": "2024-01-01T00:00:00"
  }
]
```

### POST /equipamentos

Cria um novo equipamento.

**Headers:**
```
Authorization: Bearer <token>
```

**Permissão Necessária:** Nível 3 (Admin Cidade) ou superior

**Request Body:**
```json
{
  "nome": "CAPS Sul",
  "descricao": "Centro de Atenção Psicossocial - Região Sul",
  "status": "ativo"
}
```

### PUT /equipamentos/{id}

Atualiza um equipamento existente.

### DELETE /equipamentos/{id}

Inativa um equipamento.

## Usuários

### GET /usuarios

Lista todos os usuários.

**Headers:**
```
Authorization: Bearer <token>
```

**Permissão Necessária:** Nível 3 (Admin Cidade) ou superior

**Response (200):**
```json
[
  {
    "id": 1,
    "nome_completo": "Administrador do Sistema",
    "email": "admin@sistema.com",
    "nivel_acesso": 4,
    "cidade_id": null,
    "data_cadastro": "2024-01-01T00:00:00"
  },
  {
    "id": 2,
    "nome_completo": "João Editor",
    "email": "joao@cidade.gov.br",
    "nivel_acesso": 2,
    "cidade_id": 1,
    "data_cadastro": "2024-01-10T00:00:00"
  }
]
```

### POST /usuarios

Cria um novo usuário.

**Headers:**
```
Authorization: Bearer <token>
```

**Permissão Necessária:** Nível 3 (Admin Cidade) ou superior

**Request Body:**
```json
{
  "nome_completo": "Maria Gestora",
  "email": "maria@cidade.gov.br",
  "senha": "senha123",
  "nivel_acesso": 2,
  "cidade_id": 1
}
```

**Response (201):**
```json
{
  "id": 3,
  "nome_completo": "Maria Gestora",
  "email": "maria@cidade.gov.br",
  "nivel_acesso": 2,
  "cidade_id": 1,
  "data_cadastro": "2024-01-15T13:00:00"
}
```

### PUT /usuarios/{id}

Atualiza um usuário existente.

**Headers:**
```
Authorization: Bearer <token>
```

**Permissão Necessária:** Nível 3 (Admin Cidade) ou superior

**Request Body:** (senha é opcional para atualização)
```json
{
  "nome_completo": "Maria Gestora Silva",
  "email": "maria.silva@cidade.gov.br",
  "nivel_acesso": 3,
  "cidade_id": 1
}
```

### DELETE /usuarios/{id}

Remove um usuário do sistema.

**Headers:**
```
Authorization: Bearer <token>
```

**Permissão Necessária:** Nível 3 (Admin Cidade) ou superior

**Response (200):**
```json
{
  "message": "Usuário removido com sucesso"
}
```


## Relatórios

### GET /relatorios/profissionais/pdf

Gera relatório de profissionais em formato PDF.

**Headers:**
```
Authorization: Bearer <token>
```

**Permissão Necessária:** Nível 2 (Editor) ou superior

**Query Parameters:**
- `status` (string): "ativo", "inativo", "todos" (default: "ativo")
- `cidade_id` (integer): Filtrar por cidade
- `equipamento_id` (integer): Filtrar por equipamento

**Response (200):**
- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename="relatorio_profissionais_YYYYMMDD_HHMMSS.pdf"`

### GET /relatorios/profissionais/excel

Gera relatório de profissionais em formato Excel.

**Headers:**
```
Authorization: Bearer <token>
```

**Permissão Necessária:** Nível 2 (Editor) ou superior

**Query Parameters:** (mesmos do PDF)

**Response (200):**
- **Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition:** `attachment; filename="relatorio_profissionais_YYYYMMDD_HHMMSS.xlsx"`

### GET /relatorios/estatisticas

Retorna estatísticas do sistema.

**Headers:**
```
Authorization: Bearer <token>
```

**Permissão Necessária:** Nível 2 (Editor) ou superior

**Response (200):**
```json
{
  "geral": {
    "total_profissionais": 150,
    "profissionais_ativos": 142,
    "profissionais_inativos": 8,
    "taxa_atividade": 94.67
  },
  "por_equipamento": [
    {
      "equipamento": "CRAS Centro",
      "total": 45,
      "ativos": 43,
      "inativos": 2
    },
    {
      "equipamento": "CREAS Norte",
      "total": 32,
      "ativos": 30,
      "inativos": 2
    }
  ],
  "por_cidade": [
    {
      "cidade": "São Paulo",
      "total": 120,
      "ativos": 115,
      "inativos": 5
    },
    {
      "cidade": "Rio de Janeiro",
      "total": 30,
      "ativos": 27,
      "inativos": 3
    }
  ],
  "por_profissao": [
    {
      "profissao": "Assistente Social",
      "total": 45
    },
    {
      "profissao": "Psicólogo",
      "total": 32
    },
    {
      "profissao": "Pedagogo",
      "total": 28
    }
  ]
}
```

## Auditoria

### GET /auditoria

Lista registros de auditoria com filtros.

**Headers:**
```
Authorization: Bearer <token>
```

**Permissão Necessária:** Nível 3 (Admin Cidade) ou superior

**Query Parameters:**
- `tabela` (string): Filtrar por tabela ("profissionais", "usuarios", "cidades", "equipamentos")
- `acao` (string): Filtrar por ação ("CREATE", "UPDATE", "DELETE", "EXPORT")
- `usuario_id` (integer): Filtrar por usuário
- `data_inicio` (date): Data inicial (YYYY-MM-DD)
- `data_fim` (date): Data final (YYYY-MM-DD)
- `page` (integer): Página (default: 1)
- `per_page` (integer): Itens por página (default: 20)

**Response (200):**
```json
{
  "registros": [
    {
      "id": 1,
      "usuario_id": 1,
      "acao": "CREATE",
      "tabela": "profissionais",
      "registro_id": 5,
      "dados_antigos": null,
      "dados_novos": {
        "nome_completo": "João Silva Santos",
        "cpf": "123.456.789-00",
        "profissao": "Assistente Social"
      },
      "ip_origem": "192.168.1.100",
      "data_hora": "2024-01-15T10:30:00"
    },
    {
      "id": 2,
      "usuario_id": 2,
      "acao": "UPDATE",
      "tabela": "profissionais",
      "registro_id": 3,
      "dados_antigos": {
        "telefone": "(11) 99999-9999"
      },
      "dados_novos": {
        "telefone": "(11) 88888-8888"
      },
      "ip_origem": "192.168.1.101",
      "data_hora": "2024-01-15T11:15:00"
    }
  ],
  "total": 2,
  "pages": 1,
  "current_page": 1
}
```

### GET /auditoria/estatisticas

Retorna estatísticas de auditoria.

**Headers:**
```
Authorization: Bearer <token>
```

**Permissão Necessária:** Nível 3 (Admin Cidade) ou superior

**Response (200):**
```json
{
  "acoes": [
    {
      "acao": "CREATE",
      "total": 45
    },
    {
      "acao": "UPDATE",
      "total": 123
    },
    {
      "acao": "DELETE",
      "total": 8
    },
    {
      "acao": "EXPORT",
      "total": 15
    }
  ],
  "tabelas": [
    {
      "tabela": "profissionais",
      "total": 156
    },
    {
      "tabela": "usuarios",
      "total": 23
    },
    {
      "tabela": "cidades",
      "total": 8
    },
    {
      "tabela": "equipamentos",
      "total": 4
    }
  ],
  "usuarios": [
    {
      "usuario": "Administrador do Sistema",
      "total": 89
    },
    {
      "usuario": "João Editor",
      "total": 67
    },
    {
      "usuario": "Maria Gestora",
      "total": 35
    }
  ]
}
```


## Códigos de Erro

### Códigos HTTP

- **200 OK**: Requisição bem-sucedida
- **201 Created**: Recurso criado com sucesso
- **400 Bad Request**: Dados inválidos na requisição
- **401 Unauthorized**: Token inválido ou ausente
- **403 Forbidden**: Permissão insuficiente
- **404 Not Found**: Recurso não encontrado
- **409 Conflict**: Conflito de dados (ex: email já existe)
- **422 Unprocessable Entity**: Dados não processáveis
- **500 Internal Server Error**: Erro interno do servidor

### Estrutura de Erro

```json
{
  "error": "Descrição do erro",
  "details": {
    "field": "Campo específico com erro",
    "message": "Mensagem detalhada"
  }
}
```

### Exemplos de Erros Comuns

**Token inválido (401):**
```json
{
  "error": "Token inválido ou expirado"
}
```

**Permissão insuficiente (403):**
```json
{
  "error": "Permissão negada"
}
```

**Dados inválidos (400):**
```json
{
  "error": "Dados inválidos",
  "details": {
    "cpf": "CPF já cadastrado no sistema",
    "email": "Email já está em uso"
  }
}
```

**Recurso não encontrado (404):**
```json
{
  "error": "Profissional não encontrado"
}
```

## Exemplos de Uso

### Fluxo Completo de Autenticação

```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sistema.com",
    "senha": "admin123"
  }'

# Response:
# {
#   "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
#   "usuario": {...}
# }

# 2. Usar token nas requisições
curl -X GET http://localhost:5000/api/profissionais \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

### Cadastro de Profissional

```bash
curl -X POST http://localhost:5000/api/profissionais \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nome_completo": "Ana Paula Silva",
    "cpf": "111.222.333-44",
    "rg": "11.222.333-4",
    "data_nascimento": "1988-12-05",
    "data_expedicao_rg": "2018-01-15",
    "escolaridade": "Ensino Superior Completo",
    "profissao": "Assistente Social",
    "cargo": "Técnico",
    "vinculo_institucional": "Servidor Público",
    "telefone": "(11) 77777-7777",
    "email": "ana.paula@cidade.gov.br",
    "data_inicio_trabalho": "2022-03-01",
    "endereco_residencial": "Rua Nova, 789, Bairro Novo",
    "cidade_id": 1,
    "equipamento_id": 1
  }'
```

### Filtros Avançados

```bash
# Buscar profissionais ativos de uma cidade específica
curl -X GET "http://localhost:5000/api/profissionais?status=ativo&cidade_id=1&page=1&per_page=20" \
  -H "Authorization: Bearer <token>"

# Buscar por profissão
curl -X GET "http://localhost:5000/api/profissionais?profissao=Assistente%20Social" \
  -H "Authorization: Bearer <token>"
```

### Geração de Relatórios

```bash
# Gerar PDF de profissionais ativos
curl -X GET "http://localhost:5000/api/relatorios/profissionais/pdf?status=ativo" \
  -H "Authorization: Bearer <token>" \
  --output relatorio_profissionais.pdf

# Gerar Excel com filtros
curl -X GET "http://localhost:5000/api/relatorios/profissionais/excel?cidade_id=1&equipamento_id=2" \
  -H "Authorization: Bearer <token>" \
  --output relatorio_filtrado.xlsx
```

### Consulta de Auditoria

```bash
# Buscar ações de um usuário específico
curl -X GET "http://localhost:5000/api/auditoria?usuario_id=1&data_inicio=2024-01-01&data_fim=2024-01-31" \
  -H "Authorization: Bearer <token>"

# Buscar alterações em profissionais
curl -X GET "http://localhost:5000/api/auditoria?tabela=profissionais&acao=UPDATE" \
  -H "Authorization: Bearer <token>"
```

## Considerações de Segurança

### Autenticação JWT

- Tokens têm validade de 24 horas
- Refresh tokens disponíveis para renovação
- Tokens devem ser enviados no header `Authorization: Bearer <token>`

### Controle de Acesso

- Verificação de permissões em todos os endpoints protegidos
- Usuários só podem acessar dados de sua cidade (exceto Admin Global)
- Auditoria completa de todas as ações

### Validação de Dados

- Validação de CPF único no sistema
- Validação de email único por usuário
- Sanitização de dados de entrada
- Prevenção contra SQL Injection

### CORS

- Configurado para aceitar requisições do frontend
- Headers apropriados para desenvolvimento e produção

## Ambiente de Desenvolvimento

### Configuração Local

```bash
# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
export FLASK_ENV=development
export SECRET_KEY=sua_chave_secreta
export DATABASE_URL=sqlite:///app.db

# Executar aplicação
python src/main.py
```

### Banco de Dados

```bash
# Criar tabelas (executado automaticamente na primeira execução)
# Dados de exemplo são inseridos automaticamente
```

### Usuários Padrão

- **Admin Global**: admin@sistema.com / admin123
- **Admin Cidade**: admin.cidade@sistema.com / admin123
- **Editor**: editor@sistema.com / editor123
- **Visualizador**: viewer@sistema.com / viewer123

