const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

class FakeAudio {
    constructor(src) {
        this.src = src;
        this.loop = false;
        this.paused = true;
        this.ended = false;
        this.currentTime = 0;
        this.volume = 1;
    }

    play() {
        this.paused = false;
        return Promise.resolve();
    }

    pause() {
        this.paused = true;
    }
}

global.Audio = FakeAudio;
global.localStorage = {
    getItem() {
        return null;
    },
    setItem() {}
};

const projectRoot = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
const classMatch = html.match(/class AudioManager \{[\s\S]*?\r?\n\}\r?\n\r?\nclass UIManager/);

assert.ok(classMatch, 'AudioManager source was not found in index.html');

const classSource = classMatch[0].replace(/\r?\n\r?\nclass UIManager$/, '');
const AudioManager = new Function(`${classSource}\nreturn AudioManager;`)();

{
    const audio = new AudioManager();
    let ambientStarts = 0;
    audio.playAmbient = () => {
        ambientStarts++;
    };
    audio.bossMusic.paused = false;
    audio.bossMusic.currentTime = 18;
    audio.bossMusic.volume = 0.35;

    audio.stopBossMusic({ resumeAmbient: false, immediate: true });

    assert.equal(audio.bossMusic.paused, true);
    assert.equal(audio.bossMusic.currentTime, 0);
    assert.equal(audio.bossMusic.volume, 0);
    assert.equal(audio.bossMusicStopping, false);
    assert.equal(ambientStarts, 0, 'game over must not restart ambient music');
}

{
    const audio = new AudioManager();
    let ambientStarts = 0;
    audio.playAmbient = () => {
        ambientStarts++;
    };
    audio.bossMusic.paused = false;
    audio.bossMusic.currentTime = 22;
    audio.bossMusic.volume = 0.3;

    audio.stopBossMusic({ resumeAmbient: true, immediate: true });

    assert.equal(audio.bossMusic.paused, true);
    assert.equal(audio.bossMusic.currentTime, 0);
    assert.equal(ambientStarts, 1, 'normal Boss completion should restore ambient music');
}

{
    const audio = new AudioManager();
    let ambientStarts = 0;
    audio.playAmbient = () => {
        ambientStarts++;
    };
    audio.bossMusic.paused = false;
    audio.bossMusic.currentTime = 9;
    audio.bossMusic.volume = 0.2;
    audio.bossMusicStopping = true;
    audio.resumeAmbientAfterBoss = true;

    audio.pauseMusic();

    assert.equal(audio.bossMusic.paused, true);
    assert.equal(audio.bossMusic.currentTime, 0);
    assert.equal(audio.ambientWasPlaying, true, 'pausing during a fade-out should defer ambient restoration');
    assert.equal(ambientStarts, 0, 'ambient music must stay stopped while the game is paused');

    audio.resumeMusic();

    assert.equal(ambientStarts, 1, 'ambient music should resume after leaving pause');
    assert.equal(audio.ambientWasPlaying, false);
}

console.log('AUDIO_LIFECYCLE_OK');
