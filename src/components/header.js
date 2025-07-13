export function renderHeader(headerElement, mainContentContainer) {
    const userToken = localStorage.getItem('userToken');
    console.log("Header Render: userToken status =", userToken ? "Logged In" : "Logged Out");
    console.log("Header Render: headerElement =", headerElement); // <-- Log elemen header

    if (!headerElement) { // <-- Cek langsung headerElement
        console.error("Header Render: Header element is null! Cannot render header.");
        return;
    }


    headerElement.innerHTML = `
        <h1>Story App</h1>
        <button id="hamburger-button" class="hamburger-button" aria-label="Toggle navigation">
            <span class="hamburger-icon"></span>
            <span class="hamburger-icon"></span>
            <span class="hamburger-icon"></span>
        </button>
        <nav id="app-navigation" class="main-nav-links"> <!-- <-- Gunakan ID yang sama -->
            <!-- Link navigasi akan dimuat di sini oleh JS -->
        </nav>
    `;
    // --- AKHIR REVISI ---

    // Dapatkan referensi elemen anak dari headerElement yang baru saja dibangun ulang
    const mainNavLinks = headerElement.querySelector('#app-navigation'); // <-- Seleksi dari headerElement
    const hamburgerButton = headerElement.querySelector('#hamburger-button'); // <-- Seleksi dari headerElement

    if (!mainNavLinks || !hamburgerButton) { // <-- Tambahkan cek ini
        console.error("Header Render: Navigation or hamburger button not found after rebuilding header.");
        return;
    }

    const navLinksData = [
        { name: 'Home', path: '#/' },
        { name: 'Add Story', path: '#/add', authRequired: true },
        { name: 'Login', path: '#/login', guestOnly: true },
        { name: 'Register', path: '#/register', guestOnly: true },
        { name: 'Push', action: 'togglePush', authRequired: true },
        { name: 'Logout', action: 'logout', authRequired: true },
    ];

    navLinksData.forEach(link => {
        const shouldSkip = (link.authRequired && !userToken) || (link.guestOnly && userToken);
        if (shouldSkip) {
            return;
        }

        const anchor = document.createElement('a');
        anchor.textContent = link.name;
        anchor.classList.add('nav-link');

        if (link.action === 'logout') {
            anchor.href = 'javascript:void(0)';
            anchor.addEventListener('click', () => {
                localStorage.removeItem('userToken');
                alert('You have been logged out.');
                window.location.hash = '/login';
            });
        } else if (link.action === 'togglePush') {
            anchor.href = 'javascript:void(0)';
            anchor.id = 'push-notification-toggle';
        } else {
            anchor.href = link.path;
        }
        mainNavLinks.appendChild(anchor);
    });

    // --- Logika Toggle Hamburger Menu ---
    if (hamburgerButton && mainNavLinks) {
        hamburgerButton.addEventListener('click', () => {
            mainNavLinks.classList.toggle('nav-open');
            hamburgerButton.classList.toggle('is-active');
        });

        mainNavLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (mainNavLinks.classList.contains('nav-open')) {
                    mainNavLinks.classList.remove('nav-open');
                    hamburgerButton.classList.remove('is-active');
                }
            });
        });
    } else {
        console.warn("Header Render: Hamburger button or main navigation links not found (after rebuild).");
    }
}
