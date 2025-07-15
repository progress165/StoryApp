import { apiGetStories } from '../utils/api';
import { putStories, getStoriesFromDb, clearAllStoriesFromDb, putFavoriteStory, getFavoriteStories, deleteFavoriteStory } from '../utils/indexeddb'; // <-- Import fungsi IndexedDB baru
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


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

class HomePresenter {
    constructor(view, router) {
        this.view = view;
        this.router = router;
        this.mapInstance = null;
        this.storyMarkers = [];
        this.allFetchedStories = []; // Untuk menyimpan semua cerita yang diambil

        // Mengikat event handler dari View ke Presenter
        this.view.setAddStoryClickHandler(this.handleAddStoryClick.bind(this));
        this.view.setClearOfflineDataClickHandler(this.handleClearOfflineDataClick.bind(this));
        this.view.setViewFavoriteStoriesClickHandler(this.handleViewFavoriteStoriesClick.bind(this)); // <-- Handler baru
        this.view.setSaveStoryClickHandler(this.handleSaveStoryClick.bind(this)); // <-- Handler baru

        this.loadStories(); // Muat cerita saat presenter diinisialisasi
    }

    handleAddStoryClick() {
        this.router.navigateTo('/add');
    }

    handleViewFavoriteStoriesClick() { // <-- Handler baru
        this.router.navigateTo('/favorites'); // Arahkan ke halaman favorit
    }

    async handleClearOfflineDataClick() {
        this.view.displayMessage('Clearing all offline cache...', 'info');
        try {
            await clearAllStoriesFromDb(); // Menghapus cache umum
            await this.loadStories(); // Muat ulang cerita dari jaringan
            this.view.displayMessage('All offline data cleared successfully.', 'success');
        } catch (error) {
            console.error('Failed to clear all offline data:', error);
            this.view.displayMessage('Failed to clear all offline data.', 'error');
        }
    }

    async handleSaveStoryClick(storyId, storyElement) { // <-- Handler baru
        this.view.displayMessage('Saving story offline...', 'info');
        try {
            const storyToSave = this.allFetchedStories.find(s => s.id === storyId);
            if (storyToSave) {
                await putFavoriteStory(storyToSave); // Simpan cerita ke store favorit
                this.view.displayMessage('Story saved offline successfully!', 'success');
                this.view.updateSaveButtonStatus(storyId, true); // Perbarui status tombol
            } else {
                this.view.displayMessage('Story not found to save.', 'error');
            }
        } catch (error) {
            console.error('Failed to save story offline:', error);
            this.view.displayMessage('Failed to save story offline.', 'error');
        }
    }


    async loadStories() {
        this.view.showLoadingMessage();
        let stories = [];
        let fromCache = false;

        try {
            const networkResult = await apiGetStories();
            if (!networkResult.error && networkResult.listStory && Array.isArray(networkResult.listStory)) {
                stories = networkResult.listStory;
                this.allFetchedStories = stories; // Simpan semua cerita yang diambil
                await putStories(stories); // Simpan ke IndexedDB (cache umum)
                this.view.displayMessage('Stories loaded from network.', 'info');
            } else {
                console.warn('Network fetch failed or returned error, trying IndexedDB...');
                stories = await getStoriesFromDb();
                this.allFetchedStories = stories; // Simpan juga jika dari cache
                fromCache = true;
                if (stories.length > 0) {
                    this.view.displayMessage('Stories loaded from offline cache.', 'warning');
                } else {
                    this.view.displayMessage('No stories available offline and network failed.', 'error');
                }
            }
        } catch (error) {
            console.error('Failed to load stories from network, attempting IndexedDB:', error);
            try {
                stories = await getStoriesFromDb();
                this.allFetchedStories = stories;
                fromCache = true;
                if (stories.length > 0) {
                    this.view.displayMessage('Stories loaded from offline cache.', 'warning');
                } else {
                    this.view.displayMessage('No stories available offline and network failed.', 'error');
                }
            } catch (dbError) {
                console.error('Failed to load stories from IndexedDB:', dbError);
                this.view.displayMessage('Failed to load any stories.', 'error');
                stories = [];
            }
        }

        // Dapatkan daftar ID cerita favorit untuk memperbarui status tombol
        const favoritedStories = await getFavoriteStories();
        const favoritedStoryIds = new Set(favoritedStories.map(s => s.id));

        if (stories.length > 0) {
            this.view.renderStoryCards(stories, favoritedStoryIds); // Teruskan ID favorit
            this.initializeMap(stories);
        } else if (!fromCache) {
            this.view.showErrorMessage('Failed to load stories from any source.');
        }

        this.view.hideLoadingMessage();
    }

    initializeMap(stories) {
        if (!this.mapInstance) {
            const mapContainer = this.view.getMapContainer();
            if (!mapContainer) {
                console.error("Map container not found in Home View.");
                return;
            }
            this.mapInstance = L.map(mapContainer).setView([0, 0], 2);
            L.tileLayer(
                `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`,
                {
                    attribution: '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
                }
            ).addTo(this.mapInstance);

            setTimeout(() => {
                if (this.mapInstance) this.mapInstance.invalidateSize();
            }, 100);
        } else {
            this.storyMarkers.forEach(marker => {
                this.mapInstance.removeLayer(marker);
            });
            this.storyMarkers = [];
        }

        const validMarkers = [];
        stories.forEach(story => {
            if (story.lat !== null && story.lon !== null) {
                const marker = L.marker([story.lat, story.lon])
                    .addTo(this.mapInstance)
                    .bindPopup(`<b>${story.name}</b><br>${story.description.substring(0, 50)}...<br><a href="#/stories/${story.id}">Read More</a>`);
                validMarkers.push(marker);
                this.storyMarkers.push(marker);
            }
        });

        if (validMarkers.length > 0) {
            const group = new L.featureGroup(validMarkers);
            this.mapInstance.fitBounds(group.getBounds().pad(0.5));
        } else {
            this.mapInstance.setView([0, 0], 2);
        }
    }

    destroy() {
        if (this.mapInstance) {
            console.log("Destroying HomePresenter map instance.");
            this.mapInstance.remove();
            this.mapInstance = null;
        }
        this.storyMarkers = [];
    }
}

export default HomePresenter;
