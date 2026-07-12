;(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.SudokuNoteUtils=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  function toggleCandidateSet(existing,digit){
    const next=new Set(existing||[]);
    if(next.has(digit))next.delete(digit);
    else next.add(digit);
    return next;
  }
  return{toggleCandidateSet};
});
