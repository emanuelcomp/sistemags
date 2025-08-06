from src.models.database import db, Auditoria

def registrar_auditoria(usuario_id, acao, tabela, registro_id, dados_antigos=None, dados_novos=None, ip_origem=None):
    """
    Registra uma ação de auditoria no banco de dados.
    
    Args:
        usuario_id (int): ID do usuário que realizou a ação
        acao (str): Tipo de ação (CREATE, UPDATE, DELETE)
        tabela (str): Nome da tabela afetada
        registro_id (int): ID do registro afetado
        dados_antigos (dict): Dados antes da alteração (opcional)
        dados_novos (dict): Dados após a alteração (opcional)
        ip_origem (str): IP de origem da requisição (opcional)
    """
    try:
        auditoria = Auditoria(
            usuario_id=usuario_id,
            acao=acao,
            tabela=tabela,
            registro_id=registro_id,
            dados_antigos=dados_antigos,
            dados_novos=dados_novos,
            ip_origem=ip_origem
        )
        
        db.session.add(auditoria)
        db.session.commit()
        
    except Exception as e:
        # Em caso de erro na auditoria, não deve interromper a operação principal
        print(f"Erro ao registrar auditoria: {str(e)}")
        db.session.rollback()

