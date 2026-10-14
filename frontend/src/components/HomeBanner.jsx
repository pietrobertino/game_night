import { Link } from "react-router-dom"

export default function HomeBanner() {

    return (
        <nav className="home-banner">
            <button className="home-banner__item" aria-label="Cerca">
                <i className="bi bi-search"></i>
            </button>
            <button className="home-banner__item" aria-label="Preferiti">
                <i className="bi bi-star"></i>
            </button>
            <Link to='/accounts' className="home-banner__item" aria-label="Profilo">
                <i className="bi bi-person-circle"></i>
            </Link>
        </nav>
    )
}
