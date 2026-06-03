const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\Dante\\.gemini\\antigravity\\brain\\dc4bbabf-ccc7-4041-b7fd-846ae5f2a793\\.system_generated\\logs\\transcript.jsonl';
if (!fs.existsSync(logPath)) {
  console.log('Log file does not exist at', logPath);
  process.exit(1);
}

const content = fs.readFileSync(logPath, 'utf8');
const lines = content.split('\n');

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.step_index === 148) {
      const tc = obj.tool_calls.find(t => t.name === 'write_to_file');
      if (tc) {
        fs.writeFileSync('d:\\gemini-lo-taro\\scratch\\auto_crop_restored.py', tc.args.CodeContent);
        console.log('Restored auto_crop.py to scratch/auto_crop_restored.py!');
      }
    }
  } catch (e) {
    console.error(e);
  }
}
