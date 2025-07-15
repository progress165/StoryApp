import { apiGetStoryDetail, apiGetStories } from '../utils/api'; // <-- Import apiGetStories juga
import { getStoriesFromDb } from '../utils/indexeddb'; // <-- Import getStoriesFromDb
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


class StoryDetailPresenter {
    constructor(view, storyId, router) {
        this.view = view;
        this.storyId = storyId;
        this.router = router;
        this.mapInstance = null;

        this.view.setBackToHomeButtonHandler(this.handleBackToHomeClick.bind(this));
        this.loadStoryDetail(); // Muat detail cerita saat presenter diinisialisasi
    }

    handleBackToHomeClick() {
        this.router.navigateTo('/');
    }

    async loadStoryDetail() {
        this.view.showLoadingMessage();
        let story = null;
        let fromCache = false;

        try {
            // Coba ambil dari jaringan terlebih dahulu
            const networkResult = await apiGetStoryDetail(this.storyId);
            if (!networkResult.error && networkResult.story) {
                story = networkResult.story;
                // Tidak perlu menyimpan ke IndexedDB di sini karena HomePresenter sudah menyimpannya
                // saat mengambil daftar cerita.
                this.view.displayMessage('Story loaded from network.', 'info');
            } else {
                // Jika jaringan gagal atau ada error, coba dari IndexedDB
                console.warn('Network fetch for story detail failed, trying IndexedDB...');
                const allStories = await getStoriesFromDb(); // Ambil SEMUA cerita dari DB
                story = allStories.find(s => s.id === this.storyId); // Cari cerita spesifik
                fromCache = true;
                if (story) {
                    this.view.displayMessage('Story loaded from offline cache.', 'warning');
                } else {
                    this.view.displayMessage('Story not found offline and network failed.', 'error');
                }
            }
        } catch (error) {
            console.error('Failed to load story detail from network, attempting IndexedDB:', error);
            try {
                const allStories = await getStoriesFromDb();
                story = allStories.find(s => s.id === this.storyId);
                fromCache = true;
                if (story) {
                    this.view.displayMessage('Story loaded from offline cache.', 'warning');
                } else {
                    this.view.displayMessage('Story not found offline and network failed.', 'error');
                }
            } catch (dbError) {
                console.error('Failed to load story detail from IndexedDB:', dbError);
                this.view.displayMessage('Failed to load story detail from any source.', 'error');
            }
        }

        if (story) {
            this.view.renderStoryDetails(story); // Beri tahu View untuk merender detail
            if (story.lat !== null && story.lon !== null) {
                this.initializeMap(story);
            } else {
                this.view.showLocationNotAvailable();
            }
        } else {
            this.view.showErrorMessage('Failed to load story details.');
        }
    }

    initializeMap(story) {
        const mapContainer = this.view.getMapContainerElement();
        if (!mapContainer) {
            console.error("Map container not found in Story Detail View.");
            return;
        }

        this.mapInstance = L.map(mapContainer).setView([story.lat, story.lon], 13);

        L.tileLayer(
            `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`,
            {
                attribution: '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
            }
        ).addTo(this.mapInstance);

        L.marker([story.lat, story.lon])
            .addTo(this.mapInstance)
            .bindPopup(`<b>${story.name}</b><br>${story.description.substring(0, 50)}...`)
            .openPopup();

        setTimeout(() => {
            if (this.mapInstance) this.mapInstance.invalidateSize();
        }, 100);
    }

    destroy() {
        if (this.mapInstance) {
            console.log("Destroying StoryDetailPresenter map instance.");
            this.mapInstance.remove();
            this.mapInstance = null;
        }
    }
}

export default StoryDetailPresenter;
