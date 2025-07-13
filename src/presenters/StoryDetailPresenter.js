import { apiGetStoryDetail } from '../utils/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';


const MAPTILER_API_KEY = 'hDOFAljNTLeFb76lmDks';


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
        this.mapInstance = null; // Instance peta

        this.view.setBackToHomeButtonHandler(this.handleBackToHomeClick.bind(this));
        this.loadStoryDetail(); // Muat detail cerita saat presenter diinisialisasi
    }

    handleBackToHomeClick() {
        this.router.navigateTo('/');
    }

    async loadStoryDetail() {
        this.view.showLoadingMessage();

        const result = await apiGetStoryDetail(this.storyId); // Panggil Model

        if (!result.error && result.story) {
            const story = result.story;
            this.view.renderStoryDetails(story); // Beri tahu View untuk merender detail

            // Inisialisasi peta jika ada data lokasi
            if (story.lat !== null && story.lon !== null) {
                this.initializeMap(story);
            } else {
                this.view.showLocationNotAvailable();
            }

        } else {
            this.view.showErrorMessage(result.message || 'Failed to load story details.');
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
            this.mapInstance.invalidateSize();
        }, 100);
    }

    // Metode untuk membersihkan peta saat presenter tidak lagi dibutuhkan
    destroy() {
        if (this.mapInstance) {
            console.log("Destroying StoryDetailPresenter map instance.");
            this.mapInstance.remove();
            this.mapInstance = null;
        }
    }
}

export default StoryDetailPresenter;