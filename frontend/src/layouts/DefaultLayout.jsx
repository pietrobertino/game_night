import AppHeader from "../components/AppHeader"
import { Outlet } from "react-router-dom"
import InvitePopup from "../components/InvitePopup"

export default function DefaultLayout() {

    return (
        <>
            <InvitePopup />
            <AppHeader />
            <Outlet />
        </>
    )
}