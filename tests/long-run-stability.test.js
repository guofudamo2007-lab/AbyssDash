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
    for (let i = bodyStart; i < source.length; i++) {
        if (source[i] === '{') depth++;
        if (source[i] === '}') {
            depth--;
            if (depth === 0) return source.slice(start, i + 1);
        }
    }
    throw new Error(`Unable to extract ${methodName}`);
}

const entityManagerSource = extractClass(html, 'EntityManager', 'CollisionSystem');
const EntityManager = vm.runInNewContext(
    `${entityManagerSource}\nEntityManager`,
    { Math }
);

const gameEngineStart = html.indexOf('class GameEngine');
assert.notEqual(gameEngineStart, -1, 'GameEngine should exist');
const gameEngineSource = html.slice(gameEngineStart);
const qualityMethod = extractMethod(gameEngineSource, 'setGraphicsQuality');
const menuMethod = extractMethod(gameEngineSource, 'updateMenuLogic');
const qualityController = vm.runInNewContext(
    `({ ${qualityMethod} })`,
    { Math, localStorage: { setItem() {} } }
);
const menuController = vm.runInNewContext(
    `({ ${menuMethod} })`,
    {
        Math,
        simplex: { noise2D() { return 0; } },
        document: { getElementById() { return { style: {} }; } }
    }
);

const engine = {
    quality: 'high',
    maxParticles: 300,
    maxBackgroundPlanks: 30,
    maxMenuBubbles: 50,
    particles: [],
    floatingTexts: [],
    bubbles: [],
    fishes: [],
    planks: [],
    frameCount: 0,
    renderer: {
        baseWidth: 900,
        baseHeight: 500,
        setQuality() {}
    },
    achievementManager: {
        achievements: [{ id: 'boss_megalodon', unlocked: false }]
    }
};
const entityManager = new EntityManager(engine);

// 72,000 fixed updates equal 20 minutes at 60 updates per second.
const qualityCycle = ['high', 'balanced', 'performance'];
for (let frame = 0; frame < 72_000; frame++) {
    if (frame % 12_000 === 0) {
        qualityController.setGraphicsQuality.call(
            engine,
            qualityCycle[(frame / 12_000) % qualityCycle.length]
        );
    }
    if (frame % 6 === 0) {
        entityManager.spawnParticles(450, 250, '#00ffff', 8);
    }
    if (frame % 120 === 0) {
        entityManager.spawnText(450, 250, 'SOAK', '#ffffff');
    }
    menuController.updateMenuLogic.call(engine);

    assert.ok(engine.particles.length <= engine.maxParticles, 'particles must stay capped');
    assert.ok(engine.bubbles.length <= engine.maxMenuBubbles, 'menu bubbles must stay capped');
    assert.ok(engine.fishes.length <= 15, 'menu fish must stay capped');
    assert.ok(engine.planks.length <= engine.maxBackgroundPlanks, 'background planks must stay capped');
    assert.ok(engine.floatingTexts.length <= 31, 'floating text allocation must stay bounded');
}

assert.match(
    gameEngineSource,
    /if \(deltaTime > 250\) deltaTime = 250;/,
    'large frame gaps should be clamped before fixed updates'
);

console.log('LONG_RUN_STABILITY_SIMULATION_OK');
