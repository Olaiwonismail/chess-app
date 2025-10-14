import { Chessboard } from "react-chessboard";
import { useState } from "react";
export default function ChessGame() {
 
  const baseUrl = "http://localhost:5000";
  
  const [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  let move_ = "";
  let move = "";

   function movePiece(move: string) {
  fetch("http://localhost:5000/move", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      'move': move, // e.g., "e2e4"
      'fen': fen,   // current board FEN
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
      
        setFen(data.board);
        // setTurn(data.turn);
      } else {
        console.error("Move failed:", data.error);
      }
    })
    .catch((err) => console.error("Request error:", err));
}



//     const onPieceDrop = ({ sourceSquare, targetSquare,piece }: { sourceSquare: string; targetSquare: string }) => {
//       move_ = `${sourceSquare}${targetSquare}`
//       console.log(move_)
//   return true;
// };

    
    
  const chessboardOptions = {
    id: "main-chessboard",
    // position: fen,
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
    // onPieceDrop
    // Arrow example
    
    
  };

  return <Chessboard options={chessboardOptions} />;
}

