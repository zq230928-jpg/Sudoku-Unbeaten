const ALL=new Set([1,2,3,4,5,6,7,8,9]);
const units=[];
for(let i=0;i<9;i++){
  units.push([...Array(9)].map((_,c)=>[i,c]));
  units.push([...Array(9)].map((_,r)=>[r,i]));
  units.push([...Array(9)].map((_,k)=>[Math.floor(i/3)*3+Math.floor(k/3),(i%3)*3+k%3]));
}
const peers=Array.from({length:9},()=>Array.from({length:9},()=>[]));
for(let r=0;r<9;r++)for(let c=0;c<9;c++){
  const seen=new Set();
  for(const unit of units.filter(u=>u.some(p=>p[0]===r&&p[1]===c)))for(const [y,x] of unit)if(y!==r||x!==c)seen.add(y*9+x);
  peers[r][c]=[...seen].map(i=>[Math.floor(i/9),i%9]);
}
function parse(text){return Array.from({length:9},(_,r)=>[...text.slice(r*9,r*9+9)].map(Number))}
function audit(text){
  const grid=parse(text),cand=Array.from({length:9},()=>Array.from({length:9},()=>new Set(ALL))),used=[],steps=[];
  function remove(r,c,n){if(grid[r][c]||!cand[r][c].has(n))return false;cand[r][c].delete(n);return true}
  function place(r,c,n,technique){if(grid[r][c])return false;grid[r][c]=n;cand[r][c]=new Set;for(const [y,x] of peers[r][c])remove(y,x,n);used.push(technique);steps.push({technique,r,c,n});return true}
  for(let r=0;r<9;r++)for(let c=0;c<9;c++)if(grid[r][c]){const n=grid[r][c];cand[r][c]=new Set;for(const[y,x]of peers[r][c])remove(y,x,n)}
  for(let rounds=0;rounds<500;rounds++){
    let changed=false;
    for(let r=0;r<9;r++)for(let c=0;c<9;c++)if(!grid[r][c]&&cand[r][c].size===1){place(r,c,[...cand[r][c]][0],'显性唯一');changed=true}
    if(changed)continue;
    outer:for(const unit of units)for(let n=1;n<=9;n++){const cells=unit.filter(([r,c])=>!grid[r][c]&&cand[r][c].has(n));if(cells.length===1){place(cells[0][0],cells[0][1],n,'隐性唯一');changed=true;break outer}}
    if(changed)continue;
    outer:for(const unit of units){const empties=unit.filter(([r,c])=>!grid[r][c]);for(let i=0;i<empties.length-1;i++)for(let j=i+1;j<empties.length;j++){const a=cand[empties[i][0]][empties[i][1]],b=cand[empties[j][0]][empties[j][1]];if(a.size===2&&[...a].every(n=>b.has(n))&&b.size===2){let hit=false;for(const [r,c]of empties)if((r!==empties[i][0]||c!==empties[i][1])&&(r!==empties[j][0]||c!==empties[j][1]))for(const n of a)hit=remove(r,c,n)||hit;if(hit){used.push('显性数对');changed=true;break outer}}}}
    if(changed)continue;
    outer:for(const unit of units)for(let a=1;a<=8;a++)for(let b=a+1;b<=9;b++){const pa=unit.filter(([r,c])=>!grid[r][c]&&cand[r][c].has(a)),pb=unit.filter(([r,c])=>!grid[r][c]&&cand[r][c].has(b));if(pa.length===2&&pb.length===2&&pa.every((p,i)=>p[0]===pb[i][0]&&p[1]===pb[i][1])){let hit=false;for(const[r,c]of pa)for(const n of [...cand[r][c]])if(n!==a&&n!==b)hit=remove(r,c,n)||hit;if(hit){used.push('隐性数对');changed=true;break outer}}}
    if(changed)continue;
    outer:for(let br=0;br<3;br++)for(let bc=0;bc<3;bc++)for(let n=1;n<=9;n++){const box=[];for(let r=br*3;r<br*3+3;r++)for(let c=bc*3;c<bc*3+3;c++)if(!grid[r][c]&&cand[r][c].has(n))box.push([r,c]);if(box.length>1&&box.every(p=>p[0]===box[0][0])){let hit=false;for(let c=0;c<9;c++)if(Math.floor(c/3)!==bc)hit=remove(box[0][0],c,n)||hit;if(hit){used.push('区块排除');changed=true;break outer}}if(box.length>1&&box.every(p=>p[1]===box[0][1])){let hit=false;for(let r=0;r<9;r++)if(Math.floor(r/3)!==br)hit=remove(r,box[0][1],n)||hit;if(hit){used.push('区块排除');changed=true;break outer}}}
    if(changed)continue;
    outer:for(const unit of units){const cells=unit.filter(([r,c])=>!grid[r][c]&&cand[r][c].size>=2&&cand[r][c].size<=3);for(let i=0;i<cells.length-2;i++)for(let j=i+1;j<cells.length-1;j++)for(let k=j+1;k<cells.length;k++){const trio=[cells[i],cells[j],cells[k]],union=new Set(trio.flatMap(([r,c])=>[...cand[r][c]]));if(union.size===3){let hit=false;for(const[r,c]of unit)if(!trio.some(p=>p[0]===r&&p[1]===c))for(const n of union)hit=remove(r,c,n)||hit;if(hit){used.push('三数组');changed=true;break outer}}}}
    if(changed)continue;
    outer:for(let n=1;n<=9;n++){
      const rows=[];for(let r=0;r<9;r++){const cols=[];for(let c=0;c<9;c++)if(!grid[r][c]&&cand[r][c].has(n))cols.push(c);if(cols.length===2)rows.push({r,cols})}
      for(let i=0;i<rows.length-1;i++)for(let j=i+1;j<rows.length;j++)if(rows[i].cols.join()===rows[j].cols.join()){let hit=false;for(let r=0;r<9;r++)if(r!==rows[i].r&&r!==rows[j].r)for(const c of rows[i].cols)hit=remove(r,c,n)||hit;if(hit){used.push('X-Wing');changed=true;break outer}}
      const cols=[];for(let c=0;c<9;c++){const rowList=[];for(let r=0;r<9;r++)if(!grid[r][c]&&cand[r][c].has(n))rowList.push(r);if(rowList.length===2)cols.push({c,rows:rowList})}
      for(let i=0;i<cols.length-1;i++)for(let j=i+1;j<cols.length;j++)if(cols[i].rows.join()===cols[j].rows.join()){let hit=false;for(let c=0;c<9;c++)if(c!==cols[i].c&&c!==cols[j].c)for(const r of cols[i].rows)hit=remove(r,c,n)||hit;if(hit){used.push('X-Wing');changed=true;break outer}}
    }
    if(!changed)break;
  }
  const solved=grid.every(row=>row.every(Boolean)),invalid=cand.some((row,r)=>row.some((s,c)=>!grid[r][c]&&!s.size));
  const techniqueCounts=used.reduce((counts,name)=>(counts[name]=(counts[name]||0)+1,counts),{});
  return{solved,invalid,filled:grid.flat().filter(Boolean).length,used:[...new Set(used)],techniqueCounts,steps:steps.length};
}
if(require.main===module){const puzzles=JSON.parse(process.argv[2]);for(const[name,text]of Object.entries(puzzles))console.log(name,JSON.stringify(audit(text)))}
module.exports={audit};
