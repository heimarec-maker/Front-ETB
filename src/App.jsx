import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import LimpiezaEquipos from './pages/LimpiezaEquipos'
import CreacionEquipos from './pages/CreacionEquipos'
import LimpiezaSmw from './pages/LimpiezaSmw'
import LimpiezaMss from './pages/LimpiezaMss'

function App() {
  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/limpieza-equipos" element={<LimpiezaEquipos />} />
            <Route path="/creacion-equipos" element={<CreacionEquipos />} />
            <Route path="/limpieza-smw" element={<LimpiezaSmw />} />
            <Route path="/limpieza-mss" element={<LimpiezaMss />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
