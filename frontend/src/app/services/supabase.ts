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

  async getArtistById(artistId: number) {
    const { data, error } = await this.supabase
      .from('artists')
      .select('id, stage_name, real_name, bio, formation_year, user_id, albums(id, title, release_year, record_label, type, album_songs(songs(id, title, duration_sec, is_explicit)))')
      .eq('id', artistId)
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

  /** Returns ALL artist profiles linked to a user (manager mode) */
  async getArtistsByUserId(userId: number) {
    const { data, error } = await this.supabase
      .from('artists')
      .select('id, stage_name, real_name, bio, formation_year, user_id')
      .eq('user_id', userId)
      .order('stage_name');
    if (error) throw error;
    return data ?? [];
  }

  async deleteArtist(artistId: number) {
    // Get albums to cascade-delete songs
    const { data: albums } = await this.supabase
      .from('albums').select('id').eq('artist_id', artistId);
    const albumIds = (albums ?? []).map((a: any) => a.id);
    if (albumIds.length > 0) {
      const { data: links } = await this.supabase
        .from('album_songs').select('song_id, album_id').in('album_id', albumIds);
      const songIds = [...new Set((links ?? []).map((l: any) => l.song_id))];
      await this.supabase.from('album_songs').delete().in('album_id', albumIds);
      if (songIds.length > 0)
        await this.supabase.from('songs').delete().in('id', songIds);
      await this.supabase.from('albums').delete().in('id', albumIds);
    }
    const { error } = await this.supabase.from('artists').delete().eq('id', artistId);
    if (error) throw error;
  }

  /** Admin: create a full artist account (user + artist profile) */
  async createFullArtist(payload: {
    username: string; email: string; password: string;
    firstName: string; lastName: string;
    stageName: string; realName?: string; bio?: string; formationYear?: number;
  }) {
    // 1. Create user with role=artist
    const user = await this.registerUser({
      username: payload.username, email: payload.email, password: payload.password,
      firstName: payload.firstName, lastName: payload.lastName, role: 'artist',
    });
    // 2. Create artist profile linked to that user
    const artist = await this.registerArtist(
      user.id, payload.stageName,
      payload.realName || `${payload.firstName} ${payload.lastName}`,
      payload.bio || ''
    );
    if (payload.formationYear) {
      await this.supabase.from('artists')
        .update({ formation_year: payload.formationYear }).eq('id', artist.id);
    }
    return { user, artist };
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

  async getPlaylistById(playlistId: number) {
    const { data, error } = await this.supabase
      .from('playlists')
      .select('id, name, description, creation_date, user_id, users!user_id(id, username)')
      .eq('id', playlistId)
      .single();
    if (error) throw error;
    return data;
  }

  async deletePlaylist(playlistId: number) {
    await this.supabase.from('playlist_songs').delete().eq('playlist_id', playlistId);
    await this.supabase.from('shared_playlists').delete().eq('playlist_id', playlistId);
    const { error } = await this.supabase.from('playlists').delete().eq('id', playlistId);
    if (error) throw error;
  }

  async getPublicPlaylists(userId: number) {
    const { data, error } = await this.supabase
      .from('playlists')
      .select('id, name, description, creation_date, playlist_songs(count)')
      .eq('user_id', userId)
      .order('creation_date', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  async searchAll(query: string) {
    const q = `%${query}%`;
    const [songs, artists, albums, playlists] = await Promise.all([
      this.supabase.from('songs').select('id, title, duration_sec, is_explicit, album_songs(albums(id, title, artists!artist_id(id, stage_name)))').ilike('title', q).limit(10),
      this.supabase.from('artists').select('id, stage_name, real_name, bio').ilike('stage_name', q).limit(8),
      this.supabase.from('albums').select('id, title, release_year, type, artists!artist_id(id, stage_name)').ilike('title', q).limit(8),
      this.supabase.from('playlists').select('id, name, description, users!user_id(id, username)').ilike('name', q).limit(8),
    ]);
    return {
      songs: songs.data ?? [],
      artists: artists.data ?? [],
      albums: albums.data ?? [],
      playlists: playlists.data ?? [],
    };
  }

  // ─── DASHBOARD: Featured Content ──────────────────────────────────────────

  async getFeaturedPlaylists() {
    const { data, error } = await this.supabase
      .from('playlists')
      .select('id, name, description, user_id, users!user_id(id, username)')
      .eq('is_public', true)
      .limit(12);
    if (error) {
      console.warn('getFeaturedPlaylists error:', error.message);
      return [];
    }
    return data ?? [];
  }

  async setPlaylistPublic(playlistId: number, isPublic: boolean) {
    const { error } = await this.supabase
      .from('playlists')
      .update({ is_public: isPublic })
      .eq('id', playlistId);
    if (error) throw error;
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
      .select('song_id, added_date, songs(id, title, duration_sec, is_explicit, album_songs(albums(id, title, artists!artist_id(id, stage_name))))')
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
    category_id?: number;
    language_id?: number;
    track_no?: number;
  }) {
    const { data: song, error: songErr } = await this.supabase
      .from('songs')
      .insert([{
        title: payload.title,
        duration_sec: payload.duration_sec || null,
        is_explicit: payload.is_explicit || false,
        category_id: payload.category_id || null,
        language_id: payload.language_id || null,
        track_no: payload.track_no || null,
      }])
      .select()
      .single();
    if (songErr) throw songErr;

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
  // ─── CATEGORIES & LANGUAGES ───────────────────────────────────────────────

  async getCategories() {
    const { data, error } = await this.supabase
      .from('categories').select('id, name, description').order('name');
    if (error) throw error;
    return data ?? [];
  }

  async addCategory(name: string, description?: string) {
    const { data, error } = await this.supabase
      .from('categories').insert([{ name, description: description || null }]).select().single();
    if (error) throw error;
    return data;
  }

  async deleteCategory(id: number) {
    const { error } = await this.supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  }

  async getLanguages() {
    const { data, error } = await this.supabase
      .from('languages').select('id, name, code').order('name');
    if (error) throw error;
    return data ?? [];
  }

  async addLanguage(name: string, code?: string) {
    const { data, error } = await this.supabase
      .from('languages').insert([{ name, code: code || null }]).select().single();
    if (error) throw error;
    return data;
  }

  async deleteLanguage(id: number) {
    const { error } = await this.supabase.from('languages').delete().eq('id', id);
    if (error) throw error;
  }

  // ─── LIKED SONGS ──────────────────────────────────────────────────────────

  async likeSong(userId: number, songId: number) {
    const { error } = await this.supabase
      .from('liked_songs')
      .insert([{ user_id: userId, song_id: songId, liked_at: new Date().toISOString().split('T')[0] }]);
    if (error && !error.message.includes('duplicate')) throw error;
  }

  async unlikeSong(userId: number, songId: number) {
    const { error } = await this.supabase
      .from('liked_songs').delete().eq('user_id', userId).eq('song_id', songId);
    if (error) throw error;
  }

  async getLikedSongIds(userId: number): Promise<Set<number>> {
    const { data, error } = await this.supabase
      .from('liked_songs').select('song_id').eq('user_id', userId);
    if (error) return new Set();
    return new Set((data ?? []).map((r: any) => r.song_id));
  }

  async getLikedSongs(userId: number) {
    const { data, error } = await this.supabase
      .from('liked_songs')
      .select('song_id, liked_at, songs(id, title, duration_sec, is_explicit, category_id, language_id, album_songs(albums(id, title, artists!artist_id(id, stage_name))))')
      .eq('user_id', userId)
      .order('liked_at', { ascending: false });
    if (error) {
      console.warn('getLikedSongs error:', error.message);
      return [];
    }
    return data ?? [];
  }

  async updateArtistFormationYear(artistId: number, year: number) {
    const { error } = await this.supabase
      .from('artists').update({ formation_year: year }).eq('id', artistId);
    if (error) throw error;
  }
}
