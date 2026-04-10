import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-screen w-full bg-black flex flex-col justify-center items-center text-white p-4 relative overflow-hidden">
      <!-- Background subtle gradient -->
      <div class="absolute inset-0 bg-gradient-to-b from-neutral-900 to-black z-0"></div>
      
      <div class="z-10 w-full max-w-md bg-neutral-900 rounded-lg shadow-2xl p-8 border border-neutral-800">
        <div class="text-center mb-8 flex flex-col items-center">
          <svg viewBox="0 0 24 24" class="h-12 w-12 text-white fill-current mb-4"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.35-1.434-5.305-1.76-8.784-.963-.335.077-.67-.133-.746-.467-.077-.334.132-.67.466-.745 3.808-.87 7.076-.497 9.714 1.115.293.18.386.563.207.853zm1.186-2.613c-.226.37-.706.486-1.074.26-2.686-1.652-6.784-2.13-9.97-1.166-.412.125-.845-.108-.97-.52-.125-.41.108-.844.52-.97 3.65-1.108 8.163-.563 11.233 1.33.37.225.485.704.26 1.066zm.106-2.736C14.65 9.145 8.5 8.92 4.957 9.996c-.495.148-1.02-.13-1.17-.624-.148-.495.13-1.02.625-1.17 4.05-1.23 10.85-1.002 14.693 1.277.443.264.587.842.324 1.284-.265.443-.843.588-1.285.324z"></path></svg>
          <h1 class="text-3xl font-bold font-sans tracking-tight">Log in to Spotify</h1>
        </div>
        
        <form (ngSubmit)="onLogin()" #loginForm="ngForm" class="space-y-4">
          <div *ngIf="errorMsg" class="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded text-sm mb-4">
            {{ errorMsg }}
          </div>

          <div>
            <label class="block text-sm font-bold mb-2">Email address</label>
            <input type="email" [(ngModel)]="email" name="email" required placeholder="Email or username"
                   class="w-full bg-neutral-800 border border-neutral-700 rounded p-3 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition">
          </div>
          
          <div>
            <label class="block text-sm font-bold mb-2">Password</label>
            <input type="password" [(ngModel)]="password" name="password" required placeholder="Password"
                   class="w-full bg-neutral-800 border border-neutral-700 rounded p-3 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition">
          </div>
          
          <button type="submit" [disabled]="!loginForm.form.valid || isLoading"
                  class="w-full bg-green-500 text-black font-bold rounded-full py-3 mt-6 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100">
            <span *ngIf="!isLoading">Log In</span>
            <span *ngIf="isLoading">Authenticating...</span>
          </button>
        </form>

        <div class="mt-8 text-center border-t border-neutral-700 pt-6">
          <p class="text-neutral-400 text-sm">Don't have an account?</p>
          <button class="text-white hover:text-green-500 hover:underline font-bold transition mt-2">Sign up for Spotify</button>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading = false;
  errorMsg = '';

  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  async onLogin() {
    if (!this.email || !this.password) return;
    this.isLoading = true;
    this.errorMsg = '';
    
    // Simulate slight network delay for effect
    await new Promise(r => setTimeout(r, 600));

    const success = await this.authService.login(this.email, this.password);
    if (!success) {
      this.errorMsg = 'Incorrect username or password.';
    }
    this.isLoading = false;
  }
}
