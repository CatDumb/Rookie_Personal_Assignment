import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import AboutPage from './components/Page/About';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const toggleLogin = () => setIsLoggedIn(!isLoggedIn);

  return (
    <Router>
      <div className="min-h-screen w-screen bg-white text-black flex flex-col overflow-y-auto overflow-x-hidden scroll-smooth relative scrollbar scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200">
        <Navbar isLoggedIn={isLoggedIn} toggleLogin={toggleLogin} />
        <main className=" flex-grow">
          <Routes>
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
