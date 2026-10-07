import HomeBanner from "../components/HomeBanner"
import Gamecard from "../components/GameCard"

export default function HomePage() {

    //API call to get index games

    return (
        <>
            <h1>Home Page</h1>
            <HomeBanner />

            {/* renderizzo le card dei giochi sulla base dei dati estratti dalla api call */}
        </>

    )
}