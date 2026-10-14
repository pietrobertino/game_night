import HomeBanner from "../components/HomeBanner"
import Gamecard from "../components/GameCard"

export default function HomePage() {

    //API call to get index games
    const games = []

    return (
        <main className="home-page">
            <h2 className="home-page__title">Scegli una modalità</h2>

            {/* renderizzo le card dei giochi sulla base dei dati estratti dalla api call */}
            <div className="game-list">
                {games.map(game => (
                    <Gamecard key={game.id} gameInfo={game} />
                ))}
            </div>

            <HomeBanner />
        </main>
    )
}
