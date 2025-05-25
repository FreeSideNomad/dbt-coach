// AsymmetricCrypto for RSA key exchange (frontend, WebCrypto API)
export class AsymmetricCrypto {
  static async importPublicKey(pem: string): Promise<CryptoKey> {
    // Remove PEM header/footer and decode base64
    const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
    const der = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    return window.crypto.subtle.importKey(
      'spki',
      der,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      false,
      ['encrypt']
    );
  }

  static async encryptWithPublicKey(data: Uint8Array, publicKey: CryptoKey): Promise<string> {
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      publicKey,
      data
    );
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  }
}
