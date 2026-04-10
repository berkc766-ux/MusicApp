import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase';

type Tab = 'songs-by-artist' | 'user-playlists' | 'rename-song' | 'add-artist' | 'delete-album';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pb-16">
      <h2 class="text-3xl font-bold text-white mb-2">Admin Panel</h2>
      <p class="text-neutral-400 text-sm mb-6">Manage artists, songs, albums, and more.</p>

      <!-- Tabs -->
      <div class="flex gap-2 mb-8 flex-wrap">
        <button *ngFor="let tab of tabs" (click)="activeTab = tab.key"
          [class]="activeTab === tab.key
            ? 'bg-white text-black font-bold px-4 py-2 rounded-full text-sm transition'
            : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 px-4 py-2 rounded-full text-sm transition'">
          {{ tab.label }}
        </button>
      </div>

      <!-- ── TAB 1: Songs by Artist ────────────────────────────── -->
      <section *ngIf="activeTab === 'songs-by-artist'" class="bg-neutral-900 p-6 rounded-xl">
        <h3 class="text-xl font-bold text-white mb-4">Songs by Artist</h3>
        <div class="flex gap-3 mb-5">
          <select [(ngModel)]="selectedArtistId"
            class="bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2 flex-1 focus:outline-none focus:border-white">
            <option value="">-- Select Artist --</option>
            <option *ngFor="let a of artists" [value]="a.id">{{ a.stage_name }}</option>
          </select>
          <button (click)="loadSongsByArtist()" [disabled]="!selectedArtistId || loadingArtistSongs"
            class="bg-green-500 text-black font-bold px-4 py-2 rounded-md hover:bg-green-400 transition disabled:opacity-50">
            {{ loadingArtistSongs ? 'Loading...' : 'Search' }}
          </button>
        </div>
        <div *ngFor="let album of artistAlbums" class="mb-5">
          <h4 class="text-white font-semibold text-sm mb-2 flex items-center gap-2">
            <span class="bg-neutral-700 px-2 py-0.5 rounded text-xs">{{ album.release_year }}</span>
            {{ album.title }}
          </h4>
          <div class="flex flex-col gap-1 pl-3 border-l-2 border-neutral-700">
            <div *ngFor="let link of album.album_songs" class="flex items-center justify-between py-1.5 hover:bg-white/5 px-2 rounded transition">
              <span class="text-neutral-300 text-sm">{{ link.songs?.title }}</span>
              <span class="text-neutral-500 text-xs">{{ fmtDur(link.songs?.duration_sec) }}</span>
            </div>
            <p *ngIf="album.album_songs?.length === 0" class="text-neutral-500 text-xs italic">No songs.</p>
          </div>
        </div>
        <p *ngIf="artistAlbums.length === 0 && selectedArtistId && !loadingArtistSongs" class="text-neutral-500 italic text-sm mt-2">No albums found for this artist.</p>
      </section>

      <!-- ── TAB 2: User Playlists ─────────────────────────────── -->
      <section *ngIf="activeTab === 'user-playlists'" class="bg-neutral-900 p-6 rounded-xl">
        <h3 class="text-xl font-bold text-white mb-4">User Playlists & Song Count</h3>
        <div class="flex gap-3 mb-5">
          <select [(ngModel)]="selectedUserId"
            class="bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2 flex-1 focus:outline-none focus:border-white">
            <option value="">-- Select User --</option>
            <option *ngFor="let u of allUsers" [value]="u.id">{{ u.username }} ({{ u.email }})</option>
          </select>
          <button (click)="loadUserPlaylists()" [disabled]="!selectedUserId || loadingUserPlaylists"
            class="bg-green-500 text-black font-bold px-4 py-2 rounded-md hover:bg-green-400 transition disabled:opacity-50">
            {{ loadingUserPlaylists ? 'Loading...' : 'Load' }}
          </button>
        </div>
        <table *ngIf="userPlaylists.length > 0" class="w-full text-sm text-left">
          <thead>
            <tr class="text-xs uppercase text-neutral-400 border-b border-neutral-800">
              <th class="pb-2 font-normal">Playlist Name</th>
              <th class="pb-2 font-normal text-right">Song Count</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let pl of userPlaylists" class="border-b border-neutral-800/50 hover:bg-white/5 transition">
              <td class="py-3 text-white">{{ pl.name }}</td>
              <td class="py-3 text-right text-neutral-400">{{ pl.playlist_songs?.[0]?.count ?? 0 }}</td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="userPlaylists.length === 0 && selectedUserId && !loadingUserPlaylists" class="text-neutral-500 italic text-sm">No playlists found.</p>
      </section>

      <!-- ── TAB 3: Rename Song ────────────────────────────────── -->
      <section *ngIf="activeTab === 'rename-song'" class="bg-neutral-900 p-6 rounded-xl">
        <h3 class="text-xl font-bold text-white mb-4">Change Song Name</h3>
        <div class="space-y-4 max-w-lg">
          <div>
            <label class="block text-sm font-medium text-neutral-300 mb-1">Select Song</label>
            <select [(ngModel)]="selectedSongId"
              class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2 focus:outline-none focus:border-white">
              <option value="">-- Pick a song --</option>
              <option *ngFor="let s of allSongs" [value]="s.id">{{ s.title }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-300 mb-1">New Title</label>
            <input type="text" [(ngModel)]="newSongTitle" placeholder="Enter new title..."
              class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2 focus:outline-none focus:border-white transition">
          </div>
          <button (click)="renameSong()" [disabled]="!selectedSongId || !newSongTitle || renamingInProgress"
            class="bg-green-500 text-black font-bold px-5 py-2 rounded-full hover:bg-green-400 transition disabled:opacity-50">
            {{ renamingInProgress ? 'Saving...' : 'Save Name' }}
          </button>
          <div *ngIf="renameMsg" [class]="renameSuccess ? 'text-green-400 text-sm bg-green-500/10 border border-green-500 p-3 rounded-lg' : 'text-red-400 text-sm bg-red-500/10 border border-red-500 p-3 rounded-lg'">
            {{ renameMsg }}
          </div>
        </div>
      </section>

      <!-- ── TAB 4: Add Artist ──────────────────────────────────── -->
      <section *ngIf="activeTab === 'add-artist'" class="bg-neutral-900 p-6 rounded-xl">
        <h3 class="text-xl font-bold text-white mb-4">Add New Artist</h3>
        <form (ngSubmit)="submitAddArtist()" class="space-y-4 max-w-lg">
          <div>
            <label class="block text-sm font-medium text-neutral-300 mb-1">Stage Name *</label>
            <input type="text" [(ngModel)]="newArtist.stageName" name="stageName" required
              class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2 focus:outline-none focus:border-white transition">
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-300 mb-1">Real Name</label>
            <input type="text" [(ngModel)]="newArtist.realName" name="realName"
              class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2 focus:outline-none focus:border-white transition">
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-300 mb-1">Bio</label>
            <textarea [(ngModel)]="newArtist.bio" name="bio" rows="3"
              class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2 focus:outline-none focus:border-white transition resize-none"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-300 mb-1">Formation Year</label>
            <input type="number" [(ngModel)]="newArtist.formationYear" name="formationYear" placeholder="e.g. 2010"
              class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2 focus:outline-none focus:border-white transition">
          </div>
          <button type="submit" [disabled]="!newArtist.stageName || addingArtist"
            class="bg-green-500 text-black font-bold px-5 py-2 rounded-full hover:bg-green-400 transition disabled:opacity-50">
            {{ addingArtist ? 'Adding...' : 'Add Artist' }}
          </button>
          <div *ngIf="addArtistMsg" [class]="addArtistSuccess ? 'text-green-400 text-sm bg-green-500/10 border border-green-500 p-3 rounded-lg' : 'text-red-400 text-sm bg-red-500/10 border border-red-500 p-3 rounded-lg'">
            {{ addArtistMsg }}
          </div>
        </form>
      </section>

      <!-- ── TAB 5: Delete Album ────────────────────────────────── -->
      <section *ngIf="activeTab === 'delete-album'" class="bg-neutral-900 p-6 rounded-xl">
        <h3 class="text-xl font-bold text-white mb-2">Remove Album & Songs</h3>
        <p class="text-neutral-400 text-sm mb-4">Deletes the album and all songs that exclusively belong to it.</p>
        <div class="space-y-4 max-w-lg">
          <div>
            <label class="block text-sm font-medium text-neutral-300 mb-1">Select Album</label>
            <select [(ngModel)]="selectedAlbumId"
              class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2 focus:outline-none focus:border-white">
              <option value="">-- Pick an album --</option>
              <option *ngFor="let al of allAlbums" [value]="al.id">
                {{ al.title }} — {{ al.artists?.stage_name }} ({{ al.release_year }})
              </option>
            </select>
          </div>
          <div *ngIf="selectedAlbumId && !deleteMsg" class="bg-yellow-500/10 border border-yellow-500 text-yellow-400 p-3 rounded-lg text-sm">
            ⚠️ This action cannot be undone.
          </div>
          <button (click)="deleteAlbum()" [disabled]="!selectedAlbumId || deletingAlbum"
            class="bg-red-600 text-white font-bold px-5 py-2 rounded-full hover:bg-red-500 transition disabled:opacity-50">
            {{ deletingAlbum ? 'Deleting...' : 'Delete Album' }}
          </button>
          <div *ngIf="deleteMsg" [class]="deleteSuccess ? 'text-green-400 text-sm bg-green-500/10 border border-green-500 p-3 rounded-lg' : 'text-red-400 text-sm bg-red-500/10 border border-red-500 p-3 rounded-lg'">
            {{ deleteMsg }}
          </div>
        </div>
      </section>
    </div>
  `
})
export class AdminComponent implements OnInit {
  activeTab: Tab = 'songs-by-artist';
  tabs = [
    { key: 'songs-by-artist' as Tab, label: '🎵 Songs by Artist' },
    { key: 'user-playlists' as Tab, label: '📋 User Playlists' },
    { key: 'rename-song' as Tab, label: '✏️ Rename Song' },
    { key: 'add-artist' as Tab, label: '➕ Add Artist' },
    { key: 'delete-album' as Tab, label: '🗑️ Delete Album' },
  ];

  artists: any[] = [];
  allUsers: any[] = [];
  allSongs: any[] = [];
  allAlbums: any[] = [];

  selectedArtistId: any = '';
  artistAlbums: any[] = [];
  loadingArtistSongs = false;

  selectedUserId: any = '';
  userPlaylists: any[] = [];
  loadingUserPlaylists = false;

  selectedSongId: any = '';
  newSongTitle = '';
  renamingInProgress = false;
  renameMsg = '';
  renameSuccess = false;

  newArtist = { stageName: '', realName: '', bio: '', formationYear: undefined as number | undefined };
  addingArtist = false;
  addArtistMsg = '';
  addArtistSuccess = false;

  selectedAlbumId: any = '';
  deletingAlbum = false;
  deleteMsg = '';
  deleteSuccess = false;

  constructor(private supabase: SupabaseService, private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    try {
      const [artists, albums, songs, users] = await Promise.all([
        this.supabase.getAllArtists(),
        this.supabase.getAllAlbums(),
        this.supabase.getAllSongs(),
        this.supabase.getAllUsers(),
      ]);
      this.artists = artists;
      this.allAlbums = albums;
      this.allSongs = songs;
      this.allUsers = users;
    } catch (e) {
      console.error(e);
    }
    this.cdr.detectChanges();
  }

  async loadSongsByArtist() {
    this.loadingArtistSongs = true;
    this.artistAlbums = [];
    try {
      this.artistAlbums = await this.supabase.getSongsByArtist(parseInt(this.selectedArtistId));
    } catch (e) { console.error(e); }
    this.loadingArtistSongs = false;
    this.cdr.detectChanges();
  }

  async loadUserPlaylists() {
    this.loadingUserPlaylists = true;
    this.userPlaylists = [];
    try {
      this.userPlaylists = await this.supabase.getUserPlaylists(parseInt(this.selectedUserId));
    } catch (e) { console.error(e); }
    this.loadingUserPlaylists = false;
    this.cdr.detectChanges();
  }

  async renameSong() {
    this.renamingInProgress = true;
    this.renameMsg = '';
    try {
      const result = await this.supabase.updateSongTitle(parseInt(this.selectedSongId), this.newSongTitle);
      this.renameSuccess = true;
      this.renameMsg = `Song renamed to "${result.title}" successfully.`;
      const idx = this.allSongs.findIndex((s: any) => s.id === result.id);
      if (idx >= 0) this.allSongs[idx].title = result.title;
      this.newSongTitle = '';
      this.selectedSongId = '';
    } catch (e: any) {
      this.renameSuccess = false;
      this.renameMsg = e?.message || 'Failed to rename song.';
    }
    this.renamingInProgress = false;
    this.cdr.detectChanges();
  }

  async submitAddArtist() {
    this.addingArtist = true;
    this.addArtistMsg = '';
    try {
      const result = await this.supabase.addArtist(this.newArtist);
      this.addArtistSuccess = true;
      this.addArtistMsg = `Artist "${result.stage_name}" added successfully!`;
      this.artists = await this.supabase.getAllArtists();
      this.newArtist = { stageName: '', realName: '', bio: '', formationYear: undefined };
    } catch (e: any) {
      this.addArtistSuccess = false;
      this.addArtistMsg = e?.message || 'Failed to add artist.';
    }
    this.addingArtist = false;
    this.cdr.detectChanges();
  }

  async deleteAlbum() {
    this.deletingAlbum = true;
    this.deleteMsg = '';
    try {
      await this.supabase.deleteAlbumAndSongs(parseInt(this.selectedAlbumId));
      this.deleteSuccess = true;
      this.deleteMsg = 'Album and its exclusive songs deleted successfully.';
      this.allAlbums = await this.supabase.getAllAlbums();
      this.selectedAlbumId = '';
    } catch (e: any) {
      this.deleteSuccess = false;
      this.deleteMsg = e?.message || 'Failed to delete album.';
    }
    this.deletingAlbum = false;
    this.cdr.detectChanges();
  }

  fmtDur(s: number): string {
    if (!s) return '--:--';
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  }
}
