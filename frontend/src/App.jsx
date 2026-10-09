import { BrowserRouter, Route, Routes } from "react-router-dom";
import DefaultLayout from "./layouts/DefaultLayout";
import HomePage from "./pages/HomePage";
import LobbyPage from "./pages/LobbyPage";
import PreGamePage from "./pages/PreGamePage";
import AccessPage from "./pages/AccessPage";


function App() {

  return (

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AccessPage />} />
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