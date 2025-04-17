export async function renderNavbar() {
    try {
        // Check if the user is logged in
        const isLoggedIn = !!localStorage.getItem('token');
        const navbarFile = isLoggedIn
            ? '/frontend/components/navbar_logged_in.html'
            : '/frontend/components/navbar_logged_out.html';

        // Fetch the appropriate navbar HTML
        const res = await fetch(navbarFile);
        if (!res.ok) {
            throw new Error(`Failed to fetch navbar: ${res.status} ${res.statusText}`);
        }
        const html = await res.text();

        // Add logout functionality and set user name if logged in
        if (isLoggedIn) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Set the user's name in the navbar
            const userNameElement = doc.querySelector('#user-name');
            if (userNameElement) {
                const lastName = localStorage.getItem('last_name') || 'LastName';
                const firstName = localStorage.getItem('first_name') || 'FirstName';
                userNameElement.textContent = `${lastName} ${firstName}`;
            }

            // Add logout functionality
            const logoutLink = doc.querySelector('#logout-link');
            if (logoutLink) {
                logoutLink.addEventListener('click', () => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('first_name');
                    localStorage.removeItem('last_name');
                    window.location.hash = '#home'; // Redirect to home after logout
                    window.location.reload(); // Reload to update the navbar
                });
            }

            return doc.body.innerHTML;
        }

        return html;
    } catch (error) {
        console.error(error);
        return '<h1>Error loading navbar</h1>';
    }
}
