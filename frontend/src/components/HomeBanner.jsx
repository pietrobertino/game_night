import { Link } from "react-router-dom"
import { Person, Star, Search } from "react-bootstrap-icons"
import { useAuth } from "../contexts/AuthContext"
import { useGlobal } from "../contexts/GlobalContext";

export default function HomeBanner() {

    const { setPopup } = useGlobal();
    const { user } = useAuth();

    return (

        <div className="fixed-bottom z-3 d-flex justify-content-center mb-5">
            <div className="alert alert-success alert-dismissible fade show m-0 shadow d-flex justify-content-between align-items-center rounded-pill" style={{ maxWidth: '500px', width: '90%' }}>
                <button className="btn"><Search /></button>
                {
                    user.account_type === 'guest' ?
                        <Link className=" text-decoration-none text-black" to={`/account`} onClick={() => { setPopup('Per usare la funzione dei preferiti devi crare un account brother') }}><Star /></Link>
                        :
                        <button className=" btn"><Star /></button>
                }
                <Link className=" text-decoration-none text-black" to={`/account`} ><Person /></Link>
            </div>
        </div>

    )
}

