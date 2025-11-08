import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io("http://localhost:5000");

const RoomAccess = () => {
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      setUsername(savedUsername);
      setIsLoggedIn(true);
    }

    socket.on('game_created', (data) => {
      navigate(`/chess/${data.game_id}`);
    });

    socket.on('room_joined', (data) => {
      navigate(`/chess/${roomCode}`);
    });

    socket.on('error', (data) => {
      alert(data.error);
    });

    return () => {
      socket.off('game_created');
      socket.off('room_joined');
      socket.off('error');
    };
  }, [navigate, roomCode]);

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    if (trimmedUsername) {
      localStorage.setItem('username', trimmedUsername);
      setUsername(trimmedUsername);
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    setUsername('');
    setIsLoggedIn(false);
  };

  const handleCreateRoom = () => {
    if (!isLoggedIn) {
      alert('Please set a username first');
      return;
    }
    socket.emit('create_game', { creator: username });
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      alert('Please set a username first');
      return;
    }
    if (!roomCode.trim()) {
      alert('Please enter a room code');
      return;
    }
    socket.emit('join_room', { 
      roomCode: roomCode.trim(), 
      player: username 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          
          {/* Left Side - User Profile */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👤</span>
              </div>
              
              {isLoggedIn ? (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Welcome back!</h2>
                  <p className="text-blue-100 text-lg">Hi {username}</p>
                  <button
                    onClick={handleLogout}
                    className="bg-white text-blue-600 px-6 py-2 rounded-full font-semibold hover:bg-blue-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUsernameSubmit} className="space-y-4">
                  <h3 className="text-xl font-bold">What should we call you?</h3>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors w-full"
                  >
                    Save Username
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Side - Room Actions */}
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Chess Arena</h1>
              <p className="text-gray-600 mt-2">Play or spectate chess games in real-time</p>
            </div>

            {/* Create Room Card */}
            <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl">➕</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Create New Room</h3>
                <p className="text-gray-600 mb-4">Start a new chess game and invite friends</p>
                <button
                  onClick={handleCreateRoom}
                  disabled={!isLoggedIn}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors w-full"
                >
                  Create Game Room
                </button>
              </div>
            </div>

            {/* Join Room Card */}
            <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-200 hover:border-green-300 transition-colors">
              <form onSubmit={handleJoinRoom} className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Join Room</h3>
                <p className="text-gray-600 mb-4">Enter a room code to join or spectate</p>
                
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  placeholder="Enter room code"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-300 mb-4"
                />
                
                <button
                  type="submit"
                  disabled={!isLoggedIn}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors w-full"
                >
                  Join Room
                </button>
                
                <p className="text-sm text-gray-500 mt-3">
                  If room has 2 players, you'll automatically spectate
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomAccess;