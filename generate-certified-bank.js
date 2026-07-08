const {audit}=require('./puzzle-audit');
const diverseSolutions=[
  '534678912672195348198342567859761423426853791713924856961537284287419635345286179'
];
const configs={
  novice:{holes:38,accept:a=>a.solved&&a.used.every(x=>['显性唯一','隐性唯一'].includes(x))},
  intermediate:{holes:44,accept:a=>a.solved&&special(a).length>=1},
  advanced:{holes:50,accept:a=>a.solved&&special(a).length>=2&&specialTotal(a)>=3},
  king:{holes:55,accept:a=>a.solved&&special(a).length>=3&&specialTotal(a)>=5&&a.used.includes('X-Wing')},
  legend:{holes:60,accept:a=>a.solved&&special(a).length>=3&&specialTotal(a)>=8&&a.used.includes('X-Wing')}
};
function special(a){return a.used.filter(x=>!['显性唯一','隐性唯一'].includes(x))}
function specialTotal(a){return special(a).reduce((sum,x)=>sum+(a.techniqueCounts[x]||0),0)}
function shuffled(a){for(let i=a.length-1;i;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function valid(g,r,c,n){for(let i=0;i<9;i++)if(g[r*9+i]===n||g[i*9+c]===n)return false;for(let y=r-r%3;y<r-r%3+3;y++)for(let x=c-c%3;x<c-c%3+3;x++)if(g[y*9+x]===n)return false;return true}
function unique(text,limit=2){const g=[...text].map(Number);let count=0;function solve(){let at=-1,options=null;for(let i=0;i<81;i++)if(!g[i]){const p=[];for(let n=1;n<=9;n++)if(valid(g,Math.floor(i/9),i%9,n))p.push(n);if(!p.length)return;if(!options||p.length<options.length){at=i;options=p}}if(at<0){count++;return}for(const n of options){g[at]=n;solve();g[at]=0;if(count>=limit)return}}solve();return count===1}
function randomSolution(){
  const g=Array(81).fill(0);
  for(const start of [0,30,60]){
    const nums=shuffled([1,2,3,4,5,6,7,8,9]);
    for(let k=0;k<9;k++)g[start+Math.floor(k/3)*9+k%3]=nums[k];
  }
  function fill(at=0){
    while(at<81&&g[at])at++;
    if(at===81)return true;
    const r=Math.floor(at/9),c=at%9;
    for(const n of shuffled([1,2,3,4,5,6,7,8,9]))if(valid(g,r,c,n)){
      g[at]=n;if(fill(at+1))return true;g[at]=0;
    }
    return false;
  }
  fill();return g.join('');
}
function candidate(solution,holes){const chars=[...solution];for(const i of shuffled([...Array(81).keys()]).slice(0,holes))chars[i]='0';return chars.join('')}
const requested=process.argv[2];
for(const[name,config]of Object.entries(configs).filter(([id])=>!requested||id===requested)){
  let found=null;
  let solution=diverseSolutions[0];
  for(let attempt=1;attempt<=250000;attempt++){
    const text=candidate(solution,config.holes);if(!unique(text))continue;const result=audit(text);
    if(config.accept(result)){found={text,result,holes:config.holes,attempt};break}
  }
  console.log(JSON.stringify({level:name,...found}));
}
