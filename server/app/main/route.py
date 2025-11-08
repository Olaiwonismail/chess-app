from flask import Blueprint, jsonify, request
import chess
from flask_socketio import SocketIO, join_room, emit
import random
import string
from app.app import socketio,db
main_bp = Blueprint('main', __name__)
state_=chess.Board().fen()
from app.models import Game

@main_bp.route('/')
def index():
    return jsonify({'message': 'Welcome to the API'})

@main_bp.route('/health')
def health():
    return jsonify({'status': 'healthy'})

@main_bp.route('/new_game', methods=['POST'])
def new_game(data):
    # game_data = data.get_json()

    return jsonify({'message': 'New game started'})

@main_bp.route('/game_state', methods=['GET'])
def game_state(): 
    board = chess.Board(fen=game_data['fen'])
    
    if board.is_checkmate():
        
        return jsonify({'board': game_data['fen'],  'checkmate': True, 'success': True})  
    else:
        return jsonify({'board': game_data['fen'],  'checkmate': False, 'success': True,'turn': game_data['turn']})
    # return jsonify(game_data)

@main_bp.route('/move', methods=['POST'])
def move():
    move_data = request.get_json()
    move_uci = move_data.get('move')
    fen_ = move_data.get('fen')
    board = chess.Board(fen=fen_)
    if board.is_checkmate():
        print("Checkmate!")
    try:
        move = chess.Move.from_uci(move_uci)
        if move in board.legal_moves:
            board.push(move)
            game_data['board'] = board.fen()
            game_data['turn'] = 'white' if board.turn == chess.WHITE else 'black'
            print(game_data['turn'])
            # game_data['turn'] = 'white' if board.turn == chess.WHITE else 'black'
            print(game_data['board'])
            return jsonify({'message': 'Move accepted', 'board': game_data['board'], 'turn': game_data['turn'],'success': True})
        else:
            print('jii')
            return jsonify({'error': 'Illegal move'}), 400
    except ValueError:
        print(move_uci)
        return jsonify({'error': 'Invalid move format'}), 400
    # return jsonify({'message': 'Move endpoint hit'})


@main_bp.route('/get_possible_moves',methods=['GET'])
def get_possible_moves():  
    # move_data = game_data
    fen_ = game_data.get('board')
    board = chess.Board(fen=fen_)
    possible_moves = [move.uci() for move in board.legal_moves]
    return jsonify({'possible_moves': possible_moves})

@main_bp.route('/get_possible_moves/<position>', methods=['GET'])
def get_possible_moves_from_position(position): 
    board = chess.Board()
    square = chess.parse_square(position)
    piece = board.piece_at(square)
    if piece is None:
        return jsonify({'error': 'No piece at the given position'}), 400
    possible_moves = [move.uci() for move in board.legal_moves if move.from_square == square]
    return jsonify({'possible_moves': possible_moves})    

@socketio.on('connect')
def handle_connect():
    print("Client connected")
    emit('message', {'msg': 'Welcome!'})  # send data to client on connect

@socketio.on('create_game')
def on_create_game(data):
    creator = data.get('creator')
    game = Game()
    game.player_white = creator
    db.session.add(game)
    db.session.commit()
    emit('game_created', {'game_id': game.id})

@socketio.on('join_room')
def on_join(data):
    game = data.get('roomCode')
    
    # game = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    game = Game.query.filter_by(id=game).first()
    if not game:
        emit('error', {'error': 'Game not found'})
        return
    if game.player_black:
        emit('error', {'error': 'Game is full'})
        return
    game.player_black = data.get('player')
    join_room(game.id)
    # emit('info', {'msg': f'Joined room: {game.id}'}, room=game.id)
    
    emit('room_joined', {'msg': f'Joined room: {game.id}'}, room=game.id)
    print(f"Client joined room: {game.id}")

@socketio.on('make_move')
def handle_move(data):
    move_uci = data.get('move')
    fen_ = data.get('fen')
    game_id = data.get('game_id')
    game = Game.query.filter_by(id=game_id).first()
    if not game:
        emit('error', {'error': 'Game not found'})
        return
    board = chess.Board(fen=fen_)

    try:
        move = chess.Move.from_uci(move_uci)
        if move in board.legal_moves:
            board.push(move)
            game.fen = board.fen()
            game.turn = 'white' if board.turn == chess.WHITE else 'black'
            game.checkmate = board.is_checkmate()
            
            emit('move_made', {
                'message': 'Move accepted',
                'fen': game.fen,
                'turn': game.turn,
                'checkmate': game.checkmate,
                'success': True
            }, broadcast=True)
            db.session.commit()

        else:
            emit('error', {'error': 'Illegal move'})
    except ValueError:
        emit('error', {'error': 'Invalid move format'})
