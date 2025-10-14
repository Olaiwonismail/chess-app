from flask import Blueprint, jsonify

validation_bp = Blueprint('validation', __name__)

@validation_bp.route('/')
def index():
    return jsonify({'message': 'Welcome to the Validation API'})

