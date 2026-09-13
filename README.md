# 白银三清的博客

基于 VuePress 2.x 的现代化个人博客，专注于技术分享和学习笔记。

## ✨ 特性

- 🚀 现代化设计，响应式布局，支持暗色模式
- 📝 完整的博客系统，支持分类、标签、搜索
- 🎨 自定义主题，可定制首页和文章页面
- 🛠️ 工具分享页面
- 🚢 自动化部署脚本

## 📁 项目结构

```
docs/                 # 文档根目录
├── .vuepress/        # VuePress 配置
│   ├── config.js     # 主配置
│   ├── theme/        # 自定义主题
│   └── public/       # 静态资源
├── posts/            # 博客文章
│   ├── linux/        # Linux 相关
│   └── web/          # Web 开发相关
```

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 本地开发
npm run docs:dev

# 构建生产版本
npm run docs:build
```

## 📝 写作

在 `docs/posts/` 下创建 Markdown 文件，添加 frontmatter：

```markdown
---
title: 文章标题
date: 2024-01-01
category: [分类]
tag: [标签]
---
```

## 🚢 部署

**部署前准备简述：**

1. 在本地 Windows 电脑上生成 SSH 密钥对：
   ```powershell
   ssh-keygen -t rsa -b 4096 -f C:\Users\你的用户名\.ssh\id_rsa_blog
   ```
   （一路回车即可，生成私钥和公钥）

2. 将公钥内容上传到服务器：
   ```powershell
   type C:\Users\你的用户名\.ssh\id_rsa_blog.pub | ssh root@服务器IP "mkdir -p .ssh && cat >> .ssh/authorized_keys"
   ```
   （输入一次服务器密码即可）

3. 在 `deploy-config.json` 里填写本地私钥路径（如 `C:/Users/你的用户名/.ssh/id_rsa_blog`），服务器目录用 `/var/www/html/dist/`。

完成后运行 `npm run deploy`，即可免密自动部署。

### 配置
你要新建一个名为`deploy-config.json`的文件，里面填：

```json
{
  "server": {
    "host": "your-server-ip",
    "username": "your-username",
    "privateKeyPath": "~/.ssh/id_rsa",  // 公钥路径
    "remotePath": "/path/to/deploy/dir" // 服务器上部署博客文件的目录路径。
  }
}
```

### 使用

```bash
# 构建
npm run docs:build

# 部署
npm run deploy
```

脚本会自动打包、上传、解压和清理。

### SSH 密钥生成

```bash
ssh-keygen -t rsa -b 4096
ssh-copy-id username@server-ip
```

## 🖥️ 首页 3D 场景里的 GitHub 屏幕

- 原理：屏幕本身就是个 iframe（内嵌网页）；但 github.com 不允许被别的站嵌，所以我们在自己服务器上另起一个网页，再把这个网页嵌进来。
- 屏幕里嵌的是自建的 GitHub 资料页。
- 用开源项目 [arifszn/gitprofile](https://github.com/arifszn/gitprofile) 构建，改配置里的 `github.username` / `base: '/gh-profile/'` 后 `npm run build` 即可。
- 构建产物部署到自己的服务器目录（如 `/var/www/github-profile`），用 nginx 的 `location ^~ /gh-profile/` 对外提供；由 `createScene.js` 的 `profileUrl` 和 `paper-home/index.html` 的 iframe `src` 引用。

---

⭐ 如果对你有帮助，请给个 Star！