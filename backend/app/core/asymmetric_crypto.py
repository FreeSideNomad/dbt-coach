import base64
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os

class AsymmetricCrypto:
    @staticmethod
    def generate_keypair():
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048
        )
        public_key = private_key.public_key()
        priv_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        pub_pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        return pub_pem.decode(), priv_pem.decode()

    @staticmethod
    def encrypt_with_public_key(data: bytes, public_key_pem: str) -> str:
        public_key = serialization.load_pem_public_key(public_key_pem.encode())
        encrypted = public_key.encrypt(
            data,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        return base64.b64encode(encrypted).decode()

    @staticmethod
    def decrypt_with_private_key(encrypted_b64: str, private_key_pem: str) -> bytes:
        private_key = serialization.load_pem_private_key(private_key_pem.encode(), password=None)
        encrypted = base64.b64decode(encrypted_b64)
        return private_key.decrypt(
            encrypted,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
