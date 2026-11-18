import { Link } from "react-router-dom";
import api from "../api";
import { Star, StarFill, People } from "react-bootstrap-icons";
import { useAuth } from "../contexts/AuthContext";
import { usePopup } from "../contexts/PopupContext";

export default function Gamecard({ game }) {

    const { user, favs, setFavs } = useAuth();
    const { setPopup } = usePopup();

    function addToFavs(slug) {
        api.post(`games/addFavourite/${slug}`)
            .then(res => setFavs([...favs, slug]))
            .catch(err => console.error(err))
    }

    function removeFav(slug) {
        api.delete(`games/removeFavourite/${slug}`)
            .then(res => {
                setFavs(favs.filter(fav => fav !== slug))
            })
            .catch(err => console.error(err))
    }

    return (
        <div className="card game-card" style={{ backgroundImage: `url(${game.game_image})` }}>
            <Link to={`/rules/${game.game_slug}`} className="game-card__link text-decoration-none text-black">
                <h3 className="game-card__title">{game.title}</h3>
                <div className="game-card__players">
                    <People />
                    <span>Min {game.min_players}</span>
                </div>
            </Link>
            {
                favs.includes(game.game_slug) ?
                    <button className=" btn game-card__fav" onClick={() => removeFav(game.game_slug)}><StarFill /></button>
                    :

                    <>
                        {user?.account_type === 'guest' ?
                            <button className=" btn game-card__fav" onClick={() => { setPopup('Per aggiungere ai preferiti devi creare un account') }}><Star /></button>
                            :
                            <button className=" btn game-card__fav" onClick={() => addToFavs(game.game_slug)}><Star /></button>
                        }
                    </>

            }
        </div>
    )
}
