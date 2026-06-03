# OHZI.io 设计拆解报告
- **来源**: https://ohzi.io
- **分析日期**: 2026-06-02
- **用途**: 为 Lo 娘灵魂塔罗 v5 前端 UI/UX 重设计提供参考

---

## 1. 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | **Vanilla HTML/CSS/JS**（无 React/Vue） |
| 3D 背景 | **Three.js**（WebGL 星空粒子） |
| 字体 | **Unbounded**（Google Fonts，几何未来感） |
| 打包 | **Vite**（`/index.cf0af6ce.js`，hash 命名） |
| 部署 | Cloudflare（email protection + beacon） |

**关键发现**：不是 Flutter，是纯原生 JS + Three.js 的 SPA。

---

## 2. 排版布局

```
全屏 SPA（100vh，overflow:hidden）
├── canvas-container（Three.js 星空背景，fixed absolute）
├── .section（每个页面，absolute，z-index:1）
│   ├── section__title（每个字母单独 div，支持逐字动画）
│   └── section__description（max-width: 31.25rem，绝对定位左/右）
├── .component（header/footer/progress-bar，absolute）
└── .data（SEO 隐藏层，h1-h4 文本）
```

**排版特点**：
- 标题字间距 `letter-spacing: 15px`（桌面）— 极宽
- 标题字号 `47px`（桌面），`text-shadow: 0 0 30px #000` 发光
- 每个字母独立 `<div>` — 可逐字动画
- 正文字重 `font-weight: 200`（极细），行高 `1.375rem`
- 小屏 6 个断点：370 / 568 / 820 / 960 / 1366 / 1920 / 2560px

---

## 3. 交互逻辑

| 交互 | 实现方式 |
|------|---------|
| 页面切换 | `app.go_to(section)` — 隐藏当前 section，显示目标 |
| 菜单导航 | 桌面左侧竖排菜单（带滑动指示条），移动端全屏菜单 |
| 滚动提示 | 右下角 "SCROLL TO EXPLORE" + 右侧 progress bar（细线） |
| 卡片悬浮 | `.button:hover { opacity: 0.8 }` + `.button:active { scale: 0.95 }` |
| 毛玻璃弹窗 | `backdrop-filter: blur(5px)` + `background: #1f2a35` |
| 进度条 | 自定义 CSS 动画（transform scale from 0 to 1） |
| Tap-to-play | 移动端 "TAP AND HOLD TO PLAY" + 扩散光环动画 |

---

## 4. 动效

```
@keyframes tap-icon-animation-halo
  0%   { opacity: 1; transform: scale(0) }
  100% { opacity: 0; transform: scale(2.5) }
  // 4 个光环错开 1.25s，5s 循环

过渡效果：
- .button → opacity 0.3s
- .container.blur → filter blur 50px 0.3s
- .menu-mobile → opacity 0.3s
- .footer__email-text → transform + opacity 0.3s
- .contact__email-underline → opacity 0.2s
```

**动效哲学**：全部 CSS transition/keyframes，无 JS 动画库。慢（0.3-0.6s），ease-out，克制。

---

## 5. 配色方案

| 用途 | 色值 |
|------|------|
| 背景 | `#111`（近黑） |
| 主文字 | `#fff`（纯白） |
| 次文字 | `#ddd` / `#f5f5f7` |
| 金色强调 | `#f7cf48`（SVG polygon 描边 + drop-shadow） |
| 弹窗背景 | `#1f2a35`（深蓝灰） |
| 按钮 hover | `#fff6`（白 40% 透明度） |
| 链接 hover underline | `#ffffffbe` |

---

## 6. 图片元素

| 类型 | 用途 |
|------|------|
| `/banner.jpg` | OG/Twitter 分享图 |
| `/favicon_white/black.png` | 深/浅模式 favicon |
| `/icon_180.png` | Apple touch icon |
| `/ohzi_interactive_studio.svg` | Header logo |
| `/email.jpg` | Newsletter 弹窗配图 |
| `/lab.mp4` + `.webp` | 内部项目视频 + 封面 |
| `/wishful-tree.mp4` + `.webp` | 同上 |
| `/bdaycake.mp4` + `.webp` | 同上 |
| `/ohziverse.mp4` + `.webp` | 同上 |
| SVG 内联 | Instagram/Medium/LinkedIn 图标（path 绘制） |

**无外部图片 CDN**，全部自托管。视频 autoplay loop muted。

---

## 7. 对 Lo 娘灵魂塔罗 Flutter 的可借鉴点

| 可借鉴 | Flutter 实现方式 |
|--------|-----------------|
| 极宽字间距标题 | `letterSpacing: 15` + `fontWeight: 600` + `TextShadow` |
| 文字发光 | `Shadow(blurRadius: 30, color: Colors.black)` |
| 逐字动画 | 拆 title 为 `List<String>` + `AnimatedList` / `flutter_animate` |
| 按钮 hover/active | `InkWell` + `onHover` + `scale` on tap |
| 页面淡入淡出 | `PageRouteBuilder` + `FadeTransition` |
| 毛玻璃弹窗 | `BackdropFilter` + `ImageFilter.blur(sigmaX: 10)` |
| 自定义进度条 | `Container` + `AnimatedContainer`（宽度 0→100%） |
| 深色 + 金色 | 沿用 #0A0612 + #E5C68F |
| 响应式断点 | `LayoutBuilder` + `MediaQuery` 判断宽度 |

---

## 8. 不可借鉴（技术栈差异）

- Three.js WebGL 星空（Flutter 无等价轻量方案）
- 原生 CSS `will-change` 优化（Flutter 自行管理）
- 单文件打包（Flutter 天然多文件）

---

## 结论

OHZI 的核心设计语言是「暗黑 + 几何 + 克制动效」。Lo 娘灵魂塔罗可以用同样的暗黑 + 金色 + 大间距 + 发光标题 + 毛玻璃来升级。

**原始源码文件**：
- `D:\小红书作业\ohzi_source.html`（33KB）
- `D:\小红书作业\ohzi_style.css`（30KB）
