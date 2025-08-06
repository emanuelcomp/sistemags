# Sistema de Gerenciamento de Profissionais

Sistema web full stack para cadastro e gerenciamento de profissionais com multi-cidade, equipamentos, níveis de usuário e exclusão auditada.

## Características Principais

- **Backend**: Flask (Python) com API REST
- **Frontend**: React.js com Tailwind CSS e shadcn/ui
- **Banco de Dados**: PostgreSQL (produção) / SQLite (desenvolvimento)
- **Autenticação**: JWT com níveis de acesso
- **Containerização**: Docker e Docker Compose

## Funcionalidades

### Módulos Principais
- **Profissionais**: CRUD completo com soft delete e auditoria
- **Equipamentos**: Gestão de CRAS, CREAS, CAPS, etc.
- **Cidades**: Controle multi-cidade
- **Usuários**: Sistema de permissões por níveis
- **Auditoria**: Rastreamento completo de ações

### Níveis de Usuário
1. **Visualização**: Apenas consulta
2. **Editor**: Adiciona/edita profissionais da sua cidade
3. **Admin Cidade**: CRUD completo na cidade e gestão de usuários locais
4. **Admin Global**: CRUD total, gestão de cidades e equipamentos

### Funcionalidades Especiais
- Soft delete com motivo de inativação
- Filtros avançados por cidade, equipamento, status, profissão
- Sistema de auditoria completo
- Interface responsiva para desktop e mobile

## Pré-requisitos

- Docker
- Docker Compose
- Git (opcional)

## Instalação e Execução

### 1. Clonar o repositório (se aplicável)
```bash
git clone <url-do-repositorio>
cd sistema-profissionais
```

### 2. Executar com Docker Compose
```bash
# Construir e iniciar todos os serviços
docker-compose up --build

# Ou executar em background
docker-compose up --build -d
```

### 3. Acessar o sistema
- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000
- **Banco de dados**: localhost:5432

## Usuários Padrão

O sistema vem com usuários pré-cadastrados para teste:

| Email | Senha | Nível | Descrição |
|-------|-------|-------|-----------|
| admin@sistema.com | admin123 | Admin Global | Acesso total ao sistema |
| gestor.sp@sistema.com | admin123 | Admin Cidade | Gestor da cidade de São Paulo |
| editor.rj@sistema.com | admin123 | Editor | Editor da cidade do Rio de Janeiro |

## Estrutura do Projeto

```
├── profissionais_backend/     # Backend Flask
│   ├── src/
│   │   ├── models/           # Modelos de dados
│   │   ├── routes/           # Rotas da API
│   │   ├── utils/            # Utilitários
│   │   └── main.py           # Ponto de entrada
│   ├── Dockerfile
│   └── requirements.txt
├── profissionais_frontend/    # Frontend React
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   ├── pages/            # Páginas da aplicação
│   │   ├── lib/              # Bibliotecas e utilitários
│   │   └── App.jsx           # Componente principal
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml         # Configuração Docker Compose
├── init.sql                   # Script de inicialização do BD
└── README.md                  # Este arquivo
```

## Desenvolvimento Local

### Backend (Flask)
```bash
cd profissionais_backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou venv\Scripts\activate  # Windows
pip install -r requirements.txt
python src/main.py
```

### Frontend (React)
```bash
cd profissionais_frontend
pnpm install
pnpm run dev
```

## API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuário atual
- `POST /api/auth/register` - Registro

### Profissionais
- `GET /api/profissionais` - Listar profissionais
- `POST /api/profissionais` - Criar profissional
- `GET /api/profissionais/{id}` - Obter profissional
- `PUT /api/profissionais/{id}` - Atualizar profissional
- `DELETE /api/profissionais/{id}` - Inativar profissional
- `PUT /api/profissionais/{id}/reativar` - Reativar profissional

### Equipamentos
- `GET /api/equipamentos` - Listar equipamentos
- `POST /api/equipamentos` - Criar equipamento
- `PUT /api/equipamentos/{id}` - Atualizar equipamento
- `DELETE /api/equipamentos/{id}` - Inativar equipamento
- `GET /api/equipamentos/{id}/profissionais` - Profissionais por equipamento

### Cidades
- `GET /api/cidades` - Listar cidades
- `POST /api/cidades` - Criar cidade
- `PUT /api/cidades/{id}` - Atualizar cidade
- `DELETE /api/cidades/{id}` - Inativar cidade

### Usuários
- `GET /api/usuarios` - Listar usuários
- `POST /api/usuarios` - Criar usuário
- `PUT /api/usuarios/{id}` - Atualizar usuário
- `DELETE /api/usuarios/{id}` - Deletar usuário

### Auditoria
- `GET /api/auditoria` - Listar registros de auditoria
- `GET /api/auditoria/estatisticas` - Estatísticas de auditoria

## Filtros Disponíveis

### Profissionais
- `status`: ativo, inativo, ou vazio para todos
- `cidade_id`: ID da cidade
- `equipamento_id`: ID do equipamento
- `profissao`: Filtro por profissão (busca parcial)
- `cargo`: Filtro por cargo (busca parcial)

### Auditoria
- `tabela`: Nome da tabela
- `acao`: CREATE, UPDATE, DELETE
- `usuario_id`: ID do usuário
- `data_inicio`: Data inicial (YYYY-MM-DD)
- `data_fim`: Data final (YYYY-MM-DD)

## Tecnologias Utilizadas

### Backend
- Flask (Framework web)
- Flask-SQLAlchemy (ORM)
- Flask-JWT-Extended (Autenticação)
- Flask-CORS (CORS)
- Flask-Migrate (Migrações)
- bcrypt (Hash de senhas)
- PostgreSQL/SQLite (Banco de dados)

### Frontend
- React.js (Framework)
- React Router (Roteamento)
- Tailwind CSS (Estilização)
- shadcn/ui (Componentes)
- Lucide React (Ícones)
- Axios (Cliente HTTP)
- React Hook Form (Formulários)
- Zod (Validação)

### DevOps
- Docker (Containerização)
- Docker Compose (Orquestração)
- Nginx (Servidor web)

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## Suporte

Para suporte, entre em contato através do email: suporte@sistema.com

