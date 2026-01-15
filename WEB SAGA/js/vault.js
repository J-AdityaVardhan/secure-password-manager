/**
 * WEBSAGA SECURE VAULT ENGINE
 * Uses AES-GCM encryption with PBKDF2 key derivation.
 * No sensitive data is stored in plain text.
 */

const Vault = {
    CONFIG: {
        STORAGE_KEY: 'wsg_vault_data',
        SALT_KEY: 'wsg_vault_salt',
        ITERATIONS: 100000,
        KEY_LENGTH: 256,
        ALGO_KEY: 'PBKDF2',
        ALGO_ENCRYPT: 'AES-GCM'
    },

    // State
    key: null,
    isUnlocked: false,

    // 1. SETUP / INIT
    hasVault: function () {
        return !!localStorage.getItem(this.CONFIG.STORAGE_KEY);
    },

    // 2. CRYPTO CORE

    // Generate Key from Password
    deriveKey: async function (password, salt) {
        const enc = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
            "raw",
            enc.encode(password),
            { name: "PBKDF2" },
            false,
            ["deriveKey"]
        );

        return window.crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: this.CONFIG.ITERATIONS,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            false, // Key not exportable
            ["encrypt", "decrypt"]
        );
    },

    // Create New Vault
    createVault: async function (password) {
        const salt = window.crypto.getRandomValues(new Uint8Array(16));
        const key = await this.deriveKey(password, salt);

        // Save Salt (public)
        // Store as base64 string
        localStorage.setItem(this.CONFIG.SALT_KEY, this.arrayBufferToBase64(salt));

        // Save Empty Encrypted DB
        const initialData = JSON.stringify([]);
        const encrypted = await this.encryptData(initialData, key);

        localStorage.setItem(this.CONFIG.STORAGE_KEY, JSON.stringify(encrypted));

        this.key = key;
        this.isUnlocked = true;
        return true;
    },

    // Unlock Vault
    unlock: async function (password) {
        const saltStr = localStorage.getItem(this.CONFIG.SALT_KEY);
        if (!saltStr) throw new Error("Vault corrupted or missing salt.");

        const salt = this.base64ToArrayBuffer(saltStr);
        const key = await this.deriveKey(password, salt);

        // Try to decrypt to verify password
        try {
            const rawStored = JSON.parse(localStorage.getItem(this.CONFIG.STORAGE_KEY));
            await this.decryptData(rawStored, key);

            // If successful
            this.key = key;
            this.isUnlocked = true;
            return true;
        } catch (e) {
            return false; // Wrong password
        }
    },

    lock: function () {
        this.key = null;
        this.isUnlocked = false;
    },

    // 3. READ / WRITE

    getItems: async function () {
        if (!this.isUnlocked || !this.key) throw new Error("Vault is locked or not initialized.");

        const rawStored = JSON.parse(localStorage.getItem(this.CONFIG.STORAGE_KEY));
        const json = await this.decryptData(rawStored, this.key);
        return JSON.parse(json);
    },

    saveItems: async function (items) {
        if (!this.isUnlocked || !this.key) throw new Error("Vault is locked.");

        const json = JSON.stringify(items);
        const encrypted = await this.encryptData(json, this.key);
        localStorage.setItem(this.CONFIG.STORAGE_KEY, JSON.stringify(encrypted));
    },

    // 4. HELPERS (Encrypt/Decrypt)

    encryptData: async function (plainText, key) {
        const enc = new TextEncoder();
        const iv = window.crypto.getRandomValues(new Uint8Array(12));

        const encryptedContent = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv },
            key,
            enc.encode(plainText)
        );

        return {
            iv: this.arrayBufferToBase64(iv),
            content: this.arrayBufferToBase64(encryptedContent)
        };
    },

    decryptData: async function (encryptedObj, key) {
        const iv = this.base64ToArrayBuffer(encryptedObj.iv);
        const content = this.base64ToArrayBuffer(encryptedObj.content);

        const decrypted = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: iv },
            key,
            content
        );

        const dec = new TextDecoder();
        return dec.decode(decrypted);
    },

    // Utils
    arrayBufferToBase64: function (buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    },

    base64ToArrayBuffer: function (base64) {
        const binary_string = window.atob(base64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }
};

// Global Exposure
window.Vault = Vault;
