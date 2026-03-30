# ClipNest 📋

> 跨浏览器剪贴板历史管理插件，自动记录你复制过的文字、链接和图片。

---

## ✨ 功能简介

- 📝 **文字**：自动保存复制的文本内容，最多 50 条
- 🔗 **链接**：自动识别并单独归类复制的 URL，最多 50 条
- 🖼️ **图片**：记录页面图片来源地址，支持跳转原页，最多 50 条
- 🔔 **满额提醒**：超过 50 条时自动移除最旧记录并通知用户
- 💾 **本地存储**：所有数据仅存于本地，不上传任何服务器

---

## 🌐 支持浏览器

| 浏览器 | 支持版本 |
|--------|---------|
| Google Chrome | 88+ |
| Microsoft Edge | 88+ |
| Firefox | 78+ |

---

## 🚀 安装方法

### Chrome / Edge（开发者模式）

1. 下载并解压项目文件夹
2. 打开浏览器，地址栏输入：
   ```
   chrome://extensions
   ```
3. 右上角开启 **开发者模式**
4. 点击 **加载已解压的扩展程序**
5. 选择 `clipnest/` 文件夹，点击确认
6. 工具栏出现 ClipNest 图标即安装成功 ✅

### Firefox

1. 地址栏输入：
   ```
   about:debugging#/runtime/this-firefox
   ```
2. 点击 **临时载入附加组件**
3. 选择项目中的 `manifest.firefox.json` 文件

---

## 📖 使用方法

1. **正常上网**，像平时一样复制文字、链接或图片
2. 点击浏览器工具栏中的 **ClipNest 图标** 打开面板
3. 切换顶部 Tab 查看 **文字 / 链接 / 图片** 三类记录
4. 点击 **复制按钮** 重新复制内容
5. 点击 **删除按钮** 移除单条记录
6. 点击 **清空全部** 一键清除当前分类所有记录

---

## 📁 项目结构

```
clipnest/
├── manifest.json           # Chrome / Edge 配置（Manifest V3）
├── manifest.firefox.json   # Firefox 配置（Manifest V2）
├── popup.html              # 插件弹窗界面
├── popup.css               # 界面样式
├── popup.js                # 界面交互逻辑
├── content.js              # 页面注入脚本，监听复制事件
├── background.js           # 后台服务，处理数据存储
└── icons/                  # 插件图标
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## 🔒 隐私说明

ClipNest 的所有数据均存储在**本地浏览器**中，不收集、不上传、不共享任何用户数据。

---

## 📄 License

MIT License © 2024 ClipNest
