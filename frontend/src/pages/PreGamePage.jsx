import { Link, useParams } from "react-router-dom"
import api from "../api";
import { useEffect, useState } from "react";

export default function PreGamePage() {

    const { gameSlug } = useParams();
    const [gameData, setGameData] = useState({});

    useEffect(() => {
        api.get(`/games/${gameSlug}`)
            .then(res => { console.log(res.data); setGameData(res.data[0]) })
            .catch(err => console.error(err))
    }, [])

    //sulla base dei diritti del giocatore (host/guest) (per cui uso un context) decido cosa mostrare

    return (
        <>
            <h1>{gameData.title}</h1>
            <div>{gameData.description}</div>
            <div>Giocatori minimi: {gameData.min_players}</div>
            <button><Link className=" text-decoration-none">Gioca</Link ></button>
        </>
    )
}