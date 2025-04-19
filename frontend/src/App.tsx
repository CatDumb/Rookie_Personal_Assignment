import './App.css';
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import AboutPage from './components/Page/About'; // Make sure to create this file

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const toggleLogin = () => setIsLoggedIn(!isLoggedIn);

  return (
    <Router>
      <div className="app">
        <Navbar isLoggedIn={isLoggedIn} toggleLogin={toggleLogin} />
        <main className="main-content">
          <Routes>
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
