import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <header class="flex items-center justify-between px-6 h-16 bg-transparent z-10 w-full flex-shrink-0">
      <!-- Nav arrows -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <button class="bg-black/40 rounded-full p-1 text-neutral-400 cursor-default">
          <svg viewBox="0 0 24 24" class="h-5 w-5 fill-current"><path d="M15.957 2.793a1 1 0 0 1 0 1.414L8.164 12l7.793 7.793a1 1 0 1 1-1.414 1.414L5.336 12l9.207-9.207a1 1 0 0 1 1.414 0z"/></svg>
        </button>
        <button class="bg-black/40 rounded-full p-1 text-neutral-400 cursor-default">
          <svg viewBox="0 0 24 24" class="h-5 w-5 fill-current"><path d="M8.043 2.793a1 1 0 0 0 0 1.414L15.836 12l-7.793 7.793a1 1 0 1 0 1.414 1.414L18.664 12 9.457 2.793a1 1 0 0 0-1.414 0z"/></svg>
        </button>
      </div>

      <!-- Search Bar (center) -->
      <div class="flex-1 max-w-sm mx-4 relative">
        <svg viewBox="0 0 24 24" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 fill-neutral-400 pointer-events-none">
          <path d="M10.533 1.279c-5.18 0-9.407 4.927-9.407 10.107C1.126 16.514 5.353 20 10.533 20c1.97 0 3.806-.518 5.395-1.463l4.547 4.364a1 1 0 0 0 1.395-1.435l-4.516-4.333C18.324 15.5 19.94 12.864 19.94 11.386c0-5.18-4.228-10.107-9.407-10.107zm0 2c4.176 0 7.407 3.834 7.407 8.107 0 4.272-3.231 7.614-7.407 7.614-4.176 0-7.407-3.342-7.407-7.614 0-4.273 3.231-8.107 7.407-8.107z"/>
        </svg>
        <input
          id="topbar-search"
          type="text"
          [(ngModel)]="searchQuery"
          (keydown.enter)="goSearch()"
          (keydown.escape)="searchQuery = ''"
          placeholder="Search songs, artists, playlists..."
          class="w-full bg-neutral-800 hover:bg-neutral-700 focus:bg-neutral-700 border border-transparent focus:border-neutral-600 text-white rounded-full py-2 pl-9 pr-4 text-sm focus:outline-none transition"
        >
      </div>

      <!-- User menu -->
      <div *ngIf="user" class="relative group flex-shrink-0">
        <button class="flex items-center gap-2 bg-black/60 hover:bg-neutral-800 rounded-full py-1 px-3 transition">
          <div class="h-7 w-7 bg-green-600 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
            {{ (user.first_name || user.username || 'U').charAt(0).toUpperCase() }}
          </div>
          <span class="text-white text-sm font-semibold hidden sm:block truncate max-w-[100px]">
            {{ user.first_name || user.username }}
          </span>
          <svg viewBox="0 0 16 16" class="h-4 w-4 fill-white"><path d="M14 6l-6 6-6-6h12z"/></svg>
        </button>
        <div class="absolute right-0 mt-1 w-48 bg-neutral-800 rounded-md shadow-xl py-1 z-50 hidden group-hover:block border border-neutral-700">
          <span class="block px-4 py-1.5 text-xs text-neutral-500 truncate">{{ user.email }}</span>
          <div class="border-t border-neutral-700 my-1"></div>
          <a routerLink="/library" class="block px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-700 hover:text-white transition no-underline">Your Library</a>
          <a *ngIf="user.role === 'admin'" routerLink="/admin" class="block px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-700 hover:text-white transition no-underline">Admin Panel</a>
          <div class="border-t border-neutral-700 my-1"></div>
          <button (click)="logout()" class="w-full text-left block px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-700 hover:text-white transition">
            Log out
          </button>
        </div>
      </div>
    </header>
  `
})
export class TopbarComponent implements OnInit {
  user: any = null;
  searchQuery = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    this.authService.currentUser$.subscribe(u => {
      this.user = u;
      this.cdr.detectChanges();
    });
  }

  goSearch() {
    const q = this.searchQuery.trim();
    if (!q) {
      this.router.navigate(['/search']);
    } else {
      this.router.navigate(['/search'], { queryParams: { q } });
    }
  }

  logout() {
    this.authService.logout();
  }
}
