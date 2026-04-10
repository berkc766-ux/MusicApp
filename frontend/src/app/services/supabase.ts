import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  // ─── AUTH ─────────────────────────────────────────────────────────────────

  async authenticateUser(email: string, password: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('id, username, email, first_name, last_name, role')
      .eq('email', email)
      .eq('password', password)
      .single();
    if (error || !data) throw error || new Error('Invalid credentials');
    return data;
  }

  async registerUser(payload: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    const { data, error } = await this.supabase
      .from('users')
      .insert([{
        username: payload.username,
        email: payload.email,
        password: payload.password,
        first_name: payload.firstName,
        last_name: payload.lastName,
        role: 'user',
        registration_date: new Date().toISOString().split('T')[0]
      }])
      .select('id, username, email, first_name, last_name, role')
      .single();
    if (error) throw error;
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

  // ─── DASHBOARD ────────────────────────────────────────────────────────────

  async getFeaturedPlaylists() {
    const { data, error } = await this.supabase
      .from('playlists')
      .select('id, name, description, users(username)')
      .limit(8);
    if (error) throw error;
    return data ?? [];
  }

  async getRecentSongs() {
    const { data, error } = await this.supabase
      .from('songs')
      .select('id, title, duration_sec, is_explicit, album_songs(albums(id, title, artists(stage_name)))')
      .limit(10);
    if (error) throw error;
    return data ?? [];
  }

  async getAllArtists() {
    const { data, error } = await this.supabase
      .from('artists')
      .select('id, stage_name, real_name, bio, formation_year')
      .order('stage_name');
    if (error) throw error;
    return data ?? [];
  }

  async getAllAlbums() {
    const { data, error } = await this.supabase
      .from('albums')
      .select('id, title, release_year, record_label, type, artists(stage_name)')
      .order('release_year', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  // ─── FEATURE 1: Songs by artist (+ albums) ───────────────────────────────

  async getSongsByArtist(artistId: number) {
    const { data, error } = await this.supabase
      .from('songs')
      .select(`
        id, title, duration_sec, is_explicit,
        album_songs(
          albums(id, title, release_year, artists(stage_name))
        )
      `)
      .filter('album_songs.albums.artist_id', 'eq', artistId);
    if (error) throw error;

    // Also directly fetch songs via albums -> artist_id
    const { data: d2, error: e2 } = await this.supabase
      .from('albums')
      .select(`
        id, title, release_year,
        album_songs(
          songs(id, title, duration_sec, is_explicit)
        )
      `)
      .eq('artist_id', artistId);
    if (e2) throw e2;
    return d2 ?? [];
  }

  // ─── FEATURE 2: Playlists for a user + song count ────────────────────────

  async getUserPlaylists(userId: number) {
    const { data, error } = await this.supabase
      .from('playlists')
      .select('id, name, description, creation_date, playlist_songs(count)')
      .eq('user_id', userId);
    if (error) throw error;
    return data ?? [];
  }

  async getPlaylistSongs(playlistId: number) {
    const { data, error } = await this.supabase
      .from('playlist_songs')
      .select('song_id, added_date, songs(id, title, duration_sec, is_explicit, album_songs(albums(id, title, artists(stage_name))))')
      .eq('playlist_id', playlistId);
    if (error) throw error;
    return data ?? [];
  }

  // ─── FEATURE 3: Update song title ────────────────────────────────────────

  async updateSongTitle(songId: number, newTitle: string) {
    const { data, error } = await this.supabase
      .from('songs')
      .update({ title: newTitle })
      .eq('id', songId)
      .select('id, title')
      .single();
    if (error) throw error;
    return data;
  }

  async getAllSongs() {
    const { data, error } = await this.supabase
      .from('songs')
      .select('id, title, duration_sec, is_explicit')
      .order('title');
    if (error) throw error;
    return data ?? [];
  }

  // ─── FEATURE 4: Add artist ───────────────────────────────────────────────

  async addArtist(payload: { stageName: string; realName: string; bio: string; formationYear?: number }) {
    const { data, error } = await this.supabase
      .from('artists')
      .insert([{
        stage_name: payload.stageName,
        real_name: payload.realName,
        bio: payload.bio,
        formation_year: payload.formationYear || null
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // ─── FEATURE 5: Delete album + songs ─────────────────────────────────────

  async deleteAlbumAndSongs(albumId: number) {
    // Get songs in this album (that don't appear in other albums)
    const { data: links } = await this.supabase
      .from('album_songs')
      .select('song_id')
      .eq('album_id', albumId);

    const songIds = (links ?? []).map((l: any) => l.song_id);

    // Find songs that appear ONLY in this album
    let exclusiveSongIds: number[] = [];
    for (const sid of songIds) {
      const { count } = await this.supabase
        .from('album_songs')
        .select('*', { count: 'exact', head: true })
        .eq('song_id', sid);
      if ((count ?? 0) === 1) exclusiveSongIds.push(sid);
    }

    // Remove album_songs links
    await this.supabase.from('album_songs').delete().eq('album_id', albumId);

    // Remove the album itself
    const { error: albumErr } = await this.supabase
      .from('albums')
      .delete()
      .eq('id', albumId);
    if (albumErr) throw albumErr;

    // Remove songs that only belonged to this album
    if (exclusiveSongIds.length > 0) {
      await this.supabase.from('songs').delete().in('id', exclusiveSongIds);
    }
    return true;
  }

  // ─── SHARED PLAYLISTS ────────────────────────────────────────────────────

  async getSharedPlaylistsForUser(userId: number) {
    const { data, error } = await this.supabase
      .from('shared_playlists')
      .select('playlists(id, name, description, users(username), playlist_songs(count))')
      .eq('user_id', userId);
    if (error) throw error;
    return data ?? [];
  }

  async getAllUsers() {
    const { data, error } = await this.supabase
      .from('users')
      .select('id, username, email')
      .order('username');
    if (error) throw error;
    return data ?? [];
  }
}
