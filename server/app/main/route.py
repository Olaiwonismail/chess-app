from flask import Blueprint, jsonify, request
import chess
from flask_socketio import emit
from app.app import socketio
main_bp = Blueprint('main', __name__)
state_=chess.Board().fen()
game_data = {
    'board': state_,
    'turn': 'white',
}

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
    return jsonify(game_data)

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
            # game_data['turn'] = 'white' if board.turn == chess.WHITE else 'black'
            print(game_data['board'])
            return jsonify({'message': 'Move accepted', 'board': game_data['board'], 'turn': game_data['turn'],'success': True})
        else:
            return jsonify({'error': 'Illegal move'}), 400
    except ValueError:
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



# Example in your blueprint or separate socket module
@socketio.on("move_piece")
def handle_move(data):

    move_uci = data.get("move")
    fen_ = game_data.get('board')
    board = chess.Board(fen=fen_)

    if board.is_checkmate():
        print("Checkmate!")

    try:
        move = chess.Move.from_uci(move_uci)
        if move in board.legal_moves:
            board.push(move)
            game_data['board'] = board.fen()
            # Optional: update turn if you store it
            # game_data['turn'] = 'white' if board.turn == chess.WHITE else 'black'
            print(game_data['board'])

            # Emit the updated board to all connected clients
            socketio.emit(
                "board_update",
                {
                    "board": game_data['board'],
                    "turn": game_data['turn'],
                    "success": True
                }
            )
        else:
            # Send error back to the sender only
            socketio.emit(
                "illegal_move",
                {"error": "Illegal move"},
                room=request.sid
            )
    except ValueError:
        socketio.emit(
            "illegal_move",
            {"error": "Invalid move format"},
            room=request.sid
        )
