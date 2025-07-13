export function renderNotFoundPage(container) {
    container.innerHTML = `
        <section class="not-found-page">
            <h2 class="page-title">404 - Page Not Found</h2>
            <p>Maaf, halaman yang Anda cari tidak ditemukan.</p>
            <p>Silakan kembali ke <a href="#/">halaman utama</a>.</p>
        </section>
    `;

}
