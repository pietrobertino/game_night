import { Link } from "react-router-dom"
import { Person, Star, StarFill, Search } from "react-bootstrap-icons"
import { useAuth } from "../contexts/AuthContext"
import { useSearch } from "../contexts/SearchContext";
import { usePopup } from "../contexts/PopupContext";
import { useLobby } from "../contexts/LobbyContext";

export default function HomeBanner() {

    const { lobbyCode } = useLobby();
    const { setPopup } = usePopup();
    const { user } = useAuth();
    const { showSearch, setShowSearch, showFavs, setSearchParams, setSearch } = useSearch();

    //modifico url se ho preferiti o no
    const handleFavsToggle = () => {
        setSearchParams(prev => {
            if (!showFavs) {
                prev.set('favourites', 'true');
            } else {
                prev.delete('favourites');
            }
            return prev;
        });
    };

    return (

        <nav className="home-banner">

            <button aria-label="Cerca" className="btn text-white home-banner__item" onClick={() => { if (showSearch) { setSearchParams(prev => prev.delete('search')); setSearch('') }; setShowSearch(!showSearch) }}><Search /></button>
            {
                user?.account_type === 'guest' ?
                    <button aria-label="Preferiti" className=" btn text-white  home-banner__item" onClick={() => { setPopup('Per usare la funzione dei preferiti devi crare un account brother') }}><Star /></button>
                    :
                    <button aria-label="Preferiti" className=" btn text-white  home-banner__item" onClick={handleFavsToggle}>{showFavs ? <StarFill /> : <Star />}</button>
            }
            {
                lobbyCode ?
                    <button aria-label="Profilo" className=" btn text-white home-banner__item " onClick={() => setPopup('Per accedere alla gestione del profilo non devi far parte di una lobby!')}><Person /></button>
                    :
                    <Link aria-label="Profilo" className="home-banner__item " to={`/account`} ><Person /></Link>
            }

        </nav>

    )
}

