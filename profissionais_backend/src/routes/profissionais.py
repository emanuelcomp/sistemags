from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from src.models.database import db, Profissional, Usuario
from src.utils.auditoria import registrar_auditoria

profissionais_bp = Blueprint('profissionais', __name__)

def verificar_permissao_edicao(profissional=None):
    current_user_id = get_jwt_identity()
    usuario = Usuario.query.get(current_user_id)
    
    if not usuario:
        return False
    
    # Admin Global pode tudo
    if usuario.nivel_acesso == 4:
        return True
    
    # Admin Cidade pode editar profissionais da sua cidade
    if usuario.nivel_acesso == 3:
        if profissional:
            return profissional.cidade_id == usuario.cidade_id
        return True  # Para criação, verificar depois
    
    # Editor pode editar profissionais da sua cidade
    if usuario.nivel_acesso == 2:
        if profissional:
            return profissional.cidade_id == usuario.cidade_id
        return True  # Para criação, verificar depois
    
    return False  # Visualização não pode editar

@profissionais_bp.route('/', methods=['GET'])
@jwt_required()
def listar_profissionais():
    try:
        current_user_id = get_jwt_identity()
        usuario = Usuario.query.get(current_user_id)
        
        query = Profissional.query
        
        # Filtrar por cidade se não for Admin Global
        if usuario.nivel_acesso < 4 and usuario.cidade_id:
            query = query.filter_by(cidade_id=usuario.cidade_id)
        
        # Filtros da query string
        status = request.args.get('status', 'ativo')
        cidade_id = request.args.get('cidade_id')
        equipamento_id = request.args.get('equipamento_id')
        profissao = request.args.get('profissao')
        cargo = request.args.get('cargo')
        
        if status == 'ativo':
            query = query.filter_by(ativo=True)
        elif status == 'inativo':
            query = query.filter_by(ativo=False)
        
        if cidade_id:
            query = query.filter_by(cidade_id=int(cidade_id))
        
        if equipamento_id:
            query = query.filter_by(equipamento_id=int(equipamento_id))
        
        if profissao:
            query = query.filter(Profissional.profissao.ilike(f'%{profissao}%'))
        
        if cargo:
            query = query.filter(Profissional.cargo.ilike(f'%{cargo}%'))
        
        profissionais = query.all()
        
        return jsonify([prof.to_dict() for prof in profissionais]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@profissionais_bp.route('/', methods=['POST'])
@jwt_required()
def criar_profissional():
    try:
        if not verificar_permissao_edicao():
            return jsonify({'error': 'Permissão negada'}), 403
        
        data = request.get_json()
        
        # Verificar se CPF já existe
        if Profissional.query.filter_by(cpf=data.get('cpf')).first():
            return jsonify({'error': 'CPF já cadastrado'}), 400
        
        # Verificar se RG já existe
        if Profissional.query.filter_by(rg=data.get('rg')).first():
            return jsonify({'error': 'RG já cadastrado'}), 400
        
        # Verificar se email já existe
        if Profissional.query.filter_by(email=data.get('email')).first():
            return jsonify({'error': 'Email já cadastrado'}), 400
        
        # Converter datas
        data_nascimento = datetime.strptime(data.get('data_nascimento'), '%Y-%m-%d').date()
        data_expedicao_rg = datetime.strptime(data.get('data_expedicao_rg'), '%Y-%m-%d').date()
        data_inicio_trabalho = datetime.strptime(data.get('data_inicio_trabalho'), '%Y-%m-%d').date()
        
        novo_profissional = Profissional(
            equipamento_id=data.get('equipamento_id'),
            nome_completo=data.get('nome_completo'),
            data_nascimento=data_nascimento,
            cpf=data.get('cpf'),
            rg=data.get('rg'),
            data_expedicao_rg=data_expedicao_rg,
            escolaridade=data.get('escolaridade'),
            profissao=data.get('profissao'),
            cargo=data.get('cargo'),
            vinculo_institucional=data.get('vinculo_institucional'),
            telefone=data.get('telefone'),
            email=data.get('email'),
            data_inicio_trabalho=data_inicio_trabalho,
            endereco_residencial=data.get('endereco_residencial'),
            cidade_id=data.get('cidade_id')
        )
        
        db.session.add(novo_profissional)
        db.session.commit()
        
        # Registrar auditoria
        registrar_auditoria(
            usuario_id=get_jwt_identity(),
            acao='CREATE',
            tabela='profissionais',
            registro_id=novo_profissional.id,
            dados_novos=novo_profissional.to_dict(),
            ip_origem=request.remote_addr
        )
        
        return jsonify(novo_profissional.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@profissionais_bp.route('/<int:profissional_id>', methods=['GET'])
@jwt_required()
def obter_profissional(profissional_id):
    try:
        profissional = Profissional.query.get_or_404(profissional_id)
        
        # Verificar permissão de visualização
        current_user_id = get_jwt_identity()
        usuario = Usuario.query.get(current_user_id)
        
        if usuario.nivel_acesso < 4 and usuario.cidade_id != profissional.cidade_id:
            return jsonify({'error': 'Permissão negada'}), 403
        
        return jsonify(profissional.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@profissionais_bp.route('/<int:profissional_id>', methods=['PUT'])
@jwt_required()
def atualizar_profissional(profissional_id):
    try:
        profissional = Profissional.query.get_or_404(profissional_id)
        
        if not verificar_permissao_edicao(profissional):
            return jsonify({'error': 'Permissão negada'}), 403
        
        dados_antigos = profissional.to_dict()
        data = request.get_json()
        
        # Atualizar campos
        if 'nome_completo' in data:
            profissional.nome_completo = data['nome_completo']
        if 'data_nascimento' in data:
            profissional.data_nascimento = datetime.strptime(data['data_nascimento'], '%Y-%m-%d').date()
        if 'cpf' in data:
            profissional.cpf = data['cpf']
        if 'rg' in data:
            profissional.rg = data['rg']
        if 'data_expedicao_rg' in data:
            profissional.data_expedicao_rg = datetime.strptime(data['data_expedicao_rg'], '%Y-%m-%d').date()
        if 'escolaridade' in data:
            profissional.escolaridade = data['escolaridade']
        if 'profissao' in data:
            profissional.profissao = data['profissao']
        if 'cargo' in data:
            profissional.cargo = data['cargo']
        if 'vinculo_institucional' in data:
            profissional.vinculo_institucional = data['vinculo_institucional']
        if 'telefone' in data:
            profissional.telefone = data['telefone']
        if 'email' in data:
            profissional.email = data['email']
        if 'data_inicio_trabalho' in data:
            profissional.data_inicio_trabalho = datetime.strptime(data['data_inicio_trabalho'], '%Y-%m-%d').date()
        if 'endereco_residencial' in data:
            profissional.endereco_residencial = data['endereco_residencial']
        if 'equipamento_id' in data:
            profissional.equipamento_id = data['equipamento_id']
        if 'cidade_id' in data:
            profissional.cidade_id = data['cidade_id']
        
        db.session.commit()
        
        # Registrar auditoria
        registrar_auditoria(
            usuario_id=get_jwt_identity(),
            acao='UPDATE',
            tabela='profissionais',
            registro_id=profissional.id,
            dados_antigos=dados_antigos,
            dados_novos=profissional.to_dict(),
            ip_origem=request.remote_addr
        )
        
        return jsonify(profissional.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@profissionais_bp.route('/<int:profissional_id>', methods=['DELETE'])
@jwt_required()
def inativar_profissional(profissional_id):
    try:
        profissional = Profissional.query.get_or_404(profissional_id)
        
        if not verificar_permissao_edicao(profissional):
            return jsonify({'error': 'Permissão negada'}), 403
        
        dados_antigos = profissional.to_dict()
        data = request.get_json()
        
        # Soft delete
        profissional.ativo = False
        profissional.motivo_inativacao = data.get('motivo_inativacao', 'Não informado')
        profissional.data_inativacao = datetime.utcnow()
        
        db.session.commit()
        
        # Registrar auditoria
        registrar_auditoria(
            usuario_id=get_jwt_identity(),
            acao='DELETE',
            tabela='profissionais',
            registro_id=profissional.id,
            dados_antigos=dados_antigos,
            dados_novos=profissional.to_dict(),
            ip_origem=request.remote_addr
        )
        
        return jsonify({'message': 'Profissional inativado com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@profissionais_bp.route('/<int:profissional_id>/reativar', methods=['PUT'])
@jwt_required()
def reativar_profissional(profissional_id):
    try:
        profissional = Profissional.query.get_or_404(profissional_id)
        
        if not verificar_permissao_edicao(profissional):
            return jsonify({'error': 'Permissão negada'}), 403
        
        dados_antigos = profissional.to_dict()
        
        # Reativar
        profissional.ativo = True
        profissional.motivo_inativacao = None
        profissional.data_inativacao = None
        
        db.session.commit()
        
        # Registrar auditoria
        registrar_auditoria(
            usuario_id=get_jwt_identity(),
            acao='UPDATE',
            tabela='profissionais',
            registro_id=profissional.id,
            dados_antigos=dados_antigos,
            dados_novos=profissional.to_dict(),
            ip_origem=request.remote_addr
        )
        
        return jsonify(profissional.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

