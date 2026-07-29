# 月之神社主页

这是 `https://byayoi.org` 的静态主页，用于展示月之神社同人社区的定位、作品入口、公告近况、常用入口和参与方式。

## 文件结构

- `index.html`：页面语义结构与主要内容区。
- `styles.css`：视觉系统、响应式布局、焦点样式和移动导航样式。
- `app.js`：主页内容数据与小型交互逻辑，包含 `siteLinks`、`announcementList`、`featuredProjects` 和 `communityChannels`。
- `assets/miko-standee.png`：用户提供的首页看板草图透明线稿。
- `assets/miko-standee-generated.png`：根据草图重绘的首页巫女看板透明线稿。
- `assets/miko-standee.jpg`、`assets/miko-standee-generated.jpg`：PNG 版本的原始来源图备份。

## 本地预览

页面不依赖构建工具或包管理器，可以直接打开：

```text
index.html
```

如果后续托管环境需要 HTTP 服务，也可以在本目录启动任意静态文件服务器。

## 内容维护

更新公告、作品、入口或联系方式时，优先修改 `app.js` 中对应的具名数组。日期字段使用 `YYYY-MM-DD`，页面会统一格式化显示。

未确认的社群链接、公开邮箱、历史年份、成员规模和授权关系不要写入正式内容；确认后再新增对应正式入口。
