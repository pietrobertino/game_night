// Bootstrap Icons non ha la corona: icona fatta a mano, piena per l'admin, vuota per gli altri
export default function CrownIcon({ filled = false }) {

    return (
        <svg className="crown-icon" viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true">
            <path
                d="M2 4.5 5 8l3-5 3 5 3-3.5v8H2z"
                fill={filled ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinejoin="round"
            />
        </svg>
    )
}
