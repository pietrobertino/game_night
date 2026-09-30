import { Link } from "react-router-dom"


export default function HomePage() {

    return (
        <>
            <h1 className="">Home Page</h1>
            <Link to="/session">Go to Session Page</Link>
        </>
    )
}