import { useParams } from "react-router-dom"

export default function PreGamePage() {

    const { gameSlug } = useParams();

    //chiamta api show game basata sul game slug 

    //sulla base dei diritti del giocatore (host/guest) (per cui uso un context) decido cosa mostrare

    return (
        <></>
    )
}