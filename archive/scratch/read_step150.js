const fs = require('fs');

const logPath = 'C:\\Users\\Dante\\.gemini\\antigravity\\brain\\dc4bbabf-ccc7-4041-b7fd-846ae5f2a793\\.system_generated\\logs\\transcript.jsonl';
const content = fs.readFileSync(logPath, 'utf8');
const lines = content.split('\n');

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.step_index === 150 || obj.step_index === 151) {
      console.log('--- Step', obj.step_index, '---');
      console.log(obj.content);
    }
  } catch (e) {
    // Ignore
  }
}
