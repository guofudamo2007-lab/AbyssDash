const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const projectRoot = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
const gameEngineSource = html.slice(html.indexOf('class GameEngine'));
const inputSystemStart = html.indexOf('class InputSystem');
const inputSystemEnd = html.indexOf('class UIManager', inputSystemStart);
const inputSystemSource = html.slice(inputSystemStart, inputSystemEnd);

assert.match(html, /function getZoneProfile\(depth\)/, 'zone lookup must use depth semantics');
assert.doesNotMatch(html, /function getZoneProfile\(score\)/, 'zone lookup must not use score semantics');
assert.match(html, /updateZoneAndSpeed\(depth\)/, 'progression update must use depth semantics');
assert.doesNotMatch(html, /updateZoneAndSpeed\(score\)/, 'progression update must not use score semantics');
assert.match(
    inputSystemSource,
    /if \(this\.engine\.mapTransition && this\.engine\.mapTransition\.active\) \{[\s\S]*?this\.engine\.skipMapTransition\(\);[\s\S]*?return;[\s\S]*?this\.isPressing = true;/,
    'the transition skip input must not also start a dive'
);

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

const zones = {
    shallow: { id: 'shallow', label: 'SHALLOW SEA', name: 'SHALLOW', threshold: 0, accent: '#00e5ff' },
    shipwreck: { id: 'shipwreck', label: 'SHIPWRECK', name: 'SHIPWRECK', threshold: 300, accent: '#ffb347' },
    trench: { id: 'trench', label: 'TRENCH', name: 'TRENCH', threshold: 800, accent: '#ff5f45' },
    dark: { id: 'dark', label: 'DARK ZONE', name: 'DARK', threshold: 1500, accent: '#d36bff' }
};
const pacing = {
    MAP_TRANSITION_OUT_TICKS: 4,
    MAP_TRANSITION_HOLD_TICKS: 2,
    MAP_TRANSITION_IN_TICKS: 5
};
const getZoneProfile = (depth) => {
    if (depth < 300) return zones.shallow;
    if (depth < 800) return zones.shipwreck;
    if (depth < 1500) return zones.trench;
    return zones.dark;
};
const methodNames = [
    'createMapTransitionState',
    'startMapTransition',
    'commitMapTransition',
    'finishMapTransition',
    'updateMapTransition',
    'skipMapTransition'
];
const controller = vm.runInNewContext(
    `({ ${methodNames.map((name) => extractMethod(gameEngineSource, name)).join(',')} })`,
    { PACING: pacing, ZONE_PROFILES: zones, getZoneProfile, Math, Number, Boolean }
);

function createEngine() {
    const calls = [];
    const engine = {
        reduceMotion: false,
        unlockedZoneThreshold: 0,
        zoneProfile: zones.shallow,
        currentZoneName: zones.shallow.name,
        zoneTransitionTimer: 0,
        backgroundTravel: 123,
        obstacles: [{ id: 'old-pillar' }],
        mines: [{ id: 'old-mine' }],
        jellyfishes: [{ id: 'old-jelly' }],
        currentZones: [{ id: 'old-current' }],
        powerups: [{ id: 'old-powerup' }],
        inputSystem: { isPressing: true },
        renderer: { baseWidth: 900 },
        fishDirector: {
            reset() {
                calls.push('fish:reset');
            }
        },
        ui: {
            triggerZoneDisplay(name, profile) {
                calls.push(`zone:${name}:${profile.id}`);
            }
        },
        entityManager: {
            spawnText(x, y, text) {
                calls.push(`text:${text}`);
            }
        },
        audio: {
            play(type) {
                calls.push(`audio:${type}`);
            }
        }
    };
    for (const name of methodNames) {
        engine[name] = (...args) => controller[name].call(engine, ...args);
    }
    engine.mapTransition = engine.createMapTransitionState();
    return { engine, calls };
}

{
    const { engine, calls } = createEngine();
    assert.equal(engine.startMapTransition(300, 'octopus'), true);
    assert.equal(engine.mapTransition.phase, 'closing');
    assert.equal(engine.zoneProfile.id, 'shallow', 'the old map must remain visible during fade-out');
    assert.equal(engine.inputSystem.isPressing, false);
    assert.equal(engine.obstacles.length, 0);
    assert.ok(calls.includes('fish:reset'), 'FishDirector should reset when the transition starts');

    for (let tick = 0; tick < pacing.MAP_TRANSITION_OUT_TICKS; tick++) engine.updateMapTransition();
    assert.equal(engine.mapTransition.phase, 'holding');
    assert.equal(engine.unlockedZoneThreshold, 300);
    assert.equal(engine.zoneProfile.id, 'shipwreck', 'the map should switch only after the screen is closed');

    let guard = 100;
    while (engine.mapTransition.active && guard-- > 0) engine.updateMapTransition();
    assert.ok(guard > 0, 'the transition should complete');
    assert.equal(calls.filter((call) => call === 'fish:reset').length, 1, 'FishDirector should reset once per transition');
    assert.ok(calls.includes('zone:SHIPWRECK:shipwreck'));
    assert.ok(calls.includes('audio:dash'));
    assert.equal(engine.startMapTransition(300, 'octopus'), false, 'an unlocked map should not replay its transition');
}

{
    const { engine } = createEngine();
    for (const invalidThreshold of [0, 301, 799, 999, -1, NaN, Infinity]) {
        assert.equal(
            engine.startMapTransition(invalidThreshold, 'invalid'),
            false,
            `invalid threshold ${String(invalidThreshold)} must not start a transition`
        );
        assert.equal(engine.mapTransition.active, false);
        assert.equal(engine.unlockedZoneThreshold, 0);
    }
}

{
    const { engine } = createEngine();
    const expected = [
        [300, 'shipwreck'],
        [800, 'trench'],
        [1500, 'dark']
    ];

    for (const [threshold, zoneId] of expected) {
        assert.equal(engine.startMapTransition(threshold, 'formal'), true);
        for (let tick = 0; tick < pacing.MAP_TRANSITION_OUT_TICKS; tick++) engine.updateMapTransition();
        assert.equal(engine.mapTransition.phase, 'holding');
        assert.equal(engine.zoneProfile.id, zoneId);
        let guard = 100;
        while (engine.mapTransition.active && guard-- > 0) engine.updateMapTransition();
        assert.ok(guard > 0, 'each formal transition should complete');
        assert.equal(engine.mapTransition.phase, 'idle');
        assert.equal(engine.unlockedZoneThreshold, threshold);
    }
}

{
    const { engine } = createEngine();
    engine.reduceMotion = true;

    assert.equal(engine.startMapTransition(300, 'reduced-motion'), true);
    assert.deepEqual(
        [engine.mapTransition.outTicks, engine.mapTransition.holdTicks, engine.mapTransition.inTicks],
        [1, 8, 1],
        'reduced motion should keep a short visible obstruction'
    );
    engine.updateMapTransition();
    assert.equal(engine.mapTransition.phase, 'holding');
    assert.equal(engine.zoneProfile.id, 'shipwreck');
    for (let tick = 0; tick < 8; tick++) engine.updateMapTransition();
    assert.equal(engine.mapTransition.phase, 'opening');
    engine.updateMapTransition();
    assert.equal(engine.mapTransition.active, false);
    assert.equal(engine.mapTransition.phase, 'idle');
}

{
    const { engine, calls } = createEngine();
    engine.unlockedZoneThreshold = 300;
    engine.zoneProfile = zones.shipwreck;
    engine.currentZoneName = zones.shipwreck.name;
    assert.equal(engine.startMapTransition(800, 'submarine'), true);
    assert.equal(engine.skipMapTransition(), true);
    assert.equal(engine.mapTransition.active, false);
    assert.equal(engine.unlockedZoneThreshold, 800);
    assert.equal(engine.zoneProfile.id, 'trench');
    assert.equal(calls.filter((call) => call === 'fish:reset').length, 1, 'skip should not reset FishDirector twice');
    assert.ok(calls.includes('zone:TRENCH:trench'));
}

console.log('MAP_TRANSITION_OK');
