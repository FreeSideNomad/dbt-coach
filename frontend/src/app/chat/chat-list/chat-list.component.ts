import { Component, Output, EventEmitter } from '@angular/core';
import { ChatServiceService, Conversation } from '../services/chat-service.service';
import { Observable } from 'rxjs';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrl: './chat-list.component.scss',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule, MatButtonModule]
})
export class ChatListComponent {
  conversations$: Observable<Conversation[]>;
  selectedId: string | null = null;
  @Output() conversationSelected = new EventEmitter<string>();
  @Output() newConversation = new EventEmitter<void>();

  showDeletePopup = false;
  deleteTargetId: string | null = null;
  longPressTimeout: any = null;

  constructor(private chatService: ChatServiceService) {
    this.conversations$ = this.chatService.getConversations();
    this.chatService.getSelectedConversation().subscribe(conv => {
      this.selectedId = conv?.id || null;
    });
  }

  selectConversation(id: string) {
    this.chatService.selectConversation(id);
    this.conversationSelected.emit(id);
  }

  startNewConversation() {
    this.newConversation.emit();
  }

  // Right-click (desktop)
  onRightClick(event: MouseEvent, id: string) {
    event.preventDefault();
    this.deleteTargetId = id;
    this.showDeletePopup = true;
  }

  // Long-press (mobile)
  onTouchStart(id: string) {
    this.longPressTimeout = setTimeout(() => {
      this.deleteTargetId = id;
      this.showDeletePopup = true;
    }, 600); // 600ms for long press
  }
  onTouchEnd() {
    clearTimeout(this.longPressTimeout);
  }

  confirmDelete() {
    if (this.deleteTargetId) {
      this.chatService.deleteConversation(this.deleteTargetId);
    }
    this.showDeletePopup = false;
    this.deleteTargetId = null;
  }
  cancelDelete() {
    this.showDeletePopup = false;
    this.deleteTargetId = null;
  }
}
