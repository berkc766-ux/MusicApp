import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-artist-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pb-16">

      <!-- ── Artist Selector (Manager Mode) ── -->
      <div class="mb-6">
        <div *ngIf="artistProfiles.length > 1" class="flex items-center gap-3 mb-4">
          <svg viewBox="0 0 24 24" class="h-5 w-5 fill-green-400 flex-shrink-0">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
          </svg>
          <p class="text-green-400 text-sm font-semibold">Manager Mode — {{ artistProfiles.length }} artist profiles</p>
        </div>

        <div *ngIf="artistProfiles.length > 1" class="flex items-center gap-3 mb-5">
          <label class="text-neutral-400 text-sm flex-shrink-0">Manage:</label>
          <select [(ngModel)]="activeArtistIndex" (ngModelChange)="switchArtist($event)"
            class="bg-neutral-800 border border-neutral-700 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:border-green-400 transition flex-1 max-w-xs">
            <option *ngFor="let ap of artistProfiles; let i = index" [ngValue]="i">
              {{ ap.stage_name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Artist Profile Header -->
      <div class="flex items-end gap-6 mb-8 mt-2 bg-gradient-to-b from-green-900/40 to-transparent p-6 rounded-xl">
        <div class="h-36 w-36 bg-gradient-to-br from-green-700 to-teal-900 rounded-full flex items-center justify-center flex-shrink-0 shadow-2xl">
          <svg viewBox="0 0 24 24" class="h-16 w-16 fill-white opacity-60"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs text-green-400 font-semibold uppercase tracking-widest mb-1">🎤 Artist</p>
          <h1 class="text-4xl font-bold text-white mb-1">{{ artist?.stage_name || user?.username }}</h1>
          <p class="text-neutral-400 text-sm">{{ artist?.real_name || (user?.first_name + ' ' + user?.last_name) }}</p>
          <p *ngIf="artist?.bio" class="text-neutral-500 text-xs mt-1 max-w-md">{{ artist.bio }}</p>

          <!-- No artist profile linked yet → show setup form -->
          <div *ngIf="!artist && !loading" class="mt-3 bg-yellow-500/10 border border-yellow-500/40 rounded-xl p-4 max-w-md">
            <p class="text-yellow-400 font-semibold text-sm mb-1">⚠️ Artist profile not linked</p>
            <p class="text-yellow-300/70 text-xs mb-3">
              Your account is registered as an artist but no artist profile is connected.<br>
              Create your profile below, or run the SQL migration first.
            </p>
            <div *ngIf="!showProfileSetup">
              <button (click)="showProfileSetup = true"
                class="bg-yellow-500 text-black text-sm font-bold px-4 py-2 rounded-full hover:bg-yellow-400 transition">
                + Create Artist Profile
              </button>
            </div>
            <div *ngIf="showProfileSetup" class="space-y-2">
              <input type="text" [(ngModel)]="profileStageName" placeholder="Stage name *"
                class="w-full bg-neutral-800 border border-yellow-600 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-yellow-400">
              <input type="text" [(ngModel)]="profileRealName" placeholder="Real name (optional)"
                class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-white">
              <textarea [(ngModel)]="profileBio" placeholder="Bio (optional)" rows="2"
                class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-white resize-none"></textarea>
              <div class="flex gap-2">
                <button (click)="createArtistProfile()" [disabled]="!profileStageName || savingProfile"
                  class="bg-yellow-500 text-black text-sm font-bold px-4 py-2 rounded-full hover:bg-yellow-400 transition disabled:opacity-50">
                  {{ savingProfile ? 'Saving...' : 'Save Profile' }}
                </button>
                <button (click)="showProfileSetup = false" class="text-neutral-400 hover:text-white text-sm px-3 py-2 transition">Cancel</button>
              </div>
              <p *ngIf="profileMsg" class="text-xs" [class]="profileSuccess ? 'text-green-400' : 'text-red-400'">{{ profileMsg }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Add Another Artist Profile (Manager mode) ── -->
      <div *ngIf="artist" class="mb-6">
        <button (click)="showAddProfile = !showAddProfile"
          class="flex items-center gap-2 text-neutral-400 hover:text-white text-sm transition">
          <svg viewBox="0 0 24 24" class="h-4 w-4 fill-current"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          Add another artist profile to manage
        </button>
        <div *ngIf="showAddProfile" class="mt-3 bg-neutral-900 border border-neutral-700 rounded-xl p-4 max-w-md space-y-2">
          <p class="text-white font-semibold text-sm mb-2">New Artist Profile</p>
          <input type="text" [(ngModel)]="newProfileStageName" placeholder="Stage name *"
            class="w-full bg-neutral-800 border border-green-700/50 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400">
          <input type="text" [(ngModel)]="newProfileRealName" placeholder="Real name (optional)"
            class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-white">
          <textarea [(ngModel)]="newProfileBio" placeholder="Bio (optional)" rows="2"
            class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-white resize-none"></textarea>
          <div class="flex gap-2 pt-1">
            <button (click)="addArtistProfile()" [disabled]="!newProfileStageName || addingProfile"
              class="bg-green-500 text-black text-sm font-bold px-4 py-2 rounded-full hover:bg-green-400 transition disabled:opacity-50">
              {{ addingProfile ? 'Adding...' : '+ Add Profile' }}
            </button>
            <button (click)="showAddProfile = false" class="text-neutral-400 hover:text-white text-sm px-3 py-2 transition">Cancel</button>
          </div>
          <p *ngIf="addProfileMsg" class="text-xs" [class]="addProfileSuccess ? 'text-green-400' : 'text-red-400'">{{ addProfileMsg }}</p>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-3 gap-4 mb-8">
        <div class="bg-neutral-900 p-4 rounded-xl border border-neutral-800 text-center">
          <p class="text-3xl font-bold text-white">{{ albums.length }}</p>
          <p class="text-neutral-400 text-sm mt-1">Albums</p>
        </div>
        <div class="bg-neutral-900 p-4 rounded-xl border border-neutral-800 text-center">
          <p class="text-3xl font-bold text-white">{{ totalSongs }}</p>
          <p class="text-neutral-400 text-sm mt-1">Songs</p>
        </div>
        <div class="bg-neutral-900 p-4 rounded-xl border border-neutral-800 text-center">
          <p class="text-3xl font-bold text-green-400">∞</p>
          <p class="text-neutral-400 text-sm mt-1">Listeners</p>
        </div>
      </div>

      <div class="flex gap-6 flex-col lg:flex-row">
        <!-- Albums Panel -->
        <div class="flex-1">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-white">Your Albums</h2>
            <button (click)="showCreateAlbum = !showCreateAlbum" *ngIf="artist"
              class="bg-green-500 text-black text-sm font-bold px-4 py-1.5 rounded-full hover:bg-green-400 transition flex items-center gap-1">
              <span>+</span> New Album
            </button>
          </div>

          <!-- Create Album Form -->
          <div *ngIf="showCreateAlbum" class="bg-neutral-900 border border-neutral-700 rounded-xl p-5 mb-5">
            <h3 class="text-white font-semibold mb-3">Create New Album</h3>
            <div class="space-y-3">
              <input type="text" [(ngModel)]="newAlbum.title" placeholder="Album title *"
                class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-white">
              <div class="flex gap-2">
                <input type="number" [(ngModel)]="newAlbum.release_year" placeholder="Year *"
                  class="flex-1 bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-white">
                <select [(ngModel)]="newAlbum.type"
                  class="flex-1 bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-white">
                  <option value="album">Album</option>
                  <option value="single">Single</option>
                  <option value="EP">EP</option>
                </select>
              </div>
              <input type="text" [(ngModel)]="newAlbum.record_label" placeholder="Record label (optional)"
                class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-white">
              <div class="flex gap-2">
                <button (click)="createAlbum()" [disabled]="!newAlbum.title || !newAlbum.release_year || creatingAlbum"
                  class="bg-green-500 text-black font-bold px-4 py-2 rounded-full text-sm hover:bg-green-400 transition disabled:opacity-50">
                  {{ creatingAlbum ? 'Creating...' : 'Create Album' }}
                </button>
                <button (click)="showCreateAlbum = false"
                  class="text-neutral-400 hover:text-white text-sm px-4 py-2 transition">Cancel</button>
              </div>
              <p *ngIf="albumMsg" class="text-sm" [class]="albumSuccess ? 'text-green-400' : 'text-red-400'">{{ albumMsg }}</p>
            </div>
          </div>

          <div *ngIf="loading" class="text-neutral-400 text-sm italic">Loading albums...</div>

          <!-- Albums List -->
          <div *ngFor="let album of albums" class="bg-neutral-900 border border-neutral-800 rounded-xl p-4 mb-4 hover:border-neutral-700 transition">
            <div class="flex items-center justify-between mb-2">
              <div>
                <h3 class="text-white font-bold">{{ album.title }}</h3>
                <p class="text-neutral-500 text-xs">{{ album.release_year }} · {{ album.type || 'Album' }}</p>
              </div>
              <button (click)="openAddSong(album)"
                class="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full transition">
                + Add Song
              </button>
            </div>
            <div class="mt-2 space-y-1">
              <div *ngFor="let link of album.album_songs; let i = index"
                class="flex items-center justify-between py-1.5 px-2 hover:bg-white/5 rounded-md group">
                <span class="text-neutral-300 text-sm">
                  <span class="text-neutral-600 mr-2 text-xs">{{ i + 1 }}</span>
                  {{ link.songs?.title }}
                </span>
                <div class="flex items-center gap-3">
                  <span class="text-neutral-500 text-xs">{{ fmtDur(link.songs?.duration_sec) }}</span>
                  <button (click)="removeSong(album, link.songs?.id)"
                    class="text-red-500 opacity-0 group-hover:opacity-100 text-xs hover:text-red-400 transition">✕</button>
                </div>
              </div>
              <p *ngIf="!album.album_songs?.length" class="text-neutral-600 text-xs italic px-2 py-1">No songs yet.</p>
            </div>
          </div>
          <p *ngIf="!loading && albums.length === 0 && artist" class="text-neutral-500 italic text-sm">No albums yet. Create your first!</p>
        </div>

        <!-- Add Song Panel (right side) -->
        <div *ngIf="activeAlbum" class="w-80 flex-shrink-0">
          <div class="bg-neutral-900 border border-green-700 rounded-xl p-5 sticky top-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-white font-bold text-sm">Add Song to<br><span class="text-green-400">{{ activeAlbum.title }}</span></h3>
              <button (click)="activeAlbum = null" class="text-neutral-500 hover:text-white transition text-lg">×</button>
            </div>
            <div class="space-y-3">
              <input type="text" [(ngModel)]="newSong.title" placeholder="Song title *"
                class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400">
              <input type="number" [(ngModel)]="newSong.duration_sec" placeholder="Duration (seconds)"
                class="w-full bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400">
              <div class="flex gap-2">
                <select [(ngModel)]="newSong.category_id"
                  class="flex-1 bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400">
                  <option [ngValue]="undefined">Category...</option>
                  <option *ngFor="let cat of categories" [ngValue]="cat.id">{{ cat.name }}</option>
                </select>
                <select [(ngModel)]="newSong.language_id"
                  class="flex-1 bg-neutral-800 border border-neutral-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400">
                  <option [ngValue]="undefined">Language...</option>
                  <option *ngFor="let lang of languages" [ngValue]="lang.id">{{ lang.name }}</option>
                </select>
              </div>
              <label class="flex items-center gap-2 text-sm text-neutral-400 cursor-pointer">
                <input type="checkbox" [(ngModel)]="newSong.is_explicit" class="accent-green-500">
                Explicit content
              </label>
              <button (click)="addSongToAlbum()" [disabled]="!newSong.title || addingSong"
                class="w-full bg-green-500 text-black font-bold py-2 rounded-full text-sm hover:bg-green-400 transition disabled:opacity-50">
                {{ addingSong ? 'Publishing...' : '🎵 Publish Song' }}
              </button>
              <p *ngIf="songMsg" class="text-sm" [class]="songSuccess ? 'text-green-400' : 'text-red-400'">{{ songMsg }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ArtistDashboardComponent implements OnInit {
  user: any = null;
  artist: any = null;
  artistProfiles: any[] = [];
  activeArtistIndex = 0;
  albums: any[] = [];
  loading = true;
  categories: any[] = [];
  languages: any[] = [];

  showCreateAlbum = false;
  newAlbum = { title: '', release_year: new Date().getFullYear(), type: 'album', record_label: '' };
  creatingAlbum = false;
  albumMsg = '';
  albumSuccess = false;

  activeAlbum: any = null;
  newSong = { title: '', duration_sec: undefined as number | undefined, is_explicit: false, category_id: undefined as number | undefined, language_id: undefined as number | undefined };
  addingSong = false;
  songMsg = '';
  songSuccess = false;

  // First profile setup
  showProfileSetup = false;
  profileStageName = '';
  profileRealName = '';
  profileBio = '';
  savingProfile = false;
  profileMsg = '';
  profileSuccess = false;

  // Add new artist profile (manager mode)
  showAddProfile = false;
  newProfileStageName = '';
  newProfileRealName = '';
  newProfileBio = '';
  addingProfile = false;
  addProfileMsg = '';
  addProfileSuccess = false;

  get totalSongs() {
    return this.albums.reduce((acc, al) => acc + (al.album_songs?.length || 0), 0);
  }

  constructor(
    private supabase: SupabaseService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      try {
        const [artistProfiles, categories, languages] = await Promise.all([
          this.supabase.getArtistsByUserId(this.user.id),
          this.supabase.getCategories(),
          this.supabase.getLanguages(),
        ]);
        this.artistProfiles = artistProfiles;
        this.categories = categories;
        this.languages = languages;
        if (this.artistProfiles.length > 0) {
          this.artist = this.artistProfiles[0];
          this.albums = await this.supabase.getAlbumsByArtist(this.artist.id);
        }
      } catch (e) { console.error('ngOnInit error:', e); }
    }
    this.loading = false;
    this.cdr.detectChanges();
  }

  async switchArtist(index: number) {
    this.loading = true;
    this.albums = [];
    this.activeAlbum = null;
    this.cdr.detectChanges();
    this.artist = this.artistProfiles[index];
    try {
      this.albums = await this.supabase.getAlbumsByArtist(this.artist.id);
    } catch (e) { console.error(e); }
    this.loading = false;
    this.cdr.detectChanges();
  }

  async createArtistProfile() {
    if (!this.user || !this.profileStageName) return;
    this.savingProfile = true; this.profileMsg = '';
    try {
      const newArtist = await this.supabase.registerArtist(
        this.user.id, this.profileStageName,
        this.profileRealName || `${this.user.first_name} ${this.user.last_name}`,
        this.profileBio
      );
      this.artistProfiles = await this.supabase.getArtistsByUserId(this.user.id);
      this.artist = newArtist;
      this.profileSuccess = true;
      this.profileMsg = 'Artist profile created successfully!';
      this.showProfileSetup = false;
      this.albums = await this.supabase.getAlbumsByArtist(this.artist.id);
    } catch (e: any) {
      this.profileSuccess = false;
      this.profileMsg = e?.message || 'Failed to create profile. Make sure the SQL migration has been run.';
    }
    this.savingProfile = false;
    this.cdr.detectChanges();
  }

  async addArtistProfile() {
    if (!this.user || !this.newProfileStageName) return;
    this.addingProfile = true; this.addProfileMsg = '';
    try {
      await this.supabase.registerArtist(
        this.user.id, this.newProfileStageName,
        this.newProfileRealName || '', this.newProfileBio
      );
      this.artistProfiles = await this.supabase.getArtistsByUserId(this.user.id);
      this.addProfileSuccess = true;
      this.addProfileMsg = `"${this.newProfileStageName}" artist profile added!`;
      this.newProfileStageName = ''; this.newProfileRealName = ''; this.newProfileBio = '';
      this.showAddProfile = false;
    } catch (e: any) {
      this.addProfileSuccess = false;
      this.addProfileMsg = e?.message || 'Failed to add artist profile.';
    }
    this.addingProfile = false;
    this.cdr.detectChanges();
  }

  async createAlbum() {
    if (!this.artist) return;
    this.creatingAlbum = true; this.albumMsg = '';
    try {
      await this.supabase.createAlbum(this.artist.id, this.newAlbum);
      this.albumSuccess = true;
      this.albumMsg = 'Album created!';
      this.albums = await this.supabase.getAlbumsByArtist(this.artist.id);
      this.newAlbum = { title: '', release_year: new Date().getFullYear(), type: 'album', record_label: '' };
      this.showCreateAlbum = false;
    } catch (e: any) {
      this.albumSuccess = false;
      this.albumMsg = e?.message || 'Failed to create album.';
    }
    this.creatingAlbum = false;
    this.cdr.detectChanges();
  }

  openAddSong(album: any) {
    this.activeAlbum = album;
    this.newSong = { title: '', duration_sec: undefined, is_explicit: false, category_id: undefined, language_id: undefined };
    this.songMsg = '';
  }

  async addSongToAlbum() {
    if (!this.activeAlbum) return;
    this.addingSong = true; this.songMsg = '';
    try {
      await this.supabase.createSong(this.activeAlbum.id, this.newSong);
      this.songSuccess = true;
      this.songMsg = `"${this.newSong.title}" published!`;
      this.albums = await this.supabase.getAlbumsByArtist(this.artist.id);
      this.newSong = { title: '', duration_sec: undefined, is_explicit: false, category_id: undefined, language_id: undefined };
    } catch (e: any) {
      this.songSuccess = false;
      this.songMsg = e?.message || 'Failed to publish song.';
    }
    this.addingSong = false;
    this.cdr.detectChanges();
  }

  async removeSong(album: any, songId: number) {
    try {
      await this.supabase.removeSongFromAlbum(album.id, songId);
      this.albums = await this.supabase.getAlbumsByArtist(this.artist.id);
      this.cdr.detectChanges();
    } catch (e) { console.error(e); }
  }

  fmtDur(s: number): string {
    if (!s) return '--:--';
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  }
}
