# liupass-site

Liupass 战令插件的官方网站，静态站点，无需构建。**支持中英双语，默认英语**，右上角按钮可切换（语言选择保存在浏览器 localStorage）。

## 目录结构

```
liupass-site/
├── index.html      # 首页（data-i18n 国际化）
├── docs.html       # 文档页（marked.js 加载对应语言的 docs/<lang>/*.md）
├── 404.html
├── styles.css
├── i18n.js         # 双语字典 / 语言切换 / 文档路径解析
├── README.md
└── docs/
    ├── en/         # 英文文档（默认）
    │   ├── README.md
    │   ├── USER_GUIDE.md
    │   ├── API.md
    │   └── guide/
    │       ├── 01-install.md
    │       ├── 02-config.md
    │       ├── 03-pass.md
    │       ├── 04-task.md
    │       ├── 05-reward.md
    │       ├── 06-command.md
    │       ├── 07-api.md
    │       └── 08-faq.md
    └── zh/         # 中文文档（同构）
```

## 语言机制

- 当前语言：`localStorage['liupass-lang']`，默认 `en`。
- UI 文案：元素加 `data-i18n="键名"`，`i18n.js` 加载时替换（支持 HTML）。
- 文档：`docs.html` 用 `I18N.doc(name)` 解析为 `docs/<lang>/<name>.md`。
- 切换按钮 `#lang-switch`：点击切换并刷新页面。

## 本地预览

任意静态文件服务器即可：

```bash
cd /home/liu/web/liupass-site
python3 -m http.server 8080
```

浏览器打开 http://127.0.0.1:8080

> 文档页的 markdown 渲染依赖 marked.js（CDN），离线预览时文档页无法渲染，首页不受影响。
