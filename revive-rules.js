;(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.SudokuReviveRules=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const fixedReviveCosts={novice:50,intermediate:100,advanced:500,king:1000};
  function reviveCost(level,currentPoints){
    const points=Math.max(0,Math.floor(Number(currentPoints)||0));
    return level==='legend'?Math.ceil(points/3):(fixedReviveCosts[level]??50);
  }
  function canRevive(level,currentPoints){
    const points=Math.max(0,Math.floor(Number(currentPoints)||0));
    const cost=reviveCost(level,points);
    return level==='legend'?points>0:points>=cost;
  }
  function applyRevive({level,currentPoints,mistakes}){
    const points=Math.max(0,Math.floor(Number(currentPoints)||0));
    const currentMistakes=Math.max(0,Math.floor(Number(mistakes)||0));
    const cost=reviveCost(level,points);
    if(currentMistakes<3)return{ok:false,reason:'not_failed',cost,points,mistakes:currentMistakes};
    if(!canRevive(level,points))return{ok:false,reason:'insufficient_points',cost,points,mistakes:currentMistakes};
    return{ok:true,cost,points:Math.max(0,points-cost),mistakes:2};
  }
  return{fixedReviveCosts,reviveCost,canRevive,applyRevive};
});
