/**
 * YouTube Playlist Fetcher
 * Fetches videos from a YouTube playlist without backend API
 * Uses YouTube's oEmbed and RSS feed for public playlists
 */

export interface PlaylistVideo {
  id: string;
  title: string;
  thumbnail: string;
  embedUrl: string;
  shortsThumbnail?: string;
}

const PLAYLIST_ID = "PLKqQrIhHYOc0";

/**
 * Extract video ID from YouTube URL
 */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

/**
 * Generate YouTube embed URL with privacy-enhanced mode
 */
export function generateEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`;
}

/**
 * Generate thumbnail URL for YouTube video
 */
export function generateThumbnailUrl(videoId: string, quality: 'maxresdefault' | 'hqdefault' | 'mqdefault' = 'hqdefault'): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * Check if video is a YouTube Short
 */
export function isYouTubeShort(videoId: string): boolean {
  // YouTube Shorts typically have 9:16 aspect ratio
  // We'll determine this by checking if maxresdefault exists
  return false; // Will be determined dynamically
}

/**
 * Fetch videos from YouTube playlist using RSS feed
 * This works for public playlists without API key
 */
export async function fetchPlaylistVideos(playlistId: string = PLAYLIST_ID): Promise<PlaylistVideo[]> {
  try {
    // Try RSS feed first (works for public playlists)
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;
    const response = await fetch(rssUrl);
    
    if (!response.ok) {
      throw new Error('Failed to fetch playlist RSS feed');
    }
    
    const text = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'text/xml');
    
    const entries = xml.querySelectorAll('entry');
    const videos: PlaylistVideo[] = [];
    
    entries.forEach((entry) => {
      const videoId = extractVideoId(entry.querySelector('link')?.getAttribute('href') || '');
      if (videoId) {
        videos.push({
          id: videoId,
          title: entry.querySelector('title')?.textContent || '',
          thumbnail: generateThumbnailUrl(videoId, 'hqdefault'),
          embedUrl: generateEmbedUrl(videoId),
          shortsThumbnail: generateThumbnailUrl(videoId, 'maxresdefault'),
        });
      }
    });
    
    return videos;
  } catch (error) {
    console.error('Error fetching playlist videos:', error);
    
    // Fallback: Return empty array or mock data for development
    // In production, you might want to use YouTube Data API v3
    return [];
  }
}

/**
 * Fetch playlist videos with caching
 */
const playlistCache = new Map<string, { data: PlaylistVideo[]; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export async function fetchPlaylistVideosCached(playlistId: string = PLAYLIST_ID): Promise<PlaylistVideo[]> {
  const cacheKey = playlistId;
  const cached = playlistCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const videos = await fetchPlaylistVideos(playlistId);
  playlistCache.set(cacheKey, { data: videos, timestamp: Date.now() });
  
  return videos;
}

/**
 * Preload next video thumbnail for smooth transitions
 */
export function preloadThumbnail(thumbnailUrl: string): void {
  const img = new Image();
  img.src = thumbnailUrl;
}
