import { createContext, useContext, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const SearchContext = createContext();

export function SearchContextProvider({ children }) {

    const [searchParams, setSearchParams] = useSearchParams();

    const showFavs = searchParams.get('favourites') === 'true';
    const debouncedSearch = searchParams.get('search') || '';
    const [showSearch, setShowSearch] = useState(false);
    const [search, setSearch] = useState('');

    return (
        <SearchContext.Provider value={{ showSearch, setShowSearch, showFavs, debouncedSearch, setSearchParams, search, setSearch }}>
            {children}
        </SearchContext.Provider>
    )
}

export function useSearch() {
    return useContext(SearchContext);
}