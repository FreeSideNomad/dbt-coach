import { Routes } from '@angular/router';
import { WelcomeComponent } from './auth/welcome/welcome.component';
import { LoginComponent } from './auth/login/login.component';
import { ChatWindowComponent } from './chat/chat-window/chat-window.component';
import { ChatSessionGuard } from './auth/guards/chat-session.guard';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'chat', component: ChatWindowComponent, canActivate: [ChatSessionGuard] },
  { path: '**', redirectTo: '' }
];
