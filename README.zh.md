# Tweet2Share

把公开的 X（Twitter）帖子变成好读、可分享的 PNG 图片。

在线地址：https://ok406lhq.github.io/Tweet2Share/

[English](README.md)

## 做什么

粘贴公开帖子链接。Tweet2Share 保留原文、作者和图片顺序，排成分享卡片，并导出 PNG。

流程：复制链接 → 导入 → 选择排版 → 导出。

## 功能

- 识别 `x.com` / `twitter.com`、常见公开镜像，以及纯推文 ID
- 提取正文、作者名称、用户名、头像与认证标记，保留换行
- 按原顺序加载静态图片，优先使用 `name=orig` 原图；GIF 和视频会省略
- 引用推文嵌套展示
- 可选在帖子下方带评论，按相关性排序，条数可调；广告类回复会跳过
- 导出长图 PNG，或按约 2000px 高度分页
- 网站支持中 / 英切换（默认中文）
- 署名 `anomo` 出现在网页右上角，以及导出图右下角

## 技术栈

- 前端：Vite + 原生 JavaScript，Canvas 导出
- 后端：Express（仅本地开发）
- 推文来源：公开的 [FxTwitter API](https://docs.fxembed.com/api/twitter/operations/2statusid/)
- 本地图片走同源代理，便于画布导出

## GitHub Pages

仓库：https://github.com/ok406lhq/Tweet2Share

Pages 只托管静态前端。推送到 `main` 后，Actions 会构建 `frontend/`。首次需要在仓库 Settings → Pages 把 Source 设为 GitHub Actions。

Pages 没有后端。浏览器直连 FxTwitter；导出时通过带 CORS 的图片代理加载推文图片。

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
