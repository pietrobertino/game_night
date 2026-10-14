// schermata a tutto schermo che compare a tutti quando l'impostore preme "Indovina"
export default function GuessAlert({ onClose }) {

    return (
        <div className="guess-alert">
            <p className="guess-alert__warning" aria-hidden="true">
                <span>Attenzione</span>
                <span>Attenzione</span>
                <span>Attenzione</span>
            </p>

            <h2 className="guess-alert__message">
                <span>L’impostore</span>
                <span>vuole</span>
                <span>indovinare</span>
                <span>la parola!</span>
            </h2>

            {/* solo l'admin dovrebbe vedere questo bottone e chiudere la schermata per tutti */}
            <button type="button" className="btn-pill btn-pill--red guess-alert__close" onClick={onClose}>Termina</button>
        </div>
    )
}
