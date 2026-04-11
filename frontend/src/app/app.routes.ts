import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ArtistDashboardComponent } from './pages/artist-dashboard/artist-dashboard.component';
import { ArtistComponent } from './pages/artist/artist.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { LibraryComponent } from './pages/library/library.component';
import { PlaylistComponent } from './pages/playlist/playlist.component';
import { SearchComponent } from './pages/search/search.component';
import { LikedSongsComponent } from './pages/liked-songs/liked-songs.component';
import { AdminComponent } from './pages/admin/admin.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'artist-dashboard', component: ArtistDashboardComponent },
      { path: 'artist/:id', component: ArtistComponent },
      { path: 'user/:id', component: UserProfileComponent },
      { path: 'library', component: LibraryComponent },
      { path: 'playlist/:id', component: PlaylistComponent },
      { path: 'search', component: SearchComponent },
      { path: 'liked-songs', component: LikedSongsComponent },
      { path: 'admin', component: AdminComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  },
  { path: '**', redirectTo: '' }
];
