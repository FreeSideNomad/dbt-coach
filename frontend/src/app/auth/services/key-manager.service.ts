import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class KeyManagerService {
  // Get all key labels from IndexedDB
  async getAllLabels(): Promise<string[]> {
    const db = await this.openDB();
    const tx = db.transaction('keys', 'readonly');
    const store = tx.objectStore('keys');
    const labels: string[] = [];
    const req = store.openCursor();
    return new Promise((resolve) => {
      req.onsuccess = (event: any) => {
        const cursor = event.target.result;
        if (cursor) {
          labels.push(cursor.key);
          cursor.continue();
        } else {
          resolve(labels);
        }
      };
      req.onerror = () => resolve([]);
    });
  }

  // Generate keypair, encrypt private key with passphrase, and store in IndexedDB
  async generateAndStoreKeypair(label: string, passphrase: string): Promise<void> {
    // Generate keypair
    const keyPair = await window.crypto.subtle.generateKey(
      { name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
      true,
      ['encrypt', 'decrypt']
    );
    // Export keys
    const publicKey = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
    const privateKey = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
    // Derive key from passphrase
    const enc = new TextEncoder();
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const keyMaterial = await window.crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
    const wrappingKey = await window.crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    // Encrypt private key
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encryptedPrivateKey = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      wrappingKey,
      privateKey
    );
    // Store in IndexedDB
    const db = await this.openDB();
    const tx = db.transaction('keys', 'readwrite');
    const store = tx.objectStore('keys');
    await new Promise((resolve, reject) => {
      const req = store.put({
        label,
        publicKey: this.arrayBufferToBase64(publicKey),
        encryptedPrivateKey: this.arrayBufferToBase64(encryptedPrivateKey),
        salt: this.arrayBufferToBase64(salt),
        iv: this.arrayBufferToBase64(iv)
      }, label);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  // Validate passphrase by attempting to decrypt the encrypted private key for a given label
  async validatePassphrase(label: string, passphrase: string): Promise<boolean> {
    try {
      const db = await this.openDB();
      const tx = db.transaction('keys', 'readonly');
      const store = tx.objectStore('keys');
      const data: any = await new Promise((resolve, reject) => {
        const req = store.get(label);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      if (!data) return false;
      const enc = new TextEncoder();
      const salt = Uint8Array.from(atob(data.salt), c => c.charCodeAt(0));
      const iv = Uint8Array.from(atob(data.iv), c => c.charCodeAt(0));
      const encryptedPrivateKey = Uint8Array.from(atob(data.encryptedPrivateKey), c => c.charCodeAt(0));
      const keyMaterial = await window.crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
      const wrappingKey = await window.crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );
      // Try to decrypt
      await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        wrappingKey,
        encryptedPrivateKey
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  // Helper: open IndexedDB
  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const req = window.indexedDB.open('dbt-coach-keys', 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('keys')) {
          db.createObjectStore('keys');
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  // Helper: ArrayBuffer to base64
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
  }
}
