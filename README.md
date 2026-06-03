# Lo娘灵魂塔罗 (Lo Tarot) — 部署与运行说明文档

本项目是一款面向手机端的 **Lo娘灵魂塔罗 (Lo Tarot)** Web 应用程序。前端基于原生 HTML5 / CSS3 / Vanilla JS 结合 Three.js 实现 3D WebGL 粒子星空与海报生成；后端基于 Node.js 原生 API 搭建，支持视频 Range 流式分片请求、用户答题数据存储以及 CSV 导出。

---

## 📋 目录结构说明

```text
├── index.html          # 前端主页面 (响应式自适应布局)
├── style.css           # 移动端优先的样式表 (CSS3 动效、iOS 安全区适配)
├── app.js              # 前端交互与 WebGL 3D 粒子系统控制、超采样 Canvas 海报生成
├── data.js             # 22张大阿卡纳牌数据、文案与 5D 性格推导算法
├── server.js           # 后端静态服务器 (支持 HTTP 206 视频分片、数据 API)
├── package.json        # 项目基本配置 (支持 npm start 命令)
├── .gitignore          # Git 忽略配置文件 (过滤 cache_data 目录)
├── 6e629738-b3e1-4a2f-93cf-833c7b933654.mp4 # 欢迎页引导视频
├── assets/             # 静态资源目录
│   └── cards/          # 22张高清 Lolita 塔罗牌插画 (WebP 格式，已根据 ID 命名)
└── cache_data/         # 运行时自动生成的文件夹，用于存储用户测试报告 (JSON 格式)
```

---

## 🛠️ 环境要求

* **Node.js**：`v16.0.0` 或更高版本（免第三方库依赖，使用 Node.js 内置模块即可运行）。
* **Git**：用于版本控制和代码发布。

---

## 🚀 本地开发与启动

在项目根目录下，您可以通过以下两种方式之一启动本地服务器：

### 方式一：使用 npm 脚本 (推荐)
```bash
# 启动服务
npm start
```

### 方式二：使用 node 直接运行
```bash
# 启动服务
node server.js
```

服务启动后，在浏览器访问以下地址即可测试：
* **前端访问入口**：`http://localhost:8080`
* **CSV 报表导出**：`http://localhost:8080/api/export-csv` （直接在浏览器打开即可下载已收集的所有答题记录数据）

---

## 🌐 线上服务器部署指南

### 方案一：云服务器 (阿里云 / 腾讯云 / VPS) 部署（推荐）

这是最适合本项目的部署方式，能够直接支持本地 JSON 文件的数据写入。

#### 1. 上传代码
将项目文件夹上传到服务器（例如 `/www/wwwroot/lo-tarot` 路径下）。
> ⚠️ **注意**：请不要把本地的 `cache_data/` 文件夹同步上去，或者在服务器端确保该目录为空，由 Node.js 服务自动创建。

#### 2. 使用 PM2 在后台持续运行服务
为了保证 SSH 关闭后服务不挂掉，推荐安装并使用 `PM2` 进行进程守护：
```bash
# 全局安装 pm2
npm install pm2 -g

# 在项目根目录下启动服务并命名
pm2 start server.js --name "lo-tarot"

# 设置开机自启
pm2 save
pm2 startup
```

#### 3. 配置 Nginx 反向代理与 SSL 证书
为了使用域名和 HTTPS 访问，建议在 Nginx 中配置反向代理：
```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name yourdomain.com; # 您的域名

    # SSL 证书配置 (可选，强烈推荐)
    ssl_certificate /path/to/ssl.crt;
    ssl_certificate_key /path/to/ssl.key;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 视频 Range 请求透传支持
        proxy_set_header Range $http_range;
        proxy_set_header If-Range $http_if_range;
        proxy_no_cache $http_range;
    }
}
```

---

### 方案二：Serverless 平台部署 (如 Vercel) ⚠️ 特别注意

由于本项目的用户测试数据在 `server.js` 中是以**本地 JSON 文件形式写入磁盘**（`cache_data`）的：
1. **Serverless 的只读限制**：Vercel、Netlify 等平台的运行时环境是只读的，直接写入 `cache_data` 会报错。
2. **数据易失性**：即使使用临时目录 `/tmp` 写入，Serverless 实例一旦重启/休眠，数据就会被清空。

**如需部署在 Serverless 平台，建议修改数据存储逻辑**：
* 编辑 `server.js`，将 `fs.writeFile` 保存数据的逻辑，替换为写入外部的第三方云数据库（如 **Supabase**、**MongoDB Atlas**、**Redis** 或云厂商的 RDS/NoSQL 数据库）。

---

## 💾 用户答题数据结构说明

每次用户测试完成后，会在后台的 `cache_data/` 目录下生成一个名为 `report_${timestamp}-${random}.json` 的数据文件，其数据格式示例如下：

```json
{
  "id": "1780472462961-2196",
  "created_at": "2026-06-03T09:27:42.961Z",
  "age": 22,
  "answers": ["A", "B", "A", "C", "D"],
  "drawnCards": [0, 3, 19],
  "primaryAxis": "自我接纳"
}
```
* `answers`: 用户对应每道测试题的选项选择。
* `drawnCards`: 抽取的三张卡牌的数字 ID（对应 `data.js` 中的 0~21 张卡牌）。
* `primaryAxis`: 通过贝叶斯推导算法得出的用户占比最高的人格维度（共 5 种特质）。
