import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import DiseaseManagement from './DiseaseManagement'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/diseases" element={<DiseaseManagement />} />
        <Route path="/" element={<div>Welcome to PawSense</div>} />
      </Routes>
    </Router>
  )
}

export default App
