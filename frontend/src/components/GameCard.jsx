import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { Star, StarFill, People } from "react-bootstrap-icons";
import { useAuth } from "../contexts/AuthContext";
import { usePopup } from "../contexts/PopupContext";

export default function Gamecard({ game }) {
    const { user, favs, setFavs } = useAuth();
    const { setPopup } = usePopup();
    const [pressing, setPressing] = useState(false);

    const isFav = favs.includes(game.game_slug);

    function addToFavs(slug) {
        api.post(`games/addFavourite/${slug}`)
            .then(() => setFavs([...favs, slug]))
            .catch(err => console.error(err));
    }

    function removeFav(slug) {
        api.delete(`games/removeFavourite/${slug}`)
            .then(() => setFavs(favs.filter(fav => fav !== slug)))
            .catch(err => console.error(err));
    }

    function handleFavClick(e) {
        e.stopPropagation();
        if (isFav) return removeFav(game.game_slug);
        if (user?.account_type === "guest") return setPopup("Per aggiungere ai preferiti devi creare un account");
        addToFavs(game.game_slug);
    }

    return (
        <div
            className={`game-card ${pressing ? "is-pressing" : ""}`}
            style={{ backgroundImage: `url(${game.game_image})` }}
            onPointerDown={() => setPressing(true)}
            onPointerUp={() => setPressing(false)}
            onPointerLeave={() => setPressing(false)}
            onPointerCancel={() => setPressing(false)}
        >
            <Link to={`/rules/${game.game_slug}`} className="game-card__link">
                <h3 className="game-card__title">{game.title}</h3>
                <div className="game-card__players">
                    <People />
                    <span>Min {game.min_players}</span>
                </div>
            </Link>
            <button
                type="button"
                className={`game-card__fav ${isFav ? "is-active" : ""}`}
                onPointerDown={(e) => { e.stopPropagation(); setPressing(false); }}
                onClick={handleFavClick}
                aria-label="Preferiti"
            >
                {isFav ? <StarFill /> : <Star />}
            </button>
        </div>
    );
}