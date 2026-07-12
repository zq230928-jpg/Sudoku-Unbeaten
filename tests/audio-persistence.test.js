const assert=require('node:assert/strict');
const fs=require('node:fs');

const js=fs.readFileSync('app.js','utf8');

assert.doesNotMatch(js,/\.close\s*\(/,'game audio must not close AudioContext during play or difficulty switches');
assert.match(js,/function playApplause\(\)\{withSoundContext/,'applause must use the global sound context');
assert.match(js,/function preserveAudioAfterGameReset\(\)\{if\(!profile\.soundEnabled\)return;unlockAudio\(\)\}/,'game reset must preserve enabled audio without forcing it on');
assert.match(js,/preserveAudioAfterGameReset\(\);timerId=setInterval\(tick,1000\)/,'new games and difficulty switches must resume existing audio after reset');

const newGameBody=js.match(/function newGame\(\)\{([\s\S]*?)\n\}/)?.[1]||'';
assert.doesNotMatch(newGameBody,/soundEnabled\s*=/,'newGame must not reset soundEnabled');
assert.doesNotMatch(newGameBody,/soundUnlocked\s*=/,'newGame must not reset soundUnlocked');
assert.doesNotMatch(newGameBody,/soundCtx\s*=/,'newGame must not recreate or clear soundCtx');

const difficultyHandler=js.match(/document\.querySelectorAll\('\.difficulty button'\)\.forEach\(btn=>btn\.addEventListener\('click',\(\)=>\{[\s\S]*?newGame\(\)\}\)\);/)?.[0]||'';
assert.ok(difficultyHandler,'difficulty click handler should be found');
assert.doesNotMatch(difficultyHandler,/soundEnabled\s*=/,'difficulty switch must not override soundEnabled');
assert.doesNotMatch(difficultyHandler,/soundCtx\s*=/,'difficulty switch must not reset soundCtx');

console.log('audio persistence tests passed');
