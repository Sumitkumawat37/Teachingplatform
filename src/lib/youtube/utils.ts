/**
 * YouTube URL utilities for handling various YouTube URL formats
 */

/**
 * Extract video ID from various YouTube URL formats
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  // Handle shorts URLs: youtube.com/shorts/VIDEO_ID
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch) return shortsMatch[1];

  // Handle standard URLs: youtube.com/watch?v=VIDEO_ID
  const standardMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (standardMatch) return standardMatch[1];

  // Handle embed URLs: youtube.com/embed/VIDEO_ID
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
  if (embedMatch) return embedMatch[1];

  // Handle youtu.be URLs: youtu.be/VIDEO_ID
  const youtuMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (youtuMatch) return youtuMatch[1];

  // Handle v URLs: youtube.com/v/VIDEO_ID
  const vMatch = url.match(/youtube\.com\/v\/([a-zA-Z0-9_-]+)/);
  if (vMatch) return vMatch[1];

  return null;
}

/**
 * Convert YouTube URL to embed URL with privacy-enhanced mode
 */
export function convertToEmbedUrl(url: string, options: {
  autoplay?: boolean;
  mute?: boolean;
  loop?: boolean;
  playlist?: string;
  start?: number;
  end?: number;
} = {}): string | null {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;

  const params = new URLSearchParams({
    enablejsapi: "1",
    fs: "0", // Hide fullscreen button
    modestbranding: "1", // Minimal YouTube branding
    rel: "0", // Don't show related videos from other channels
    iv_load_policy: "3", // Hide annotations
    cc_load_policy: "0", // Hide closed captions by default
    disablekb: "1", // Disable keyboard controls
    ...options,
  });

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Convert YouTube Shorts URL to embed URL
 */
export function convertShortsToEmbed(shortsUrl: string): string | null {
  return convertToEmbedUrl(shortsUrl);
}

/**
 * Check if URL is a YouTube Shorts URL
 */
export function isYouTubeShorts(url: string): boolean {
  return /youtube\.com\/shorts\//.test(url);
}

/**
 * Check if URL is a YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
  return /(youtube\.com|youtu\.be)/.test(url);
}

/**
 * Get YouTube thumbnail URL
 */
export function getYouTubeThumbnail(videoId: string, quality: "default" | "medium" | "high" | "maxres" = "high"): string {
  const qualityMap = {
    default: "default",
    medium: "mqdefault",
    high: "hqdefault",
    maxres: "maxresdefault",
  };
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

/**
 * Extract playlist ID from YouTube URL
 */
export function extractYouTubePlaylistId(url: string): string | null {
  const playlistMatch = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  return playlistMatch ? playlistMatch[1] : null;
}

/**
 * Convert YouTube playlist URL to embed URL
 */
export function convertPlaylistToEmbedUrl(url: string, videoIndex: number = 0): string | null {
  const playlistId = extractYouTubePlaylistId(url);
  if (!playlistId) return null;

  const params = new URLSearchParams({
    list: playlistId,
    index: videoIndex.toString(),
    enablejsapi: "1",
    fs: "0",
    modestbranding: "1",
    rel: "0",
  });

  return `https://www.youtube-nocookie.com/embed/videoseries?${params.toString()}`;
}

/**
 * Normalize YouTube URL to standard format
 */
export function normalizeYouTubeUrl(url: string): string | null {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;

  return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * Get video duration from YouTube API (requires API key)
 */
export async function getVideoDuration(videoId: string, apiKey: string): Promise<number | null> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails&key=${apiKey}`
    );
    const data = await response.json();

    if (data.items && data.items[0]) {
      const duration = data.items[0].contentDetails.duration;
      return parseYouTubeDuration(duration);
    }

    return null;
  } catch (error) {
    console.error("Error fetching video duration:", error);
    return null;
  }
}

/**
 * Parse YouTube duration format (PT1H2M3S) to seconds
 */
function parseYouTubeDuration(duration: string): number {
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = duration.match(regex);

  if (!matches) return 0;

  const hours = parseInt(matches[1] || "0", 10);
  const minutes = parseInt(matches[2] || "0", 10);
  const seconds = parseInt(matches[3] || "0", 10);

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Validate YouTube video ID
 */
export function isValidYouTubeVideoId(videoId: string): boolean {
  return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
}

/**
 * Get video start time from URL parameter
 */
export function getVideoStartTime(url: string): number {
  const match = url.match(/[?&]t=(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}
