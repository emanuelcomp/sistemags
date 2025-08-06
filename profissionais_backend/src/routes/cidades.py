from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.database import db, Cidade, Usuario
from src.utils.auditoria import registrar_auditoria

cidades_bp = Blueprint('cidades', __name__)

def verificar_permissao_admin():
    current_user_id = get_jwt_identity()
    usuario = Usuario.query.get(current_user_id)
    return usuario and usuario.nivel_acesso >= 3  # Admin Cidade ou Admin Global

@cidades_bp.route('/', methods=['GET'])
@jwt_required()
def listar_cidades():
    try:
        cidades = Cidade.query.filter_by(status='ativo').all()
        return jsonify([cidade.to_dict() for cidade in cidades]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@cidades_bp.route('/', methods=['POST'])
@jwt_required()
def criar_cidade():
    try:
        if not verificar_permissao_admin():
            return jsonify({'error': 'Permissão negada'}), 403
        
        data = request.get_json()
        
        # Verificar se a cidade já existe
        if Cidade.query.filter_by(nome=data.get('nome')).first():
            return jsonify({'error': 'Cidade já cadastrada'}), 400
        
        nova_cidade = Cidade(
            nome=data.get('nome'),
            status=data.get('status', 'ativo')
        )
        
        db.session.add(nova_cidade)
        db.session.commit()
        
        # Registrar auditoria
        registrar_auditoria(
            usuario_id=get_jwt_identity(),
            acao='CREATE',
            tabela='cidades',
            registro_id=nova_cidade.id,
            dados_novos=nova_cidade.to_dict(),
            ip_origem=request.remote_addr
        )
        
        return jsonify(nova_cidade.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@cidades_bp.route('/<int:cidade_id>', methods=['PUT'])
@jwt_required()
def atualizar_cidade(cidade_id):
    try:
        if not verificar_permissao_admin():
            return jsonify({'error': 'Permissão negada'}), 403
        
        cidade = Cidade.query.get_or_404(cidade_id)
        dados_antigos = cidade.to_dict()
        
        data = request.get_json()
        
        cidade.nome = data.get('nome', cidade.nome)
        cidade.status = data.get('status', cidade.status)
        
        db.session.commit()
        
        # Registrar auditoria
        registrar_auditoria(
            usuario_id=get_jwt_identity(),
            acao='UPDATE',
            tabela='cidades',
            registro_id=cidade.id,
            dados_antigos=dados_antigos,
            dados_novos=cidade.to_dict(),
            ip_origem=request.remote_addr
        )
        
        return jsonify(cidade.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@cidades_bp.route('/<int:cidade_id>', methods=['DELETE'])
@jwt_required()
def deletar_cidade(cidade_id):
    try:
        if not verificar_permissao_admin():
            return jsonify({'error': 'Permissão negada'}), 403
        
        cidade = Cidade.query.get_or_404(cidade_id)
        dados_antigos = cidade.to_dict()
        
        # Soft delete - marcar como inativo
        cidade.status = 'inativo'
        db.session.commit()
        
        # Registrar auditoria
        registrar_auditoria(
            usuario_id=get_jwt_identity(),
            acao='DELETE',
            tabela='cidades',
            registro_id=cidade.id,
            dados_antigos=dados_antigos,
            dados_novos=cidade.to_dict(),
            ip_origem=request.remote_addr
        )
        
        return jsonify({'message': 'Cidade inativada com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

