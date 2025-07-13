export function renderRegisterPage(container) {
    container.innerHTML = `
        <section class="register-page">
            <h2 class="page-title">Register for Story App</h2>
            <form id="register-form">
                <div class="form-group">
                    <label for="register-name">Name:</label>
                    <input type="text" id="register-name" name="name" required>
                </div>
                <div class="form-group">
                    <label for="register-email">Email:</label>
                    <input type="email" id="register-email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="register-password">Password:</label>
                    <input type="password" id="register-password" name="password" required>
                </div>
                <button type="submit" class="btn btn-primary">Register</button>
                <p class="mt-3">Already have an account? <a href="#/login">Login here</a>.</p>
            </form>
            <div id="register-message" class="message-area"></div>
        </section>
    `;

    const registerForm = document.getElementById('register-form');
    const registerMessage = document.getElementById('register-message');

    // --- Metode yang akan dipanggil oleh Presenter untuk mengikat event ---
    const setRegisterSubmitHandler = (handler) => {
        registerForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            handler(name, email, password); // Meneruskan data ke handler Presenter
        });
    };

    // --- Metode yang akan dipanggil oleh Presenter untuk memperbarui UI ---
    const displayMessage = (message, type) => {
        registerMessage.textContent = message;
        registerMessage.className = `message-area ${type}`;
    };

    return {
        setRegisterSubmitHandler,
        displayMessage,
    };
}