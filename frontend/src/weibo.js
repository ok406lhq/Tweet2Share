const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

const WEIBO_HOSTS = new Set([
  "weibo.com",
  "www.weibo.com",
  "m.weibo.com",
  "weibo.cn",
  "www.weibo.cn",
  "m.weibo.cn",
]);

const PATH_SKIP = new Set(["u", "n", "p", "tv", "login", "signup", "ajax", "api", "ttarticle", "q"]);

const AD_TEXT =
  /促销|优惠券|限时折扣|限时特惠|免费领取|加微信|加v[:：]|私信领取|点击链接|立即购买|买一送|affiliate|promo code|use code|limited offer|\bdm me\b|join telegram|t\.me\/|airdrop|返佣|注册即送|兼职日结|earn \$\$|onlyfans\.com/i;

function fail(key, code, message) {
  const error = new Error(message);
  error.code = code;
  error.key = key;
  return error;
}

function normalizeHost(hostname) {
  return String(hostname || "")
    .trim()
    .toLowerCase()
    .replace(/\.$/, "");
}

function toBase62(n) {
  let value = BigInt(n);
  if (value === 0n) return "0";
  let out = "";
  while (value > 0n) {
    out = ALPHABET[Number(value % 62n)] + out;
    value /= 62n;
  }
  return out;
}

function fromBase62(text) {
  let n = 0n;
  for (const ch of String(text || "")) {
    const i = ALPHABET.indexOf(ch);
    if (i < 0) return null;
    n = n * 62n + BigInt(i);
  }
  return n;
}

export function midToBid(mid) {
  const str = String(mid || "");
  if (!/^\d{10,20}$/.test(str)) return null;
  const chunks = [];
  for (let i = str.length; i > 0; i -= 7) {
    chunks.unshift(str.slice(Math.max(0, i - 7), i));
  }
  return chunks
    .map((chunk, index) => {
      const enc = toBase62(chunk);
      return index === 0 ? enc : enc.padStart(4, "0");
    })
    .join("");
}

export function bidToMid(bid) {
  const str = String(bid || "");
  if (!/^[A-Za-z0-9]{6,12}$/.test(str) || !/[A-Za-z]/.test(str)) return null;
  const chunks = [];
  for (let i = str.length; i > 0; i -= 4) {
    chunks.unshift(str.slice(Math.max(0, i - 4), i));
  }
  const mid = chunks
    .map((chunk, index) => {
      const n = fromBase62(chunk);
      if (n === null) return null;
      const digits = n.toString();
      return index === 0 ? digits : digits.padStart(7, "0");
    })
    .join("");
  return /^\d{10,20}$/.test(mid) ? mid : null;
}

function isMid(value) {
  return /^\d{10,20}$/.test(String(value || ""));
}

function isBid(value) {
  const str = String(value || "");
  return /^[A-Za-z0-9]{6,12}$/.test(str) && /[A-Za-z]/.test(str);
}

function refFromId(value) {
  const text = String(value || "");
  if (isMid(text)) return { mid: text, bid: midToBid(text) };
  if (isBid(text)) {
    const mid = bidToMid(text);
    if (!mid) return null;
    return { mid, bid: text };
  }
  return null;
}

export function extractWeiboRef(input, options = {}) {
  const raw = String(input || "").trim();
  if (!raw) return null;
  if (isBid(raw) || (options.allowBareId && isMid(raw))) return refFromId(raw);

  let text = raw.replace(/^@/, "");
  if (!/^https?:\/\//i.test(text)) text = `https://${text}`;

  let url;
  try {
    url = new URL(text);
  } catch {
    return null;
  }

  const host = normalizeHost(url.hostname);
  if (!WEIBO_HOSTS.has(host)) return null;

  const queryId = url.searchParams.get("id") || url.searchParams.get("mid");
  if (queryId) {
    const fromQuery = refFromId(queryId);
    if (fromQuery) return fromQuery;
  }

  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length === 0) return null;

  const first = parts[0].toLowerCase();
  if (first === "detail" || first === "status" || first === "statuses") {
    return refFromId(parts[1]);
  }
  if (PATH_SKIP.has(first)) return null;
  if (parts[1] && isBid(parts[1])) {
    const parsed = refFromId(parts[1]);
    if (parsed) {
      parsed.uid = parts[0];
      return parsed;
    }
  }
  return null;
}

export function stripWeiboHtml(html) {
  if (!html) return "";
  let text = String(html);
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<span class="url-icon">[\s\S]*?<\/span>/gi, "");
  text = text.replace(/<img[^>]*>/gi, "");
  text = text.replace(/<\/?a[^>]*>/gi, "");
  text = text.replace(/<[^>]+>/g, "");
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
  text = text.replace(/\u200b/g, "");
  return text.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function isAnimatedOrVideoUrl(url) {
  const value = String(url || "").toLowerCase();
  if (!value) return true;
  if (/\.gif(?:$|\?)/.test(value)) return true;
  return /\/gif\/|livephoto|video\.sina/.test(value);
}

function toLargeSina(url) {
  if (!url || typeof url !== "string") return url;
  return url.replace(/\/(?:orj\d+|thumb\d+|bmiddle|mw\d+|small|square|thumbnail)\//, "/large/");
}

function picUrl(item) {
  if (!item || typeof item !== "object") return "";
  const large = item.large && typeof item.large === "object" ? item.large : {};
  return large.url || item.original?.url || item.url || "";
}

function picSize(item) {
  const geo = (item && item.large && item.large.geo) || (item && item.geo) || {};
  return {
    width: Number(geo.width) || 0,
    height: Number(geo.height) || 0,
  };
}

function asPicList(status) {
  if (!status || typeof status !== "object") return [];
  if (Array.isArray(status.pics)) return status.pics;
  if (status.pics && typeof status.pics === "object") return Object.values(status.pics);
  if (status.pic_infos && typeof status.pic_infos === "object") {
    const ids = Array.isArray(status.pic_ids) ? status.pic_ids : Object.keys(status.pic_infos);
    return ids.map((id) => status.pic_infos[id]).filter(Boolean);
  }
  return [];
}

function asPhotos(status) {
  const photos = [];
  const seen = new Set();
  for (const item of asPicList(status)) {
    const type = String(item.type || item.pic_type || "").toLowerCase();
    if (type === "gif" || type === "video" || type === "livephoto") continue;
    const url = toLargeSina(picUrl(item));
    if (!url || seen.has(url) || isAnimatedOrVideoUrl(url)) continue;
    seen.add(url);
    const size = picSize(item);
    photos.push({ url, width: size.width, height: size.height, alt: "" });
  }
  if (photos.length === 0 && status.original_pic && !isAnimatedOrVideoUrl(status.original_pic)) {
    photos.push({ url: toLargeSina(status.original_pic), width: 0, height: 0, alt: "" });
  }
  return photos;
}

function upgradeAvatar(url) {
  if (!url || typeof url !== "string") return null;
  return url.replace(/\/(?:50|30|180)\//, "/orj480/");
}

function mapAuthor(user) {
  const src = user && typeof user === "object" ? user : {};
  const name = src.screen_name || src.name || "Unknown";
  return {
    name,
    screenName: name,
    avatarUrl: upgradeAvatar(src.avatar_hd || src.avatar_large || src.profile_image_url || null),
    verified: Boolean(src.verified),
  };
}

function statusText(status) {
  if (!status || typeof status !== "object") return "";
  if (typeof status.text_raw === "string" && status.text_raw.trim()) return status.text_raw;
  return stripWeiboHtml(status.text || status.longTextContent || "");
}

function canonicalUrl(status, ref) {
  const bid = status.bid || (ref && ref.bid) || midToBid(status.id || status.mid);
  const uid = status.user && (status.user.idstr || status.user.id);
  if (uid && bid) return `https://weibo.com/${uid}/${bid}`;
  const mid = String(status.mid || status.id || (ref && ref.mid) || "");
  return mid ? `https://m.weibo.cn/detail/${mid}` : "";
}

export function mapWeiboStatus(status, depth = 0, ref = null) {
  if (!status || typeof status !== "object") return null;
  const id = String(status.mid || status.id || "");
  if (!id) return null;
  const quote =
    depth < 1 && status.retweeted_status ? mapWeiboStatus(status.retweeted_status, depth + 1, null) : null;
  return {
    id,
    url: canonicalUrl(status, ref),
    text: statusText(status),
    createdAt: status.created_at || "",
    author: mapAuthor(status.user),
    photos: asPhotos(status),
    quote,
    replies: [],
    platform: "weibo",
  };
}

function commentPhotos(comment) {
  const pic = comment && comment.pic;
  if (!pic || typeof pic !== "object") return [];
  const url = toLargeSina(picUrl(pic));
  if (!url || isAnimatedOrVideoUrl(url)) return [];
  const size = picSize(pic);
  return [{ url, width: size.width, height: size.height, alt: "" }];
}

function isAdWeiboComment(comment) {
  if (!comment || typeof comment !== "object") return true;
  if (comment.mark === "ad" || comment.ad_type || comment.item_category === "ad") return true;
  const text = statusText(comment);
  if (AD_TEXT.test(text)) return true;
  const urls = text.match(/https?:\/\/\S+/gi) || [];
  if (urls.length >= 3) return true;
  const followers = Number(comment.user && comment.user.followers_count) || 0;
  if (followers < 20 && urls.length >= 1 && /shop|store|buy now|discount|优惠|购买|代购/i.test(text)) return true;
  return false;
}

function weiboRelevance(comment) {
  const likes = Number(comment && comment.like_count) || 0;
  const nested = Array.isArray(comment && comment.comments) ? comment.comments.length : 0;
  const ts = Date.parse((comment && comment.created_at) || "");
  const ageHours = Number.isFinite(ts) ? Math.max(0, Date.now() - ts) / 3600000 : 24 * 14;
  const recency = 1 / (1 + ageHours / 48);
  const textLen = statusText(comment).trim().length;
  const substance = Math.min(textLen, 280) / 80;
  const photos = commentPhotos(comment).length ? 1.4 : 1;
  return ((likes * 0.35 + nested * 3) * recency + substance) * photos;
}

function mapComment(comment) {
  if (!comment || typeof comment !== "object") return null;
  const id = String(comment.id || comment.mid || "");
  if (!id) return null;
  return {
    id,
    url: "",
    text: statusText(comment),
    createdAt: comment.created_at || "",
    author: mapAuthor(comment.user),
    photos: commentPhotos(comment),
    quote: null,
    replies: [],
    platform: "weibo",
  };
}

export function mapWeiboComments(list, parentId, limit = 40) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const candidates = [];
  for (const raw of list) {
    if (isAdWeiboComment(raw)) continue;
    const id = String((raw && (raw.id || raw.mid)) || "");
    if (!id || id === String(parentId || "")) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    candidates.push(raw);
  }
  candidates.sort((a, b) => weiboRelevance(b) - weiboRelevance(a));
  return candidates
    .slice(0, limit)
    .map((raw) => mapComment(raw))
    .filter(Boolean);
}

function weiboProxyBase() {
  const raw = String(import.meta.env.VITE_WEIBO_PROXY || "").trim().replace(/\/+$/, "");
  if (!raw) return "";
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return "";
    return parsed.origin;
  } catch {
    return "";
  }
}

async function fetchJson(url) {
  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  const data = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, data };
}

function unwrapStatus(payload) {
  if (!payload || typeof payload !== "object") return null;
  if (payload.ok === 0) return null;
  const status = payload.data && payload.data.id ? payload.data : payload;
  return status && status.id ? status : null;
}

async function fetchViaLocalParse(ref) {
  const response = await fetch("/api/parse", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ url: `https://m.weibo.cn/detail/${ref.mid}` }),
  });
  const payload = await response.json().catch(() => null);
  const isJson = payload && typeof payload === "object";
  if (response.ok && isJson && payload.tweet) return payload.tweet;
  if (isJson && response.status === 400) throw fail("invalidUrl", 400, "INVALID_URL");
  if (isJson && response.status === 404) throw fail("notFound", 404, "TWEET_NOT_FOUND");
  if (isJson && response.status >= 500) throw fail("upstream", 502, "UPSTREAM_UNAVAILABLE");
  return null;
}

async function fetchViaProxy(ref, base) {
  const show = await fetchJson(`${base}/statuses/show?id=${encodeURIComponent(ref.mid)}`);
  const status = unwrapStatus(show.data);
  if (!status) {
    if (show.status === 404) throw fail("notFound", 404, "TWEET_NOT_FOUND");
    throw fail("upstream", 502, "UPSTREAM_UNAVAILABLE");
  }
  if (status.isLongText) {
    try {
      const extra = await fetchJson(`${base}/statuses/extend?id=${encodeURIComponent(ref.mid)}`);
      const longText = extra.data && extra.data.data && extra.data.data.longTextContent;
      if (typeof longText === "string" && longText.trim()) status.text = longText;
    } catch {
    }
  }
  const tweet = mapWeiboStatus(status, 0, ref);
  if (!tweet) throw fail("notFound", 404, "TWEET_NOT_FOUND");
  try {
    const hot = await fetchJson(
      `${base}/comments/hotflow?id=${encodeURIComponent(ref.mid)}&mid=${encodeURIComponent(ref.mid)}&max_id_type=0`
    );
    const list = hot.data && hot.data.data && hot.data.data.data;
    tweet.replies = mapWeiboComments(list, tweet.id);
  } catch {
    tweet.replies = [];
  }
  return tweet;
}

function onGitHubPages() {
  return typeof location !== "undefined" && /github\.io$/i.test(location.hostname);
}

export async function fetchWeibo(input, options = {}) {
  const ref = extractWeiboRef(input, options);
  if (!ref) throw fail("invalidUrl", 400, "INVALID_URL");

  try {
    const tweet = await fetchViaLocalParse(ref);
    if (tweet) return tweet;
  } catch (err) {
    if (err && err.key) throw err;
  }

  const proxy = weiboProxyBase();
  if (proxy) {
    try {
      return await fetchViaProxy(ref, proxy);
    } catch (err) {
      if (err && err.key) throw err;
      throw fail("upstream", 502, "UPSTREAM_UNAVAILABLE");
    }
  }

  if (onGitHubPages()) throw fail("weiboPages", 502, "WEIBO_PAGES_UNAVAILABLE");
  throw fail("network", 502, "UPSTREAM_UNAVAILABLE");
}
