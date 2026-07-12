const assert=require('node:assert/strict');
const {toggleCandidateSet}=require('../candidate-notes');

{
  const original=new Set([1,4,7]);
  const next=toggleCandidateSet(original,4);
  assert.deepEqual([...next].sort((a,b)=>a-b),[1,7]);
  assert.deepEqual([...original].sort((a,b)=>a-b),[1,4,7]);
  assert.notEqual(next,original);
}

{
  const original=new Set([1,7]);
  const next=toggleCandidateSet(original,4);
  assert.deepEqual([...next].sort((a,b)=>a-b),[1,4,7]);
  assert.deepEqual([...original].sort((a,b)=>a-b),[1,7]);
  assert.notEqual(next,original);
}

{
  const next=toggleCandidateSet(null,9);
  assert.deepEqual([...next],[9]);
}

console.log('candidate note toggle tests passed');
