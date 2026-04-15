import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-artist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="pb-28">
      <div *ngIf="loading" class="flex items-center justify-center mt-20">
        <div class="flex flex-col items-center gap-3">
          <div class="h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          <p class="text-neutral-400 text-sm">Loading artist...</p>
        </div>
      </div>

      <div *ngIf="!loading && !artist" class="text-center mt-20">
        <p class="text-neutral-400 text-lg mb-3">Artist not found.</p>
        <a routerLink="/dashboard" class="text-blue-400 hover:underline text-sm">← Back to Home</a>
      </div>

      <div *ngIf="!loading && artist">
        <!-- Hero Header -->
        <div class="relative mb-8">
          <div class="h-64 w-full bg-gradient-to-b from-blue-900/60 via-neutral-900/80 to-transparent rounded-xl overflow-hidden flex items-end p-8">
            <div class="absolute inset-0 bg-gradient-to-b from-blue-900/50 to-neutral-900 rounded-xl"></div>
            <div class="relative flex items-end gap-6 w-full">
              <div class="h-32 w-32 rounded-full bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center shadow-2xl flex-shrink-0 border-4 border-black/30">
                <svg viewBox="0 0 24 24" class="h-16 w-16 fill-white opacity-70">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Artist</p>
                <h1 class="text-5xl font-black text-white mb-1 truncate">{{ artist.stage_name }}</h1>
                <p *ngIf="artist.real_name" class="text-neutral-300 text-sm">{{ artist.real_name }}</p>
                <p *ngIf="artist.formation_year" class="text-neutral-500 text-xs mt-0.5">Since {{ artist.formation_year }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Bio -->
        <div *ngIf="artist.bio" class="mb-8 bg-neutral-900/60 border border-neutral-800 rounded-xl p-5">
          <h2 class="text-white font-bold mb-2 text-sm uppercase tracking-wider text-neutral-400">About</h2>
          <p class="text-neutral-300 text-sm leading-relaxed">{{ artist.bio }}</p>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-4 mb-8">
          <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center">
            <p class="text-3xl font-bold text-white">{{ albums.length }}</p>
            <p class="text-neutral-400 text-xs mt-1 uppercase tracking-wider">Albums</p>
          </div>
          <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center">
            <p class="text-3xl font-bold text-white">{{ totalSongs }}</p>
            <p class="text-neutral-400 text-xs mt-1 uppercase tracking-wider">Songs</p>
          </div>
          <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center">
            <p class="text-3xl font-bold text-blue-400">♫</p>
            <p class="text-neutral-400 text-xs mt-1 uppercase tracking-wider">Discography</p>
          </div>
        </div>

        <!-- Albums Section -->
        <div>
          <h2 class="text-2xl font-bold text-white mb-5">Discography</h2>
          <div *ngIf="albums.length === 0" class="text-neutral-500 italic text-sm">No albums published yet.</div>

          <div *ngFor="let album of albums" class="mb-4">
            <div class="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-600 transition-colors">
              <!-- Album Header -->
              <button (click)="toggleAlbum(album.id)"
                class="w-full flex items-center gap-4 p-4 text-left hover:bg-white/5 transition group">
                <div class="h-16 w-16 rounded-lg flex-shrink-0 flex items-center justify-center shadow-lg"
                  [ngClass]="getAlbumGradient(album.type)">
                  <svg viewBox="0 0 24 24" class="h-8 w-8 fill-white opacity-60">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-white font-bold truncate group-hover:text-blue-400 transition">{{ album.title }}</h3>
                  <p class="text-neutral-500 text-xs mt-0.5">
                    {{ album.release_year }} ·
                    <span class="capitalize">{{ album.type || 'Album' }}</span>
                    · {{ (album.album_songs?.length || 0) }} songs
                    <span *ngIf="album.record_label" class="text-neutral-600"> · {{ album.record_label }}</span>
                  </p>
                </div>
                <svg viewBox="0 0 24 24" class="h-5 w-5 fill-neutral-500 flex-shrink-0 transition-transform duration-200"
                  [class.rotate-180]="expandedAlbums.has(album.id)">
                  <path d="M7 10l5 5 5-5z"/>
                </svg>
              </button>

              <!-- Songs List (expanded) -->
              <div *ngIf="expandedAlbums.has(album.id)" class="border-t border-neutral-800">
                <div *ngFor="let link of album.album_songs; let i = index"
                  class="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition group cursor-default">
                  <span class="text-neutral-600 text-xs w-5 text-right flex-shrink-0">{{ i + 1 }}</span>
                  <div class="flex-1 min-w-0">
                    <p class="text-neutral-200 text-sm font-medium truncate">{{ link.songs?.title }}</p>
                    <div class="flex items-center gap-1 mt-0.5">
                      <span *ngIf="link.songs?.is_explicit"
                        class="text-[9px] bg-neutral-600 text-white font-bold px-1 rounded-sm">E</span>
                    </div>
                  </div>
                  <span class="text-neutral-500 text-xs flex-shrink-0">{{ fmtDur(link.songs?.duration_sec) }}</span>
                  <!-- Like button -->
                  <button (click)="toggleLike(link.songs?.id)"
                    [class]="likedIds.has(link.songs?.id)
                      ? 'text-red-400 hover:text-red-300 transition flex-shrink-0'
                      : 'text-neutral-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition flex-shrink-0'"
                    title="{{ likedIds.has(link.songs?.id) ? 'Unlike' : 'Like' }}">
                    <svg viewBox="0 0 24 24" class="h-4 w-4 fill-current">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </button>
                </div>
                <p *ngIf="!album.album_songs?.length" class="px-4 py-3 text-neutral-600 text-xs italic">No songs in this album.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    @keyframes spin { to { transform: rotate(360deg); } }
    .animate-spin { animation: spin 1s linear infinite; }
    .rotate-180 { transform: rotate(180deg); }
  `
})
export class ArtistComponent implements OnInit {
  artist: any = null;
  albums: any[] = [];
  loading = true;
  expandedAlbums = new Set<number>();
  likedIds = new Set<number>();
  currentUser: any = null;

  get totalSongs() {
    return this.albums.reduce((acc, al) => acc + (al.album_songs?.length || 0), 0);
  }

  constructor(
    private supabase: SupabaseService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    const id = parseInt(this.route.snapshot.paramMap.get('id') || '0');
    if (!id) { this.loading = false; return; }
    try {
      const [data, likedIds] = await Promise.all([
        this.supabase.getArtistById(id),
        this.currentUser ? this.supabase.getLikedSongIds(this.currentUser.id) : Promise.resolve(new Set<number>()),
      ]);
      this.artist = data;
      this.albums = (data as any)?.albums || [];
      this.albums.sort((a: any, b: any) => (b.release_year || 0) - (a.release_year || 0));
      this.likedIds = likedIds;
      if (this.albums.length > 0) this.expandedAlbums.add(this.albums[0].id);
    } catch (e) {
      console.error('Artist load error:', e);
    }
    this.loading = false;
    this.cdr.detectChanges();
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

  toggleAlbum(albumId: number) {
    if (this.expandedAlbums.has(albumId)) {
      this.expandedAlbums.delete(albumId);
    } else {
      this.expandedAlbums.add(albumId);
    }
  }

  getAlbumGradient(type: string): string {
    switch (type) {
      case 'single': return 'bg-gradient-to-br from-blue-800 to-indigo-900';
      case 'EP': return 'bg-gradient-to-br from-purple-800 to-violet-900';
      default: return 'bg-gradient-to-br from-blue-800 to-blue-950';
    }
  }

  fmtDur(s: number): string {
    if (!s) return '--:--';
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  }
}
