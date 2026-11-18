export default function RulesPopup({ rules, onClose }) {

    return (
        <div className="popup" onClick={onClose}>
            <div className="popup__box popup__box--orange" onClick={e => e.stopPropagation()}>
                <button type="button" className="popup__close" onClick={onClose} aria-label="Chiudi">
                    <i className="bi bi-x-lg"></i>
                </button>
                <h2 className="popup__title">Regole</h2>
                <p className="rules-popup__text">{rules}</p>
            </div>
        </div>
    )
}
