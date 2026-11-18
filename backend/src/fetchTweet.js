const FXTWITTER_CONVO = "https://api.fxtwitter.com/2/conversation/";
const FXTWITTER_V2 = "https://api.fxtwitter.com/2/status/";
const FXTWITTER_V1 = "https://api.fxtwitter.com/status/";
const TIMEOUT_MS = 15000;

async function requestJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "Tweet2Share/1.0",
      },
      signal: controller.signal,
    });
    const data = await response.json().catch(() => null);
    return { ok: response.ok, status: response.status, data };
  } finally {
    clearTimeout(timer);
  }
}

function unwrapStatus(payload) {
  if (!payload || typeof payload !== "object") return null;
  return payload.status || payload.tweet || null;
}

function unwrapReplies(payload) {
  if (!payload || typeof payload !== "object") return [];
  if (Array.isArray(payload.replies)) return payload.replies;
  return [];
}

export async function fetchTweetById(id) {
  const endpoints = [
    `${FXTWITTER_CONVO}${id}`,
    `${FXTWITTER_V2}${id}`,
    `${FXTWITTER_V1}${id}`,
  ];
  let lastError = null;

  for (const url of endpoints) {
    const isConversation = url.includes("/conversation/");
    try {
      const result = await requestJson(url);
      if (!result.data) {
        lastError = { kind: "upstream", status: result.status };
        continue;
      }

      const code = Number(result.data.code || result.status);
      const status = unwrapStatus(result.data);

      if (code === 404 || result.status === 404 || code === 401 || code === 403) {
        if (isConversation) {
          lastError = { kind: "upstream", status: code || result.status };
          continue;
        }
        const error = new Error("TWEET_NOT_FOUND");
        error.code = 404;
        throw error;
      }

      if (code >= 500) {
        lastError = { kind: "upstream", status: code };
        continue;
      }

      if (!status || status.type === "tombstone") {
        if (isConversation) {
          lastError = { kind: "upstream", status: code };
          continue;
        }
        const error = new Error("TWEET_NOT_FOUND");
        error.code = 404;
        throw error;
      }

      status._replies = unwrapReplies(result.data);
      return status;
    } catch (err) {
      if (err && err.code === 404) throw err;
      if (err && err.name === "AbortError") {
        lastError = { kind: "timeout" };
        continue;
      }
      lastError = { kind: "network", cause: err };
    }
  }

  const error = new Error("UPSTREAM_UNAVAILABLE");
  error.code = 502;
  error.detail = lastError;
  throw error;
}
