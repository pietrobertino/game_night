import HomeBanner from "../components/HomeBanner"
import Gamecard from "../components/GameCard"
import LobbyBanner from "../components/LobbyBanner"
import api from "../api"
import { useEffect, useState } from "react"

export default function HomePage() {

    const [games, setGames] = useState([]);

    //API call to get index games
    useEffect(() => {
        api.get('/games')
            .then(res => setGames(res.data))
            .catch(err => console.error(err));
    }, [])

    return (
        <>
            <LobbyBanner />
            <h1>Home Page</h1>
            <HomeBanner />
            {/* renderizzo le card dei giochi sulla base dei dati estratti dalla api call */}
            {games.map(game => (

                <Gamecard key={game.id} game={game} />
            ))}
        </>

    )
}