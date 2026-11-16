const ALLOWED_HOSTS = new Set([
  "x.com",
  "twitter.com",
  "mobile.twitter.com",
  "mobile.x.com",
  "fxtwitter.com",
  "api.fxtwitter.com",
  "fixupx.com",
  "vxtwitter.com",
  "www.x.com",
  "www.twitter.com",
]);

function normalizeHost(hostname) {
  return String(hostname || "")
    .trim()
    .toLowerCase()
    .replace(/\.$/, "");
}

export function extractTweetId(input) {
  const raw = String(input || "").trim();
  if (!raw) return null;
  if (/^\d{2,20}$/.test(raw)) return raw;

  let text = raw.replace(/^@/, "");
  if (!/^https?:\/\//i.test(text)) {
    text = `https://${text}`;
  }

  let url;
  try {
    url = new URL(text);
  } catch {
    return null;
  }

  const host = normalizeHost(url.hostname);
  if (!ALLOWED_HOSTS.has(host)) return null;

  const fromPath = url.pathname.match(/\/status(?:es)?\/(\d{2,20})(?:\/|$)/i);
  if (fromPath) return fromPath[1];

  const fromQuery = url.searchParams.get("id") || url.searchParams.get("tweet_id");
  if (fromQuery && /^\d{2,20}$/.test(fromQuery)) return fromQuery;

  const bare = url.pathname.match(/^\/(?:status\/)?(\d{2,20})\/?$/i);
  if (bare && (host.includes("fxtwitter") || host.includes("fixupx") || host.includes("vxtwitter"))) {
    return bare[1];
  }

  return null;
}
