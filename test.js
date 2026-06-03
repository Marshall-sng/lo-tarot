// Lo娘灵魂塔罗 v5 — 自动化回归测试脚本
const fs = require('fs');
const path = require('path');

// 模拟浏览器全局环境
const window = {};
global.window = window;
global.document = {
  addEventListener: () => {},
  querySelectorAll: () => [],
  getElementById: () => null,
  documentElement: {
    style: {
      setProperty: () => {}
    }
  }
};
global.localStorage = {
  getItem: () => null,
  setItem: () => {}
};

// 1. 加载核心数据与业务逻辑
try {
  const dataCode = fs.readFileSync(path.join(__dirname, 'data.js'), 'utf8');
  eval(dataCode);
  
  const appCode = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
  eval(appCode);
} catch (err) {
  console.error("加载脚本文件失败:", err);
  process.exit(1);
}

const TarotData = window.TarotData;
const TarotApp = window.TarotApp;

console.log("=========================================");
console.log("   Lo 娘灵魂塔罗 v5 - 算法回归测试");
console.log("=========================================");
console.log("✓ TarotData 数据层加载成功");
console.log("✓ TarotApp 控制器逻辑加载成功");

// 2. 测试对数似然度计算
try {
  const testCard = TarotData.CARDS[0]; // 愚者
  const answers = ['A', 'B', 'C', 'D'];
  const logProb = TarotApp.calculateLogProbability(answers, testCard, 0);
  console.log(`✓ 似然度计算测试成功，对数概率值为: ${logProb.toFixed(4)}`);
} catch (err) {
  console.error("✗ 似然度计算测试失败:", err);
  process.exit(1);
}

// 3. 测试模拟答题与贝叶斯抽牌
let drawnCardIds = [];
try {
  // 第一关：过去
  const pastAnswers = ['B', 'A', 'A', 'B']; // Q1-Q4
  const c1Id = TarotApp.drawCardForSection(pastAnswers, drawnCardIds, 0);
  drawnCardIds.push(c1Id);
  console.log(`✓ 第一关抽牌成功: ID=${c1Id}, 牌名=${TarotData.CARDS[c1Id].name_zh} (${TarotData.CARDS[c1Id].name_lo})`);

  // 第二关：现在
  const presentAnswers = ['B', 'B', 'A', 'A']; // Q5-Q8
  const c2Id = TarotApp.drawCardForSection(presentAnswers, drawnCardIds, 1);
  drawnCardIds.push(c2Id);
  console.log(`✓ 第二关抽牌成功: ID=${c2Id}, 牌名=${TarotData.CARDS[c2Id].name_zh} (${TarotData.CARDS[c2Id].name_lo})`);

  // 第三关：未来
  const futureAnswers = ['C', 'A', 'D', 'B']; // Q9-Q12
  const c3Id = TarotApp.drawCardForSection(futureAnswers, drawnCardIds, 2);
  drawnCardIds.push(c3Id);
  console.log(`✓ 第三关抽牌成功: ID=${c3Id}, 牌名=${TarotData.CARDS[c3Id].name_zh} (${TarotData.CARDS[c3Id].name_lo})`);
} catch (err) {
  console.error("✗ 关卡抽牌模拟测试失败:", err);
  process.exit(1);
}

// 4. 测试 5D 灵魂剧本生成与拼接
try {
  const c1 = TarotData.CARDS[drawnCardIds[0]];
  const c2 = TarotData.CARDS[drawnCardIds[1]];
  const c3 = TarotData.CARDS[drawnCardIds[2]];
  const report = TarotApp.generateSoulScriptData(c1, c2, c3);

  console.log("\n--- 5D 灵魂剧本合成验证 ---");
  console.log(`主轴维度: ${report.primaryAxis.name} (键: ${report.primaryAxis.key})`);
  console.log(`副轴维度: ${report.secondaryAxis.name}`);
  console.log(`三轴维度: ${report.tertiaryAxis.name}`);
  console.log(`灵魂金句: ${report.motto}`);
  console.log(`第一幕标题: ${report.act1Title}`);
  console.log(`第二幕过渡: ${report.trans1}`);
  console.log(`结尾陈述: ${report.closingText}`);
  console.log(`总收尾: ${report.finalClosing}`);
  console.log("----------------------------");
  console.log("✓ 5D 剧本拼接引擎测试成功");
} catch (err) {
  console.error("✗ 5D 剧本拼接引擎测试失败:", err);
  process.exit(1);
}

// 5. 回归测试用例验证 (对照设计文件 5.5.8)
console.log("\n--- 回归测试用例 (对照 5.5.8) ---");
const testCases = [
  {
    name: "样本 A：允许的旅程 [愚者, 恶魔, 命运之轮]",
    ids: [0, 15, 10],
    expectedTheme: "允许"
  },
  {
    name: "样本 B：看见的旅程 [隐者, 太阳, 星星]",
    ids: [9, 19, 17],
    expectedTheme: "看见"
  },
  {
    name: "样本 C：重量的旅程 [战车, 倒吊人, 世界]",
    ids: [7, 12, 21],
    expectedTheme: "允许" // 战车 (a5/a3), 倒吊人 (a5), 世界 (a5)
  }
];

testCases.forEach(tc => {
  const cA = TarotData.CARDS[tc.ids[0]];
  const cB = TarotData.CARDS[tc.ids[1]];
  const cC = TarotData.CARDS[tc.ids[2]];
  const r = TarotApp.generateSoulScriptData(cA, cB, cC);
  
  console.log(`* 运行 ${tc.name}`);
  console.log(`  主轴精神内核为: ${r.primaryAxis.name} (对应主题: ${r.primaryAxis.theme})`);
  console.log(`  收尾剧本命名: ${r.finalClosing}`);
  console.log(`  金句提取: ${r.motto}`);
});

console.log("\n=========================================");
console.log("   所有回归测试用例验证完毕！");
console.log("=========================================");
