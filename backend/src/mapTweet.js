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

function isAnimatedOrVideoUrl(url) {
  const value = String(url || "").toLowerCase();
  if (!value) return true;
  if (/\.gif(?:$|\?)/.test(value)) return true;
  if (/format=(gif|mp4|webm)/.test(value)) return true;
  return /tweet_gif|tweet_video|ext_tw_video|amplify_video|video\.twimg|animated_gif/.test(value);
}

function isStaticPhoto(item) {
  if (!item || typeof item !== "object") return false;
  const type = String(item.type || "").toLowerCase();
  if (type && type !== "photo") return false;
  const format = String(item.format || "").toLowerCase();
  if (format && format !== "jpg" && format !== "jpeg" && format !== "png" && format !== "webp") return false;
  if (isAnimatedOrVideoUrl(item.url)) return false;
  return true;
}

function asPhotos(media) {
  if (!media || typeof media !== "object") return [];
  const photos = [];
  const seen = new Set();

  const pushPhoto = (item) => {
    if (!isStaticPhoto(item)) return;
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
    media.all.forEach(pushPhoto);
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
    replies: [],
    platform: "x",
  };
}

const AD_TEXT =
  /促销|优惠券|限时折扣|限时特惠|免费领取|加微信|加v[:：]|私信领取|点击链接|立即购买|买一送|affiliate|promo code|use code|limited offer|\bdm me\b|join telegram|t\.me\/|airdrop|返佣|注册即送|兼职日结|earn \$\$|onlyfans\.com/i;

export function isAdReply(raw) {
  if (!raw || typeof raw !== "object") return true;
  if (raw.type && raw.type !== "status") return true;
  if (raw.promoted || raw.is_promoted || raw.ad || raw.promoted_metadata) return true;
  const card = String(raw.embed_card || "").toLowerCase();
  if (card.includes("promo") || card.includes("advert") || card === "ad") return true;
  const text = String(raw.text || "");
  if (AD_TEXT.test(text)) return true;
  const urls = text.match(/https?:\/\/\S+/gi) || [];
  if (urls.length >= 3) return true;
  const followers = Number(raw.author && raw.author.followers) || 0;
  if (followers < 20 && urls.length >= 1 && /shop|store|buy now|discount|优惠|购买|代购/i.test(text)) return true;
  return false;
}

function relevanceScore(raw) {
  const likes = Number(raw && raw.likes) || 0;
  const replies = Number(raw && raw.replies) || 0;
  const reposts = Number(raw && raw.reposts) || 0;
  const views = Number(raw && raw.views) || 0;
  const ts = Number(raw && raw.created_timestamp) || 0;
  const ageHours = ts ? Math.max(0, Date.now() / 1000 - ts) / 3600 : 24 * 14;
  const recency = 1 / (1 + ageHours / 48);
  const textLen = String((raw && raw.text) || "").trim().length;
  const substance = Math.min(textLen, 280) / 80;
  const photos = asPhotos(raw && raw.media).length ? 1.4 : 1;
  return ((likes * 0.35 + replies * 3 + reposts * 2 + Math.min(views, 80000) / 800) * recency + substance) * photos;
}

export function mapReplies(list, parentId, limit = 40) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const candidates = [];
  for (const raw of list) {
    if (isAdReply(raw)) continue;
    const id = String((raw && raw.id) || "");
    if (!id || id === String(parentId || "")) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    candidates.push(raw);
  }
  candidates.sort((a, b) => relevanceScore(b) - relevanceScore(a));
  return candidates
    .slice(0, limit)
    .map((raw) => mapTweet(raw, 1))
    .filter(Boolean);
}

export { toOrigUrl, upgradeAvatar };
