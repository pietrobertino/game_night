import { BrowserRouter, Route, Routes } from "react-router-dom";
import DefaultLayout from "./layouts/DefaultLayout";
import HomePage from "./pages/HomePage";
import LobbyPage from "./pages/LobbyPage";
import PreGamePage from "./pages/PreGamePage";
import AccessPage from "./pages/AccessPage";
import Page404 from "./pages/Page404";
import AccountPage from "./pages/AccountPage";
import { GlobalContextProvider } from "./contexts/GlobalContext";


function App() {

  return (

    <GlobalContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AccessPage />} />
          <Route element={<DefaultLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/lobby" element={<LobbyPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/rules/:gameSlug" element={<PreGamePage />} />
          </Route>
          <Route path="*" element={<Page404 />} />
        </Routes>
      </BrowserRouter>
    </GlobalContextProvider>

  )
}

export default App;