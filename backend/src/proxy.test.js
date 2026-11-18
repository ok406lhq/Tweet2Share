import { test } from "node:test";
import assert from "node:assert/strict";
import { isAllowedImageUrl } from "./proxy.js";

test("allows twimg https hosts", () => {
  assert.equal(isAllowedImageUrl("https://pbs.twimg.com/media/abc.jpg"), true);
  assert.equal(isAllowedImageUrl("https://abs.twimg.com/sticky/a.png"), true);
});

test("allows sinaimg https hosts", () => {
  assert.equal(isAllowedImageUrl("https://wx3.sinaimg.cn/large/008GO5Acly1i8sxvzih5fj30qo14211m.jpg"), true);
  assert.equal(isAllowedImageUrl("https://tvax4.sinaimg.cn/crop.0.0.1080.1080.180/x.jpg"), true);
});

test("rejects other hosts and http", () => {
  assert.equal(isAllowedImageUrl("https://evil.example/a.png"), false);
  assert.equal(isAllowedImageUrl("http://pbs.twimg.com/media/abc.jpg"), false);
  assert.equal(isAllowedImageUrl("https://i0.wp.com/wx3.sinaimg.cn/large/x.jpg"), false);
  assert.equal(isAllowedImageUrl("not-a-url"), false);
});
