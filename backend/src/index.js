import express from "express";
import { extractTweetId } from "./parseUrl.js";
import { fetchTweetById } from "./fetchTweet.js";
import { mapTweet } from "./mapTweet.js";
import { proxyImage } from "./proxy.js";

const PORT = Number(process.env.PORT) || 3001;
const app = express();

app.use(express.json({ limit: "32kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "tweet2share" });
});

app.post("/api/parse", async (req, res) => {
  const url = req.body && req.body.url;
  const id = extractTweetId(url);
  if (!id) {
    res.status(400).json({ error: "INVALID_URL", message: "请粘贴有效的 X / Twitter 推文链接" });
    return;
  }

  try {
    const raw = await fetchTweetById(id);
    const tweet = mapTweet(raw);
    if (!tweet) {
      res.status(404).json({ error: "TWEET_NOT_FOUND", message: "无法获取该公开推文" });
      return;
    }
    res.json({ tweet });
  } catch (err) {
    if (err && err.code === 404) {
      res.status(404).json({ error: "TWEET_NOT_FOUND", message: "无法获取该公开推文" });
      return;
    }
    res.status(502).json({ error: "UPSTREAM_UNAVAILABLE", message: "解析服务暂时不可用" });
  }
});

app.get("/api/proxy", async (req, res) => {
  await proxyImage(req.query.url, res);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Tweet2Share API listening on ${PORT}`);
});
