const assert=require('node:assert/strict');
const {reviveCost,canRevive,applyRevive}=require('../revive-rules');

const fixedCases=[
  ['novice',50],
  ['intermediate',100],
  ['advanced',500],
  ['king',1000]
];

for(const [level,cost] of fixedCases){
  assert.equal(reviveCost(level,99999),cost);
  assert.equal(canRevive(level,cost),true);
  assert.equal(canRevive(level,cost-1),false);
  assert.deepEqual(applyRevive({level,currentPoints:cost,mistakes:3}),{ok:true,cost,points:0,mistakes:2});
}

assert.equal(reviveCost('legend',1),1);
assert.equal(reviveCost('legend',2),1);
assert.equal(reviveCost('legend',3),1);
assert.equal(reviveCost('legend',4),2);
assert.equal(reviveCost('legend',100),34);
assert.equal(canRevive('legend',0),false);
assert.equal(canRevive('legend',1),true);
assert.deepEqual(applyRevive({level:'legend',currentPoints:100,mistakes:3}),{ok:true,cost:34,points:66,mistakes:2});
assert.deepEqual(applyRevive({level:'legend',currentPoints:66,mistakes:3}),{ok:true,cost:22,points:44,mistakes:2});
assert.deepEqual(applyRevive({level:'advanced',currentPoints:499,mistakes:3}),{ok:false,reason:'insufficient_points',cost:500,points:499,mistakes:3});
assert.deepEqual(applyRevive({level:'novice',currentPoints:500,mistakes:2}),{ok:false,reason:'not_failed',cost:50,points:500,mistakes:2});

console.log('revive rule tests passed');
