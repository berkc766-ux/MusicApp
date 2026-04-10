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

  // Critical fix: track whether session check completed
  private sessionLoaded = false;
  private sessionLoadedSubject = new BehaviorSubject<boolean>(false);
  public sessionLoaded$: Observable<boolean> = this.sessionLoadedSubject.asObservable();

  constructor(private supabase: SupabaseService, private router: Router) {
    this.checkSession();
  }

  private async checkSession() {
    const storedUserId = localStorage.getItem('spotify_clone_user_id');
    if (storedUserId) {
      try {
        const user = await this.supabase.getUserById(parseInt(storedUserId));
        if (user) {
          this.currentUserSubject.next(user);
        } else {
          localStorage.removeItem('spotify_clone_user_id');
        }
      } catch (e) {
        localStorage.removeItem('spotify_clone_user_id');
      }
    }
    this.sessionLoaded = true;
    this.sessionLoadedSubject.next(true);
  }

  async waitForSession(): Promise<void> {
    if (this.sessionLoaded) return;
    return new Promise(resolve => {
      const sub = this.sessionLoaded$.subscribe(loaded => {
        if (loaded) {
          sub.unsubscribe();
          resolve();
        }
      });
    });
  }

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
      console.error('Login failed:', e);
      return false;
    }
  }

  async signUp(data: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await this.supabase.registerUser(data);
      localStorage.setItem('spotify_clone_user_id', user.id.toString());
      this.currentUserSubject.next(user);
      this.router.navigate(['/dashboard']);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Registration failed.' };
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
