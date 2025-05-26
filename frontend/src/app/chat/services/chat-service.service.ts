import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { SymmetricCrypto } from './symmetric-crypto';
import { AsymmetricCrypto } from './asymmetric-crypto';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface EncryptedChatMessage {
  role: 'user' | 'assistant';
  encrypted_content: string;
  iv: string;
  key: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
}

@Injectable({
  providedIn: 'root'
})
export class ChatServiceService {
  private conversations: Conversation[] = [];
  private conversations$ = new BehaviorSubject<Conversation[]>([]);
  private selectedConversationId$ = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {
    // Optionally load from localStorage or backend
    this.loadConversations();
  }

  getConversations(): Observable<Conversation[]> {
    return this.conversations$.asObservable();
  }

  getSelectedConversation(): Observable<Conversation | null> {
    return new Observable(observer => {
      this.selectedConversationId$.subscribe(id => {
        observer.next(this.conversations.find(c => c.id === id) || null);
      });
    });
  }

  selectConversation(id: string) {
    this.selectedConversationId$.next(id);
  }

  createConversation(title: string): string {
    const id = Date.now().toString();
    const newConv: Conversation = { id, title, messages: [] };
    this.conversations.unshift(newConv);
    this.conversations$.next(this.conversations);
    this.selectedConversationId$.next(id);
    this.saveConversations();
    return id;
  }

  addMessage(conversationId: string, message: ChatMessage) {
    const conv = this.conversations.find(c => c.id === conversationId);
    if (conv) {
      conv.messages.push(message);
      this.conversations$.next(this.conversations);
      this.saveConversations();
    }
  }

  async sendEncryptedPrompt(conversationId: string, prompt: string, sessionKey: string): Promise<Observable<EncryptedChatMessage>> {
    const API_URL = (window as any)['env']?.API_URL || '/api';
    // Fetch backend public key (cache for session)
    let backendPubKey = sessionStorage.getItem('dbt-backend-pubkey');
    let pubKey: CryptoKey;
    if (!backendPubKey) {
      const resp = await fetch(`${API_URL}/public-key`);
      const { public_key } = await resp.json();
      sessionStorage.setItem('dbt-backend-pubkey', public_key);
      backendPubKey = public_key;
    }
    pubKey = await AsymmetricCrypto.importPublicKey(backendPubKey!);
    // Encrypt session key with backend public key
    const sessionKeyBytes = Uint8Array.from(atob(sessionKey), c => c.charCodeAt(0));
    const encryptedKey = await AsymmetricCrypto.encryptWithPublicKey(sessionKeyBytes, pubKey);
    // Encrypt prompt
    const encrypted = await SymmetricCrypto.encrypt(prompt, sessionKey);
    // Send encrypted prompt and encrypted session key to backend
    return this.http.post<EncryptedChatMessage>(
      `${API_URL}/chat`,
      {
        conversation_id: conversationId,
        encrypted_prompt: encrypted.ciphertext,
        iv: encrypted.iv,
        encrypted_key: encryptedKey
      }
    );
  }

  async decryptAssistantMessage(msg: EncryptedChatMessage, sessionKey: string): Promise<string> {
    return SymmetricCrypto.decrypt(msg.encrypted_content, msg.iv, sessionKey);
  }

  deleteConversation(id: string) {
    this.conversations = this.conversations.filter(c => c.id !== id);
    this.conversations$.next(this.conversations);
    // If the deleted conversation was selected, select the first one or null
    if (this.selectedConversationId$.value === id) {
      const first = this.conversations[0]?.id || null;
      this.selectedConversationId$.next(first);
    }
    this.saveConversations();
  }

  private saveConversations() {
    localStorage.setItem('dbt-coach-conversations', JSON.stringify(this.conversations));
  }

  private loadConversations() {
    const data = localStorage.getItem('dbt-coach-conversations');
    if (data) {
      this.conversations = JSON.parse(data);
      this.conversations$.next(this.conversations);
    }
  }
}
