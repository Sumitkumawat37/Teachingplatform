// Fetches a YouTube playlist page and extracts videos (id, title, duration)
// without requiring a YouTube Data API key. Public/unlisted playlists only.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function extractListId(input: string): string | null {
  if (!input) return null;
  const m = input.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  if (m) return m[1];
  if (/^[a-zA-Z0-9_-]{10,}$/.test(input)) return input;
  return null;
}

function formatDuration(secs: number): string {
  if (!secs || isNaN(secs)) return "0:00";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url } = await req.json();
    const listId = extractListId(url);
    if (!listId) {
      return new Response(JSON.stringify({ error: "Invalid playlist URL" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pageUrl = `https://www.youtube.com/playlist?list=${listId}&hl=en`;
    const res = await fetch(pageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    if (!res.ok) throw new Error(`YouTube returned ${res.status}`);
    const html = await res.text();

    // Locate ytInitialData JSON
    const match = html.match(/var ytInitialData = (\{.*?\});<\/script>/s)
      || html.match(/ytInitialData"\] = (\{.*?\});/s);
    if (!match) throw new Error("Could not parse playlist data");

    const data = JSON.parse(match[1]);
    const tabs = data?.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
    const items: any[] = [];
    for (const tab of tabs) {
      const sections = tab?.tabRenderer?.content?.sectionListRenderer?.contents || [];
      for (const sec of sections) {
        const itemSec = sec?.itemSectionRenderer?.contents || [];
        for (const it of itemSec) {
          const renderer = it?.playlistVideoListRenderer;
          if (renderer?.contents) items.push(...renderer.contents);
        }
      }
    }

    const playlistTitle: string | undefined =
      data?.metadata?.playlistMetadataRenderer?.title
      || data?.header?.playlistHeaderRenderer?.title?.simpleText;

    const videos = items
      .map((it) => it?.playlistVideoRenderer)
      .filter(Boolean)
      .map((v) => ({
        videoId: v.videoId,
        title: v.title?.runs?.[0]?.text || v.title?.simpleText || "Untitled",
        duration: formatDuration(parseInt(v.lengthSeconds || "0", 10)),
      }))
      .filter((v) => v.videoId);

    return new Response(JSON.stringify({ playlistTitle, videos }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || "Failed to fetch playlist" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
