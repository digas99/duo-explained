export const storage = {
    get(key) {
        return new Promise(resolve => chrome.storage.sync.get(key, data => resolve(data[key])));
    },

    set(key, value) {
        return new Promise(resolve => chrome.storage.sync.set({ [key]: value }, resolve));
    },

    remove(key) {
        return new Promise(resolve => chrome.storage.sync.remove(key, resolve));
    }
};

export const localStore = {
    get(key) {
        return localStorage.getItem(key);
    },

    set(key, value) {
        localStorage.setItem(key, value);
    },

    remove(key) {
        localStorage.removeItem(key);
    }
};