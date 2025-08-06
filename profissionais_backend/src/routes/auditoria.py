from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.database import db, Auditoria, Usuario

auditoria_bp = Blueprint('auditoria', __name__)

def verificar_permissao_admin():
    current_user_id = get_jwt_identity()
    usuario = Usuario.query.get(current_user_id)
    return usuario and usuario.nivel_acesso >= 3  # Admin Cidade ou Admin Global

@auditoria_bp.route('/', methods=['GET'])
@jwt_required()
def listar_auditoria():
    try:
        if not verificar_permissao_admin():
            return jsonify({'error': 'Permissão negada'}), 403
        
        # Parâmetros de filtro
        tabela = request.args.get('tabela')
        acao = request.args.get('acao')
        usuario_id = request.args.get('usuario_id')
        data_inicio = request.args.get('data_inicio')
        data_fim = request.args.get('data_fim')
        
        query = Auditoria.query
        
        if tabela:
            query = query.filter_by(tabela=tabela)
        
        if acao:
            query = query.filter_by(acao=acao)
        
        if usuario_id:
            query = query.filter_by(usuario_id=int(usuario_id))
        
        if data_inicio:
            from datetime import datetime
            data_inicio_dt = datetime.strptime(data_inicio, '%Y-%m-%d')
            query = query.filter(Auditoria.data_hora >= data_inicio_dt)
        
        if data_fim:
            from datetime import datetime
            data_fim_dt = datetime.strptime(data_fim, '%Y-%m-%d')
            query = query.filter(Auditoria.data_hora <= data_fim_dt)
        
        # Ordenar por data mais recente
        auditorias = query.order_by(Auditoria.data_hora.desc()).limit(1000).all()
        
        return jsonify([auditoria.to_dict() for auditoria in auditorias]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auditoria_bp.route('/estatisticas', methods=['GET'])
@jwt_required()
def estatisticas_auditoria():
    try:
        if not verificar_permissao_admin():
            return jsonify({'error': 'Permissão negada'}), 403
        
        from sqlalchemy import func
        
        # Contagem por ação
        acoes = db.session.query(
            Auditoria.acao,
            func.count(Auditoria.id).label('total')
        ).group_by(Auditoria.acao).all()
        
        # Contagem por tabela
        tabelas = db.session.query(
            Auditoria.tabela,
            func.count(Auditoria.id).label('total')
        ).group_by(Auditoria.tabela).all()
        
        # Contagem por usuário
        usuarios = db.session.query(
            Usuario.nome_completo,
            func.count(Auditoria.id).label('total')
        ).join(Auditoria, Usuario.id == Auditoria.usuario_id)\
         .group_by(Usuario.nome_completo).all()
        
        return jsonify({
            'acoes': [{'acao': acao, 'total': total} for acao, total in acoes],
            'tabelas': [{'tabela': tabela, 'total': total} for tabela, total in tabelas],
            'usuarios': [{'usuario': nome, 'total': total} for nome, total in usuarios]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

