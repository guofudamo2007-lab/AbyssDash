const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf8');
const plan = fs.readFileSync(path.join(projectRoot, 'DEVELOPMENT_PLAN_v9.9.0.md'), 'utf8');
const qa = fs.readFileSync(path.join(projectRoot, 'QA_CHECKLIST.md'), 'utf8');

assert.match(html, /<title>深渊冲刺 \(Abyss Dash\) v10\.0\.0<\/title>/);
assert.match(html, /<meta name="application-version" content="10\.0\.0">/);
assert.match(html, /id="version-label">v10\.0\.0 · LAYERED DESCENT<\/div>/);
assert.match(readme, /version-v10\.0\.0-00d7ff/);
assert.match(readme, /当前版本：\*\*v10\.0\.0「层渊迁航」\*\*/);
assert.match(readme, /### v10\.0\.0 — 层渊迁航（2026-08-14，阶段 6 记录）/);
assert.match(readme, /### v9\.9\.0 — 深渊长航（2026-08-01）/);
assert.match(readme, /### v9\.8\.0 — 深渊回响（2026-07-28）/, 'v9.8.0 should remain in history');

const musicFirstRequirement = /Boss 音乐先于 Boss 入场动画起奏/;
assert.match(plan, musicFirstRequirement);
assert.match(qa, /先起奏战斗音乐，再开始 Boss 入场动画/);
assert.doesNotMatch(qa, /Boss 入场完成前不播放战斗音乐/);

console.log('VERSION_CONSISTENCY_OK');
