import { test } from "node:test";
import assert from "node:assert/strict";
import { extractTweetId } from "./parseUrl.js";

test("extracts id from x.com status url", () => {
  assert.equal(
    extractTweetId("https://x.com/jack/status/20"),
    "20"
  );
});

test("extracts id from twitter.com url without protocol", () => {
  assert.equal(
    extractTweetId("twitter.com/jack/status/20?s=20"),
    "20"
  );
});

test("extracts id from fxtwitter and fixupx mirrors", () => {
  assert.equal(extractTweetId("https://fxtwitter.com/jack/status/20"), "20");
  assert.equal(extractTweetId("https://fixupx.com/jack/status/20"), "20");
  assert.equal(extractTweetId("https://vxtwitter.com/jack/status/20"), "20");
});

test("accepts bare numeric id", () => {
  assert.equal(extractTweetId("1234567890123456789"), "1234567890123456789");
});

test("rejects empty and unrelated urls", () => {
  assert.equal(extractTweetId(""), null);
  assert.equal(extractTweetId("   "), null);
  assert.equal(extractTweetId("https://example.com/status/20"), null);
  assert.equal(extractTweetId("not a url"), null);
});
