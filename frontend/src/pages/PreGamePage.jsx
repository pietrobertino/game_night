import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import SettingsPopup from "../components/SettingsPopup"
import gameSettings from "../data/gameSettings"

export default function PreGamePage() {

    const { gameSlug } = useParams();
    const [showSettings, setShowSettings] = useState(false)
    const settingsFields = gameSettings[gameSlug]     // undefined se il gioco non ha impostazioni

    //chiamta api show game basata sul game slug
    const title = ""
    const minPlayers = null
    const rules = ""        // description

    //sulla base dei diritti del giocatore (host/guest) (per cui uso un context) decido cosa mostrare

    // impostazioni scelte nel popup, es. { impostors: 1, impostorHint: false }
    function saveSettings(settings) {
        setShowSettings(false)
    }

    return (
        <main className="pregame-page">

            <section className="pregame-page__top">
                <h1 className="pregame-page__name">{title}</h1>
                <p className="pregame-page__players">
                    <span>Min {minPlayers}</span>
                    <i className="bi bi-people"></i>
                </p>
            </section>

            <section>
                <div className="pregame-page__rules-head">
                    <h2 className="pregame-page__title">Regole</h2>
                    {settingsFields && (
                        <button type="button" className="pregame-page__edit" onClick={() => setShowSettings(true)} aria-label="Modifica impostazioni">
                            <i className="bi bi-pencil"></i>
                        </button>
                    )}
                </div>
                <p className="pregame-page__rules">{rules}</p>
            </section>

            <Link to={`/game/${gameSlug}`} className="btn-pill btn-pill--orange pregame-page__play">Gioca</Link>

            {showSettings && <SettingsPopup fields={settingsFields} onClose={() => setShowSettings(false)} onSave={saveSettings} />}
        </main>
    )
}
