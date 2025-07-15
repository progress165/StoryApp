import 'leaflet/dist/leaflet.css'; // Import CSS Leaflet
import L from 'leaflet';           // Import object Leaflet


const MAPTILER_API_KEY = 'hDOFAljNTLeFb76lmDks';
// --- AKHIR API KEY ---

// Mengimpor gambar-gambar default ikon Leaflet (untuk marker)
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetinaUrl,
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
});


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

    // --- Metode Internal untuk Mengelola Tampilan ---
    const _displayMessage = (message, type) => {
        storyDetailMessage.textContent = message;
        storyDetailMessage.className = `message-area ${type}`;
    };

    const _clearMessage = () => {
        storyDetailMessage.textContent = '';
        storyDetailMessage.className = 'message-area';
    };


    // --- View Methods Exposed to Presenter ---
    return {
        setBackToHomeButtonHandler: (handler) => {
            backToHomeBtn.addEventListener('click', handler);
        },

        showLoadingMessage: () => {
            storyDetailContent.innerHTML = `<p class="loading-message">Loading story details...</p>`;
            storyDetailContent.classList.remove('hidden');
            _clearMessage(); // Clear any previous messages
        },

        renderStoryDetails: (story) => {
            storyDetailContent.innerHTML = `
                <h2 class="detail-page-title">${story.name}</h2>
                <span class="detail-story-date">Published on: ${new Date(story.createdAt).toLocaleDateString()}</span>
                <p class="detail-location-text">
                    Latitude: ${story.lat !== null ? story.lat.toFixed(6) : 'N/A'}
                    Longitude: ${story.lon !== null ? story.lon.toFixed(6) : 'N/A'}
                </p>
                <p class="detail-author">Dilaporkan oleh: ${story.name}</p>

                <div class="detail-story-image-container">
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
        },

        showErrorMessage: (message) => {
            storyDetailContent.innerHTML = `<p class="error-message">Failed to load story details.</p>`;
            _displayMessage(`Error: ${message}`, 'error');
        },

        showLocationNotAvailable: () => {
            storyDetailContent.insertAdjacentHTML('beforeend', '<p class="info-message">Location data not available for this story.</p>');
        },

        getMapContainerElement: () => mapDivContainer,

        // --- TAMBAHKAN METODE INI UNTUK PRESENTER ---
        displayMessage: (message, type) => _displayMessage(message, type),
        clearMessage: () => _clearMessage(),
        // --- AKHIR PENAMBAHAN ---
    };
}
