from flask import Flask
from config import Config
from flask_cors import CORS
from flask_socketio import SocketIO


socketio = SocketIO(cors_allowed_origins="*") 

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    CORS(app)
    socketio.init_app(app)
   
    # Register blueprints
    from app.main.route import main_bp
    from app.user.route import user_bp  
    from app.validation.route import validation_bp
    
    app.register_blueprint(main_bp)
    app.register_blueprint(user_bp, url_prefix='/user')
    app.register_blueprint(validation_bp, url_prefix='/validate')

    return app