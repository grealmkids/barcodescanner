import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private sessionKey = 'snaptec_auth_status';

  // Fetch the configuration containing the password
  private getConfig(): Observable<{ password?: string }> {
    return this.http.get<{ password?: string }>('./config.json');
  }

  // Validate the entered password against config
  login(password: string): Observable<boolean> {
    return this.getConfig().pipe(
      map(config => {
        const isValid = config.password === password;
        if (isValid) {
          sessionStorage.setItem(this.sessionKey, 'true');
        }
        return isValid;
      })
    );
  }

  // Clear session on logout
  logout(): void {
    sessionStorage.removeItem(this.sessionKey);
  }

  // Read session state synchronously
  isAuthenticated(): boolean {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return sessionStorage.getItem(this.sessionKey) === 'true';
    }
    return false;
  }
}
