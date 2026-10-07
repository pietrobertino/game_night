import { Link } from "react-router-dom";

export default function Gamecard({ gameInfo }) {

    return (
        <Link to={`/rules/${gameInfo.slug}`}>
            <div className="card">
                <h1>{gameInfo.title}</h1>
            </div>
        </Link>
    )
}