import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ChatListComponent } from '../chat-list/chat-list.component';
import { ChatServiceService, Conversation, ChatMessage } from '../services/chat-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { SessionService } from '../../auth/services/session.service';
import { Router } from '@angular/router';
import { SymmetricCrypto } from '../services/symmetric-crypto';
import { EncryptedChatMessage } from '../services/chat-service.service';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ChatListComponent
  ]
})
export class ChatWindowComponent {
  conversations$: Observable<Conversation[]>;
  selectedConversation$: Observable<Conversation | null>;
  message = '';
  loading = false;
  sessionKey: string | null = null;

  constructor(
    private chatService: ChatServiceService,
    private cdr: ChangeDetectorRef,
    private session: SessionService,
    private router: Router
  ) {
    this.conversations$ = this.chatService.getConversations();
    this.selectedConversation$ = this.chatService.getSelectedConversation();
  }

  async ngOnInit() {
    // For demo: generate or retrieve a session key per session (should be per conversation in real app)
    let key = localStorage.getItem('dbt-coach-session-key');
    if (!key) {
      key = await SymmetricCrypto.generateKey();
      localStorage.setItem('dbt-coach-session-key', key);
    }
    this.sessionKey = key;
  }

  onConversationSelected(id: string) {
    this.chatService.selectConversation(id);
  }

  onNewConversation() {
    const id = this.chatService.createConversation('New Conversation');
    this.chatService.selectConversation(id);
  }

  async sendMessage(conv: Conversation | null) {
    if (!conv || !this.message.trim() || !this.sessionKey) return;
    const userMsg: ChatMessage = {
      role: 'user',
      content: this.message,
      timestamp: Date.now()
    };
    this.chatService.addMessage(conv.id, userMsg);
    this.loading = true;
    const prompt = this.message;
    this.message = '';
    this.cdr.detectChanges();
    // Encrypt and send
    (await this.chatService.sendEncryptedPrompt(conv.id, prompt, this.sessionKey)).subscribe({
      next: async (reply: EncryptedChatMessage) => {
        const content = await SymmetricCrypto.decrypt(reply.encrypted_content, reply.iv, this.sessionKey!);
        this.chatService.addMessage(conv.id, {
          role: 'assistant',
          content,
          timestamp: reply.timestamp
        });
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.chatService.addMessage(conv.id, {
          role: 'assistant',
          content: 'Sorry, there was a problem contacting the server.',
          timestamp: Date.now()
        });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  logout() {
    this.session.clearSession();
    this.router.navigate(['/login']);
  }
}
