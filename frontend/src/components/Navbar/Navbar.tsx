import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
  isLoggedIn: boolean;
  toggleLogin: () => void;
}

function Navbar({ isLoggedIn, toggleLogin }: NavbarProps) {
  const first_name = localStorage.getItem('first_name');
  const last_name = localStorage.getItem('last_name');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const handleMenuClick = () => setIsMenuOpen(!isMenuOpen);
  const closeMobileMenu = () => setIsMenuOpen(false);

  const handleSignOut = () => {
    toggleLogin();
    closeMobileMenu();
    window.location.href = '/';
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
        className={`md:hidden flex flex-col gap-1.5 cursor-pointer z-20 p-2 absolute right-4 top-1/2 -translate-y-1/2 ${isMenuOpen ? 'open' : ''
          }`}
        onClick={handleMenuClick}
      >
        <div className="w-6 h-[3px] bg-gray-800 transition-all"></div>
        <div className="w-6 h-[3px] bg-gray-800 transition-all"></div>
        <div className="w-6 h-[3px] bg-gray-800 transition-all"></div>
      </div>

      <ul
        className={`fixed md:static top-20 right-0 w-full md:w-auto h-[calc(100vh-80px)] md:h-auto overflow-y-auto md:overflow-visible flex flex-col md:flex-row items-center gap-4 bg-gray-300 z-10 py-4 md:py-0 transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
          }`}
      >
        <li className="w-full md:w-auto">
          <Link
            to="/"
            onClick={closeMobileMenu}
            className={`relative px-4 py-2.5 text-center hover:bg-gray-400/30 rounded transition-colors ${getActiveTab(
              '/'
            )}`}
          >
            Home
          </Link>
        </li>
        <li className="w-full md:w-auto">
          <Link
            to="/shop"
            onClick={closeMobileMenu}
            className={`relative px-4 py-2.5 text-center hover:bg-gray-400/30 rounded transition-colors ${getActiveTab(
              '/shop'
            )}`}
          >
            Shop
          </Link>
        </li>
        <li className="w-full md:w-auto">
          <Link
            to="/about"
            onClick={closeMobileMenu}
            className={`relative px-4 py-2.5 text-center hover:bg-gray-400/30 rounded transition-colors ${getActiveTab(
              '/about'
            )}`}
          >
            About
          </Link>
        </li>
        {isLoggedIn ? (
          <>
            <li className="px-4 py-2.5 text-center">{`${first_name} ${last_name}`}</li>
            <li className="w-full md:w-auto">
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-2.5 text-center hover:bg-gray-400/30 rounded transition-colors"
              >
                Sign out
              </button>
            </li>
          </>
        ) : (
          <li className="w-full md:w-auto">
            <button
              onClick={() => { }}
              className="w-full px-4 py-2.5 text-center hover:bg-gray-400/30 rounded transition-colors"
            >
              Sign in
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
