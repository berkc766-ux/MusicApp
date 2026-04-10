import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pb-10">
      <!-- Greeting -->
      <h2 class="text-3xl font-bold text-white mb-6">{{ greeting }}</h2>

      <!-- Recent/Liked Section Mockup -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div class="bg-white/10 hover:bg-white/20 transition-colors rounded shadow-md flex items-center h-20 cursor-pointer group overflow-hidden">
          <div class="h-20 w-20 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" class="h-8 w-8 text-white fill-current"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>
          </div>
          <div class="flex-1 font-bold text-white px-4">Liked Songs</div>
          <button class="bg-green-500 text-black h-12 w-12 rounded-full flex outline-none items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-105 transition-all mr-4 shadow-xl">
            <svg viewBox="0 0 16 16" class="h-5 w-5 fill-current ml-1"><path d="M3 1.713a.7.7 0 011.05-.607l10.89 6.288a.7.7 0 010 1.212L4.05 14.894A.7.7 0 013 14.288V1.713z"></path></svg>
          </button>
        </div>
      </div>

      <!-- Featured Playlists (From Supabase Playlists Table) -->
      <h2 class="text-2xl font-bold text-white mb-4 hover:underline cursor-pointer">Featured Playlists</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 mb-10">
        <div *ngFor="let playlist of featuredPlaylists" class="bg-[#181818] hover:bg-[#282828] p-4 rounded-md transition-colors cursor-pointer group">
          <div class="aspect-square bg-neutral-800 rounded-md shadow-lg mb-4 relative overflow-hidden">
            <!-- Mock Cover -->
            <div class="w-full h-full bg-gradient-to-br from-neutral-700 to-neutral-900 flex items-center justify-center">
              <svg viewBox="0 0 24 24" class="h-12 w-12 text-neutral-500 fill-current opacity-50"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"></path></svg>
            </div>
            
            <!-- Play Button Overlay -->
            <button class="absolute bottom-2 right-2 bg-green-500 text-black h-12 w-12 rounded-full flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-xl hover:scale-105 hover:bg-green-400">
              <svg viewBox="0 0 16 16" class="h-5 w-5 fill-current ml-1"><path d="M3 1.713a.7.7 0 011.05-.607l10.89 6.288a.7.7 0 010 1.212L4.05 14.894A.7.7 0 013 14.288V1.713z"></path></svg>
            </button>
          </div>
          <h3 class="text-white font-bold mb-1 truncate">{{ playlist.name }}</h3>
          <p class="text-neutral-400 text-sm line-clamp-2">{{ playlist.description || 'By ' + (playlist.users?.username || 'Unknown User') }}</p>
        </div>
        <div *ngIf="featuredPlaylists?.length === 0" class="text-neutral-500 italic col-span-full">No playlists found in database.</div>
      </div>

      <!-- Recent Songs (From Supabase Songs Table) -->
      <h2 class="text-2xl font-bold text-white mb-4 hover:underline cursor-pointer">Recently Added Songs</h2>
      <div class="flex flex-col mb-10 w-full overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="text-neutral-400 border-b border-neutral-800 text-sm">
              <th class="w-12 pb-2 font-normal text-center">#</th>
              <th class="pb-2 font-normal pl-2">Title</th>
              <th class="pb-2 font-normal hidden md:table-cell">Album</th>
              <th class="pb-2 font-normal text-right pr-4"><svg viewBox="0 0 16 16" class="h-4 w-4 fill-current inline"><path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8z"></path></svg></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let song of recentSongs; let i = index" class="hover:bg-white/10 group transition-colors rounded-md py-1">
              <td class="w-12 text-center text-neutral-400 py-3 rounded-l-md">{{ i + 1 }}</td>
              <td class="py-3 px-2">
                <div class="text-white font-normal truncate group-hover:underline cursor-pointer block leading-tight">{{ song.title }}</div>
                <div *ngIf="song.is_explicit" class="inline-block bg-neutral-400 text-black text-[10px] items-center justify-center px-1 rounded-sm mt-1 font-bold">E</div>
              </td>
              <td class="py-3 text-neutral-400 text-sm hidden md:table-cell group-hover:text-white truncate cursor-pointer transition-colors max-w-[200px]">
                {{ song.album_songs?.[0]?.albums?.title || 'Unknown Album' }}
              </td>
              <td class="py-3 text-neutral-400 text-sm text-right pr-4 rounded-r-md">
                {{ formatDuration(song.duration_sec) }}
              </td>
            </tr>
            <tr *ngIf="recentSongs?.length === 0">
              <td colspan="4" class="text-neutral-500 italic py-4">No songs found in database.</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  `
})
export class DashboardComponent implements OnInit {
  greeting = 'Good morning';
  featuredPlaylists: any[] = [];
  recentSongs: any[] = [];

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    this.updateGreeting();
    
    try {
      this.featuredPlaylists = await this.supabase.getFeaturedPlaylists();
      this.recentSongs = await this.supabase.getRecentSongs();
    } catch (e) {
      console.error("Error fetching dashboard data:", e);
    }
  }

  updateGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) this.greeting = 'Good morning';
    else if (hour < 18) this.greeting = 'Good afternoon';
    else this.greeting = 'Good evening';
  }

  formatDuration(seconds: number): string {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
