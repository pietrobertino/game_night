import { Link } from "react-router-dom"
import { Person, Star, StarFill, Search } from "react-bootstrap-icons"
import { useAuth } from "../contexts/AuthContext"
import { useSearch } from "../contexts/SearchContext";
import { usePopup } from "../contexts/PopupContext";

export default function HomeBanner() {

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
            <div className="alert alert-success alert-dismissible fade show m-0 shadow d-flex justify-content-between align-items-center rounded-pill" style={{ maxWidth: '500px', width: '90%' }}>
                <button aria-label="Cerca" className="btn home-banner__item" onClick={() => { if (showSearch) { setSearchParams(prev => prev.delete('search')); setSearch('') }; setShowSearch(!showSearch) }}><Search /></button>
                {
                    user?.account_type === 'guest' ?
                        <button aria-label="Preferiti" className=" btn" onClick={() => { setPopup('Per usare la funzione dei preferiti devi crare un account brother') }}><Star /></button>
                        :
                        <button aria-label="Preferiti" className=" btn" onClick={handleFavsToggle}>{showFavs ? <StarFill /> : <Star />}</button>
                }
                <Link aria-label="Profilo" className="home-banner__item text-decoration-none text-black" to={`/account`} ><Person /></Link>
            </div>
        </nav>

    )
}

