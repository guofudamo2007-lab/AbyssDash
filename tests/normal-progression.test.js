const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const projectRoot = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');

function extractClass(source, className, nextClassName) {
    const start = source.indexOf(`class ${className}`);
    const end = source.indexOf(`class ${nextClassName}`, start);
    assert.notEqual(start, -1, `${className} should exist`);
    assert.notEqual(end, -1, `${nextClassName} should follow ${className}`);
    return source.slice(start, end);
}

function extractMethod(source, methodName) {
    const match = new RegExp(`^\\s{4}${methodName}\\(`, 'm').exec(source);
    assert.ok(match, `${methodName} should exist`);
    const start = match.index + match[0].indexOf(methodName);
    const bodyStart = source.indexOf('{', start);
    let depth = 0;
    for (let index = bodyStart; index < source.length; index++) {
        if (source[index] === '{') depth++;
        if (source[index] === '}') {
            depth--;
            if (depth === 0) return source.slice(start, index + 1);
        }
    }
    throw new Error(`Unable to extract ${methodName}`);
}

const BossSystem = vm.runInNewContext(
    `${extractClass(html, 'BossSystem', 'AchievementManager')}\nBossSystem`,
    {
        Math,
        PACING: {
            BOSS_SUPPLY_INTERVAL_TICKS: 10_000,
            BOSS_EMERGENCY_TICKS: 10_000
        }
    }
);

function createEngine() {
    const calls = [];
    const achievements = [
        { id: 'boss_octopus', unlocked: false },
        { id: 'boss_submarine', unlocked: false },
        { id: 'boss_megalodon', unlocked: false }
    ];
    const engine = {
        score: 0,
        cameraShake: 0,
        fishes: [],
        powerups: [],
        shark: {
            x: 100,
            y: 360,
            width: 55,
            radius: 15,
            shield: false,
            isDashing: false,
            inCurrent: false,
            inkTimer: 0,
            comboCount: 0,
            comboActive: false
        },
        renderer: { baseWidth: 900, baseHeight: 500 },
        ui: {
            triggerBloodScreen() {
                calls.push('blood-screen');
            },
            triggerImpactFlash() {}
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
            },
            unlockById() {}
        },
        mutationSystem: {
            modifiers: {
                leviathan: false
            }
        },
        runStats: { shieldsBroken: 0, damageTaken: 0 },
        isCheatInvincible: false,
        checkCollision() {
            return false;
        },
        triggerGameOver() {
            calls.push('game-over');
        },
        setGodModeStatus(message) {
            calls.push(`status:${message}`);
        }
    };
    return { engine, calls, achievements };
}

{
    const { engine, calls, achievements } = createEngine();
    const bossSystem = new BossSystem(engine);

    assert.equal(bossSystem.checkTrigger(299), false);
    assert.equal(bossSystem.checkTrigger(300), true);
    assert.equal(bossSystem.bossData.type, 'octopus');
    assert.equal(bossSystem.bossData.isDemo, false);
    assert.equal(engine.fishes.length, 4, 'normal Boss entry should provide four emergency fish');
    assert.equal(engine.powerups.length, 1, 'normal Boss entry should provide an emergency shield');
    assert.equal(calls.includes('boss-music:play'), false, 'music must wait until entry is complete');

    for (let tick = 0; tick < 200 && bossSystem.bossData.state === 'entering'; tick++) {
        bossSystem.update(3, 1);
    }
    assert.equal(bossSystem.bossData.state, 'idle');
    assert.equal(calls.filter((call) => call === 'boss-music:play').length, 1);

    bossSystem.defeatBoss();
    assert.deepEqual(Array.from(bossSystem.defeatedBosses), [300]);
    assert.equal(engine.score, 200);
    assert.equal(achievements[0].unlocked, true);
    assert.ok(calls.includes('boss-music:stop'));

    assert.equal(bossSystem.checkTrigger(799), false);
    assert.equal(bossSystem.checkTrigger(800), true);
    assert.equal(bossSystem.bossData.type, 'submarine');
    bossSystem.defeatBoss();
    assert.deepEqual(Array.from(bossSystem.defeatedBosses), [300, 800]);
    assert.equal(engine.score, 500);
    assert.equal(achievements[1].unlocked, true);

    assert.equal(bossSystem.checkTrigger(1500), true);
    assert.equal(bossSystem.bossData.type, 'megalodon');
    bossSystem.defeatBoss();
    assert.deepEqual(Array.from(bossSystem.defeatedBosses), [300, 800, 1500]);
    assert.equal(engine.score, 900);
    assert.equal(achievements[2].unlocked, true);
    assert.equal(bossSystem.checkTrigger(5000), false, 'completed Bosses must not retrigger');
}

{
    const { engine } = createEngine();
    const bossSystem = new BossSystem(engine);

    assert.equal(bossSystem.checkTrigger(1500), true, 'a depth jump should start the first unbeaten Boss');
    assert.equal(bossSystem.bossData.threshold, 300);
    bossSystem.defeatBoss();
    assert.equal(bossSystem.checkTrigger(1500), true);
    assert.equal(bossSystem.bossData.threshold, 800);
    bossSystem.defeatBoss();
    assert.equal(bossSystem.checkTrigger(1500), true);
    assert.equal(bossSystem.bossData.threshold, 1500);
}

const gameEngineSource = html.slice(html.indexOf('class GameEngine'));
const uiManagerSource = extractClass(html, 'UIManager', 'Renderer');
const uiUpdateSource = extractMethod(uiManagerSource, 'update');
const tutorialMethodSource = extractMethod(gameEngineSource, 'markTutorialEvent');
const initEntities = vm.runInNewContext(
    `({ ${extractMethod(gameEngineSource, 'initEntities')} })`,
    { ZONE_PROFILES: { shallow: { id: 'shallow' } } }
).initEntities;

{
    const calls = [];
    const engine = {
        score: 999,
        depth: 999,
        frameCount: 999,
        isNewRecord: true,
        currentZoneName: 'OLD',
        zoneProfile: { id: 'old' },
        zoneTransitionTimer: 99,
        hazardWarningTimer: 99,
        nearMissTimer: 99,
        cameraShake: 99,
        renderer: { canvas: { style: { transform: 'translate(4px, 4px)' } } },
        audio: {
            stopAmbient() {
                calls.push('ambient:stop');
            },
            stopBossMusic(options) {
                calls.push(`boss:stop:${options.resumeAmbient}:${options.immediate}`);
            }
        },
        entityManager: {
            initEntities() {
                calls.push('entities:reset');
            }
        },
        bossSystem: {
            active: true,
            bossData: { threshold: 800 },
            defeatedBosses: [300],
            projectiles: [{ type: 'torpedo' }]
        },
        mutationSystem: {
            init() {
                calls.push('mutations:reset');
            }
        },
        setGodModeStatus() {},
        ui: {
            clearBloodScreen() {},
            setPauseBtnVisible() {},
            updatePauseBtnIcon() {},
            update() {},
            hideTutorial() {}
        },
        shark: {},
        highScore: 100
    };

    initEntities.call(engine);
    assert.equal(engine.score, 0);
    assert.equal(engine.depth, 0);
    assert.equal(engine.frameCount, 0);
    assert.equal(engine.cameraShake, 0);
    assert.equal(engine.renderer.canvas.style.transform, 'translate(0, 0)');
    assert.equal(engine.bossSystem.active, false);
    assert.equal(engine.bossSystem.bossData, null);
    assert.deepEqual(Array.from(engine.bossSystem.defeatedBosses), []);
    assert.deepEqual(Array.from(engine.bossSystem.projectiles), []);
    assert.equal(engine.runStats.fishesEaten, 0);
    assert.equal(engine.runStats.damageTaken, 0);
    assert.equal(engine.runStats.shieldsBroken, 0);
    assert.ok(calls.includes('ambient:stop'));
    assert.ok(calls.includes('boss:stop:false:true'));
}

const tutorialStorage = new Map();
const tutorialController = vm.runInNewContext(
    `({ ${tutorialMethodSource} })`,
    {
        localStorage: {
            setItem(key, value) {
                tutorialStorage.set(key, String(value));
            }
        }
    }
);

{
    const shownSteps = [];
    let hidden = 0;
    const engine = {
        tutorialActive: true,
        tutorialStep: 0,
        ui: {
            showTutorial(step) {
                shownSteps.push(step);
            },
            hideTutorial() {
                hidden++;
            }
        }
    };

    tutorialController.markTutorialEvent.call(engine, 'dive');
    tutorialController.markTutorialEvent.call(engine, 'fish');
    tutorialController.markTutorialEvent.call(engine, 'rush');

    assert.deepEqual(shownSteps, [1, 2]);
    assert.equal(engine.tutorialActive, false);
    assert.equal(tutorialStorage.get('abyssDashTutorialSeen'), '1');
    assert.equal(hidden, 1);
}

assert.match(
    gameEngineSource,
    /const bossTriggered = this\.bossSystem\.checkTrigger\(intDepth\);/,
    'normal Boss progression should use the current depth shared with zone progression'
);
assert.match(uiUpdateSource, /this\.statusReadout && shark/);
assert.doesNotMatch(
    tutorialMethodSource,
    /statusReadout|\bshark\b|\bengine\b/,
    'tutorial completion must not contain UI status logic with out-of-scope state'
);

console.log('NORMAL_PROGRESSION_OK');
