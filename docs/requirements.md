# DBT Coach App — Detailed Requirements

---

## 1. Business Requirements

### 1.1 Purpose
Build a secure, HIPAA-compliant personal psychotherapy coach app, initially focused on Dialectical Behavior Therapy (DBT), providing users with a private, encrypted chat interface powered by AI.

### 1.2 Target Users
- Individuals undergoing psychotherapy or DBT therapy.
- Users requiring high privacy and security for sensitive mental health data.
- Therapists or clinics wanting a secure tool for patient self-coaching (future phase).

### 1.3 Core Features
- Secure user authentication using a passphrase-based system.
- Encrypted storage of chat data on backend; no plaintext messages stored server-side.
- User-friendly key management with labels (non-identifiable).
- Ability to export/import encrypted keys to maintain access across devices.
- Intuitive chat interface mimicking popular AI chat apps.
- Multi-session chat, organized by day, allowing resumption.
- Platform independence: runs on desktop and mobile via PWA.
- Extendable backend supporting multiple LLM providers beyond ChatGPT.

---

## 2. Functional Requirements

### 2.1 User Onboarding

- **Welcome screen** for first-time users with disclaimers about security, data privacy, and no PII collection.
- User selects a **key label** (e.g., "My DBT Coach Keys") to identify their encrypted keypair.
- User creates a **strong passphrase** (minimum 20 characters) to encrypt keys locally.
- Application generates an asymmetric **keypair** (public/private) on the client.
- Keys are encrypted using the passphrase and stored securely in browser’s IndexedDB.
- User can export keys as an encrypted file for backup.

### 2.2 User Login

- Returning users see a dropdown of previously saved key labels.
- User selects a label and inputs the passphrase.
- Application decrypts keys locally and grants access.
- Incorrect passphrases show an error without revealing any information.
- Passphrase entry screen includes hints about strong passphrase creation (e.g., use a sentence).

### 2.3 Chat Interface

- Users can create new chat sessions or resume previous sessions grouped by date.
- Messages (prompts and AI responses) are encrypted client-side before sending to backend.
- Backend stores only encrypted messages.
- Backend uses short-lived ephemeral keys for decrypting messages temporarily to call ChatGPT API, then returns encrypted responses.
- Chat UI supports standard features: multiline input, loading indicators, scroll, and history.

### 2.4 Key Management

- Users can **export** their encrypted keys to a local file.
- Users can **import** encrypted keys from a file and supply passphrase to decrypt.
- Exported files are encrypted with the passphrase and cannot be opened without it.
- Key management UI is intuitive and non-technical in language.

### 2.5 Security & Privacy

- No Personally Identifiable Information (PII) is collected or stored.
- All cryptographic operations happen client-side.
- Private keys never leave the client unencrypted.
- Backend never stores or accesses unencrypted keys or plaintext messages.
- Passphrases are never transmitted or stored anywhere.
- All API communication is over HTTPS.
- Encrypted keys stored in IndexedDB are protected by strong passphrase encryption.
- Backend ephemeral session keys expire after short time frames.
- All data at rest in backend database is encrypted.
- Support for future hardware security modules (HSM) integration on client devices.

### 2.6 Compliance

- Designed to meet HIPAA requirements for data confidentiality, integrity, and availability.
- Secure audit trails for backend data access.
- Proper data handling and breach notification policies (to be implemented).
- User consent and disclaimers are clearly communicated on first load.

---

## 3. Non-Functional Requirements

### 3.1 Performance

- Minimal latency for chat response (target under 2 seconds typical).
- Responsive UI for desktop and mobile devices.
- Efficient cryptographic operations on typical consumer hardware.

### 3.2 Reliability

- Offline PWA functionality for viewing past chats.
- Secure key storage to prevent data loss on client devices.
- Backend database backup and disaster recovery plans.

### 3.3 Scalability

- Backend architecture to support multiple simultaneous users.
- Modular LLM API integration allowing swapping or scaling.

### 3.4 Usability

- Clean, minimalistic UI based on Angular Material design.
- Clear instructions and feedback during key management and login.
- Accessibility considerations (keyboard navigation, screen reader friendly).

---

## 4. Testing Requirements

### 4.1 Unit Tests

- Passphrase validation logic (length, character variety).
- Encryption/decryption service correctness.
- API client calls and response handling.

### 4.2 Integration Tests

- Login flow with encrypted key retrieval.
- End-to-end chat session encryption and backend storage.
- Export/import key functionality.

### 4.3 Security Tests

- Confirm no plaintext keys or messages leave client unencrypted.
- Test resilience to replay attacks and session hijacking.
- Verify encrypted data at rest in backend.
- Penetration testing on API endpoints.

### 4.4 User Acceptance Tests

- Validate user flows from onboarding to multi-session chat.
- Confirm PWA install and offline capabilities.
- Test passphrase hints and error messages.

---

## 5. Glossary

- **Passphrase:** User-created secret (20+ chars) to encrypt/decrypt keypair locally.
- **Keypair:** Public/private cryptographic keys used for encrypting/decrypting messages.
- **IndexedDB:** Browser local database used to store encrypted keys.
- **Ephemeral Keys:** Short-lived keys used on backend to decrypt encrypted messages temporarily.
- **PWA:** Progressive Web App, enabling installable web app features.

---

# End of Requirements Document
