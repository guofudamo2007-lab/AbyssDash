const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');

assert.doesNotMatch(html, /user-scalable\s*=\s*no|maximum-scale\s*=\s*1/, 'page zoom must remain available');
assert.match(html, /\.modal-panel[\s\S]*?overflow-y:\s*auto[\s\S]*?touch-action:\s*pan-y/, 'modal panels should scroll at high zoom and on touch');
assert.match(html, /<button type="button" class="menu-btn" id="btn-start">/, 'main actions should use native buttons');
assert.match(html, /<button type="button" id="pause-btn" aria-label="暂停游戏"/, 'pause should be keyboard accessible');
assert.match(html, /<canvas id="gameCanvas" tabindex="0" role="application"/, 'game canvas should be keyboard focusable');
assert.match(html, /window\.addEventListener\('touchcancel', handleInputUp/, 'touch cancellation should release dive input');
assert.match(html, /window\.addEventListener\('pointercancel', handleInputUp/, 'pointer cancellation should release dive input');
assert.match(
    html,
    /window\.addEventListener\('blur', \(\) => \{[\s\S]*?handleInputUp\(\);[\s\S]*?state === 'PLAYING'[\s\S]*?togglePause\(\)/,
    'window blur should release input and pause active gameplay'
);
assert.match(
    html,
    /if \(Array\.isArray\(this\.particles\)[\s\S]*?this\.particles\.splice[\s\S]*?if \(Array\.isArray\(this\.planks\)\)[\s\S]*?this\.planks\.splice/,
    'quality changes should immediately enforce active visual limits'
);
assert.match(html, /role="dialog" aria-modal="true" aria-label="设置"/);
assert.match(html, /role="tablist" aria-label="图鉴分类"/);
assert.doesNotMatch(html, /TEST OCTOPUS|VISUAL_TEST|runVisualTest/, 'temporary visual test controls must not ship');

console.log('ACCESSIBILITY_PERFORMANCE_OK');
