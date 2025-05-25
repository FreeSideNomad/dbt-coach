// AES-GCM symmetric encryption for chat messages
// Usage: await SymmetricCrypto.encrypt(plaintext, key) and await SymmetricCrypto.decrypt(ciphertext, iv, key)
export class SymmetricCrypto {
  static async generateKey(): Promise<string> {
    const key = await window.crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    const raw = await window.crypto.subtle.exportKey('raw', key);
    return btoa(String.fromCharCode(...new Uint8Array(raw)));
  }

  static async encrypt(plaintext: string, keyB64: string): Promise<{ ciphertext: string; iv: string }> {
    const key = await window.crypto.subtle.importKey(
      'raw',
      Uint8Array.from(atob(keyB64), c => c.charCodeAt(0)),
      'AES-GCM',
      false,
      ['encrypt']
    );
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const ciphertext = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(plaintext)
    );
    return {
      ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
      iv: btoa(String.fromCharCode(...iv))
    };
  }

  static async decrypt(ciphertextB64: string, ivB64: string, keyB64: string): Promise<string> {
    const key = await window.crypto.subtle.importKey(
      'raw',
      Uint8Array.from(atob(keyB64), c => c.charCodeAt(0)),
      'AES-GCM',
      false,
      ['decrypt']
    );
    const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
    const ciphertext = Uint8Array.from(atob(ciphertextB64), c => c.charCodeAt(0));
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );
    return new TextDecoder().decode(decrypted);
  }
}
