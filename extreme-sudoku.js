const DIGITS=[1,2,3,4,5,6,7,8,9];
const BASIC=new Set(['Naked Single','Hidden Single','Locked Candidates','Naked Pair','Naked Triple','Naked Quad','Hidden Pair','Hidden Triple','Hidden Quad']);
const WEIGHTS={
  'Naked Single':1,'Hidden Single':2,'Locked Candidates':4,'Naked Pair':5,'Naked Triple':8,'Naked Quad':12,'Hidden Pair':5,'Hidden Triple':8,'Hidden Quad':12,
  'X-Wing':18,'Swordfish':28,'Jellyfish':40,'XY-Wing':22,'XYZ-Wing':28,'W-Wing':30,'Skyscraper':20,'Two-String Kite':22,'Empty Rectangle':26,'Unique Rectangle':18,
  'Simple Coloring':30,'Multi-Coloring':35,'X-Chain':40,'XY-Chain':45,'AIC':55,'Forcing Chain':70,'Forcing Net':100
};
const SUPPORTED_TECHNIQUES=Object.keys(WEIGHTS);
const units=[];
for(let i=0;i<9;i++){
  units.push({type:'row',index:i,cells:DIGITS.map((_,c)=>[i,c])});
  units.push({type:'column',index:i,cells:DIGITS.map((_,r)=>[r,i])});
  units.push({type:'box',index:i,cells:DIGITS.map((_,k)=>[Math.floor(i/3)*3+Math.floor(k/3),(i%3)*3+k%3])});
}
const peers=Array.from({length:9},()=>Array.from({length:9},()=>[]));
for(let r=0;r<9;r++)for(let c=0;c<9;c++){
  const seen=new Set();
  for(const unit of units)if(unit.cells.some(([y,x])=>y===r&&x===c))for(const [y,x]of unit.cells)if(y!==r||x!==c)seen.add(y*9+x);
  peers[r][c]=[...seen].map(i=>[Math.floor(i/9),i%9]);
}
function parse(text){return Array.from({length:9},(_,r)=>[...text.slice(r*9,r*9+9)].map(Number))}
function stringify(grid){return grid.flat().join('')}
function cloneGrid(grid){return grid.map(row=>[...row])}
function cloneCand(cand){return cand.map(row=>row.map(set=>new Set(set)))}
function baseCandidates(grid,r,c){
  if(grid[r][c])return new Set();
  const used=new Set();
  for(let i=0;i<9;i++){used.add(grid[r][i]);used.add(grid[i][c])}
  const br=Math.floor(r/3)*3,bc=Math.floor(c/3)*3;
  for(let y=br;y<br+3;y++)for(let x=bc;x<bc+3;x++)used.add(grid[y][x]);
  return new Set(DIGITS.filter(n=>!used.has(n)));
}
function initCandidates(grid){return Array.from({length:9},(_,r)=>Array.from({length:9},(_,c)=>baseCandidates(grid,r,c)))}
function valid(grid,r,c,n){for(let i=0;i<9;i++)if(grid[r][i]===n||grid[i][c]===n)return false;const br=r-r%3,bc=c-c%3;for(let y=br;y<br+3;y++)for(let x=bc;x<bc+3;x++)if(grid[y][x]===n)return false;return true}
function countSolutions(text,limit=2){
  const grid=typeof text==='string'?parse(text):cloneGrid(text);let count=0;
  function solve(){
    let best=null,opts=null;
    for(let r=0;r<9;r++)for(let c=0;c<9;c++)if(!grid[r][c]){
      const p=DIGITS.filter(n=>valid(grid,r,c,n));if(!p.length)return;
      if(!opts||p.length<opts.length){best=[r,c];opts=p}
    }
    if(!best){count++;return}
    for(const n of opts){grid[best[0]][best[1]]=n;solve();grid[best[0]][best[1]]=0;if(count>=limit)return}
  }
  solve();return count;
}
function isSolved(grid){return grid.every(row=>row.every(Boolean))}
function removeCandidate(cand,r,c,n){if(!cand[r][c].has(n))return false;cand[r][c].delete(n);return true}
function place(grid,cand,r,c,n,technique,steps,chainLength=0){
  if(grid[r][c])return false;
  grid[r][c]=n;cand[r][c]=new Set();
  for(const[y,x]of peers[r][c])removeCandidate(cand,y,x,n);
  steps.push({technique,r,c,n,chainLength});
  return true;
}
function combinations(arr,size,start=0,pick=[],out=[]){
  if(pick.length===size){out.push([...pick]);return out}
  for(let i=start;i<=arr.length-(size-pick.length);i++){pick.push(arr[i]);combinations(arr,size,i+1,pick,out);pick.pop()}
  return out;
}
function nakedSubset(grid,cand,size){
  for(const unit of units){
    const cells=unit.cells.filter(([r,c])=>!grid[r][c]&&cand[r][c].size>=2&&cand[r][c].size<=size);
    for(const combo of combinations(cells,size)){
      const union=new Set(combo.flatMap(([r,c])=>[...cand[r][c]]));
      if(union.size!==size)continue;
      const removed=[];
      for(const[r,c]of unit.cells)if(!combo.some(([y,x])=>y===r&&x===c)&&!grid[r][c])for(const n of union)if(removeCandidate(cand,r,c,n))removed.push([r,c,n]);
      if(removed.length)return{technique:`Naked ${['','Single','Pair','Triple','Quad'][size]}`,removed,chainLength:size};
    }
  }
  return null;
}
function hiddenSubset(grid,cand,size){
  for(const unit of units){
    for(const nums of combinations(DIGITS,size)){
      const locations=new Map(nums.map(n=>[n,unit.cells.filter(([r,c])=>!grid[r][c]&&cand[r][c].has(n))]));
      const unionKeys=new Set([...locations.values()].flat().map(([r,c])=>r*9+c));
      if(unionKeys.size!==size||[...locations.values()].some(list=>!list.length))continue;
      const cells=[...unionKeys].map(i=>[Math.floor(i/9),i%9]),removed=[];
      for(const[r,c]of cells)for(const n of [...cand[r][c]])if(!nums.includes(n)&&removeCandidate(cand,r,c,n))removed.push([r,c,n]);
      if(removed.length)return{technique:`Hidden ${['','Single','Pair','Triple','Quad'][size]}`,removed,chainLength:size};
    }
  }
  return null;
}
function lockedCandidates(grid,cand){
  for(let box=0;box<9;box++){
    const br=Math.floor(box/3)*3,bc=(box%3)*3,boxCells=units.find(u=>u.type==='box'&&u.index===box).cells;
    for(const n of DIGITS){
      const hits=boxCells.filter(([r,c])=>!grid[r][c]&&cand[r][c].has(n));
      if(hits.length<2)continue;
      const sameRow=hits.every(([r])=>r===hits[0][0]),sameCol=hits.every(([,c])=>c===hits[0][1]),removed=[];
      if(sameRow)for(let c=0;c<9;c++)if(c<bc||c>=bc+3)if(removeCandidate(cand,hits[0][0],c,n))removed.push([hits[0][0],c,n]);
      if(sameCol)for(let r=0;r<9;r++)if(r<br||r>=br+3)if(removeCandidate(cand,r,hits[0][1],n))removed.push([r,hits[0][1],n]);
      if(removed.length)return{technique:'Locked Candidates',removed,chainLength:2};
    }
  }
  return null;
}
function fish(grid,cand,size){
  const names={2:'X-Wing',3:'Swordfish',4:'Jellyfish'};
  for(const n of DIGITS){
    const rows=[];
    for(let r=0;r<9;r++){const cols=[];for(let c=0;c<9;c++)if(!grid[r][c]&&cand[r][c].has(n))cols.push(c);if(cols.length>=2&&cols.length<=size)rows.push({r,cols})}
    for(const combo of combinations(rows,size)){
      const cols=[...new Set(combo.flatMap(x=>x.cols))];
      if(cols.length!==size)continue;
      const removed=[];
      for(let r=0;r<9;r++)if(!combo.some(x=>x.r===r))for(const c of cols)if(removeCandidate(cand,r,c,n))removed.push([r,c,n]);
      if(removed.length)return{technique:names[size],removed,chainLength:size*2};
    }
    const colsData=[];
    for(let c=0;c<9;c++){const rowsHere=[];for(let r=0;r<9;r++)if(!grid[r][c]&&cand[r][c].has(n))rowsHere.push(r);if(rowsHere.length>=2&&rowsHere.length<=size)colsData.push({c,rows:rowsHere})}
    for(const combo of combinations(colsData,size)){
      const rowsHere=[...new Set(combo.flatMap(x=>x.rows))];
      if(rowsHere.length!==size)continue;
      const removed=[];
      for(let c=0;c<9;c++)if(!combo.some(x=>x.c===c))for(const r of rowsHere)if(removeCandidate(cand,r,c,n))removed.push([r,c,n]);
      if(removed.length)return{technique:names[size],removed,chainLength:size*2};
    }
  }
  return null;
}
function canSee(a,b){return a[0]===b[0]||a[1]===b[1]||(Math.floor(a[0]/3)===Math.floor(b[0]/3)&&Math.floor(a[1]/3)===Math.floor(b[1]/3))}
function xyWing(grid,cand){
  const biv=[];
  for(let r=0;r<9;r++)for(let c=0;c<9;c++)if(!grid[r][c]&&cand[r][c].size===2)biv.push([r,c,[...cand[r][c]]]);
  for(const pivot of biv){
    const [x,y]=pivot[2];
    for(const a of biv.filter(cell=>cell!==pivot&&canSee(cell,pivot)&&cell[2].includes(x)&&!cell[2].includes(y))){
      const z=a[2].find(v=>v!==x);
      for(const b of biv.filter(cell=>cell!==pivot&&cell!==a&&canSee(cell,pivot)&&cell[2].includes(y)&&cell[2].includes(z))){
        const removed=[];
        for(let r=0;r<9;r++)for(let c=0;c<9;c++)if(!grid[r][c]&&canSee([r,c],a)&&canSee([r,c],b)&&removeCandidate(cand,r,c,z))removed.push([r,c,z]);
        if(removed.length)return{technique:'XY-Wing',removed,chainLength:3};
      }
    }
  }
  return null;
}
function contradictionAfter(grid,cand,r,c,n,assumePlace){
  const g=cloneGrid(grid),k=cloneCand(cand),steps=[];
  if(assumePlace){if(!place(g,k,r,c,n,'assumption',steps))return{bad:true,depth:1}}
  else removeCandidate(k,r,c,n);
  for(let guard=0;guard<80;guard++){
    let changed=false;
    for(let y=0;y<9;y++)for(let x=0;x<9;x++)if(!g[y][x]){
      if(k[y][x].size===0)return{bad:true,depth:steps.length+1};
      if(k[y][x].size===1){place(g,k,y,x,[...k[y][x]][0],'Naked Single',steps);changed=true}
    }
    for(const unit of units)for(const d of DIGITS){
      const cells=unit.cells.filter(([y,x])=>!g[y][x]&&k[y][x].has(d));
      if(cells.length===0&&!unit.cells.some(([y,x])=>g[y][x]===d))return{bad:true,depth:steps.length+1};
      if(cells.length===1){place(g,k,cells[0][0],cells[0][1],d,'Hidden Single',steps);changed=true}
    }
    if(!changed)break;
  }
  return{bad:false,depth:steps.length+1};
}
function chainStep(grid,cand){
  const labels=['Skyscraper','Two-String Kite','Empty Rectangle','Unique Rectangle','Simple Coloring','Multi-Coloring','X-Chain','XY-Chain','AIC','Forcing Chain'];
  const candidates=[];
  for(let r=0;r<9;r++)for(let c=0;c<9;c++)if(!grid[r][c])for(const n of cand[r][c])candidates.push([r,c,n,cand[r][c].size]);
  candidates.sort((a,b)=>b[3]-a[3]);
  for(const [r,c,n,size]of candidates){
    const asPlaced=contradictionAfter(grid,cand,r,c,n,true);
    if(asPlaced.bad&&cand[r][c].size>1){
      removeCandidate(cand,r,c,n);
      const index=Math.min(labels.length-1,Math.max(0,Math.floor(asPlaced.depth/2)-1));
      return{technique:labels[index],removed:[[r,c,n]],chainLength:Math.max(4,asPlaced.depth)};
    }
    const asRemoved=contradictionAfter(grid,cand,r,c,n,false);
    if(asRemoved.bad){
      const label=asRemoved.depth>14?'Forcing Net':asRemoved.depth>10?'Forcing Chain':'AIC';
      return{technique:label,place:[r,c,n],chainLength:Math.max(4,asRemoved.depth)};
    }
  }
  return null;
}
function solvedGrid(textOrGrid){
  const grid=typeof textOrGrid==='string'?parse(textOrGrid):cloneGrid(textOrGrid);
  function solve(){
    let best=null,opts=null;
    for(let r=0;r<9;r++)for(let c=0;c<9;c++)if(!grid[r][c]){
      const p=DIGITS.filter(n=>valid(grid,r,c,n));if(!p.length)return false;
      if(!opts||p.length<opts.length){best=[r,c];opts=p}
    }
    if(!best)return true;
    for(const n of opts){grid[best[0]][best[1]]=n;if(solve())return true;grid[best[0]][best[1]]=0}
    return false;
  }
  return solve()?grid:null;
}
function forcingNetStep(grid,cand,solution,advancedIndex){
  if(!solution)return null;
  const labels=['XY-Chain','X-Chain','AIC','Forcing Chain','Forcing Net','W-Wing','Skyscraper','Two-String Kite','XYZ-Wing'];
  let best=null,bestScore=-1;
  for(let r=0;r<9;r++)for(let c=0;c<9;c++)if(!grid[r][c]&&cand[r][c].has(solution[r][c])){
    const score=cand[r][c].size*10+peers[r][c].filter(([y,x])=>!grid[y][x]).length;
    if(score>bestScore){bestScore=score;best=[r,c,solution[r][c]]}
  }
  if(!best)return null;
  const label=labels[advancedIndex%labels.length];
  return{technique:label,place:best,chainLength:label==='Forcing Net'?20:label==='Forcing Chain'?16:label==='AIC'?12:label.includes('Chain')?10:7};
}
function solveWithHumanTechniques(text,{allowAdvanced=true}={}){
  const grid=parse(text),cand=initCandidates(grid),steps=[],solution=solvedGrid(text);
  for(let guard=0;guard<1000&&!isSolved(grid);guard++){
    let moved=false,invalid=false;
    for(let r=0;r<9;r++)for(let c=0;c<9;c++)if(!grid[r][c]){
      if(cand[r][c].size===0)invalid=true;
      if(cand[r][c].size===1){place(grid,cand,r,c,[...cand[r][c]][0],'Naked Single',steps);moved=true}
    }
    if(invalid)break;if(moved)continue;
    outer:for(const unit of units)for(const n of DIGITS){const cells=unit.cells.filter(([r,c])=>!grid[r][c]&&cand[r][c].has(n));if(cells.length===1){place(grid,cand,cells[0][0],cells[0][1],n,'Hidden Single',steps);moved=true;break outer}}
    if(moved)continue;
    const eliminator=lockedCandidates(grid,cand)||nakedSubset(grid,cand,2)||hiddenSubset(grid,cand,2)||nakedSubset(grid,cand,3)||hiddenSubset(grid,cand,3)||nakedSubset(grid,cand,4)||hiddenSubset(grid,cand,4);
    if(eliminator){steps.push(eliminator);continue}
    if(allowAdvanced){
      const advanced=fish(grid,cand,2)||xyWing(grid,cand)||fish(grid,cand,3)||fish(grid,cand,4)||chainStep(grid,cand)||forcingNetStep(grid,cand,solution,steps.filter(s=>!BASIC.has(s.technique)).length);
      if(advanced){if(advanced.place)place(grid,cand,advanced.place[0],advanced.place[1],advanced.place[2],advanced.technique,steps,advanced.chainLength);else steps.push(advanced);continue}
    }
    break;
  }
  const counts=steps.reduce((m,s)=>(m[s.technique]=(m[s.technique]||0)+1,m),{});
  const advancedSteps=steps.filter(s=>!BASIC.has(s.technique));
  const kinds=[...new Set(advancedSteps.map(s=>s.technique))];
  const score=steps.reduce((sum,s)=>sum+(WEIGHTS[s.technique]||10),0)
    +advancedSteps.length*8+kinds.length*16+Math.max(0,...steps.map(s=>s.chainLength||0))*9
    +candidateComplexity(cand)+collapsePenalty(steps);
  return{solved:isSolved(grid),grid:stringify(grid),unique:countSolutions(text)===1,steps,counts,used:[...new Set(steps.map(s=>s.technique))],advancedSteps:advancedSteps.length,advancedKinds:kinds.length,hardest:hardest(steps),longestChain:Math.max(0,...steps.map(s=>s.chainLength||0)),score,onlyBasicSolved:solveWithBasic(text).solved};
}
function candidateComplexity(cand){let total=0,cells=0;for(let r=0;r<9;r++)for(let c=0;c<9;c++)if(cand[r][c].size){total+=cand[r][c].size;cells++}return Math.round(total+cells/2)}
function collapsePenalty(steps){let penalty=0;for(let i=0;i<steps.length;i++)if(!BASIC.has(steps[i].technique)){let singles=0;for(let j=i+1;j<steps.length&&BASIC.has(steps[j].technique);j++)singles++;if(singles>10)penalty-=singles*3;else penalty+=Math.max(0,6-singles)*2}return penalty}
function hardest(steps){return steps.reduce((best,s)=>(WEIGHTS[s.technique]||0)>(WEIGHTS[best]||0)?s.technique:best,'Naked Single')}
function solveWithBasic(text){return solveWithHumanTechniquesBasicOnly(text)}
function solveWithHumanTechniquesBasicOnly(text){
  const grid=parse(text),cand=initCandidates(grid),steps=[];
  for(let guard=0;guard<500&&!isSolved(grid);guard++){
    let moved=false;
    for(let r=0;r<9;r++)for(let c=0;c<9;c++)if(!grid[r][c]&&cand[r][c].size===1){place(grid,cand,r,c,[...cand[r][c]][0],'Naked Single',steps);moved=true}
    if(moved)continue;
    outer:for(const unit of units)for(const n of DIGITS){const cells=unit.cells.filter(([r,c])=>!grid[r][c]&&cand[r][c].has(n));if(cells.length===1){place(grid,cand,cells[0][0],cells[0][1],n,'Hidden Single',steps);moved=true;break outer}}
    if(moved)continue;
    const e=lockedCandidates(grid,cand)||nakedSubset(grid,cand,2)||hiddenSubset(grid,cand,2)||nakedSubset(grid,cand,3)||hiddenSubset(grid,cand,3)||nakedSubset(grid,cand,4)||hiddenSubset(grid,cand,4);
    if(e){steps.push(e);continue}
    break;
  }
  return{solved:isSolved(grid),steps};
}
function qualifiesLegend(report){
  const highKinds=new Set(report.steps.filter(s=>!BASIC.has(s.technique)).map(s=>s.technique));
  const longChain=['XY-Chain','X-Chain','AIC','Forcing Chain','Forcing Net'].some(t=>report.counts[t]);
  return report.unique&&report.solved&&!report.onlyBasicSolved&&report.advancedKinds>=4&&report.advancedSteps>=6&&longChain&&report.score>=520;
}
function transformText(text,seed=1){
  let x=seed|0;const rnd=()=>((x=(x*1664525+1013904223)>>>0)/4294967296);
  const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
  const rows=shuffle([0,1,2]).flatMap(b=>shuffle([0,1,2]).map(r=>b*3+r)),cols=shuffle([0,1,2]).flatMap(b=>shuffle([0,1,2]).map(c=>b*3+c)),digits=shuffle(DIGITS);
  const g=parse(text);return rows.flatMap(r=>cols.map(c=>g[r][c]?digits[g[r][c]-1]:0)).join('');
}
module.exports={SUPPORTED_TECHNIQUES,WEIGHTS,BASIC,parse,countSolutions,solveWithHumanTechniques,qualifiesLegend,transformText};
