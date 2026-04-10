import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase';

@Component({
  selector: 'app-mutate-operations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mutate-operations.component.html',
  styleUrls: ['./mutate-operations.component.css']
})
export class MutateOperationsComponent {
  // Requirement 3: Update Song Name
  updateSongId = '';
  newSongTitle = '';
  updateStatus = '';
  updateError = '';

  // Requirement 4: Add New Artist
  newArtistStageName = '';
  newArtistRealName = '';
  newArtistBio = '';
  addArtistStatus = '';
  addArtistError = '';

  // Requirement 5: Delete Album & Songs
  deleteAlbumId = '';
  deleteStatus = '';
  deleteError = '';

  constructor(private supabaseService: SupabaseService) {}

  async updateSong() {
    this.updateStatus = '';
    this.updateError = '';
    if (!this.updateSongId || !this.newSongTitle) return;

    try {
      await this.supabaseService.updateSongName(this.updateSongId, this.newSongTitle);
      this.updateStatus = 'Song title updated successfully!';
      this.updateSongId = '';
      this.newSongTitle = '';
    } catch (err: any) {
      this.updateError = err.message || 'Error updating song';
    }
  }

  async addArtist() {
    this.addArtistStatus = '';
    this.addArtistError = '';
    if (!this.newArtistStageName || !this.newArtistRealName) return;

    try {
      await this.supabaseService.addArtist(
        this.newArtistStageName, 
        this.newArtistRealName, 
        this.newArtistBio
      );
      this.addArtistStatus = 'Artist added successfully!';
      this.newArtistStageName = '';
      this.newArtistRealName = '';
      this.newArtistBio = '';
    } catch (err: any) {
      this.addArtistError = err.message || 'Error adding artist';
    }
  }

  async deleteAlbum() {
    this.deleteStatus = '';
    this.deleteError = '';
    if (!this.deleteAlbumId) return;

    try {
      await this.supabaseService.deleteAlbumAndItsSongs(this.deleteAlbumId);
      this.deleteStatus = 'Album and its associated songs deleted successfully!';
      this.deleteAlbumId = '';
    } catch (err: any) {
      this.deleteError = err.message || 'Error deleting album';
    }
  }
}
