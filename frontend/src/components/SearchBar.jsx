import { useSearch } from "../contexts/SearchContext";

export default function SearchBar() {

    const { showSearch, setShowSearch, search, setSearch } = useSearch();

    return (
        <>
            {
                showSearch &&
                <div className=" d-flex ">
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Impostore..." className=" form-check" />
                    <button className=" btn-close" onClick={() => { setShowSearch(false), setSearch('') }}></button>
                </div>
            }
        </>
    )
}