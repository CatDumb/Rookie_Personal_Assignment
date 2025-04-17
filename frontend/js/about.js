export async function renderAbout() {
    try {
        const res = await fetch('/frontend/components/about.html');
        if (!res.ok) {
            throw new Error(`Failed to fetch about.html: ${res.status} ${res.statusText}`);
        }
        const html = await res.text();
        return html;
    } catch (error) {
        console.error(error);
        return '<h1>Error loading about page</h1>';
    }
}
