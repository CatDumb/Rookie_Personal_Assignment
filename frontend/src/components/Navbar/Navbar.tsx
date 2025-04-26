import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { useAuth } from '../context/AuthContext';
import { LoginPayload } from '../../api/auth';

function Navbar() {
  const { isLoggedIn, firstName, lastName, login, logout, error: authError } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const handleMenuClick = () => setIsMenuOpen(!isMenuOpen);
  const closeMobileMenu = () => setIsMenuOpen(false);

  const handleSignOut = () => {
    logout();
    closeMobileMenu();
    navigate('/');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const payload: LoginPayload = { email, password };
    const success = await login(payload);

    if (success) {
      setIsDialogOpen(false);
      navigate('/');
    } else {
      setError(authError || 'Invalid email or password');
    }
  };

  const getActiveTab = (path: string) =>
    location.pathname === path ? 'font-bold' : '';

  return (
    <nav className="sticky top-0 left-0 right-0 h-20 bg-gray-300 flex items-center justify-between px-4 z-[100]">
      <div className="flex items-center gap-4 h-full">
        <Link
          to="/"
          className="flex items-center gap-4 no-underline text-current h-full"
          onClick={closeMobileMenu}
        >
          <div className="h-8 w-8 flex items-center">
            <img src="/book.png" alt="Logo" className="h-full w-auto" />
          </div>
          <div className="font-bold text-xl">BOOKWORM</div>
        </Link>
      </div>

      <div
        className={`md:hidden flex flex-col gap-1.5 cursor-pointer z-20 p-2 ${isMenuOpen ? 'open' : ''}`}
        onClick={handleMenuClick}
      >
        <div className={`w-6 h-[3px] bg-gray-800 transition-all ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
        <div className={`w-6 h-[3px] bg-gray-800 transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></div>
        <div className={`w-6 h-[3px] bg-gray-800 transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
      </div>

      <ul
        className={`fixed md:static top-20 left-0 right-0 w-full md:w-auto max-h-[calc(100vh-80px)] md:max-h-none overflow-y-auto md:overflow-visible flex flex-col md:flex-row items-center gap-4 bg-gray-300 z-10 py-4 md:py-0 transition-all duration-300 ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto'
        }`}
      >
        <li className="w-full md:w-auto text-center">
          <Link
            to="/"
            onClick={closeMobileMenu}
            className={`block w-full md:inline-block md:w-auto px-4 py-2.5 hover:bg-gray-400/30 rounded transition-colors ${getActiveTab('/')}`}
          >
            Home
          </Link>
        </li>
        <li className="w-full md:w-auto text-center">
          <Link
            to="/shop"
            onClick={closeMobileMenu}
            className={`block w-full md:inline-block md:w-auto px-4 py-2.5 hover:bg-gray-400/30 rounded transition-colors ${getActiveTab('/shop')}`}
          >
            Shop
          </Link>
        </li>
        <li className="w-full md:w-auto text-center">
          <Link
            to="/about"
            onClick={closeMobileMenu}
            className={`block w-full md:inline-block md:w-auto px-4 py-2.5 hover:bg-gray-400/30 rounded transition-colors ${getActiveTab('/about')}`}
          >
            About
          </Link>
        </li>
        {isLoggedIn ? (
          <>
            <li className="w-full md:w-auto px-4 py-2.5 text-center">{`${firstName} ${lastName}`}</li>
            <li className="w-full md:w-auto text-center">
              <button
                onClick={handleSignOut}
                className="w-full md:w-auto px-4 py-2.5 hover:bg-gray-400/30 rounded transition-colors"
              >
                Sign out
              </button>
            </li>
          </>
        ) : (
          <li className="w-full md:w-auto text-center">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button
                  onClick={closeMobileMenu}
                  className="w-full md:w-auto px-4 py-2.5 hover:bg-gray-400/30 rounded transition-colors"
                >
                  Sign in
                </button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <h2 className="text-2xl font-bold">Sign In</h2>
                  {error && <p className="text-red-500">{error}</p>}
                  <div>
                    <label className="block mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                  >
                    Sign In
                  </button>
                </form>
              </DialogContent>
            </Dialog>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
