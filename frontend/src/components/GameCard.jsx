import { Link } from "react-router-dom";
import api from "../api";
import { Star, StarFill } from "react-bootstrap-icons";
import { useAuth } from "../contexts/AuthContext";
import { useGlobal } from "../contexts/GlobalContext";

export default function Gamecard({ game }) {

    const { user, favs, setFavs } = useAuth();
    const { setPopup } = useGlobal();

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
        <div className="card">
            <Link to={`/rules/${game.game_slug}`} className=" text-decoration-none text-black" >
                <h1>{game.title}</h1>
                <div>Giocatori minimi: {game.min_players}</div>
            </Link>
            {
                favs.includes(game.game_slug) ?
                    <button className=" btn" onClick={() => removeFav(game.game_slug)}><StarFill /></button>
                    :

                    <>
                        {user.account_type === 'guest' ?
                            <button className=" btn" onClick={() => { setPopup('Per aggiungere ai preferiti devi creare un account') }}><Star /></button>
                            :
                            <button className=" btn" onClick={() => addToFavs(game.game_slug)}><Star /></button>
                        }
                    </>

            }
        </div>
    )
}