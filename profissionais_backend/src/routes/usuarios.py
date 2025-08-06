from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import bcrypt
from src.models.database import db, Usuario
from src.utils.auditoria import registrar_auditoria

usuarios_bp = Blueprint('usuarios', __name__)

def verificar_permissao_admin():
    current_user_id = get_jwt_identity()
    usuario = Usuario.query.get(current_user_id)
    return usuario and usuario.nivel_acesso >= 3  # Admin Cidade ou Admin Global

def verificar_permissao_admin_global():
    current_user_id = get_jwt_identity()
    usuario = Usuario.query.get(current_user_id)
    return usuario and usuario.nivel_acesso == 4  # Apenas Admin Global

@usuarios_bp.route('/', methods=['GET'])
@jwt_required()
def listar_usuarios():
    try:
        if not verificar_permissao_admin():
            return jsonify({'error': 'Permissão negada'}), 403
        
        current_user_id = get_jwt_identity()
        usuario_atual = Usuario.query.get(current_user_id)
        
        query = Usuario.query
        
        # Admin Cidade só vê usuários da sua cidade
        if usuario_atual.nivel_acesso == 3 and usuario_atual.cidade_id:
            query = query.filter_by(cidade_id=usuario_atual.cidade_id)
        
        usuarios = query.all()
        return jsonify([usuario.to_dict() for usuario in usuarios]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@usuarios_bp.route('/', methods=['POST'])
@jwt_required()
def criar_usuario():
    try:
        if not verificar_permissao_admin():
            return jsonify({'error': 'Permissão negada'}), 403
        
        data = request.get_json()
        
        # Verificar se o email já existe
        if Usuario.query.filter_by(email=data.get('email')).first():
            return jsonify({'error': 'Email já cadastrado'}), 400
        
        # Verificar se pode criar usuário com esse nível de acesso
        current_user_id = get_jwt_identity()
        usuario_atual = Usuario.query.get(current_user_id)
        
        nivel_acesso_solicitado = data.get('nivel_acesso', 1)
        
        # Admin Cidade não pode criar Admin Global
        if usuario_atual.nivel_acesso == 3 and nivel_acesso_solicitado == 4:
            return jsonify({'error': 'Permissão negada para criar Admin Global'}), 403
        
        # Hash da senha
        senha_hash = bcrypt.hashpw(data.get('senha').encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        novo_usuario = Usuario(
            nome_completo=data.get('nome_completo'),
            email=data.get('email'),
            senha_hash=senha_hash,
            nivel_acesso=nivel_acesso_solicitado,
            cidade_id=data.get('cidade_id')
        )
        
        db.session.add(novo_usuario)
        db.session.commit()
        
        # Registrar auditoria
        registrar_auditoria(
            usuario_id=get_jwt_identity(),
            acao='CREATE',
            tabela='usuarios',
            registro_id=novo_usuario.id,
            dados_novos=novo_usuario.to_dict(),
            ip_origem=request.remote_addr
        )
        
        return jsonify(novo_usuario.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@usuarios_bp.route('/<int:usuario_id>', methods=['PUT'])
@jwt_required()
def atualizar_usuario(usuario_id):
    try:
        if not verificar_permissao_admin():
            return jsonify({'error': 'Permissão negada'}), 403
        
        usuario = Usuario.query.get_or_404(usuario_id)
        dados_antigos = usuario.to_dict()
        
        current_user_id = get_jwt_identity()
        usuario_atual = Usuario.query.get(current_user_id)
        
        # Admin Cidade só pode editar usuários da sua cidade
        if usuario_atual.nivel_acesso == 3:
            if usuario.cidade_id != usuario_atual.cidade_id:
                return jsonify({'error': 'Permissão negada'}), 403
        
        data = request.get_json()
        
        # Atualizar campos
        if 'nome_completo' in data:
            usuario.nome_completo = data['nome_completo']
        if 'email' in data:
            usuario.email = data['email']
        if 'senha' in data:
            usuario.senha_hash = bcrypt.hashpw(data['senha'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        if 'nivel_acesso' in data:
            # Verificar permissão para alterar nível de acesso
            if usuario_atual.nivel_acesso == 3 and data['nivel_acesso'] == 4:
                return jsonify({'error': 'Permissão negada para criar Admin Global'}), 403
            usuario.nivel_acesso = data['nivel_acesso']
        if 'cidade_id' in data:
            usuario.cidade_id = data['cidade_id']
        
        db.session.commit()
        
        # Registrar auditoria
        registrar_auditoria(
            usuario_id=get_jwt_identity(),
            acao='UPDATE',
            tabela='usuarios',
            registro_id=usuario.id,
            dados_antigos=dados_antigos,
            dados_novos=usuario.to_dict(),
            ip_origem=request.remote_addr
        )
        
        return jsonify(usuario.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@usuarios_bp.route('/<int:usuario_id>', methods=['DELETE'])
@jwt_required()
def deletar_usuario(usuario_id):
    try:
        if not verificar_permissao_admin():
            return jsonify({'error': 'Permissão negada'}), 403
        
        usuario = Usuario.query.get_or_404(usuario_id)
        dados_antigos = usuario.to_dict()
        
        current_user_id = get_jwt_identity()
        usuario_atual = Usuario.query.get(current_user_id)
        
        # Não pode deletar a si mesmo
        if usuario_id == current_user_id:
            return jsonify({'error': 'Não é possível deletar seu próprio usuário'}), 400
        
        # Admin Cidade só pode deletar usuários da sua cidade
        if usuario_atual.nivel_acesso == 3:
            if usuario.cidade_id != usuario_atual.cidade_id:
                return jsonify({'error': 'Permissão negada'}), 403
        
        db.session.delete(usuario)
        db.session.commit()
        
        # Registrar auditoria
        registrar_auditoria(
            usuario_id=get_jwt_identity(),
            acao='DELETE',
            tabela='usuarios',
            registro_id=usuario.id,
            dados_antigos=dados_antigos,
            ip_origem=request.remote_addr
        )
        
        return jsonify({'message': 'Usuário deletado com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

