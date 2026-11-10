import { Link } from "react-router-dom"
import { Person, Star, StarFill, Search } from "react-bootstrap-icons"
import { useAuth } from "../contexts/AuthContext"
import { useGlobal } from "../contexts/GlobalContext";
import { useSearch } from "../contexts/SearchContext";

export default function HomeBanner() {

    const { setPopup } = useGlobal();
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

        <div className="fixed-bottom z-3 d-flex justify-content-center mb-5">
            <div className="alert alert-success alert-dismissible fade show m-0 shadow d-flex justify-content-between align-items-center rounded-pill" style={{ maxWidth: '500px', width: '90%' }}>
                <button className="btn" onClick={() => { if (showSearch) { setSearchParams(prev => prev.delete('search')); setSearch('') }; setShowSearch(!showSearch) }}><Search /></button>
                {
                    user?.account_type === 'guest' ?
                        <Link className=" text-decoration-none text-black" to={`/account`} onClick={() => { setPopup('Per usare la funzione dei preferiti devi crare un account brother') }}><Star /></Link>
                        :
                        <button className=" btn" onClick={handleFavsToggle}>{showFavs ? <StarFill /> : <Star />}</button>
                }
                <Link className=" text-decoration-none text-black" to={`/account`} ><Person /></Link>
            </div>
        </div>

    )
}

