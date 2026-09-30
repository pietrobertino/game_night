import { BrowserRouter, Route, Routes } from "react-router-dom";
import DefaultLayout from "./layouts/DefaultLayout";
import HomePage from "./pages/HomePage";
import SessionPage from "./pages/SessionPage";


function App() {

  return (

    <BrowserRouter>
      <Routes>
        <Route element={<DefaultLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/session" element={<SessionPage />} />
        </Route>
      </Routes>
    </BrowserRouter>

  )
}

export default App;