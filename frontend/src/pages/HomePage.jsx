import HomeBanner from "../components/HomeBanner"
import Gamecard from "../components/GameCard"
import LobbyBanner from "../components/LobbyBanner"
import api from "../api"
import { useEffect, useState } from "react"
import SearchBar from "../components/SearchBar"
import { useSearch } from "../contexts/SearchContext"
import Loader from '../components/Loader'

export default function HomePage() {

    const [games, setGames] = useState([]);

    const { debouncedSearch, showFavs } = useSearch();



    // Chiamata API con protezione contro le race condition 
    useEffect(() => {
        // Creiamo un controller per questa specifica esecuzione dell'effetto
        const controller = new AbortController();

        api.get('/games', {
            params: { favourites: showFavs, search: debouncedSearch },
            signal: controller.signal // Passiamo il segnale ad Axios
        })
            .then(res => setGames(res.data))
            .catch(err => {
                // Se l'errore è dovuto all'annullamento della chiamata, lo ignoriamo tranquillamente
                if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
                    console.log('Chiamata precedente annullata.');
                    return;
                }
                console.error("Errore nel recupero dei giochi:", err);
            });

        // Cleanup: se l'utente digita di nuovo o cambia showFavs prima che la risposta arrivi,
        // questa funzione abortisce la chiamata in corso.
        return () => {
            controller.abort();
        };
    }, [showFavs, debouncedSearch]);

    return (
        <>
            <SearchBar />
            <LobbyBanner />
            <h1>Home Page</h1>
            <HomeBanner />
            {/* renderizzo le card dei giochi sulla base dei dati estratti dalla api call */}
            {(games.length === 0)
                ?
                <>
                    {
                        (!showFavs && !debouncedSearch) ?
                            <Loader />
                            :
                            <h4 className=" text-center text-danger">{debouncedSearch ? "Nessun risultato trovato" : "Non hai giochi preferiti"}</h4>
                    }
                </>
                :
                games.map(game => (

                    <Gamecard key={game.id} game={game} />
                ))
            }
        </>

    )
}