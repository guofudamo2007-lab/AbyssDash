const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const projectRoot = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
const pacingStart = html.indexOf('const ZONE_PROFILES');
const pacingEnd = html.indexOf('function hexToRgb', pacingStart);

assert.notEqual(pacingStart, -1, 'zone profiles should exist');
assert.notEqual(pacingEnd, -1, 'fish pacing helpers should precede color helpers');

const { ZONE_PROFILES, getFishSpawnPlan } = vm.runInNewContext(
    `${html.slice(pacingStart, pacingEnd)}
    ({ ZONE_PROFILES, getFishSpawnPlan })`
);

const normalIntervals = {
    shallow: 54,
    shipwreck: 48,
    trench: 66,
    dark: 78
};

for (const [zoneName, expectedInterval] of Object.entries(normalIntervals)) {
    const plan = getFishSpawnPlan(ZONE_PROFILES[zoneName], false, null, expectedInterval);
    assert.equal(plan.interval, expectedInterval, `${zoneName} normal pacing should remain unchanged`);
    assert.equal(plan.count, 1, `${zoneName} normal pacing should spawn one fish`);
}

{
    const firstRushSpawn = getFishSpawnPlan(ZONE_PROFILES.dark, true, null, 48);
    assert.equal(firstRushSpawn.interval, 48, 'dark-zone Rush should shorten the fish interval');
    assert.equal(firstRushSpawn.count, 1, 'ordinary Rush spawns should stay visually restrained');

    const lateRushSchool = getFishSpawnPlan(ZONE_PROFILES.dark, true, null, 192);
    assert.equal(lateRushSchool.interval, 48);
    assert.equal(lateRushSchool.count, 2, 'every fourth dark-zone Rush spawn should form a small school');
}

{
    const octopusPlan = getFishSpawnPlan(ZONE_PROFILES.dark, true, 'octopus', 192);
    assert.equal(octopusPlan.interval, 48);
    assert.equal(octopusPlan.count, 1, 'Boss encounters should not receive the extra dark-zone school');

    const megalodonPlan = getFishSpawnPlan(ZONE_PROFILES.dark, true, 'megalodon', 200);
    assert.equal(megalodonPlan.interval, 40, 'Megalodon should retain its dedicated supply interval');
    assert.equal(megalodonPlan.count, 1, 'Megalodon supply pacing should remain independent');
}

{
    const canvasWidth = 900;
    const dashSpeed = 14;
    const maximumLeftwardFishSpeed = 2.02;
    const visibleLifetimeTicks = canvasWidth / (dashSpeed * 0.7 + maximumLeftwardFishSpeed);
    const rushPlan = getFishSpawnPlan(ZONE_PROFILES.dark, true, null, 48);

    assert.ok(
        rushPlan.interval < visibleLifetimeTicks,
        'the next Rush fish should spawn before the previous fish can leave the screen'
    );
}

const gameEngineSource = html.slice(html.indexOf('class GameEngine'));
assert.match(
    gameEngineSource,
    /getFishSpawnPlan\(profile,\s*this\.shark\.isDashing,\s*bossType,\s*this\.frameCount\)/,
    'the game loop should use the tested fish pacing helper'
);
assert.match(
    gameEngineSource,
    /fishIndex < fishSpawnPlan\.count && this\.fishes\.length < 30/,
    'small schools should continue to respect the existing fish cap'
);

console.log('FISH_PACING_OK');
