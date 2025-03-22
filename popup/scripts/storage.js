import { storage } from "/scripts/config.js";

export const browserStore = {
    get(key) {
        return new Promise(resolve => storage.get(key, data => resolve(data[key])));
    },

    set(key, value) {
        return new Promise(resolve => storage.set({ [key]: value }, resolve));
    },

    remove(key) {
        return new Promise(resolve => storage.remove(key, resolve));
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