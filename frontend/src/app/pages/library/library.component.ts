import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../services/supabase';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pb-16">
      <h2 class="text-3xl font-bold text-white mb-6">Your Library</h2>

      <section class="mb-10">
        <h3 class="text-xl font-bold text-white mb-4">Your Playlists</h3>
        <div *ngIf="loadingOwn" class="text-neutral-400 text-sm italic">Loading...</div>
        <div class="flex flex-col gap-2">
          <div *ngFor="let pl of ownPlaylists" (click)="navigateToPlaylist(pl.id)"
            class="flex items-center gap-4 p-3 rounded-md hover:bg-white/10 cursor-pointer transition group">
            <div class="h-12 w-12 bg-neutral-800 rounded flex-shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 24 24" class="h-6 w-6 fill-neutral-500"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-white font-medium truncate group-hover:text-green-400 transition">{{ pl.name }}</p>
              <p class="text-neutral-400 text-xs mt-0.5">Playlist · {{ pl.playlist_songs?.[0]?.count ?? 0 }} songs</p>
            </div>
          </div>
          <p *ngIf="!loadingOwn && ownPlaylists.length === 0" class="text-neutral-500 italic text-sm">You have no playlists yet.</p>
        </div>
      </section>

      <section class="mb-10">
        <h3 class="text-xl font-bold text-white mb-4">Shared with You</h3>
        <div class="flex flex-col gap-2">
          <div *ngFor="let item of sharedPlaylists" (click)="navigateToPlaylist(item.playlists?.id)"
            class="flex items-center gap-4 p-3 rounded-md hover:bg-white/10 cursor-pointer transition group">
            <div class="h-12 w-12 bg-gradient-to-br from-green-800 to-teal-800 rounded flex-shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 24 24" class="h-6 w-6 fill-white opacity-70"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-white font-medium truncate group-hover:text-green-400 transition">{{ item.playlists?.name }}</p>
              <p class="text-neutral-400 text-xs mt-0.5">By {{ item.playlists?.users?.username || 'Unknown' }} · {{ item.playlists?.playlist_songs?.[0]?.count ?? 0 }} songs</p>
            </div>
          </div>
          <p *ngIf="!loadingOwn && sharedPlaylists.length === 0" class="text-neutral-500 italic text-sm">No shared playlists.</p>
        </div>
      </section>
    </div>
  `
})
export class LibraryComponent implements OnInit {
  ownPlaylists: any[] = [];
  sharedPlaylists: any[] = [];
  loadingOwn = true;
  userId = 0;

  constructor(
    private supabase: SupabaseService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    const stored = localStorage.getItem('spotify_clone_user_id');
    this.userId = stored ? parseInt(stored) : 0;
    if (this.userId) {
      try {
        const [own, shared] = await Promise.all([
          this.supabase.getUserPlaylists(this.userId),
          this.supabase.getSharedPlaylistsForUser(this.userId),
        ]);
        this.ownPlaylists = own;
        this.sharedPlaylists = shared;
      } catch (e) {
        console.error(e);
      }
    }
    this.loadingOwn = false;
    this.cdr.detectChanges();
  }

  navigateToPlaylist(id: number) {
    window.location.href = `/playlist/${id}`;
  }
}
