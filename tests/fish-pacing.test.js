const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const projectRoot = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
const pacingStart = html.indexOf('const PACING');
const pacingEnd = html.indexOf('function hexToRgb', pacingStart);

assert.notEqual(pacingStart, -1, 'zone profiles should exist');
assert.notEqual(pacingEnd, -1, 'fish pacing helpers should precede color helpers');

const { PACING, ZONE_PROFILES, getFishSpawnPlan } = vm.runInNewContext(
    `${html.slice(pacingStart, pacingEnd)}
    ({ PACING, ZONE_PROFILES, getFishSpawnPlan })`,
    { CONFIG: { LOGIC_FPS: 120 } }
);

assert.equal(getFishSpawnPlan.length, 3, 'fish spawn planning should only accept normal pacing inputs');
assert.equal(PACING.MAX_ACTIVE_FISH, 30, 'normal and Boss fish should share a 30-fish cap');
assert.equal(PACING.FISH_MIN_INTERVAL_TICKS, 24, 'fish pacing should keep a 24-tick minimum interval');
assert.equal(PACING.FISH_SAFE_SPAWN_DISTANCE, 220, 'fish should keep a 220px safe entrance distance');

const normalIntervals = {
    shallow: 54,
    shipwreck: 48,
    trench: 66,
    dark: 78
};

for (const [zoneName, expectedInterval] of Object.entries(normalIntervals)) {
    const plan = getFishSpawnPlan(ZONE_PROFILES[zoneName], false, expectedInterval);
    assert.equal(plan.interval, expectedInterval, `${zoneName} normal pacing should remain unchanged`);
    assert.equal(plan.count, 1, `${zoneName} normal pacing should spawn one fish`);
}

{
    const firstRushSpawn = getFishSpawnPlan(ZONE_PROFILES.dark, true, 48);
    assert.equal(firstRushSpawn.interval, 48, 'dark-zone Rush should shorten the fish interval');
    assert.equal(firstRushSpawn.count, 1, 'ordinary Rush spawns should stay visually restrained');

    const lateRushSchool = getFishSpawnPlan(ZONE_PROFILES.dark, true, 192);
    assert.equal(lateRushSchool.interval, 48);
    assert.equal(lateRushSchool.count, 2, 'every fourth dark-zone Rush spawn should form a small school');
}

{
    const canvasWidth = 900;
    const dashSpeed = 14;
    const maximumLeftwardFishSpeed = 2.02;
    const visibleLifetimeTicks = canvasWidth / (dashSpeed * 0.7 + maximumLeftwardFishSpeed);
    const rushPlan = getFishSpawnPlan(ZONE_PROFILES.dark, true, 48);

    assert.ok(
        rushPlan.interval < visibleLifetimeTicks,
        'the next Rush fish should spawn before the previous fish can leave the screen'
    );
}

const gameEngineSource = html.slice(html.indexOf('class GameEngine'));
assert.match(
    gameEngineSource,
    /this\.fishDirector\.update\(\{[\s\S]*?profile,[\s\S]*?currentSpeed,[\s\S]*?bossType,[\s\S]*?isDashing:/,
    'the game loop should delegate fish pacing to FishDirector'
);
const fishDirectorSource = html.slice(html.indexOf('class FishDirector'), html.indexOf('function hexToRgb'));
assert.match(
    fishDirectorSource,
    /countReachableFish\(\)/,
    'normal pacing should use a reachable-fish reserve instead of only a global cap'
);
assert.match(
    fishDirectorSource,
    /const bossEncounterActive = Boolean\(bossActive && bossType\)/,
    'Boss pacing should enter the same normal fish loop'
);
assert.match(
    fishDirectorSource,
    /getFishSpawnPlan\(profile, isDashing, this\.tick\)/,
    'Boss and normal updates should call the same normal spawn planner'
);
assert.doesNotMatch(fishDirectorSource, /getFishSpawnPlan\([^)]*bossType/,
    'Boss type should not be part of the normal spawn planner call'
);
assert.match(fishDirectorSource, /PACING\.MAX_ACTIVE_FISH/,
    'FishDirector should use the shared active-fish cap'
);
assert.match(fishDirectorSource, /PACING\.FISH_SAFE_SPAWN_DISTANCE/,
    'FishDirector should use the shared safe spawn distance'
);
assert.doesNotMatch(fishDirectorSource, /spawnBossSchool|updateBossSupply|bossSupply/,
    'Boss fish should not keep a separate supply implementation');

console.log('FISH_PACING_OK');
