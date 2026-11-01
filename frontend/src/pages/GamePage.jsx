import { useParams } from "react-router-dom"

export default function GamePage() {

    const { gameSlug } = useParams();

    return (
        <h1>Gioco {gameSlug}</h1>
    )
}