import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from './supabase';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$: Observable<any> = this.currentUserSubject.asObservable();

  constructor(private supabase: SupabaseService, private router: Router) {
    this.checkSession();
  }

  // Look for stored userId in localStorage on app load
  private async checkSession() {
    const storedUserId = localStorage.getItem('spotify_clone_user_id');
    if (storedUserId) {
      try {
        const user = await this.supabase.getUserById(parseInt(storedUserId));
        if (user) {
          this.currentUserSubject.next(user);
        } else {
          this.logout();
        }
      } catch (e) {
        this.logout();
      }
    }
  }

  // Authenticate by querying the public.users table directly (based on custom schema)
  async login(email: string, password: string): Promise<boolean> {
    try {
      const user = await this.supabase.authenticateUser(email, password);
      if (user) {
        localStorage.setItem('spotify_clone_user_id', user.id.toString());
        this.currentUserSubject.next(user);
        this.router.navigate(['/dashboard']);
        return true;
      }
      return false;
    } catch (e) {
      console.error("Login failed:", e);
      return false;
    }
  }

  logout() {
    localStorage.removeItem('spotify_clone_user_id');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }
  
  getCurrentUser() {
    return this.currentUserSubject.value;
  }
}
