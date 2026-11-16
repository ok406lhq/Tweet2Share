import { test } from "node:test";
import assert from "node:assert/strict";
import { mapTweet, toOrigUrl } from "./mapTweet.js";

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
