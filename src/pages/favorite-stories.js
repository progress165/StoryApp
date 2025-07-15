// src/pages/favorite-stories.js (View)

/**
 * renderFavoriteStoriesPage bertanggung jawab untuk merender UI halaman cerita favorit.
 * @param {HTMLElement} container - Elemen DOM tempat konten akan dirender.
 * @returns {object} Objek View dengan metode untuk interaksi UI.
 */
export function renderFavoriteStoriesPage(container) {
    container.innerHTML = `
        <section class="favorite-stories-page">
            <h2 class="page-title">Your Saved Stories</h2>
            <div id="favorite-stories-list" class="stories-grid">
                <p class="loading-message">Loading saved stories...</p>
            </div>
            <div id="favorite-stories-message" class="message-area"></div>
        </section>
    `;

    const favoriteStoriesList = document.getElementById('favorite-stories-list');
    const favoriteStoriesMessage = document.getElementById('favorite-stories-message');

    // --- Metode yang akan dipanggil oleh Presenter untuk mengikat event ---
    const setRemoveStoryClickHandler = (handler) => {
        favoriteStoriesList.addEventListener('click', (event) => {
            if (event.target.classList.contains('remove-story-btn')) {
                const storyId = event.target.dataset.storyId;
                handler(storyId);
            }
        });
    };

    // --- Metode yang akan dipanggil oleh Presenter untuk memperbarui UI ---
    const renderFavoriteStoryCards = (stories) => {
        favoriteStoriesList.innerHTML = '';

        if (stories.length === 0) {
            favoriteStoriesList.innerHTML = '<p class="no-stories-message">No stories saved yet. Save some from the Home page!</p>';
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
            storyCard.dataset.storyId = story.id;
            storyCard.innerHTML = `
                <img src="${story.photoUrl}" alt="${story.description}" class="story-image">
                <div class="story-content">
                    <h3 class="story-title">${story.name}</h3>
                    ${locationText}
                    <p class="story-description">${story.description.substring(0, 150)}${story.description.length > 150 ? '...' : ''}</p>
                    <span class="story-date">${new Date(story.createdAt).toLocaleDateString()}</span>
                    <div class="story-actions">
                        <a href="#/stories/${story.id}" class="btn btn-secondary">View Details</a>
                        <button class="btn btn-danger remove-story-btn" data-story-id="${story.id}">Remove</button>
                    </div>
                </div>
            `;
            favoriteStoriesList.appendChild(storyCard);
        });
    };

    const showLoadingMessage = () => {
        favoriteStoriesList.innerHTML = '<p class="loading-message">Loading saved stories...</p>';
        favoriteStoriesMessage.textContent = '';
        favoriteStoriesMessage.className = 'message-area';
    };

    const displayMessage = (message, type) => {
        favoriteStoriesMessage.textContent = message;
        favoriteStoriesMessage.className = `message-area ${type}`;
    };

    return {
        setRemoveStoryClickHandler,
        renderFavoriteStoryCards,
        showLoadingMessage,
        displayMessage,
    };
}
