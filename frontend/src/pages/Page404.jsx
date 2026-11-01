import { useNavigate } from "react-router-dom"

export default function Page404() {

    const navigate = useNavigate();

    return (
        <>
            <h1>Pagina 404</h1>
            <button onClick={() => navigate('/home')}>Torna alla home</button>
        </>
    )
}