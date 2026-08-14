const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
const classMatch = html.match(/class BossSystem \{[\s\S]*?\r?\n\}\r?\n\r?\nclass AchievementManager/);

assert.ok(classMatch, 'BossSystem source was not found in index.html');

const classSource = classMatch[0].replace(/\r?\n\r?\nclass AchievementManager$/, '');
const BossSystem = new Function(`${classSource}\nreturn BossSystem;`)();

function createEngine() {
    return {
        cameraShake: 0,
        fishes: [],
        powerups: [],
        runStats: { shieldsBroken: 0, damageTaken: 0 },
        shark: {
            x: 120,
            y: 360,
            width: 80,
            radius: 26,
            shield: false,
            isDashing: false,
            inCurrent: false
        },
        renderer: { baseWidth: 1280, baseHeight: 720 },
        ui: { triggerBloodScreen() {} },
        entityManager: {
            spawnText() {},
            spawnParticles() {}
        },
        audio: {
            play() {},
            playBossMusic() {}
        },
        checkCollision() {
            return false;
        }
    };
}

function prepareBoss(threshold, timer) {
    const bossSystem = new BossSystem(createEngine());
    assert.equal(bossSystem.spawnBoss(threshold, { force: true, isDemo: true }), true);
    bossSystem.bossData.state = 'idle';
    bossSystem.bossData.x = bossSystem.bossData.restX;
    bossSystem.bossData.timer = timer;
    bossSystem.bossData.fightTime = 0;
    bossSystem.bossData.supplyTimer = 0;
    return bossSystem;
}

{
    const bossSystem = prepareBoss(300, 89);
    bossSystem.update(0, 1);
    assert.equal(bossSystem.bossData.attackTelegraph, 30, 'octopus should warn before firing ink');
    assert.equal(bossSystem.projectiles.length, 0);
    for (let i = 0; i < 30; i++) bossSystem.update(0, 1);
    assert.equal(bossSystem.projectiles.length, 1);
    assert.equal(bossSystem.projectiles[0].type, 'ink');
}

{
    const bossSystem = prepareBoss(800, 71);
    bossSystem.update(0, 1);
    assert.equal(bossSystem.bossData.attackTelegraph, 28, 'submarine should warn before launching');
    assert.equal(bossSystem.projectiles.length, 0);
    for (let i = 0; i < 28; i++) bossSystem.update(0, 1);
    assert.equal(bossSystem.projectiles[0].type, 'torpedo');
    assert.ok(bossSystem.projectiles[0].vx < 0, 'torpedo should travel left toward the player');
}

{
    const bossSystem = prepareBoss(1500, 119);
    bossSystem.update(0, 1);
    assert.equal(bossSystem.bossData.attackTelegraph, 30, 'megalodon should warn before emitting sonic waves');
    assert.equal(bossSystem.projectiles.length, 0);
    for (let i = 0; i < 30; i++) bossSystem.update(0, 1);
    assert.equal(bossSystem.projectiles[0].type, 'sonic');
    assert.ok(bossSystem.projectiles[0].vx < 0);
}

const octopusDrawSource = html.match(/if \(b\.type === 'octopus'\) \{[\s\S]*?\} else if \(b\.type === 'submarine'\)/)?.[0] || '';
assert.doesNotMatch(octopusDrawSource, /shadowBlur/, 'octopus should not use a persistent bloom');
assert.match(html, /glowBlur = engine\.reduceMotion \? 10 : \(engine\.quality === 'performance' \? 20 : 34\)/);
assert.match(html, /ctx\.ellipse\(p\.radius \* 1\.55, 0,/, 'torpedo exhaust should trail on its right side');
assert.match(html, /const frameOffsets = \[[\s\S]*?\{ x: 0\.5, y: -0\.5 \}/, 'submarine frames should use audited alignment offsets');
assert.match(
    html,
    /this\.megalodonSprite\.src = 'assets\/art\/characters\/shark-default-spritesheet\.png\?v=2'/,
    'megalodon should load a dedicated sprite independently from the selected player skin'
);
const megalodonDrawSource = html.match(/\} else if \(b\.type === 'megalodon'\) \{[\s\S]*?\r?\n        \}\r?\n\r?\n\r?\n        ctx\.restore\(\);/)?.[0] || '';
assert.ok(megalodonDrawSource, 'megalodon draw source should be found');
assert.doesNotMatch(megalodonDrawSource, /currentSkin/, 'megalodon rendering should not depend on the player skin');

console.log('BOSS_READABILITY_OK');
