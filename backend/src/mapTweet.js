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

  if (Array.isArray(media.photos)) {
    media.photos.forEach(pushPhoto);
  }

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

export { toOrigUrl, upgradeAvatar };
