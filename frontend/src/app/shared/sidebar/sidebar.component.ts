import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SupabaseService } from '../../services/supabase';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="h-full flex flex-col bg-black pt-6 pb-28 text-neutral-400 overflow-hidden">
      <!-- Logo -->
      <div class="px-6 mb-6">
        <a [routerLink]="homeLink" class="flex items-center gap-2 no-underline">
          <svg viewBox="0 0 24 24" class="h-8 w-8 fill-white flex-shrink-0">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.35-1.434-5.305-1.76-8.784-.963-.335.077-.67-.133-.746-.467-.077-.334.132-.67.466-.745 3.808-.87 7.076-.497 9.714 1.115.293.18.386.563.207.853zm1.186-2.613c-.226.37-.706.486-1.074.26-2.686-1.652-6.784-2.13-9.97-1.166-.412.125-.845-.108-.97-.52-.125-.41.108-.844.52-.97 3.65-1.108 8.163-.563 11.233 1.33.37.225.485.704.26 1.066zm.106-2.736C14.65 9.145 8.5 8.92 4.957 9.996c-.495.148-1.02-.13-1.17-.624-.148-.495.13-1.02.625-1.17 4.05-1.23 10.85-1.002 14.693 1.277.443.264.587.842.324 1.284-.265.443-.843.588-1.285.324z"/>
          </svg>
          <span class="text-white font-bold text-lg">Spotify</span>
        </a>
      </div>

      <!-- Nav: LISTENER -->
      <nav *ngIf="role === 'user'" class="px-3 mb-4">
        <ul class="space-y-1">
          <li>
            <a routerLink="/dashboard" routerLinkActive="bg-neutral-800 text-white"
              class="flex items-center gap-4 px-3 py-2.5 rounded-md transition-colors hover:text-white font-semibold text-sm">
              <svg viewBox="0 0 24 24" class="h-6 w-6 fill-current flex-shrink-0"><path d="M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20h4.5v-6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v6H20V7.577l-7.5-4.33zm-2-1.732a3 3 0 0 1 3 0l7.5 4.33a2 2 0 0 1 1 1.732V21a1 1 0 0 1-1 1h-6.5a1 1 0 0 1-1-1v-6h-3v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.577a2 2 0 0 1 1-1.732l7.5-4.33z"/></svg>
              Home
            </a>
          </li>
          <li>
            <a routerLink="/library" routerLinkActive="bg-neutral-800 text-white"
              class="flex items-center gap-4 px-3 py-2.5 rounded-md transition-colors hover:text-white font-semibold text-sm">
              <svg viewBox="0 0 24 24" class="h-6 w-6 fill-current flex-shrink-0"><path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zM15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6.464a1 1 0 0 0-.5-.866l-6-3.464zM9 2a1 1 0 0 0-1 1v18a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1z"/></svg>
              Your Library
            </a>
          </li>
          <li>
            <a routerLink="/search" routerLinkActive="bg-neutral-800 text-white"
              class="flex items-center gap-4 px-3 py-2.5 rounded-md transition-colors hover:text-white font-semibold text-sm">
              <svg viewBox="0 0 24 24" class="h-6 w-6 fill-current flex-shrink-0"><path d="M10.533 1.279c-5.18 0-9.407 4.927-9.407 10.107C1.126 16.514 5.353 20 10.533 20c1.97 0 3.806-.518 5.395-1.463l4.547 4.364a1 1 0 0 0 1.395-1.435l-4.516-4.333C18.324 15.5 19.94 12.864 19.94 11.386c0-5.18-4.228-10.107-9.407-10.107zm0 2c4.176 0 7.407 3.834 7.407 8.107 0 4.272-3.231 7.614-7.407 7.614-4.176 0-7.407-3.342-7.407-7.614 0-4.273 3.231-8.107 7.407-8.107z"/></svg>
              Search
            </a>
          </li>
        </ul>
      </nav>

      <nav *ngIf="role === 'artist'" class="px-3 mb-4">
        <ul class="space-y-1">
          <li>
            <a routerLink="/artist-dashboard" routerLinkActive="bg-neutral-800 text-white"
              class="flex items-center gap-4 px-3 py-2.5 rounded-md transition-colors hover:text-white font-semibold text-sm">
              <svg viewBox="0 0 24 24" class="h-6 w-6 fill-current flex-shrink-0"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
              My Music
            </a>
          </li>
          <li>
            <a routerLink="/dashboard" routerLinkActive="bg-neutral-800 text-white"
              class="flex items-center gap-4 px-3 py-2.5 rounded-md transition-colors hover:text-white font-semibold text-sm">
              <svg viewBox="0 0 24 24" class="h-6 w-6 fill-current flex-shrink-0"><path d="M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20h4.5v-6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v6H20V7.577l-7.5-4.33zm-2-1.732a3 3 0 0 1 3 0l7.5 4.33a2 2 0 0 1 1 1.732V21a1 1 0 0 1-1 1h-6.5a1 1 0 0 1-1-1v-6h-3v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.577a2 2 0 0 1 1-1.732l7.5-4.33z"/></svg>
              Browse
            </a>
          </li>
          <li>
            <a routerLink="/search" routerLinkActive="bg-neutral-800 text-white"
              class="flex items-center gap-4 px-3 py-2.5 rounded-md transition-colors hover:text-white font-semibold text-sm">
              <svg viewBox="0 0 24 24" class="h-6 w-6 fill-current flex-shrink-0"><path d="M10.533 1.279c-5.18 0-9.407 4.927-9.407 10.107C1.126 16.514 5.353 20 10.533 20c1.97 0 3.806-.518 5.395-1.463l4.547 4.364a1 1 0 0 0 1.395-1.435l-4.516-4.333C18.324 15.5 19.94 12.864 19.94 11.386c0-5.18-4.228-10.107-9.407-10.107zm0 2c4.176 0 7.407 3.834 7.407 8.107 0 4.272-3.231 7.614-7.407 7.614-4.176 0-7.407-3.342-7.407-7.614 0-4.273 3.231-8.107 7.407-8.107z"/></svg>
              Search
            </a>
          </li>
        </ul>
      </nav>

      <nav *ngIf="role === 'admin'" class="px-3 mb-4">
        <ul class="space-y-1">
          <li>
            <a routerLink="/admin" routerLinkActive="bg-neutral-800 text-white"
              class="flex items-center gap-4 px-3 py-2.5 rounded-md transition-colors hover:text-white font-semibold text-sm">
              <svg viewBox="0 0 24 24" class="h-6 w-6 fill-current flex-shrink-0"><path d="M12 15.5c-1.9 0-3.5-1.6-3.5-3.5S10.1 8.5 12 8.5s3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm7.4-3c.1-.3.1-.6.1-1s0-.6-.1-1l2.2-1.7c.2-.2.3-.4.2-.6l-2.1-3.6c-.1-.2-.4-.3-.6-.2l-2.6 1c-.5-.4-1.1-.7-1.7-1l-.4-2.7C14.3 2.2 14.1 2 13.9 2h-4.2c-.3 0-.5.2-.5.4L8.8 5.1c-.6.3-1.2.6-1.7 1l-2.6-1c-.2-.1-.5 0-.6.2L1.8 8.9c-.1.2-.1.4.2.6l2.2 1.7c-.1.3-.1.6-.1 1s0 .6.1 1l-2.2 1.7c-.2.2-.3.4-.2.6l2.1 3.6c.1.2.4.3.6.2l2.6-1c.5.4 1.1.7 1.7 1l.4 2.7c.1.2.3.4.5.4h4.2c.3 0 .5-.2.5-.4l.4-2.7c.6-.3 1.2-.6 1.7-1l2.6 1c.2.1.5 0 .6-.2l2.1-3.6c.1-.2.1-.4-.2-.6l-2.2-1.7z"/></svg>
              Admin Panel
            </a>
          </li>
          <li>
            <a routerLink="/dashboard" routerLinkActive="bg-neutral-800 text-white"
              class="flex items-center gap-4 px-3 py-2.5 rounded-md transition-colors hover:text-white font-semibold text-sm">
              <svg viewBox="0 0 24 24" class="h-6 w-6 fill-current flex-shrink-0"><path d="M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20h4.5v-6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v6H20V7.577l-7.5-4.33z"/></svg>
              Browse
            </a>
          </li>
          <li>
            <a routerLink="/search" routerLinkActive="bg-neutral-800 text-white"
              class="flex items-center gap-4 px-3 py-2.5 rounded-md transition-colors hover:text-white font-semibold text-sm">
              <svg viewBox="0 0 24 24" class="h-6 w-6 fill-current flex-shrink-0"><path d="M10.533 1.279c-5.18 0-9.407 4.927-9.407 10.107C1.126 16.514 5.353 20 10.533 20c1.97 0 3.806-.518 5.395-1.463l4.547 4.364a1 1 0 0 0 1.395-1.435l-4.516-4.333C18.324 15.5 19.94 12.864 19.94 11.386c0-5.18-4.228-10.107-9.407-10.107zm0 2c4.176 0 7.407 3.834 7.407 8.107 0 4.272-3.231 7.614-7.407 7.614-4.176 0-7.407-3.342-7.407-7.614 0-4.273 3.231-8.107 7.407-8.107z"/></svg>
              Search
            </a>
          </li>
        </ul>
      </nav>

      <!-- Playlists (listener & admin only) -->

      <div *ngIf="role !== 'artist'" class="flex-1 overflow-y-auto px-3 scrollbar-thin">
        <div class="px-3 py-2 mt-2">
          <h3 class="text-xs uppercase tracking-widest font-bold text-neutral-500">Playlists</h3>
        </div>
        <ul class="space-y-0.5 mt-1">
          <li *ngFor="let pl of playlists">
            <a [routerLink]="['/playlist', pl.id]"
              class="block px-3 py-2 text-sm hover:text-white transition-colors truncate rounded-md hover:bg-white/5">
              {{ pl.name }}
            </a>
          </li>
          <li *ngIf="playlists.length === 0" class="px-3 py-2 text-xs text-neutral-600 italic">No playlists yet</li>
        </ul>
      </div>

      <!-- Artist albums in sidebar -->
      <div *ngIf="role === 'artist'" class="flex-1 overflow-y-auto px-3 scrollbar-thin">
        <div class="px-3 py-2 mt-2">
          <h3 class="text-xs uppercase tracking-widest font-bold text-neutral-500">Your Albums</h3>
        </div>
        <ul class="space-y-0.5 mt-1">
          <li *ngFor="let al of artistAlbums">
            <span class="block px-3 py-2 text-sm text-neutral-400 truncate rounded-md hover:bg-white/5 hover:text-white transition cursor-default">
              🎵 {{ al.title }}
            </span>
          </li>
          <li *ngIf="artistAlbums.length === 0" class="px-3 py-2 text-xs text-neutral-600 italic">No albums yet</li>
        </ul>
      </div>
    </div>
  `,
  styles: `
    .scrollbar-thin::-webkit-scrollbar { width: 6px; }
    .scrollbar-thin::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
  `
})
export class SidebarComponent implements OnInit {
  playlists: any[] = [];
  artistAlbums: any[] = [];
  role = 'user';
  homeLink = '/dashboard';

  constructor(
    private supabase: SupabaseService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.role = user.role || 'user';
      this.homeLink = this.role === 'artist' ? '/artist-dashboard' : this.role === 'admin' ? '/admin' : '/dashboard';
      await this.loadData(user);
    }

    this.authService.currentUser$.subscribe(async (user) => {
      if (user) {
        this.role = user.role || 'user';
        this.homeLink = this.role === 'artist' ? '/artist-dashboard' : this.role === 'admin' ? '/admin' : '/dashboard';
        await this.loadData(user);
        this.cdr.detectChanges();
      }
    });
  }

  async loadData(user: any) {
    try {
      if (this.role === 'artist') {
        const artist = await this.supabase.getArtistByUserId(user.id);
        if (artist) this.artistAlbums = await this.supabase.getAlbumsByArtist(artist.id);
      } else {
        this.playlists = await this.supabase.getUserPlaylists(user.id);
      }
      this.cdr.detectChanges();
    } catch (e) { console.error(e); }
  }
}
