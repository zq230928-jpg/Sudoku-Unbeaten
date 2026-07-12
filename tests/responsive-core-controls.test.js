const assert = require('assert');
const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('styles.css', 'utf8');
const js = fs.readFileSync('app.js', 'utf8');

const requiredControls = [
  'eraseButton',
  'notesButton',
  'autoNotesButton',
  'hintButton',
  'newButton',
];

for (const id of requiredControls) {
  assert.match(html, new RegExp(`id="${id}"`), `${id} must exist in the shared page markup`);
  assert.doesNotMatch(
    css,
    new RegExp(`#${id}[^{}]*\\{[^}]*display\\s*:\\s*none`, 'i'),
    `${id} must not be hidden by a button-specific CSS rule`,
  );
}

assert.match(html, /id="learningHint"/, 'AI / step analysis panel must exist in shared markup');
assert.match(css, /v3\.0\.15 网页\/平板\/手机统一核心操作/, 'final responsive protection rule must be present');
assert.match(css, /\.actions\{display:grid!important;grid-template-columns:repeat\(5,minmax\(0,1fr\)\)!important/, 'all five action buttons must share one responsive grid');
assert.match(css, /\.actions button\{display:flex!important;visibility:visible!important/, 'action buttons must remain visible across breakpoints');
assert.match(css, /\.learning-hint\{display:flex!important;position:relative/, 'analysis panel must remain available and anchor score toasts');
assert.match(css, /\.learning-hint\[hidden\]\{display:flex!important\}/, 'hidden analysis panel must still reserve the shared responsive area');

assert.doesNotMatch(js, /isDesktop\s*\)/, 'game logic must not remove controls for desktop');
assert.doesNotMatch(js, /matchMedia\([^)]*\)[\s\S]{0,120}return\s+null/, 'media queries must not delete core controls');

console.log('responsive core controls tests passed');
