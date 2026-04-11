import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase';

type Tab = 'songs-by-artist' | 'user-playlists' | 'rename-song' | 'add-artist' | 'delete-artist' | 'delete-album' | 'categories' | 'languages';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pb-16">
      <h2 class="text-3xl font-bold text-white mb-2">Admin Panel</h2>
      <p class="text-neutral-400 text-sm mb-6">Manage artists, songs, albums, users and more.</p>

      <!-- Tabs -->
      <div class="flex gap-2 mb-8 flex-wrap">
        <button *ngFor="let tab of tabs" (click)="activeTab = tab.key"
          [class]="activeTab === tab.key
            ? 'bg-white text-black font-bold px-4 py-2 rounded-full text-sm transition'
            : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 px-4 py-2 rounded-full text-sm transition'">
          {{ tab.label }}
        </button>
      </div>

      <!-- ── TAB 1: Songs by Artist ── -->
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

      <!-- ── TAB 2: User Playlists ── -->
      <section *ngIf="activeTab === 'user-playlists'" class="bg-neutral-900 p-6 rounded-xl">
        <h3 class="text-xl font-bold text-white mb-4">User Playlists &amp; Song Count</h3>
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

      <!-- ── TAB 3: Rename Song ── -->
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

      <!-- ── TAB 4: Add Artist (Full Account) ── -->
      <section *ngIf="activeTab === 'add-artist'" class="bg-neutral-900 p-6 rounded-xl">
        <h3 class="text-xl font-bold text-white mb-1">Create Artist Account</h3>
        <p class="text-neutral-400 text-sm mb-5">Creates a full user account (role: artist) linked to an artist profile.</p>

        <form (ngSubmit)="submitAddArtist()" class="space-y-4 max-w-lg">
          <!-- User Info -->
          <div class="border border-neutral-700 rounded-xl p-4 space-y-3">
            <p class="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Account Details</p>
            <div class="flex gap-2">
              <div class="flex-1">
                <label class="block text-xs font-medium text-neutral-400 mb-1">First Name *</label>
                <input type="text" [(ngModel)]="newArtist.firstName" name="firstName" required
                  class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-white transition">
              </div>
              <div class="flex-1">
                <label class="block text-xs font-medium text-neutral-400 mb-1">Last Name</label>
                <input type="text" [(ngModel)]="newArtist.lastName" name="lastName"
                  class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-white transition">
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-neutral-400 mb-1">Username *</label>
              <input type="text" [(ngModel)]="newArtist.username" name="username" required
                class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-white transition">
            </div>
            <div>
              <label class="block text-xs font-medium text-neutral-400 mb-1">Email *</label>
              <input type="email" [(ngModel)]="newArtist.email" name="email" required
                class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-white transition">
            </div>
            <div>
              <label class="block text-xs font-medium text-neutral-400 mb-1">Password *</label>
              <input type="password" [(ngModel)]="newArtist.password" name="password" required minlength="6"
                class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-white transition">
            </div>
          </div>

          <!-- Artist Info -->
          <div class="border border-green-800/50 rounded-xl p-4 space-y-3">
            <p class="text-xs font-bold text-green-500/80 uppercase tracking-wider mb-1">Artist Profile</p>
            <div>
              <label class="block text-xs font-medium text-neutral-400 mb-1">Stage Name *</label>
              <input type="text" [(ngModel)]="newArtist.stageName" name="stageName" required
                placeholder="e.g. The Weeknd"
                class="w-full bg-neutral-800 border border-green-700/50 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400 transition">
            </div>
            <div>
              <label class="block text-xs font-medium text-neutral-400 mb-1">Real Name</label>
              <input type="text" [(ngModel)]="newArtist.realName" name="realName"
                class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-white transition">
            </div>
            <div>
              <label class="block text-xs font-medium text-neutral-400 mb-1">Bio</label>
              <textarea [(ngModel)]="newArtist.bio" name="bio" rows="2"
                class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-white transition resize-none"></textarea>
            </div>
            <div>
              <label class="block text-xs font-medium text-neutral-400 mb-1">Formation Year</label>
              <input type="number" [(ngModel)]="newArtist.formationYear" name="formationYear" placeholder="e.g. 2010"
                class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-white transition">
            </div>
          </div>

          <button type="submit" [disabled]="!newArtist.stageName || !newArtist.username || !newArtist.email || !newArtist.password || !newArtist.firstName || addingArtist"
            class="bg-green-500 text-black font-bold px-5 py-2 rounded-full hover:bg-green-400 transition disabled:opacity-50">
            {{ addingArtist ? 'Creating...' : '🎤 Create Artist Account' }}
          </button>
          <div *ngIf="addArtistMsg" [class]="addArtistSuccess ? 'text-green-400 text-sm bg-green-500/10 border border-green-500 p-3 rounded-lg' : 'text-red-400 text-sm bg-red-500/10 border border-red-500 p-3 rounded-lg'">
            {{ addArtistMsg }}
          </div>
        </form>
      </section>

      <!-- ── TAB 5: Delete Artist ── -->
      <section *ngIf="activeTab === 'delete-artist'" class="bg-neutral-900 p-6 rounded-xl">
        <h3 class="text-xl font-bold text-white mb-1">Delete Artist</h3>
        <p class="text-neutral-400 text-sm mb-5">Deletes the artist profile along with all their albums and songs.</p>
        <div class="space-y-4 max-w-lg">
          <div>
            <label class="block text-sm font-medium text-neutral-300 mb-1">Select Artist</label>
            <select [(ngModel)]="selectedDeleteArtistId"
              class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2 focus:outline-none focus:border-white">
              <option value="">-- Pick an artist --</option>
              <option *ngFor="let a of artists" [value]="a.id">{{ a.stage_name }}</option>
            </select>
          </div>
          <div *ngIf="selectedDeleteArtistId && !deleteArtistMsg" class="bg-red-500/10 border border-red-500/40 text-red-400 p-3 rounded-lg text-sm">
            ⚠️ This will permanently delete the artist and all their music. This cannot be undone.
          </div>
          <button (click)="deleteArtist()" [disabled]="!selectedDeleteArtistId || deletingArtist"
            class="bg-red-600 text-white font-bold px-5 py-2 rounded-full hover:bg-red-500 transition disabled:opacity-50">
            {{ deletingArtist ? 'Deleting...' : 'Delete Artist' }}
          </button>
          <div *ngIf="deleteArtistMsg" [class]="deleteArtistSuccess ? 'text-green-400 text-sm bg-green-500/10 border border-green-500 p-3 rounded-lg' : 'text-red-400 text-sm bg-red-500/10 border border-red-500 p-3 rounded-lg'">
            {{ deleteArtistMsg }}
          </div>
        </div>
      </section>

      <!-- ── TAB 6: Delete Album ── -->
      <section *ngIf="activeTab === 'delete-album'" class="bg-neutral-900 p-6 rounded-xl">
        <h3 class="text-xl font-bold text-white mb-2">Remove Album &amp; Songs</h3>
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

      <!-- ── TAB 7: Categories ── -->
      <section *ngIf="activeTab === 'categories'" class="bg-neutral-900 p-6 rounded-xl">
        <h3 class="text-xl font-bold text-white mb-5">🏷️ Manage Categories</h3>
        <div class="flex gap-2 mb-5 max-w-lg">
          <input type="text" [(ngModel)]="newCategoryName" placeholder="Category name *"
            class="flex-1 bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-white">
          <input type="text" [(ngModel)]="newCategoryDesc" placeholder="Description (opt.)"
            class="flex-1 bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-white">
          <button (click)="addCategory()" [disabled]="!newCategoryName || addingCategory"
            class="bg-green-500 text-black font-bold px-4 py-2 rounded-md hover:bg-green-400 transition disabled:opacity-50 text-sm flex-shrink-0">
            {{ addingCategory ? '...' : '+ Add' }}
          </button>
        </div>
        <div *ngIf="categoryMsg" class="mb-4 text-sm" [class]="categorySuccess ? 'text-green-400' : 'text-red-400'">{{ categoryMsg }}</div>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
          <div *ngFor="let cat of categories"
            class="flex items-center justify-between bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 group hover:border-neutral-600 transition">
            <div>
              <p class="text-white text-sm font-medium">{{ cat.name }}</p>
              <p *ngIf="cat.description" class="text-neutral-500 text-xs">{{ cat.description }}</p>
            </div>
            <button (click)="deleteCategory(cat.id)"
              class="text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition text-base ml-2">✕</button>
          </div>
        </div>
        <p *ngIf="categories.length === 0" class="text-neutral-500 italic text-sm mt-2">No categories yet.</p>
      </section>

      <!-- ── TAB 8: Languages ── -->
      <section *ngIf="activeTab === 'languages'" class="bg-neutral-900 p-6 rounded-xl">
        <h3 class="text-xl font-bold text-white mb-5">🌐 Manage Languages</h3>
        <div class="flex gap-2 mb-5 max-w-lg">
          <input type="text" [(ngModel)]="newLanguageName" placeholder="Language name *"
            class="flex-1 bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-white">
          <input type="text" [(ngModel)]="newLanguageCode" placeholder="Code (e.g. en)" style="max-width:90px"
            class="bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-white">
          <button (click)="addLanguage()" [disabled]="!newLanguageName || addingLanguage"
            class="bg-green-500 text-black font-bold px-4 py-2 rounded-md hover:bg-green-400 transition disabled:opacity-50 text-sm flex-shrink-0">
            {{ addingLanguage ? '...' : '+ Add' }}
          </button>
        </div>
        <div *ngIf="languageMsg" class="mb-4 text-sm" [class]="languageSuccess ? 'text-green-400' : 'text-red-400'">{{ languageMsg }}</div>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
          <div *ngFor="let lang of languages"
            class="flex items-center justify-between bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 group hover:border-neutral-600 transition">
            <div>
              <p class="text-white text-sm font-medium">{{ lang.name }}</p>
              <p *ngIf="lang.code" class="text-neutral-500 text-xs uppercase tracking-wider">{{ lang.code }}</p>
            </div>
            <button (click)="deleteLanguage(lang.id)"
              class="text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition text-base ml-2">✕</button>
          </div>
        </div>
        <p *ngIf="languages.length === 0" class="text-neutral-500 italic text-sm mt-2">No languages yet.</p>
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
    { key: 'delete-artist' as Tab, label: '🗑️ Delete Artist' },
    { key: 'delete-album' as Tab, label: '📀 Delete Album' },
    { key: 'categories' as Tab, label: '🏷️ Categories' },
    { key: 'languages' as Tab, label: '🌐 Languages' },
  ];

  artists: any[] = [];
  allUsers: any[] = [];
  allSongs: any[] = [];
  allAlbums: any[] = [];
  categories: any[] = [];
  languages: any[] = [];

  newCategoryName = ''; newCategoryDesc = ''; addingCategory = false; categoryMsg = ''; categorySuccess = false;
  newLanguageName = ''; newLanguageCode = ''; addingLanguage = false; languageMsg = ''; languageSuccess = false;

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

  newArtist = {
    firstName: '', lastName: '', username: '', email: '', password: '',
    stageName: '', realName: '', bio: '', formationYear: undefined as number | undefined
  };
  addingArtist = false;
  addArtistMsg = '';
  addArtistSuccess = false;

  selectedDeleteArtistId: any = '';
  deletingArtist = false;
  deleteArtistMsg = '';
  deleteArtistSuccess = false;

  selectedAlbumId: any = '';
  deletingAlbum = false;
  deleteMsg = '';
  deleteSuccess = false;

  constructor(private supabase: SupabaseService, private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    try {
      const [artists, albums, songs, users, categories, languages] = await Promise.all([
        this.supabase.getAllArtists(),
        this.supabase.getAllAlbums(),
        this.supabase.getAllSongs(),
        this.supabase.getAllUsers(),
        this.supabase.getCategories(),
        this.supabase.getLanguages(),
      ]);
      this.artists = artists;
      this.allAlbums = albums;
      this.allSongs = songs;
      this.allUsers = users;
      this.categories = categories;
      this.languages = languages;
    } catch (e) { console.error(e); }
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
      this.newSongTitle = ''; this.selectedSongId = '';
    } catch (e: any) {
      this.renameSuccess = false;
      this.renameMsg = e?.message || 'Failed to rename song.';
    }
    this.renamingInProgress = false;
    this.cdr.detectChanges();
  }

  async submitAddArtist() {
    this.addingArtist = true; this.addArtistMsg = '';
    try {
      const result = await this.supabase.createFullArtist({
        firstName: this.newArtist.firstName,
        lastName: this.newArtist.lastName,
        username: this.newArtist.username,
        email: this.newArtist.email,
        password: this.newArtist.password,
        stageName: this.newArtist.stageName,
        realName: this.newArtist.realName || undefined,
        bio: this.newArtist.bio || undefined,
        formationYear: this.newArtist.formationYear,
      });
      this.addArtistSuccess = true;
      this.addArtistMsg = `Artist "${result.artist.stage_name}" created! User account: ${result.user.email}`;
      this.artists = await this.supabase.getAllArtists();
      this.allUsers = await this.supabase.getAllUsers();
      this.newArtist = { firstName: '', lastName: '', username: '', email: '', password: '', stageName: '', realName: '', bio: '', formationYear: undefined };
    } catch (e: any) {
      this.addArtistSuccess = false;
      this.addArtistMsg = e?.message || 'Failed to create artist account.';
    }
    this.addingArtist = false;
    this.cdr.detectChanges();
  }

  async deleteArtist() {
    this.deletingArtist = true; this.deleteArtistMsg = '';
    try {
      await this.supabase.deleteArtist(parseInt(this.selectedDeleteArtistId));
      this.deleteArtistSuccess = true;
      this.deleteArtistMsg = 'Artist and all their music deleted successfully.';
      this.artists = await this.supabase.getAllArtists();
      this.allAlbums = await this.supabase.getAllAlbums();
      this.selectedDeleteArtistId = '';
    } catch (e: any) {
      this.deleteArtistSuccess = false;
      this.deleteArtistMsg = e?.message || 'Failed to delete artist.';
    }
    this.deletingArtist = false;
    this.cdr.detectChanges();
  }

  async deleteAlbum() {
    this.deletingAlbum = true; this.deleteMsg = '';
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

  async addCategory() {
    this.addingCategory = true; this.categoryMsg = '';
    try {
      await this.supabase.addCategory(this.newCategoryName, this.newCategoryDesc);
      this.categorySuccess = true; this.categoryMsg = `Category "${this.newCategoryName}" added!`;
      this.categories = await this.supabase.getCategories();
      this.newCategoryName = ''; this.newCategoryDesc = '';
    } catch (e: any) { this.categorySuccess = false; this.categoryMsg = e?.message || 'Failed.'; }
    this.addingCategory = false; this.cdr.detectChanges();
  }

  async deleteCategory(id: number) {
    try {
      await this.supabase.deleteCategory(id);
      this.categories = await this.supabase.getCategories();
      this.cdr.detectChanges();
    } catch (e: any) { this.categoryMsg = e?.message || 'Cannot delete (may be in use)'; this.categorySuccess = false; this.cdr.detectChanges(); }
  }

  async addLanguage() {
    this.addingLanguage = true; this.languageMsg = '';
    try {
      await this.supabase.addLanguage(this.newLanguageName, this.newLanguageCode);
      this.languageSuccess = true; this.languageMsg = `Language "${this.newLanguageName}" added!`;
      this.languages = await this.supabase.getLanguages();
      this.newLanguageName = ''; this.newLanguageCode = '';
    } catch (e: any) { this.languageSuccess = false; this.languageMsg = e?.message || 'Failed.'; }
    this.addingLanguage = false; this.cdr.detectChanges();
  }

  async deleteLanguage(id: number) {
    try {
      await this.supabase.deleteLanguage(id);
      this.languages = await this.supabase.getLanguages();
      this.cdr.detectChanges();
    } catch (e: any) { this.languageMsg = e?.message || 'Cannot delete (may be in use)'; this.languageSuccess = false; this.cdr.detectChanges(); }
  }
}
