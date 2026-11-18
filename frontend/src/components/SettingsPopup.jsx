import { useState } from "react"

// fields = lista di impostazioni del gioco, presa da data/gameSettings.js
export default function SettingsPopup({ fields, onClose, onSave }) {

    // { impostors: 1, impostorHint: false, ... } partendo dai valori di default
    const [values, setValues] = useState(
        Object.fromEntries(fields.map(field => [field.key, field.default]))
    )

    function setValue(key, value) {
        setValues(prev => ({ ...prev, [key]: value }))
    }

    return (
        <div className="popup" onClick={onClose}>
            <div className="popup__box popup__box--light" onClick={e => e.stopPropagation()}>
                <button type="button" className="popup__close" onClick={onClose} aria-label="Chiudi">
                    <i className="bi bi-x-lg"></i>
                </button>
                <h2 className="popup__title">Personalizzazioni</h2>

                {fields.map(field => (
                    <div key={field.key} className="settings-popup__row">
                        <span>{field.label}</span>

                        {field.type === "counter" && (
                            <div className="settings-popup__counter">
                                <button
                                    type="button"
                                    onClick={() => setValue(field.key, Math.max(field.min ?? 0, values[field.key] - 1))}
                                    aria-label="Meno"
                                >-</button>
                                <span>{values[field.key]}</span>
                                <button
                                    type="button"
                                    onClick={() => setValue(field.key, Math.min(field.max ?? Infinity, values[field.key] + 1))}
                                    aria-label="Più"
                                >+</button>
                            </div>
                        )}

                        {field.type === "checkbox" && (
                            <input
                                type="checkbox"
                                className="settings-popup__check"
                                checked={values[field.key]}
                                onChange={e => setValue(field.key, e.target.checked)}
                                aria-label={field.label}
                            />
                        )}
                    </div>
                ))}

                <div className="settings-popup__actions">
                    <button type="button" className="btn-pill btn-pill--red" onClick={onClose}>Annulla</button>
                    <button type="button" className="btn-pill btn-pill--green" onClick={() => onSave(values)}>Salva</button>
                </div>
            </div>
        </div>
    )
}
