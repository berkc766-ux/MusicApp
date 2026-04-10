import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  // 1. READ: List all songs by a certain artist and show the albums those songs appear on
  async getSongsByArtist(artistName: string) {
    const { data, error } = await this.supabase
      .from('artists')
      .select(`
        id,
        stage_name,
        albums (
          id,
          title,
          album_songs (
            songs (
              id,
              title,
              duration_sec
            )
          )
        )
      `)
      .eq('stage_name', artistName)
      .single(); // Assuming stage_name is highly specific/unique

    if (error) throw error;
    return data;
  }

  // 2. READ: List all playlist names for a user and the total number of songs in each
  async getUserPlaylistsWithSongCount(userId: string) {
    const { data, error } = await this.supabase
      .from('playlists')
      .select(`
        id,
        name,
        playlist_songs (count)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  }

  // 3. UPDATE: Change the name of a specific song
  async updateSongName(songId: string, newTitle: string) {
    const { data, error } = await this.supabase
      .from('songs')
      .update({ title: newTitle })
      .eq('id', songId)
      .select();

    if (error) throw error;
    return data;
  }

  // 4. INSERT: Add a new Artist
  async addArtist(stageName: string, realName: string, bio: string) {
    const { data, error } = await this.supabase
      .from('artists')
      .insert([{ stage_name: stageName, real_name: realName, bio: bio }])
      .select();

    if (error) throw error;
    return data;
  }

  // 5. DELETE: Remove an album AND all the songs on it (Cascading logic via Service)
  async deleteAlbumAndItsSongs(albumId: string) {
    // Step A: Find all songs associated with this album
    const { data: albumSongs, error: fetchError } = await this.supabase
      .from('album_songs')
      .select('song_id')
      .eq('album_id', albumId);

    if (fetchError) throw fetchError;
    const songIds = albumSongs?.map(as => as.song_id) || [];

    // Step B: Delete junction table links to prevent Foreign Key constraint errors
    const { error: junctionError } = await this.supabase
      .from('album_songs')
      .delete()
      .eq('album_id', albumId);

    if (junctionError) throw junctionError;

    // Step C: Delete the actual album
    const { error: albumError } = await this.supabase
      .from('albums')
      .delete()
      .eq('id', albumId);

    if (albumError) throw albumError;

    // Step D: Cascade delete the actual songs that belonged to the album
    if (songIds.length > 0) {
      const { error: songsError } = await this.supabase
        .from('songs')
        .delete()
        .in('id', songIds);

      if (songsError) throw songsError;
    }

    return true; // Successfully cascaded manually
  }
}
