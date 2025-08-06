from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import bcrypt
from src.models.database import db, Usuario

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        senha = data.get('senha')
        
        if not email or not senha:
            return jsonify({'error': 'Email e senha são obrigatórios'}), 400
        
        usuario = Usuario.query.filter_by(email=email).first()
        
        if not usuario or not bcrypt.checkpw(senha.encode('utf-8'), usuario.senha_hash.encode('utf-8')):
            return jsonify({'error': 'Credenciais inválidas'}), 401
        
        access_token = create_access_token(identity=usuario.id)
        
        return jsonify({
            'access_token': access_token,
            'usuario': usuario.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        current_user_id = get_jwt_identity()
        usuario = Usuario.query.get(current_user_id)
        
        if not usuario:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        return jsonify(usuario.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Verificar se o email já existe
        if Usuario.query.filter_by(email=data.get('email')).first():
            return jsonify({'error': 'Email já cadastrado'}), 400
        
        # Hash da senha
        senha_hash = bcrypt.hashpw(data.get('senha').encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        novo_usuario = Usuario(
            nome_completo=data.get('nome_completo'),
            email=data.get('email'),
            senha_hash=senha_hash,
            nivel_acesso=data.get('nivel_acesso', 1),
            cidade_id=data.get('cidade_id')
        )
        
        db.session.add(novo_usuario)
        db.session.commit()
        
        return jsonify(novo_usuario.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

