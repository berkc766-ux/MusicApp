import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="pb-16">
      <h2 class="text-3xl font-bold text-white mb-6">{{ greeting }}, <span class="text-blue-400">{{ userName }}</span> 👋</h2>

      <!-- Quick Access -->
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
        <a routerLink="/liked-songs"
          class="bg-white/10 hover:bg-white/20 transition rounded-md flex items-center h-16 cursor-pointer overflow-hidden no-underline">
          <div class="h-16 w-16 bg-gradient-to-br from-purple-700 to-indigo-700 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" class="h-7 w-7 fill-white"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </div>
          <span class="font-bold text-white px-4 text-sm">Liked Songs</span>
        </a>
        <div class="bg-white/10 hover:bg-white/20 transition rounded-md flex items-center h-16 cursor-pointer overflow-hidden"
          (click)="showCreatePlaylist = true">
          <div class="h-16 w-16 bg-gradient-to-br from-blue-700 to-blue-800 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" class="h-7 w-7 fill-white"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          </div>
          <span class="font-bold text-white px-4 text-sm">Create Playlist</span>
        </div>
      </div>

      <!-- Create Playlist Modal -->
      <div *ngIf="showCreatePlaylist"
        class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        (click)="showCreatePlaylist = false">
        <div class="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
          (click)="$event.stopPropagation()">
          <h3 class="text-xl font-bold text-white mb-4">Create Playlist</h3>
          <div class="space-y-3">
            <input type="text" [(ngModel)]="newPlaylistName" placeholder="Playlist name *"
              class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-white transition"
              autofocus>
            <textarea [(ngModel)]="newPlaylistDesc" placeholder="Add description (optional)" rows="2"
              class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-white transition resize-none"></textarea>
            <div *ngIf="createPlaylistError" class="text-red-400 text-xs">{{ createPlaylistError }}</div>
            <div class="flex gap-2 pt-1">
              <button (click)="createPlaylist()" [disabled]="!newPlaylistName || creatingPlaylist"
                class="bg-blue-500 hover:bg-blue-400 text-black font-bold px-5 py-2 rounded-full text-sm transition disabled:opacity-50">
                {{ creatingPlaylist ? 'Creating...' : 'Create' }}
              </button>
              <button (click)="showCreatePlaylist = false"
                class="text-neutral-400 hover:text-white px-4 py-2 text-sm transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Song to Playlist Modal -->
      <div *ngIf="showAddSong"
        class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        (click)="showAddSong = false">
        <div class="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
          (click)="$event.stopPropagation()">
          <h3 class="text-xl font-bold text-white mb-1">Add Songs</h3>
          <p class="text-neutral-400 text-sm mb-4">to <span class="text-white font-semibold">{{ selectedPlaylistName }}</span></p>
          <div class="mb-3">
            <input type="text" [(ngModel)]="songSearch" placeholder="Search songs..."
              class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-4 py-2 text-sm focus:outline-none focus:border-white">
          </div>
          <div class="max-h-72 overflow-y-auto space-y-1">
            <div *ngFor="let song of filteredSongs"
              (click)="addSong(song)"
              class="flex items-center justify-between px-3 py-2 rounded-md hover:bg-white/10 cursor-pointer transition group">
              <span class="text-neutral-300 text-sm group-hover:text-white">{{ song.title }}</span>
              <span class="text-blue-400 text-xs font-bold opacity-0 group-hover:opacity-100 transition">+ Add</span>
            </div>
            <p *ngIf="filteredSongs.length === 0" class="text-neutral-500 italic text-sm px-3 py-2">No songs found.</p>
          </div>
          <div *ngIf="addSongMsg" class="mt-3 text-sm" [class]="addSongSuccess ? 'text-blue-400' : 'text-red-400'">{{ addSongMsg }}</div>
          <button (click)="showAddSong = false" class="mt-4 text-neutral-400 hover:text-white text-sm transition">Done</button>
        </div>
      </div>

      <!-- My Playlists -->
      <section class="mb-10">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-white">My Playlists</h2>
          <button (click)="showCreatePlaylist = true"
            class="text-blue-400 hover:text-blue-300 text-sm font-bold transition">
            + New Playlist
          </button>
        </div>
        <div *ngIf="isLoading" class="text-neutral-400 text-sm italic">Loading...</div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <div *ngFor="let pl of myPlaylists"
            class="bg-neutral-800 hover:bg-neutral-700 p-4 rounded-lg transition-colors cursor-pointer group relative">
            <div class="aspect-square rounded-md mb-3 bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center shadow-lg relative">
              <svg viewBox="0 0 24 24" class="h-10 w-10 fill-white opacity-40"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
              <button (click)="$event.stopPropagation(); openAddSong(pl)"
                class="absolute bottom-2 right-2 bg-blue-500 text-black h-9 w-9 rounded-full flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-xl hover:scale-105">
                <svg viewBox="0 0 16 16" class="h-4 w-4 fill-current ml-0.5"><path d="M3 1.713a.7.7 0 011.05-.607l10.89 6.288a.7.7 0 010 1.212L4.05 14.894A.7.7 0 013 14.288V1.713z"/></svg>
              </button>
            </div>
            <a [routerLink]="['/playlist', pl.id]" class="block">
              <h3 class="text-white font-semibold text-sm truncate">{{ pl.name }}</h3>
              <p class="text-neutral-400 text-xs mt-0.5">{{ pl.playlist_songs?.[0]?.count ?? 0 }} songs</p>
            </a>
            <button (click)="$event.stopPropagation(); openAddSong(pl)"
              class="mt-2 w-full text-xs text-neutral-400 hover:text-blue-400 transition text-left">
              + Add songs
            </button>
          </div>
        </div>
        <p *ngIf="!isLoading && myPlaylists.length === 0"
          class="text-neutral-500 italic text-sm mt-2">
          No playlists yet.
          <button (click)="showCreatePlaylist = true" class="text-blue-400 hover:underline ml-1">Create your first!</button>
        </p>
      </section>

      <!-- Featured Playlists -->
      <section class="mb-10">
        <h2 class="text-2xl font-bold text-white mb-4">Featured Playlists</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <a *ngFor="let pl of featuredPlaylists" [routerLink]="['/playlist', pl.id]"
            class="bg-neutral-800 hover:bg-neutral-700 p-4 rounded-lg transition-colors cursor-pointer group no-underline">
            <div class="aspect-square rounded-md mb-3 bg-neutral-700 flex items-center justify-center shadow-lg">
              <svg viewBox="0 0 24 24" class="h-10 w-10 fill-neutral-500"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            </div>
            <h3 class="text-white font-semibold text-sm truncate">{{ pl.name }}</h3>
            <p class="text-neutral-400 text-xs mt-0.5 truncate">
              <span *ngIf="pl.description">{{ pl.description }}</span>
              <span *ngIf="!pl.description">By
                <a *ngIf="pl.users?.id" [routerLink]="['/user', pl.users?.id]"
                  class="hover:text-blue-400 transition" (click)="$event.stopPropagation()">
                  {{ pl.users?.username || 'Unknown' }}
                </a>
                <span *ngIf="!pl.users?.id">{{ pl.users?.username || 'Unknown' }}</span>
              </span>
            </p>
          </a>
        </div>
        <p *ngIf="!isLoading && featuredPlaylists.length === 0" class="text-neutral-500 italic text-sm mt-2">No featured playlists yet.</p>
      </section>

      <!-- Recently Added Songs -->
      <section class="mb-10">
        <h2 class="text-2xl font-bold text-white mb-4">Recently Added</h2>
        <div *ngIf="isLoading" class="text-neutral-400 text-sm italic">Loading...</div>
        <table *ngIf="!isLoading" class="w-full text-left">
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
            <tr *ngFor="let song of recentSongs; let i = index"
              class="group hover:bg-white/5 transition cursor-pointer">
              <td class="w-8 text-center text-neutral-400 py-3 text-sm">{{ i + 1 }}</td>
              <td class="py-3 pl-3">
                <div class="flex items-center gap-3">
                  <div class="h-10 w-10 bg-neutral-800 rounded flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" class="h-5 w-5 fill-neutral-500"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
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
              <td class="py-3 text-neutral-400 text-sm hidden md:table-cell truncate max-w-[140px]">
                <a *ngIf="song.album_songs?.[0]?.albums?.artists?.id"
                  [routerLink]="['/artist', song.album_songs?.[0]?.albums?.artists?.id]"
                  class="hover:text-blue-400 transition" (click)="$event.stopPropagation()">
                  {{ song.album_songs?.[0]?.albums?.artists?.stage_name || '—' }}
                </a>
                <span *ngIf="!song.album_songs?.[0]?.albums?.artists?.id">—</span>
              </td>
              <td class="py-3 text-neutral-400 text-sm text-right pr-2">{{ fmtDur(song.duration_sec) }}</td>
              <!-- Like button -->
              <td class="py-3 pr-3 text-center">
                <button (click)="toggleLike(song.id); $event.stopPropagation()"
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
        <p *ngIf="!isLoading && recentSongs.length === 0" class="text-neutral-500 italic text-sm mt-2">No songs in database yet.</p>
      </section>

      <!-- Artists -->
      <section class="mb-10">
        <h2 class="text-2xl font-bold text-white mb-4">Artists</h2>
        <div *ngIf="!isLoading" class="flex gap-5 overflow-x-auto pb-3">
          <a *ngFor="let artist of artists" [routerLink]="['/artist', artist.id]"
            class="flex-shrink-0 w-36 text-center cursor-pointer group no-underline">
            <div class="h-36 w-36 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 mx-auto mb-2 flex items-center justify-center group-hover:opacity-80 transition shadow-lg">
              <svg viewBox="0 0 24 24" class="h-12 w-12 fill-neutral-500"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </div>
            <p class="text-white text-sm font-semibold truncate group-hover:text-blue-400 transition">{{ artist.stage_name }}</p>
            <p class="text-neutral-400 text-xs mt-0.5">Artist</p>
          </a>
          <p *ngIf="artists.length === 0" class="text-neutral-500 italic text-sm">No artists yet.</p>
        </div>
      </section>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  greeting = 'Good evening';
  userName = '';
  featuredPlaylists: any[] = [];
  myPlaylists: any[] = [];
  recentSongs: any[] = [];
  allSongs: any[] = [];
  artists: any[] = [];
  likedIds = new Set<number>();
  isLoading = true;
  currentUser: any = null;

  showCreatePlaylist = false;
  newPlaylistName = '';
  newPlaylistDesc = '';
  creatingPlaylist = false;
  createPlaylistError = '';

  showAddSong = false;
  selectedPlaylistId = 0;
  selectedPlaylistName = '';
  songSearch = '';
  addSongMsg = '';
  addSongSuccess = false;

  get filteredSongs() {
    if (!this.songSearch.trim()) return this.allSongs;
    const q = this.songSearch.toLowerCase();
    return this.allSongs.filter(s => s.title.toLowerCase().includes(q));
  }

  constructor(
    private supabase: SupabaseService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.updateGreeting();
    this.currentUser = this.authService.getCurrentUser();
    this.userName = this.currentUser?.first_name || this.currentUser?.username || '';
    try {
      const [playlists, featured, songs, artists, allSongs, likedIds] = await Promise.all([
        this.currentUser ? this.supabase.getUserPlaylists(this.currentUser.id) : Promise.resolve([]),
        this.supabase.getFeaturedPlaylists(),
        this.supabase.getRecentSongs(),
        this.supabase.getAllArtists(),
        this.supabase.getAllSongs(),
        this.currentUser ? this.supabase.getLikedSongIds(this.currentUser.id) : Promise.resolve(new Set<number>()),
      ]);
      this.myPlaylists = playlists;
      this.featuredPlaylists = featured;
      this.recentSongs = songs;
      this.artists = artists;
      this.allSongs = allSongs;
      this.likedIds = likedIds;
    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
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

  async createPlaylist() {
    if (!this.currentUser || !this.newPlaylistName) return;
    this.creatingPlaylist = true;
    this.createPlaylistError = '';
    try {
      await this.supabase.createPlaylist(this.currentUser.id, this.newPlaylistName, this.newPlaylistDesc);
      this.myPlaylists = await this.supabase.getUserPlaylists(this.currentUser.id);
      this.showCreatePlaylist = false;
      this.newPlaylistName = '';
      this.newPlaylistDesc = '';
    } catch (e: any) {
      this.createPlaylistError = e?.message || 'Failed to create playlist.';
    }
    this.creatingPlaylist = false;
    this.cdr.detectChanges();
  }

  openAddSong(playlist: any) {
    this.selectedPlaylistId = playlist.id;
    this.selectedPlaylistName = playlist.name;
    this.songSearch = '';
    this.addSongMsg = '';
    this.showAddSong = true;
  }

  async addSong(song: any) {
    this.addSongMsg = '';
    try {
      await this.supabase.addSongToPlaylist(this.selectedPlaylistId, song.id);
      this.addSongSuccess = true;
      this.addSongMsg = `"${song.title}" added!`;
      if (this.currentUser) this.myPlaylists = await this.supabase.getUserPlaylists(this.currentUser.id);
    } catch (e: any) {
      this.addSongSuccess = false;
      this.addSongMsg = e?.message || 'Failed to add song.';
    }
    this.cdr.detectChanges();
  }

  updateGreeting() {
    const h = new Date().getHours();
    if (h < 12) this.greeting = 'Good morning';
    else if (h < 18) this.greeting = 'Good afternoon';
    else this.greeting = 'Good evening';
  }

  fmtDur(s: number): string {
    if (!s) return '--:--';
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  }
}
