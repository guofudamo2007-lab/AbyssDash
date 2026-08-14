const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const projectRoot = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
const helperStart = html.indexOf('function getFishSpawnPlan');
const helperEnd = html.indexOf('function hexToRgb', helperStart);
assert.notEqual(helperStart, -1, 'FishDirector prelude should exist');
assert.notEqual(helperEnd, -1, 'FishDirector prelude should have a closing helper');

const { FishDirector, ZONE_PROFILES } = vm.runInNewContext(
    `${html.slice(helperStart, helperEnd)}
    ({ FishDirector, ZONE_PROFILES })`,
    {
        PACING: {
            MAX_ACTIVE_FISH: 30,
            FISH_MIN_INTERVAL_TICKS: 24,
            FISH_SAFE_SPAWN_DISTANCE: 220
        },
        ZONE_PROFILES: { dark: {} }
    }
);

function createEngine() {
    return {
        fishes: [],
        powerups: [],
        shark: { x: 140, y: 360, shield: false },
        renderer: { baseWidth: 1280, baseHeight: 720 },
        entityManager: { spawnText() {} }
    };
}

const engine = createEngine();
const director = new FishDirector(engine);
director.beginBoss('submarine');

assert.equal(engine.fishes.length, 1, 'Boss entry should use the same one-fish school as traversal');
assert.ok(engine.fishes.every((fish) => !fish.bossSupply), 'Boss fish should use the normal traversal marker');
assert.ok(
    engine.fishes.every((fish) => fish.x >= engine.shark.x + 220),
    'Boss entry fish should enter from the normal safe distance'
);
assert.ok(
    engine.fishes.every((fish) => fish.y >= 60 && fish.y <= engine.renderer.baseHeight - 60),
    'Boss fish should stay inside the normal playable vertical field'
);
assert.equal(engine.fishes[0].source, 'traversal', 'Boss fish should use the traversal source path');
assert.ok(engine.fishes[0].vx <= -0.8, 'Boss fish should use normal traversal speed');

engine.fishes = [];
for (let i = 0; i < 80; i++) {
    director.update({ profile: { id: 'shipwreck', fishInterval: 48 }, currentSpeed: 4, bossActive: true, bossType: 'submarine', isDashing: false });
}
assert.ok(engine.fishes.length >= 2, 'Boss traversal should keep the same reserve as normal traversal');
assert.ok(engine.fishes.every((fish) => !fish.bossSupply), 'Boss traversal should not create special supply markers');

const normalEngine = createEngine();
const normalDirector = new FishDirector(normalEngine);
for (let i = 0; i < 80; i++) {
    normalDirector.update({ profile: { id: 'shipwreck', fishInterval: 48 }, currentSpeed: 4, bossActive: false, bossType: null, isDashing: false });
}
assert.equal(engine.fishes.length, normalEngine.fishes.length, 'Boss and normal traversal should use identical fish pacing');
assert.ok(normalEngine.fishes.every((fish) => !fish.bossSupply), 'normal traversal should not leak Boss supply markers');
assert.ok(
    normalEngine.fishes.every((fish) => fish.x >= normalEngine.shark.x + 220),
    'normal fish should enter from a safe distance instead of popping beside the shark'
);

const cappedEngine = createEngine();
const cappedDirector = new FishDirector(cappedEngine);
for (let i = 0; i < 30; i++) {
    cappedEngine.fishes.push({ x: 500, y: 360, active: true, source: 'traversal' });
}
cappedDirector.spawnSchool({ count: 1 });
assert.equal(cappedEngine.fishes.length, 30, 'a full 30-fish field should not grow beyond the shared cap');
cappedEngine.fishes.pop();
cappedDirector.spawnSchool({ count: 2 });
assert.equal(cappedEngine.fishes.length, 30, 'a school should fill only the final available slot under the cap');

console.log('BOSS_SUPPLY_OK');
