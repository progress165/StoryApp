// src/utils/api.js
const BASE_URL = 'https://story-api.dicoding.dev/v1';

// Fungsi bantuan untuk membuat request
async function fetchData(url, options = {}) {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) {
        // Jika respons tidak OK (misal 4xx, 5xx), lemparkan error dengan pesan dari API
        throw new Error(data.message || 'Something went wrong');
    }
    return data;
}

// Fungsi untuk registrasi/login
export async function apiRegister(name, email, password) {
    try {
        const result = await fetchData(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });
        return { error: false, message: result.message };
    } catch (error) {
        return { error: true, message: error.message };
    }
}

export async function apiLogin(email, password) {
    try {
        const rawApiResponse = await fetchData(`${BASE_URL}/login`, { // Menggunakan nama variabel yang lebih jelas
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        // --- PERBAIKAN DI SINI! ---
        // Token ada di rawApiResponse.loginResult.token
        return {
            error: false,
            message: rawApiResponse.message,
            token: rawApiResponse.loginResult.token // <-- Ambil token dari properti yang benar
        };
        // --- AKHIR PERBAIKAN ---
    } catch (error) {
        return { error: true, message: error.message };
    }
}

// Fungsi untuk mendapatkan semua cerita
export async function apiGetStories() {
    try {
        const token = localStorage.getItem('userToken');
        if (!token) {
            throw new Error('No authentication token found.');
        }
        const result = await fetchData(`${BASE_URL}/stories`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        // Asumsi daftar cerita ada di result.listStory
        return { error: false, listStory: result.listStory };
    } catch (error) {
        return { error: true, message: error.message };
    }
}

// Fungsi untuk menambahkan cerita baru
export async function apiAddStory(description, photo, lat, lon) {
    try {
        const token = localStorage.getItem('userToken');
        if (!token) {
            throw new Error('No authentication token found.');
        }

        const formData = new FormData();
        formData.append('description', description);
        formData.append('photo', photo);
        if (lat !== null && lon !== null) {
            formData.append('lat', lat);
            formData.append('lon', lon);
        }

        const result = await fetchData(`${BASE_URL}/stories`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
        });
        return { error: false, message: result.message };
    } catch (error) {
        return { error: true, message: error.message };
    }
}

// Fungsi untuk mendapatkan detail cerita
export async function apiGetStoryDetail(id) {
    try {
        const token = localStorage.getItem('userToken');
        if (!token) {
            throw new Error('No authentication token found.');
        }
        const result = await fetchData(`${BASE_URL}/stories/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        // Asumsi detail cerita ada di result.story
        return { error: false, story: result.story };
    } catch (error) {
        return { error: true, message: error.message };
    }
}

// --- FUNGSI PUSH NOTIFICATION ---
export async function apiSubscribePush(subscription) {
    try {
        const token = localStorage.getItem('userToken');
        if (!token) {
            throw new Error('No authentication token found.');
        }
        const result = await fetchData(`${BASE_URL}/notifications/subscribe`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscription),
        });
        return { error: false, message: result.message };
    } catch (error) {
        return { error: true, message: error.message };
    }
}

export async function apiUnsubscribePush(endpoint) {
    try {
        const token = localStorage.getItem('userToken');
        if (!token) {
            throw new Error('No authentication token found.');
        }
        const result = await fetchData(`${BASE_URL}/notifications/subscribe`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ endpoint }),
        });
        return { error: false, message: result.message };
    } catch (error) {
        return { error: true, message: error.message };
    }
}
