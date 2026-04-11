import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase';
import { AuthService } from '../../services/auth';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="pb-16">

      <!-- Search Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-6">Search</h1>

        <!-- Search Input -->
        <div class="relative max-w-xl">
          <svg viewBox="0 0 24 24" class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 fill-neutral-400 pointer-events-none">
            <path d="M10.533 1.279c-5.18 0-9.407 4.927-9.407 10.107C1.126 16.514 5.353 20 10.533 20c1.97 0 3.806-.518 5.395-1.463l4.547 4.364a1 1 0 0 0 1.395-1.435l-4.516-4.333C18.324 15.5 19.94 12.864 19.94 11.386c0-5.18-4.228-10.107-9.407-10.107zm0 2c4.176 0 7.407 3.834 7.407 8.107 0 4.272-3.231 7.614-7.407 7.614-4.176 0-7.407-3.342-7.407-7.614 0-4.273 3.231-8.107 7.407-8.107z"/>
          </svg>
          <input
            id="search-input"
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onQueryChange($event)"
            placeholder="What do you want to listen to?"
            class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-full py-3 pl-12 pr-5 text-sm focus:outline-none focus:border-white focus:bg-neutral-700 transition"
            autofocus
          >
          <button *ngIf="searchQuery" (click)="clearSearch()"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition">
            <svg viewBox="0 0 24 24" class="h-5 w-5 fill-current">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- No Query: Browse Categories -->
      <div *ngIf="!searchQuery.trim()">
        <h2 class="text-xl font-bold text-white mb-4">Browse All</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <a routerLink="/dashboard"
            class="relative h-28 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform no-underline"
            style="background: linear-gradient(135deg, #1db954, #0d7377)">
            <span class="absolute bottom-3 left-4 text-white font-bold text-base">Home</span>
            <svg viewBox="0 0 24 24" class="absolute -bottom-2 -right-2 h-20 w-20 fill-white opacity-20">
              <path d="M12.5 3.247a1 1 0 00-1 0L4 7.577V20h4.5v-6a1 1 0 011-1h5a1 1 0 011 1v6H20V7.577l-7.5-4.33z"/>
            </svg>
          </a>
          <div class="relative h-28 rounded-xl overflow-hidden cursor-default"
            style="background: linear-gradient(135deg, #4f46e5, #7c3aed)">
            <span class="absolute bottom-3 left-4 text-white font-bold text-base">Artists</span>
            <svg viewBox="0 0 24 24" class="absolute -bottom-2 -right-2 h-20 w-20 fill-white opacity-20">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <div class="relative h-28 rounded-xl overflow-hidden cursor-default"
            style="background: linear-gradient(135deg, #dc2626, #9333ea)">
            <span class="absolute bottom-3 left-4 text-white font-bold text-base">Albums</span>
            <svg viewBox="0 0 24 24" class="absolute -bottom-2 -right-2 h-20 w-20 fill-white opacity-20">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
          <div class="relative h-28 rounded-xl overflow-hidden cursor-default"
            style="background: linear-gradient(135deg, #d97706, #ea580c)">
            <span class="absolute bottom-3 left-4 text-white font-bold text-base">Playlists</span>
            <svg viewBox="0 0 24 24" class="absolute -bottom-2 -right-2 h-20 w-20 fill-white opacity-20">
              <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Search Results -->
      <div *ngIf="searchQuery.trim()">

        <!-- Searching spinner -->
        <div *ngIf="searching" class="flex items-center gap-3 mb-6">
          <div class="h-5 w-5 rounded-full border-2 border-green-500 border-t-transparent animate-spin"></div>
          <p class="text-neutral-400 text-sm">Searching...</p>
        </div>

        <!-- No results -->
        <div *ngIf="!searching && noResults" class="text-center mt-10">
          <p class="text-white font-bold text-xl mb-2">No results found for</p>
          <p class="text-neutral-400 text-lg">"{{ searchQuery }}"</p>
          <p class="text-neutral-500 text-sm mt-3">Please make sure your words are spelled correctly, or use fewer or different keywords.</p>
        </div>

        <!-- ── Songs ── -->
        <section *ngIf="results.songs.length > 0" class="mb-8">
          <h2 class="text-2xl font-bold text-white mb-4">Songs</h2>
          <table class="w-full text-left">
            <thead>
              <tr class="text-neutral-400 border-b border-neutral-800 text-xs uppercase tracking-wider">
                <th class="w-8 pb-3 font-normal text-center">#</th>
                <th class="pb-3 font-normal pl-3">Title</th>
                <th class="pb-3 font-normal hidden md:table-cell">Album</th>
                <th class="pb-3 font-normal hidden md:table-cell">Artist</th>
                <th class="pb-3 font-normal text-right pr-4">⏱</th>
                <th class="w-8"></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let song of results.songs; let i = index"
                class="group hover:bg-white/5 transition cursor-default">
                <td class="w-8 text-center text-neutral-400 py-3 text-sm">{{ i + 1 }}</td>
                <td class="py-3 pl-3">
                  <div class="flex items-center gap-3">
                    <div class="h-10 w-10 bg-neutral-800 rounded flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" class="h-5 w-5 fill-neutral-500">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                      </svg>
                    </div>
                    <div>
                      <div class="text-white text-sm font-medium">{{ song.title }}</div>
                      <span *ngIf="song.is_explicit" class="text-[10px] bg-neutral-500 text-black font-bold px-1 rounded-sm">E</span>
                    </div>
                  </div>
                </td>
                <td class="py-3 text-neutral-400 text-sm hidden md:table-cell truncate max-w-[180px]">
                  {{ song.album_songs?.[0]?.albums?.title || '—' }}
                </td>
                <td class="py-3 text-neutral-400 text-sm hidden md:table-cell">
                  <a *ngIf="song.album_songs?.[0]?.albums?.artists"
                    [routerLink]="['/artist', song.album_songs?.[0]?.albums?.artists?.id]"
                    class="hover:text-green-400 transition hover:underline">
                    {{ song.album_songs?.[0]?.albums?.artists?.stage_name || '—' }}
                  </a>
                  <span *ngIf="!song.album_songs?.[0]?.albums?.artists">—</span>
                </td>
                <td class="py-3 text-neutral-400 text-sm text-right pr-2">{{ fmtDur(song.duration_sec) }}</td>
                <!-- Like button -->
                <td class="py-3 pr-3 text-center">
                  <button (click)="toggleLike(song.id)"
                    [class]="likedIds.has(song.id)
                      ? 'text-red-400 hover:text-red-300 transition'
                      : 'text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition'"
                    title="{{ likedIds.has(song.id) ? 'Unlike' : 'Like' }}">
                    <svg viewBox="0 0 24 24" class="h-4 w-4 fill-current">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- ── Artists ── -->
        <section *ngIf="results.artists.length > 0" class="mb-8">
          <h2 class="text-2xl font-bold text-white mb-4">Artists</h2>
          <div class="flex flex-wrap gap-4">
            <a *ngFor="let artist of results.artists" [routerLink]="['/artist', artist.id]"
              class="flex flex-col items-center w-36 p-4 rounded-xl hover:bg-white/10 transition cursor-pointer group no-underline">
              <div class="h-28 w-28 rounded-full bg-gradient-to-br from-green-800 to-teal-900 flex items-center justify-center mb-3 shadow-lg group-hover:opacity-80 transition">
                <svg viewBox="0 0 24 24" class="h-12 w-12 fill-white opacity-50">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <p class="text-white text-sm font-semibold text-center truncate w-full">{{ artist.stage_name }}</p>
              <p class="text-neutral-400 text-xs mt-0.5">Artist</p>
            </a>
          </div>
        </section>

        <!-- ── Albums ── -->
        <section *ngIf="results.albums.length > 0" class="mb-8">
          <h2 class="text-2xl font-bold text-white mb-4">Albums</h2>
          <div class="flex flex-wrap gap-4">
            <div *ngFor="let album of results.albums"
              class="bg-neutral-800 hover:bg-neutral-700 p-4 rounded-lg transition cursor-default w-44 group">
              <div class="aspect-square rounded-md mb-3 bg-gradient-to-br from-neutral-700 to-neutral-900 flex items-center justify-center shadow-lg">
                <svg viewBox="0 0 24 24" class="h-10 w-10 fill-neutral-500">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>
              <h3 class="text-white font-semibold text-sm truncate">{{ album.title }}</h3>
              <p class="text-neutral-400 text-xs mt-0.5">
                {{ album.release_year }} ·
                <a *ngIf="album.artists" [routerLink]="['/artist', album.artists?.id]"
                  class="hover:text-green-400 transition">{{ album.artists?.stage_name }}</a>
              </p>
            </div>
          </div>
        </section>

        <!-- ── Playlists ── -->
        <section *ngIf="results.playlists.length > 0" class="mb-8">
          <h2 class="text-2xl font-bold text-white mb-4">Playlists</h2>
          <div class="flex flex-wrap gap-4">
            <a *ngFor="let pl of results.playlists" [routerLink]="['/playlist', pl.id]"
              class="bg-neutral-800 hover:bg-neutral-700 p-4 rounded-lg transition cursor-pointer w-44 group no-underline">
              <div class="aspect-square rounded-md mb-3 bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center shadow-lg">
                <svg viewBox="0 0 24 24" class="h-10 w-10 fill-white opacity-40">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>
              <h3 class="text-white font-semibold text-sm truncate group-hover:text-green-400 transition">{{ pl.name }}</h3>
              <p class="text-neutral-400 text-xs mt-0.5 truncate">
                By <a [routerLink]="['/user', pl.users?.id]" class="hover:text-green-400 transition" (click)="$event.stopPropagation()">{{ pl.users?.username || 'Unknown' }}</a>
              </p>
            </a>
          </div>
        </section>

      </div>
    </div>
  `,
  styles: `
    @keyframes spin { to { transform: rotate(360deg); } }
    .animate-spin { animation: spin 1s linear infinite; }
  `
})
export class SearchComponent implements OnInit, OnDestroy {
  searchQuery = '';
  searching = false;
  results: { songs: any[]; artists: any[]; albums: any[]; playlists: any[] } = {
    songs: [], artists: [], albums: [], playlists: []
  };
  likedIds = new Set<number>();
  currentUser: any = null;

  private searchSubject = new Subject<string>();
  private subscription: any;

  get noResults(): boolean {
    return !this.searching &&
      this.searchQuery.trim().length > 0 &&
      this.results.songs.length === 0 &&
      this.results.artists.length === 0 &&
      this.results.albums.length === 0 &&
      this.results.playlists.length === 0;
  }

  constructor(
    private supabase: SupabaseService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.likedIds = await this.supabase.getLikedSongIds(this.currentUser.id);
    }

    // Read query param on load
    this.route.queryParamMap.subscribe(params => {
      const q = params.get('q') || '';
      if (q && q !== this.searchQuery) {
        this.searchQuery = q;
        this.doSearch(q);
      }
    });

    // Debounce search as user types
    this.subscription = this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe(q => {
      this.doSearch(q);
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: q.trim() ? { q } : {},
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  onQueryChange(q: string) {
    this.searchSubject.next(q);
  }

  clearSearch() {
    this.searchQuery = '';
    this.results = { songs: [], artists: [], albums: [], playlists: [] };
    this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
  }

  async toggleLike(songId: number) {
    if (!songId || !this.currentUser) return;
    try {
      if (this.likedIds.has(songId)) {
        await this.supabase.unlikeSong(this.currentUser.id, songId);
        this.likedIds.delete(songId);
      } else {
        await this.supabase.likeSong(this.currentUser.id, songId);
        this.likedIds.add(songId);
      }
      this.likedIds = new Set(this.likedIds);
      this.cdr.detectChanges();
    } catch (e) { console.error(e); }
  }

  private async doSearch(query: string) {
    if (!query.trim()) {
      this.results = { songs: [], artists: [], albums: [], playlists: [] };
      this.cdr.detectChanges();
      return;
    }
    this.searching = true;
    this.cdr.detectChanges();
    try {
      this.results = await this.supabase.searchAll(query.trim());
    } catch (e) {
      console.error('Search error:', e);
    }
    this.searching = false;
    this.cdr.detectChanges();
  }

  fmtDur(s: number): string {
    if (!s) return '--:--';
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  }
}
