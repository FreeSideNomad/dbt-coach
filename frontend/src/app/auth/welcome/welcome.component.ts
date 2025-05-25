import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KeyManagerService } from '../services/key-manager.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss',
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
    MatDialogModule
  ]
})
export class WelcomeComponent implements OnInit {
  labels: string[] = [];
  label: string = '';
  passphrase: string = '';
  verifyPassphrase: string = '';
  passphraseError: string = '';
  showNewUserForm = false;
  showPass = false;
  showInfoDialog = true;

  constructor(private keyManager: KeyManagerService, private router: Router, private session: SessionService) {}

  async ngOnInit() {
    this.labels = await this.keyManager.getAllLabels();
    if (this.labels.length > 0) {
      // If labels exist, redirect to login
      this.router.navigate(['/login']);
      return;
    }
    // No keys found, show onboarding form
    this.showNewUserForm = true;
    this.showInfoDialog = true;
  }

  onPassphraseInput() {
    // This can be used for live validation if needed
  }

  async createKeypair() {
    this.passphraseError = '';
    if (!this.label.trim()) {
      this.passphraseError = 'Please enter a label for your keys.';
      return;
    }
    if (!this.passphrase || this.passphrase.length < 20) {
      this.passphraseError = 'Passphrase must be at least 20 characters.';
      return;
    }
    if (this.passphrase !== this.verifyPassphrase) {
      this.passphraseError = 'Passphrases do not match.';
      return;
    }
    try {
      await this.keyManager.generateAndStoreKeypair(this.label, this.passphrase);
      this.session.setSession(this.label); // Set session immediately
      this.showNewUserForm = false;
      this.router.navigate(['/chat']); // Go straight to chat
    } catch (e) {
      this.passphraseError = 'Failed to create keys. Please try again.';
    }
  }

  closeInfoDialog() {
    this.showInfoDialog = false;
  }
}
