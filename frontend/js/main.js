// ✅ explicitly point at home.js
import { renderHome } from "./home.js";
import { renderAbout} from "./about.js";

async function router() {
    const hash = window.location.hash || '#home';
    const app = document.getElementById('app');

    // Update the content based on the hash
    switch (hash) {
        case '#home':
            app.innerHTML = await renderHome();
            break;
        case '#shop':
            app.innerHTML = await renderAbout();
            break;
        case '#about':
            app.innerHTML = '<h1>About Page</h1>';
            break;
        case '#cart':
            app.innerHTML = '<h1>Cart Page</h1>';
            break;
        case '#login':
            app.innerHTML = '<h1>Login Page</h1>';
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
