const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const projectRoot = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
const zoneStart = html.indexOf('const ZONE_PROFILES');
const zoneEnd = html.indexOf('const GAMEPLAY_ART', zoneStart);

assert.notEqual(zoneStart, -1, 'zone profiles should exist');
assert.notEqual(zoneEnd, -1, 'gameplay art should follow zone profiles');

const { ZONE_PROFILES } = vm.runInNewContext(
    `${html.slice(zoneStart, zoneEnd)}
    ({ ZONE_PROFILES })`
);

const expectedLoopCounts = { shallow: 5, shipwreck: 5, trench: 5, dark: 5 };

for (const [zoneId, profile] of Object.entries(ZONE_PROFILES)) {
    assert.equal(profile.backgrounds.length, expectedLoopCounts[zoneId], `${zoneId} should have five loop screens`);
    assert.equal(new Set(profile.backgrounds).size, profile.backgrounds.length, `${zoneId} loop screens should be unique`);
    for (const assetPath of profile.backgrounds) {
        assert.ok(fs.existsSync(path.join(projectRoot, assetPath)), `${zoneId} loop asset should exist: ${assetPath}`);
    }
}

assert.match(html, /function getBackgroundTravelDelta\(currentSpeed, bossActive = false\)/);
assert.match(html, /return bossActive \? Math\.max\(0\.55, speed \* 0\.12\) : speed \* 0\.35/);
assert.match(html, /\+ getBackgroundTravelDelta\(currentSpeed, this\.bossSystem\.active\)/);
assert.match(html, /const overlap = 24/);
assert.match(html, /const loopWidth = stride \* assets\.length/);
assert.match(html, /ctx\.globalAlpha = 0\.94 \* \(\(step \+ 1\) \/ blendSteps\)/);
assert.match(html, /this\.backgroundTravel = 0;/);

console.log('BACKGROUND_LOOP_OK');
