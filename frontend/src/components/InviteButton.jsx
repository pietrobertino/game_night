import { useLobby } from "../contexts/LobbyContext";
import { usePopup } from "../contexts/PopupContext";
import baseUrl from "../data/url";

export default function InviteButton() {

    const { setPopup } = usePopup();
    const { lobbyCode } = useLobby();

    const handleShare = async () => {
        // Dati da condividere
        const shareData = {
            title: 'Partecipa alla mia lobby',
            text: 'Entra nella mia lobby di Game Night e giochiamo insieme',
            url: `${baseUrl.frontUrl}/join/${lobbyCode}`,
        };

        // 1. Verifica se il browser supporta la condivisione nativa
        if (navigator.share) {
            try {
                await navigator.share(shareData);
                console.log('Contenuto condiviso con successo!');
            } catch (error) {
                console.log('Errore o condivisione annullata:', error);
            }
        } else {
            // 2. Fallback per i browser che non la supportano (es. vecchi PC)
            setPopup('La condivisione nativa non è supportata su questo browser.');
            // Qui potresti aprire un popup personalizzato o copiare il link negli appunti
        }
    };

    return (
        <button type="button" className="btn-pill btn-pill--orange" onClick={handleShare}>Invita</button>
    );
}

