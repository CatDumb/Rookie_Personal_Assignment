import './Navbar.css';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
// import { useCart } from '../context/CartContext';

interface NavbarProps {
  isLoggedIn: boolean;
  toggleLogin: () => void;
}

function Navbar({ isLoggedIn, toggleLogin }: NavbarProps) {
  const firstName = localStorage.getItem('first_name');
  const lastName = localStorage.getItem('last_name');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  // const { cartItems } = useCart();

  const handleMenuClick = () => setIsMenuOpen(!isMenuOpen);
  const closeMobileMenu = () => setIsMenuOpen(false);

  // Get active tab based on current route
  const getActiveTab = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="left">
        <Link to="/" className="logo-link" onClick={closeMobileMenu}>
          <div className="logo">
            <img src="/book.png" alt="Logo" />
          </div>
          <div className="page_name">BOOKWORM</div>
        </Link>
      </div>

      <div className={`hamburger ${isMenuOpen ? 'open' : ''}`} onClick={handleMenuClick}>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>

      <ul className={`nav_tab_container ${isMenuOpen ? 'open' : ''}`}>
        <li className={getActiveTab('/')}>
          <Link to="/" onClick={closeMobileMenu}>Home</Link>
        </li>
        <li className={getActiveTab('/shop')}>
          <Link to="/shop" onClick={closeMobileMenu}>Shop</Link>
        </li>
        <li className={getActiveTab('/about')}>
          <Link to="/about" onClick={closeMobileMenu}>About</Link>
        </li>
        {/* <li className={getActiveTab('/cart')}>
          <Link to="/cart" onClick={closeMobileMenu}>
            Cart ({cartItems.length})
          </Link>
        </li> */}
        {isLoggedIn ? (
          <>
            <li className="user-name">{`${firstName} ${lastName}`}</li>
            <li onClick={toggleLogin}>Sign out</li>
          </>
        ) : (
          <li onClick={toggleLogin}>Sign in</li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
