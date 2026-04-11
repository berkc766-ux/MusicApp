import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-playlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="pb-16">
      <div *ngIf="loading" class="text-neutral-400 italic mt-10 text-center">Loading playlist...</div>

      <div *ngIf="!loading">
        <!-- Header -->
        <div class="flex items-end gap-6 mb-8 mt-2">
          <div class="h-40 w-40 bg-gradient-to-br from-indigo-800 to-purple-900 rounded shadow-2xl flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" class="h-20 w-20 fill-white opacity-50"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs text-white font-semibold uppercase tracking-widest mb-1">Playlist</p>
            <h1 class="text-4xl font-bold text-white mb-2 truncate">{{ playlist?.name || 'Playlist' }}</h1>
            <p *ngIf="playlist?.description" class="text-neutral-400 text-sm mb-1 truncate">{{ playlist?.description }}</p>
            <p class="text-neutral-400 text-sm">
              <a *ngIf="playlist?.users?.id" [routerLink]="['/user', playlist.users.id]"
                class="font-semibold text-white hover:underline">{{ playlist?.users?.username || 'Unknown' }}</a>
              <span *ngIf="!playlist?.users?.id" class="font-semibold text-white">Unknown</span>
              <span class="text-neutral-500"> · {{ songs.length }} songs</span>
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-4 mb-6">
          <button class="bg-green-500 text-black h-14 w-14 rounded-full flex items-center justify-center hover:scale-105 hover:bg-green-400 transition shadow-xl">
            <svg viewBox="0 0 16 16" class="h-6 w-6 fill-current ml-1"><path d="M3 1.713a.7.7 0 011.05-.607l10.89 6.288a.7.7 0 010 1.212L4.05 14.894A.7.7 0 013 14.288V1.713z"/></svg>
          </button>
          <!-- Delete playlist (own only) -->
          <button *ngIf="isOwner" (click)="confirmDelete()"
            class="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 text-sm font-semibold px-4 py-2 rounded-full transition">
            <svg viewBox="0 0 24 24" class="h-4 w-4 fill-current"><path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zm3-9h2v8H9v-8zm4 0h2v8h-2v-8zM15.5 4l-1-1h-5l-1 1H5v2h14V4h-3.5z"/></svg>
            Delete Playlist
          </button>
        </div>

        <!-- Delete confirmation modal -->
        <div *ngIf="showDeleteConfirm"
          class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          (click)="showDeleteConfirm = false">
          <div class="bg-neutral-900 border border-red-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            (click)="$event.stopPropagation()">
            <h3 class="text-xl font-bold text-white mb-2">Delete Playlist?</h3>
            <p class="text-neutral-400 text-sm mb-5">
              This will permanently delete <span class="text-white font-semibold">{{ playlist?.name }}</span>.
            </p>
            <div class="flex gap-3">
              <button (click)="deletePlaylist()" [disabled]="deleting"
                class="bg-red-600 hover:bg-red-500 text-white font-bold px-5 py-2 rounded-full text-sm transition disabled:opacity-50">
                {{ deleting ? 'Deleting...' : 'Yes, delete' }}
              </button>
              <button (click)="showDeleteConfirm = false"
                class="text-neutral-400 hover:text-white px-4 py-2 text-sm transition">Cancel</button>
            </div>
          </div>
        </div>

        <!-- Songs Table -->
        <table class="w-full text-left">
          <thead>
            <tr class="text-neutral-400 border-b border-neutral-800 text-xs uppercase tracking-wider">
              <th class="w-8 pb-3 font-normal text-center">#</th>
              <th class="pb-3 font-normal pl-3">Title</th>
              <th class="pb-3 font-normal hidden md:table-cell">Album</th>
              <th class="pb-3 font-normal hidden md:table-cell">Artist</th>
              <th class="pb-3 font-normal text-right pr-4">
                <svg viewBox="0 0 16 16" class="h-4 w-4 fill-current inline-block"><path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8z"/></svg>
              </th>
              <th *ngIf="isOwner" class="w-10"></th>
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
              <td class="py-3 text-right pr-4 text-neutral-400 text-sm">{{ fmtDur(item.songs?.duration_sec) }}</td>
              <td *ngIf="isOwner" class="py-3 pr-2 text-right">
                <button (click)="removeSong(item.songs?.id)"
                  class="text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition text-lg leading-none"
                  title="Remove from playlist">✕</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="songs.length === 0" class="text-neutral-500 italic text-sm mt-4">This playlist is empty.</p>
      </div>
    </div>
  `
})
export class PlaylistComponent implements OnInit {
  playlistId = 0;
  playlist: any = null;
  songs: any[] = [];
  loading = true;
  isOwner = false;
  showDeleteConfirm = false;
  deleting = false;

  constructor(
    private supabase: SupabaseService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.playlistId = parseInt(this.route.snapshot.paramMap.get('id') || '0');
    const currentUser = this.authService.getCurrentUser();
    try {
      const [playlist, songs] = await Promise.all([
        this.supabase.getPlaylistById(this.playlistId),
        this.supabase.getPlaylistSongs(this.playlistId),
      ]);
      this.playlist = playlist;
      this.songs = songs;
      this.isOwner = currentUser?.id === playlist?.user_id;
    } catch (e) {
      console.error(e);
    }
    this.loading = false;
    this.cdr.detectChanges();
  }

  async removeSong(songId: number) {
    if (!songId) return;
    try {
      await this.supabase.removeSongFromPlaylist(this.playlistId, songId);
      this.songs = await this.supabase.getPlaylistSongs(this.playlistId);
      this.cdr.detectChanges();
    } catch (e) { console.error(e); }
  }

  confirmDelete() { this.showDeleteConfirm = true; }

  async deletePlaylist() {
    this.deleting = true;
    try {
      await this.supabase.deletePlaylist(this.playlistId);
      this.router.navigate(['/dashboard']);
    } catch (e) {
      console.error(e);
      this.deleting = false;
      this.showDeleteConfirm = false;
      this.cdr.detectChanges();
    }
  }

  fmtDur(s: number): string {
    if (!s) return '--:--';
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  }
}
