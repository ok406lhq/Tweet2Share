# Tweet2Share

把公开的 X（Twitter）和微博帖子变成好读、可分享的 PNG 图片。

在线地址：https://ok406lhq.github.io/Tweet2Share/

[English](README.md)

## 做什么

粘贴公开的 X 或微博链接。Tweet2Share 保留原文、作者和图片顺序，排成分享卡片，并导出 PNG。

流程：复制链接 → 导入 → 选择排版 → 导出。

## 功能

- 识别 `x.com` / `twitter.com`、常见公开镜像、纯推文 ID，以及公开微博链接（`weibo.com`、`m.weibo.cn`、微博 bid）
- 提取正文、作者名称、用户名、头像与认证标记，保留换行
- 按原顺序加载静态图片，优先使用 `name=orig` 原图；GIF 和视频会省略
- 引用推文与微博转发嵌套展示
- 可选在帖子下方带评论，按相关性排序，条数可调；广告类回复会跳过
- 导出长图 PNG，或按约 2000px 高度分页
- 网站支持中 / 英切换（默认中文）
- 署名 `anomo` 出现在网页右上角，以及导出图右下角

## 技术栈

- 前端：Vite + 原生 JavaScript，Canvas 导出
- 后端：Express（仅本地开发）
- 推文来源：公开的 [FxTwitter API](https://docs.fxembed.com/api/twitter/operations/2statusid/)
- 微博来源：公开的 `m.weibo.cn` 正文、长文和热评接口
- 本地图片走同源代理，便于画布导出

## GitHub Pages

仓库：https://github.com/ok406lhq/Tweet2Share

Pages 只托管静态前端。推送到 `main` 后，Actions 会构建 `frontend/`。首次需要在仓库 Settings → Pages 把 Source 设为 GitHub Actions。

Pages 没有后端。浏览器直连 FxTwitter；导出 X 图时通过带 CORS 的图片代理加载。

微博 JSON 没有 CORS，而且必须带 `X-Requested-With: XMLHttpRequest` 才会返回数据。公开 CORS 代理会丢掉这个头。

要在 Pages 上导入微博：

1. 安装 [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) 并登录。
2. 在仓库根目录执行：`npx wrangler deploy --config worker/wrangler.toml`
3. 复制 Worker 地址（例如 `https://tweet2share-weibo.<账号>.workers.dev`）。
4. 打开 GitHub 仓库 Settings → Secrets and variables → Actions → Variables，新增 `VITE_WEIBO_PROXY`，值为该地址。
5. 重新跑一遍 Pages 工作流。

未配置该变量时，请用本地后端（`bash start.sh`）。

## 本地运行

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install

# 回到仓库根目录，同时启动前后端
cd ..
bash start.sh
```

前端默认 `http://localhost:5173`，后端 `http://localhost:3001`。开发时 Vite 会把 `/api` 代理到后端。

```bash
# 运行后端单元测试
npm --prefix backend test
```

## 使用说明

- 仅处理你有权访问和使用的公开内容
- 请遵守 X（Twitter）和微博服务条款
- 保存或分享前请确认拥有相应使用权限，并保留原作者署名
- 私密账号、已删除或不公开的推文无法解析
