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
    'assets/art/backgrounds/background-shallow-sea-01-v1.webp',
    'assets/art/backgrounds/background-shallow-sea-02-v1.webp',
    'assets/art/backgrounds/background-shallow-sea-03-v1.webp',
    'assets/art/backgrounds/background-shallow-sea-04-v1.webp',
    'assets/art/backgrounds/background-shallow-sea-05-v1.webp',
    'assets/art/backgrounds/background-shipwreck-01-v1.webp',
    'assets/art/backgrounds/background-shipwreck-02-v1.webp',
    'assets/art/backgrounds/background-shipwreck-03-v1.webp',
    'assets/art/backgrounds/background-shipwreck-04-v1.webp',
    'assets/art/backgrounds/background-shipwreck-05-v1.webp',
    'assets/art/backgrounds/background-trench-01-v1.webp',
    'assets/art/backgrounds/background-trench-02-v1.webp',
    'assets/art/backgrounds/background-trench-03-v1.webp',
    'assets/art/backgrounds/background-trench-04-v1.webp',
    'assets/art/backgrounds/background-trench-05-v1.webp',
    'assets/art/backgrounds/background-dark-abyss-01-v1.webp',
    'assets/art/backgrounds/background-dark-abyss-02-v1.webp',
    'assets/art/backgrounds/background-dark-abyss-03-v1.webp',
    'assets/art/backgrounds/background-dark-abyss-04-v1.webp',
    'assets/art/backgrounds/background-dark-abyss-05-v1.webp',
    'assets/art/obstacles/hazard-mine-pixel-v1.webp',
    'assets/art/obstacles/cargo-crate-pixel-v2.webp',
    'assets/art/obstacles/hazard-pillar-pixel-v1.webp',
    'assets/art/obstacles/boundary-wall-pixel-v1.webp',
    'assets/audio/music/boss-battle-beneath-the-crush.mp3'
];

for (const assetPath of runtimeAssets) {
    assert.match(html, new RegExp(assetPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.ok(
        fs.existsSync(path.join(projectRoot, assetPath)),
        `runtime asset should exist: ${assetPath}`
    );
}

assert.doesNotMatch(html, /drawBoundaryWalls\(/, 'boundary wall art must remain transition-only, not a permanent renderer method');

console.log('SCRIPT_PARSE_OK');
console.log(`RUNTIME_ASSET_AUDIT_OK ${runtimeAssets.length}`);
