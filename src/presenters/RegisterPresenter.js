import { apiRegister } from '../utils/api'; // Model


class RegisterPresenter {
    constructor(view, router) {
        this.view = view;
        this.router = router;
        this.view.setRegisterSubmitHandler(this.handleRegisterSubmit.bind(this)); // Mengikat event handler dari View
    }

    async handleRegisterSubmit(name, email, password) {
        this.view.displayMessage('Registering...', 'info');

        const result = await apiRegister(name, email, password); // Panggil Model

        if (!result.error) {
            this.view.displayMessage('Registration successful! You can now login.', 'success');
            // Beri tahu router untuk navigasi ke login setelah register berhasil
            setTimeout(() => {
                this.router.navigateTo('/login');
            }, 1500);
        } else {
            this.view.displayMessage(`Registration failed: ${result.message}`, 'error');
        }
    }
}

export default RegisterPresenter;