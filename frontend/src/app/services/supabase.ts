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

  // AUTHENTICATION
  async authenticateUser(email: string, passwordString: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', passwordString)
      .single();

    if (error || !data) throw error || new Error('Invalid credentials');
    return data;
  }

  async getUserById(userId: number) {
    const { data, error } = await this.supabase
      .from('users')
      .select('id, username, email, first_name, last_name, role')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  // GET SPOTIFY-LIKE DASHBOARD DATA
  async getFeaturedPlaylists() {
    const { data, error } = await this.supabase
      .from('playlists')
      .select('id, name, description, user_id, users(username)')
      .limit(6);
    if (error) throw error;
    return data;
  }

  async getRecentSongs() {
    const { data, error } = await this.supabase
      .from('songs')
      .select('id, title, duration_sec, is_explicit, album_songs!inner(albums(id, title, artists(stage_name)))')
      .limit(10);
    if (error) throw error;
    return data;
  }

  // USER DATA
  async getUserPlaylists(userId: number) {
    const { data, error } = await this.supabase
      .from('playlists')
      .select('id, name')
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  }

  // To mock "Liked Songs", we can look for a shared playlist or just return random songs for mockup
  async getLikedSongsMock() {
    const { data, error } = await this.supabase
      .from('songs')
      .select('id, title, duration_sec, is_explicit, album_songs!inner(albums(id, title, artists(stage_name)))')
      .limit(5);
    if (error) throw error;
    return data;
  }
}
