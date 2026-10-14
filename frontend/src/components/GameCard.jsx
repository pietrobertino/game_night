import { Link } from "react-router-dom";

export default function Gamecard({ gameInfo }) {

    return (
        <article className="game-card" style={{ backgroundImage: `url(/images/games/${gameInfo.slug}.png)` }}>
            <Link to={`/rules/${gameInfo.slug}`} className="game-card__link">
                <h3 className="game-card__title">{gameInfo.title}</h3>
                <p className="game-card__players">
                    <i className="bi bi-people"></i>
                    <span>Min {gameInfo.min_players}</span>
                </p>
            </Link>

            <button type="button" className="game-card__fav" aria-label="Preferiti">
                <i className="bi bi-star"></i>
            </button>
        </article>
    )
}
