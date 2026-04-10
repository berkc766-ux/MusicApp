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
    role?: string;
  }) {
    const { data, error } = await this.supabase
      .from('users')
      .insert([{
        username: payload.username,
        email: payload.email,
        password: payload.password,
        first_name: payload.firstName,
        last_name: payload.lastName,
        role: payload.role || 'user',
        registration_date: new Date().toISOString().split('T')[0]
      }])
      .select('id, username, email, first_name, last_name, role')
      .single();
    if (error) throw error;
    return data;
  }

  async registerArtist(userId: number, stageName: string, realName: string, bio: string) {
    const { data, error } = await this.supabase
      .from('artists')
      .insert([{
        stage_name: stageName,
        real_name: realName || null,
        bio: bio || null,
        user_id: userId,
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getArtistByUserId(userId: number) {
    const { data, error } = await this.supabase
      .from('artists')
      .select('id, stage_name, real_name, bio, formation_year, user_id')
      .eq('user_id', userId)
      .maybeSingle();
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

  // ─── DASHBOARD: Featured Content ──────────────────────────────────────────

  async getFeaturedPlaylists() {
    const { data, error } = await this.supabase
      .from('playlists')
      .select('id, name, description, users!user_id(username)')
      .limit(8);
    if (error) {
      console.warn('getFeaturedPlaylists error:', error.message);
      return [];
    }
    return data ?? [];
  }

  async getRecentSongs() {
    const { data, error } = await this.supabase
      .from('songs')
      .select('id, title, duration_sec, is_explicit, album_songs(albums(id, title, artists!artist_id(stage_name)))')
      .limit(10);
    if (error) {
      console.warn('getRecentSongs error:', error.message);
      return [];
    }
    return data ?? [];
  }

  async getAllArtists() {
    const { data, error } = await this.supabase
      .from('artists')
      .select('id, stage_name, real_name, bio, formation_year, user_id')
      .order('stage_name');
    if (error) throw error;
    return data ?? [];
  }

  async getAllAlbums() {
    const { data, error } = await this.supabase
      .from('albums')
      .select('id, title, release_year, record_label, type, artists!artist_id(stage_name)')
      .order('release_year', { ascending: false });
    if (error) {
      console.warn('getAllAlbums error:', error.message);
      return [];
    }
    return data ?? [];
  }

  // ─── PLAYLISTS ────────────────────────────────────────────────────────────

  async getUserPlaylists(userId: number) {
    const { data, error } = await this.supabase
      .from('playlists')
      .select('id, name, description, creation_date, playlist_songs(count)')
      .eq('user_id', userId);
    if (error) throw error;
    return data ?? [];
  }

  async createPlaylist(userId: number, name: string, description: string) {
    const { data, error } = await this.supabase
      .from('playlists')
      .insert([{
        user_id: userId,
        name,
        description,
        creation_date: new Date().toISOString().split('T')[0]
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async addSongToPlaylist(playlistId: number, songId: number) {
    const { data, error } = await this.supabase
      .from('playlist_songs')
      .insert([{
        playlist_id: playlistId,
        song_id: songId,
        added_date: new Date().toISOString().split('T')[0]
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async removeSongFromPlaylist(playlistId: number, songId: number) {
    const { error } = await this.supabase
      .from('playlist_songs')
      .delete()
      .eq('playlist_id', playlistId)
      .eq('song_id', songId);
    if (error) throw error;
  }

  async getPlaylistSongs(playlistId: number) {
    const { data, error } = await this.supabase
      .from('playlist_songs')
      .select('song_id, added_date, songs(id, title, duration_sec, is_explicit, album_songs(albums(id, title, artists!artist_id(stage_name))))')
      .eq('playlist_id', playlistId);
    if (error) {
      console.warn('getPlaylistSongs error:', error.message);
      return [];
    }
    return data ?? [];
  }

  async sharePlaylist(playlistId: number, targetUserId: number) {
    const { data, error } = await this.supabase
      .from('shared_playlists')
      .insert([{ playlist_id: playlistId, user_id: targetUserId }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getSharedPlaylistsForUser(userId: number) {
    const { data, error } = await this.supabase
      .from('shared_playlists')
      .select('playlists(id, name, description, users!user_id(username), playlist_songs(count))')
      .eq('user_id', userId);
    if (error) {
      console.warn('getSharedPlaylistsForUser error:', error.message);
      return [];
    }
    return data ?? [];
  }

  // ─── ARTIST FEATURES ──────────────────────────────────────────────────────

  async getAlbumsByArtist(artistId: number) {
    const { data, error } = await this.supabase
      .from('albums')
      .select('id, title, release_year, record_label, type, album_songs(songs(id, title, duration_sec, is_explicit))')
      .eq('artist_id', artistId)
      .order('release_year', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  async createAlbum(artistId: number, payload: {
    title: string;
    release_year: number;
    record_label?: string;
    type?: string;
  }) {
    const { data, error } = await this.supabase
      .from('albums')
      .insert([{
        artist_id: artistId,
        title: payload.title,
        release_year: payload.release_year,
        record_label: payload.record_label || null,
        type: payload.type || 'album',
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async createSong(albumId: number, payload: {
    title: string;
    duration_sec?: number;
    is_explicit?: boolean;
  }) {
    // First insert the song
    const { data: song, error: songErr } = await this.supabase
      .from('songs')
      .insert([{
        title: payload.title,
        duration_sec: payload.duration_sec || null,
        is_explicit: payload.is_explicit || false,
      }])
      .select()
      .single();
    if (songErr) throw songErr;

    // Then link to album
    const { error: linkErr } = await this.supabase
      .from('album_songs')
      .insert([{ album_id: albumId, song_id: song.id }]);
    if (linkErr) throw linkErr;

    return song;
  }

  async removeSongFromAlbum(albumId: number, songId: number) {
    const { error } = await this.supabase
      .from('album_songs')
      .delete()
      .eq('album_id', albumId)
      .eq('song_id', songId);
    if (error) throw error;
  }

  // ─── ADMIN: CRUD FEATURES ─────────────────────────────────────────────────

  async getSongsByArtist(artistId: number) {
    const { data, error } = await this.supabase
      .from('albums')
      .select(`
        id, title, release_year,
        album_songs(
          songs(id, title, duration_sec, is_explicit)
        )
      `)
      .eq('artist_id', artistId);
    if (error) throw error;
    return data ?? [];
  }

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

  async deleteAlbumAndSongs(albumId: number) {
    const { data: links } = await this.supabase
      .from('album_songs')
      .select('song_id')
      .eq('album_id', albumId);

    const songIds = (links ?? []).map((l: any) => l.song_id);
    let exclusiveSongIds: number[] = [];
    for (const sid of songIds) {
      const { count } = await this.supabase
        .from('album_songs')
        .select('*', { count: 'exact', head: true })
        .eq('song_id', sid);
      if ((count ?? 0) === 1) exclusiveSongIds.push(sid);
    }

    await this.supabase.from('album_songs').delete().eq('album_id', albumId);
    const { error: albumErr } = await this.supabase.from('albums').delete().eq('id', albumId);
    if (albumErr) throw albumErr;

    if (exclusiveSongIds.length > 0) {
      await this.supabase.from('songs').delete().in('id', exclusiveSongIds);
    }
    return true;
  }

  async getAllUsers() {
    const { data, error } = await this.supabase
      .from('users')
      .select('id, username, email, role, registration_date')
      .order('username');
    if (error) throw error;
    return data ?? [];
  }

  async updateUserRole(userId: number, role: string) {
    const { data, error } = await this.supabase
      .from('users')
      .update({ role })
      .eq('id', userId)
      .select('id, username, role')
      .single();
    if (error) throw error;
    return data;
  }
}
