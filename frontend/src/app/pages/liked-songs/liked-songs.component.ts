import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-liked-songs',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="pb-16">
      <!-- Header -->
      <div class="flex items-end gap-6 mb-8 mt-2 p-6 rounded-xl"
        style="background: linear-gradient(180deg, #4c1d95 0%, transparent 100%)">
        <div class="h-40 w-40 bg-gradient-to-br from-purple-600 to-indigo-900 rounded shadow-2xl flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" class="h-20 w-20 fill-white opacity-80">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <div>
          <p class="text-xs text-white font-semibold uppercase tracking-widest mb-1">Playlist</p>
          <h1 class="text-5xl font-bold text-white mb-2">Liked Songs</h1>
          <p class="text-neutral-300 text-sm">
            <span class="font-semibold text-white">{{ user?.username }}</span>
            <span class="text-neutral-400"> · {{ songs.length }} songs</span>
          </p>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="text-neutral-400 text-sm italic text-center py-10">Loading liked songs...</div>

      <!-- Empty state -->
      <div *ngIf="!loading && songs.length === 0" class="text-center py-16">
        <svg viewBox="0 0 24 24" class="h-16 w-16 fill-neutral-700 mx-auto mb-4">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <p class="text-neutral-400">Songs you like will appear here.</p>
        <a routerLink="/search" class="mt-3 inline-block bg-white text-black font-bold px-5 py-2 rounded-full text-sm hover:bg-neutral-200 transition no-underline">Find songs</a>
      </div>

      <!-- Songs Table -->
      <table *ngIf="!loading && songs.length > 0" class="w-full text-left">
        <thead>
          <tr class="text-neutral-400 border-b border-neutral-800 text-xs uppercase tracking-wider">
            <th class="w-8 pb-3 font-normal text-center">#</th>
            <th class="pb-3 font-normal pl-3">Title</th>
            <th class="pb-3 font-normal hidden md:table-cell">Album</th>
            <th class="pb-3 font-normal hidden md:table-cell">Artist</th>
            <th class="pb-3 font-normal hidden lg:table-cell">Liked</th>
            <th class="pb-3 font-normal text-right pr-4">
              <svg viewBox="0 0 16 16" class="h-4 w-4 fill-current inline-block"><path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8z"/></svg>
            </th>
            <th class="w-10"></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of songs; let i = index" class="group hover:bg-white/5 transition">
            <td class="py-3 text-center text-neutral-400 text-sm">{{ i + 1 }}</td>
            <td class="py-3 pl-3">
              <p class="text-white text-sm font-medium">{{ item.songs?.title }}</p>
              <span *ngIf="item.songs?.is_explicit" class="text-[10px] bg-neutral-500 text-black font-bold px-1 rounded-sm">E</span>
            </td>
            <td class="py-3 text-neutral-400 text-sm hidden md:table-cell truncate max-w-[180px]">
              {{ item.songs?.album_songs?.[0]?.albums?.title || '—' }}
            </td>
            <td class="py-3 text-neutral-400 text-sm hidden md:table-cell truncate max-w-[140px]">
              <a *ngIf="item.songs?.album_songs?.[0]?.albums?.artists?.id"
                [routerLink]="['/artist', item.songs?.album_songs?.[0]?.albums?.artists?.id]"
                class="hover:text-green-400 transition">
                {{ item.songs?.album_songs?.[0]?.albums?.artists?.stage_name || '—' }}
              </a>
              <span *ngIf="!item.songs?.album_songs?.[0]?.albums?.artists?.id">—</span>
            </td>
            <td class="py-3 text-neutral-500 text-xs hidden lg:table-cell">{{ item.liked_at }}</td>
            <td class="py-3 text-right pr-4 text-neutral-400 text-sm">{{ fmtDur(item.songs?.duration_sec) }}</td>
            <td class="py-3 pr-2 text-right">
              <button (click)="unlike(item.songs?.id)"
                class="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition"
                title="Unlike">
                <svg viewBox="0 0 24 24" class="h-4 w-4 fill-current">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class LikedSongsComponent implements OnInit {
  songs: any[] = [];
  loading = true;
  user: any = null;

  constructor(
    private supabase: SupabaseService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      try {
        this.songs = await this.supabase.getLikedSongs(this.user.id);
      } catch (e) { console.error(e); }
    }
    this.loading = false;
    this.cdr.detectChanges();
  }

  async unlike(songId: number) {
    if (!songId || !this.user) return;
    try {
      await this.supabase.unlikeSong(this.user.id, songId);
      this.songs = this.songs.filter((s: any) => s.songs?.id !== songId);
      this.cdr.detectChanges();
    } catch (e) { console.error(e); }
  }

  fmtDur(s: number): string {
    if (!s) return '--:--';
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  }
}
