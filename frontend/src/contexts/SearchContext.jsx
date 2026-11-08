import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const SearchContext = createContext();

export function SearchContextProvider({ children }) {


    const [showFavs, setShowFavs] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [search, setSearch] = useState('');

    return (
        <SearchContext.Provider value={{ showSearch, setShowSearch, search, setSearch, showFavs, setShowFavs }}>
            {children}
        </SearchContext.Provider>
    )
}

export function useSearch() {
    return useContext(SearchContext);
}