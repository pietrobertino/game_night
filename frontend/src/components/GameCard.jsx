import { Link } from "react-router-dom";

export default function Gamecard() {
const gameInfo ="placeholder"
    return (
        <article className="game-card" style={{ backgroundImage: `url(/images/games/${gameInfo}.png)` }}>
            <Link to={`/rules/${gameInfo}`} className="game-card__link">
                <h3 className="game-card__title">{gameInfo}</h3>
                <p className="game-card__players">
                    <i className="bi bi-people"></i>
                    <span>Min {gameInfo}</span>
                </p>
            </Link>

            <button type="button" className="game-card__fav" aria-label="Preferiti">
                <i className="bi bi-star"></i>
            </button>
        </article>
    )
}
