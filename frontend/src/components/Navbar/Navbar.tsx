/* Navigation Bar Component - Main site navigation with authentication status */
import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "../ui/dialog";
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { LoginPayload } from '../../api/auth';

// Define the event name for opening the login dialog
export const LOGIN_DIALOG_EVENT = "open-login-dialog";

// Event dispatcher function that can be imported and used by other components
export function openLoginDialog() {
  const event = new CustomEvent(LOGIN_DIALOG_EVENT);
  document.dispatchEvent(event);
}

function Navbar() {
  /* Context Hooks and State */
  const { isLoggedIn, firstName, lastName, login, logout, error: authError } = useAuth();
  const { cartItemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLLIElement>(null);

  /* Event listener for the custom login dialog event */
  useEffect(() => {
    function handleLoginDialogEvent() {
      setIsDialogOpen(true);
    }

    document.addEventListener(LOGIN_DIALOG_EVENT, handleLoginDialogEvent);
    return () => {
      document.removeEventListener(LOGIN_DIALOG_EVENT, handleLoginDialogEvent);
    };
  }, []);

  /* UI Event Handlers */
  const handleMenuClick = () => setIsMenuOpen(!isMenuOpen);
  const closeMobileMenu = () => setIsMenuOpen(false);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  /* Authentication Handlers */
  const handleSignOut = () => {
    logout();
    closeMobileMenu();
    setIsDropdownOpen(false);
    navigate('/');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const payload: LoginPayload = { email, password };
    const success = await login(payload);

    if (success) {
      setIsDialogOpen(false);
    } else {
      setError(authError || 'Invalid email or password');
    }
  };

  /* Cart Navigation Handler */
  const handleCartClick = () => {
    navigate('/cart');
    closeMobileMenu();
  };

  /* Outside Click Detection for Dropdown */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /* Helper to Determine Active Navigation Item */
  const getActiveTab = (path: string) =>
    location.pathname === path ? 'font-bold underline' : '';

  return (
    <nav className="sticky top-0 left-0 right-0 h-16 bg-gray-300 flex items-center z-[100]">
      <div className="container mx-auto px-2 sm:px-3 lg:px-4 xl:px-10 flex justify-between items-center h-full">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 h-full">
          <Link
            to="/"
            className="flex items-center gap-3 no-underline text-current h-full"
            onClick={closeMobileMenu}
          >
            <div className="h-7 w-7 flex items-center">
              <img src="/book.png" alt="Logo" className="h-full w-auto" />
            </div>
            <div className="font-bold text-xl">BOOKWORM</div>
          </Link>
        </div>

        {/* Mobile Menu Hamburger Button */}
        <div
          className={`md:hidden flex flex-col gap-1 cursor-pointer z-20 p-1 ${isMenuOpen ? 'open' : ''}`}
          onClick={handleMenuClick}
        >
          <div className={`w-5 h-[2px] bg-gray-800 transition-all ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
          <div className={`w-5 h-[2px] bg-gray-800 transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></div>
          <div className={`w-5 h-[2px] bg-gray-800 transition-all ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
        </div>

        {/* Navigation Links */}
        <ul
          className={`fixed md:static top-16 left-0 right-0 w-full md:w-auto max-h-[calc(100vh-64px)] md:max-h-none overflow-y-auto md:overflow-visible flex flex-col md:flex-row items-center gap-3 bg-gray-300 z-10 py-3 md:py-0 transition-all duration-300 ${
            isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto'
          }`}
        >
          {/* Home Link */}
          <li className="w-full md:w-auto text-center">
            <Link
              to="/"
              onClick={closeMobileMenu}
              className={`block w-full md:inline-block md:w-auto px-3 py-2 hover:bg-gray-400/30 rounded transition-colors ${getActiveTab('/')}`}
            >
              Home
            </Link>
          </li>
          {/* Shop Link */}
          <li className="w-full md:w-auto text-center">
            <Link
              to="/shop"
              onClick={closeMobileMenu}
              className={`block w-full md:inline-block md:w-auto px-3 py-2 hover:bg-gray-400/30 rounded transition-colors ${getActiveTab('/shop')}`}
            >
              Shop
            </Link>
          </li>
          {/* About Link */}
          <li className="w-full md:w-auto text-center">
            <Link
              to="/about"
              onClick={closeMobileMenu}
              className={`block w-full md:inline-block md:w-auto px-3 py-2 hover:bg-gray-400/30 rounded transition-colors ${getActiveTab('/about')}`}
            >
              About
            </Link>
          </li>
          {/* Cart Link */}
          <li className="w-full md:w-auto text-center">
            <button
              onClick={handleCartClick}
              className={`flex items-center justify-center md:justify-start gap-1 w-full md:w-auto px-3 py-2 hover:bg-gray-400/30 rounded transition-colors ${getActiveTab('/cart')}`}
            >
              <span>Cart ({cartItemCount})</span>
            </button>
          </li>
          {/* User Profile or Sign In */}
          {isLoggedIn ? (
            <li className="w-full md:w-auto text-center relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="w-full md:w-auto px-3 py-2 hover:bg-gray-400/30 rounded transition-colors flex items-center justify-center md:justify-start gap-1"
              >
                <span>{`${firstName} ${lastName}`}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              {/* User Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 md:right-0 left-1/2 md:left-auto transform -translate-x-1/2 md:translate-x-0">
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </li>
          ) : (
            <li className="w-full md:w-auto text-center">
              {/* Login Dialog */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <button
                    onClick={closeMobileMenu}
                    className="w-full md:w-auto px-3 py-2 hover:bg-gray-400/30 rounded transition-colors"
                  >
                    Sign in
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>Sign In</DialogTitle>
                  <form onSubmit={handleLogin} className="space-y-4">
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
      </div>
    </nav>
  );
}

export default Navbar;
