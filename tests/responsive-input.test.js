const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');

assert.match(
    html,
    /<meta name="viewport" content="width=device-width, initial-scale=1\.0, viewport-fit=cover">/
);
assert.match(html, /\*, \*::before, \*::after \{ box-sizing: border-box; \}/);
assert.match(html, /env\(safe-area-inset-top\)/);
assert.match(html, /env\(safe-area-inset-right\)/);
assert.match(html, /env\(safe-area-inset-bottom\)/);
assert.match(html, /env\(safe-area-inset-left\)/);
assert.match(html, /@media \(pointer: coarse\)[\s\S]*?min-height: 44px/);
assert.match(html, /\.modal-overlay[\s\S]*?overflow-y: auto;[\s\S]*?touch-action: pan-y;/);
assert.match(html, /#main-menu[\s\S]*?overflow-y: auto;[\s\S]*?touch-action: pan-y;/);
assert.match(
    html,
    /#glossary-modal \[role="tablist"\][\s\S]*?overflow-x: auto;[\s\S]*?touch-action: pan-x;[\s\S]*?min-height: 48px;/
);
assert.match(html, /#glossary-modal \[role="tab"\][\s\S]*?flex: 0 0 auto;/);

const modalIds = [
    'achievements-modal',
    'levelup-modal',
    'contract-modal',
    'glossary-modal',
    'skins-modal',
    'settings-modal'
];
for (const modalId of modalIds) {
    assert.match(
        html,
        new RegExp(`id="${modalId}" class="modal-overlay"[^>]*aria-hidden="true"`)
    );
}

assert.match(
    html,
    /const blockedGameplaySelector = '#main-menu, \.modal-overlay, #tutorial-overlay, #orientation-overlay';/
);
assert.match(
    html,
    /window\.addEventListener\('mouseup', handleInputUp\);/,
    'mouse release must clear dive even when the pointer ends over UI'
);
assert.match(html, /this\.engine\.renderer\.canvas\.dataset\.inputActive = 'true';/);
assert.match(html, /this\.engine\.renderer\.canvas\.dataset\.inputActive = 'false';/);
assert.match(
    html,
    /window\.addEventListener\('touchend', \(e\) => \{\s*handleInputUp\(\);[\s\S]*?\}, \{passive: false\}\);/,
    'touch release must clear dive before deciding whether to prevent the default action'
);
assert.match(html, /window\.addEventListener\('touchcancel', handleInputUp/);
assert.match(html, /window\.addEventListener\('pointercancel', handleInputUp/);
assert.match(
    html,
    /window\.matchMedia\('\(orientation: portrait\) and \(max-width: 900px\)'\)\.matches/
);
assert.match(html, /window\.addEventListener\('orientationchange', pauseForPortrait\);/);
assert.match(html, /window\.addEventListener\('resize', pauseForPortrait\);/);

assert.match(html, /if \(e\.key === 'Tab' && activeDialog\)/);
assert.match(html, /activeDialog\.contains\(document\.activeElement\)/);
assert.match(html, /last\.focus\(\{ preventScroll: true \}\)/);
assert.match(html, /first\.focus\(\{ preventScroll: true \}\)/);
assert.match(
    html,
    /this\.engine\.renderer\.canvas\.focus\(\{ preventScroll: true \}\);/,
    'the canvas should regain focus after a mutation choice'
);
assert.match(html, /const healthBarWidth = Math\.min\(360, engine\.renderer\.baseWidth \* 0\.42\);/);
assert.match(html, /const healthRatio = Math\.max\(0, Math\.min\(1, b\.hp \/ b\.maxHp\)\);/);

const ids = Array.from(html.matchAll(/\sid="([^"]+)"/g), (match) => match[1]);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
assert.deepEqual(duplicates, [], `HTML ids should be unique: ${duplicates.join(', ')}`);

console.log('RESPONSIVE_INPUT_OK');
