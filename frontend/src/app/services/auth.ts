import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from './supabase';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$: Observable<any> = this.currentUserSubject.asObservable();

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
        if (user) this.currentUserSubject.next(user);
        else localStorage.removeItem('spotify_clone_user_id');
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
        if (loaded) { sub.unsubscribe(); resolve(); }
      });
    });
  }

  /** Navigate to the correct home based on role */
  private navigateByRole(role: string) {
    if (role === 'admin') this.router.navigate(['/admin']);
    else if (role === 'artist') this.router.navigate(['/artist-dashboard']);
    else this.router.navigate(['/dashboard']);
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      const user = await this.supabase.authenticateUser(email, password);
      if (user) {
        localStorage.setItem('spotify_clone_user_id', user.id.toString());
        this.currentUserSubject.next(user);
        this.navigateByRole(user.role);
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
    role?: string;
    stageName?: string;
    bio?: string;
    formationYear?: number;
  }): Promise<{ success: boolean; error?: string; artistLinkError?: string }> {
    try {
      const user = await this.supabase.registerUser({
        username: data.username,
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || 'user',
      });

      localStorage.setItem('spotify_clone_user_id', user.id.toString());
      this.currentUserSubject.next(user);

      // Attempt artist profile creation separately — don't block login if it fails
      if (data.role === 'artist' && data.stageName) {
        try {
          const artist = await this.supabase.registerArtist(
            user.id,
            data.stageName,
            `${data.firstName} ${data.lastName}`,
            data.bio || ''
          );
          if (data.formationYear && artist?.id) {
            await this.supabase.updateArtistFormationYear(artist.id, data.formationYear);
          }
        } catch (artistErr: any) {
          // Log in user but report the artist link failed
          this.navigateByRole(user.role);
          return {
            success: true,
            artistLinkError: `Account created, but artist profile could not be linked: ${artistErr?.message}. Please run the SQL migration and create your profile from the dashboard.`
          };
        }
      }

      this.navigateByRole(user.role);
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

  getUserRole(): string {
    return this.currentUserSubject.value?.role || 'user';
  }
}
