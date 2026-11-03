import HomeBanner from "../components/HomeBanner"
import Gamecard from "../components/GameCard"
import LobbyBanner from "../components/LobbyBanner"
import api from "../api"
import { useEffect, useState } from "react"
import { useGlobal } from "../contexts/GlobalContext"

export default function HomePage() {

    const [games, setGames] = useState([]);

    const { showFavs } = useGlobal();

    //API call to get index games
    useEffect(() => {
        let url;
        if (showFavs) url = `/games/favourites`;
        else url = `/games`;
        api.get(url)
            .then(res => { setGames(res.data) })
            .catch(err => console.error(err));

    }, [showFavs])

    return (
        <>
            <LobbyBanner />
            <h1>Home Page</h1>
            <HomeBanner />
            {/* renderizzo le card dei giochi sulla base dei dati estratti dalla api call */}
            {(games.length === 0 && showFavs)
                ?
                <h4 className=" text-center text-danger">Non hai giochi preferiti</h4>
                :
                games.map(game => (

                    <Gamecard key={game.id} game={game} />
                ))
            }
        </>

    )
}