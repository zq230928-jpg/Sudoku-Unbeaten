const assert=require('node:assert/strict');
const fs=require('node:fs');

const js=fs.readFileSync('app.js','utf8');

assert.doesNotMatch(js,/\.close\s*\(/,'game audio must not close AudioContext during play or difficulty switches');
assert.match(js,/function playApplause\(\)\{withSoundContext/,'applause must use the global sound context');
assert.match(js,/function preserveAudioAfterGameReset\(\)\{if\(!profile\.soundEnabled\)return;unlockAudio\('game reset'\)\}/,'game reset must preserve enabled audio without forcing it on');
assert.match(js,/preserveAudioAfterGameReset\(\);timerId=setInterval\(tick,1000\)/,'new games and difficulty switches must resume existing audio after reset');
assert.match(js,/const audioManager=\{/,'audio must be managed by a single global manager');
assert.match(js,/audioDebugSnapshot\(\)/,'debug mode must expose audio diagnostics');
assert.match(js,/display-mode: standalone/,'PWA standalone mode must be detected for audio diagnostics');
assert.match(js,/\['pointerdown','touchstart','click','keydown'\]\.forEach\(type=>document\.addEventListener\(type,unlockAudio,\{capture:true,passive:true\}\)\)/,'first user gesture must unlock audio for browser and PWA');
assert.match(js,/audioLog\('play click'/,'number input must log click playback in debug mode');
assert.match(js,/audioLog\('play mark'/,'mark input must log mark playback in debug mode');
assert.match(js,/audioLog\('play success'/,'success playback must be logged in debug mode');
assert.match(js,/audioLog\('play error'/,'error playback must be logged in debug mode');

const newGameBody=js.match(/function newGame\(\)\{([\s\S]*?)\n\}/)?.[1]||'';
assert.doesNotMatch(newGameBody,/soundEnabled\s*=/,'newGame must not reset soundEnabled');
assert.doesNotMatch(newGameBody,/soundUnlocked\s*=/,'newGame must not reset soundUnlocked');
assert.doesNotMatch(newGameBody,/soundCtx\s*=/,'newGame must not recreate or clear soundCtx');

const difficultyHandler=js.match(/document\.querySelectorAll\('\.difficulty button'\)\.forEach\(btn=>btn\.addEventListener\('click',\(\)=>\{[\s\S]*?newGame\(\)\}\)\);/)?.[0]||'';
assert.ok(difficultyHandler,'difficulty click handler should be found');
assert.doesNotMatch(difficultyHandler,/soundEnabled\s*=/,'difficulty switch must not override soundEnabled');
assert.doesNotMatch(difficultyHandler,/soundCtx\s*=/,'difficulty switch must not reset soundCtx');

const againHandler=js.match(/document\.querySelector\('#againButton'\)\.addEventListener\('click',\(\)=>\{[\s\S]*?\}\);/)?.[0]||'';
assert.ok(againHandler,'again button handler should be found');
assert.doesNotMatch(againHandler,/selectDefaultLevel\(\)/,'again button must keep the current difficulty');
assert.match(againHandler,/newGame\(\)/,'again button must start a new puzzle at the current difficulty');

const restartHandler=js.match(/document\.querySelector\('#restartAfterFail'\)\.addEventListener\('click',\(\)=>\{[\s\S]*?newGame\(\)\}\);/)?.[0]||'';
assert.ok(restartHandler,'failure restart handler should be found');
assert.doesNotMatch(restartHandler,/if\(result\)showToast\(result\.text\);selectDefaultLevel\(\);newGame\(\)/,'failure restart must not reset difficulty unless demotion flow handles it');

console.log('audio persistence tests passed');
