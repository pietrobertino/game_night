import { BrowserRouter, Route, Routes } from "react-router-dom";
import DefaultLayout from "./layouts/DefaultLayout";
import HomePage from "./pages/HomePage";
import LobbyPage from "./pages/LobbyPage";
import GuestPage from "./pages/GuestPage";
import PreGamePage from "./pages/PreGamePage";
import AccessPage from "./pages/AccessPage";
import RegistrationPage from "./pages/RegistrationPage";


function App() {

  return (

    <BrowserRouter>
      <Routes>
        <Route index element={<GuestPage />} />
        <Route path="/access" element={<AccessPage />} />
        <Route path="/registration" element={<RegistrationPage />} />
        <Route element={<DefaultLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/rules/:gameSlug" element={<PreGamePage />} />
        </Route>
      </Routes>
    </BrowserRouter>

  )
}

export default App;