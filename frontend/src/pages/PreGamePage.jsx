import { Link, useParams } from "react-router-dom"
import api from "../api";
import { useEffect, useState } from "react";
import { useLobby } from "../contexts/LobbyContext";
import Loader from "../components/Loader";
import SettingsPopup from "../components/SettingsPopup"
import gameSettings from "../data/gameSettings"
import { People, Pencil } from "react-bootstrap-icons";

export default function PreGamePage() {

    const { admin, lobbyCode } = useLobby();

    const { gameSlug } = useParams();
    const [gameData, setGameData] = useState({});

    const permitted = (admin && lobbyCode);

    const [showSettings, setShowSettings] = useState(false)
    const settingsFields = gameSettings[gameSlug]     // undefined se il gioco non ha impostazioni

    useEffect(() => {
        api.get(`/games/${gameSlug}`)
            .then(res => { console.log(res.data); setGameData(res.data[0]) })
            .catch(err => console.error(err))
    }, [])

    //al click del pulsante (verificando che chi lo preme abbia i permessi) dovrei avvaire il gioco, spostare tutti i membri della lobby alla GamePage e mostrare le schermate corrette

    // impostazioni scelte nel popup, es. { impostors: 1, impostorHint: false }
    function saveSettings(settings) {
        setShowSettings(false)
    }

    return (
        <div className="pregame-page">
            {
                Object.keys(gameData).length > 0 ?
                    <>
                        <section className="pregame-page__top">
                            <h1 className="pregame-page__name">{gameData.title}</h1>
                            <p className="pregame-page__players">
                                <span>Min {gameData.min_players}</span>
                                <People />
                            </p>
                        </section>
                        <section>
                            <div className="pregame-page__rules-head">
                                <h2 className="pregame-page__title">Regole</h2>
                                {settingsFields && (
                                    <button type="button" className="pregame-page__edit" onClick={() => setShowSettings(true)} aria-label="Modifica impostazioni">
                                        <Pencil />
                                    </button>
                                )}
                            </div>
                            <p className="pregame-page__rules">{gameData.description}</p>
                        </section>
                        <div className=" text-center">
                            <Link to={`/games/${gameSlug}`} className="btn-pill btn-pill--orange pregame-page__play"><button className=" btn btn-secondary" disabled={!permitted}>Gioca</button></Link >
                            {!permitted && <div className=" text-warning">Puoi avviare il gioco solo se sei l'host di una lobby</div>}
                        </div>
                        {
                            showSettings &&
                            <SettingsPopup fields={settingsFields} onClose={() => setShowSettings(false)} onSave={saveSettings} />
                        }
                    </>
                    :
                    <Loader />
            }
        </div>

    )
}
