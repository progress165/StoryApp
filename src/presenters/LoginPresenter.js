import { apiLogin } from '../utils/api'; // Model

class LoginPresenter {
    constructor(view, router) {
        this.view = view;
        this.router = router;
        this.view.setLoginSubmitHandler(this.handleLoginSubmit.bind(this)); // Mengikat event handler dari View
    }

    async handleLoginSubmit(email, password) {
        this.view.displayMessage('Logging in...', 'info');

        const result = await apiLogin(email, password); // Panggil Model

        if (!result.error) {
            if (result.token) {
                localStorage.setItem('userToken', result.token);
                this.view.displayMessage('Login successful! Redirecting to home...', 'success');
                this.router.navigateTo('/');
            } else {
                // Ini seharusnya tidak terpicu jika API selalu mengembalikan token saat sukses
                this.view.displayMessage('Login successful, but no token received.', 'warning');
                console.warn('Login successful, but API response did not contain token:', result);
            }
            // --- AKHIR PERBAIKAN ---
        } else {
            this.view.displayMessage(`Login failed: ${result.message}`, 'error');
        }
    }
}

export default LoginPresenter;
