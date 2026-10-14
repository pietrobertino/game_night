import { BrowserRouter, Route, Routes } from "react-router-dom";
import DefaultLayout from "./layouts/DefaultLayout";
import HomePage from "./pages/HomePage";
import LobbyPage from "./pages/LobbyPage";
import AccessPage from "./pages/AccessPage";
import PreGamePage from "./pages/PreGamePage";
import GamePage from "./pages/GamePage";


function App() {

  return (

    <BrowserRouter>
      <Routes>
        <Route index element={<AccessPage />} />
        <Route element={<DefaultLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/rules/:gameSlug" element={<PreGamePage />} />
          <Route path="/game/:gameSlug" element={<GamePage />} />
        </Route>
      </Routes>
    </BrowserRouter>

  )
}

export default App;