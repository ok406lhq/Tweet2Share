import { test } from "node:test";
import assert from "node:assert/strict";
import {
  bidToMid,
  extractWeiboRef,
  isAdWeiboComment,
  mapWeiboComments,
  mapWeiboStatus,
  midToBid,
  stripWeiboHtml,
  toLargeSina,
} from "./weibo.js";

test("converts mid and bid with 7-digit groups", () => {
  assert.equal(midToBid("5249718969175092"), "QkRpSCuRm");
  assert.equal(bidToMid("QkRpSCuRm"), "5249718969175092");
});

test("extracts weibo urls and bids, ignores bare tweet ids", () => {
  assert.equal(extractWeiboRef("https://weibo.com/7961606632/QkRpSCuRm").mid, "5249718969175092");
  assert.equal(extractWeiboRef("https://m.weibo.cn/detail/5249718969175092").mid, "5249718969175092");
  assert.equal(extractWeiboRef("m.weibo.cn/status/5249718969175092").bid, "QkRpSCuRm");
  assert.equal(extractWeiboRef("QkRpSCuRm").mid, "5249718969175092");
  assert.equal(extractWeiboRef("5249718969175092"), null);
  assert.equal(extractWeiboRef("5249718969175092", { allowBareId: true }).mid, "5249718969175092");
  assert.equal(extractWeiboRef("https://x.com/jack/status/20"), null);
  assert.equal(extractWeiboRef("20"), null);
});

test("strips weibo html and keeps line breaks", () => {
  const html =
    '<a href="https://m.weibo.cn/p/index"><span class="url-icon"><img src="x.png"></span><span class="surl-text">超话</span></a>正文第一行<br />第二行';
  assert.equal(stripWeiboHtml(html), "超话正文第一行\n第二行");
});

test("upgrades sinaimg thumbs to large", () => {
  assert.equal(
    toLargeSina("https://wx3.sinaimg.cn/orj360/008GO5Acly1i8sxvzih5fj30qo14211m.jpg"),
    "https://wx3.sinaimg.cn/large/008GO5Acly1i8sxvzih5fj30qo14211m.jpg"
  );
  assert.equal(
    toLargeSina("https://wx3.sinaimg.cn/mw2000/008GO5Acly1i8sxvzih5fj30qo14211m.jpg"),
    "https://wx3.sinaimg.cn/large/008GO5Acly1i8sxvzih5fj30qo14211m.jpg"
  );
});

const sampleStatus = {
  id: "5249718969175092",
  mid: "5249718969175092",
  bid: "QkRpSCuRm",
  created_at: "Wed Dec 31 01:00:00 +0800 2025",
  text: "第一行<br />第二行",
  user: {
    id: 7961606632,
    screen_name: "白兔猫",
    avatar_hd: "https://wx4.sinaimg.cn/orj480/008GO5Acly8iigxtfx3w2j30u00u00v3.jpg",
    verified: true,
  },
  pics: [
    {
      pid: "008GO5Acly1i8sxvzih5fj30qo14211m",
      url: "https://wx3.sinaimg.cn/orj360/008GO5Acly1i8sxvzih5fj30qo14211m.jpg",
      large: {
        url: "https://wx3.sinaimg.cn/mw2000/008GO5Acly1i8sxvzih5fj30qo14211m.jpg",
        geo: { width: "960", height: "1442" },
      },
    },
    {
      type: "gif",
      url: "https://wx3.sinaimg.cn/large/anim.gif",
      large: { url: "https://wx3.sinaimg.cn/large/anim.gif" },
    },
  ],
  retweeted_status: {
    id: "111",
    mid: "111",
    bid: "abc",
    text: "转发原文",
    user: { screen_name: "别人", profile_image_url: "https://tvax1.sinaimg.cn/crop.0.0.100.100.50/x.jpg" },
    pics: [],
  },
};

test("maps weibo status text photos quote and drops gif", () => {
  const post = mapWeiboStatus(sampleStatus);
  assert.equal(post.platform, "weibo");
  assert.equal(post.id, "5249718969175092");
  assert.equal(post.url, "https://weibo.com/7961606632/QkRpSCuRm");
  assert.equal(post.text, "第一行\n第二行");
  assert.equal(post.author.name, "白兔猫");
  assert.equal(post.author.verified, true);
  assert.equal(post.photos.length, 1);
  assert.match(post.photos[0].url, /\/large\//);
  assert.equal(post.quote.text, "转发原文");
});

test("filters ad comments and ranks by relevance", () => {
  assert.equal(isAdWeiboComment({ text: "好看", user: { screen_name: "a", followers_count: 80 } }), false);
  assert.equal(isAdWeiboComment({ text: "限时折扣 点击链接 https://shop.example", user: {} }), true);

  const now = new Date().toUTCString();
  const comments = mapWeiboComments(
    [
      { id: "1", text: "ok", like_count: 900, created_at: "Wed Dec 31 01:00:00 +0800 2020", user: { screen_name: "old" } },
      {
        id: "2",
        text: "这是一条更具体的讨论，补充了原帖细节。",
        like_count: 9,
        created_at: now,
        user: { screen_name: "new" },
        comments: [{ id: "x" }, { id: "y" }],
      },
      { id: "3", text: "affiliate deal t.me/spam", user: { screen_name: "ad" } },
    ],
    "5249718969175092",
    2
  );
  assert.equal(comments.length, 2);
  assert.equal(comments[0].id, "2");
  assert.equal(comments[0].platform, "weibo");
});
