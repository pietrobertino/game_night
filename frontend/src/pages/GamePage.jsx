import { useState } from "react"
import RulesPopup from "../components/RulesPopup"
import GuessAlert from "../components/GuessAlert"

export default function GamePage() {

    const [showRules, setShowRules] = useState(false)

    // da collegare al socket: quando l'impostore preme "Indovina" il server avvisa tutti
    // i giocatori della lobby e ognuno fa setShowGuessAlert(true)
    const [showGuessAlert, setShowGuessAlert] = useState(false)

    //API call / socket per i dati della partita
    const rules = ""        // regole del gioco (description)
    const roleName = ""     // es. "Impostore"
    const roleImage = ""    // es. "/images/roles/impostore.png"
    const hint = ""         // suggerimento

    return (
        <main className="game-page">

            <section className="game-page__top">
                <h2 className="game-page__title">Il tuo ruolo</h2>
                <button type="button" className="btn-pill btn-pill--orange game-page__rules-btn" onClick={() => setShowRules(true)} aria-label="Regole">
                    <i className="bi bi-book"></i>
                </button>
            </section>

            <article className="role-card">
                <img className="role-card__image" src={roleImage || undefined} alt="" />
                <h3 className="role-card__name">{roleName}</h3>
            </article>

            <section className="game-page__hint">
                <div>
                    <h2 className="game-page__title">Suggerimento:</h2>
                    <p className="game-page__hint-word">{hint}</p>
                </div>

                {/* mostrare solo nel gioco dell'impostore se il giocatore è l'impostore */}
                <button type="button" className="btn-pill btn-pill--light game-page__guess" onClick={() => setShowGuessAlert(true)}>Indovina</button>
            </section>

            <div className="game-page__actions">
                <button type="button" className="btn-pill btn-pill--green">Votazione</button>
                <button type="button" className="btn-pill btn-pill--red">Termina</button>
            </div>

            {showRules && <RulesPopup rules={rules} onClose={() => setShowRules(false)} />}

            {showGuessAlert && <GuessAlert onClose={() => setShowGuessAlert(false)} />}
        </main>
    )
}
