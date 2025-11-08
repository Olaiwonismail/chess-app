import { useParams } from "react-router";

export default function ChessGame() {
    console.log("useParams", useParams());

  const { id } = useParams();
  return <h1>Chess G{id}</h1>;
}
