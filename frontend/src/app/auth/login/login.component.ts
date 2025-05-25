import { Component, OnInit, inject } from '@angular/core';
import { KeyManagerService } from '../services/key-manager.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ]
})
export class LoginComponent implements OnInit {
  chats: string[] = [];
  selectedChat: string = '';
  passphrase: string = '';
  passphraseError: string = '';
  loading = false;
  // New chat creation state
  createMode = false;
  newChatName: string = '';
  newPassphrase: string = '';
  verifyNewPassphrase: string = '';
  showPass = false;

  private session = inject(SessionService);
  private router = inject(Router);

  constructor(private keyManager: KeyManagerService) {}

  async ngOnInit() {
    this.chats = await this.keyManager.getAllLabels();
    if (this.chats.length > 0) {
      this.selectedChat = this.chats[0];
    }
  }

  async login() {
    this.passphraseError = '';
    this.loading = true;
    try {
      const valid = await this.keyManager.validatePassphrase(this.selectedChat, this.passphrase);
      if (valid) {
        this.session.setSession(this.selectedChat);
        this.router.navigate(['/chat']);
      } else {
        this.passphraseError = 'Incorrect passphrase. Please try again.';
      }
    } catch (e) {
      this.passphraseError = 'Failed to unlock chat. Please try again.';
    }
    this.loading = false;
  }

  toggleCreateMode() {
    this.createMode = !this.createMode;
    this.passphraseError = '';
    this.newChatName = '';
    this.newPassphrase = '';
    this.verifyNewPassphrase = '';
  }

  async createNewChat() {
    this.passphraseError = '';
    if (!this.newChatName.trim()) {
      this.passphraseError = 'Please enter a name for your chat.';
      return;
    }
    if (!this.newPassphrase || this.newPassphrase.length < 20) {
      this.passphraseError = 'Passphrase must be at least 20 characters.';
      return;
    }
    if (this.newPassphrase !== this.verifyNewPassphrase) {
      this.passphraseError = 'Passphrases do not match.';
      return;
    }
    try {
      await this.keyManager.generateAndStoreKeypair(this.newChatName, this.newPassphrase);
      this.chats = await this.keyManager.getAllLabels();
      this.selectedChat = this.newChatName;
      this.createMode = false;
      this.passphrase = '';
      this.passphraseError = '';
      this.session.setSession(this.newChatName);
      this.router.navigate(['/chat']);
    } catch (e) {
      this.passphraseError = 'Failed to create chat. Please try again.';
    }
  }
}
