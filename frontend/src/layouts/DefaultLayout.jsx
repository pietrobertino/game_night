import AppHeader from "../components/AppHeader"
import { Outlet, useNavigate } from "react-router-dom"
import InvitePopup from "../components/InvitePopup"
import GenericPopup from "../components/GenericPopup"
import { useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import AreYouSurePopup from "../components/AreYouSurePopup"
import { usePopup } from "../contexts/PopupContext"

export default function DefaultLayout() {

    const { user, loading } = useAuth();
    const { setPopup } = usePopup();
    const navigate = useNavigate();

    useEffect(() => {
        if (loading) return;
        //se l'utente non ha effettuato nessun tipo di accesso, lo rimando alla pagina di accesso
        if (!user) {
            navigate('/');
            setPopup('Bro non fare il furbo, per usare l\'app devi accedere');
        };
    }, [loading])

    return (
        <>
            <GenericPopup />
            <AreYouSurePopup />
            <AppHeader />
            <InvitePopup />
            <Outlet />
        </>
    )
}