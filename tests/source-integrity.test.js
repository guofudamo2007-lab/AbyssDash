const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
const scriptStart = html.lastIndexOf('<script>');
const scriptEnd = html.lastIndexOf('</script>');

assert.notEqual(scriptStart, -1, 'inline game script should exist');
assert.ok(scriptEnd > scriptStart, 'inline game script should have a closing tag');
new Function(html.slice(scriptStart + '<script>'.length, scriptEnd));

const runtimeAssets = [
    'assets/art/bosses/boss-octopus-spritesheet.png',
    'assets/art/bosses/boss-submarine-spritesheet.png',
    'assets/art/characters/shark-cyber-spritesheet.png',
    'assets/art/characters/shark-default-spritesheet.png',
    'assets/audio/music/boss-battle-beneath-the-crush.mp3'
];

for (const assetPath of runtimeAssets) {
    assert.match(html, new RegExp(assetPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.ok(
        fs.existsSync(path.join(projectRoot, assetPath)),
        `runtime asset should exist: ${assetPath}`
    );
}

console.log('SCRIPT_PARSE_OK');
console.log(`RUNTIME_ASSET_AUDIT_OK ${runtimeAssets.length}`);
