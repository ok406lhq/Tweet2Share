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
  if (!/^https?:\/\//i.test(text)) text = `https://${text}`;

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

function toOrigUrl(url) {
  if (!url || typeof url !== "string") return url;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.endsWith("twimg.com")) {
      parsed.searchParams.set("name", "orig");
      return parsed.toString();
    }
  } catch {
    return url;
  }
  return url;
}

function upgradeAvatar(url) {
  if (!url || typeof url !== "string") return null;
  return url
    .replace(/_normal(\.[a-zA-Z0-9]+)$/, "_400x400$1")
    .replace(/_bigger(\.[a-zA-Z0-9]+)$/, "_400x400$1")
    .replace(/_mini(\.[a-zA-Z0-9]+)$/, "_400x400$1");
}

function asPhotos(media) {
  if (!media || typeof media !== "object") return [];
  const photos = [];
  const seen = new Set();

  const pushPhoto = (item) => {
    if (!item || typeof item !== "object") return;
    const type = item.type || "";
    if (type && type !== "photo" && type !== "gif") return;
    const url = toOrigUrl(item.url);
    if (!url || seen.has(url)) return;
    seen.add(url);
    photos.push({
      url,
      width: Number(item.width) || 0,
      height: Number(item.height) || 0,
      alt: item.altText || item.alt || "",
    });
  };

  if (Array.isArray(media.photos)) media.photos.forEach(pushPhoto);
  if (photos.length === 0 && Array.isArray(media.all)) {
    media.all.forEach((item) => {
      if (item && (item.type === "photo" || item.type === "gif")) pushPhoto(item);
    });
  }
  if (photos.length === 0 && Array.isArray(media.videos)) {
    media.videos.forEach((video) => {
      const thumb = video && (video.thumbnail_url || video.thumbnail);
      if (!thumb) return;
      const url = toOrigUrl(thumb);
      if (!url || seen.has(url)) return;
      seen.add(url);
      photos.push({
        url,
        width: Number(video.width) || 0,
        height: Number(video.height) || 0,
        alt: "video thumbnail",
      });
    });
  }
  return photos;
}

function mapAuthor(author) {
  const src = author && typeof author === "object" ? author : {};
  const verification = src.verification || {};
  return {
    name: src.name || src.screen_name || "Unknown",
    screenName: src.screen_name || "",
    avatarUrl: upgradeAvatar(src.avatar_url || src.avatar || null),
    verified: Boolean(verification.verified || src.verified),
  };
}

export function mapTweet(raw, depth = 0) {
  if (!raw || typeof raw !== "object") return null;
  if (raw.type === "tombstone") return null;
  const id = String(raw.id || "");
  if (!id) return null;
  const quote = depth < 1 && raw.quote ? mapTweet(raw.quote, depth + 1) : null;
  return {
    id,
    url: raw.url || `https://x.com/i/status/${id}`,
    text: typeof raw.text === "string" ? raw.text : "",
    createdAt: raw.created_at || "",
    author: mapAuthor(raw.author),
    photos: asPhotos(raw.media),
    quote,
  };
}

function unwrapStatus(payload) {
  if (!payload || typeof payload !== "object") return null;
  return payload.status || payload.tweet || null;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  const data = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, data };
}

export async function fetchTweet(input) {
  const id = extractTweetId(input);
  if (!id) {
    const error = new Error("INVALID_URL");
    error.code = 400;
    error.key = "invalidUrl";
    throw error;
  }

  const endpoints = [
    `https://api.fxtwitter.com/2/status/${id}`,
    `https://api.fxtwitter.com/status/${id}`,
  ];

  let lastKind = "network";
  for (const url of endpoints) {
    try {
      const result = await fetchJson(url);
      if (!result.data) {
        lastKind = "upstream";
        continue;
      }
      const code = Number(result.data.code || result.status);
      const status = unwrapStatus(result.data);
      if (code === 404 || code === 401 || code === 403 || result.status === 404) {
        const error = new Error("TWEET_NOT_FOUND");
        error.code = 404;
        error.key = "notFound";
        throw error;
      }
      if (code >= 500) {
        lastKind = "upstream";
        continue;
      }
      if (!status || status.type === "tombstone") {
        const error = new Error("TWEET_NOT_FOUND");
        error.code = 404;
        error.key = "notFound";
        throw error;
      }
      const tweet = mapTweet(status);
      if (!tweet) {
        const error = new Error("TWEET_NOT_FOUND");
        error.code = 404;
        error.key = "notFound";
        throw error;
      }
      return tweet;
    } catch (err) {
      if (err && (err.code === 404 || err.code === 400)) throw err;
      lastKind = "network";
    }
  }

  const error = new Error("UPSTREAM_UNAVAILABLE");
  error.code = 502;
  error.key = lastKind === "network" ? "network" : "upstream";
  throw error;
}
