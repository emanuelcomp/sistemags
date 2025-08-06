from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Cidade(db.Model):
    __tablename__ = 'cidades'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(255), unique=True, nullable=False)
    status = db.Column(db.Enum('ativo', 'inativo', name='status_enum'), nullable=False, default='ativo')
    data_cadastro = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # Relacionamentos
    usuarios = db.relationship('Usuario', backref='cidade', lazy=True)
    profissionais = db.relationship('Profissional', backref='cidade', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'status': self.status,
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None
        }

class Equipamento(db.Model):
    __tablename__ = 'equipamentos'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(255), nullable=False)
    descricao = db.Column(db.Text)
    status = db.Column(db.Enum('ativo', 'inativo', name='status_enum'), nullable=False, default='ativo')
    data_cadastro = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # Relacionamentos
    profissionais = db.relationship('Profissional', backref='equipamento', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'descricao': self.descricao,
            'status': self.status,
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None
        }

class Usuario(db.Model):
    __tablename__ = 'usuarios'
    
    id = db.Column(db.Integer, primary_key=True)
    nome_completo = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    senha_hash = db.Column(db.String(255), nullable=False)
    nivel_acesso = db.Column(db.Integer, nullable=False)  # 1=Visualização, 2=Editor, 3=Admin Cidade, 4=Admin Global
    cidade_id = db.Column(db.Integer, db.ForeignKey('cidades.id'), nullable=True)
    data_cadastro = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # Relacionamentos
    auditorias = db.relationship('Auditoria', backref='usuario', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome_completo': self.nome_completo,
            'email': self.email,
            'nivel_acesso': self.nivel_acesso,
            'cidade_id': self.cidade_id,
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None
        }

class Profissional(db.Model):
    __tablename__ = 'profissionais'
    
    id = db.Column(db.Integer, primary_key=True)
    equipamento_id = db.Column(db.Integer, db.ForeignKey('equipamentos.id'), nullable=False)
    nome_completo = db.Column(db.String(255), nullable=False)
    data_nascimento = db.Column(db.Date, nullable=False)
    cpf = db.Column(db.String(14), unique=True, nullable=False)
    rg = db.Column(db.String(20), unique=True, nullable=False)
    data_expedicao_rg = db.Column(db.Date, nullable=False)
    escolaridade = db.Column(db.String(100), nullable=False)
    profissao = db.Column(db.String(100), nullable=False)
    cargo = db.Column(db.String(100), nullable=False)
    vinculo_institucional = db.Column(db.String(255), nullable=False)
    telefone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    data_inicio_trabalho = db.Column(db.Date, nullable=False)
    endereco_residencial = db.Column(db.Text, nullable=False)
    cidade_id = db.Column(db.Integer, db.ForeignKey('cidades.id'), nullable=False)
    data_cadastro = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    ativo = db.Column(db.Boolean, nullable=False, default=True)
    motivo_inativacao = db.Column(db.Text)
    data_inativacao = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'equipamento_id': self.equipamento_id,
            'nome_completo': self.nome_completo,
            'data_nascimento': self.data_nascimento.isoformat() if self.data_nascimento else None,
            'cpf': self.cpf,
            'rg': self.rg,
            'data_expedicao_rg': self.data_expedicao_rg.isoformat() if self.data_expedicao_rg else None,
            'escolaridade': self.escolaridade,
            'profissao': self.profissao,
            'cargo': self.cargo,
            'vinculo_institucional': self.vinculo_institucional,
            'telefone': self.telefone,
            'email': self.email,
            'data_inicio_trabalho': self.data_inicio_trabalho.isoformat() if self.data_inicio_trabalho else None,
            'endereco_residencial': self.endereco_residencial,
            'cidade_id': self.cidade_id,
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None,
            'ativo': self.ativo,
            'motivo_inativacao': self.motivo_inativacao,
            'data_inativacao': self.data_inativacao.isoformat() if self.data_inativacao else None
        }

class Auditoria(db.Model):
    __tablename__ = 'auditoria'
    
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    acao = db.Column(db.String(255), nullable=False)
    tabela = db.Column(db.String(255), nullable=False)
    registro_id = db.Column(db.Integer, nullable=False)
    dados_antigos = db.Column(db.JSON)
    dados_novos = db.Column(db.JSON)
    data_hora = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    ip_origem = db.Column(db.String(45))
    
    def to_dict(self):
        return {
            'id': self.id,
            'usuario_id': self.usuario_id,
            'acao': self.acao,
            'tabela': self.tabela,
            'registro_id': self.registro_id,
            'dados_antigos': self.dados_antigos,
            'dados_novos': self.dados_novos,
            'data_hora': self.data_hora.isoformat() if self.data_hora else None,
            'ip_origem': self.ip_origem
        }

