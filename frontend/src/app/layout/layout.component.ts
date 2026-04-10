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
    <div class="flex h-screen bg-black text-white relative">
      <app-sidebar class="w-64 flex-shrink-0 z-10"></app-sidebar>
      <div class="flex flex-col flex-1 h-[calc(100vh-90px)] overflow-hidden">
        <app-topbar class="h-16 flex-shrink-0 z-20"></app-topbar>
        <main class="flex-1 overflow-y-auto bg-gradient-to-b from-neutral-800 to-black p-6">
          <router-outlet></router-outlet>
        </main>
      </div>
      <!-- Fixed Player at Bottom -->
      <app-player class="h-[90px] w-full absolute bottom-0 left-0 bg-neutral-900 border-t border-neutral-800 z-30"></app-player>
    </div>
  `,
  styles: ``
})
export class LayoutComponent {}
