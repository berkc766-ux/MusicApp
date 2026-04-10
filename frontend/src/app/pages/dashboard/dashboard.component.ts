import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <div class="pb-16">
      <!-- Greeting -->
      <h2 class="text-3xl font-bold text-white mb-6">{{ greeting }}</h2>

      <!-- Quick Access -->
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
        <div class="bg-white/10 hover:bg-white/20 transition rounded-md flex items-center h-16 cursor-pointer group overflow-hidden">
          <div class="h-16 w-16 bg-gradient-to-br from-purple-700 to-indigo-700 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" class="h-7 w-7 fill-white"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </div>
          <span class="font-bold text-white px-4 text-sm">Liked Songs</span>
        </div>
        <div class="bg-white/10 hover:bg-white/20 transition rounded-md flex items-center h-16 cursor-pointer group overflow-hidden">
          <div class="h-16 w-16 bg-gradient-to-br from-green-700 to-teal-700 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" class="h-7 w-7 fill-white"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          </div>
          <span class="font-bold text-white px-4 text-sm">Your Top Songs</span>
        </div>
      </div>

      <!-- Featured Playlists -->
      <section class="mb-10">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-white">Featured Playlists</h2>
          <span class="text-sm text-neutral-400 hover:text-white cursor-pointer hover:underline">Show all</span>
        </div>
        <div *ngIf="isLoading" class="text-neutral-400 text-sm italic">Loading...</div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          <div *ngFor="let pl of featuredPlaylists"
            class="bg-neutral-800 hover:bg-neutral-700 p-4 rounded-lg transition-colors cursor-pointer group relative">
            <div class="aspect-square rounded-md mb-4 relative overflow-hidden bg-neutral-700 shadow-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" class="h-12 w-12 fill-neutral-500"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
              <button class="absolute bottom-2 right-2 bg-green-500 text-black h-10 w-10 rounded-full flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-xl hover:scale-105 hover:bg-green-400">
                <svg viewBox="0 0 16 16" class="h-4 w-4 fill-current ml-0.5"><path d="M3 1.713a.7.7 0 011.05-.607l10.89 6.288a.7.7 0 010 1.212L4.05 14.894A.7.7 0 013 14.288V1.713z"/></svg>
              </button>
            </div>
            <h3 class="text-white font-semibold text-sm truncate">{{ pl.name }}</h3>
            <p class="text-neutral-400 text-xs mt-1 line-clamp-2">{{ pl.description || 'By ' + (pl.users?.username || 'Unknown') }}</p>
          </div>
        </div>
        <p *ngIf="!isLoading && featuredPlaylists.length === 0" class="text-neutral-500 italic text-sm mt-2">No playlists in database yet.</p>
      </section>

      <!-- Recent Songs Table -->
      <section class="mb-10">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-white">Recently Added</h2>
          <span class="text-sm text-neutral-400 hover:text-white cursor-pointer hover:underline">Show all</span>
        </div>
        <div *ngIf="isLoading" class="text-neutral-400 text-sm italic">Loading...</div>
        <table *ngIf="!isLoading" class="w-full text-left">
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
            <tr *ngFor="let song of recentSongs; let i = index"
              class="group hover:bg-white/5 transition rounded-md">
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
              <td class="py-3 text-neutral-400 text-sm hidden md:table-cell hover:text-white cursor-pointer transition truncate max-w-[180px]">
                {{ song.album_songs?.[0]?.albums?.title || '—' }}
              </td>
              <td class="py-3 text-neutral-400 text-sm hidden md:table-cell hover:text-white cursor-pointer transition truncate max-w-[140px]">
                {{ song.album_songs?.[0]?.albums?.artists?.stage_name || '—' }}
              </td>
              <td class="py-3 text-neutral-400 text-sm text-right pr-4">{{ fmtDur(song.duration_sec) }}</td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="!isLoading && recentSongs.length === 0" class="text-neutral-500 italic text-sm mt-2">No songs in database yet.</p>
      </section>

      <!-- Artists Row -->
      <section class="mb-10">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-white">Artists</h2>
        </div>
        <div *ngIf="isLoading" class="text-neutral-400 text-sm italic">Loading...</div>
        <div *ngIf="!isLoading" class="flex gap-5 overflow-x-auto pb-3">
          <div *ngFor="let artist of artists"
            class="flex-shrink-0 w-40 text-center cursor-pointer group">
            <div class="h-40 w-40 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 mx-auto mb-2 flex items-center justify-center group-hover:opacity-80 transition shadow-lg">
              <svg viewBox="0 0 24 24" class="h-14 w-14 fill-neutral-500"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </div>
            <p class="text-white text-sm font-semibold">{{ artist.stage_name }}</p>
            <p class="text-neutral-400 text-xs mt-0.5">Artist</p>
          </div>
          <p *ngIf="artists.length === 0" class="text-neutral-500 italic text-sm">No artists in database yet.</p>
        </div>
      </section>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  greeting = 'Good evening';
  featuredPlaylists: any[] = [];
  recentSongs: any[] = [];
  artists: any[] = [];
  isLoading = true;

  constructor(
    private supabase: SupabaseService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.updateGreeting();
    try {
      const [playlists, songs, artists] = await Promise.all([
        this.supabase.getFeaturedPlaylists(),
        this.supabase.getRecentSongs(),
        this.supabase.getAllArtists(),
      ]);
      this.featuredPlaylists = playlists;
      this.recentSongs = songs;
      this.artists = artists;
    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges(); // Force Angular to re-render after async data
    }
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
