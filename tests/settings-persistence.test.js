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

function createStorage(initialEntries = {}) {
    const values = new Map(
        Object.entries(initialEntries).map(([key, value]) => [key, String(value)])
    );
    return {
        get length() {
            return values.size;
        },
        key(index) {
            return Array.from(values.keys())[index] ?? null;
        },
        getItem(key) {
            return values.has(key) ? values.get(key) : null;
        },
        setItem(key, value) {
            values.set(key, String(value));
        },
        removeItem(key) {
            values.delete(key);
        },
        values
    };
}

class FakeAudio {
    constructor(src) {
        this.src = src;
        this.loop = false;
        this.paused = false;
        this.volume = 1;
        this.currentTime = 0;
        this.ended = false;
    }
    pause() {
        this.paused = true;
    }
    play() {
        this.paused = false;
        return Promise.resolve();
    }
}

{
    const localStorage = createStorage({
        abyssDashMusicVol: '0.65',
        abyssDashSfxVol: '0.35'
    });
    const AudioManager = vm.runInNewContext(
        `${extractClass(html, 'AudioManager', 'UIManager')}\nAudioManager`,
        {
            Audio: FakeAudio,
            localStorage,
            isNaN,
            parseFloat,
            setInterval,
            clearInterval,
            setTimeout,
            clearTimeout,
            console,
            window: {}
        }
    );
    const audio = new AudioManager();

    assert.equal(audio.musicVol, 0.65);
    assert.equal(audio.sfxVol, 0.35);
    assert.equal(audio.bossMusic.volume, 0.26);

    audio.setMusicVolume(0.4);
    audio.setSfxVolume(0.2);
    assert.equal(localStorage.getItem('abyssDashMusicVol'), '0.4');
    assert.equal(localStorage.getItem('abyssDashSfxVol'), '0.2');
    assert.ok(Math.abs(audio.bossMusic.volume - 0.16) < Number.EPSILON);
}

const gameEngineSource = html.slice(html.indexOf('class GameEngine'));
const settingsStorage = createStorage();
let reloadCount = 0;
const settingsController = vm.runInNewContext(
    `({
        ${extractMethod(gameEngineSource, 'setReducedMotion')},
        ${extractMethod(gameEngineSource, 'setGraphicsQuality')},
        ${extractMethod(gameEngineSource, 'resetLocalProgress')}
    })`,
    {
        Math,
        localStorage: settingsStorage,
        window: {
            location: {
                reload() {
                    reloadCount++;
                }
            }
        }
    }
);

{
    const reducedMotionCalls = [];
    const engine = {
        reduceMotion: false,
        cameraShake: 18,
        renderer: {
            canvas: { style: { transform: 'translate(8px, 4px)' } }
        },
        ui: {
            setReducedMotion(enabled) {
                reducedMotionCalls.push(enabled);
            }
        }
    };

    settingsController.setReducedMotion.call(engine, true);
    assert.equal(engine.reduceMotion, true);
    assert.equal(engine.cameraShake, 0);
    assert.equal(engine.renderer.canvas.style.transform, 'translate(0, 0)');
    assert.equal(settingsStorage.getItem('abyssDashReduceMotion'), '1');
    assert.deepEqual(reducedMotionCalls, [true]);
}

{
    const qualityCalls = [];
    const engine = {
        quality: 'high',
        particles: Array.from({ length: 250 }, () => ({})),
        bubbles: Array.from({ length: 45 }, () => ({})),
        planks: Array.from({ length: 28 }, () => ({})),
        renderer: {
            baseWidth: 900,
            baseHeight: 500,
            setQuality(quality) {
                qualityCalls.push(quality);
            }
        }
    };

    settingsController.setGraphicsQuality.call(engine, 'performance');
    assert.equal(engine.quality, 'performance');
    assert.equal(engine.maxParticles, 130);
    assert.equal(engine.maxBackgroundPlanks, 12);
    assert.equal(engine.maxMenuBubbles, 20);
    assert.equal(engine.particles.length, 130);
    assert.equal(engine.bubbles.length, 20);
    assert.equal(engine.planks.length, 12);
    assert.equal(settingsStorage.getItem('abyssDashGraphicsQuality'), 'performance');

    settingsController.setGraphicsQuality.call(engine, 'not-a-quality');
    assert.equal(engine.quality, 'high');
    assert.equal(settingsStorage.getItem('abyssDashGraphicsQuality'), 'high');
    assert.deepEqual(qualityCalls, ['performance', 'high']);
}

{
    const storage = createStorage({
        abyssDashHighScore: '123',
        abyssDashTutorialSeen: '1',
        abyssDashGraphicsQuality: 'balanced',
        unrelatedPreference: 'keep-me'
    });
    const resetController = vm.runInNewContext(
        `({ ${extractMethod(gameEngineSource, 'resetLocalProgress')} })`,
        {
            localStorage: storage,
            window: {
                location: {
                    reload() {
                        reloadCount++;
                    }
                }
            }
        }
    );

    const reloadsBeforeReset = reloadCount;
    resetController.resetLocalProgress();
    assert.equal(storage.getItem('abyssDashHighScore'), null);
    assert.equal(storage.getItem('abyssDashTutorialSeen'), null);
    assert.equal(storage.getItem('abyssDashGraphicsQuality'), null);
    assert.equal(storage.getItem('unrelatedPreference'), 'keep-me');
    assert.equal(reloadCount, reloadsBeforeReset + 1);
}

assert.match(
    gameEngineSource,
    /this\.reduceMotion = localStorage\.getItem\('abyssDashReduceMotion'\) === '1';/
);
assert.match(
    gameEngineSource,
    /this\.quality = localStorage\.getItem\('abyssDashGraphicsQuality'\) \|\| 'high';/
);

console.log('SETTINGS_PERSISTENCE_OK');
