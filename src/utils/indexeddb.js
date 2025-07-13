const DB_NAME = 'story-app-db';
const DB_VERSION = 1; // Tingkatkan versi jika ada perubahan skema database
const STORIES_STORE_NAME = 'stories';


const openDatabase = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORIES_STORE_NAME)) {
                db.createObjectStore(STORIES_STORE_NAME, { keyPath: 'id' });
                console.log(`IndexedDB: Object store '${STORIES_STORE_NAME}' created.`);
            }
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            console.error('IndexedDB: Database open error:', event.target.error);
            reject(event.target.error);
        };
    });
};

export const putStories = async (stories) => {
    const db = await openDatabase();
    // Gunakan mode 'readwrite' untuk transaksi yang bisa menulis data
    const transaction = db.transaction(STORIES_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORIES_STORE_NAME);

    return new Promise((resolve, reject) => {
        stories.forEach(story => {
            store.put(story); // put akan menambah jika belum ada, memperbarui jika sudah ada
        });

        transaction.oncomplete = () => {
            console.log('IndexedDB: Stories saved successfully.');
            resolve();
        };

        transaction.onerror = (event) => {
            console.error('IndexedDB: Save stories error:', event.target.error);
            reject(event.target.error);
        };
    });
};

/**
 * Mengambil semua cerita dari IndexedDB.
 * @returns {Promise<Array<Object>>} Promise yang resolved dengan array objek cerita.
 */
export const getStoriesFromDb = async () => {
    const db = await openDatabase();
    // Gunakan mode 'readonly' untuk transaksi yang hanya membaca data
    const transaction = db.transaction(STORIES_STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORIES_STORE_NAME);
    const request = store.getAll(); // Mengambil semua objek dari object store

    return new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
            console.log('IndexedDB: Stories retrieved successfully.');
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            console.error('IndexedDB: Get stories error:', event.target.error);
            reject(event.target.error);
        };
    });
};

/**
 * Menghapus cerita dari IndexedDB berdasarkan ID.
 * (Opsional, tapi bagus untuk memenuhi kriteria "menghapus data")
 * @param {string} id - ID cerita yang akan dihapus.
 * @returns {Promise<void>}
 */
export const deleteStoryFromDb = async (id) => {
    const db = await openDatabase();
    const transaction = db.transaction(STORIES_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORIES_STORE_NAME);
    const request = store.delete(id);

    return new Promise((resolve, reject) => {
        request.onsuccess = () => {
            console.log(`IndexedDB: Story with ID ${id} deleted successfully.`);
            resolve();
        };

        request.onerror = (event) => {
            console.error('IndexedDB: Delete story error:', event.target.error);
            reject(event.target.error);
        };
    });
};


export const clearAllStoriesFromDb = async () => {
    const db = await openDatabase();
    const transaction = db.transaction(STORIES_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORIES_STORE_NAME);
    const request = store.clear(); // Menghapus semua objek dari object store

    return new Promise((resolve, reject) => {
        request.onsuccess = () => {
            console.log('IndexedDB: All stories cleared successfully.');
            resolve();
        };

        request.onerror = (event) => {
            console.error('IndexedDB: Clear all stories error:', event.target.error);
            reject(event.target.error);
        };
    });
};
