export function renderLoginPage(container) {
    container.innerHTML = `
        <section class="login-page">
            <h2 class="page-title">Login to Story App</h2>
            <form id="login-form">
                <div class="form-group">
                    <label for="login-email">Email:</label>
                    <input type="email" id="login-email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="login-password">Password:</label>
                    <input type="password" id="login-password" name="password" required>
                </div>
                <button type="submit" class="btn btn-primary">Login</button>
                <p class="mt-3">Don't have an account? <a href="#/register">Register here</a>.</p>
            </form>
            <div id="login-message" class="message-area"></div>
        </section>
    `;

    const loginForm = document.getElementById('login-form');
    const loginMessage = document.getElementById('login-message');

    // --- Metode yang akan dipanggil oleh Presenter untuk mengikat event ---
    const setLoginSubmitHandler = (handler) => {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            handler(email, password); // Meneruskan data ke handler Presenter
        });
    };

    // --- Metode yang akan dipanggil oleh Presenter untuk memperbarui UI ---
    const displayMessage = (message, type) => {
        loginMessage.textContent = message;
        loginMessage.className = `message-area ${type}`;
    };

    return {
        setLoginSubmitHandler,
        displayMessage,
        // Jika ada elemen lain yang perlu diakses atau diubah langsung oleh Presenter, tambahkan di sini
    };
}