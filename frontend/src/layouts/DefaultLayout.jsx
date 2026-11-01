import AppHeader from "../components/AppHeader"
import { Outlet, useNavigate } from "react-router-dom"
import InvitePopup from "../components/InvitePopup"
import GenericPopup from "../components/GenericPopup"
import { useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import AreYouSurePopup from "../components/AreYouSurePopup"

export default function DefaultLayout() {

    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        //se l'utente non ha effettuato nessun tipo di accesso, lo rimando alla pagina di accesso
        if (!user) navigate('/');
    }, [])

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