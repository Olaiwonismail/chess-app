from flask import Blueprint, request, jsonify

user_bp = Blueprint('user', __name__)

@user_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    # Add registration logic here
    return jsonify({'message': 'User registered successfully'})

@user_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    # Add login logic here
    return jsonify({'token': 'sample_jwt_token'})