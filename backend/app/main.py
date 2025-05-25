from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import time
import os
import openai
from app.core.symmetric_crypto import SymmetricCrypto
from app.core.asymmetric_crypto import AsymmetricCrypto
import base64
import logging

app = FastAPI()

# Allow CORS for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY

# Generate or load backend RSA keypair (in production, store securely!)
BACKEND_PUBLIC_KEY, BACKEND_PRIVATE_KEY = AsymmetricCrypto.generate_keypair()


class PublicKeyResponse(BaseModel):
    public_key: str


@app.get("/api/public-key", response_model=PublicKeyResponse)
def get_public_key():
    logging.info("/api/public-key called")
    return PublicKeyResponse(public_key=BACKEND_PUBLIC_KEY)


class ChatRequest(BaseModel):
    conversation_id: str
    encrypted_prompt: str
    iv: str
    encrypted_key: str  # AES session key, encrypted with backend public key


class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    encrypted_content: str
    iv: str
    key: str| None = None  # allow None for assistant replies
    timestamp: int


# Setup logging to file
logging.basicConfig(
    filename="/tmp/dbt_coach_api.log",
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s"
)


@app.post("/api/chat", response_model=ChatMessage)
def chat_endpoint(req: ChatRequest):
    try:
        # Log full request for debugging (be careful in production!)
        logging.info(f"/api/chat full request: {req.json()}")
        # Decrypt AES session key with backend private key
        session_key = AsymmetricCrypto.decrypt_with_private_key(req.encrypted_key, BACKEND_PRIVATE_KEY)
        # Decrypt prompt
        prompt = SymmetricCrypto.decrypt(req.encrypted_prompt, req.iv, base64.b64encode(session_key).decode()).decode()
        # System prompt for DBT therapist
        system_prompt = (
            "You are a helpful, supportive, and non-judgmental DBT (Dialectical Behavior Therapy) therapist. "
            "You help users with emotional regulation, mindfulness, distress tolerance, and interpersonal effectiveness. "
            "Always respond with empathy, validation, and practical DBT skills. "
            "Do not give medical advice or diagnose. If a user is in crisis, encourage them to reach out to a professional or helpline."
        )
        # Call OpenAI API (openai>=1.0.0)
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ]
        )
        answer = response.choices[0].message.content
        # Encrypt response with same session key
        encrypted = SymmetricCrypto.encrypt(answer.encode(), base64.b64encode(session_key).decode())
        return ChatMessage(
            role="assistant",
            encrypted_content=encrypted["ciphertext"],
            iv=encrypted["iv"],
            key=None,
            timestamp=int(time.time())
        )
    except Exception as e:
        logging.error(f"/api/chat error: {str(e)}", exc_info=True)
        logging.error(f"/api/chat failed request dump: {req.json()}")
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail="Internal server error. See server logs.")
