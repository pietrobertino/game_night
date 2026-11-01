import { Link, useParams } from "react-router-dom"
import api from "../api";
import { useEffect, useState } from "react";
import { useGlobal } from "../contexts/GlobalContext";

export default function PreGamePage() {

    const { admin, lobbyCode } = useGlobal();

    const { gameSlug } = useParams();
    const [gameData, setGameData] = useState({});

    const permitted = (admin && lobbyCode);

    useEffect(() => {
        api.get(`/games/${gameSlug}`)
            .then(res => { console.log(res.data); setGameData(res.data[0]) })
            .catch(err => console.error(err))
    }, [])

    //al click del pulsante (verificando che chi lo preme abbia i permessi) dovrei avvaire il gioco, spostare tutti i membri della lobby alla GamePage e mostrare le schermate corrette

    return (
        <>
            <h1>{gameData.title}</h1>
            <div>{gameData.description}</div>
            <div>Giocatori minimi: {gameData.min_players}</div>
            <div className=" text-center">
                <Link to={`/games/${gameSlug}`} className=" text-decoration-none text-black"><button className=" btn btn-secondary" disabled={!permitted}>Gioca</button></Link >
                {!permitted && <div className=" text-warning">Puoi avviare il gioco solo se sei l'host di una lobby</div>}
            </div>
        </>
    )
}