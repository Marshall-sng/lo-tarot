const fs = require('fs');

const logPath = 'C:\\Users\\Dante\\.gemini\\antigravity\\brain\\dc4bbabf-ccc7-4041-b7fd-846ae5f2a793\\.system_generated\\logs\\transcript.jsonl';
const content = fs.readFileSync(logPath, 'utf8');
const lines = content.split('\n');

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.step_index === 148) {
      const tc = obj.tool_calls.find(t => t.name === 'write_to_file');
      if (tc) {
        let code = tc.args.CodeContent;
        // Let's see if it needs JSON.parse again or replacing
        if (code.startsWith('"') && code.endsWith('"')) {
          try {
            code = JSON.parse(code);
          } catch(e) {
            code = eval(code); // fall back if simple parse fails
          }
        }
        // If it's still containing literal \n
        if (code.includes('\\n')) {
          code = code.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        }
        fs.writeFileSync('d:\\gemini-lo-taro\\scratch\\auto_crop_clean.py', code);
        console.log('Restored clean auto_crop.py to scratch/auto_crop_clean.py');
      }
    }
  } catch (e) {
    console.error(e);
  }
}
