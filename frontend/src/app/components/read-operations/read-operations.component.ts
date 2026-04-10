import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase';

@Component({
  selector: 'app-read-operations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './read-operations.component.html',
  styleUrls: ['./read-operations.component.css']
})
export class ReadOperationsComponent {
  // Query 1 state
  artistSearchTerm = '';
  artistData: any = null;
  artistError = '';

  // Query 2 state
  userIdInput = '';
  playlistsData: any[] = [];
  playlistsError = '';

  constructor(private supabaseService: SupabaseService) {}

  async searchArtistAlbums() {
    this.artistError = '';
    this.artistData = null;
    if (!this.artistSearchTerm) return;

    try {
      this.artistData = await this.supabaseService.getSongsByArtist(this.artistSearchTerm);
    } catch (err: any) {
      this.artistError = err.message || 'Error fetching artist data';
    }
  }

  async searchUserPlaylists() {
    this.playlistsError = '';
    this.playlistsData = [];
    if (!this.userIdInput) return;

    try {
      this.playlistsData = await this.supabaseService.getUserPlaylistsWithSongCount(this.userIdInput);
    } catch (err: any) {
      this.playlistsError = err.message || 'Error fetching playlists';
    }
  }
}
