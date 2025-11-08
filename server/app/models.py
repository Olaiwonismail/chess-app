import chess
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
from app.app import db

class Game(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    fen = db.Column(db.String(100), nullable=False, default=chess.Board().fen())
    turn = db.Column(db.String(5), nullable=False, default='white')
    checkmate = db.Column(db.Boolean, default=False)
    player_white = db.Column(db.String(50), nullable=True)
    player_black = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'fen': self.fen,
            'turn': self.turn,
            'checkmate': self.checkmate,
            'player_white': self.player_white,
            'player_black': self.player_black,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }