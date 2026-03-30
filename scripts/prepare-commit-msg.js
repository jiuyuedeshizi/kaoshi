/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');

const commitMsgFile = process.argv[2];
if (!commitMsgFile) process.exit(0);

let msg = fs.readFileSync(commitMsgFile, 'utf-8').trim();
if (!msg) process.exit(0);

const mapping = [
  [/^feat:/i, '新增：'],
  [/^fix:/i, '修复：'],
  [/^docs:/i, '文档：'],
  [/^style:/i, '样式：'],
  [/^refactor:/i, '重构：'],
  [/^perf:/i, '性能：'],
  [/^test:/i, '测试：'],
  [/^chore:/i, '维护：']
];

let newMsg = msg;
for (const [pattern, replacement] of mapping) {
  if (pattern.test(newMsg)) {
    newMsg = newMsg.replace(pattern, replacement);
    break;
  }
}

if (/^[a-zA-Z0-9 ,.'"\n\-]+$/.test(newMsg) && !newMsg.startsWith('请翻译为中文：')) {
  newMsg = `请翻译为中文：${newMsg}`;
}

fs.writeFileSync(commitMsgFile, newMsg, 'utf-8');
