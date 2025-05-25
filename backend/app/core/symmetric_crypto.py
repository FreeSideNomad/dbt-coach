import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os

class SymmetricCrypto:
    @staticmethod
    def generate_key() -> str:
        key = AESGCM.generate_key(bit_length=256)
        return base64.b64encode(key).decode()

    @staticmethod
    def encrypt(plaintext: bytes, key_b64: str) -> dict:
        key = base64.b64decode(key_b64)
        iv = os.urandom(12)
        aesgcm = AESGCM(key)
        ciphertext = aesgcm.encrypt(iv, plaintext, None)
        return {
            'iv': base64.b64encode(iv).decode(),
            'ciphertext': base64.b64encode(ciphertext).decode()
        }

    @staticmethod
    def decrypt(ciphertext_b64: str, iv_b64: str, key_b64: str) -> bytes:
        key = base64.b64decode(key_b64)
        iv = base64.b64decode(iv_b64)
        ciphertext = base64.b64decode(ciphertext_b64)
        aesgcm = AESGCM(key)
        return aesgcm.decrypt(iv, ciphertext, None)
