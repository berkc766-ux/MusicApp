import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

type AuthMode = 'login' | 'signup';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen w-full bg-black flex flex-col justify-center items-center text-white p-4">
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="flex justify-center mb-8">
          <svg viewBox="0 0 24 24" class="h-12 w-12 fill-white">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.35-1.434-5.305-1.76-8.784-.963-.335.077-.67-.133-.746-.467-.077-.334.132-.67.466-.745 3.808-.87 7.076-.497 9.714 1.115.293.18.386.563.207.853zm1.186-2.613c-.226.37-.706.486-1.074.26-2.686-1.652-6.784-2.13-9.97-1.166-.412.125-.845-.108-.97-.52-.125-.41.108-.844.52-.97 3.65-1.108 8.163-.563 11.233 1.33.37.225.485.704.26 1.066zm.106-2.736C14.65 9.145 8.5 8.92 4.957 9.996c-.495.148-1.02-.13-1.17-.624-.148-.495.13-1.02.625-1.17 4.05-1.23 10.85-1.002 14.693 1.277.443.264.587.842.324 1.284-.265.443-.843.588-1.285.324z"/>
          </svg>
        </div>

        <div class="bg-neutral-900 rounded-xl shadow-2xl p-8 border border-neutral-800">
          <h1 class="text-2xl font-bold text-center mb-6">
            {{ mode === 'login' ? 'Log in to Spotify' : 'Sign up for Spotify' }}
          </h1>

          <!-- Error -->
          <div *ngIf="errorMsg" class="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-lg text-sm mb-4">
            {{ errorMsg }}
          </div>
          <!-- Success -->
          <div *ngIf="successMsg" class="bg-green-500/10 border border-green-500 text-green-400 p-3 rounded-lg text-sm mb-4">
            {{ successMsg }}
          </div>

          <!-- LOGIN FORM -->
          <form *ngIf="mode === 'login'" (ngSubmit)="onLogin()" #loginForm="ngForm" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold mb-1 text-neutral-300">Email address</label>
              <input type="email" [(ngModel)]="email" name="email" required placeholder="name@example.com"
                class="w-full bg-neutral-800 border border-neutral-700 rounded-md p-3 text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-white transition">
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1 text-neutral-300">Password</label>
              <input type="password" [(ngModel)]="password" name="password" required placeholder="Password"
                class="w-full bg-neutral-800 border border-neutral-700 rounded-md p-3 text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-white transition">
            </div>
            <button type="submit" [disabled]="isLoading"
              class="w-full bg-green-500 hover:bg-green-400 text-black font-bold rounded-full py-3 mt-2 transition-all disabled:opacity-50">
              {{ isLoading ? 'Logging in...' : 'Log In' }}
            </button>
          </form>

          <!-- SIGN UP FORM -->
          <form *ngIf="mode === 'signup'" (ngSubmit)="onSignUp()" #signupForm="ngForm" class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold mb-1 text-neutral-300">First name</label>
                <input type="text" [(ngModel)]="firstName" name="firstName" required
                  class="w-full bg-neutral-800 border border-neutral-700 rounded-md p-3 text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-white transition">
              </div>
              <div>
                <label class="block text-xs font-semibold mb-1 text-neutral-300">Last name</label>
                <input type="text" [(ngModel)]="lastName" name="lastName" required
                  class="w-full bg-neutral-800 border border-neutral-700 rounded-md p-3 text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-white transition">
              </div>
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1 text-neutral-300">Username</label>
              <input type="text" [(ngModel)]="username" name="username" required placeholder="cooluser123"
                class="w-full bg-neutral-800 border border-neutral-700 rounded-md p-3 text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-white transition">
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1 text-neutral-300">Email address</label>
              <input type="email" [(ngModel)]="email" name="email" required placeholder="name@example.com"
                class="w-full bg-neutral-800 border border-neutral-700 rounded-md p-3 text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-white transition">
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1 text-neutral-300">Password</label>
              <input type="password" [(ngModel)]="password" name="password" required placeholder="Create a password"
                class="w-full bg-neutral-800 border border-neutral-700 rounded-md p-3 text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-white transition">
            </div>
            <button type="submit" [disabled]="isLoading"
              class="w-full bg-green-500 hover:bg-green-400 text-black font-bold rounded-full py-3 mt-2 transition-all disabled:opacity-50">
              {{ isLoading ? 'Creating account...' : 'Sign Up' }}
            </button>
          </form>

          <!-- Toggle mode -->
          <div class="mt-6 pt-5 border-t border-neutral-700 text-center text-sm text-neutral-400">
            <span *ngIf="mode === 'login'">Don't have an account?
              <button (click)="switchMode('signup')" class="text-white font-bold hover:underline ml-1">Sign up for Spotify</button>
            </span>
            <span *ngIf="mode === 'signup'">Already have an account?
              <button (click)="switchMode('login')" class="text-white font-bold hover:underline ml-1">Log in</button>
            </span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  mode: AuthMode = 'login';

  // shared
  email = '';
  password = '';
  isLoading = false;
  errorMsg = '';
  successMsg = '';

  // signup only
  username = '';
  firstName = '';
  lastName = '';

  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  switchMode(m: AuthMode) {
    this.mode = m;
    this.errorMsg = '';
    this.successMsg = '';
  }

  async onLogin() {
    if (!this.email || !this.password) return;
    this.isLoading = true;
    this.errorMsg = '';
    await new Promise(r => setTimeout(r, 400));
    const success = await this.authService.login(this.email, this.password);
    if (!success) this.errorMsg = 'Incorrect email or password.';
    this.isLoading = false;
  }

  async onSignUp() {
    if (!this.email || !this.password || !this.username) return;
    this.isLoading = true;
    this.errorMsg = '';
    this.successMsg = '';

    const result = await this.authService.signUp({
      email: this.email,
      password: this.password,
      username: this.username,
      firstName: this.firstName,
      lastName: this.lastName,
    });

    if (!result.success) {
      this.errorMsg = result.error || 'Registration failed. Email may already be taken.';
    }
    this.isLoading = false;
  }
}
