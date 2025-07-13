// src/pages/add-story.js (View)
import 'leaflet/dist/leaflet.css'; // Import CSS Leaflet
import L from 'leaflet';           // Import object Leaflet

// --- PENTING: API KEY MAPTILER ANDA ---
const MAPTILER_API_KEY = 'hDOFAljNTLeFb76lmDks';
// --- AKHIR API KEY ---

// Mengimpor gambar-gambar default ikon Leaflet (untuk marker)
// Ini diperlukan karena View yang akan menginisialisasi peta
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Pastikan Leaflet icon path diatur sekali saja untuk seluruh aplikasi
L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetinaUrl,
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
});

/**
 * renderAddStoryPage bertanggung jawab untuk merender UI tambah cerita baru.
 * Ini adalah bagian "View" dari pola MVP.
 * View sekarang mengelola inisialisasi kamera dan peta, serta state-nya sendiri.
 * @param {HTMLElement} container - Elemen DOM tempat konten akan dirender.
 * @returns {object} Objek View dengan metode untuk interaksi UI dan permintaan Presenter.
 */
export function renderAddStoryPage(container) {
    container.innerHTML = `
        <section class="add-story-page">
            <h2 class="page-title">Add New Story</h2>
            <form id="add-story-form">
                <div class="form-group">
                    <label for="story-description">Description:</label>
                    <textarea id="story-description" name="description" rows="5" required></textarea>
                </div>

                <div class="form-group">
                    <label>Photo:</label>
                    <div class="camera-controls">
                        <video id="camera-preview" autoplay playsinline class="hidden"></video>
                        <canvas id="photo-canvas" class="hidden"></canvas>
                        <img id="captured-photo" class="hidden" alt="Captured Photo">
                        
                        <div class="camera-buttons">
                            <button type="button" id="open-camera-btn" class="btn btn-secondary">Buka Kamera</button>
                            <button type="button" id="take-photo-btn" class="btn btn-primary hidden">Ambil Foto</button>
                            <button type="button" id="retake-photo-btn" class="btn btn-info hidden">Ulangi</button>
                            <button type="button" id="close-camera-btn" class="btn btn-danger hidden">Tutup Kamera</button>
                            <input type="file" id="file-photo-input" accept="image/*" class="btn btn-secondary">
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label>Location (Optional):</label>
                    <div id="location-map" style="height: 300px; width: 100%; border-radius: 8px;"></div>
                    <div class="location-inputs">
                        <label for="lat-input">Latitude:</label>
                        <input type="text" id="lat-input" readonly>
                        <label for="lon-input">Longitude:</label>
                        <input type="text" id="lon-input" readonly>
                    </div>
                </div>
                
                <button type="submit" class="btn btn-primary">Publish Story</button>
            </form>
            <div id="add-story-message" class="message-area"></div>
        </section>
    `;

    // --- DOM Elements ---
    const addStoryForm = document.getElementById('add-story-form');
    const addStoryMessage = document.getElementById('add-story-message');
    const storyDescription = document.getElementById('story-description');
    const latInput = document.getElementById('lat-input');
    const lonInput = document.getElementById('lon-input');

    const cameraPreview = document.getElementById('camera-preview');
    const photoCanvas = document.getElementById('photo-canvas');
    const capturedPhoto = document.getElementById('captured-photo');

    const openCameraBtn = document.getElementById('open-camera-btn');
    const takePhotoBtn = document.getElementById('take-photo-btn');
    const retakePhotoBtn = document.getElementById('retake-photo-btn');
    const closeCameraBtn = document.getElementById('close-camera-btn');
    const filePhotoInput = document.getElementById('file-photo-input');
    const locationMapDiv = document.getElementById('location-map');

    // --- INTERNAL STATE (Dikelola oleh View) ---
    let mediaStream = null;
    let mapInstance = null;
    let mapMarker = null;
    let currentPhotoFile = null; // Ini akan disimpan di View, dan Presenter akan memintanya.


    // --- Metode Internal untuk Mengelola Tampilan Kamera & Peta ---
    const _initMap = (onMapClickCallback) => {
        if (!mapInstance) {
            mapInstance = L.map(locationMapDiv).setView([-6.2088, 106.8456], 13); // Default ke Jakarta

            L.tileLayer(
                `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`,
                {
                    attribution: '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
                }
            ).addTo(mapInstance);

            // Dapatkan lokasi user saat ini
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        mapInstance.setView([latitude, longitude], 13);
                        mapMarker = L.marker([latitude, longitude]).addTo(mapInstance)
                            .bindPopup('Current Location').openPopup();
                        _setLatLonInputs(latitude, longitude);
                    },
                    (error) => {
                        console.warn('Geolocation error:', error);
                        // Tidak menampilkan pesan error ke user langsung, Presenter yang memutuskan
                    }
                );
            } else {
                console.warn('Geolocation is not supported by your browser.');
            }

            // Event klik pada peta untuk memilih lokasi
            mapInstance.on('click', (e) => {
                const { lat, lng } = e.latlng;
                if (mapMarker) {
                    mapMarker.setLatLng([lat, lng]);
                } else {
                    mapMarker = L.marker([lat, lng]).addTo(mapInstance)
                        .bindPopup('Selected Location').openPopup();
                }
                _setLatLonInputs(lat, lng);
                if (onMapClickCallback) { // Beri tahu Presenter bahwa map diklik
                    onMapClickCallback(lat, lng);
                }
            });

            // Pastikan peta ter-render dengan benar
            setTimeout(() => {
                mapInstance.invalidateSize();
            }, 100);
        }
    };

    const _startCamera = async () => {
        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            cameraPreview.srcObject = mediaStream;
            cameraPreview.classList.remove('hidden');
            openCameraBtn.classList.add('hidden');
            takePhotoBtn.classList.remove('hidden');
            closeCameraBtn.classList.remove('hidden');
            filePhotoInput.classList.add('hidden');
            capturedPhoto.classList.add('hidden');
            photoCanvas.classList.add('hidden');
            _clearMessage();
        } catch (error) {
            console.error('Error accessing camera:', error);
            _displayMessage('Failed to access camera. Please allow camera access.', 'error');
            throw error; // Lempar error agar Presenter juga tahu
        }
    };

    const _capturePhoto = () => {
        photoCanvas.width = cameraPreview.videoWidth;
        photoCanvas.height = cameraPreview.videoHeight;
        const context = photoCanvas.getContext('2d');
        context.drawImage(cameraPreview, 0, 0, photoCanvas.width, photoCanvas.height);

        _stopCameraStream(); // Hentikan stream kamera setelah mengambil foto

        const dataUrl = photoCanvas.toDataURL('image/png');
        capturedPhoto.src = dataUrl;
        capturedPhoto.classList.remove('hidden');

        photoCanvas.toBlob(blob => {
            currentPhotoFile = new File([blob], "captured-photo.png", { type: "image/png" });
        }, 'image/png');

        cameraPreview.classList.add('hidden');
        takePhotoBtn.classList.add('hidden');
        retakePhotoBtn.classList.remove('hidden');
        closeCameraBtn.classList.add('hidden');
        filePhotoInput.classList.add('hidden');
    };

    const _stopCameraStream = () => {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            mediaStream = null;
        }
    };

    const _setLatLonInputs = (lat, lon) => {
        latInput.value = lat !== null ? lat.toFixed(6) : '';
        lonInput.value = lon !== null ? lon.toFixed(6) : '';
    };

    const _clearForm = () => {
        addStoryForm.reset();
        capturedPhoto.classList.add('hidden');
        capturedPhoto.src = ''; // Clear image src
        _setLatLonInputs(null, null);
        currentPhotoFile = null;
        // Reset tampilan tombol kamera
        openCameraBtn.classList.remove('hidden');
        takePhotoBtn.classList.add('hidden');
        retakePhotoBtn.classList.add('hidden');
        closeCameraBtn.classList.add('hidden');
        filePhotoInput.classList.remove('hidden');
        cameraPreview.classList.add('hidden'); // Sembunyikan preview
    };

    const _displayMessage = (message, type) => {
        addStoryMessage.textContent = message;
        addStoryMessage.className = `message-area ${type}`;
    };

    const _clearMessage = () => {
        addStoryMessage.textContent = '';
        addStoryMessage.className = 'message-area';
    };


    // --- View Methods Exposed to Presenter ---
    return {
        // Event Handlers to be set by Presenter
        setOpenCameraButtonHandler: (handler) => openCameraBtn.addEventListener('click', handler),
        setTakePhotoButtonHandler: (handler) => takePhotoBtn.addEventListener('click', handler),
        setRetakePhotoButtonHandler: (handler) => retakePhotoBtn.addEventListener('click', handler),
        setCloseCameraButtonHandler: (handler) => closeCameraBtn.addEventListener('click', handler),
        setFilePhotoInputHandler: (handler) => filePhotoInput.addEventListener('change', (event) => handler(event.target.files[0])),
        setAddStoryFormSubmitHandler: (handler) => addStoryForm.addEventListener('submit', (event) => {
            event.preventDefault();
            handler(); // Panggil handler di Presenter
        }),

        // Methods for Presenter to request actions from View
        initMap: (onMapClickCallback) => _initMap(onMapClickCallback),
        startCamera: () => _startCamera(),
        capturePhoto: () => _capturePhoto(),
        stopCamera: () => _stopCameraStream(), // Stop stream secara eksternal jika diperlukan
        resetPhotoInput: () => { /* Logic to clear photo input visual */ }, // Bisa dikosongkan jika tidak ada input terpisah
        resetView: () => {
            _clearForm();
            _stopCameraStream(); // Pastikan kamera berhenti saat reset
            if (mapMarker) {
                mapInstance.removeLayer(mapMarker);
                mapMarker = null;
            }
            if (mapInstance) {
                mapInstance.setView([-6.2088, 106.8456], 13); // Kembalikan peta ke default
            }
        },


        // Methods for Presenter to get data from View
        getDescription: () => storyDescription.value,
        getLat: () => latInput.value ? parseFloat(latInput.value) : null,
        getLon: () => lonInput.value ? parseFloat(lonInput.value) : null,
        getCapturedPhotoFile: () => currentPhotoFile, // Presenter meminta file dari View

        // Methods for Presenter to update View's display
        displayMessage: (message, type) => _displayMessage(message, type),
        clearMessage: () => _clearMessage(),
        setCapturedPhotoSrc: (src) => _setCapturedPhotoSrc(src), // Menggunakan fungsi internal
        showCameraPreview: () => cameraPreview.classList.remove('hidden'),
        hideCameraPreview: () => cameraPreview.classList.add('hidden'),
        showCapturedPhoto: () => capturedPhoto.classList.remove('hidden'),
        hideCapturedPhoto: () => capturedPhoto.classList.add('hidden'),
        showOpenCameraButton: () => openCameraBtn.classList.remove('hidden'),
        hideOpenCameraButton: () => openCameraBtn.classList.add('hidden'),
        showTakePhotoButton: () => takePhotoBtn.classList.remove('hidden'),
        hideTakePhotoButton: () => takePhotoBtn.classList.add('hidden'),
        showRetakePhotoButton: () => retakePhotoBtn.classList.remove('hidden'),
        hideRetakePhotoButton: () => retakePhotoBtn.classList.add('hidden'),
        showCloseCameraButton: () => closeCameraBtn.classList.remove('hidden'),
        hideCloseCameraButton: () => closeCameraBtn.classList.add('hidden'),
        showFilePhotoInput: () => filePhotoInput.classList.remove('hidden'),
        hideFilePhotoInput: () => filePhotoInput.classList.add('hidden'),
        setCameraPreviewStream: (stream) => cameraPreview.srcObject = stream,
        setLatLonInputs: (lat, lon) => _setLatLonInputs(lat, lon),

        // Metode untuk membersihkan resource saat View tidak lagi dibutuhkan (dipanggil dari Presenter.destroy())
        destroy: () => {
            _stopCameraStream();
            if (mapInstance) {
                mapInstance.remove();
                mapInstance = null;
            }
            mapMarker = null;
            currentPhotoFile = null; // Clear internal state
        },
    };
}