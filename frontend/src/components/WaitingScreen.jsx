import { useEffect } from "react"
import { socket } from "../socket"
import { useAuth } from "../contexts/AuthContext"
import { useNavigate } from "react-router-dom";

export default function WaitingScreen() {

    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {

        const onAccepted = ({ userId }) => {
            if (userId === user.id) {
                navigate('/home')
            }
        }

        socket.on('player_joined', onAccepted);

        return () => {
            socket.off('player_joined', onAccepted);
        }

    }, [])

    return (
        <h1>In attesa che l'host della lobby accetteìi la tua richiesta</h1>
    )
}