# Sistema de Gerenciamento de Profissionais - Instruções de Execução

## Visão Geral

Este é um sistema web full stack desenvolvido para gerenciar profissionais de equipamentos públicos (CRAS, CREAS, CAPS, etc.). O sistema inclui:

- **Backend**: API REST em Flask com autenticação JWT
- **Frontend**: Interface React com Tailwind CSS
- **Banco de Dados**: SQLite (desenvolvimento) / PostgreSQL (produção)
- **Containerização**: Docker e Docker Compose

## Estrutura do Projeto

```
/
├── profissionais_backend/          # API Flask
│   ├── src/
│   │   ├── main.py                # Aplicação principal
│   │   ├── models/                # Modelos do banco de dados
│   │   ├── routes/                # Endpoints da API
│   │   └── utils/                 # Utilitários (auditoria)
│   ├── requirements.txt           # Dependências Python
│   ├── Dockerfile                 # Container do backend
│   └── venv/                      # Ambiente virtual
├── profissionais_frontend/         # Interface React
│   ├── src/
│   │   ├── components/            # Componentes reutilizáveis
│   │   ├── pages/                 # Páginas da aplicação
│   │   ├── lib/                   # Utilitários (API, auth)
│   │   └── App.jsx                # Componente principal
│   ├── package.json               # Dependências Node.js
│   ├── Dockerfile                 # Container do frontend
│   └── nginx.conf                 # Configuração do nginx
├── docker-compose.yml             # Orquestração dos serviços
├── init.sql                       # Script de inicialização do BD
├── README.md                      # Documentação principal
├── erd.md                         # Modelo de dados
├── erd.png                        # Diagrama ERD
└── API_Documentation.md           # Documentação da API
```

## Pré-requisitos

### Para execução com Docker (Recomendado)
- Docker 20.10+
- Docker Compose 2.0+

### Para execução local
- Python 3.11+
- Node.js 20+
- pnpm ou npm

## Execução com Docker (Recomendado)

### 1. Iniciar todos os serviços

```bash
# Clonar ou extrair o projeto
cd sistema-profissionais

# Iniciar todos os serviços
docker-compose up -d

# Verificar status dos containers
docker-compose ps
```

### 2. Acessar a aplicação

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Banco de Dados**: PostgreSQL na porta 5432

### 3. Usuários padrão para teste

- **Admin Global**: admin@sistema.com / admin123
- **Admin Cidade**: admin.cidade@sistema.com / admin123  
- **Editor**: editor@sistema.com / editor123
- **Visualizador**: viewer@sistema.com / viewer123

### 4. Comandos úteis

```bash
# Ver logs dos serviços
docker-compose logs -f

# Parar todos os serviços
docker-compose down

# Reconstruir containers após mudanças
docker-compose up --build

# Executar comandos no backend
docker-compose exec backend bash

# Executar comandos no frontend
docker-compose exec frontend bash
```

## Execução Local (Desenvolvimento)

### 1. Configurar Backend

```bash
# Navegar para o diretório do backend
cd profissionais_backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Executar aplicação
python src/main.py
```

O backend estará disponível em: http://localhost:5000

### 2. Configurar Frontend

```bash
# Em outro terminal, navegar para o frontend
cd profissionais_frontend

# Instalar dependências
pnpm install
# ou: npm install

# Executar em modo desenvolvimento
pnpm run dev
# ou: npm run dev
```

O frontend estará disponível em: http://localhost:5173

### 3. Configurar Banco de Dados

O sistema criará automaticamente o banco SQLite na primeira execução e inserirá dados de exemplo.

## Funcionalidades Implementadas

### ✅ Sistema de Autenticação
- Login com JWT
- Controle de sessão
- Refresh tokens
- 4 níveis de acesso (Visualização, Editor, Admin Cidade, Admin Global)

### ✅ Gestão de Profissionais
- CRUD completo
- Soft delete com motivo de inativação
- Filtros avançados (status, cidade, equipamento, profissão)
- Paginação
- Validação de dados (CPF único, email único)

### ✅ Gestão de Usuários
- CRUD de usuários com níveis de acesso
- Associação com cidades
- Prevenção de auto-exclusão

### ✅ Gestão de Cidades e Equipamentos
- CRUD de cidades
- CRUD de equipamentos (CRAS, CREAS, CAPS, etc.)
- Status ativo/inativo

### ✅ Sistema de Relatórios
- Exportação em PDF com ReportLab
- Exportação em Excel com OpenPyXL
- Filtros aplicáveis aos relatórios
- Estatísticas em tempo real

### ✅ Sistema de Auditoria
- Registro automático de todas as ações
- Rastreamento de alterações (antes/depois)
- Filtros por usuário, tabela, ação e data
- Estatísticas de uso

### ✅ Interface Responsiva
- Design moderno com Tailwind CSS
- Componentes reutilizáveis com shadcn/ui
- Navegação intuitiva
- Adaptável para desktop e mobile

## Configurações Avançadas

### Variáveis de Ambiente

#### Backend (.env)
```bash
FLASK_ENV=development
SECRET_KEY=sua_chave_secreta_muito_segura
DATABASE_URL=sqlite:///app.db
JWT_SECRET_KEY=sua_chave_jwt_secreta
```

#### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5000/api
```

### Configuração de Produção

#### Backend
```bash
# Usar PostgreSQL em produção
DATABASE_URL=postgresql://user:password@localhost:5432/profissionais_db

# Configurar CORS para domínio de produção
CORS_ORIGINS=https://seu-dominio.com

# Usar chaves secretas seguras
SECRET_KEY=chave_super_secreta_de_producao
JWT_SECRET_KEY=chave_jwt_super_secreta
```

#### Frontend
```bash
# Apontar para API de produção
VITE_API_URL=https://api.seu-dominio.com/api
```

## Solução de Problemas

### Problema: Backend não responde
```bash
# Verificar se a porta 5000 está livre
netstat -tlnp | grep 5000

# Verificar logs do container
docker-compose logs backend

# Reiniciar serviço
docker-compose restart backend
```

### Problema: Frontend com erro de compilação
```bash
# Limpar cache do node
rm -rf node_modules package-lock.json
pnpm install

# Verificar versão do Node.js
node --version  # Deve ser 20+
```

### Problema: Banco de dados não inicializa
```bash
# Verificar logs do PostgreSQL
docker-compose logs postgres

# Recriar volume do banco
docker-compose down -v
docker-compose up -d
```

### Problema: Erro de CORS
```bash
# Verificar configuração no backend (main.py)
# Adicionar domínio do frontend nas origens permitidas
```

## Desenvolvimento e Contribuição

### Estrutura de Desenvolvimento

1. **Backend**: Flask com SQLAlchemy e JWT
2. **Frontend**: React com Vite, Tailwind CSS e shadcn/ui
3. **Banco**: SQLite (dev) / PostgreSQL (prod)
4. **Autenticação**: JWT com refresh tokens
5. **Documentação**: OpenAPI/Swagger

### Comandos de Desenvolvimento

```bash
# Instalar novas dependências no backend
cd profissionais_backend
source venv/bin/activate
pip install nova_dependencia
pip freeze > requirements.txt

# Instalar novas dependências no frontend
cd profissionais_frontend
pnpm add nova_dependencia

# Executar testes (quando implementados)
# Backend: pytest
# Frontend: pnpm test
```

### Estrutura de Commits

```bash
# Exemplos de commits
git commit -m "feat: adicionar filtro por profissão"
git commit -m "fix: corrigir validação de CPF"
git commit -m "docs: atualizar documentação da API"
```

## Suporte e Contato

Para dúvidas ou problemas:

1. Verificar esta documentação
2. Consultar logs dos containers
3. Verificar documentação da API
4. Verificar issues conhecidos no README.md

## Próximos Passos

### Melhorias Sugeridas

1. **Testes Automatizados**
   - Testes unitários no backend (pytest)
   - Testes de integração no frontend (Jest/Vitest)

2. **Monitoramento**
   - Logs estruturados
   - Métricas de performance
   - Health checks

3. **Segurança**
   - Rate limiting
   - Validação mais rigorosa
   - Criptografia de dados sensíveis

4. **Performance**
   - Cache Redis
   - Otimização de queries
   - CDN para assets

5. **Funcionalidades**
   - Notificações por email
   - Dashboard avançado
   - Integração com outros sistemas

