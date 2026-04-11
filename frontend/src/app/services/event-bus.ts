import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EventBusService {
  /** Emit whenever sidebar-relevant data changes (albums, playlists, etc.) */
  sidebarRefresh$ = new Subject<void>();

  triggerSidebarRefresh() {
    this.sidebarRefresh$.next();
  }
}
