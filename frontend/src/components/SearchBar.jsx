import { useState, useEffect } from "react";
import { useSearch } from "../contexts/SearchContext";

export default function SearchBar() {
    const { showSearch, setShowSearch, setSearchParams, search, setSearch } = useSearch();

    // 1. Stato locale per l'input: evita conflitti e permette una digitazione fluida
    const [inputValue, setInputValue] = useState(search);

    // Sincronizza l'input locale se lo stato globale viene resettato dall'esterno (es. pulsante chiudi)
    useEffect(() => {
        setInputValue(search);
    }, [search]);

    // 2. Debounce basato SOLO sull'input locale
    useEffect(() => {
        const timer = setTimeout(() => {
            // Aggiorniamo sia il context globale che l'URL
            setSearch(inputValue);
            handleSearchChange(inputValue);
        }, 400);

        return () => clearTimeout(timer); // Pulisce il timeout se l'utente continua a digitare
    }, [inputValue]);

    // Funzione per aggiornare l'URL
    const handleSearchChange = (newSearchTerm) => {
        setSearchParams(prev => {
            if (newSearchTerm.trim()) {
                prev.set('search', newSearchTerm);
            } else {
                prev.delete('search'); // Pulisce l'URL se il campo è vuoto
            }
            return prev;
        }, { replace: true }); // Usiamo { replace: true } per evitare di intasare la cronologia del browser con ogni lettera
    };

    return (
        <>
            {
                showSearch &&
                <div className="d-flex">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)} // Aggiorna solo lo stato locale fluidamente
                        placeholder="Impostore..."
                        className="form-control" // Nota: ho corretto "form-check" in "form-control" che è la classe corretta di Bootstrap per gli input di testo!
                    />
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => {
                            setShowSearch(false);
                            setSearch('');
                            setInputValue('');
                            handleSearchChange(''); // Pulisce anche l'URL quando chiudi la ricerca
                        }}
                    ></button>
                </div>
            }
        </>
    );
}