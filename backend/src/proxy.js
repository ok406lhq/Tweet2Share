const ALLOWED_HOST_SUFFIXES = ["twimg.com", "sinaimg.cn"];

export function isAllowedImageUrl(raw) {
  if (!raw || typeof raw !== "string") return false;
  let url;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  const host = url.hostname.toLowerCase();
  return ALLOWED_HOST_SUFFIXES.some((suffix) => host === suffix || host.endsWith(`.${suffix}`));
}

export async function proxyImage(rawUrl, res) {
  if (!isAllowedImageUrl(rawUrl)) {
    res.status(400).json({ error: "INVALID_IMAGE_HOST" });
    return;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);

  try {
    const host = new URL(rawUrl).hostname.toLowerCase();
    const headers = {
      Accept: "image/*,*/*",
      "User-Agent": "Tweet2Share/1.0",
    };
    if (host === "sinaimg.cn" || host.endsWith(".sinaimg.cn")) {
      headers.Referer = "https://m.weibo.cn/";
    }

    const upstream = await fetch(rawUrl, {
      method: "GET",
      headers,
      signal: controller.signal,
      redirect: "follow",
    });

    if (!upstream.ok) {
      res.status(502).json({ error: "IMAGE_FETCH_FAILED" });
      return;
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    if (!contentType.startsWith("image/") && contentType !== "application/octet-stream") {
      res.status(400).json({ error: "NOT_AN_IMAGE" });
      return;
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("Access-Control-Allow-Origin", "*");

    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.send(buffer);
  } catch {
    res.status(502).json({ error: "IMAGE_FETCH_FAILED" });
  } finally {
    clearTimeout(timer);
  }
}
