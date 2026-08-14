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
    const calls = [];
    const achievements = [
        { id: 'boss_octopus', unlocked: false },
        { id: 'boss_submarine', unlocked: false },
        { id: 'boss_megalodon', unlocked: false }
    ];

    const engine = {
        score: 40,
        cameraShake: 0,
        fishes: [],
        powerups: [],
        shark: { y: 360, shield: false },
        renderer: { baseWidth: 1280, baseHeight: 720 },
        ui: {
            triggerBloodScreen() {
                calls.push('blood-screen');
            }
        },
        entityManager: {
            spawnText() {},
            spawnParticles() {}
        },
        audio: {
            play(type) {
                calls.push(`audio:${type}`);
            },
            playBossMusic() {
                calls.push('boss-music:play');
            },
            stopBossMusic() {
                calls.push('boss-music:stop');
            }
        },
        achievementManager: {
            achievements,
            unlock(achievement) {
                achievement.unlocked = true;
                calls.push(`achievement:${achievement.id}`);
            }
        },
        setGodModeStatus(message) {
            calls.push(`status:${message}`);
        },
        startMapTransition(threshold, type) {
            calls.push(`transition:${threshold}:${type}`);
        }
    };

    return { engine, calls, achievements };
}

{
    const { engine, calls, achievements } = createEngine();
    const bossSystem = new BossSystem(engine);

    assert.equal(bossSystem.spawnBoss(300, { force: true, isDemo: true }), true);
    assert.equal(bossSystem.bossData.isDemo, true);
    assert.equal(bossSystem.bossData.musicStarted, true);
    assert.equal(calls.filter((call) => call === 'boss-music:play').length, 1, 'demo Boss should start music at spawn');
    assert.equal(engine.powerups.length, 0, 'demo Boss must not generate a safety shield');
    assert.equal(engine.powerups.some((powerup) => powerup.source === 'boss-safety'), false);
    bossSystem.defeatBoss();

    assert.equal(engine.score, 40, 'demo Boss must not add score');
    assert.deepEqual(bossSystem.defeatedBosses, [], 'demo Boss must not change formal defeat progress');
    assert.equal(achievements[0].unlocked, false, 'demo Boss must not unlock the formal Boss achievement');
    assert.equal(bossSystem.bossData, null, 'demo Boss state should be released after completion');
    assert.ok(calls.includes('boss-music:stop'), 'demo completion should stop Boss music');
    assert.equal(calls.filter((call) => call === 'boss-music:stop').length, 1, 'demo completion should stop Boss music exactly once');
    assert.equal(calls.some((call) => call.startsWith('transition:')), false, 'demo Boss must not switch maps');
    assert.ok(calls.includes('status:Boss 演示结束，正式进度未改变。'));

    assert.equal(
        bossSystem.spawnBoss(800, { force: true, isDemo: true }),
        true,
        'a new demo Boss should be summonable after the previous demo ends'
    );
    assert.equal(bossSystem.bossData.type, 'submarine');
    assert.equal(bossSystem.bossData.isDemo, true);
    assert.equal(calls.filter((call) => call === 'boss-music:play').length, 2, 'each demo Boss should start music once');
}

{
    const { engine, calls, achievements } = createEngine();
    const bossSystem = new BossSystem(engine);

    assert.equal(bossSystem.spawnBoss(300), true);
    assert.equal(bossSystem.bossData.isDemo, false);
    assert.equal(bossSystem.bossData.musicStarted, true);
    assert.equal(calls.filter((call) => call === 'boss-music:play').length, 1, 'formal Boss should start music at spawn');
    assert.equal(engine.powerups.length, 1, 'formal Boss should generate one safety shield');
    assert.equal(engine.powerups[0].source, 'boss-safety');
    bossSystem.defeatBoss();

    assert.equal(engine.score, 240, 'formal Boss should still grant its score reward');
    assert.deepEqual(bossSystem.defeatedBosses, [300], 'formal Boss should update defeat progress');
    assert.equal(achievements[0].unlocked, true, 'formal Boss should still unlock its achievement');
    assert.ok(calls.includes('achievement:boss_octopus'));
    assert.equal(calls.filter((call) => call === 'boss-music:stop').length, 1, 'formal completion should stop Boss music exactly once');
    assert.ok(calls.includes('transition:300:octopus'), 'formal Boss should begin the post-fight map transition');
}

console.log('BOSS_DEMO_ISOLATION_OK');
