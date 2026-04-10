import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-player',
  standalone: true,
  template: `
    <div class="h-full w-full flex items-center justify-between px-4 pb-2">
      <!-- Song Info -->
      <div class="flex items-center gap-3 w-1/4 min-w-[180px]">
        <div class="w-14 h-14 bg-neutral-800 rounded shadow-md flex items-center justify-center overflow-hidden">
          <svg viewBox="0 0 24 24" class="h-6 w-6 text-neutral-500 fill-current"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"></path></svg>
        </div>
        <div>
          <div class="text-sm font-semibold text-white hover:underline cursor-pointer truncate">Never Gonna Give You Up</div>
          <div class="text-xs text-neutral-400 hover:underline cursor-pointer truncate mt-0.5">Rick Astley</div>
        </div>
        <button class="ml-2 text-neutral-400 hover:text-white transition">
          <svg viewBox="0 0 16 16" class="h-4 w-4 fill-current"><path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8z"></path></svg>
        </button>
      </div>

      <!-- Controls -->
      <div class="flex flex-col items-center justify-center w-2/4 max-w-[722px]">
        <div class="flex items-center gap-6 mb-2">
          <!-- Shuffle -->
          <button class="text-neutral-400 hover:text-white transition">
            <svg viewBox="0 0 16 16" class="h-4 w-4 fill-current"><path d="M13.151.922a.75.75 0 10-1.06 1.06L13.109 3H11.16a3.75 3.75 0 00-2.873 1.34l-6.173 7.356A2.25 2.25 0 01.39 12.5H0V14h.391a3.75 3.75 0 002.873-1.34l6.173-7.356a2.25 2.25 0 011.724-.804h1.947l-1.017 1.018a.75.75 0 001.06 1.06L15.98 3.75 13.15.922zM.391 3.5H0V2h.391c1.109 0 2.16.527 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 00.39 3.5z"></path></svg>
          </button>
          <!-- Previous -->
          <button class="text-neutral-400 hover:text-white transition">
            <svg viewBox="0 0 16 16" class="h-4 w-4 fill-current"><path d="M3.3 1a.7.7 0 01.7.7v5.15l9.95-5.744a.7.7 0 011.05.606v12.575a.7.7 0 01-1.05.607L4 9.149V14.3a.7.7 0 01-1.4 0V1.7a.7.7 0 01.7-.7z"></path></svg>
          </button>
          <!-- Play/Pause -->
          <button (click)="togglePlay()" class="bg-white text-black h-8 w-8 rounded-full flex items-center justify-center hover:scale-105 transition-transform">
            <!-- Play icon -->
            <svg *ngIf="!isPlaying" viewBox="0 0 16 16" class="h-4 w-4 fill-current ml-0.5"><path d="M3 1.713a.7.7 0 011.05-.607l10.89 6.288a.7.7 0 010 1.212L4.05 14.894A.7.7 0 013 14.288V1.713z"></path></svg>
            <!-- Pause icon -->
            <svg *ngIf="isPlaying" viewBox="0 0 16 16" class="h-4 w-4 fill-current"><path d="M2.7 1a.7.7 0 00-.7.7v12.6a.7.7 0 00.7.7h2.6a.7.7 0 00.7-.7V1.7a.7.7 0 00-.7-.7H2.7zm8 0a.7.7 0 00-.7.7v12.6a.7.7 0 00.7.7h2.6a.7.7 0 00.7-.7V1.7a.7.7 0 00-.7-.7h-2.6z"></path></svg>
          </button>
          <!-- Next -->
          <button class="text-neutral-400 hover:text-white transition">
            <svg viewBox="0 0 16 16" class="h-4 w-4 fill-current"><path d="M12.7 1a.7.7 0 00-.7.7v5.15L2.05 1.107A.7.7 0 001 1.712v12.575a.7.7 0 001.05.607L12 9.149V14.3a.7.7 0 001.4 0V1.7a.7.7 0 00-.7-.7z"></path></svg>
          </button>
          <!-- Repeat -->
          <button class="text-neutral-400 hover:text-white transition">
            <svg viewBox="0 0 16 16" class="h-4 w-4 fill-current"><path d="M0 4.75A3.75 3.75 0 013.75 1h8.5A3.75 3.75 0 0116 4.75v5a3.75 3.75 0 01-3.75 3.75H9.81l1.018 1.018a.75.75 0 11-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 111.06 1.06L9.811 12h2.439a2.25 2.25 0 002.25-2.25v-5a2.25 2.25 0 00-2.25-2.25h-8.5A2.25 2.25 0 001.5 4.75v5A2.25 2.25 0 003.75 12H5v1.5H3.75A3.75 3.75 0 010 9.75v-5z"></path></svg>
          </button>
        </div>
        
        <div class="flex items-center gap-2 w-full">
          <span class="text-xs text-neutral-400 min-w-[40px] text-right">{{ currentTime }}</span>
          <div class="h-1 bg-neutral-600 rounded-full w-full relative group cursor-pointer">
            <div class="absolute top-0 left-0 h-full bg-white group-hover:bg-green-500 rounded-full" [style.width]="progress + '%'"></div>
            <div class="absolute h-3 w-3 bg-white rounded-full -top-1 opacity-0 group-hover:opacity-100 transition-opacity shadow" [style.left]="'calc(' + progress + '% - 6px)'"></div>
          </div>
          <span class="text-xs text-neutral-400 min-w-[40px]">3:32</span>
        </div>
      </div>

      <!-- Extra Controls -->
      <div class="flex items-center justify-end gap-3 w-1/4 min-w-[180px]">
        <button class="text-neutral-400 hover:text-white transition">
          <svg viewBox="0 0 16 16" class="h-4 w-4 fill-current"><path d="M11.196 8l-4.696 4.3.492.54L12.304 8 6.992 3.16l-.492.54L11.196 8z"></path></svg>
        </button>
        <div class="flex items-center gap-2 w-24">
          <button class="text-neutral-400 hover:text-white transition">
            <svg viewBox="0 0 16 16" class="h-4 w-4 fill-current"><path d="M9.741.85a.75.75 0 01.375.65v13a.75.75 0 01-1.125.65l-6.925-4a3.642 3.642 0 01-1.33-4.967 3.639 3.639 0 011.33-1.332l6.925-4a.75.75 0 01.75 0zm-6.924 5.3a2.139 2.139 0 000 3.7l5.8 3.35V2.8l-5.8 3.35zm8.683 4.29V5.56a2.75 2.75 0 010 4.88z"></path></svg>
          </button>
          <div class="h-1 bg-neutral-600 rounded-full w-full relative group cursor-pointer">
            <div class="absolute top-0 left-0 h-full bg-white group-hover:bg-green-500 rounded-full" style="width: 50%;"></div>
            <div class="absolute h-3 w-3 bg-white rounded-full -top-1 left-[50%] -translate-x-[50%] opacity-0 group-hover:opacity-100 transition-opacity shadow"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  imports: [CommonModule]
})
export class PlayerComponent {
  isPlaying = false;
  progress = 0;
  timer: any;
  currentTime = '0:00';
  totalSeconds = 212; // 3:32
  currentSeconds = 0;

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.timer = setInterval(() => {
        if (this.currentSeconds >= this.totalSeconds) {
          this.togglePlay();
          this.currentSeconds = 0;
          this.updateTime();
          return;
        }
        this.currentSeconds++;
        this.progress = (this.currentSeconds / this.totalSeconds) * 100;
        this.updateTime();
      }, 1000);
    } else {
      clearInterval(this.timer);
    }
  }

  updateTime() {
    const mins = Math.floor(this.currentSeconds / 60);
    const secs = this.currentSeconds % 60;
    this.currentTime = `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
