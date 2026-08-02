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
const registerNearMiss = vm.runInNewContext(
    `({ ${extractMethod(gameEngineSource, 'registerNearMiss')} }).registerNearMiss`,
    { Math }
);
const registerShieldBlock = vm.runInNewContext(
    `({ ${extractMethod(gameEngineSource, 'registerShieldBlock')} }).registerShieldBlock`,
    {}
);

const spawned = [];
const engine = {
    shark: { x: 140, y: 250, radius: 15 },
    nearMissTimer: 0,
    score: 10,
    runStats: { closeCalls: 0 },
    entityManager: { spawnText(...args) { spawned.push(args); } }
};

registerNearMiss.call(engine, {}, 90, 210, 15, 'CLOSE CALL +3', '#00ffff');
assert.equal(engine.runStats.closeCalls, 1);
assert.equal(engine.score, 13);
assert.deepEqual(JSON.parse(JSON.stringify(spawned.shift())), [90, 192, 'CLOSE CALL +3', '#00ffff', { style: 'close-call' }]);

registerShieldBlock.call(engine, 180, 260);
assert.deepEqual(JSON.parse(JSON.stringify(spawned.shift())), [180, 236, 'BLOCKED', '#ff0055', { style: 'blocked', size: 18 }]);

assert.match(html, /spawnText\(x, y, text, color, options = \{\}\)/);
assert.match(html, /style: options\.style \|\| 'default'/);
assert.match(html, /ft\.style === 'boss' \? 24 : 16/);
assert.match(html, /this\.runStats\.maxCombo = Math\.max/);

console.log('FLOATING_FEEDBACK_OK');
