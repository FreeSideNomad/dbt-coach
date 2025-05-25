import { SymmetricCrypto } from './symmetric-crypto';

describe('SymmetricCrypto', () => {
  let key: string;
  const plaintext = 'Hello, encrypted world!';

  beforeAll(async () => {
    key = await SymmetricCrypto.generateKey();
  });

  it('should generate a base64 key of correct length', () => {
    const raw = atob(key);
    expect(raw.length).toBe(32); // 256 bits
  });

  it('should encrypt and decrypt a string correctly', async () => {
    const encrypted = await SymmetricCrypto.encrypt(plaintext, key);
    expect(encrypted.ciphertext).toBeTruthy();
    expect(encrypted.iv).toBeTruthy();
    const decrypted = await SymmetricCrypto.decrypt(encrypted.ciphertext, encrypted.iv, key);
    expect(decrypted).toBe(plaintext);
  });

  it('should fail to decrypt with wrong key', async () => {
    const encrypted = await SymmetricCrypto.encrypt(plaintext, key);
    const wrongKey = await SymmetricCrypto.generateKey();
    await expectAsync(SymmetricCrypto.decrypt(encrypted.ciphertext, encrypted.iv, wrongKey)).toBeRejected();
  });
});
