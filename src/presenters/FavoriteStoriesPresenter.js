import { getFavoriteStories, deleteFavoriteStory } from '../utils/indexeddb'; // <-- Import fungsi IndexedDB

class FavoriteStoriesPresenter {
    constructor(view, router) {
        this.view = view;
        this.router = router;

        this.view.setRemoveStoryClickHandler(this.handleRemoveStoryClick.bind(this));

        this.loadFavoriteStories(); // Muat cerita favorit saat presenter diinisialisasi
    }

    async loadFavoriteStories() {
        this.view.showLoadingMessage();
        try {
            const stories = await getFavoriteStories(); // Ambil cerita dari IndexedDB
            this.view.renderFavoriteStoryCards(stories); // Render kartu cerita favorit
            if (stories.length > 0) {
                this.view.displayMessage('Stories loaded from local storage.', 'info');
            } else {
                this.view.displayMessage('No stories saved yet.', 'info');
            }
        } catch (error) {
            console.error('Failed to load favorite stories:', error);
            this.view.displayMessage('Failed to load saved stories.', 'error');
        }
    }

    async handleRemoveStoryClick(storyId) {
        this.view.displayMessage('Removing story from saved...', 'info');
        try {
            await deleteFavoriteStory(storyId); // Hapus cerita dari IndexedDB
            this.view.displayMessage('Story removed successfully!', 'success');
            // Muat ulang daftar cerita favorit setelah penghapusan
            await this.loadFavoriteStories();
        } catch (error) {
            console.error('Failed to remove story:', error);
            this.view.displayMessage('Failed to remove story.', 'error');
        }
    }

}

export default FavoriteStoriesPresenter;
