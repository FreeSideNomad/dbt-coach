import base64
import pytest
from app.core.symmetric_crypto import SymmetricCrypto

def test_generate_key_length():
    key_b64 = SymmetricCrypto.generate_key()
    key = base64.b64decode(key_b64)
    assert len(key) == 32  # 256 bits

def test_encrypt_decrypt_roundtrip():
    key_b64 = SymmetricCrypto.generate_key()
    plaintext = b"Hello, backend crypto!"
    encrypted = SymmetricCrypto.encrypt(plaintext, key_b64)
    decrypted = SymmetricCrypto.decrypt(encrypted['ciphertext'], encrypted['iv'], key_b64)
    assert decrypted == plaintext

def test_decrypt_with_wrong_key_fails():
    key1 = SymmetricCrypto.generate_key()
    key2 = SymmetricCrypto.generate_key()
    plaintext = b"Secret message"
    encrypted = SymmetricCrypto.encrypt(plaintext, key1)
    with pytest.raises(Exception):
        SymmetricCrypto.decrypt(encrypted['ciphertext'], encrypted['iv'], key2)
