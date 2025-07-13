// src/main.js
import '../src/styles/main.css';
import { renderHeader } from './components/header';
import { renderLoginPage } from './pages/login';
import LoginPresenter from './presenters/LoginPresenter';
import { renderRegisterPage } from './pages/register';
import RegisterPresenter from './presenters/RegisterPresenter';
import { renderHomePage } from './pages/home';
import HomePresenter from './presenters/HomePresenter';
import { renderAddStoryPage } from './pages/add-story';
import AddStoryPresenter from './presenters/AddStoryPresenter';
import { renderStoryDetailPage } from './pages/story-detail';
import StoryDetailPresenter from './presenters/StoryDetailPresenter';
import { renderNotFoundPage } from './pages/not-found';
import { apiSubscribePush, apiUnsubscribePush } from './utils/api';

const appContent = document.getElementById('app-content');
const appNavigation = document.getElementById('app-navigation'); // Ini masih <nav>
const appHeader = document.getElementById('app-header'); // <-- Dapatkan elemen <header>

if (!appContent) {
    console.error("Error: Element with ID 'app-content' not found in index.html!");
}
if (!appNavigation) {
    console.warn("Warning: Element with ID 'app-navigation' not found in index.html! (This is fine if header is rebuilt)");
}
if (!appHeader) { // <-- Tambahkan cek ini
    console.error("Error: Element with ID 'app-header' not found in index.html!");
}


let currentPresenter = null;

const appRouter = {
    navigateTo: (path) => {
        window.location.hash = path;
    },
    updateHeader: () => {
        // Lewatkan elemen <header> langsung ke renderHeader
        renderHeader(appHeader, appContent); // <-- UBAH PARAMETER PERTAMA
    },
    destroyCurrentPresenter: () => {
        if (currentPresenter && typeof currentPresenter.destroy === 'function') {
            console.log(`Destroying current presenter: ${currentPresenter.constructor.name}`);
            currentPresenter.destroy();
            currentPresenter = null;
        }
    }
};

// --- PWA: Daftarkan Service Worker ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Daftarkan Service Worker dari root domain
        // Menggunakan window.location.origin untuk memastikan jalur absolut
        navigator.serviceWorker.register(`${window.location.origin}/sw.js`)
            .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
                setupPushNotificationToggle(registration);
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
    });
}

// --- PUSH NOTIFICATION: VAPID Public Key dari Dicoding API Docs ---
const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

// Fungsi untuk mengonversi Base64URL string ke Uint8Array
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    console.log("VAPID Key Conversion: Input string =", base64String);
    console.log("VAPID Key Conversion: Output Uint8Array =", outputArray);
    return outputArray;
}

async function subscribePush(registration) {
    if (!('PushManager' in window)) {
        console.warn('PushManager not supported.');
        alert('Push notifications are not supported by your browser.');
        return false;
    }

    if (Notification.permission === 'denied') {
        console.warn('Notification permission denied.');
        alert('You have blocked push notifications. Please enable them in your browser settings.');
        return false;
    }

    try {
        const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey,
        });

        console.log('Push subscribed:', subscription);

        const subscriptionData = subscription.toJSON();
        delete subscriptionData.expirationTime;

        const apiResult = await apiSubscribePush(subscriptionData);
        if (apiResult.error) {
            throw new Error(apiResult.message);
        }

        localStorage.setItem('push_subscription', JSON.stringify(subscription));
        alert('Push notifications subscribed and registered with API!');
        return true;
    } catch (error) {
        console.error('Push subscription failed (before/during API call):', error);
        alert('Failed to subscribe to push notifications: ' + error.message);
        return false;
    }
}

async function unsubscribePush(registration) {
    try {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
            const apiResult = await apiUnsubscribePush(subscription.endpoint);
            if (apiResult.error) {
                throw new Error(apiResult.message);
            }

            await subscription.unsubscribe();
            console.log('Push unsubscribed:', subscription);
            localStorage.removeItem('push_subscription');
            alert('Push notifications unsubscribed!');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Push unsubscribe failed:', error);
        alert('Failed to unsubscribe from push notifications: ' + error.message);
        return false;
    }
}

async function setupPushNotificationToggle(registration) {
    let toggleButton = document.getElementById('push-notification-toggle');
    if (!toggleButton) {
        const observer = new MutationObserver((mutationsList, observer) => {
            toggleButton = document.getElementById('push-notification-toggle');
            if (toggleButton) {
                observer.disconnect();
                attachToggleButtonListener(toggleButton, registration);
            }
        });
        observer.observe(appNavigation, { childList: true, subtree: true });
    } else {
        attachToggleButtonListener(toggleButton, registration);
    }
}

async function attachToggleButtonListener(toggleButton, registration) {
    const updateButtonText = async () => {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
            toggleButton.textContent = 'Nonaktifkan Push';
            toggleButton.classList.add('btn-danger');
            toggleButton.classList.remove('btn-secondary');
        } else {
            toggleButton.textContent = 'Aktifkan Push';
            toggleButton.classList.add('btn-secondary');
            toggleButton.classList.remove('btn-danger');
        }
    };

    toggleButton.addEventListener('click', async () => {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
            await unsubscribePush(registration);
        } else {
            await subscribePush(registration);
        }
        updateButtonText();
    });

    updateButtonText();
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired.");
    appRouter.updateHeader();
    handleRoute();

    const mainContent = document.querySelector("#app-content");
    const skipLink = document.querySelector(".skip-link");

    if (mainContent && skipLink) {
        skipLink.addEventListener("click", function (event) {
            event.preventDefault();
            skipLink.blur();
            mainContent.focus();
            mainContent.scrollIntoView({ behavior: 'smooth' });
        });
    } else {
        console.warn("Skip to Content: Elemen 'mainContent' atau 'skipLink' tidak ditemukan.");
    }
});

const handleRoute = async () => {
    console.log("handleRoute: Current window.location.hash =", window.location.hash);
    const path = window.location.hash.substring(1).replace(/^\//, '');
    console.log("handleRoute: Parsed path =", path);

    const userToken = localStorage.getItem('userToken');
    console.log("handleRoute: userToken =", userToken ? "Exists" : "Does not exist");

    appRouter.destroyCurrentPresenter();

    if (document.startViewTransition) {
        console.log("handleRoute: Starting View Transition...");
        document.startViewTransition(() => {
            appContent.innerHTML = '';
            renderPageContent(path, userToken);
        });
    } else {
        console.log("handleRoute: View Transition API not supported. Performing direct DOM update.");
        appContent.innerHTML = '';
        renderPageContent(path, userToken);
    }

    appRouter.updateHeader();
};

const renderPageContent = (path, userToken) => {
    const validRoutes = ['register', 'login', '', 'add', 'stories/'];

    if (path === 'register') {
        console.log("renderPageContent: Routing to REGISTER page.");
        const registerView = renderRegisterPage(appContent);
        currentPresenter = new RegisterPresenter(registerView, appRouter);
    } else if (path === 'login' || (!userToken && path !== 'register')) {
        console.log("renderPageContent: Routing to LOGIN page.");
        const loginView = renderLoginPage(appContent);
        currentPresenter = new LoginPresenter(loginView, appRouter);
    } else if (path === '') {
        console.log("renderPageContent: Routing to ROOT path ('').");
        if (userToken) {
            console.log("renderPageContent: User logged in, routing to HOME page.");
            const homeView = renderHomePage(appContent);
            currentPresenter = new HomePresenter(homeView, appRouter);
        } else {
            console.log("renderPageContent: User not logged in, redirecting to LOGIN and rendering login page.");
            window.location.hash = '/login';
        }
    } else if (path === 'add') {
        if (!userToken) {
            console.log("renderPageContent: User not logged in, redirecting to LOGIN for 'add' route.");
            window.location.hash = '/login';
            return;
        }
        console.log("renderPageContent: Routing to ADD STORY page.");
        const addStoryView = renderAddStoryPage(appContent);
        currentPresenter = new AddStoryPresenter(addStoryView, appRouter);
    } else if (path.startsWith('stories/')) {
        const storyId = path.split('/')[1];
        if (!userToken) {
            console.log("renderPageContent: User not logged in, redirecting to LOGIN for 'stories' route.");
            window.location.hash = '/login';
            return;
        }
        console.log(`renderPageContent: Routing to STORY DETAIL page for ID: ${storyId}.`);
        const storyDetailView = renderStoryDetailPage(appContent);
        currentPresenter = new StoryDetailPresenter(storyDetailView, storyId, appRouter);
    } else {
        console.log("renderPageContent: Unknown path, routing to NOT FOUND page. Path =", path);
        renderNotFoundPage(appContent);
    }
};

window.addEventListener('hashchange', () => {
    console.log("hashchange event fired. Calling handleRoute().");
    handleRoute();
});
