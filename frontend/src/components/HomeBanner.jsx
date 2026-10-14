import { Link } from "react-router-dom"

export default function HomeBanner() {

    return (
        <nav className="home-banner">
            <Link to='#' className="home-banner__item" aria-label="Cerca">
                <i className="bi bi-search"></i>
            </Link>
            <Link to='#' className="home-banner__item" aria-label="Preferiti">
                <i className="bi bi-star"></i>
            </Link>
            <Link to='#' className="home-banner__item" aria-label="Profilo">
                <i className="bi bi-person-circle"></i>
            </Link>
        </nav>
    )
}
