import "./style.css";
import { toPng } from "html-to-image";

const PAGE_HEIGHT = 2000;
const SAMPLE_URL = "https://x.com/jack/status/20";

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
  { id: "sans", label: "Instrument Sans" },
  { id: "grotesk", label: "Space Grotesk" },
  { id: "serif", label: "Georgia" },
];

const app = document.querySelector("#app");

const state = {
  tweet: null,
  loading: false,
  error: "",
  status: "",
  treatment: "paper",
  font: "sans",
  textSize: 24,
  background: "mist",
  cardWidth: 560,
  outerSpacing: 64,
  corners: 20,
  shadow: 28,
  showPhotos: true,
  showQuote: true,
  showDate: true,
  showSource: true,
};

app.innerHTML = `
  <div class="app">
    <header class="topbar">
      <div class="logo"><img class="mark-img" src="/favicon.png" alt="" /> Tweet2Share</div>
      <div class="chips">
        <span class="chip">免费 · 无需登录</span>
        <span class="chip">无水印</span>
        <span class="chip">X / Twitter 链接</span>
      </div>
    </header>

    <section class="hero">
      <p class="kicker">从一条链接到可分享的图</p>
      <h1>把推文变成图片。<br>保留原文，给它空间。</h1>
      <p>粘贴公开的 X 帖子链接，保留作者与来源，选择一种仍然好读的设计，然后导出 PNG。</p>
    </section>

    <div class="studio-wrap">
      <div class="studio">
        <aside class="panel">
          <form id="parse-form" class="import-box">
            <span class="label">从链接开始 · X / Twitter</span>
            <div class="field">
              <input id="url-input" type="text" placeholder="https://x.com/username/status/123" autocomplete="off" />
              <button class="primary" id="parse-btn" type="submit">导入帖子</button>
            </div>
            <p class="hint">粘贴公开链接后按 Enter。也支持 twitter.com、镜像域名或纯推文 ID。</p>
            <div class="row-actions">
              <button class="ghost" id="sample-btn" type="button">试用公开示例</button>
              <button class="ghost" id="clear-btn" type="button">清空</button>
            </div>
            <div id="error" class="error" hidden></div>
            <div id="status" class="status" hidden></div>
          </form>

          <section class="section">
            <div class="section-h">
              <span class="num">01</span>
              <div>
                <h2>选择样式</h2>
                <p>文字保持 X 返回的原文。</p>
              </div>
            </div>
            <div class="choices" id="treatments"></div>
            <div class="control">
              <div class="control-h"><span>字体</span></div>
              <select id="font-select"></select>
            </div>
            <div class="control">
              <div class="control-h"><span>字号</span><span id="size-val">24 px</span></div>
              <input id="size-range" type="range" min="18" max="36" value="24" />
            </div>
          </section>

          <section class="section">
            <div class="section-h">
              <span class="num">02</span>
              <div>
                <h2>设置场景</h2>
                <p>给帖子留白，但不裁切内容。</p>
              </div>
            </div>
            <div class="swatches" id="backgrounds"></div>
            <div class="control">
              <div class="control-h"><span>卡片宽度</span><span id="width-val">560 px</span></div>
              <input id="width-range" type="range" min="420" max="760" value="560" />
            </div>
            <div class="control">
              <div class="control-h"><span>外边距</span><span id="pad-val">64 px</span></div>
              <input id="pad-range" type="range" min="16" max="120" value="64" />
            </div>
            <div class="control">
              <div class="control-h"><span>圆角</span><span id="radius-val">20</span></div>
              <input id="radius-range" type="range" min="0" max="36" value="20" />
            </div>
            <div class="control">
              <div class="control-h"><span>阴影</span><span id="shadow-val">28</span></div>
              <input id="shadow-range" type="range" min="0" max="60" value="28" />
            </div>
          </section>

          <section class="section">
            <div class="section-h">
              <span class="num">03</span>
              <div>
                <h2>保留上下文</h2>
                <p>缺失信息不会被补造。</p>
              </div>
            </div>
            <div class="toggles">
              <label class="toggle"><input id="tog-photos" type="checkbox" checked /> 图片与视频封面</label>
              <label class="toggle"><input id="tog-quote" type="checkbox" checked /> 引用推文</label>
              <label class="toggle"><input id="tog-date" type="checkbox" checked /> 发布时间</label>
              <label class="toggle"><input id="tog-source" type="checkbox" checked /> 卡片下方来源链接</label>
            </div>
          </section>

          <section class="section">
            <div class="section-h">
              <span class="num">04</span>
              <div>
                <h2>导出</h2>
                <p>长图适配完整内容；分页适合超长帖。</p>
              </div>
            </div>
            <div class="row-actions">
              <button class="primary" id="export-long" type="button" disabled>保存 PNG</button>
              <button class="ghost" id="export-copy" type="button" disabled>复制 PNG</button>
              <button class="ghost" id="export-pages" type="button" disabled>分页导出</button>
            </div>
          </section>
        </aside>

        <section class="preview-col">
          <div class="filebar">
            <div class="filebar-left">
              <span class="live">Live preview</span>
              <strong id="preview-label">粘贴链接后在此预览</strong>
            </div>
            <div class="filebar-actions">
              <button class="ghost" id="open-x" type="button" disabled>打开原帖</button>
            </div>
          </div>
          <div class="scene-scroll">
            <div id="export-canvas" class="export-canvas scene-mist">
              <div id="preview">
                <div class="empty">粘贴公开帖子链接，预览会出现在这里。</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <section class="howto">
      <article>
        <h3>1. 粘贴帖子链接</h3>
        <p>复制一条公开 X / Twitter 帖子链接，导入后保留作者、正文和图片顺序。</p>
      </article>
      <article>
        <h3>2. 设计，但不改字</h3>
        <p>选择样式、背景和间距。原文、名字和用户名保持原样。</p>
      </article>
      <article>
        <h3>3. 保存一张好读的图</h3>
        <p>导出长图 PNG，或把超长内容分页。无水印，适合直接转发。</p>
      </article>
    </section>
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
  exportLong: document.querySelector("#export-long"),
  exportCopy: document.querySelector("#export-copy"),
  exportPages: document.querySelector("#export-pages"),
  openX: document.querySelector("#open-x"),
  preview: document.querySelector("#preview"),
  canvas: document.querySelector("#export-canvas"),
  previewLabel: document.querySelector("#preview-label"),
};

function showError(message) {
  state.error = message || "";
  els.error.hidden = !state.error;
  els.error.textContent = state.error;
}

function showStatus(message) {
  state.status = message || "";
  els.status.hidden = !state.status;
  els.status.textContent = state.status;
}

function proxyUrl(url) {
  if (!url) return "";
  return `/api/proxy?url=${encodeURIComponent(url)}`;
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
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function verifiedBadge() {
  return `<svg class="badge" viewBox="0 0 24 24" aria-hidden="true"><path fill="#1d9bf0" d="M22.25 12c0 1.17-.3 2.27-.84 3.24.54.97.84 2.07.84 3.24 0 3.59-2.91 6.5-6.5 6.5-1.17 0-2.27-.3-3.24-.84A6.47 6.47 0 0 1 9.27 24C5.68 24 2.77 21.09 2.77 17.5c0-1.17.3-2.27.84-3.24A6.47 6.47 0 0 1 2.77 11C2.77 7.41 5.68 4.5 9.27 4.5c1.17 0 2.27.3 3.24.84A6.47 6.47 0 0 1 15.75 4.5c3.59 0 6.5 2.91 6.5 6.5 0 1.17-.3 2.27-.84 3.24.54.97.84 2.07.84 3.24Z"/><path fill="#fff" d="m10.7 16.7-3.2-3.2 1.4-1.4 1.8 1.79 4.4-4.39 1.4 1.41z"/></svg>`;
}

function authorBlock(author) {
  const initial = escapeHtml((author.name || author.screenName || "?").slice(0, 1));
  const avatar = author.avatarUrl
    ? `<img class="avatar" src="${escapeHtml(proxyUrl(author.avatarUrl))}" alt="" />`
    : `<div class="avatar fallback">${initial}</div>`;
  return `
    <div class="card-top">
      ${avatar}
      <div>
        <div class="name-row">
          <span class="display-name">${escapeHtml(author.name)}</span>
          ${author.verified ? verifiedBadge() : ""}
        </div>
        <div class="handle">@${escapeHtml(author.screenName)}</div>
      </div>
    </div>
  `;
}

function photosBlock(photos) {
  if (!state.showPhotos || !photos || photos.length === 0) return "";
  const imgs = photos
    .map(
      (photo) =>
        `<img src="${escapeHtml(proxyUrl(photo.url))}" alt="${escapeHtml(photo.alt || "")}" ${
          photo.width ? `width="${photo.width}"` : ""
        } ${photo.height ? `height="${photo.height}"` : ""} />`
    )
    .join("");
  return `<div class="photos">${imgs}</div>`;
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
    els.preview.innerHTML = `<div class="empty">粘贴公开帖子链接，预览会出现在这里。</div>`;
    els.previewLabel.textContent = "粘贴链接后在此预览";
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
          ? `<div class="meta"><span>${escapeHtml(formatTime(tweet.createdAt))}</span><span>X / Twitter</span></div>`
          : ""
      }
      ${state.showSource ? `<div class="source">${escapeHtml(tweet.url)}</div>` : ""}
    </article>
  `;
  applyDesignVars();
}

function renderControls() {
  els.treatments.innerHTML = TREATMENTS.map(
    (item) => `
      <button class="choice ${state.treatment === item.id ? "active" : ""}" type="button" data-treatment="${item.id}">
        <b>${item.label}</b>
        <small>${item.note}</small>
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
  const handle = (tweet.author.screenName || "tweet").replace(/[^\w.-]/g, "");
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

function sceneFill() {
  if (state.background === "clear") return "#ffffff";
  return undefined;
}

async function captureCanvas() {
  const node = els.canvas;
  const card = document.querySelector("#share-card");
  if (!card) throw new Error("NO_CARD");
  await waitForImages(card);
  const width = Math.round(state.cardWidth + state.outerSpacing * 2);
  const height = Math.ceil(Math.max(node.scrollHeight, card.offsetHeight + state.outerSpacing * 2));
  return toPng(node, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: sceneFill(),
    width,
    height,
    style: {
      width: `${width}px`,
      maxWidth: `${width}px`,
      margin: "0",
      transform: "none",
    },
  });
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

async function parseUrl(url) {
  showError("");
  showStatus("");
  if (!url) {
    showError("请粘贴有效的 X / Twitter 推文链接");
    return;
  }

  state.loading = true;
  els.parseBtn.disabled = true;
  els.parseBtn.innerHTML = `<span class="loading"></span>导入中`;
  try {
    const response = await fetch("/api/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      showError(data.message || "解析失败，请稍后重试");
      return;
    }
    state.tweet = data.tweet;
    showStatus("导入完成。可继续改样式，或直接保存 PNG。");
    renderPreview();
  } catch {
    showError("解析服务暂时不可用");
  } finally {
    state.loading = false;
    els.parseBtn.disabled = false;
    els.parseBtn.textContent = "导入帖子";
  }
}

els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  parseUrl(els.input.value.trim());
});

els.sampleBtn.addEventListener("click", () => {
  els.input.value = SAMPLE_URL;
  parseUrl(SAMPLE_URL);
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
    showError("导出失败，请确认图片已加载完成后再试");
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
    showStatus("PNG 已复制到剪贴板。");
  } catch {
    showError("当前浏览器无法复制图片，请改用保存 PNG");
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
    showError("导出失败，请确认图片已加载完成后再试");
  } finally {
    els.exportPages.disabled = false;
  }
});

renderControls();
renderPreview();
