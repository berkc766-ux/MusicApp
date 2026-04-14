import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SupabaseService } from '../../services/supabase';
import { AuthService } from '../../services/auth';
import { EventBusService } from '../../services/event-bus';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="h-full flex flex-col bg-black pt-6 pb-28 text-neutral-400 overflow-hidden">
      <!-- Logo -->
      <div class="px-6 mb-6">
        <a [routerLink]="homeLink" class="flex items-center gap-2 no-underline">
          <img src="/icon.png" alt="Josepify" class="h-10 w-10 flex-shrink-0 object-contain">
          <span class="text-white font-bold text-lg">Josepify</span>
        </a>
      </div>

      <!-- Nav: USER (Listener) -->
      <nav *ngIf="role === 'user'" class="px-3 mb-2">
        <ul class="space-y-1">
          <li>
            <a routerLink="/dashboard" routerLinkActive="bg-neutral-800 text-white"
              class="flex items-center gap-4 px-3 py-2.5 rounded-md transition-colors hover:text-white font-semibold text-sm">
              <svg viewBox="0 0 24 24" class="h-5 w-5 fill-current flex-shrink-0"><path d="M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20h4.5v-6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v6H20V7.577l-7.5-4.33zm-2-1.732a3 3 0 0 1 3 0l7.5 4.33a2 2 0 0 1 1 1.732V21a1 1 0 0 1-1 1h-6.5a1 1 0 0 1-1-1v-6h-3v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.577a2 2 0 0 1 1-1.732l7.5-4.33z"/></svg>
              Home
            </a>
          </li>
          <li>
            <a routerLink="/search" routerLinkActive="bg-neutral-800 text-white"
              class="flex items-center gap-4 px-3 py-2.5 rounded-md transition-colors hover:text-white font-semibold text-sm">
              <svg viewBox="0 0 24 24" class="h-5 w-5 fill-current flex-shrink-0"><path d="M10.533 1.279c-5.18 0-9.407 4.927-9.407 10.107C1.126 16.514 5.353 20 10.533 20c1.97 0 3.806-.518 5.395-1.463l4.547 4.364a1 1 0 0 0 1.395-1.435l-4.516-4.333C18.324 15.5 19.94 12.864 19.94 11.386c0-5.18-4.228-10.107-9.407-10.107zm0 2c4.176 0 7.407 3.834 7.407 8.107 0 4.272-3.231 7.614-7.407 7.614-4.176 0-7.407-3.342-7.407-7.614 0-4.273 3.231-8.107 7.407-8.107z"/></svg>
              Search
            </a>
          </li>
          <li>
            <a routerLink="/library" routerLinkActive="bg-neutral-800 text-white"
              class="flex items-center gap-4 px-3 py-2.5 rounded-md transition-colors hover:text-white font-semibold text-sm">
              <svg viewBox="0 0 24 24" class="h-5 w-5 fill-current flex-shrink-0"><path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zM15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6.464a1 1 0 0 0-.5-.866l-6-3.464zM9 2a1 1 0 0 0-1 1v18a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1z"/></svg>
              Your Library
            </a>
          </li>
        </ul>
      </nav>

      <!-- Nav: ARTIST -->
      <nav *ngIf="role === 'artist'" class="px-3 mb-2">
        <ul class="space-y-1">
          <li>
            <a routerLink="/artist-dashboard" routerLinkActive="bg-neutral-800 text-white"
              class="flex items-center gap-4 px-3 py-2.5 rounded-md transition-colors hover:text-white font-semibold text-sm">
              <svg viewBox="0 0 24 24" class="h-5 w-5 fill-current flex-shrink-0"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
              My Music
            </a>
          </li>
          <li>
            <a routerLink="/dashboard" routerLinkActive="bg-neutral-800 text-white"
              class="flex items-center gap-4 px-3 py-2.5 rounded-md transition-colors hover:text-white font-semibold text-sm">
              <svg viewBox="0 0 24 24" class="h-5 w-5 fill-current flex-shrink-0"><path d="M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20h4.5v-6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v6H20V7.577l-7.5-4.33z"/></svg>
              Browse
            </a>
          </li>
          <li>
            <a routerLink="/search" routerLinkActive="bg-neutral-800 text-white"
              class="flex items-center gap-4 px-3 py-2.5 rounded-md transition-colors hover:text-white font-semibold text-sm">
              <svg viewBox="0 0 24 24" class="h-5 w-5 fill-current flex-shrink-0"><path d="M10.533 1.279c-5.18 0-9.407 4.927-9.407 10.107C1.126 16.514 5.353 20 10.533 20c1.97 0 3.806-.518 5.395-1.463l4.547 4.364a1 1 0 0 0 1.395-1.435l-4.516-4.333C18.324 15.5 19.94 12.864 19.94 11.386c0-5.18-4.228-10.107-9.407-10.107zm0 2c4.176 0 7.407 3.834 7.407 8.107 0 4.272-3.231 7.614-7.407 7.614-4.176 0-7.407-3.342-7.407-7.614 0-4.273 3.231-8.107 7.407-8.107z"/></svg>
              Search
            </a>
          </li>
        </ul>
      </nav>

      <!-- Nav: ADMIN -->
      <nav *ngIf="role === 'admin'" class="px-3 mb-2">
        <ul class="space-y-1">
          <li>
            <a routerLink="/admin" routerLinkActive="bg-neutral-800 text-white"
              class="flex items-center gap-4 px-3 py-2.5 rounded-md transition-colors hover:text-white font-semibold text-sm">
              <svg viewBox="0 0 24 24" class="h-5 w-5 fill-current flex-shrink-0"><path d="M12 15.5c-1.9 0-3.5-1.6-3.5-3.5S10.1 8.5 12 8.5s3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm7.4-3c.1-.3.1-.6.1-1s0-.6-.1-1l2.2-1.7c.2-.2.3-.4.2-.6l-2.1-3.6c-.1-.2-.4-.3-.6-.2l-2.6 1c-.5-.4-1.1-.7-1.7-1l-.4-2.7C14.3 2.2 14.1 2 13.9 2h-4.2c-.3 0-.5.2-.5.4L8.8 5.1c-.6.3-1.2.6-1.7 1l-2.6-1c-.2-.1-.5 0-.6.2L1.8 8.9c-.1.2-.1.4.2.6l2.2 1.7c-.1.3-.1.6-.1 1s0 .6.1 1l-2.2 1.7c-.2.2-.3.4-.2.6l2.1 3.6c.1.2.4.3.6.2l2.6-1c.5.4 1.1.7 1.7 1l.4 2.7c.1.2.3.4.5.4h4.2c.3 0 .5-.2.5-.4l.4-2.7c.6-.3 1.2-.6 1.7-1l2.6 1c.2.1.5 0 .6-.2l2.1-3.6c.1-.2.1-.4-.2-.6l-2.2-1.7z"/></svg>
              Admin Panel
            </a>
          </li>
          <li>
            <a routerLink="/dashboard" routerLinkActive="bg-neutral-800 text-white"
              class="flex items-center gap-4 px-3 py-2.5 rounded-md transition-colors hover:text-white font-semibold text-sm">
              <svg viewBox="0 0 24 24" class="h-5 w-5 fill-current flex-shrink-0"><path d="M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20h4.5v-6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v6H20V7.577l-7.5-4.33z"/></svg>
              Browse
            </a>
          </li>
          <li>
            <a routerLink="/search" routerLinkActive="bg-neutral-800 text-white"
              class="flex items-center gap-4 px-3 py-2.5 rounded-md transition-colors hover:text-white font-semibold text-sm">
              <svg viewBox="0 0 24 24" class="h-5 w-5 fill-current flex-shrink-0"><path d="M10.533 1.279c-5.18 0-9.407 4.927-9.407 10.107C1.126 16.514 5.353 20 10.533 20c1.97 0 3.806-.518 5.395-1.463l4.547 4.364a1 1 0 0 0 1.395-1.435l-4.516-4.333C18.324 15.5 19.94 12.864 19.94 11.386c0-5.18-4.228-10.107-9.407-10.107zm0 2c4.176 0 7.407 3.834 7.407 8.107 0 4.272-3.231 7.614-7.407 7.614-4.176 0-7.407-3.342-7.407-7.614 0-4.273 3.231-8.107 7.407-8.107z"/></svg>
              Search
            </a>
          </li>
        </ul>
      </nav>

      <!-- ─── Library Section (ALL roles) ─── -->
      <div class="flex-1 overflow-y-auto px-3 scrollbar-thin">

        <!-- Liked Songs (all roles) -->
        <div class="px-3 pt-4 pb-1">
          <h3 class="text-xs uppercase tracking-widest font-bold text-neutral-500 mb-2">Library</h3>
          <a routerLink="/liked-songs" routerLinkActive="text-white"
            class="flex items-center gap-3 py-2 text-sm hover:text-white transition-colors rounded-md hover:bg-white/5 px-1 no-underline">
            <div class="h-8 w-8 bg-gradient-to-br from-purple-700 to-indigo-700 rounded flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" class="h-4 w-4 fill-white"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </div>
            <span class="font-semibold">Liked Songs</span>
          </a>
        </div>

        <!-- Playlists (all roles) -->
        <div class="px-3 pt-3 pb-1">
          <h3 class="text-xs uppercase tracking-widest font-bold text-neutral-500 mb-1">Playlists</h3>
        </div>
        <ul class="space-y-0.5">
          <li *ngFor="let pl of playlists">
            <a [routerLink]="['/playlist', pl.id]"
              class="block px-4 py-2 text-sm hover:text-white transition-colors truncate rounded-md hover:bg-white/5 no-underline">
              {{ pl.name }}
            </a>
          </li>
          <li *ngIf="playlists.length === 0" class="px-4 py-2 text-xs text-neutral-600 italic">No playlists yet</li>
        </ul>

        <!-- Shared with You (all roles) -->
        <ng-container *ngIf="sharedPlaylists.length > 0">
          <div class="px-3 pt-4 pb-1">
            <h3 class="text-xs uppercase tracking-widest font-bold text-neutral-500 mb-1">Shared with You</h3>
          </div>
          <ul class="space-y-0.5">
            <li *ngFor="let item of sharedPlaylists">
              <a [routerLink]="['/playlist', item.playlists?.id]"
                class="flex items-center gap-2 px-4 py-2 text-sm hover:text-white transition-colors truncate rounded-md hover:bg-white/5 no-underline">
                <svg viewBox="0 0 24 24" class="h-3 w-3 fill-current flex-shrink-0 text-blue-500 opacity-80">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/>
                </svg>
                <span class="truncate">{{ item.playlists?.name }}</span>
              </a>
            </li>
          </ul>
        </ng-container>

        <!-- Albums (artist only) -->
        <div *ngIf="role === 'artist'" class="px-3 pt-4 pb-1">
          <h3 class="text-xs uppercase tracking-widest font-bold text-neutral-500 mb-1">Your Albums</h3>
        </div>
        <ul *ngIf="role === 'artist'" class="space-y-0.5">
          <li *ngFor="let al of artistAlbums">
            <a routerLink="/artist-dashboard"
              class="flex items-center gap-2 px-4 py-2 text-sm text-neutral-400 truncate rounded-md hover:bg-white/5 hover:text-white transition no-underline">
              <svg viewBox="0 0 24 24" class="h-3.5 w-3.5 fill-current flex-shrink-0 opacity-60"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
              {{ al.title }}
            </a>
          </li>
          <li *ngIf="artistAlbums.length === 0" class="px-4 py-2 text-xs text-neutral-600 italic">No albums yet</li>
        </ul>

      </div>
    </div>
  `,
  styles: `
    .scrollbar-thin::-webkit-scrollbar { width: 6px; }
    .scrollbar-thin::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
  `
})
export class SidebarComponent implements OnInit, OnDestroy {
  playlists: any[] = [];
  sharedPlaylists: any[] = [];
  artistAlbums: any[] = [];
  role = 'user';
  homeLink = '/dashboard';
  private refreshSub: any;
  private currentUser: any = null;

  constructor(
    private supabase: SupabaseService,
    private authService: AuthService,
    private eventBus: EventBusService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUser = user;
      this.role = user.role || 'user';
      this.homeLink = this.role === 'artist' ? '/artist-dashboard' : this.role === 'admin' ? '/admin' : '/dashboard';
      await this.loadData(user);
    }
    this.authService.currentUser$.subscribe(async (user) => {
      if (user) {
        this.currentUser = user;
        this.role = user.role || 'user';
        this.homeLink = this.role === 'artist' ? '/artist-dashboard' : this.role === 'admin' ? '/admin' : '/dashboard';
        await this.loadData(user);
        this.cdr.detectChanges();
      }
    });
    // Refresh sidebar when artist creates/modifies albums
    this.refreshSub = this.eventBus.sidebarRefresh$.subscribe(async () => {
      if (this.currentUser) {
        await this.loadData(this.currentUser);
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    this.refreshSub?.unsubscribe();
  }

  async loadData(user: any) {
    try {
      // Always load playlists and shared playlists for all roles
      const [playlists, shared] = await Promise.all([
        this.supabase.getUserPlaylists(user.id),
        this.supabase.getSharedPlaylistsForUser(user.id),
      ]);
      this.playlists = playlists;
      this.sharedPlaylists = shared;
      // Load albums for artists
      if (this.role === 'artist') {
        const artists = await this.supabase.getArtistsByUserId(user.id);
        const allAlbums: any[] = [];
        for (const a of artists) {
          const albums = await this.supabase.getAlbumsByArtist(a.id);
          allAlbums.push(...albums);
        }
        this.artistAlbums = allAlbums;
      }
      this.cdr.detectChanges();
    } catch (e) { console.error(e); }
  }
}
