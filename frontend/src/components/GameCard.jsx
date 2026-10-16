import { Link } from "react-router-dom";

export default function Gamecard({ game }) {



    return (
        <Link to={`/rules/${game.game_slug}`} className=" text-decoration-none" >
            <div className="card">
                <h1>{game.title}</h1>
                <div>Giocatori minoimi: {game.min_players}</div>
            </div>
        </Link>
    )
}