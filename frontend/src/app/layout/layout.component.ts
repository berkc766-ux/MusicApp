import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { TopbarComponent } from '../shared/topbar/topbar.component';
import { PlayerComponent } from '../shared/player/player.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, PlayerComponent],
  template: `
    <div class="flex h-screen bg-black text-white overflow-hidden">
      <!-- Sidebar: fixed width -->
      <aside class="w-60 flex-shrink-0 overflow-hidden">
        <app-sidebar class="block h-full"></app-sidebar>
      </aside>

      <!-- Main area: flex column, takes remaining width -->
      <div class="flex flex-col flex-1 overflow-hidden">
        <app-topbar></app-topbar>
        <main class="flex-1 overflow-y-auto bg-gradient-to-b from-neutral-800 via-neutral-900 to-black px-6 pt-2">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Player pinned to bottom -->
      <app-player
        class="fixed bottom-0 left-0 right-0 h-24 z-50 bg-neutral-900 border-t border-neutral-800 flex items-center">
      </app-player>
    </div>
  `
})
export class LayoutComponent {}
