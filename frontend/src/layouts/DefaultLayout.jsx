import AppHeader from "../components/AppHeader"
import AppFooter from "../components/AppFooter"
import { Outlet } from "react-router-dom"

export default function DefaultLayout() {

    return (
        <>
            <AppHeader />
            <Outlet />
            <AppFooter />
        </>
    )
}