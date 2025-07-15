import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const MAPTILER_API_KEY = 'hDOFAljNTLeFb76lmDks';
// --- AKHIR API KEY ---

// Mengimpor gambar-gambar default ikon Leaflet (untuk marker)
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetinaUrl,
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
});


export function renderHomePage(container) {
    container.innerHTML = `
        <section class="home-page">
            <h2 class="page-title">Discover Stories</h2>
            <div class="actions">
                <button id="add-story-btn" class="btn btn-primary">Add New Story</button>
                <button id="clear-offline-data-btn" class="btn btn-danger">Clear All Offline Cache</button>
                <button id="view-favorite-stories-btn" class="btn btn-secondary">View Saved Stories</button>
            </div>
            <div id="home-map" class="map-container"></div>
            <div id="stories-list" class="stories-grid">
                <p id="stories-loading-message" class="loading-message">Loading stories...</p>
            </div>
            <div id="home-message" class="message-area"></div>
        </section>
    `;

    const addStoryBtn = document.getElementById('add-story-btn');
    const clearOfflineDataBtn = document.getElementById('clear-offline-data-btn');
    const viewFavoriteStoriesBtn = document.getElementById('view-favorite-stories-btn');
    const storiesList = document.getElementById('stories-list');
    const homeMapContainer = document.getElementById('home-map');
    const homeMessage = document.getElementById('home-message');
    const storiesLoadingMessage = document.getElementById('stories-loading-message');


    // --- Metode yang akan dipanggil oleh Presenter untuk mengikat event ---
    const setAddStoryClickHandler = (handler) => {
        addStoryBtn.addEventListener('click', handler);
    };

    const setClearOfflineDataClickHandler = (handler) => {
        clearOfflineDataBtn.addEventListener('click', handler);
    };

    const setViewFavoriteStoriesClickHandler = (handler) => {
        viewFavoriteStoriesBtn.addEventListener('click', handler);
    };

    const setSaveStoryClickHandler = (handler) => {
        storiesList.addEventListener('click', (event) => {
            if (event.target.classList.contains('save-story-btn')) {
                const storyId = event.target.dataset.storyId;
                const storyElement = event.target.closest('.story-card');
                handler(storyId, storyElement);
            }
        });
    };


    // --- Metode yang akan dipanggil oleh Presenter untuk memperbarui UI ---
    const renderStoryCards = (stories, favoritedStoryIds = new Set()) => {
        storiesList.innerHTML = '';

        if (stories.length === 0) {
            storiesList.innerHTML = '<p class="no-stories-message">No stories available. Be the first to share one!</p>';
            return;
        }

        stories.forEach(story => {
            let locationText = '';
            if (story.lat !== null && story.lon !== null) {
                locationText = `
                    <p class="story-location-text">
                        Latitude: ${story.lat.toFixed(4)}<br>
                        Longitude: ${story.lon.toFixed(4)}
                    </p>
                `;
            } else {
                locationText = `<p class="story-location-text">Location: N/A</p>`;
            }

            const isFavorited = favoritedStoryIds.has(story.id);
            const saveButtonText = isFavorited ? 'Saved' : 'Save Offline';
            const saveButtonClass = isFavorited ? 'btn-success' : 'btn-info';
            const saveButtonDisabled = isFavorited ? 'disabled' : '';

            const storyCard = document.createElement('div');
            storyCard.className = 'story-card';
            storyCard.dataset.storyId = story.id;
            storyCard.innerHTML = `
                <img src="${story.photoUrl}" alt="${story.description}" class="story-image">
                <div class="story-content">
                    <h3 class="story-title">${story.name}</h3>
                    ${locationText}
                    <p class="story-description">${story.description.substring(0, 150)}${story.description.length > 150 ? '...' : ''}</p>
                    <span class="story-date">${new Date(story.createdAt).toLocaleDateString()}</span>
                    <div class="story-actions">
                        <a href="#/stories/${story.id}" class="btn btn-secondary">Read More</a>
                        <button class="btn ${saveButtonClass} save-story-btn" data-story-id="${story.id}" ${saveButtonDisabled}>${saveButtonText}</button>
                    </div>
                </div>
            `;
            storiesList.appendChild(storyCard);
        });
    };

    const showLoadingMessage = () => {
        storiesLoadingMessage.textContent = 'Loading stories...';
        storiesLoadingMessage.classList.remove('hidden');
        homeMessage.textContent = '';
        homeMessage.className = 'message-area';
    };

    const hideLoadingMessage = () => {
        storiesLoadingMessage.classList.add('hidden');
    };

    const showErrorMessage = (message) => {
        homeMessage.textContent = `Error: ${message}`;
        homeMessage.className = 'message-area error';
        storiesList.innerHTML = '<p class="error-message">Failed to load stories.</p>';
        storiesLoadingMessage.classList.add('hidden');
    };

    const displayMessage = (message, type) => {
        homeMessage.textContent = message;
        homeMessage.className = `message-area ${type}`;
    };

    const getMapContainer = () => homeMapContainer;

    const updateSaveButtonStatus = (storyId, isFavorited) => {
        const button = storiesList.querySelector(`.save-story-btn[data-story-id="${storyId}"]`);
        if (button) {
            button.textContent = isFavorited ? 'Saved' : 'Save Offline';
            button.classList.remove(isFavorited ? 'btn-info' : 'btn-success');
            button.classList.add(isFavorited ? 'btn-success' : 'btn-info');
            button.disabled = isFavorited;
        }
    };



    return {
        setAddStoryClickHandler,
        setClearOfflineDataClickHandler,
        setViewFavoriteStoriesClickHandler,
        setSaveStoryClickHandler,
        renderStoryCards,
        showLoadingMessage,
        hideLoadingMessage,
        showErrorMessage,
        displayMessage,
        getMapContainer,
        updateSaveButtonStatus,
    };
}
