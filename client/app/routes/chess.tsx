import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useState, useRef } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router";
const socket = io("http://localhost:5000");
export default function ChessGame() {
  const chessRef = useRef(new Chess()); 
  // const baseUrl = "http://localhost:5000";
  const { roomId } = useParams();
  console.log("room id", roomId);
  let move_ = "";
  const [fen, setFen] = useState(chessRef.current.fen());
  
  

   function movePiece(move: string) {
    socket.emit("make_move", {
      move: move,
      fen: fen,
    });
  }

  socket.on("move_made", (data) => {
  console.log(data.turn);
  setFen(data.fen);
});



    const onPieceDrop = ({ sourceSquare, targetSquare,piece }: { sourceSquare: string; targetSquare: string; piece: string }) => {
          move_ = `${sourceSquare}${targetSquare}`
          console.log(move_)

      

          // return true;

          const moveObj = chessRef.current.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q", // auto-promote to queen
    });

    if (moveObj) {
      setFen(chessRef.current.fen()); 
          movePiece(move_);

      return true;
    } else {
      console.log("Illegal move");
      return false; // prevents piece from moving
    }
    
  };

    
    
  const chessboardOptions = {
    showAnimations: true,
    animationDurationInMs: 300,
    id: 'show-animations',
    position: fen,
    boardOrientation: "white",
    allowDragging: true,
    allowDragOffBoard: false,
    allowDrawingArrows: true,
    showNotation: true,
    
   

    // Board Styling
    boardStyle: {
      borderRadius: "8px",
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
      maxWidth: "480px",
      margin: "auto",
    },
    lightSquareStyle: { backgroundColor: "#f0d9b5" },
    darkSquareStyle: { backgroundColor: "#b58863" },

    // Optional events
    onPieceDrop
    // Arrow example
    
    
  };

  return <Chessboard options={chessboardOptions}
    
  />;
}

