import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-playlist',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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
            <p class="text-xs text-white font-semibold uppercase tracking-widest mb-1">
              Playlist <span *ngIf="playlist?.is_public" class="ml-2 bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full text-[10px]">Public</span>
            </p>
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
        <div class="flex items-center gap-3 mb-6 flex-wrap">
          <button class="bg-blue-500 text-black h-14 w-14 rounded-full flex items-center justify-center hover:scale-105 hover:bg-blue-400 transition shadow-xl">
            <svg viewBox="0 0 16 16" class="h-6 w-6 fill-current ml-1"><path d="M3 1.713a.7.7 0 011.05-.607l10.89 6.288a.7.7 0 010 1.212L4.05 14.894A.7.7 0 013 14.288V1.713z"/></svg>
          </button>
          <!-- Add Song (owner only) -->
          <button *ngIf="isOwner" (click)="openAddSong()"
            class="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-neutral-700 text-white text-sm font-semibold px-4 py-2 rounded-full transition">
            <svg viewBox="0 0 24 24" class="h-4 w-4 fill-current"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            Add Songs
          </button>
          <!-- Share (owner only) -->
          <button *ngIf="isOwner" (click)="openShare()"
            class="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-neutral-700 text-white text-sm font-semibold px-4 py-2 rounded-full transition">
            <svg viewBox="0 0 24 24" class="h-4 w-4 fill-current"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/></svg>
            Share
          </button>
          <!-- Delete (owner only) -->
          <button *ngIf="isOwner" (click)="confirmDelete()"
            class="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 text-sm font-semibold px-4 py-2 rounded-full transition">
            <svg viewBox="0 0 24 24" class="h-4 w-4 fill-current"><path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zm3-9h2v8H9v-8zm4 0h2v8h-2v-8zM15.5 4l-1-1h-5l-1 1H5v2h14V4h-3.5z"/></svg>
            Delete
          </button>
          <!-- Remove from Library (shared user only) -->
          <button *ngIf="isSharedWithMe" (click)="confirmRemoveShared()"
            class="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 text-sm font-semibold px-4 py-2 rounded-full transition">
            <svg viewBox="0 0 24 24" class="h-4 w-4 fill-current"><path d="M19 13H5v-2h14v2z"/></svg>
            Remove from Library
          </button>
        </div>

        <!-- ─── Share Modal ─── -->
        <div *ngIf="showShare"
          class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          (click)="showShare = false">
          <div class="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-xl font-bold text-white">Share Playlist</h3>
                <p class="text-neutral-400 text-xs mt-0.5">{{ playlist?.name }}</p>
              </div>
              <button (click)="showShare = false" class="text-neutral-500 hover:text-white text-2xl leading-none">×</button>
            </div>

            <!-- Share with Everyone -->
            <div class="mb-4 p-4 rounded-xl border transition"
              [class]="playlist?.is_public ? 'bg-blue-500/10 border-blue-500/40' : 'bg-neutral-800 border-neutral-700'">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-white font-semibold text-sm">🌍 Share with Everyone</p>
                  <p class="text-neutral-400 text-xs mt-0.5">Makes this playlist appear in Featured Playlists for all users</p>
                </div>
                <button (click)="togglePublic()" [disabled]="togglingPublic"
                  [class]="playlist?.is_public
                    ? 'relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500 transition'
                    : 'relative inline-flex h-6 w-11 items-center rounded-full bg-neutral-600 transition'">
                  <span [class]="playlist?.is_public ? 'translate-x-6 h-4 w-4 rounded-full bg-white inline-block transition' : 'translate-x-1 h-4 w-4 rounded-full bg-white inline-block transition'"></span>
                </button>
              </div>
              <p *ngIf="playlist?.is_public" class="text-blue-400 text-xs mt-2">✓ Now visible to all users in Featured Playlists</p>
            </div>

            <!-- Share with User -->
            <div>
              <p class="text-white font-semibold text-sm mb-2">👤 Share with a User</p>
              <div class="relative mb-2">
                <input type="text" [(ngModel)]="userSearch" placeholder="Search by username or email..."
                  class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white transition">
              </div>
              <div class="max-h-40 overflow-y-auto space-y-1">
                <div *ngFor="let u of filteredUsers"
                  (click)="shareWithUser(u)"
                  class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer transition group">
                  <div class="flex items-center gap-2">
                    <div class="h-7 w-7 bg-neutral-700 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {{ u.username.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <p class="text-white text-sm font-medium">{{ u.username }}</p>
                      <p class="text-neutral-500 text-xs">{{ u.email }}</p>
                    </div>
                  </div>
                  <span class="text-blue-400 text-xs font-bold opacity-0 group-hover:opacity-100 transition">Share →</span>
                </div>
                <p *ngIf="filteredUsers.length === 0 && userSearch" class="text-neutral-500 text-sm italic px-2 py-1">No users found.</p>
              </div>
            </div>
            <div *ngIf="shareMsg" class="mt-3 text-sm"
              [class]="shareSuccess ? 'text-blue-400' : 'text-red-400'">{{ shareMsg }}</div>
          </div>
        </div>

        <!-- ─── Add Song Modal ─── -->
        <div *ngIf="showAddSong"
          class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          (click)="showAddSong = false">
          <div class="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col max-h-[80vh]"
            (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between mb-4 flex-shrink-0">
              <h3 class="text-xl font-bold text-white">Add Songs</h3>
              <button (click)="showAddSong = false" class="text-neutral-500 hover:text-white text-2xl leading-none transition">×</button>
            </div>
            <div class="relative flex-shrink-0 mb-3">
              <input type="text" [(ngModel)]="songSearch" placeholder="Search songs..."
                class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-full py-2 pl-4 pr-4 text-sm focus:outline-none focus:border-white transition">
            </div>
            <div class="flex-1 overflow-y-auto space-y-0.5 min-h-0">
              <div *ngFor="let song of filteredSongs"
                (click)="addSong(song)"
                class="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/10 cursor-pointer transition group">
                <span class="text-neutral-300 text-sm group-hover:text-white truncate">{{ song.title }}</span>
                <span class="text-blue-400 text-xs font-bold ml-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition">+ Add</span>
              </div>
              <p *ngIf="filteredSongs.length === 0" class="text-neutral-500 italic text-sm px-3 py-2">No songs found.</p>
            </div>
            <div *ngIf="addSongMsg" class="mt-3 flex-shrink-0 text-sm"
              [class]="addSongSuccess ? 'text-blue-400' : 'text-red-400'">{{ addSongMsg }}</div>
          </div>
        </div>

        <!-- ─── Delete confirmation ─── -->
        <div *ngIf="showDeleteConfirm"
          class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          (click)="showDeleteConfirm = false">
          <div class="bg-neutral-900 border border-red-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            (click)="$event.stopPropagation()">
            <h3 class="text-xl font-bold text-white mb-2">Delete Playlist?</h3>
            <p class="text-neutral-400 text-sm mb-5">This will permanently delete <span class="text-white font-semibold">{{ playlist?.name }}</span>.</p>
            <div class="flex gap-3">
              <button (click)="deletePlaylist()" [disabled]="deleting"
                class="bg-red-600 hover:bg-red-500 text-white font-bold px-5 py-2 rounded-full text-sm transition disabled:opacity-50">
                {{ deleting ? 'Deleting...' : 'Yes, delete' }}
              </button>
              <button (click)="showDeleteConfirm = false" class="text-neutral-400 hover:text-white px-4 py-2 text-sm transition">Cancel</button>
            </div>
          </div>
        </div>

        <!-- ─── Remove shared playlist confirmation ─── -->
        <div *ngIf="showRemoveSharedConfirm"
          class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          (click)="showRemoveSharedConfirm = false">
          <div class="bg-neutral-900 border border-red-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            (click)="$event.stopPropagation()">
            <h3 class="text-xl font-bold text-white mb-2">Remove from Library?</h3>
            <p class="text-neutral-400 text-sm mb-5">
              <span class="text-white font-semibold">{{ playlist?.name }}</span> was shared with you.
              It will be removed from your library but the playlist will not be deleted.
            </p>
            <div class="flex gap-3">
              <button (click)="removeSharedPlaylist()" [disabled]="removingShared"
                class="bg-red-600 hover:bg-red-500 text-white font-bold px-5 py-2 rounded-full text-sm transition disabled:opacity-50">
                {{ removingShared ? 'Removing...' : 'Yes, remove' }}
              </button>
              <button (click)="showRemoveSharedConfirm = false" class="text-neutral-400 hover:text-white px-4 py-2 text-sm transition">Cancel</button>
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
              <th class="w-8"></th>
              <th *ngIf="isOwner" class="w-8"></th>
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
                  class="hover:text-blue-400 transition">
                  {{ item.songs?.album_songs?.[0]?.albums?.artists?.stage_name || '—' }}
                </a>
                <span *ngIf="!item.songs?.album_songs?.[0]?.albums?.artists?.id">—</span>
              </td>
              <td class="py-3 text-right pr-2 text-neutral-400 text-sm">{{ fmtDur(item.songs?.duration_sec) }}</td>
              <!-- Like button -->
              <td class="py-3 text-center">
                <button (click)="toggleLike(item.songs?.id)"
                  [class]="likedIds.has(item.songs?.id) ? 'text-red-400 hover:text-red-300 transition' : 'text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition'"
                  title="{{ likedIds.has(item.songs?.id) ? 'Unlike' : 'Like' }}">
                  <svg viewBox="0 0 24 24" class="h-4 w-4 fill-current">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </button>
              </td>
              <td *ngIf="isOwner" class="py-3 pr-2 text-right">
                <button (click)="removeSong(item.songs?.id)"
                  class="text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition text-lg leading-none"
                  title="Remove from playlist">✕</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="songs.length === 0" class="text-neutral-500 italic text-sm mt-4">This playlist is empty.
          <button *ngIf="isOwner" (click)="openAddSong()" class="text-blue-400 hover:underline ml-1">Add songs!</button>
        </p>
      </div>
    </div>
  `
})
export class PlaylistComponent implements OnInit, OnDestroy {
  playlistId = 0;
  playlist: any = null;
  songs: any[] = [];
  allSongs: any[] = [];
  allUsers: any[] = [];
  likedIds = new Set<number>();
  loading = true;
  isOwner = false;
  isSharedWithMe = false;
  currentUser: any = null;
  private routeSub: any;

  showRemoveSharedConfirm = false;
  removingShared = false;

  showDeleteConfirm = false;
  deleting = false;

  showAddSong = false;
  songSearch = '';
  addSongMsg = '';
  addSongSuccess = false;

  showShare = false;
  userSearch = '';
  shareMsg = '';
  shareSuccess = false;
  togglingPublic = false;

  get filteredSongs() {
    const q = this.songSearch.trim().toLowerCase();
    const existing = new Set(this.songs.map((s: any) => s.songs?.id));
    const available = this.allSongs.filter((s: any) => !existing.has(s.id));
    if (!q) return available;
    return available.filter(s => s.title.toLowerCase().includes(q));
  }

  get filteredUsers() {
    const q = this.userSearch.trim().toLowerCase();
    const filtered = this.allUsers.filter((u: any) => u.id !== this.currentUser?.id);
    if (!q) return filtered.slice(0, 8);
    return filtered.filter((u: any) =>
      u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    ).slice(0, 8);
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
    this.routeSub = this.route.paramMap.subscribe(async params => {
      this.playlistId = parseInt(params.get('id') || '0');
      await this.loadPlaylist();
    });
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
  }

  private async loadPlaylist() {
    this.loading = true;
    this.playlist = null;
    this.songs = [];
    this.cdr.detectChanges();
    try {
      const [playlist, songs, allSongs, allUsers, likedIds] = await Promise.all([
        this.supabase.getPlaylistById(this.playlistId),
        this.supabase.getPlaylistSongs(this.playlistId),
        this.supabase.getAllSongs(),
        this.supabase.getAllUsers(),
        this.currentUser ? this.supabase.getLikedSongIds(this.currentUser.id) : Promise.resolve(new Set<number>()),
      ]);
      this.playlist = playlist;
      this.songs = songs;
      this.allSongs = allSongs;
      this.allUsers = allUsers;
      this.likedIds = likedIds;
      this.isOwner = this.currentUser?.id === playlist?.user_id;
      // Check if playlist was shared with current user (not owner)
      if (!this.isOwner && this.currentUser) {
        const shared = await this.supabase.getSharedPlaylistsForUser(this.currentUser.id);
        this.isSharedWithMe = shared.some((s: any) => s.playlists?.id === this.playlistId);
      } else {
        this.isSharedWithMe = false;
      }
    } catch (e) { console.error(e); }
    this.loading = false;
    this.cdr.detectChanges();
  }

  openAddSong() { this.songSearch = ''; this.addSongMsg = ''; this.showAddSong = true; }

  async addSong(song: any) {
    this.addSongMsg = '';
    try {
      await this.supabase.addSongToPlaylist(this.playlistId, song.id);
      this.songs = await this.supabase.getPlaylistSongs(this.playlistId);
      this.addSongSuccess = true;
      this.addSongMsg = `"${song.title}" added!`;
    } catch (e: any) {
      this.addSongSuccess = false;
      this.addSongMsg = e?.message?.includes('duplicate') ? `Already in playlist.` : (e?.message || 'Failed to add song.');
    }
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

  openShare() { this.userSearch = ''; this.shareMsg = ''; this.showShare = true; }

  async togglePublic() {
    if (!this.playlist) return;
    this.togglingPublic = true;
    try {
      const newVal = !this.playlist.is_public;
      await this.supabase.setPlaylistPublic(this.playlistId, newVal);
      this.playlist = { ...this.playlist, is_public: newVal };
    } catch (e: any) { console.error(e); }
    this.togglingPublic = false;
    this.cdr.detectChanges();
  }

  async shareWithUser(user: any) {
    this.shareMsg = '';
    try {
      await this.supabase.sharePlaylist(this.playlistId, user.id);
      this.shareSuccess = true;
      this.shareMsg = `Shared with ${user.username}!`;
    } catch (e: any) {
      this.shareSuccess = false;
      this.shareMsg = e?.message?.includes('duplicate') ? `Already shared with ${user.username}.` : (e?.message || 'Failed to share.');
    }
    this.cdr.detectChanges();
  }

  confirmDelete() { this.showDeleteConfirm = true; }

  confirmRemoveShared() { this.showRemoveSharedConfirm = true; }

  async removeSharedPlaylist() {
    this.removingShared = true;
    try {
      await this.supabase.removeSharedPlaylist(this.playlistId, this.currentUser.id);
      this.router.navigate(['/dashboard']);
    } catch (e) {
      console.error(e);
      this.removingShared = false;
      this.showRemoveSharedConfirm = false;
      this.cdr.detectChanges();
    }
  }

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
