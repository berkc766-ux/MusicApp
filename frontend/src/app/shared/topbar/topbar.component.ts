import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="flex items-center justify-between px-6 py-4 bg-transparent transition-colors duration-300 z-10 w-full relative">
      <div class="flex items-center gap-2">
        <button class="bg-black/40 rounded-full p-1 cursor-not-allowed text-neutral-400">
          <svg viewBox="0 0 24 24" class="h-6 w-6 fill-current"><path d="M15.957 2.793a1 1 0 0 1 0 1.414L8.164 12l7.793 7.793a1 1 0 1 1-1.414 1.414L5.336 12l9.207-9.207a1 1 0 0 1 1.414 0z"></path></svg>
        </button>
        <button class="bg-black/40 rounded-full p-1 cursor-not-allowed text-neutral-400">
          <svg viewBox="0 0 24 24" class="h-6 w-6 fill-current"><path d="M8.043 2.793a1 1 0 0 0 0 1.414L15.836 12l-7.793 7.793a1 1 0 1 0 1.414 1.414L18.664 12 9.457 2.793a1 1 0 0 0-1.414 0z"></path></svg>
        </button>
      </div>

      <div class="flex items-center gap-4">
        <button class="hidden md:block bg-white text-black font-bold text-sm px-4 py-2 rounded-full hover:scale-105 transition-transform duration-200">
          Explore Premium
        </button>
        
        <div *ngIf="user" class="relative group">
          <button class="flex items-center gap-2 bg-black/60 hover:bg-neutral-800 rounded-full p-1 pr-3 transition-colors duration-200">
            <div class="h-7 w-7 bg-neutral-600 rounded-full flex items-center justify-center text-sm font-bold">
              {{ user.first_name?.charAt(0) || user.username?.charAt(0) || 'U' }}
            </div>
            <span class="text-sm font-bold truncate max-w-[100px]">{{ user.first_name || user.username }}</span>
            <svg viewBox="0 0 16 16" class="h-4 w-4 fill-current"><path d="M14 6l-6 6-6-6h12z"></path></svg>
          </button>
          
          <div class="absolute right-0 mt-2 w-48 bg-neutral-800 rounded-md shadow-lg py-1 z-50 hidden group-hover:block transition-all">
            <a href="#" class="block px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-700">Account</a>
            <a href="#" class="block px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-700">Profile</a>
            <hr class="border-neutral-700 my-1">
            <button (click)="logout()" class="w-full text-left block px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-700">Log out</button>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: ``
})
export class TopbarComponent implements OnInit {
  user: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    this.authService.currentUser$.subscribe(u => {
      this.user = u;
    });
  }

  logout() {
    this.authService.logout();
  }
}
