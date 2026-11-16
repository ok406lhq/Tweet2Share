# Tweet2Share

Turn X (Twitter) posts into beautiful, shareable images.

Tweet2Share 是一个轻量级网页工具。粘贴公开推文链接后，系统提取正文、作者信息和原图，自动排版为分享卡片，并导出 PNG。

核心体验：复制链接 → 自动提取 → 自动排版 → 导出分享。

## 功能

- 识别 `x.com` / `twitter.com` 及常见公开镜像链接，也支持直接粘贴推文 ID
- 提取正文、作者名称、用户名、头像与认证标记，保留换行
- 按原顺序提取图片，优先使用 `name=orig` 原图
- 引用推文嵌套展示
- 预览卡片后导出长图 PNG，或按约 2000px 高度分页导出

## 技术栈

- 前端：Vite + 原生 JavaScript + html-to-image
- 后端：Express
- 推文来源：公开的 [FxTwitter API](https://docs.fxembed.com/api/twitter/operations/2statusid/)
- 图片经后端同源代理，便于画布导出

## GitHub Pages

仓库地址：https://github.com/ok406lhq/Tweet2Share

Pages 地址：https://ok406lhq.github.io/Tweet2Share/

GitHub Pages 只托管静态前端。推送到 `main` 后，Actions 会构建 `frontend/` 并发布。首次需要在仓库 Settings → Pages 中把 Source 设为 GitHub Actions。

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
- 请遵守 X（Twitter）服务条款
- 保存或分享前请确认拥有相应使用权限，并保留原作者署名
- 私密账号、已删除或不公开的推文无法解析
