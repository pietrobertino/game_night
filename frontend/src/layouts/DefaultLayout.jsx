import AppHeader from "../components/AppHeader"
import { Outlet } from "react-router-dom"
import InvitePopup from "../components/InvitePopup"
import GenericPopup from "../components/GenericPopup"

export default function DefaultLayout() {

    return (
        <>
            <GenericPopup />
            <AppHeader />
            <InvitePopup />
            <Outlet />
        </>
    )
}