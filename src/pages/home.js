export function renderHomePage(container) {
    container.innerHTML = `
        <section class="home-page">
            <h2 class="page-title">Discover Stories</h2>
            <div class="actions">
                <button id="add-story-btn" class="btn btn-primary">Add New Story</button>
                <button id="clear-offline-data-btn" class="btn btn-danger">Clear Offline Data</button> <!-- Tambahkan tombol ini -->
            </div>
            <div id="home-map" class="map-container"></div>
            <div id="stories-list" class="stories-grid">
                <p id="stories-loading-message" class="loading-message">Loading stories...</p>
            </div>
            <div id="home-message" class="message-area"></div>
        </section>
    `;

    const addStoryBtn = document.getElementById('add-story-btn');
    const clearOfflineDataBtn = document.getElementById('clear-offline-data-btn'); // Ambil referensi tombol
    const storiesList = document.getElementById('stories-list');
    const homeMapContainer = document.getElementById('home-map');
    const homeMessage = document.getElementById('home-message');
    const storiesLoadingMessage = document.getElementById('stories-loading-message');


    // --- Metode yang akan dipanggil oleh Presenter untuk mengikat event ---
    const setAddStoryClickHandler = (handler) => {
        addStoryBtn.addEventListener('click', handler);
    };

    const setClearOfflineDataClickHandler = (handler) => { // <-- Tambahkan handler ini
        clearOfflineDataBtn.addEventListener('click', handler);
    };

    // --- Metode yang akan dipanggil oleh Presenter untuk memperbarui UI ---
    const renderStoryCards = (stories) => {
        storiesList.innerHTML = ''; // Hapus pesan loading/placeholder

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

            const storyCard = document.createElement('div');
            storyCard.className = 'story-card';
            storyCard.innerHTML = `
                <img src="${story.photoUrl}" alt="${story.description}" class="story-image">
                <div class="story-content">
                    <h3 class="story-title">${story.name}</h3>
                    ${locationText}
                    <p class="story-description">${story.description.substring(0, 150)}${story.description.length > 150 ? '...' : ''}</p>
                    <span class="story-date">${new Date(story.createdAt).toLocaleDateString()}</span>
                    <a href="#/stories/${story.id}" class="btn btn-secondary">Read More</a>
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
        storiesList.innerHTML = '<p class="error-message">Failed to load stories.</p>'; // Tampilkan pesan error di list juga
        storiesLoadingMessage.classList.add('hidden');
    };

    const displayMessage = (message, type) => {
        homeMessage.textContent = message;
        homeMessage.className = `message-area ${type}`;
    };

    const getMapContainer = () => homeMapContainer;

    return {
        setAddStoryClickHandler,
        setClearOfflineDataClickHandler,
        renderStoryCards,
        showLoadingMessage,
        hideLoadingMessage,
        showErrorMessage,
        displayMessage,
        getMapContainer,
    };
}
