import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private static readonly SESSION_KEY = 'dbt-coach-session';

  setSession(label: string) {
    localStorage.setItem(SessionService.SESSION_KEY, label);
  }

  getSession(): string | null {
    return localStorage.getItem(SessionService.SESSION_KEY);
  }

  clearSession() {
    localStorage.removeItem(SessionService.SESSION_KEY);
  }
}
