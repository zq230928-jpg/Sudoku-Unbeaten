const assert=require('node:assert/strict');
const bank=require('../legend-puzzle-bank');
const {SUPPORTED_TECHNIQUES,solveWithHumanTechniques,qualifiesLegend}=require('../extreme-sudoku');

assert.equal(bank.length,20);
for(const item of bank){
  assert.equal(item.puzzle.length,81,`${item.id} puzzle length`);
  assert.equal(item.solution.length,81,`${item.id} solution length`);
  const report=solveWithHumanTechniques(item.puzzle);
  assert.equal(report.unique,true,`${item.id} must have a unique solution`);
  assert.equal(report.solved,true,`${item.id} must be solved by the human-technique auditor`);
  assert.equal(report.onlyBasicSolved,false,`${item.id} must not be solvable by basic/mid techniques only`);
  assert.equal(qualifiesLegend(report),true,`${item.id} must satisfy legend requirements`);
  assert.ok(report.advancedSteps>=6,`${item.id} advanced steps`);
  assert.ok(report.advancedKinds>=4,`${item.id} advanced kinds`);
  assert.ok(report.longestChain>=7,`${item.id} chain length`);
}

const kingTemplates=[
  '008600000000007000109000403080205000500000004600403000201000309000700000005094600',
  '000600200000007000109000403080205006500000000600403000201000309000700000005094600'
];
const kingScores=kingTemplates.map(p=>solveWithHumanTechniques(p).score);
const legendScores=bank.map(p=>solveWithHumanTechniques(p.puzzle).score);
assert.ok(Math.min(...legendScores)>Math.max(...kingScores)*10,'legend score range must be clearly above king');

console.log('legend difficulty tests passed');
console.log('supported techniques:',SUPPORTED_TECHNIQUES.join(', '));
console.log('king score range:',Math.min(...kingScores),'-',Math.max(...kingScores));
console.log('legend score range:',Math.min(...legendScores),'-',Math.max(...legendScores));
