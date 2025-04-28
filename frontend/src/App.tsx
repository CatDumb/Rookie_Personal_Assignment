import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import AboutPage from './Page/About';
import HomePage from './Page/Home';
import BookDetails from './Page/BookDetails';
import { AuthProvider } from './components/Context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen w-screen bg-white text-black flex flex-col overflow-y-auto overflow-x-hidden scroll-smooth relative scrollbar scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 xl:px-20 py-4">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/book/:id" element={<BookDetails />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
