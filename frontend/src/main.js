import "./style.css";
import { extractTweetId, fetchTweet } from "./tweet.js";
import { extractWeiboRef, fetchWeibo } from "./weibo.js";

const PAGE_HEIGHT = 2000;
const SAMPLE_URLS = {
  x: "https://x.com/jack/status/20",
  weibo: "https://weibo.com/7961606632/QkRpSCuRm",
};

const TREATMENTS = [
  { id: "paper", label: "Paper", note: "浅色卡片" },
  { id: "midnight", label: "Midnight", note: "深色卡片" },
  { id: "editorial", label: "Editorial", note: "衬线排版" },
  { id: "outline", label: "Outline", note: "描边卡片" },
];

const BACKGROUNDS = [
  { id: "mist", label: "Mist" },
  { id: "lilac", label: "Lilac" },
  { id: "peach", label: "Peach" },
  { id: "sand", label: "Sand" },
  { id: "dusk", label: "Dusk" },
  { id: "clear", label: "Clear" },
];

const FONTS = [
  { id: "sans", label: "Sans" },
  { id: "grotesk", label: "Grotesk" },
  { id: "serif", label: "Georgia" },
];

const CREDIT = "anomo";
const REPO_URL = "https://github.com/ok406lhq/Tweet2Share";

const I18N = {
  zh: {
    docTitle: "Tweet2Share — 把推文变成可分享的图文",
    chipFree: "免费 · 无需登录",
    chipClean: "无水印",
    chipLink: "X / 微博链接",
    kicker: "从一条链接到可分享的图",
    heroTitle: "把帖子变成图片。保留原文，给它空间。",
    heroLead: "粘贴公开的 X 或微博链接，保留作者与来源，选择一种仍然好读的设计，然后导出 PNG。",
    importLabel: "从链接开始",
    importBtn: "导入帖子",
    importHintX: "粘贴公开链接后按 Enter。也支持 twitter.com、镜像域名或纯推文 ID。",
    importHintWeibo: "粘贴公开微博链接后按 Enter。支持 weibo.com、m.weibo.cn 或微博 bid。",
    platformX: "X / Twitter",
    platformWeibo: "微博",
    sample: "试用公开示例",
    clear: "清空",
    styleTitle: "选择样式",
    styleHint: "文字保持原帖返回的原文。",
    font: "字体",
    size: "字号",
    sceneTitle: "设置场景",
    sceneHint: "给帖子留白，但不裁切内容。",
    cardWidth: "卡片宽度",
    padding: "外边距",
    radius: "圆角",
    shadow: "阴影",
    contextTitle: "保留上下文",
    contextHint: "缺失信息不会被补造。",
    togPhotos: "图片",
    togQuote: "引用 / 转发",
    togDate: "发布时间",
    togSource: "卡片下方来源链接",
    togReplies: "下方评论",
    replyCount: "评论条数",
    repliesHeading: "评论",
    exportTitle: "导出",
    exportHint: "长图适配完整内容；分页适合超长帖。",
    savePng: "保存 PNG",
    copyPng: "复制 PNG",
    exportPages: "分页导出",
    live: "实时预览",
    previewEmptyLabel: "粘贴链接后在此预览",
    openOriginal: "打开原帖",
    empty: "粘贴公开帖子链接，预览会出现在这里。",
    how1t: "1. 粘贴帖子链接",
    how1p: "复制一条公开 X 或微博链接，导入后保留作者、正文和图片顺序。",
    how2t: "2. 设计，但不改字",
    how2p: "选择样式、背景和间距。原文、名字和用户名保持原样。",
    how3t: "3. 保存一张好读的图",
    how3p: "导出长图 PNG，或把超长内容分页。无水印，适合直接转发。",
    imported: "导入完成。可继续改样式，或直接保存 PNG。",
    invalidUrl: "请粘贴有效的帖子链接",
    notFound: "无法获取该公开帖子",
    network: "浏览器无法直连解析接口。本地请用 start.sh；GitHub Pages 需允许公开 API 访问。",
    upstream: "解析服务暂时不可用",
    exportFail: "导出失败，请确认图片已加载完成后再试",
    copied: "PNG 已复制到剪贴板。",
    copyFail: "当前浏览器无法复制图片，请改用保存 PNG",
    importing: "导入中",
    paper: "浅色卡片",
    midnight: "深色卡片",
    editorial: "衬线排版",
    outline: "描边卡片",
  },
  en: {
    docTitle: "Tweet2Share — Turn tweets into shareable images",
    chipFree: "Free · No login",
    chipClean: "No watermark",
    chipLink: "X / Weibo links",
    kicker: "From a public link to a shareable image",
    heroTitle: "Turn a post into an image. Keep the words. Give them room.",
    heroLead: "Paste a public X or Weibo post, keep the author and source, pick a readable layout, then export a PNG.",
    importLabel: "Start from a link",
    importBtn: "Import post",
    importHintX: "Paste a public link and press Enter. twitter.com, public mirrors, and raw tweet IDs also work.",
    importHintWeibo: "Paste a public Weibo link and press Enter. weibo.com, m.weibo.cn, and Weibo bids also work.",
    platformX: "X / Twitter",
    platformWeibo: "Weibo",
    sample: "Try a public sample",
    clear: "Clear",
    styleTitle: "Choose a style",
    styleHint: "The text stays exactly as the original post returned it.",
    font: "Font",
    size: "Type size",
    sceneTitle: "Set the scene",
    sceneHint: "Give the post space without cropping it.",
    cardWidth: "Card width",
    padding: "Outer margin",
    radius: "Corners",
    shadow: "Shadow",
    contextTitle: "Keep context",
    contextHint: "Missing details are never invented.",
    togPhotos: "Photos",
    togQuote: "Quote / repost",
    togDate: "Posted time",
    togSource: "Source link under the card",
    togReplies: "Comments below",
    replyCount: "Comment count",
    repliesHeading: "Comments",
    exportTitle: "Export",
    exportHint: "A long image fits the full post. Pages work for very long threads.",
    savePng: "Save PNG",
    copyPng: "Copy PNG",
    exportPages: "Export pages",
    live: "Live preview",
    previewEmptyLabel: "Preview appears here after you paste a link",
    openOriginal: "Open original",
    empty: "Paste a public post link and the preview will show up here.",
    how1t: "1. Paste a post link",
    how1p: "Copy a public X or Weibo link. Import keeps the author, body, and image order.",
    how2t: "2. Design without rewriting",
    how2p: "Pick a style, background, and spacing. The original text, name, and handle stay as they are.",
    how3t: "3. Save a readable image",
    how3p: "Export a long PNG, or split a very long post into pages. No watermark, ready to share.",
    imported: "Imported. Adjust the look, or save a PNG now.",
    invalidUrl: "Paste a valid post link",
    notFound: "This public post could not be fetched",
    network: "The browser could not reach the parser. Use start.sh locally; GitHub Pages needs public API access.",
    upstream: "The parser is temporarily unavailable",
    exportFail: "Export failed. Wait until images finish loading, then try again",
    copied: "PNG copied to the clipboard.",
    copyFail: "This browser cannot copy images. Use Save PNG instead",
    importing: "Importing",
    paper: "Light card",
    midnight: "Dark card",
    editorial: "Serif layout",
    outline: "Outlined card",
  },
};

const app = document.querySelector("#app");

const state = {
  lang: "zh",
  platform: "x",
  tweet: null,
  loading: false,
  errorKey: "",
  statusKey: "",
  treatment: "paper",
  font: "sans",
  textSize: 20,
  background: "mist",
  cardWidth: 560,
  outerSpacing: 64,
  corners: 20,
  shadow: 28,
  showPhotos: true,
  showQuote: true,
  showDate: true,
  showSource: true,
  showReplies: true,
  replyCount: 5,
};

function t(key) {
  const pack = I18N[state.lang] || I18N.zh;
  return pack[key] ?? I18N.zh[key] ?? key;
}

app.innerHTML = `
  <div class="app">
    <header class="topbar">
      <div class="logo"><img class="mark-img" src="./favicon.png" alt="" /> Tweet2Share</div>
      <div class="topbar-right">
        <div class="chips">
          <span class="chip" data-i18n="chipFree">免费 · 无需登录</span>
          <span class="chip" data-i18n="chipClean">无水印</span>
          <span class="chip" data-i18n="chipLink">X / 微博链接</span>
        </div>
        <div class="lang-switch" role="group" aria-label="Language">
          <button type="button" data-lang="zh" class="active">中文</button>
          <button type="button" data-lang="en">EN</button>
        </div>
        <a class="github-link" href="${REPO_URL}" target="_blank" rel="noopener" title="${REPO_URL}">
          <svg class="github-icon" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.65 7.65 0 0 1 8 4.51c.68.003 1.36.092 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>
          <span>ok406lhq/Tweet2Share</span>
        </a>
        <span class="credit">${CREDIT}</span>
      </div>
    </header>

    <div class="studio-wrap">
      <section class="hero">
        <p class="kicker" data-i18n="kicker">从一条链接到可分享的图</p>
        <h1 data-i18n="heroTitle">把帖子变成图片。保留原文，给它空间。</h1>
        <p class="lead" data-i18n="heroLead">粘贴公开的 X 或微博链接，保留作者与来源，选择一种仍然好读的设计，然后导出 PNG。</p>
      </section>
      <div class="studio">
        <aside class="panel">
          <form id="parse-form" class="import-box">
            <span class="label" data-i18n="importLabel">从链接开始</span>
            <div class="platform-switch" role="group" aria-label="Platform">
              <button type="button" data-platform="x" class="active" data-i18n="platformX">X / Twitter</button>
              <button type="button" data-platform="weibo" data-i18n="platformWeibo">微博</button>
            </div>
            <div class="field">
              <input id="url-input" type="text" placeholder="https://x.com/username/status/123" autocomplete="off" />
              <button class="primary" id="parse-btn" type="submit" data-i18n="importBtn">导入帖子</button>
            </div>
            <p class="hint" id="import-hint" data-i18n="importHintX">粘贴公开链接后按 Enter。也支持 twitter.com、镜像域名或纯推文 ID。</p>
            <div class="row-actions">
              <button class="ghost" id="sample-btn" type="button" data-i18n="sample">试用公开示例</button>
              <button class="ghost" id="clear-btn" type="button" data-i18n="clear">清空</button>
            </div>
            <div id="error" class="error" hidden></div>
            <div id="status" class="status" hidden></div>
          </form>

          <section class="section">
            <div class="section-h">
              <span class="num">01</span>
              <div>
                <h2 data-i18n="styleTitle">选择样式</h2>
                <p data-i18n="styleHint">文字保持原帖返回的原文。</p>
              </div>
            </div>
            <div class="choices" id="treatments"></div>
            <div class="control">
              <div class="control-h"><span data-i18n="font">字体</span></div>
              <select id="font-select"></select>
            </div>
            <div class="control">
              <div class="control-h"><span data-i18n="size">字号</span><span id="size-val">20 px</span></div>
              <input id="size-range" type="range" min="16" max="32" value="20" />
            </div>
          </section>

          <section class="section">
            <div class="section-h">
              <span class="num">02</span>
              <div>
                <h2 data-i18n="sceneTitle">设置场景</h2>
                <p data-i18n="sceneHint">给帖子留白，但不裁切内容。</p>
              </div>
            </div>
            <div class="swatches" id="backgrounds"></div>
            <div class="control">
              <div class="control-h"><span data-i18n="cardWidth">卡片宽度</span><span id="width-val">560 px</span></div>
              <input id="width-range" type="range" min="420" max="760" value="560" />
            </div>
            <div class="control">
              <div class="control-h"><span data-i18n="padding">外边距</span><span id="pad-val">64 px</span></div>
              <input id="pad-range" type="range" min="16" max="120" value="64" />
            </div>
            <div class="control">
              <div class="control-h"><span data-i18n="radius">圆角</span><span id="radius-val">20</span></div>
              <input id="radius-range" type="range" min="0" max="36" value="20" />
            </div>
            <div class="control">
              <div class="control-h"><span data-i18n="shadow">阴影</span><span id="shadow-val">28</span></div>
              <input id="shadow-range" type="range" min="0" max="60" value="28" />
            </div>
          </section>

          <section class="section">
            <div class="section-h">
              <span class="num">03</span>
              <div>
                <h2 data-i18n="contextTitle">保留上下文</h2>
                <p data-i18n="contextHint">缺失信息不会被补造。</p>
              </div>
            </div>
            <div class="toggles">
              <label class="toggle"><input id="tog-photos" type="checkbox" checked /> <span data-i18n="togPhotos">图片</span></label>
              <label class="toggle"><input id="tog-quote" type="checkbox" checked /> <span data-i18n="togQuote">引用 / 转发</span></label>
              <label class="toggle"><input id="tog-date" type="checkbox" checked /> <span data-i18n="togDate">发布时间</span></label>
              <label class="toggle"><input id="tog-source" type="checkbox" checked /> <span data-i18n="togSource">卡片下方来源链接</span></label>
              <label class="toggle"><input id="tog-replies" type="checkbox" checked /> <span data-i18n="togReplies">下方评论</span></label>
            </div>
            <div class="control" id="reply-count-control">
              <div class="control-h"><span data-i18n="replyCount">评论条数</span><span id="reply-count-val">5</span></div>
              <input id="reply-count-range" type="range" min="0" max="20" value="5" />
            </div>
          </section>

          <section class="section">
            <div class="section-h">
              <span class="num">04</span>
              <div>
                <h2 data-i18n="exportTitle">导出</h2>
                <p data-i18n="exportHint">长图适配完整内容；分页适合超长帖。</p>
              </div>
            </div>
            <div class="row-actions">
              <button class="primary" id="export-long" type="button" disabled data-i18n="savePng">保存 PNG</button>
              <button class="ghost" id="export-copy" type="button" disabled data-i18n="copyPng">复制 PNG</button>
              <button class="ghost" id="export-pages" type="button" disabled data-i18n="exportPages">分页导出</button>
            </div>
          </section>
        </aside>

        <section class="preview-col">
          <div class="filebar">
            <div class="filebar-left">
              <span class="live" data-i18n="live">实时预览</span>
              <strong id="preview-label">粘贴链接后在此预览</strong>
            </div>
            <div class="filebar-actions">
              <button class="ghost" id="open-x" type="button" disabled data-i18n="openOriginal">打开原帖</button>
            </div>
          </div>
          <div class="scene-scroll">
            <div id="export-canvas" class="export-canvas scene-mist">
              <div id="preview">
                <div class="empty">粘贴公开帖子链接，预览会出现在这里。</div>
              </div>
              <div class="scene-credit">${CREDIT}</div>
            </div>
          </div>
        </section>
      </div>

      <section class="howto">
        <article>
          <h3 data-i18n="how1t">1. 粘贴帖子链接</h3>
          <p data-i18n="how1p">复制一条公开 X 或微博链接，导入后保留作者、正文和图片顺序。</p>
        </article>
        <article>
          <h3 data-i18n="how2t">2. 设计，但不改字</h3>
          <p data-i18n="how2p">选择样式、背景和间距。原文、名字和用户名保持原样。</p>
        </article>
        <article>
          <h3 data-i18n="how3t">3. 保存一张好读的图</h3>
          <p data-i18n="how3p">导出长图 PNG，或把超长内容分页。无水印，适合直接转发。</p>
        </article>
      </section>
    </div>
  </div>
`;

const els = {
  form: document.querySelector("#parse-form"),
  input: document.querySelector("#url-input"),
  parseBtn: document.querySelector("#parse-btn"),
  sampleBtn: document.querySelector("#sample-btn"),
  clearBtn: document.querySelector("#clear-btn"),
  error: document.querySelector("#error"),
  status: document.querySelector("#status"),
  treatments: document.querySelector("#treatments"),
  backgrounds: document.querySelector("#backgrounds"),
  fontSelect: document.querySelector("#font-select"),
  sizeRange: document.querySelector("#size-range"),
  sizeVal: document.querySelector("#size-val"),
  widthRange: document.querySelector("#width-range"),
  widthVal: document.querySelector("#width-val"),
  padRange: document.querySelector("#pad-range"),
  padVal: document.querySelector("#pad-val"),
  radiusRange: document.querySelector("#radius-range"),
  radiusVal: document.querySelector("#radius-val"),
  shadowRange: document.querySelector("#shadow-range"),
  shadowVal: document.querySelector("#shadow-val"),
  togPhotos: document.querySelector("#tog-photos"),
  togQuote: document.querySelector("#tog-quote"),
  togDate: document.querySelector("#tog-date"),
  togSource: document.querySelector("#tog-source"),
  togReplies: document.querySelector("#tog-replies"),
  replyCountRange: document.querySelector("#reply-count-range"),
  replyCountVal: document.querySelector("#reply-count-val"),
  exportLong: document.querySelector("#export-long"),
  exportCopy: document.querySelector("#export-copy"),
  exportPages: document.querySelector("#export-pages"),
  openX: document.querySelector("#open-x"),
  preview: document.querySelector("#preview"),
  canvas: document.querySelector("#export-canvas"),
  previewLabel: document.querySelector("#preview-label"),
  langSwitch: document.querySelector(".lang-switch"),
  platformSwitch: document.querySelector(".platform-switch"),
  importHint: document.querySelector("#import-hint"),
};

function showError(key) {
  state.errorKey = key || "";
  els.error.hidden = !state.errorKey;
  els.error.textContent = state.errorKey ? t(state.errorKey) : "";
}

function showStatus(key) {
  state.statusKey = key || "";
  els.status.hidden = !state.statusKey;
  els.status.textContent = state.statusKey ? t(state.statusKey) : "";
}

function applyI18n() {
  document.documentElement.lang = state.lang === "en" ? "en" : "zh-CN";
  document.title = t("docTitle");
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  if (els.langSwitch) {
    els.langSwitch.querySelectorAll("[data-lang]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === state.lang);
    });
  }
  if (els.parseBtn && !state.loading) els.parseBtn.textContent = t("importBtn");
  if (state.errorKey) els.error.textContent = t(state.errorKey);
  if (state.statusKey) els.status.textContent = t(state.statusKey);
  applyPlatformUi();
}

const imageCache = new Map();

function isLocalAsset(url) {
  return typeof url === "string" && (url.startsWith("blob:") || url.startsWith("data:") || url.startsWith("./") || url.startsWith("/"));
}

function isSinaHost(host) {
  return host === "sinaimg.cn" || host.endsWith(".sinaimg.cn");
}

function corsImageUrl(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (host === "twimg.com" || host.endsWith(".twimg.com")) {
      return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
    }
    if (isSinaHost(host)) {
      return `https://i0.wp.com/${host}${parsed.pathname}${parsed.search}${parsed.search ? "&" : "?"}ssl=1`;
    }
  } catch {
    return null;
  }
  return null;
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function fetchImageAsDataUrl(src) {
  const response = await fetch(src, { mode: "cors", credentials: "omit", referrerPolicy: "no-referrer" });
  if (!response.ok) throw new Error("IMAGE_FETCH_FAILED");
  const blob = await response.blob();
  const type = blob.type || "image/jpeg";
  if (!type.startsWith("image/") && type !== "application/octet-stream") {
    throw new Error("NOT_AN_IMAGE");
  }
  const dataUrl = await blobToDataUrl(blob);
  if (!dataUrl.startsWith("data:")) throw new Error("NOT_DATA_URL");
  return dataUrl;
}

async function toLocalImageUrl(url) {
  if (!url || isLocalAsset(url)) return url;
  if (imageCache.has(url)) return imageCache.get(url);

  const candidates = [];
  if (import.meta.env.DEV) candidates.push(`/api/proxy?url=${encodeURIComponent(url)}`);
  candidates.push(url);
  const proxied = corsImageUrl(url);
  if (proxied) candidates.push(proxied);

  for (const src of candidates) {
    try {
      const dataUrl = await fetchImageAsDataUrl(src);
      imageCache.set(url, dataUrl);
      return dataUrl;
    } catch {
      continue;
    }
  }
  return proxied || url;
}

async function localizeTweetImages(tweet) {
  if (!tweet) return tweet;
  if (tweet.author?.avatarUrl) {
    tweet.author.avatarUrl = await toLocalImageUrl(tweet.author.avatarUrl);
  }
  if (Array.isArray(tweet.photos)) {
    for (const photo of tweet.photos) {
      photo.url = await toLocalImageUrl(photo.url);
    }
  }
  if (tweet.quote) await localizeTweetImages(tweet.quote);
  if (Array.isArray(tweet.replies)) {
    for (const reply of tweet.replies) await localizeTweetImages(reply);
  }
  return tweet;
}

function proxyUrl(url) {
  if (!url) return "";
  if (isLocalAsset(url)) return url;
  if (import.meta.env.DEV) return `/api/proxy?url=${encodeURIComponent(url)}`;
  return corsImageUrl(url) || url;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(state.lang === "en" ? "en-US" : "zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function sourceLabel(tweet) {
  return tweet?.platform === "weibo" ? t("platformWeibo") : t("platformX");
}

function applyPlatformUi() {
  if (els.platformSwitch) {
    els.platformSwitch.querySelectorAll("[data-platform]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.platform === state.platform);
    });
  }
  if (els.input) {
    els.input.placeholder =
      state.platform === "weibo" ? "https://weibo.com/username/AbCdEfGhI" : "https://x.com/username/status/123";
  }
  if (els.importHint) {
    els.importHint.dataset.i18n = state.platform === "weibo" ? "importHintWeibo" : "importHintX";
    els.importHint.textContent = t(els.importHint.dataset.i18n);
  }
}

function verifiedBadge() {
  return `<svg class="badge" viewBox="0 0 24 24" aria-hidden="true"><path fill="#1d9bf0" d="M22.25 12c0 1.17-.3 2.27-.84 3.24.54.97.84 2.07.84 3.24 0 3.59-2.91 6.5-6.5 6.5-1.17 0-2.27-.3-3.24-.84A6.47 6.47 0 0 1 9.27 24C5.68 24 2.77 21.09 2.77 17.5c0-1.17.3-2.27.84-3.24A6.47 6.47 0 0 1 2.77 11C2.77 7.41 5.68 4.5 9.27 4.5c1.17 0 2.27.3 3.24.84A6.47 6.47 0 0 1 15.75 4.5c3.59 0 6.5 2.91 6.5 6.5 0 1.17-.3 2.27-.84 3.24.54.97.84 2.07.84 3.24Z"/><path fill="#fff" d="m10.7 16.7-3.2-3.2 1.4-1.4 1.8 1.79 4.4-4.39 1.4 1.41z"/></svg>`;
}

function authorBlock(author) {
  const initial = escapeHtml((author.name || author.screenName || "?").slice(0, 1));
  const avatar = author.avatarUrl
        ? `<img class="avatar" src="${escapeHtml(proxyUrl(author.avatarUrl))}" alt="" crossorigin="anonymous" referrerpolicy="no-referrer" />`
    : `<div class="avatar fallback">${initial}</div>`;
  return `
    <div class="card-top">
      ${avatar}
      <div>
        <div class="name-row">
          <span class="display-name">${escapeHtml(author.name)}</span>
          ${author.verified ? verifiedBadge() : ""}
        </div>
        ${
          author.screenName && author.screenName !== author.name
            ? `<div class="handle">@${escapeHtml(author.screenName)}</div>`
            : ""
        }
      </div>
    </div>
  `;
}

function photosBlock(photos) {
  if (!state.showPhotos || !photos || photos.length === 0) return "";
  const imgs = photos
    .map(
      (photo) =>
        `<img src="${escapeHtml(proxyUrl(photo.url))}" alt="${escapeHtml(photo.alt || "")}" crossorigin="anonymous" referrerpolicy="no-referrer" ${
          photo.width ? `width="${photo.width}"` : ""
        } ${photo.height ? `height="${photo.height}"` : ""} />`
    )
    .join("");
  return `<div class="photos">${imgs}</div>`;
}

function visibleReplies(tweet) {
  if (!state.showReplies || !tweet?.replies?.length) return [];
  return tweet.replies.slice(0, state.replyCount);
}

function repliesBlock(tweet) {
  const replies = visibleReplies(tweet);
  if (!replies.length) return "";
  const items = replies
    .map(
      (reply) => `
        <div class="reply">
          ${authorBlock(reply.author)}
          <div class="body">${escapeHtml(reply.text)}</div>
          ${photosBlock(reply.photos)}
        </div>
      `
    )
    .join("");
  return `<div class="replies"><div class="replies-h">${t("repliesHeading")}</div>${items}</div>`;
}

function tweetInner(tweet, nested = false) {
  return `
    ${authorBlock(tweet.author)}
    <div class="body">${escapeHtml(tweet.text)}</div>
    ${photosBlock(tweet.photos)}
    ${
      !nested && state.showQuote && tweet.quote
        ? `<div class="quote">${tweetInner(tweet.quote, true)}</div>`
        : ""
    }
    ${!nested ? repliesBlock(tweet) : ""}
  `;
}

function applyDesignVars() {
  const root = document.documentElement;
  root.style.setProperty("--card-width", `${state.cardWidth}px`);
  root.style.setProperty("--scene-pad", `${state.outerSpacing}px`);
  root.style.setProperty("--card-radius", `${state.corners}px`);
  root.style.setProperty("--card-shadow", String(state.shadow));
  root.style.setProperty("--card-size", `${state.textSize}px`);

  els.canvas.className = `export-canvas scene-${state.background}`;
  const card = document.querySelector("#share-card");
  if (card) {
    card.className = `share-card tx-${state.treatment} font-${state.font}`;
  }
}

function renderPreview() {
  const ready = Boolean(state.tweet);
  els.exportLong.disabled = !ready;
  els.exportCopy.disabled = !ready;
  els.exportPages.disabled = !ready;
  els.openX.disabled = !ready;

  if (!state.tweet) {
    els.preview.innerHTML = `<div class="empty">${t("empty")}</div>`;
    els.previewLabel.textContent = t("previewEmptyLabel");
    applyDesignVars();
    return;
  }

  const tweet = state.tweet;
  els.previewLabel.textContent = `@${tweet.author.screenName} · ${tweet.id}`;
  els.preview.innerHTML = `
    <article class="share-card tx-${state.treatment} font-${state.font}" id="share-card">
      ${tweetInner(tweet)}
      ${
        state.showDate
          ? `<div class="meta"><span>${escapeHtml(formatTime(tweet.createdAt))}</span><span>${escapeHtml(sourceLabel(tweet))}</span></div>`
          : ""
      }
      ${state.showSource ? `<div class="source">${escapeHtml(tweet.url)}</div>` : ""}
    </article>
  `;
  applyDesignVars();
}

function renderControls() {
  const notes = { paper: t("paper"), midnight: t("midnight"), editorial: t("editorial"), outline: t("outline") };
  els.treatments.innerHTML = TREATMENTS.map(
    (item) => `
      <button class="choice ${state.treatment === item.id ? "active" : ""}" type="button" data-treatment="${item.id}">
        <b>${item.label}</b>
        <small>${notes[item.id] || item.note}</small>
      </button>
    `
  ).join("");

  els.backgrounds.innerHTML = BACKGROUNDS.map(
    (item) => `
      <button class="swatch ${item.id} ${state.background === item.id ? "active" : ""}" type="button" data-bg="${item.id}" title="${item.label}"></button>
    `
  ).join("");

  els.fontSelect.innerHTML = FONTS.map(
    (item) => `<option value="${item.id}" ${state.font === item.id ? "selected" : ""}>${item.label}</option>`
  ).join("");
}

function filenameBase(tweet) {
  const handle = (tweet.author.screenName || "post").replace(/[^\w.-]/g, "") || "post";
  return `tweet2share-${handle}-${tweet.id}`;
}

function downloadDataUrl(dataUrl, name) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function waitForImages(root) {
  const images = [...root.querySelectorAll("img")];
  return Promise.all(
    images.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        })
    )
  );
}

const CARD_THEMES = {
  paper: { bg: "#ffffff", fg: "#141416", muted: "#667085", line: "#ececef", border: 1 },
  midnight: { bg: "#17151d", fg: "#f5f3ef", muted: "#a39e96", line: "#2c2833", border: 1 },
  editorial: { bg: "#fbf7f0", fg: "#1a1612", muted: "#7a7166", line: "#e8dfd2", border: 1 },
  outline: { bg: "#ffffff", fg: "#141416", muted: "#667085", line: "#141416", border: 2 },
};

const SCENE_COLORS = {
  mist: ["#e8edf5", "#dfe4ee", "#ece7e2"],
  lilac: ["#ece4f7", "#e4d7f0", "#f3e8f0"],
  peach: ["#f8e4d6", "#f3d5c4", "#f6e9dc"],
  sand: ["#efe6d6", "#e6dcc8", "#f2eadc"],
  dusk: ["#2a3144", "#3a3348", "#1e2433"],
  clear: ["#ffffff", "#ffffff", "#ffffff"],
};

const FONT_STACK = {
  sans: '"PingFang SC", "Noto Sans SC", "Segoe UI", "Helvetica Neue", sans-serif',
  grotesk: '"Avenir Next", "PingFang SC", "Segoe UI", sans-serif',
  serif: 'Georgia, "Songti SC", "Noto Serif SC", serif',
};

function roundRectPath(ctx, x, y, w, h, r) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function wrapLines(ctx, text, maxWidth) {
  const paragraphs = String(text || "").split("\n");
  const lines = [];
  for (const paragraph of paragraphs) {
    if (paragraph === "") {
      lines.push("");
      continue;
    }
    let current = "";
    for (const ch of paragraph) {
      const next = current + ch;
      if (current && ctx.measureText(next).width > maxWidth) {
        lines.push(current);
        current = ch;
      } else {
        current = next;
      }
    }
    if (current) lines.push(current);
  }
  return lines.length ? lines : [""];
}

function loadExportImage(url) {
  return new Promise((resolve) => {
    if (!url) {
      resolve(null);
      return;
    }
    const img = new Image();
    if (!isLocalAsset(url)) {
      img.crossOrigin = "anonymous";
      img.referrerPolicy = "no-referrer";
    }
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

async function collectImages(tweet, bucket) {
  if (!tweet) return;
  if (tweet.author?.avatarUrl) bucket.push(tweet.author.avatarUrl);
  if (state.showPhotos && Array.isArray(tweet.photos)) {
    tweet.photos.forEach((photo) => {
      if (photo?.url) bucket.push(photo.url);
    });
  }
  if (state.showQuote && tweet.quote) await collectImages(tweet.quote, bucket);
  if (!tweet.replies) return;
  for (const reply of visibleReplies(tweet)) await collectImages(reply, bucket);
}

function drawVerified(ctx, x, y, size) {
  ctx.save();
  ctx.fillStyle = "#1d9bf0";
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = Math.max(1.6, size * 0.16);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.28, y + size * 0.52);
  ctx.lineTo(x + size * 0.44, y + size * 0.68);
  ctx.lineTo(x + size * 0.74, y + size * 0.34);
  ctx.stroke();
  ctx.restore();
}

function drawAuthor(ctx, author, img, x, y, theme, avatarSize, fontFamily) {
  if (img) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + avatarSize / 2, y + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, x, y, avatarSize, avatarSize);
    ctx.restore();
  } else {
    ctx.fillStyle = theme.line;
    ctx.beginPath();
    ctx.arc(x + avatarSize / 2, y + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = theme.muted;
    ctx.font = `bold 16px ${fontFamily}`;
    ctx.textBaseline = "middle";
    const initial = String(author.name || author.screenName || "?").slice(0, 1);
    ctx.fillText(initial, x + avatarSize / 2 - ctx.measureText(initial).width / 2, y + avatarSize / 2);
  }

  const textX = x + avatarSize + 12;
  ctx.fillStyle = theme.fg;
  ctx.font = `bold 16px ${fontFamily}`;
  ctx.textBaseline = "top";
  ctx.fillText(author.name || "", textX, y + 4);
  const nameWidth = ctx.measureText(author.name || "").width;
  if (author.verified) drawVerified(ctx, textX + nameWidth + 6, y + 5, 16);
  if (author.screenName && author.screenName !== author.name) {
    ctx.fillStyle = theme.muted;
    ctx.font = `13px ${fontFamily}`;
    ctx.fillText(`@${author.screenName}`, textX, y + 26);
  }
  return avatarSize;
}

function measureTweetBlock(ctx, tweet, contentWidth, nested, fontFamily, bodySize, images) {
  const avatarSize = nested ? 32 : 48;
  const bodyFont = nested ? bodySize * 0.72 : bodySize;
  let height = avatarSize;
  ctx.font = `${bodyFont}px ${fontFamily}`;
  const lines = wrapLines(ctx, tweet.text, contentWidth);
  height += 22 + lines.length * bodyFont * 1.42;
  if (state.showPhotos && tweet.photos?.length) {
    height += 20;
    tweet.photos.forEach((photo) => {
      const img = images.get(photo.url);
      const ratio = img && img.naturalWidth ? img.naturalHeight / img.naturalWidth : 9 / 16;
      height += contentWidth * ratio + 10;
    });
    height -= 10;
  }
  if (!nested && state.showQuote && tweet.quote) {
    height += 18 + 26 + measureTweetBlock(ctx, tweet.quote, contentWidth - 28, true, fontFamily, bodySize, images);
  }
  if (!nested) {
    const replies = visibleReplies(tweet);
    if (replies.length) {
      height += 52;
      replies.forEach((reply) => {
        height += 16 + measureTweetBlock(ctx, reply, contentWidth, true, fontFamily, bodySize, images);
      });
    }
  }
  return height;
}

function paintTweetBlock(ctx, tweet, x, y, contentWidth, nested, theme, fontFamily, bodySize, images) {
  const avatarSize = nested ? 32 : 48;
  let cursor = y;
  cursor += drawAuthor(ctx, tweet.author, images.get(tweet.author?.avatarUrl), x, cursor, theme, avatarSize, fontFamily);
  cursor += 22;
  const bodyFont = nested ? bodySize * 0.72 : bodySize;
  ctx.fillStyle = theme.fg;
  ctx.font = `${bodyFont}px ${fontFamily}`;
  ctx.textBaseline = "top";
  const lines = wrapLines(ctx, tweet.text, contentWidth);
  const lineHeight = bodyFont * 1.42;
  lines.forEach((line) => {
    ctx.fillText(line, x, cursor);
    cursor += lineHeight;
  });
  if (state.showPhotos && tweet.photos?.length) {
    cursor += 20;
    tweet.photos.forEach((photo) => {
      const img = images.get(photo.url);
      const ratio = img && img.naturalWidth ? img.naturalHeight / img.naturalWidth : 9 / 16;
      const h = contentWidth * ratio;
      roundRectPath(ctx, x, cursor, contentWidth, h, 10);
      ctx.save();
      ctx.clip();
      if (img) ctx.drawImage(img, x, cursor, contentWidth, h);
      else {
        ctx.fillStyle = "rgba(127,127,127,0.08)";
        ctx.fillRect(x, cursor, contentWidth, h);
      }
      ctx.restore();
      cursor += h + 10;
    });
    cursor -= 10;
  }
  if (!nested && state.showQuote && tweet.quote) {
    cursor += 18;
    const innerWidth = contentWidth - 28;
    const quoteHeight = 26 + measureTweetBlock(ctx, tweet.quote, innerWidth, true, fontFamily, bodySize, images);
    roundRectPath(ctx, x, cursor, contentWidth, quoteHeight, Math.max(8, state.corners * 0.7));
    ctx.strokeStyle = theme.line;
    ctx.lineWidth = 1;
    ctx.stroke();
    cursor = paintTweetBlock(ctx, tweet.quote, x + 14, cursor + 14, innerWidth, true, theme, fontFamily, bodySize, images);
    cursor += 12;
  }
  if (!nested) {
    const replies = visibleReplies(tweet);
    if (replies.length) {
      cursor += 22;
      ctx.strokeStyle = theme.line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, cursor);
      ctx.lineTo(x + contentWidth, cursor);
      ctx.stroke();
      cursor += 12;
      ctx.fillStyle = theme.muted;
      ctx.font = `12px ${fontFamily}`;
      ctx.textBaseline = "top";
      ctx.fillText(t("repliesHeading"), x, cursor);
      cursor += 18;
      for (const reply of replies) {
        cursor = paintTweetBlock(ctx, reply, x, cursor, contentWidth, true, theme, fontFamily, bodySize, images);
        cursor += 16;
      }
    }
  }
  return cursor;
}

async function captureCanvas() {
  const tweet = state.tweet;
  if (!tweet) throw new Error("NO_CARD");
  const card = document.querySelector("#share-card");
  if (card) await waitForImages(card);

  const urls = [];
  await collectImages(tweet, urls);
  const images = new Map();
  await Promise.all(
    [...new Set(urls)].map(async (url) => {
      images.set(url, await loadExportImage(url));
    })
  );

  const pad = state.outerSpacing;
  const cardWidth = state.cardWidth;
  const canvasWidth = Math.round(cardWidth + pad * 2);
  const theme = CARD_THEMES[state.treatment] || CARD_THEMES.paper;
  const fontFamily = FONT_STACK[state.font] || FONT_STACK.sans;
  const bodySize = state.textSize;
  const sidePad = 30;
  const contentWidth = cardWidth - sidePad * 2;

  const measureCanvas = document.createElement("canvas");
  const measureCtx = measureCanvas.getContext("2d");
  let innerHeight = measureTweetBlock(measureCtx, tweet, contentWidth, false, fontFamily, bodySize, images);
  if (state.showDate) innerHeight += 22 + 14 + 16;
  if (state.showSource) innerHeight += 14 + 16;
  const cardHeight = Math.ceil(32 + innerHeight + 24);
  const canvasHeight = Math.ceil(cardHeight + pad * 2);
  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth * scale;
  canvas.height = canvasHeight * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);

  const scene = SCENE_COLORS[state.background] || SCENE_COLORS.mist;
  const gradient = ctx.createLinearGradient(0, 0, canvasWidth * 0.35, canvasHeight);
  gradient.addColorStop(0, scene[0]);
  gradient.addColorStop(0.48, scene[1]);
  gradient.addColorStop(1, scene[2]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  const cardX = pad;
  const cardY = pad;
  ctx.save();
  ctx.shadowColor = `rgba(20, 16, 28, ${Math.min(0.45, state.shadow / 140)})`;
  ctx.shadowBlur = state.shadow * 1.1;
  ctx.shadowOffsetY = state.shadow * 0.18;
  roundRectPath(ctx, cardX, cardY, cardWidth, cardHeight, state.corners);
  ctx.fillStyle = theme.bg;
  ctx.fill();
  ctx.restore();
  roundRectPath(ctx, cardX, cardY, cardWidth, cardHeight, state.corners);
  ctx.strokeStyle = theme.line;
  ctx.lineWidth = theme.border;
  ctx.stroke();

  let y = paintTweetBlock(ctx, tweet, cardX + sidePad, cardY + 32, contentWidth, false, theme, fontFamily, bodySize, images);
  if (state.showDate) {
    y += 22;
    ctx.strokeStyle = theme.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cardX + sidePad, y);
    ctx.lineTo(cardX + cardWidth - sidePad, y);
    ctx.stroke();
    y += 14;
    ctx.fillStyle = theme.muted;
    ctx.font = `12px ${fontFamily}`;
    ctx.textBaseline = "top";
    const left = formatTime(tweet.createdAt);
    ctx.fillText(left, cardX + sidePad, y);
    const right = sourceLabel(tweet);
    ctx.fillText(right, cardX + cardWidth - sidePad - ctx.measureText(right).width, y);
    y += 16;
  }
  if (state.showSource) {
    y += 14;
    ctx.fillStyle = theme.muted;
    ctx.font = `11px ${fontFamily}`;
    ctx.textBaseline = "top";
    wrapLines(ctx, tweet.url, contentWidth).forEach((line) => {
      ctx.fillText(line, cardX + sidePad, y);
      y += 14;
    });
  }

  ctx.fillStyle = state.background === "dusk" ? "rgba(255,255,255,0.55)" : "rgba(20,16,28,0.38)";
  ctx.font = `11px ${fontFamily}`;
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText(CREDIT, canvasWidth - Math.max(16, pad * 0.28), canvasHeight - Math.max(10, pad * 0.18));

  return canvas.toDataURL("image/png");
}

function slicePng(dataUrl, pageHeight) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const pages = [];
      const total = image.height;
      let y = 0;
      let index = 0;
      while (y < total) {
        const h = Math.min(pageHeight, total - y);
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, y, image.width, h, 0, 0, image.width, h);
        pages.push({ index, dataUrl: canvas.toDataURL("image/png") });
        y += pageHeight;
        index += 1;
      }
      resolve(pages);
    };
    image.onerror = reject;
    image.src = dataUrl;
  });
}

function detectPlatform(url) {
  if (extractWeiboRef(url, { allowBareId: state.platform === "weibo" })) return "weibo";
  if (extractTweetId(url)) return "x";
  return state.platform;
}

async function loadPost(url) {
  const platform = detectPlatform(url);
  state.platform = platform;
  applyPlatformUi();
  if (platform === "weibo") {
    return fetchWeibo(url, { allowBareId: true });
  }
  return fetchTweet(url);
}

async function parseUrl(url) {
  showError("");
  showStatus("");
  if (!url) {
    showError("invalidUrl");
    return;
  }

  state.loading = true;
  els.parseBtn.disabled = true;
  els.parseBtn.innerHTML = `<span class="loading"></span>${t("importing")}`;
  try {
    state.tweet = await localizeTweetImages(await loadPost(url));
    showStatus("imported");
    renderPreview();
  } catch (err) {
    showError((err && err.key) || "upstream");
  } finally {
    state.loading = false;
    els.parseBtn.disabled = false;
    els.parseBtn.textContent = t("importBtn");
  }
}

els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  parseUrl(els.input.value.trim());
});

els.sampleBtn.addEventListener("click", () => {
  const sample = SAMPLE_URLS[state.platform] || SAMPLE_URLS.x;
  els.input.value = sample;
  parseUrl(sample);
});

els.clearBtn.addEventListener("click", () => {
  state.tweet = null;
  els.input.value = "";
  showError("");
  showStatus("");
  renderPreview();
});

els.treatments.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-treatment]");
  if (!btn) return;
  state.treatment = btn.dataset.treatment;
  if (state.treatment === "editorial") state.font = "serif";
  renderControls();
  renderPreview();
});

els.backgrounds.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-bg]");
  if (!btn) return;
  state.background = btn.dataset.bg;
  renderControls();
  applyDesignVars();
});

els.fontSelect.addEventListener("change", () => {
  state.font = els.fontSelect.value;
  renderPreview();
});

els.sizeRange.addEventListener("input", () => {
  state.textSize = Number(els.sizeRange.value);
  els.sizeVal.textContent = `${state.textSize} px`;
  applyDesignVars();
});

els.widthRange.addEventListener("input", () => {
  state.cardWidth = Number(els.widthRange.value);
  els.widthVal.textContent = `${state.cardWidth} px`;
  applyDesignVars();
});

els.padRange.addEventListener("input", () => {
  state.outerSpacing = Number(els.padRange.value);
  els.padVal.textContent = `${state.outerSpacing} px`;
  applyDesignVars();
});

els.radiusRange.addEventListener("input", () => {
  state.corners = Number(els.radiusRange.value);
  els.radiusVal.textContent = String(state.corners);
  applyDesignVars();
});

els.shadowRange.addEventListener("input", () => {
  state.shadow = Number(els.shadowRange.value);
  els.shadowVal.textContent = String(state.shadow);
  applyDesignVars();
});

els.togPhotos.addEventListener("change", () => {
  state.showPhotos = els.togPhotos.checked;
  renderPreview();
});
els.togQuote.addEventListener("change", () => {
  state.showQuote = els.togQuote.checked;
  renderPreview();
});
els.togDate.addEventListener("change", () => {
  state.showDate = els.togDate.checked;
  renderPreview();
});
els.togSource.addEventListener("change", () => {
  state.showSource = els.togSource.checked;
  renderPreview();
});
els.togReplies.addEventListener("change", () => {
  state.showReplies = els.togReplies.checked;
  document.querySelector("#reply-count-control").hidden = !state.showReplies;
  renderPreview();
});
els.replyCountRange.addEventListener("input", () => {
  state.replyCount = Number(els.replyCountRange.value);
  els.replyCountVal.textContent = String(state.replyCount);
  renderPreview();
});

els.openX.addEventListener("click", () => {
  if (!state.tweet) return;
  window.open(state.tweet.url, "_blank", "noopener");
});

els.exportLong.addEventListener("click", async () => {
  if (!state.tweet) return;
  els.exportLong.disabled = true;
  try {
    const dataUrl = await captureCanvas();
    downloadDataUrl(dataUrl, `${filenameBase(state.tweet)}.png`);
  } catch {
    showError("exportFail");
  } finally {
    els.exportLong.disabled = false;
  }
});

els.exportCopy.addEventListener("click", async () => {
  if (!state.tweet) return;
  els.exportCopy.disabled = true;
  try {
    const dataUrl = await captureCanvas();
    const blob = await (await fetch(dataUrl)).blob();
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    showStatus("copied");
  } catch {
    showError("copyFail");
  } finally {
    els.exportCopy.disabled = false;
  }
});

els.exportPages.addEventListener("click", async () => {
  if (!state.tweet) return;
  els.exportPages.disabled = true;
  try {
    const dataUrl = await captureCanvas();
    const pages = await slicePng(dataUrl, PAGE_HEIGHT * 2);
    const base = filenameBase(state.tweet);
    if (pages.length === 1) {
      downloadDataUrl(pages[0].dataUrl, `${base}.png`);
    } else {
      for (const page of pages) {
        downloadDataUrl(page.dataUrl, `${base}-p${page.index + 1}.png`);
        await new Promise((r) => setTimeout(r, 250));
      }
    }
  } catch {
    showError("exportFail");
  } finally {
    els.exportPages.disabled = false;
  }
});

els.langSwitch.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-lang]");
  if (!btn || btn.dataset.lang === state.lang) return;
  state.lang = btn.dataset.lang;
  applyI18n();
  renderControls();
  renderPreview();
});

els.platformSwitch.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-platform]");
  if (!btn || btn.dataset.platform === state.platform) return;
  state.platform = btn.dataset.platform;
  applyPlatformUi();
});

applyI18n();
renderControls();
renderPreview();
