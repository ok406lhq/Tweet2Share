const ALLOWED_PATHS = new Set([
  "/statuses/show",
  "/statuses/extend",
  "/comments/hotflow",
  "/api/statuses/show",
]);

const WEIBO_HEADERS = {
  Accept: "application/json,text/plain,*/*",
  "User-Agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
  Referer: "https://m.weibo.cn/",
  "X-Requested-With": "XMLHttpRequest",
};

function allowOrigin(origin) {
  if (!origin) return "";
  try {
    const host = new URL(origin).hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1") return origin;
    if (host.endsWith(".github.io")) return origin;
    if (host.endsWith(".monkeycode-ai.online")) return origin;
    if (host.endsWith(".pages.dev") || host.endsWith(".workers.dev")) return origin;
  } catch {
    return "";
  }
  return "";
}

function corsHeaders(origin) {
  const allowed = allowOrigin(origin);
  const headers = {
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Accept, Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  if (allowed) headers["Access-Control-Allow-Origin"] = allowed;
  return headers;
}

function jsonResponse(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...corsHeaders(origin),
    },
  });
}

export default {
  async fetch(request) {
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== "GET") {
      return jsonResponse({ error: "METHOD_NOT_ALLOWED" }, 405, origin);
    }

    const url = new URL(request.url);
    if (url.pathname === "/" || url.pathname === "/health") {
      return jsonResponse({ ok: true, service: "tweet2share-weibo" }, 200, origin);
    }
    if (!ALLOWED_PATHS.has(url.pathname)) {
      return jsonResponse({ error: "NOT_FOUND" }, 404, origin);
    }

    const target = `https://m.weibo.cn${url.pathname}${url.search}`;
    try {
      const upstream = await fetch(target, {
        method: "GET",
        headers: WEIBO_HEADERS,
      });
      const text = await upstream.text();
      return new Response(text, {
        status: upstream.status,
        headers: {
          "Content-Type": upstream.headers.get("Content-Type") || "application/json; charset=utf-8",
          "Cache-Control": "no-store",
          ...corsHeaders(origin),
        },
      });
    } catch {
      return jsonResponse({ error: "UPSTREAM_UNAVAILABLE" }, 502, origin);
    }
  },
};
