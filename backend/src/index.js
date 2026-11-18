import express from "express";
import { extractTweetId } from "./parseUrl.js";
import { fetchTweetById } from "./fetchTweet.js";
import { mapTweet, mapReplies } from "./mapTweet.js";
import { extractWeiboRef, fetchWeiboPost } from "./weibo.js";
import { proxyImage } from "./proxy.js";

const PORT = Number(process.env.PORT) || 3001;
const app = express();

app.use(express.json({ limit: "32kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "tweet2share" });
});

app.post("/api/parse", async (req, res) => {
  const url = req.body && req.body.url;
  const weiboRef = extractWeiboRef(url);
  const id = extractTweetId(url);

  if (!weiboRef && !id) {
    res.status(400).json({ error: "INVALID_URL", message: "请粘贴有效的 X / Twitter 或微博链接" });
    return;
  }

  try {
    if (weiboRef) {
      const tweet = await fetchWeiboPost(weiboRef);
      if (!tweet) {
        res.status(404).json({ error: "TWEET_NOT_FOUND", message: "无法获取该公开微博" });
        return;
      }
      res.json({ tweet });
      return;
    }

    const raw = await fetchTweetById(id);
    const tweet = mapTweet(raw);
    if (!tweet) {
      res.status(404).json({ error: "TWEET_NOT_FOUND", message: "无法获取该公开推文" });
      return;
    }
    tweet.replies = mapReplies(raw._replies, tweet.id);
    res.json({ tweet });
  } catch (err) {
    if (err && err.code === 404) {
      res.status(404).json({ error: "TWEET_NOT_FOUND", message: "无法获取该公开帖子" });
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
