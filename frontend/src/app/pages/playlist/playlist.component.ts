import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../services/supabase';

@Component({
  selector: 'app-playlist',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pb-16">
      <div *ngIf="loading" class="text-neutral-400 italic mt-10 text-center">Loading playlist...</div>

      <div *ngIf="!loading">
        <div class="flex items-end gap-6 mb-8 mt-2">
          <div class="h-40 w-40 bg-gradient-to-br from-indigo-800 to-purple-900 rounded shadow-2xl flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" class="h-20 w-20 fill-white opacity-50"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          </div>
          <div>
            <p class="text-xs text-white font-semibold uppercase tracking-widest mb-1">Playlist</p>
            <h1 class="text-4xl font-bold text-white mb-2">{{ playlistName || 'Playlist' }}</h1>
            <p class="text-neutral-400 text-sm">{{ songs.length }} songs</p>
          </div>
        </div>

        <div class="flex items-center gap-6 mb-6">
          <button class="bg-green-500 text-black h-14 w-14 rounded-full flex items-center justify-center hover:scale-105 hover:bg-green-400 transition shadow-xl">
            <svg viewBox="0 0 16 16" class="h-6 w-6 fill-current ml-1"><path d="M3 1.713a.7.7 0 011.05-.607l10.89 6.288a.7.7 0 010 1.212L4.05 14.894A.7.7 0 013 14.288V1.713z"/></svg>
          </button>
        </div>

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
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of songs; let i = index" class="group hover:bg-white/5 transition">
              <td class="py-3 text-center text-neutral-400 text-sm">{{ i + 1 }}</td>
              <td class="py-3 pl-3">
                <p class="text-white text-sm font-medium">{{ item.songs?.title }}</p>
              </td>
              <td class="py-3 text-neutral-400 text-sm hidden md:table-cell truncate max-w-[180px]">
                {{ item.songs?.album_songs?.[0]?.albums?.title || '—' }}
              </td>
              <td class="py-3 text-neutral-400 text-sm hidden md:table-cell truncate max-w-[140px]">
                {{ item.songs?.album_songs?.[0]?.albums?.artists?.stage_name || '—' }}
              </td>
              <td class="py-3 text-right pr-4 text-neutral-400 text-sm">{{ fmtDur(item.songs?.duration_sec) }}</td>
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
  playlistName = '';
  songs: any[] = [];
  loading = true;

  constructor(
    private supabase: SupabaseService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.playlistId = parseInt(this.route.snapshot.paramMap.get('id') || '0');
    try {
      this.songs = await this.supabase.getPlaylistSongs(this.playlistId);
    } catch (e) {
      console.error(e);
    }
    this.loading = false;
    this.cdr.detectChanges();
  }

  fmtDur(s: number): string {
    if (!s) return '--:--';
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  }
}
