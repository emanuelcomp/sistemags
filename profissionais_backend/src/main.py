import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from src.models.database import db
from src.routes.auth import auth_bp
from src.routes.cidades import cidades_bp
from src.routes.equipamentos import equipamentos_bp
from src.routes.profissionais import profissionais_bp
from src.routes.usuarios import usuarios_bp
from src.routes.auditoria import auditoria_bp
from src.routes.relatorios import relatorios_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'
app.config['JWT_SECRET_KEY'] = 'jwt-secret-string'

# Configuração CORS
CORS(app, origins="*")

# Configuração JWT
jwt = JWTManager(app)

# Registrar blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(cidades_bp, url_prefix='/api/cidades')
app.register_blueprint(equipamentos_bp, url_prefix='/api/equipamentos')
app.register_blueprint(profissionais_bp, url_prefix='/api/profissionais')
app.register_blueprint(usuarios_bp, url_prefix='/api/usuarios')
app.register_blueprint(auditoria_bp, url_prefix='/api/auditoria')
app.register_blueprint(relatorios_bp, url_prefix='/api/relatorios')

# Configuração do banco de dados
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)
migrate = Migrate(app, db)

with app.app_context():
    db.create_all()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
