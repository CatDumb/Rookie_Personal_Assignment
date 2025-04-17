export async function renderHome() {
    try {
        const res = await fetch('/frontend/components/home.html');
        if (!res.ok) {
            throw new Error(`Failed to fetch home.html: ${res.status} ${res.statusText}`);
        }
        const html = await res.text();
        return html;
    } catch (error) {
        console.error(error);
        return '<h1>Error loading home page</h1>';
    }
}
