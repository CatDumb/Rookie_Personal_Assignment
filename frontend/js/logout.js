export async function renderLogout() {
    try {
        // Remove the token and user information from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user'); // Optional: Remove user info if stored

        // Redirect to the home page
        window.location.hash = '#home';
        // Re-render the navbar to reflect the logged-out state
        const nav = document.getElementById('navbar');
        const { renderNavbar } = await import('./navbar.js');
        nav.innerHTML = await renderNavbar();
    } catch (error) {
        console.error('Error logging out:', error);
        return '<h1>Error logging out</h1>';
    }
}
