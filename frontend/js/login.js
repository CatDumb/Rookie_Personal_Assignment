export async function renderLogin() {
    try {
        const res = await fetch('/frontend/components/login.html');
        if (!res.ok) throw new Error(`Failed to fetch login.html: ${res.status} ${res.statusText}`);
        return await res.text(); // Just return HTML, don't modify DOM here
    } catch (error) {
        console.error('Error loading login page:', error);
        return '<h1>Error loading login page</h1>';
    }
}

export function initLogin() {
    const loginForm = document.querySelector('.login_form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // ✅ Get values from the ACTUAL DOM (not tempDiv)
        const formData = {
            email: document.getElementById('username').value,
            password: document.getElementById('password').value,
        };

        try {
            const response = await fetch('/api/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    alert('Unauthorized: Invalid email or password.');
                } else {
                    const errorText = await response.text();
                    throw new Error(`Login failed: ${response.status} ${response.statusText} - ${errorText}`);
                }
                return;
            }

            const data = await response.json();
            alert('Login successful!');
            localStorage.setItem('token', data.token);
            localStorage.setItem('first_name', data.first_name);
            localStorage.setItem('last_name', data.last_name);
            window.location.hash = '#home';

            console.log('API Response:', data);
            console.log('Storing in localStorage:', {
                token: data.token,
                first_name: data.first_name,
                last_name: data.last_name,
            });
            // Re-render navbar
            const nav = document.getElementById('navbar');
            const { renderNavbar } = await import('./navbar.js');
            nav.innerHTML = await renderNavbar();
        } catch (error) {
            console.error('Error during login:', error);
            alert('Login failed. Please try again.');
        }
    });
}
