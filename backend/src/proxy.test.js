import { test } from "node:test";
import assert from "node:assert/strict";
import { isAllowedImageUrl } from "./proxy.js";

test("allows twimg https hosts", () => {
  assert.equal(isAllowedImageUrl("https://pbs.twimg.com/media/abc.jpg"), true);
  assert.equal(isAllowedImageUrl("https://abs.twimg.com/sticky/a.png"), true);
});

test("rejects other hosts and http", () => {
  assert.equal(isAllowedImageUrl("https://evil.example/a.png"), false);
  assert.equal(isAllowedImageUrl("http://pbs.twimg.com/media/abc.jpg"), false);
  assert.equal(isAllowedImageUrl("not-a-url"), false);
});
