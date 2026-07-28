const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
const trackerMatch = html.match(/class ConsecutiveActivationTracker \{[\s\S]*?\r?\n\}\r?\n\r?\nclass InputSystem/);

assert.ok(trackerMatch, 'ConsecutiveActivationTracker source was not found in index.html');

const trackerSource = trackerMatch[0].replace(/\r?\n\r?\nclass InputSystem$/, '');
const ConsecutiveActivationTracker = new Function(`${trackerSource}\nreturn ConsecutiveActivationTracker;`)();

{
    const tracker = new ConsecutiveActivationTracker();
    assert.equal(tracker.register(0), false);
    assert.equal(tracker.register(300), false);
    assert.equal(tracker.register(600), false);
    assert.equal(tracker.register(900), false);
    assert.equal(tracker.register(2000), false, 'a late fifth activation must begin a new sequence');
    assert.equal(tracker.count, 1);
}

{
    const tracker = new ConsecutiveActivationTracker();
    assert.equal(tracker.register(100), false);
    assert.equal(tracker.register(400), false);
    assert.equal(tracker.register(700), false);
    assert.equal(tracker.register(1000), false);
    assert.equal(tracker.register(1300), true, 'five continuous activations should trigger the easter egg');
    assert.equal(tracker.count, 0, 'a completed sequence should reset itself');
}

{
    const tracker = new ConsecutiveActivationTracker();
    [0, 600, 1200, 1800].forEach((time) => assert.equal(tracker.register(time), false));
    assert.equal(tracker.register(2400), false, 'activations outside the total time window must not trigger');
    assert.equal(tracker.count, 1);
}

assert.match(
    html,
    /this\.godModeUnlocked = localStorage\.getItem\('abyssDashGodModeUnlocked'\) === '1' \|\| legacyGodModeEnabled;\s*this\.godModeEnabled = false;/,
    'God Mode unlock should persist while its active state starts disabled'
);
assert.match(
    html,
    /localStorage\.removeItem\('abyssDashGodMode'\);/,
    'legacy persisted active state should be cleared'
);
assert.doesNotMatch(
    html.match(/setGodMode\(enabled\) \{[\s\S]*?\r?\n    \}/)?.[0] || '',
    /localStorage\.setItem\('abyssDashGodMode'/,
    'setGodMode should remain session-only'
);
assert.match(
    html,
    /easterEggShark\.addEventListener\('keydown',[\s\S]*?e\.key !== 'Enter' && e\.key !== ' '/,
    'the shark easter egg should support Enter and Space'
);

console.log('EASTER_EGG_GOD_MODE_OK');
