import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="pb-28">

      <!-- Loading -->
      <div *ngIf="loading" class="flex items-center justify-center mt-20">
        <div class="flex flex-col items-center gap-3">
          <div class="h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          <p class="text-neutral-400 text-sm">Loading profile...</p>
        </div>
      </div>

      <!-- Not Found -->
      <div *ngIf="!loading && !profileUser" class="text-center mt-20">
        <p class="text-neutral-400 text-lg mb-3">User not found.</p>
        <a routerLink="/dashboard" class="text-blue-400 hover:underline text-sm">← Back to Home</a>
      </div>

      <!-- Profile Content -->
      <div *ngIf="!loading && profileUser">

        <!-- Header -->
        <div class="flex items-end gap-6 mb-8 mt-2 bg-gradient-to-b from-indigo-900/50 to-transparent p-8 rounded-xl">
          <!-- Avatar -->
          <div class="h-32 w-32 rounded-full flex-shrink-0 flex items-center justify-center shadow-2xl text-5xl font-black text-white"
            [ngStyle]="{'background': avatarGradient}">
            {{ (profileUser.first_name || profileUser.username || '?').charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Profile</p>
            <h1 class="text-4xl font-black text-white mb-1 truncate">
              {{ profileUser.first_name ? profileUser.first_name + ' ' + profileUser.last_name : profileUser.username }}
            </h1>
            <p class="text-neutral-400 text-sm">&#64;{{ profileUser.username }}</p>
            <p *ngIf="profileUser.registration_date" class="text-neutral-500 text-xs mt-0.5">
              Member since {{ formatDate(profileUser.registration_date) }}
            </p>
            <!-- Own profile badge -->
            <span *ngIf="isOwnProfile"
              class="inline-block mt-2 bg-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/30">
              ✓ This is you
            </span>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-4 mb-8 max-w-xs">
          <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center">
            <p class="text-2xl font-bold text-white">{{ playlists.length }}</p>
            <p class="text-neutral-400 text-xs uppercase tracking-wider mt-1">Public Playlists</p>
          </div>
          <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center">
            <p class="text-2xl font-bold text-white">{{ totalSongs }}</p>
            <p class="text-neutral-400 text-xs uppercase tracking-wider mt-1">Total Songs</p>
          </div>
        </div>

        <!-- Playlists -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-bold text-white">Public Playlists</h2>
          </div>

          <div *ngIf="playlists.length === 0" class="text-neutral-500 italic text-sm mt-2">
            This user has no public playlists yet.
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <a *ngFor="let pl of playlists" [routerLink]="['/playlist', pl.id]"
              class="bg-neutral-800 hover:bg-neutral-700 p-4 rounded-lg transition-colors cursor-pointer group no-underline">
              <!-- Playlist Art -->
              <div class="aspect-square rounded-md mb-3 bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center shadow-lg relative overflow-hidden">
                <svg viewBox="0 0 24 24" class="h-10 w-10 fill-white opacity-40">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
                <!-- Play hover overlay -->
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div class="bg-blue-500 rounded-full h-10 w-10 flex items-center justify-center shadow-lg">
                    <svg viewBox="0 0 16 16" class="h-4 w-4 fill-black ml-0.5">
                      <path d="M3 1.713a.7.7 0 011.05-.607l10.89 6.288a.7.7 0 010 1.212L4.05 14.894A.7.7 0 013 14.288V1.713z"/>
                    </svg>
                  </div>
                </div>
              </div>
              <h3 class="text-white font-semibold text-sm truncate group-hover:text-blue-400 transition">{{ pl.name }}</h3>
              <p class="text-neutral-400 text-xs mt-0.5">{{ pl.playlist_songs?.[0]?.count ?? 0 }} songs</p>
              <p *ngIf="pl.description" class="text-neutral-500 text-xs mt-0.5 truncate">{{ pl.description }}</p>
            </a>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: `
    @keyframes spin { to { transform: rotate(360deg); } }
    .animate-spin { animation: spin 1s linear infinite; }
  `
})
export class UserProfileComponent implements OnInit {
  profileUser: any = null;
  playlists: any[] = [];
  loading = true;
  isOwnProfile = false;
  avatarGradient = 'linear-gradient(135deg, #4f46e5, #7c3aed)';

  get totalSongs() {
    return this.playlists.reduce((acc, pl) => acc + (pl.playlist_songs?.[0]?.count || 0), 0);
  }

  constructor(
    private supabase: SupabaseService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    const id = parseInt(this.route.snapshot.paramMap.get('id') || '0');
    if (!id) { this.loading = false; return; }

    const gradients = [
      'linear-gradient(135deg, #4f46e5, #7c3aed)',
      'linear-gradient(135deg, #059669, #0d9488)',
      'linear-gradient(135deg, #dc2626, #9333ea)',
      'linear-gradient(135deg, #d97706, #ea580c)',
      'linear-gradient(135deg, #0891b2, #2563eb)',
    ];
    this.avatarGradient = gradients[id % gradients.length];

    const currentUser = this.authService.getCurrentUser();
    this.isOwnProfile = currentUser?.id === id;

    try {
      const [user, playlists] = await Promise.all([
        this.supabase.getUserById(id),
        this.supabase.getPublicPlaylists(id),
      ]);
      this.profileUser = user;
      this.playlists = playlists;
    } catch (e) {
      console.error('User profile load error:', e);
    }
    this.loading = false;
    this.cdr.detectChanges();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  }
}
