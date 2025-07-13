export function renderStoryDetailPage(container) {
    // Struktur dasar halaman detail, akan diisi detail setelah fetch
    container.innerHTML = `
        <section class="story-detail-page">
            <div id="story-detail-content" class="loading-message">
                <p>Loading story details...</p>
            </div>
            <div id="story-detail-message" class="message-area"></div>
            <button id="back-to-home-btn" class="btn btn-secondary">Back to Stories</button>
        </section>
    `;

    const storyDetailContent = document.getElementById('story-detail-content');
    const storyDetailMessage = document.getElementById('story-detail-message');
    const backToHomeBtn = document.getElementById('back-to-home-btn');
    const mapDivContainer = document.createElement('div'); // Buat div untuk peta secara dinamis jika ada lokasi
    mapDivContainer.id = 'map'; // ID ini penting untuk Leaflet
    mapDivContainer.className = 'detail-map-container';

    // --- Metode yang akan dipanggil oleh Presenter untuk mengikat event ---
    const setBackToHomeButtonHandler = (handler) => {
        backToHomeBtn.addEventListener('click', handler);
    };

    // --- Metode yang akan dipanggil oleh Presenter untuk memperbarui UI ---
    const showLoadingMessage = () => {
        storyDetailContent.innerHTML = `<p class="loading-message">Loading story details...</p>`;
        storyDetailContent.classList.remove('hidden');
        storyDetailMessage.textContent = '';
        storyDetailMessage.className = 'message-area';
    };

    const renderStoryDetails = (story) => {
        storyDetailContent.innerHTML = `
            <h2 class="detail-page-title">${story.name}</h2>
            <span class="detail-story-date">Published on: ${new Date(story.createdAt).toLocaleDateString()}</span>
            <p class="detail-location-text">
                Latitude: ${story.lat !== null ? story.lat.toFixed(6) : 'N/A'}
                Longitude: ${story.lon !== null ? story.lon.toFixed(6) : 'N/A'}
            </p>
            <p class="detail-author">Dilaporkan oleh: ${story.name}</p> <div class="detail-story-image-container">
                <img src="${story.photoUrl}" alt="${story.description}" class="detail-story-image">
            </div>

            <h3 class="detail-info-heading">Informasi Lengkap</h3>
            <p class="detail-story-description">${story.description}</p>

            <h3 class="detail-info-heading">Peta Lokasi</h3>
            `;
        // Sisipkan div peta setelah konten detail lainnya
        if (story.lat !== null && story.lon !== null) {
            storyDetailContent.appendChild(mapDivContainer);
        }

        storyDetailContent.classList.remove('loading-message');
    };

    const showErrorMessage = (message) => {
        storyDetailContent.innerHTML = `<p class="error-message">Failed to load story details.</p>`;
        storyDetailMessage.textContent = `Error: ${message}`;
        storyDetailMessage.className = 'message-area error';
    };

    const showLocationNotAvailable = () => {
        storyDetailContent.insertAdjacentHTML('beforeend', '<p class="info-message">Location data not available for this story.</p>');
    };

    const getMapContainerElement = () => mapDivContainer; // Mengembalikan elemen div yang akan digunakan peta

    return {
        setBackToHomeButtonHandler,
        showLoadingMessage,
        renderStoryDetails,
        showErrorMessage,
        showLocationNotAvailable,
        getMapContainerElement,
    };
}