import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-[calc(100vh-90px)] w-64 bg-black flex flex-col pt-6 pb-2 text-neutral-400">
      <div class="px-6 mb-6">
        <h1 class="text-white text-2xl font-bold flex items-center gap-2">
          <svg viewBox="0 0 24 24" class="h-8 w-8 text-white fill-current"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.35-1.434-5.305-1.76-8.784-.963-.335.077-.67-.133-.746-.467-.077-.334.132-.67.466-.745 3.808-.87 7.076-.497 9.714 1.115.293.18.386.563.207.853zm1.186-2.613c-.226.37-.706.486-1.074.26-2.686-1.652-6.784-2.13-9.97-1.166-.412.125-.845-.108-.97-.52-.125-.41.108-.844.52-.97 3.65-1.108 8.163-.563 11.233 1.33.37.225.485.704.26 1.066zm.106-2.736C14.65 9.145 8.5 8.92 4.957 9.996c-.495.148-1.02-.13-1.17-.624-.148-.495.13-1.02.625-1.17 4.05-1.23 10.85-1.002 14.693 1.277.443.264.587.842.324 1.284-.265.443-.843.588-1.285.324z"></path></svg>
          Spotify
        </h1>
      </div>
      
      <div class="px-3 mb-6">
        <ul class="space-y-1 font-semibold">
          <li>
            <a href="/dashboard" class="flex items-center gap-4 px-3 py-2 bg-neutral-800 text-white rounded-md transition-colors">
              <svg viewBox="0 0 24 24" class="h-6 w-6 fill-current"><path d="M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20h4.5v-6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v6H20V7.577l-7.5-4.33zm-2-1.732a3 3 0 0 1 3 0l7.5 4.33a2 2 0 0 1 1 1.732V21a1 1 0 0 1-1 1h-6.5a1 1 0 0 1-1-1v-6h-3v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.577a2 2 0 0 1 1-1.732l7.5-4.33z"></path></svg>
              Home
            </a>
          </li>
          <li>
            <a href="#" class="flex items-center gap-4 px-3 py-2 hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" class="h-6 w-6 fill-current"><path d="M10.533 1.279c-5.18 0-9.407 4.14-9.407 9.279s4.226 9.279 9.407 9.279c2.234 0 4.29-.77 5.907-2.058l4.353 4.353a1 1 0 1 0 1.414-1.414l-4.344-4.344a9.157 9.157 0 0 0 2.077-5.816c0-5.14-4.226-9.28-9.407-9.28zm-7.407 9.279c0-4.006 3.302-7.28 7.407-7.28s7.407 3.274 7.407 7.28-3.302 7.279-7.407 7.279-7.407-3.273-7.407-7.279z"></path></svg>
              Search
            </a>
          </li>
        </ul>
      </div>

      <div class="mt-4 flex-1 overflow-y-auto px-3 border-t border-neutral-800 pt-4 custom-scrollbar">
        <h3 class="text-xs uppercase tracking-wider font-bold mb-4 px-3">Your Library</h3>
        <ul class="space-y-2">
          <li *ngFor="let pl of playlists">
            <a href="#" class="block px-3 py-1 hover:text-white transition-colors truncate">
              {{ pl.name }}
            </a>
          </li>
          <li *ngIf="playlists.length === 0" class="px-3 text-sm italic">
            No playlists found.
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: `
    .custom-scrollbar::-webkit-scrollbar { width: 8px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #555; border-radius: 4px; }
    .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #888; }
  `
})
export class SidebarComponent implements OnInit {
  playlists: any[] = [];

  constructor(private supabase: SupabaseService, private authService: AuthService) {}

  async ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.playlists = await this.supabase.getUserPlaylists(user.id);
    }
  }
}
