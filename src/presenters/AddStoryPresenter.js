import { apiAddStory } from '../utils/api';

class AddStoryPresenter {
    constructor(view, router) {
        this.view = view;
        this.router = router;

        // Mengikat event handler dari View ke metode Presenter
        this.view.setOpenCameraButtonHandler(this.handleOpenCameraClick.bind(this));
        this.view.setTakePhotoButtonHandler(this.handleTakePhotoClick.bind(this));
        this.view.setRetakePhotoButtonHandler(this.handleRetakePhotoClick.bind(this));
        this.view.setCloseCameraButtonHandler(this.handleCloseCameraClick.bind(this));
        this.view.setFilePhotoInputHandler(this.handleFilePhotoChange.bind(this));
        this.view.setAddStoryFormSubmitHandler(this.handleAddStorySubmit.bind(this));

        // Meminta View untuk menginisialisasi peta
        this.view.initMap(this.handleMapClick.bind(this)); // Pass callback for map clicks
    }

    // --- Event Handlers (Dipanggil oleh View) ---
    async handleOpenCameraClick() {
        try {
            this.view.clearMessage();
            await this.view.startCamera(); // Minta View untuk memulai kamera
            // Tampilan tombol dikelola oleh View
        } catch (error) {
            // Error ditangani dan ditampilkan oleh View
            console.error("Presenter caught camera start error:", error);
        }
    }

    handleTakePhotoClick() {
        this.view.capturePhoto(); // Minta View untuk mengambil foto
        // Tampilan tombol dikelola oleh View setelah foto diambil
    }

    handleRetakePhotoClick() {
        this.view.hideCapturedPhoto();
        this.view.showRetakePhotoButton(); // Ini harusnya Hide Retake.
        this.view.showOpenCameraButton(); // Tampilkan Open Camera lagi
        this.view.clearMessage();
        this.handleOpenCameraClick(); // Panggil kembali untuk buka kamera
    }

    handleCloseCameraClick() {
        this.view.stopCamera(); // Minta View untuk menghentikan kamera
        this.view.showOpenCameraButton(); // Tampilkan tombol buka kamera
        this.view.hideTakePhotoButton();
        this.view.hideRetakePhotoButton();
        this.view.hideCloseCameraButton();
        this.view.showFilePhotoInput();
        this.view.hideCapturedPhoto();
        this.view.hideCameraPreview();
        this.view.clearMessage();
    }

    handleFilePhotoChange(file) {
        if (file) {
            this.view.setCapturedPhotoSrc(URL.createObjectURL(file)); // Presenter meminta View menampilkan foto
            this.view.showCapturedPhoto();
            this.view.hideOpenCameraButton();
            this.view.hideTakePhotoButton();
            this.view.showRetakePhotoButton();
            this.view.hideCloseCameraButton();
        } else {
            this.view.hideCapturedPhoto();
            this.view.showOpenCameraButton();
            this.view.hideRetakePhotoButton();
        }
    }

    handleMapClick(lat, lon) {
        // Presenter menerima informasi klik dari View
        this.view.setLatLonInputs(lat, lon);
    }

    async handleAddStorySubmit() {
        const description = this.view.getDescription();
        const photoFile = this.view.getCapturedPhotoFile(); // Presenter meminta file dari View
        const lat = this.view.getLat();
        const lon = this.view.getLon();

        // Validasi (tetap di Presenter)
        if (!description || description.trim() === '') {
            this.view.displayMessage('Description cannot be empty.', 'error');
            return;
        }
        if (!photoFile) {
            this.view.displayMessage('Please capture a photo or select from file.', 'error');
            return;
        }

        this.view.displayMessage('Uploading story...', 'info');

        const result = await apiAddStory(description, photoFile, lat, lon); // Panggil Model

        if (!result.error) {
            this.view.displayMessage('Story published successfully! Redirecting...', 'success');
            this.view.resetView(); // Minta View untuk mereset tampilan dan state internalnya
            this.router.navigateTo('/'); // Kembali ke Home
        } else {
            this.view.displayMessage(`Failed to publish story: ${result.message}`, 'error');
        }
    }

    // Metode untuk membersihkan resource saat presenter tidak lagi dibutuhkan (dipanggil dari router)
    destroy() {
        this.view.destroy(); // Minta View untuk membersihkan resource internalnya
    }
}

export default AddStoryPresenter;