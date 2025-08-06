from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.database import db, Equipamento, Usuario
from src.utils.auditoria import registrar_auditoria

equipamentos_bp = Blueprint('equipamentos', __name__)

def verificar_permissao_admin():
    current_user_id = get_jwt_identity()
    usuario = Usuario.query.get(current_user_id)
    return usuario and usuario.nivel_acesso >= 3  # Admin Cidade ou Admin Global

@equipamentos_bp.route('/', methods=['GET'])
@jwt_required()
def listar_equipamentos():
    try:
        equipamentos = Equipamento.query.filter_by(status='ativo').all()
        return jsonify([equipamento.to_dict() for equipamento in equipamentos]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@equipamentos_bp.route('/', methods=['POST'])
@jwt_required()
def criar_equipamento():
    try:
        if not verificar_permissao_admin():
            return jsonify({'error': 'Permissão negada'}), 403
        
        data = request.get_json()
        
        novo_equipamento = Equipamento(
            nome=data.get('nome'),
            descricao=data.get('descricao'),
            status=data.get('status', 'ativo')
        )
        
        db.session.add(novo_equipamento)
        db.session.commit()
        
        # Registrar auditoria
        registrar_auditoria(
            usuario_id=get_jwt_identity(),
            acao='CREATE',
            tabela='equipamentos',
            registro_id=novo_equipamento.id,
            dados_novos=novo_equipamento.to_dict(),
            ip_origem=request.remote_addr
        )
        
        return jsonify(novo_equipamento.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@equipamentos_bp.route('/<int:equipamento_id>', methods=['PUT'])
@jwt_required()
def atualizar_equipamento(equipamento_id):
    try:
        if not verificar_permissao_admin():
            return jsonify({'error': 'Permissão negada'}), 403
        
        equipamento = Equipamento.query.get_or_404(equipamento_id)
        dados_antigos = equipamento.to_dict()
        
        data = request.get_json()
        
        equipamento.nome = data.get('nome', equipamento.nome)
        equipamento.descricao = data.get('descricao', equipamento.descricao)
        equipamento.status = data.get('status', equipamento.status)
        
        db.session.commit()
        
        # Registrar auditoria
        registrar_auditoria(
            usuario_id=get_jwt_identity(),
            acao='UPDATE',
            tabela='equipamentos',
            registro_id=equipamento.id,
            dados_antigos=dados_antigos,
            dados_novos=equipamento.to_dict(),
            ip_origem=request.remote_addr
        )
        
        return jsonify(equipamento.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@equipamentos_bp.route('/<int:equipamento_id>', methods=['DELETE'])
@jwt_required()
def deletar_equipamento(equipamento_id):
    try:
        if not verificar_permissao_admin():
            return jsonify({'error': 'Permissão negada'}), 403
        
        equipamento = Equipamento.query.get_or_404(equipamento_id)
        dados_antigos = equipamento.to_dict()
        
        # Soft delete - marcar como inativo
        equipamento.status = 'inativo'
        db.session.commit()
        
        # Registrar auditoria
        registrar_auditoria(
            usuario_id=get_jwt_identity(),
            acao='DELETE',
            tabela='equipamentos',
            registro_id=equipamento.id,
            dados_antigos=dados_antigos,
            dados_novos=equipamento.to_dict(),
            ip_origem=request.remote_addr
        )
        
        return jsonify({'message': 'Equipamento inativado com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@equipamentos_bp.route('/<int:equipamento_id>/profissionais', methods=['GET'])
@jwt_required()
def listar_profissionais_por_equipamento(equipamento_id):
    try:
        from src.models.database import Profissional
        
        equipamento = Equipamento.query.get_or_404(equipamento_id)
        
        # Filtrar por status (ativo/inativo)
        status = request.args.get('status', 'ativo')
        if status == 'ativo':
            profissionais = Profissional.query.filter_by(equipamento_id=equipamento_id, ativo=True).all()
        elif status == 'inativo':
            profissionais = Profissional.query.filter_by(equipamento_id=equipamento_id, ativo=False).all()
        else:
            profissionais = Profissional.query.filter_by(equipamento_id=equipamento_id).all()
        
        return jsonify({
            'equipamento': equipamento.to_dict(),
            'profissionais': [prof.to_dict() for prof in profissionais]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

