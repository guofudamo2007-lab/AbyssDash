const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const projectRoot = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');

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

const gameEngineSource = html.slice(html.indexOf('class GameEngine'));
const getRunSummary = vm.runInNewContext(
    `({ ${extractMethod(gameEngineSource, 'getRunSummary')} }).getRunSummary`,
    { Math, Object }
);

{
    const engine = {
        score: 431.8,
        depth: 987.4,
        runStats: { fishesEaten: 12, maxCombo: 7, closeCalls: 4 },
        bossSystem: { defeatedBosses: [300, 800] },
        getMutationCount() { return 5; }
    };
    assert.deepEqual(JSON.parse(JSON.stringify(getRunSummary.call(engine))), {
        score: 431,
        depth: 987,
        fishesEaten: 12,
        maxCombo: 7,
        closeCalls: 4,
        bossesDefeated: 2,
        mutationsAcquired: 5
    });
}

{
    const engine = {
        score: 0,
        depth: 0,
        runStats: { fishesEaten: 0, damageTaken: 0, shieldsBroken: 0 },
        bossSystem: { defeatedBosses: [] },
        getMutationCount() { return 0; }
    };
    const summary = getRunSummary.call(engine);
    assert.equal(summary.maxCombo, 0);
    assert.equal(summary.closeCalls, 0);
    assert.equal(Object.isFrozen(summary), true, 'summary should be an immutable game-over snapshot');
}

assert.match(html, /id="game-over-modal"/);
assert.match(html, /data-stat="mutationsAcquired"/);
assert.match(html, /this\.runSummary = this\.getRunSummary\(\)/);
assert.match(html, /this\.ui\.showGameOver\(this\.runSummary\)/);
assert.match(html, /id="btn-game-over-restart"/);
assert.match(html, /id="btn-game-over-menu"/);
assert.match(html, /restartFromGameOver\(\)/);
assert.match(html, /returnToMenuFromGameOver\(\)/);

console.log('RUN_SUMMARY_OK');
