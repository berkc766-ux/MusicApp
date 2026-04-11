import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

type Mode = 'login' | 'signup-listener' | 'signup-artist';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-black flex flex-col items-center justify-center px-4"
      style="background: radial-gradient(ellipse at top, #1a1a2e 0%, #000 70%)">

      <!-- Logo -->
      <div class="mb-8 text-center">
        <svg viewBox="0 0 24 24" class="h-12 w-12 fill-white mx-auto mb-2">
          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.35-1.434-5.305-1.76-8.784-.963-.335.077-.67-.133-.746-.467-.077-.334.132-.67.466-.745 3.808-.87 7.076-.497 9.714 1.115.293.18.386.563.207.853zm1.186-2.613c-.226.37-.706.486-1.074.26-2.686-1.652-6.784-2.13-9.97-1.166-.412.125-.845-.108-.97-.52-.125-.41.108-.844.52-.97 3.65-1.108 8.163-.563 11.233 1.33.37.225.485.704.26 1.066zm.106-2.736C14.65 9.145 8.5 8.92 4.957 9.996c-.495.148-1.02-.13-1.17-.624-.148-.495.13-1.02.625-1.17 4.05-1.23 10.85-1.002 14.693 1.277.443.264.587.842.324 1.284-.265.443-.843.588-1.285.324z"/>
        </svg>
        <h1 class="text-white text-2xl font-bold tracking-tight">Spotify</h1>
      </div>

      <div class="bg-neutral-900 rounded-2xl p-8 w-full max-w-md shadow-2xl border border-neutral-800">

        <!-- LOGIN MODE -->
        <div *ngIf="mode === 'login'">
          <h2 class="text-white text-2xl font-bold text-center mb-6">Log in to Spotify</h2>
          <form (ngSubmit)="onLogin()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-neutral-300 mb-1">Email address</label>
              <input id="login-email" type="email" [(ngModel)]="loginEmail" name="email" required
                placeholder="name@example.com" autocomplete="email"
                class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-4 py-3 focus:outline-none focus:border-white transition">
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-300 mb-1">Password</label>
              <input id="login-password" type="password" [(ngModel)]="loginPassword" name="password" required
                placeholder="Password" autocomplete="current-password"
                class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-4 py-3 focus:outline-none focus:border-white transition">
            </div>
            <div *ngIf="error" class="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-md px-4 py-3">
              {{ error }}
            </div>
            <button id="login-btn" type="submit" [disabled]="loading"
              class="w-full bg-green-500 hover:bg-green-400 disabled:opacity-60 text-black font-bold py-3 rounded-full transition text-base">
              {{ loading ? 'Logging in...' : 'Log In' }}
            </button>
          </form>
          <div class="mt-6 border-t border-neutral-800 pt-5 text-center">
            <p class="text-neutral-400 text-sm">
              Don't have an account?
              <button (click)="mode = 'signup-listener'; error = ''" class="text-white font-bold hover:underline ml-1">Sign up for Spotify</button>
            </p>
          </div>
        </div>

        <!-- SIGNUP: Choose Role -->
        <div *ngIf="mode === 'signup-listener' || mode === 'signup-artist'">
          <h2 class="text-white text-2xl font-bold text-center mb-2">Sign up for Spotify</h2>

          <!-- Account Type Selector -->
          <div class="flex gap-2 mb-5 mt-3">
            <button (click)="mode = 'signup-listener'; error = ''"
              [class]="mode === 'signup-listener'
                ? 'flex-1 py-2 rounded-full text-sm font-bold bg-white text-black transition'
                : 'flex-1 py-2 rounded-full text-sm font-bold border border-neutral-600 text-neutral-300 hover:border-white transition'">
              👤 Personal
            </button>
            <button (click)="mode = 'signup-artist'; error = ''"
              [class]="mode === 'signup-artist'
                ? 'flex-1 py-2 rounded-full text-sm font-bold bg-green-500 text-black transition'
                : 'flex-1 py-2 rounded-full text-sm font-bold border border-neutral-600 text-neutral-300 hover:border-white transition'">
              🎤 Artist
            </button>
          </div>

          <form (ngSubmit)="onSignUp()" class="space-y-3">
            <div class="flex gap-2">
              <div class="flex-1">
                <label class="block text-xs font-medium text-neutral-400 mb-1">First name</label>
                <input type="text" [(ngModel)]="signupFirstName" name="firstName" required
                  class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-white transition">
              </div>
              <div class="flex-1">
                <label class="block text-xs font-medium text-neutral-400 mb-1">Last name</label>
                <input type="text" [(ngModel)]="signupLastName" name="lastName" required
                  class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-white transition">
              </div>
            </div>

            <!-- Artist extra fields -->
            <div *ngIf="mode === 'signup-artist'" class="space-y-3">
              <div>
                <label class="block text-xs font-medium text-neutral-400 mb-1">Stage Name *</label>
                <input type="text" [(ngModel)]="signupStageName" name="stageName"
                  placeholder="e.g. The Weeknd"
                  class="w-full bg-neutral-800 border border-green-600 text-white rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 transition">
              </div>
              <div>
                <label class="block text-xs font-medium text-neutral-400 mb-1">Bio</label>
                <textarea [(ngModel)]="signupBio" name="bio" rows="2" placeholder="Tell us about yourself..."
                  class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 transition resize-none"></textarea>
              </div>
              <div>
                <label class="block text-xs font-medium text-neutral-400 mb-1">Formation Year</label>
                <input type="number" [(ngModel)]="signupFormationYear" name="formationYear" placeholder="e.g. 2015"
                  class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 transition">
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-neutral-400 mb-1">Username</label>
              <input type="text" [(ngModel)]="signupUsername" name="username" required
                class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-white transition">
            </div>
            <div>
              <label class="block text-xs font-medium text-neutral-400 mb-1">Email address</label>
              <input type="email" [(ngModel)]="signupEmail" name="email" required
                class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-white transition">
            </div>
            <div>
              <label class="block text-xs font-medium text-neutral-400 mb-1">Password</label>
              <input type="password" [(ngModel)]="signupPassword" name="password" required minlength="6"
                class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-white transition">
            </div>

            <div *ngIf="error" class="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
              {{ error }}
            </div>

            <button type="submit" [disabled]="loading"
              [class]="mode === 'signup-artist'
                ? 'w-full bg-green-500 hover:bg-green-400 disabled:opacity-60 text-black font-bold py-3 rounded-full transition text-sm'
                : 'w-full bg-white hover:bg-neutral-100 disabled:opacity-60 text-black font-bold py-3 rounded-full transition text-sm'">
              {{ loading ? 'Creating account...' : (mode === 'signup-artist' ? '🎤 Join as Artist' : '👤 Create Account') }}
            </button>
          </form>

          <div class="mt-5 border-t border-neutral-800 pt-4 text-center">
            <p class="text-neutral-400 text-sm">
              Already have an account?
              <button (click)="mode = 'login'; error = ''" class="text-white font-bold hover:underline ml-1">Log in</button>
            </p>
          </div>
        </div>

      </div>
    </div>
  `
})
export class LoginComponent {
  mode: Mode = 'login';

  loginEmail = '';
  loginPassword = '';

  signupFirstName = '';
  signupLastName = '';
  signupUsername = '';
  signupEmail = '';
  signupPassword = '';
  signupStageName = '';
  signupBio = '';
  signupFormationYear: number | undefined = undefined;

  error = '';
  artistLinkWarning = '';
  loading = false;

  constructor(private authService: AuthService) {}

  async onLogin() {
    this.error = '';
    if (!this.loginEmail || !this.loginPassword) { this.error = 'Please fill in all fields.'; return; }
    this.loading = true;
    const ok = await this.authService.login(this.loginEmail, this.loginPassword);
    if (!ok) this.error = 'Invalid email or password.';
    this.loading = false;
  }

  async onSignUp() {
    this.error = '';
    this.artistLinkWarning = '';
    if (!this.signupUsername || !this.signupEmail || !this.signupPassword || !this.signupFirstName) {
      this.error = 'Please fill in all required fields.'; return;
    }
    if (this.mode === 'signup-artist' && !this.signupStageName) {
      this.error = 'Please enter your stage name.'; return;
    }
    this.loading = true;
    const result = await this.authService.signUp({
      username: this.signupUsername,
      email: this.signupEmail,
      password: this.signupPassword,
      firstName: this.signupFirstName,
      lastName: this.signupLastName,
      role: this.mode === 'signup-artist' ? 'artist' : 'user',
      stageName: this.signupStageName,
      bio: this.signupBio || undefined,
      formationYear: this.signupFormationYear,
    });
    if (!result.success) {
      this.error = result.error || 'Registration failed.';
    } else if (result.artistLinkError) {
      this.artistLinkWarning = result.artistLinkError;
    }
    this.loading = false;
  }
}
