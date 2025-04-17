// ✅ explicitly point at home.js
import { renderHome } from "./home.js";
import { renderAbout} from "./about.js";
import { renderLogin} from "./login.js";
import { renderLogout } from "./logout.js";
import { renderNavbar } from "./navbar.js";


async function router() {
    const nav = document.getElementById('navbar');
    nav.innerHTML = await renderNavbar(); // Render the navbar first

    const hash = window.location.hash || '#home';
    const app = document.getElementById('app');

    // Update the content based on the hash
    switch (hash) {
        case '#home':
            app.innerHTML = await renderHome();
            break;
        case '#shop':
            app.innerHTML = '<h1>Shop</h1>';
            break;
        case '#about':
            app.innerHTML = await renderAbout();
            break;
        case '#cart':
            app.innerHTML = '<h1>Cart Page</h1>';
            break;
        case '#login':
            // Render HTML first
            app.innerHTML = await renderLogin();

            // Initialize login logic AFTER DOM is populated
            const { initLogin } = await import('./login.js');
            initLogin();
            break;
        case '#profile':
            app.innerHTML = '<h1>Profile Page</h1>';
            break;
        case "#logout":
            app.innerHTML = await renderLogout();
            break;
        default:
            app.innerHTML = '<h1>404 Not Found</h1>';
            break;
    }

    // Update the active class in the navbar
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === hash) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
