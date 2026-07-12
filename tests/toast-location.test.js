const assert=require('node:assert/strict');
const fs=require('node:fs');

const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('styles.css','utf8');
const js=fs.readFileSync('app.js','utf8');

assert.match(html,/<aside id="learningHint"[\s\S]*<div id="toast" class="toast"/,'toast must live inside the analysis card');
assert.match(css,/\.learning-hint\{position:relative\}/,'analysis card must be the toast positioning context');
assert.match(css,/\.toast\{position:absolute!important;left:50%;top:50%;bottom:auto!important;/,'toast must be centered in analysis card, not fixed to bottom');
assert.doesNotMatch(css.split('.learning-hint{position:relative}').pop(),/position:fixed[^}]*bottom:/,'final toast style must not use fixed bottom positioning');
assert.match(css,/pointer-events:none/,'toast must not intercept clicks');
assert.match(js,/toastQueue=\[\]/,'toast messages must be queued');
assert.match(js,/function showNextToast/,'toast queue display function must exist');

console.log('toast location tests passed');
