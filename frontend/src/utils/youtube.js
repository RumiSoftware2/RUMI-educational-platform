// Utility to convert various YouTube URL formats into embed URLs
export function toYoutubeEmbed(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    let videoId = null;

    if (host === 'youtu.be' || host.endsWith('.youtu.be')) {
      videoId = parsed.pathname.replace(/^\//, '');
    } else if (host.includes('youtube.com')) {
      const pathname = parsed.pathname;
      if (pathname.startsWith('/watch')) {
        videoId = parsed.searchParams.get('v');
      } else if (pathname.startsWith('/shorts/')) {
        const parts = pathname.split('/');
        videoId = parts[2] || parts[1];
      } else if (pathname.startsWith('/embed/')) {
        // Already an embed URL
        return url;
      }
    }

    // Fallback regex if URL parsing didn't yield an id
    if (!videoId) {
      const m = url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
      if (m) videoId = m[1];
    }

    if (!videoId) return url;

    // Preserve the `si` param when present (some shared URLs include it)
    let qs = '';
    try {
      const maybe = new URL(url);
      const si = maybe.searchParams.get('si');
      if (si) qs = `?si=${encodeURIComponent(si)}`;
    } catch (e) {}

    return `https://www.youtube.com/embed/${videoId}${qs}`;
  } catch (e) {
    // Last resort: try regex extraction
    const m = url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
    if (m) return `https://www.youtube.com/embed/${m[1]}`;
    return url;
  }
}
