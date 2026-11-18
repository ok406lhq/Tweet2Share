import { test } from "node:test";
import assert from "node:assert/strict";
import { mapTweet, mapReplies, isAdReply, toOrigUrl } from "./mapTweet.js";

const sample = {
  type: "status",
  id: "20",
  url: "https://twitter.com/jack/status/20",
  text: "just setting up my twttr",
  created_at: "Tue Mar 21 20:50:14 +0000 2006",
  author: {
    name: "jack",
    screen_name: "jack",
    avatar_url: "https://pbs.twimg.com/profile_images/abc_normal.jpg",
    verification: { verified: true },
  },
  media: {
    photos: [
      {
        type: "photo",
        url: "https://pbs.twimg.com/media/aaa?format=jpg&name=small",
        width: 1200,
        height: 800,
        altText: "demo",
      },
      {
        type: "photo",
        url: "https://pbs.twimg.com/media/bbb?format=jpg&name=small",
        width: 800,
        height: 800,
      },
    ],
  },
  quote: {
    type: "status",
    id: "21",
    url: "https://twitter.com/biz/status/21",
    text: "quoted",
    created_at: "Tue Mar 21 21:00:00 +0000 2006",
    author: { name: "biz", screen_name: "biz", avatar_url: null },
    media: { photos: [] },
  },
};

test("maps author text photos and quote in order", () => {
  const tweet = mapTweet(sample);
  assert.equal(tweet.id, "20");
  assert.equal(tweet.author.screenName, "jack");
  assert.equal(tweet.author.verified, true);
  assert.equal(tweet.text, "just setting up my twttr");
  assert.equal(tweet.photos.length, 2);
  assert.match(tweet.photos[0].url, /name=orig/);
  assert.equal(tweet.photos[1].url.includes("bbb"), true);
  assert.equal(tweet.quote.id, "21");
  assert.equal(tweet.quote.text, "quoted");
});

test("upgrades twimg urls to orig", () => {
  assert.equal(
    toOrigUrl("https://pbs.twimg.com/media/x?format=jpg&name=small"),
    "https://pbs.twimg.com/media/x?format=jpg&name=orig"
  );
});

test("returns null for tombstone", () => {
  assert.equal(mapTweet({ type: "tombstone", id: "1" }), null);
});

function reply(overrides = {}) {
  return {
    type: "status",
    id: "100",
    text: "nice post",
    author: { name: "sam", screen_name: "sam", followers: 100 },
    media: { photos: [] },
    ...overrides,
  };
}

test("isAdReply skips promoted and promo-text replies", () => {
  assert.equal(isAdReply(reply()), false);
  assert.equal(isAdReply(reply({ promoted: true })), true);
  assert.equal(isAdReply(reply({ embed_card: "promo" })), true);
  assert.equal(isAdReply(reply({ text: "限时折扣 点击链接 https://shop.example" })), true);
  assert.equal(isAdReply(reply({ text: "use code SAVE20 now" })), true);
  assert.equal(
    isAdReply(
      reply({
        text: "buy now https://shop.example/item",
        author: { name: "bot", screen_name: "bot", followers: 3 },
      })
    ),
    true
  );
});

test("mapReplies keeps photo replies, drops ads, parent, and duplicates", () => {
  const replies = mapReplies(
    [
      reply({ id: "20", text: "self" }),
      reply({
        id: "101",
        text: "look",
        media: {
          photos: [{ type: "photo", url: "https://pbs.twimg.com/media/ccc?name=small", width: 400, height: 300 }],
        },
      }),
      reply({ id: "102", text: "affiliate deal t.me/spam" }),
      reply({
        id: "101",
        text: "look again",
      }),
      reply({ id: "103", text: "agreed" }),
    ],
    "20",
    2
  );
  assert.equal(replies.length, 2);
  const ids = replies.map((item) => item.id).sort();
  assert.deepEqual(ids, ["101", "103"]);
  const withPhoto = replies.find((item) => item.id === "101");
  assert.equal(withPhoto.photos.length, 1);
  assert.match(withPhoto.photos[0].url, /name=orig/);
});

test("drops gif and video media from photos", () => {
  const tweet = mapTweet({
    ...sample,
    media: {
      photos: [
        { type: "gif", url: "https://pbs.twimg.com/tweet_video_thumb/aaa?format=jpg", width: 400, height: 300 },
        { type: "photo", format: "gif", url: "https://pbs.twimg.com/media/bbb.gif", width: 400, height: 300 },
        { type: "photo", url: "https://pbs.twimg.com/media/ccc?format=jpg&name=small", width: 800, height: 600 },
      ],
      videos: [
        {
          type: "video",
          url: "https://video.twimg.com/ext_tw_video/1.mp4",
          thumbnail_url: "https://pbs.twimg.com/ext_tw_video_thumb/1.jpg",
          width: 1280,
          height: 720,
        },
      ],
    },
  });
  assert.equal(tweet.photos.length, 1);
  assert.match(tweet.photos[0].url, /ccc/);
});

test("mapReplies ranks by relevance instead of likes", () => {
  const now = Math.floor(Date.now() / 1000);
  const replies = mapReplies(
    [
      reply({ id: "201", text: "ok", likes: 900, replies: 0, reposts: 0, created_timestamp: now - 3600 * 400 }),
      reply({
        id: "202",
        text: "This is a detailed reply about the original post.",
        likes: 12,
        replies: 8,
        reposts: 3,
        created_timestamp: now - 3600,
      }),
    ],
    "20",
    2
  );
  assert.equal(replies[0].id, "202");
  assert.equal(replies[1].id, "201");
});
