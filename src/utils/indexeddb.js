const DB_NAME = 'story-app-db';
const DB_VERSION = 2;
const STORIES_STORE_NAME = 'stories';
const FAVORITE_STORIES_STORE_NAME = 'favorite-stories';


const openDatabase = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            console.log(`IndexedDB: Upgrading database to version ${event.newVersion}`);

            if (!db.objectStoreNames.contains(STORIES_STORE_NAME)) {
                db.createObjectStore(STORIES_STORE_NAME, { keyPath: 'id' });
                console.log(`IndexedDB: Object store '${STORIES_STORE_NAME}' created.`);
            }
            // Buat object store baru untuk cerita favorit
            if (!db.objectStoreNames.contains(FAVORITE_STORIES_STORE_NAME)) {
                db.createObjectStore(FAVORITE_STORIES_STORE_NAME, { keyPath: 'id' });
                console.log(`IndexedDB: Object store '${FAVORITE_STORIES_STORE_NAME}' created.`);
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
    const transaction = db.transaction(STORIES_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORIES_STORE_NAME);

    return new Promise((resolve, reject) => {
        stories.forEach(story => {
            store.put(story);
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

export const getStoriesFromDb = async () => {
    const db = await openDatabase();
    const transaction = db.transaction(STORIES_STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORIES_STORE_NAME);
    const request = store.getAll();

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
    const request = store.clear();

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

export const putFavoriteStory = async (story) => {
    const db = await openDatabase();
    const transaction = db.transaction(FAVORITE_STORIES_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(FAVORITE_STORIES_STORE_NAME);

    return new Promise((resolve, reject) => {
        store.put(story);
        transaction.oncomplete = () => {
            console.log(`IndexedDB: Favorite story '${story.id}' saved successfully.`);
            resolve();
        };
        transaction.onerror = (event) => {
            console.error('IndexedDB: Save favorite story error:', event.target.error);
            reject(event.target.error);
        };
    });
};

export const getFavoriteStories = async () => {
    const db = await openDatabase();
    const transaction = db.transaction(FAVORITE_STORIES_STORE_NAME, 'readonly');
    const store = transaction.objectStore(FAVORITE_STORIES_STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
            console.log('IndexedDB: Favorite stories retrieved successfully.');
            resolve(event.target.result);
        };
        request.onerror = (event) => {
            console.error('IndexedDB: Get favorite stories error:', event.target.error);
            reject(event.target.error);
        };
    });
};

export const deleteFavoriteStory = async (id) => {
    const db = await openDatabase();
    const transaction = db.transaction(FAVORITE_STORIES_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(FAVORITE_STORIES_STORE_NAME);
    const request = store.delete(id);

    return new Promise((resolve, reject) => {
        request.onsuccess = () => {
            console.log(`IndexedDB: Favorite story '${id}' deleted successfully.`);
            resolve();
        };
        request.onerror = (event) => {
            console.error('IndexedDB: Delete favorite story error:', event.target.error);
            reject(event.target.error);
        };
    });
};

export const isStoryFavorited = async (id) => {
    const db = await openDatabase();
    const transaction = db.transaction(FAVORITE_STORIES_STORE_NAME, 'readonly');
    const store = db.transaction(FAVORITE_STORIES_STORE_NAME, 'readonly').objectStore(FAVORITE_STORIES_STORE_NAME); // <-- Perbaikan di sini
    const request = store.get(id);

    return new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
            resolve(!!event.target.result); // Mengembalikan true jika ditemukan, false jika tidak
        };
        request.onerror = (event) => {
            console.error('IndexedDB: Check favorite story error:', event.target.error);
            reject(event.target.error);
        };
    });
};
