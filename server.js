const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8080;
const CACHE_DIR = path.join(__dirname, 'cache_data');

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// 22 Major Arcana card names in data.js order for CSV translations
const CARD_NAMES = [
  "愚者", "魔术师", "女祭司", "女皇", "皇帝", "教皇", "恋人", "战车",
  "力量", "隐者", "命运之轮", "正义", "倒吊人", "死神", "节制",
  "恶魔", "塔", "星星", "月亮", "太阳", "审判", "世界"
];

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // 1. API Endpoint: Save test report to server as JSON file
  if (pathname === '/api/save-report' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        
        // Validation
        if (!payload.age || !payload.answers || !payload.drawnCards) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Missing required fields' }));
          return;
        }

        const timestamp = Date.now();
        const randomStr = Math.floor(1000 + Math.random() * 9000);
        const reportId = `${timestamp}-${randomStr}`;

        const reportData = {
          id: reportId,
          created_at: new Date().toISOString(),
          age: parseInt(payload.age, 10),
          answers: payload.answers,       // Array e.g., ['A', 'B', ...]
          drawnCards: payload.drawnCards, // Array of card IDs e.g., [0, 3, 19]
          primaryAxis: payload.primaryAxis || ''
        };

        const filePath = path.join(CACHE_DIR, `report_${reportId}.json`);
        fs.writeFile(filePath, JSON.stringify(reportData, null, 2), 'utf8', err => {
          if (err) {
            console.error("Error writing JSON file:", err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Failed to write data' }));
            return;
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, reportId }));
        });

      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  // 2. API Endpoint: Fetch single test report from server
  if (pathname === '/api/get-report' && req.method === 'GET') {
    const reportId = parsedUrl.query.id;
    // Strict pattern matching to prevent directory traversal
    if (!reportId || !/^[0-9]+-[0-9]+$/.test(reportId)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Invalid or missing report ID format' }));
      return;
    }

    const filePath = path.join(CACHE_DIR, `report_${reportId}.json`);
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Report file not found' }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(data);
    });
    return;
  }

  // 3. API Endpoint: Export all records to CSV file for download
  if (pathname === '/api/export-csv' && req.method === 'GET') {
    fs.readdir(CACHE_DIR, (err, files) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Failed to scan storage folder');
        return;
      }

      const jsonFiles = files.filter(f => f.startsWith('report_') && f.endswith('.json'));
      const records = [];

      for (const file of jsonFiles) {
        try {
          const filePath = path.join(CACHE_DIR, file);
          const content = fs.readFileSync(filePath, 'utf8');
          const data = JSON.parse(content);
          records.push(data);
        } catch (e) {
          console.error(`Skipping corrupted file ${file}:`, e);
        }
      }

      // Sort chronologically (latest first)
      records.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // Build CSV output
      // Add UTF-8 BOM (\ufeff) to prevent Excel Chinese character encoding issues
      let csvContent = '\ufeffID,测试时间,年龄,过去卡牌,现在卡牌,未来卡牌,主导精神内核,选项历史\n';

      for (const r of records) {
        const id = r.id;
        const time = r.created_at ? r.created_at.replace('T', ' ').substring(0, 19) : '';
        const age = r.age || '';
        
        // Translate Card IDs to Chinese card names
        const past = r.drawnCards && r.drawnCards[0] !== undefined ? (CARD_NAMES[r.drawnCards[0]] || r.drawnCards[0]) : '';
        const present = r.drawnCards && r.drawnCards[1] !== undefined ? (CARD_NAMES[r.drawnCards[1]] || r.drawnCards[1]) : '';
        const future = r.drawnCards && r.drawnCards[2] !== undefined ? (CARD_NAMES[r.drawnCards[2]] || r.drawnCards[2]) : '';
        
        const theme = r.primaryAxis || '';
        const answers = r.answers ? r.answers.join('-') : '';

        // Safe CSV field escaping helper
        const fields = [id, time, age, past, present, future, theme, answers].map(val => {
          const s = String(val).trim();
          if (s.includes(',') || s.includes('\n') || s.includes('"')) {
            return `"${s.replace(/"/g, '""')}"`;
          }
          return s;
        });

        csvContent += fields.join(',') + '\n';
      }

      res.writeHead(200, {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename=lo_tarot_statistics.csv',
        'Cache-Control': 'no-cache'
      });
      res.end(csvContent);
    });
    return;
  }

  // 4. Default: Static File Server
  if (pathname === '/') {
    pathname = '/index.html';
  }

  // Sanitize path to prevent directory traversal
  const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(__dirname, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('File Not Found — 页面未找到');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Support HTTP Range Requests (206 Partial Content) for videos to prevent playback freeze
    const range = req.headers.range;
    if (range && ext === '.mp4') {
      const totalSize = stats.size;
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

      if (start >= totalSize || end >= totalSize || start > end) {
        res.writeHead(416, {
          'Content-Range': `bytes */${totalSize}`,
          'Content-Type': 'text/plain'
        });
        res.end('Requested Range Not Satisfiable');
        return;
      }

      const chunkSize = (end - start) + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${totalSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });

      fileStream.pipe(res);
      return;
    }

    // Disable caching for index.html to ensure users get the latest builds immediately
    const headers = { 'Content-Type': contentType };
    if (ext === '.html') {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    } else if (ext === '.webp' || ext === '.png') {
      // Long-term cache for card assets to reduce traffic
      headers['Cache-Control'] = 'public, max-age=31536000';
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }
      res.writeHead(200, headers);
      res.end(data);
    });
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  Lo娘灵魂塔罗 Server running at http://localhost:${PORT}`);
  console.log(`  - 静态资源与页面加载中`);
  console.log(`  - JSON数据文件夹: ./cache_data`);
  console.log(`  - CSV导出接口: http://localhost:${PORT}/api/export-csv`);
  console.log(`====================================================`);
});
