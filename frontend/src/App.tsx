import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import AboutPage from './Page/About';
import HomePage from './Page/Home';
import { AuthProvider } from './components/context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen w-screen bg-white text-black flex flex-col overflow-y-auto overflow-x-hidden scroll-smooth relative scrollbar scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200">
          <Navbar />
          <main className="flex-grow mr-20 ml-20">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
