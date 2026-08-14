const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const projectRoot = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
const helperStart = html.indexOf('const ZONE_PROFILES');
const helperEnd = html.indexOf('function hexToRgb', helperStart);

assert.notEqual(helperStart, -1, 'movement helper prelude should exist');
assert.notEqual(helperEnd, -1, 'movement helper should precede color helpers');

const { getSharkTravelMotion } = vm.runInNewContext(
    `${html.slice(helperStart, helperEnd)}
    ({ getSharkTravelMotion })`
);

assert.equal(getSharkTravelMotion({ isDashing: false, inCurrent: false }).targetX, 150);
assert.equal(getSharkTravelMotion({ isDashing: false, inCurrent: true }).targetX, 215);
assert.equal(getSharkTravelMotion({ isDashing: true, inCurrent: false }).targetX, 270);
assert.equal(getSharkTravelMotion({ isDashing: true, inCurrent: true }).targetX, 270);
assert.equal(getSharkTravelMotion({ isDashing: true, inCurrent: true }, true), null);

assert.match(
    html,
    /const impactJolt = engine\.reduceMotion \? 0 : Math\.min\(8, engine\.cameraShake \* 0\.22\)/,
    'impact shake should be localized to the shark render'
);
assert.doesNotMatch(
    html,
    /canvas\.style\.transform = `translate\(/,
    'camera shake should not translate the complete map canvas'
);
assert.doesNotMatch(
    html,
    /const panX = engine\.reduceMotion/,
    'background motion should come from travel distance instead of idle oscillation'
);

console.log('MOVEMENT_READABILITY_OK');
