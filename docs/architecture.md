# DBT Coach App — Architecture Overview

---

## 1. Overview

This document outlines the high-level architecture of the DBT Coach app, a HIPAA-compliant psychotherapy personal coach system. The app leverages client-side encryption to ensure sensitive user data remains private and secure while providing a modern chat interface backed by AI models such as ChatGPT.

---

## 2. System Components

### 2.1 Frontend (Angular PWA)

- **Framework:** Angular with Angular Material for UI components and responsive design.
- **Features:**
  - User onboarding, login, and key management UI.
  - Chat interface mimicking popular AI chat experiences.
  - Client-side cryptography using Web Crypto API.
  - Secure local storage of encrypted keys in IndexedDB.
  - Export/import keys as encrypted files.
  - Progressive Web App capabilities for offline access and installation on mobile devices.
- **Responsibilities:**
  - Generate asymmetric keypairs on first use.
  - Encrypt all chat messages before sending to backend.
  - Decrypt incoming encrypted chat responses.
  - Manage ephemeral session keys in memory for encryption/decryption.
  - Validate and enforce strong passphrase policies.

### 2.2 Backend (FastAPI)

- **Framework:** FastAPI for lightweight, high-performance API endpoints.
- **Features:**
  - Authentication endpoints (passphrase validation is client-side; backend authenticates via opaque tokens).
  - Store and retrieve encrypted chat messages linked to user labels.
  - Manage ephemeral session keys for decrypting messages temporarily.
  - Forward decrypted prompts to OpenAI ChatGPT API or other LLM providers.
  - Return encrypted responses back to the client.
- **Responsibilities:**
  - Store only encrypted data; no plaintext or private keys.
  - Ensure ephemeral keys have limited lifetime and scope.
  - Maintain secure HTTPS communication.
  - Audit logging for HIPAA compliance.
  - Handle scalability and concurrency.

### 2.3 Database (PostgreSQL)

- **Data Stored:**
  - Encrypted chat messages.
  - User metadata: key labels, session identifiers.
- **Security:**
  - Data encrypted at rest.
  - Access restricted to backend services.
  - Regular backups and encryption of backups.
- **Role:**
  - Persist encrypted user chat history.
  - Support queries by user label and session timestamps.

---

## 3. Data Flow

1. **User Onboarding:**
   - User generates keypair locally.
   - Private key encrypted with passphrase and stored in browser IndexedDB.
2. **Login:**
   - User selects key label and enters passphrase.
   - Frontend decrypts keys locally.
3. **Chat Session:**
   - User inputs prompt.
   - Frontend encrypts prompt using ephemeral session key or public key.
   - Encrypted prompt sent to backend.
   - Backend decrypts prompt using ephemeral key, sends plaintext to ChatGPT API.
   - ChatGPT plaintext response received by backend.
   - Backend encrypts response with ephemeral key and sends it back.
   - Frontend decrypts response and displays chat.
4. **Data Storage:**
   - Backend stores encrypted prompt/response in PostgreSQL.
   - No plaintext stored at rest.

---

## 4. Security Architecture

- **Client-Side Encryption:**
  - All cryptographic key material generated and stored on client.
  - Passphrase protects private keys.
  - Keys never transmitted or stored unencrypted.
- **Ephemeral Keys:**
  - Backend receives ephemeral symmetric keys for decrypting messages during session.
  - Keys have limited lifespan and scope; securely destroyed after use.
- **Communication:**
  - All API communication over TLS/HTTPS.
- **Data Privacy:**
  - No PII collected or stored.
  - Backend holds no long-term keys or plaintext.
- **Audit & Compliance:**
  - Backend logs access events with timestamps.
  - Regular security reviews and compliance audits.

---

## 5. Technology Stack

| Layer         | Technology                      |
|---------------|--------------------------------|
| Frontend      | Angular, Angular Material, PWA |
| Cryptography  | Web Crypto API, IndexedDB       |
| Backend       | Python, FastAPI, Uvicorn        |
| Database      | PostgreSQL                     |
| AI Provider   | OpenAI ChatGPT API (configurable) |
| Deployment    | Docker, Kubernetes (optional)  |

---

## 6. Deployment Considerations

- Frontend deployed as a static site on CDN (e.g., Vercel, Netlify).
- Backend deployed on a secure server with HTTPS (e.g., AWS, Azure, DigitalOcean).
- Database hosted securely with encrypted storage and backups.
- CI/CD pipelines for automated testing, build, and deployment.
- Environment variables for API keys and secrets managed securely.
- Regular patching and updates for dependencies and OS.

---

## 7. Future Enhancements

- Hardware Security Module (HSM) support on client devices.
- Multi-factor authentication (MFA) integration.
- Advanced key recovery options.
- Support for additional LLM providers.
- Expanded HIPAA compliance measures and certification.

---

# End of Architecture Document
