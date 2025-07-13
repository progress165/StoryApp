import { apiGetStories } from '../utils/api';
import { putStories, getStoriesFromDb, clearAllStoriesFromDb } from '../utils/indexeddb'; // <-- Import fungsi IndexedDB
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- PENTING: API KEY MAPTILER ANDA ---
const MAPTILER_API_KEY = 'hDOFAljNTLeFb76lmDks'; // Pastikan ini adalah API Key MapTiler Anda
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
        this.mapInstance = null; // Instance peta
        this.storyMarkers = []; // Menyimpan marker cerita

        // Mengikat event handler dari View ke Presenter
        this.view.setAddStoryClickHandler(this.handleAddStoryClick.bind(this));
        // Tambahkan handler untuk tombol "Clear Offline Data"
        this.view.setClearOfflineDataClickHandler(this.handleClearOfflineDataClick.bind(this));

        this.loadStories(); // Muat cerita saat presenter diinisialisasi
    }

    handleAddStoryClick() {
        this.router.navigateTo('/add');
    }

    async handleClearOfflineDataClick() {
        this.view.displayMessage('Clearing offline data...', 'info');
        try {
            await clearAllStoriesFromDb(); // Panggil fungsi dari IndexedDB util
            this.view.displayMessage('Offline data cleared successfully.', 'success');
            // Muat ulang cerita dari jaringan setelah membersihkan data offline
            await this.loadStories();
        } catch (error) {
            console.error('Failed to clear offline data:', error);
            this.view.displayMessage('Failed to clear offline data.', 'error');
        }
    }

    async loadStories() {
        this.view.showLoadingMessage();
        let stories = [];
        let fromCache = false;

        try {
            // Coba ambil dari jaringan terlebih dahulu
            const networkResult = await apiGetStories(); // Panggil API jaringan
            if (!networkResult.error && networkResult.listStory && Array.isArray(networkResult.listStory)) {
                stories = networkResult.listStory;
                // Simpan ke IndexedDB setelah berhasil dari jaringan
                await putStories(stories); // Simpan ke IndexedDB
                this.view.displayMessage('Stories loaded from network.', 'info');
            } else {
                // Jika jaringan gagal atau ada error, coba dari IndexedDB
                console.warn('Network fetch failed or returned error, trying IndexedDB...');
                stories = await getStoriesFromDb(); // Ambil dari IndexedDB
                fromCache = true;
                if (stories.length > 0) {
                    this.view.displayMessage('Stories loaded from offline cache.', 'warning');
                } else {
                    this.view.displayMessage('No stories available offline and network failed.', 'error');
                }
            }
        } catch (error) {
            // Ini akan terpicu jika ada masalah jaringan (misal offline total)
            console.error('Failed to load stories from network, attempting IndexedDB:', error);
            try {
                stories = await getStoriesFromDb(); // Coba dari IndexedDB
                fromCache = true;
                if (stories.length > 0) {
                    this.view.displayMessage('Stories loaded from offline cache.', 'warning');
                } else {
                    this.view.displayMessage('No stories available offline and network failed.', 'error');
                }
            } catch (dbError) {
                console.error('Failed to load stories from IndexedDB:', dbError);
                this.view.displayMessage('Failed to load any stories.', 'error');
                stories = []; // Pastikan array kosong jika semua gagal
            }
        }

        if (stories.length > 0) {
            this.view.renderStoryCards(stories); // Beri tahu View untuk merender kartu cerita
            this.initializeMap(stories); // Inisialisasi atau perbarui peta
        } else if (!fromCache) {
            // Tampilkan pesan error hanya jika tidak ada cerita dari cache dan network gagal
            this.view.showErrorMessage('Failed to load stories from any source.');
        }

        this.view.hideLoadingMessage(); // Beri tahu View untuk menyembunyikan pesan loading
    }

    initializeMap(stories) {
        if (!this.mapInstance) {
            const mapContainer = this.view.getMapContainer();
            if (!mapContainer) {
                console.error("Map container not found in Home View.");
                return;
            }
            this.mapInstance = L.map(mapContainer).setView([0, 0], 2); // Default view
            L.tileLayer(
                `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`,
                {
                    attribution: '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
                }
            ).addTo(this.mapInstance);

            setTimeout(() => {
                this.mapInstance.invalidateSize();
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
