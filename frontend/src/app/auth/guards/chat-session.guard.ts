import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SessionService } from '../services/session.service';

@Injectable({ providedIn: 'root' })
export class ChatSessionGuard implements CanActivate {
  constructor(private session: SessionService, private router: Router) {}

  canActivate(): boolean {
    if (this.session.getSession()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
