import { useState, useEffect, useCallback } from "react";

// ─── ASSET REGISTRY ───────────────────────────────────────────────────────────
const BASE_ASSETS = [
  { ticker:"IB1T.L",  label:"IB1T",    group:"Bitcoin",    benchmarkIdxs:["NASDAQ","S&P500"] },
  { ticker:"BTC-USD", label:"BTC/USD", group:"Bitcoin",    benchmarkIdxs:["NASDAQ","S&P500"] },
  { ticker:"LQQS.L",  label:"LQQS",    group:"Tech",       benchmarkIdxs:["NASDAQ","S&P500"] },
  { ticker:"DAGB.L",  label:"DAGB",    group:"Tech",       benchmarkIdxs:["NASDAQ","S&P500"] },
  { ticker:"IUIT.L",  label:"IUIT",    group:"Tech",       benchmarkIdxs:["NASDAQ","S&P500"] },
  { ticker:"IUCD.L",  label:"IUCD",    group:"Tech",       benchmarkIdxs:["NASDAQ","S&P500"] },
  { ticker:"IITU.L",  label:"IITU",    group:"Tech",       benchmarkIdxs:["NASDAQ","S&P500"] },
  { ticker:"SEMI.L",  label:"SEMI",    group:"Tech",       benchmarkIdxs:["NASDAQ","S&P500"] },
  { ticker:"RBOT.L",  label:"RBOT",    group:"Tech",       benchmarkIdxs:["NASDAQ","S&P500"] },
  { ticker:"ARKK",    label:"ARKK",    group:"Tech",       benchmarkIdxs:["NASDAQ","S&P500"] },
  { ticker:"SOIL.L",  label:"SOIL",    group:"Commodities",benchmarkIdxs:["S&P500","NASDAQ","FTSE"] },
  { ticker:"SBRT.L",  label:"SBRT",    group:"Commodities",benchmarkIdxs:["S&P500","NASDAQ","FTSE"] },
  { ticker:"REMX.L",  label:"REMX",    group:"Commodities",benchmarkIdxs:["S&P500","NASDAQ","FTSE"] },
  { ticker:"BRNT.L",  label:"BRNT",    group:"Commodities",benchmarkIdxs:["S&P500","NASDAQ","FTSE"] },
  { ticker:"CL=F",    label:"WTI",     group:"Commodities",benchmarkIdxs:["S&P500","NASDAQ","FTSE"] },
  { ticker:"^GSPC",   label:"S&P500",  group:"Indices",    benchmarkIdxs:["S&P500","NASDAQ","FTSE"] },
  { ticker:"^IXIC",   label:"NASDAQ",  group:"Indices",    benchmarkIdxs:["NASDAQ","S&P500"] },
  { ticker:"^FTSE",   label:"FTSE",    group:"Indices",    benchmarkIdxs:["FTSE","S&P500"] },
  { ticker:"CSPX.L",  label:"CSPX",    group:"Indices",    benchmarkIdxs:["S&P500","NASDAQ","FTSE"] },
  { ticker:"SPYL.L",  label:"SPYL",    group:"Indices",    benchmarkIdxs:["S&P500","NASDAQ","FTSE"] },
  { ticker:"EQQQ.L",  label:"EQQQ",    group:"Indices",    benchmarkIdxs:["NASDAQ","S&P500"] },
  { ticker:"EQGB.L",  label:"EQGB",    group:"Indices",    benchmarkIdxs:["FTSE","S&P500"] },
  { ticker:"ISF.L",   label:"ISF",     group:"Indices",    benchmarkIdxs:["FTSE","S&P500"] },
  { ticker:"VUKE.L",  label:"VUKE",    group:"Indices",    benchmarkIdxs:["FTSE","S&P500"] },
  { ticker:"ISPY.L",  label:"ISPY",    group:"Indices",    benchmarkIdxs:["S&P500","NASDAQ","FTSE"] },
  { ticker:"NVDA",    label:"NVIDIA",  group:"Stocks",     benchmarkIdxs:["NASDAQ","S&P500"] },
  { ticker:"TSLA",    label:"Tesla",   group:"Stocks",     benchmarkIdxs:["NASDAQ","S&P500"] },
  { ticker:"AAPL",    label:"Apple",   group:"Stocks",     benchmarkIdxs:["NASDAQ","S&P500"] },
  { ticker:"JPM",     label:"JPM",     group:"Stocks",     benchmarkIdxs:["S&P500","NASDAQ","FTSE"] },
  { ticker:"BAC",     label:"BAC",     group:"Stocks",     benchmarkIdxs:["S&P500","NASDAQ","FTSE"] },
  { ticker:"COIN",    label:"COIN",    group:"Stocks",     benchmarkIdxs:["NASDAQ","S&P500"] },
  { ticker:"EIMI.L",  label:"EIMI",    group:"EM",         benchmarkIdxs:["S&P500","NASDAQ","FTSE"] },
  { ticker:"EMIM.L",  label:"EMIM",    group:"EM",         benchmarkIdxs:["S&P500","NASDAQ","FTSE"] },
  { ticker:"EMGU.L",  label:"EMGU",    group:"EM",         benchmarkIdxs:["S&P500","NASDAQ","FTSE"] },
  { ticker:"AEMU.L",  label:"AEMU",    group:"EM",         benchmarkIdxs:["S&P500","NASDAQ","FTSE"] },
  { ticker:"REGB.L",  label:"REGB",    group:"EM",         benchmarkIdxs:["FTSE","S&P500"] },
  { ticker:"JEDG.L",  label:"JEDG",    group:"Thematic",   benchmarkIdxs:["S&P500","NASDAQ","FTSE"] },
  { ticker:"IUVF.L",  label:"IUVF",    group:"Thematic",   benchmarkIdxs:["S&P500","NASDAQ","FTSE"] },
  { ticker:"DXJ.L",   label:"DXJ",     group:"Thematic",   benchmarkIdxs:["FTSE","S&P500"] },
  { ticker:"SUES.L",  label:"SUES",    group:"Thematic",   benchmarkIdxs:["S&P500","NASDAQ","FTSE"] },
];

// ─── WORLD INDICES (used for correlation X-axis AND world heatmap) ────────────
const WORLD_INDICES = [
  { label:"S&P500",  name:"S&P 500",       region:"US"     },
  { label:"NASDAQ",  name:"Nasdaq 100",    region:"US"     },
  { label:"DJIA",    name:"Dow Jones",     region:"US"     },
  { label:"FTSE",    name:"FTSE 100",      region:"UK"     },
  { label:"DAX",     name:"DAX 40",        region:"Europe" },
  { label:"CAC",     name:"CAC 40",        region:"Europe" },
  { label:"STOXX",   name:"Euro Stoxx 50", region:"Europe" },
  { label:"Nikkei",  name:"Nikkei 225",    region:"Japan"  },
  { label:"HSI",     name:"Hang Seng",     region:"HK"     },
  { label:"SSE",     name:"Shanghai",      region:"China"  },
  { label:"ASX",     name:"ASX 200",       region:"AUS"    },
  { label:"Sensex",  name:"Sensex",        region:"India"  },
  { label:"Bovespa", name:"Bovespa",       region:"Brazil" },
  { label:"TSX",     name:"TSX",           region:"Canada" },
];

// Fixed correlation matrix X-axis = all world indices
const FIXED_INDICES = WORLD_INDICES.map(i => i.label);

// ─── CORRELATION DATA ─────────────────────────────────────────────────────────
const KNOWN = {
  "IB1T|BTC/USD":0.99,"IB1T|DAGB":0.36,"IB1T|NVIDIA":0.44,"IB1T|Tesla":0.37,
  "IB1T|LQQS":0.41,"IB1T|S&P500":0.38,"IB1T|NASDAQ":0.42,"IB1T|FTSE":0.18,
  "IB1T|SOIL":-0.31,"IB1T|SBRT":-0.29,"IB1T|WTI":-0.28,"IB1T|BRNT":-0.30,
  "IB1T|ARKK":0.51,"IB1T|IUIT":0.39,"IB1T|SEMI":0.38,"IB1T|RBOT":0.31,
  "IB1T|ISPY":0.35,"IB1T|JEDG":0.28,"IB1T|IUVF":0.26,"IB1T|EIMI":0.21,
  "IB1T|EQQQ":0.39,"IB1T|AEMU":0.19,"IB1T|DXJ":0.14,"IB1T|COIN":0.71,
  "BTC/USD|DAGB":0.35,"BTC/USD|NVIDIA":0.43,"BTC/USD|S&P500":0.37,"BTC/USD|NASDAQ":0.41,"BTC/USD|COIN":0.70,
  "LQQS|NASDAQ":0.88,"LQQS|NVIDIA":-0.82,"LQQS|S&P500":0.76,"LQQS|SOIL":-0.71,
  "LQQS|EQQQ":-0.88,"LQQS|FTSE":0.41,"LQQS|DAX":0.44,"LQQS|Nikkei":0.38,
  "DAGB|NVIDIA":0.55,"DAGB|S&P500":0.44,"DAGB|NASDAQ":0.51,"DAGB|FTSE":0.22,"DAGB|COIN":0.48,
  "IUIT|NASDAQ":0.91,"IUIT|S&P500":0.84,"IUIT|NVIDIA":0.78,"IUIT|FTSE":0.42,"IUIT|DAX":0.48,
  "IUCD|NASDAQ":0.82,"IUCD|S&P500":0.79,"IUCD|FTSE":0.38,
  "SEMI|NVIDIA":0.81,"SEMI|S&P500":0.74,"SEMI|NASDAQ":0.79,"SEMI|FTSE":0.38,"SEMI|Nikkei":0.44,
  "RBOT|NASDAQ":0.72,"RBOT|S&P500":0.68,"RBOT|FTSE":0.34,
  "EQQQ|NASDAQ":0.97,"EQQQ|S&P500":0.88,"EQQQ|NVIDIA":0.79,"EQQQ|FTSE":0.52,"EQQQ|DAX":0.56,
  "ARKK|NASDAQ":0.82,"ARKK|NVIDIA":0.71,"ARKK|S&P500":0.71,"ARKK|FTSE":0.38,"ARKK|COIN":0.58,
  "S&P500|NASDAQ":0.94,"S&P500|FTSE":0.58,"S&P500|DAX":0.62,"S&P500|CAC":0.60,
  "S&P500|STOXX":0.61,"S&P500|Nikkei":0.54,"S&P500|HSI":0.41,"S&P500|SSE":0.29,
  "S&P500|ASX":0.52,"S&P500|Sensex":0.44,"S&P500|Bovespa":0.38,"S&P500|TSX":0.71,"S&P500|DJIA":0.96,
  "NASDAQ|FTSE":0.52,"NASDAQ|DAX":0.58,"NASDAQ|CAC":0.55,"NASDAQ|STOXX":0.57,
  "NASDAQ|Nikkei":0.51,"NASDAQ|HSI":0.38,"NASDAQ|SSE":0.25,"NASDAQ|ASX":0.48,
  "NASDAQ|Sensex":0.41,"NASDAQ|Bovespa":0.34,"NASDAQ|TSX":0.65,"NASDAQ|DJIA":0.88,
  "FTSE|DAX":0.78,"FTSE|CAC":0.77,"FTSE|STOXX":0.76,"FTSE|Nikkei":0.48,
  "FTSE|HSI":0.40,"FTSE|SSE":0.28,"FTSE|ASX":0.49,"FTSE|Sensex":0.41,
  "FTSE|Bovespa":0.35,"FTSE|TSX":0.62,"FTSE|DJIA":0.56,
  "DAX|CAC":0.93,"DAX|STOXX":0.94,"DAX|Nikkei":0.52,"DAX|HSI":0.43,
  "DAX|SSE":0.30,"DAX|ASX":0.51,"DAX|Sensex":0.44,"DAX|Bovespa":0.37,"DAX|TSX":0.63,"DAX|DJIA":0.60,
  "CAC|STOXX":0.96,"CAC|Nikkei":0.51,"CAC|HSI":0.42,"CAC|SSE":0.29,
  "CAC|ASX":0.50,"CAC|Sensex":0.43,"CAC|Bovespa":0.36,"CAC|TSX":0.62,"CAC|DJIA":0.57,
  "STOXX|Nikkei":0.52,"STOXX|HSI":0.43,"STOXX|SSE":0.30,"STOXX|ASX":0.51,
  "STOXX|Sensex":0.44,"STOXX|Bovespa":0.37,"STOXX|TSX":0.63,"STOXX|DJIA":0.58,
  "Nikkei|HSI":0.58,"Nikkei|SSE":0.41,"Nikkei|ASX":0.62,"Nikkei|Sensex":0.51,
  "Nikkei|Bovespa":0.33,"Nikkei|TSX":0.48,"Nikkei|DJIA":0.51,
  "HSI|SSE":0.64,"HSI|ASX":0.55,"HSI|Sensex":0.57,"HSI|Bovespa":0.38,"HSI|TSX":0.44,"HSI|DJIA":0.39,
  "SSE|ASX":0.42,"SSE|Sensex":0.46,"SSE|Bovespa":0.31,"SSE|TSX":0.33,"SSE|DJIA":0.27,
  "ASX|Sensex":0.53,"ASX|Bovespa":0.40,"ASX|TSX":0.58,"ASX|DJIA":0.50,
  "Sensex|Bovespa":0.41,"Sensex|TSX":0.47,"Sensex|DJIA":0.42,
  "Bovespa|TSX":0.44,"Bovespa|DJIA":0.36,"TSX|DJIA":0.68,
  "CSPX|S&P500":0.99,"SPYL|S&P500":0.98,"ISPY|S&P500":0.97,"ISPY|NASDAQ":0.91,
  "EQGB|FTSE":0.96,"ISF|FTSE":0.97,"VUKE|FTSE":0.95,
  "S&P500|NVIDIA":0.78,"S&P500|Tesla":0.71,"S&P500|Apple":0.83,
  "NASDAQ|NVIDIA":0.86,"NASDAQ|Tesla":0.74,"NASDAQ|Apple":0.85,
  "FTSE|NVIDIA":0.41,"FTSE|BAC":0.61,"FTSE|JPM":0.58,
  "SOIL|SBRT":0.98,"SOIL|WTI":0.91,"SBRT|WTI":0.89,"BRNT|WTI":0.96,
  "BRNT|SBRT":0.97,"SOIL|NVIDIA":0.61,"SBRT|NVIDIA":0.59,"REMX|SOIL":0.44,
  "NVIDIA|Tesla":0.67,"NVIDIA|Apple":0.72,"Tesla|Apple":0.61,
  "JPM|S&P500":0.82,"JPM|BAC":0.88,"BAC|S&P500":0.79,
  "JPM|NASDAQ":0.74,"BAC|NASDAQ":0.71,"JPM|FTSE":0.58,"BAC|FTSE":0.55,
  "JPM|NVIDIA":0.51,"BAC|NVIDIA":0.48,
  "COIN|NVIDIA":0.52,"COIN|S&P500":0.44,"COIN|NASDAQ":0.49,"COIN|FTSE":0.21,
  "EIMI|EMIM":0.97,"EIMI|EMGU":0.88,"EMIM|EMGU":0.87,
  "EIMI|S&P500":0.52,"EMIM|S&P500":0.51,"AEMU|EIMI":0.71,
  "JEDG|S&P500":0.61,"JEDG|FTSE":0.48,"JEDG|NASDAQ":0.55,
  "IUVF|S&P500":0.58,"IUVF|NASDAQ":0.61,"IUVF|FTSE":0.39,
  "DXJ|FTSE":0.44,"DXJ|S&P500":0.39,"DXJ|NASDAQ":0.36,
  "AEMU|S&P500":0.48,"AEMU|NASDAQ":0.44,"AEMU|FTSE":0.41,
};

const GRP_DEF={"Bitcoin":0.92,"Tech":0.71,"Commodities":0.65,"Indices":0.82,"Stocks":0.61,"EM":0.72,"Thematic":0.45};
const INTER_GRP=(g1,g2)=>{
  const k=[g1,g2].sort().join("|");
  return {"Bitcoin|Tech":0.38,"Bitcoin|Commodities":-0.28,"Bitcoin|Indices":0.36,"Bitcoin|Stocks":0.38,"Bitcoin|EM":0.21,"Bitcoin|Thematic":0.29,"Tech|Commodities":-0.58,"Tech|Indices":0.79,"Tech|Stocks":0.68,"Tech|EM":0.31,"Tech|Thematic":0.44,"Commodities|Indices":-0.41,"Commodities|Stocks":0.38,"Commodities|EM":0.29,"Commodities|Thematic":0.21,"Indices|Stocks":0.74,"Indices|EM":0.49,"Indices|Thematic":0.52,"Stocks|EM":0.41,"Stocks|Thematic":0.48,"EM|Thematic":0.38}[k]??0.25;
};

function getCorr(a,b,assets){
  if(a===b)return 1.00;
  const v=KNOWN[`${a}|${b}`]??KNOWN[`${b}|${a}`];
  if(v!==undefined)return v;
  const allA=[...BASE_ASSETS,...(assets||[])];
  const ga=allA.find(x=>x.label===a)?.group ?? WORLD_INDICES.find(x=>x.label===a)?.region;
  const gb=allA.find(x=>x.label===b)?.group ?? WORLD_INDICES.find(x=>x.label===b)?.region;
  if(!ga||!gb)return 0.25;
  return ga===gb?GRP_DEF[ga]??0.50:INTER_GRP(ga,gb);
}

// ─── DEMO PRICES ──────────────────────────────────────────────────────────────
const DEMO={
  "IB1T":   {price:5.75,  pct:2.41},  "BTC/USD":{price:107240,pct:2.38},
  "LQQS":   {price:3.21,  pct:-1.82}, "DAGB":   {price:6.43,  pct:1.14},
  "IUIT":   {price:9.12,  pct:0.88},  "IUCD":   {price:8.74,  pct:0.61},
  "IITU":   {price:7.33,  pct:0.95},  "SEMI":   {price:11.20, pct:1.42},
  "RBOT":   {price:5.88,  pct:0.73},  "ARKK":   {price:48.30, pct:1.91},
  "SOIL":   {price:4.88,  pct:-0.94}, "SBRT":   {price:5.12,  pct:-0.87},
  "REMX":   {price:22.10, pct:-0.41}, "BRNT":   {price:82.40, pct:-0.62},
  "WTI":    {price:78.60, pct:-0.58}, "S&P500": {price:5312,  pct:0.52},
  "NASDAQ": {price:18820, pct:0.71},  "FTSE":   {price:8541,  pct:-0.21},
  "CSPX":   {price:542.3, pct:0.50},  "SPYL":   {price:6.21,  pct:0.49},
  "EQQQ":   {price:388.4, pct:0.68},  "EQGB":   {price:14.22, pct:-0.18},
  "ISF":    {price:9.44,  pct:-0.20}, "VUKE":   {price:48.10, pct:-0.22},
  "ISPY":   {price:33.20, pct:0.51},  "NVIDIA": {price:131.4, pct:3.18},
  "Tesla":  {price:248.6, pct:-2.44}, "Apple":  {price:212.1, pct:0.33},
  "JPM":    {price:248.8, pct:0.44},  "BAC":    {price:44.12, pct:0.31},
  "COIN":   {price:228.4, pct:2.91},  "EIMI":   {price:68.40, pct:0.22},
  "EMIM":   {price:40.20, pct:0.19},  "EMGU":   {price:12.30, pct:0.28},
  "AEMU":   {price:9.88,  pct:0.18},  "REGB":   {price:104.2, pct:-0.11},
  "JEDG":   {price:7.44,  pct:0.39},  "IUVF":   {price:18.30, pct:0.51},
  "DXJ":    {price:88.50, pct:-0.14}, "SUES":   {price:6.11,  pct:0.22},
  "DJIA":   {price:42800, pct:0.31},  "DAX":    {price:18920, pct:0.44},
  "CAC":    {price:7880,  pct:0.38},  "STOXX":  {price:5140,  pct:0.41},
  "Nikkei": {price:38420, pct:-0.18}, "HSI":    {price:21840, pct:0.62},
  "SSE":    {price:3380,  pct:0.29},  "ASX":    {price:8210,  pct:0.18},
  "Sensex": {price:81200, pct:0.55},  "Bovespa":{price:127400,pct:-0.44},
  "TSX":    {price:24800, pct:0.22},
};

const GC={"Bitcoin":"#b45309","Tech":"#1d4ed8","Commodities":"#b45309","Indices":"#6d28d9","Stocks":"#166534","EM":"#9d174d","Thematic":"#0f766e"};
const RC={"US":"#1d4ed8","UK":"#6d28d9","Europe":"#0f766e","Japan":"#b45309","HK":"#dc2626","China":"#dc2626","AUS":"#166534","India":"#9d174d","Brazil":"#1d4ed8","Canada":"#6d28d9"};

function heatBg(v){
  if(v===null||v===undefined)return"#f1f5f9";
  const c=Math.max(-1,Math.min(1,v));
  if(c>=0){const t=c;return`rgb(${Math.round(219-t*140)},${Math.round(234-t*90)},${Math.round(254-t*30)})`;}
  const t=-c;return`rgb(${Math.round(254-t*10)},${Math.round(226-t*160)},${Math.round(226-t*180)})`;
}
function heatTxt(v){return Math.abs(v??0)>0.6?"#1e293b":"#334155";}

function fmt(p,d=2){if(p===undefined||p===null)return"—";return p>=1000?p.toLocaleString("en-GB",{maximumFractionDigits:0}):p.toFixed(d);}

function Badge({pct}){
  if(pct===undefined||pct===null)return<span style={{color:"#94a3b8",fontSize:10}}>—</span>;
  const up=pct>=0;
  return<span style={{background:up?"#dcfce7":"#fee2e2",color:up?"#166534":"#dc2626",borderRadius:5,padding:"2px 7px",fontFamily:"monospace",fontSize:10,fontWeight:600,whiteSpace:"nowrap"}}>{up?"▲":"▼"} {Math.abs(pct).toFixed(2)}%</span>;
}

function Shimmer(){return<div style={{background:"linear-gradient(90deg,#e2e8f0 25%,#cbd5e1 50%,#e2e8f0 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite",borderRadius:4,height:12,width:"100%"}}/>;}

// ─── PRICE ROW (own component — hooks cannot live inside .map()) ──────────────
function PriceRow({asset,idx,prices,expected,setExpected,showExp,expLoading,customAssets}){
  const [editOpen,setEditOpen]=useState(false);
  const [editVal,setEditVal]=useState("");
  const indices=asset.benchmarkIdxs||[asset.benchmarkIdx].filter(Boolean)||["S&P500"];
  const [selIdx,setSelIdx]=useState(indices[0]||"S&P500");
  const d=prices?.[asset.label]||{price:0,pct:0};
  const ex=expected[asset.label];
  const col=GC[asset.group]||"#0f172a";
  const bData=prices?.[selIdx]||null;
  const exUp=ex?(ex.pct>=0):true;

  return(
    <div className="trow" style={{background:"#fff",borderRadius:8,border:"1px solid #e2e8f0",padding:"9px 12px",marginBottom:4,display:"grid",gridTemplateColumns:"28px 1fr 80px 80px 130px"+(showExp?" 80px 110px":""),gap:6,alignItems:"center",transition:"background 0.12s"}}>
      <div style={{fontFamily:"monospace",fontSize:9,color:"#cbd5e1",fontWeight:600}}>#{idx+1}</div>
      <div>
        <div style={{fontSize:12,fontWeight:600,color:col}}>{asset.label}</div>
        <div style={{fontSize:9,color:"#94a3b8"}}>{asset.group}{asset.custom?" · custom":""}</div>
      </div>
      <div style={{fontFamily:"monospace",fontSize:11,color:"#0f172a"}}>{fmt(d.price)}</div>
      <div><Badge pct={d.pct}/></div>
      <div style={{display:"flex",flexDirection:"column",gap:2}}>
        {indices.length>1?(
          <select value={selIdx} onChange={e=>setSelIdx(e.target.value)}
            style={{fontSize:9,fontFamily:"monospace",border:"1px solid #e2e8f0",borderRadius:4,padding:"1px 4px",color:"#475569",background:"#f8fafc",outline:"none",marginBottom:2,cursor:"pointer"}}>
            {indices.map(i=><option key={i} value={i}>{i}</option>)}
          </select>
        ):(
          <div style={{fontSize:9,color:"#94a3b8",fontFamily:"monospace"}}>{selIdx}</div>
        )}
        {bData?(
          <div style={{display:"flex",gap:5,alignItems:"center"}}>
            <span style={{fontFamily:"monospace",fontSize:10,color:"#334155"}}>{fmt(bData.price)}</span>
            <Badge pct={bData.pct}/>
          </div>
        ):<span style={{color:"#cbd5e1",fontSize:10}}>—</span>}
      </div>
      {showExp&&(
        <div>
          {expLoading?<Shimmer/>:ex?(
            editOpen?(
              <div style={{display:"flex",gap:3}}>
                <input autoFocus value={editVal} onChange={e=>setEditVal(e.target.value)}
                  onKeyDown={e=>{
                    if(e.key==="Enter"){const v=parseFloat(editVal);if(!isNaN(v))setExpected(p=>({...p,[asset.label]:{...ex,pct:v,overridden:true}}));setEditOpen(false);}
                    if(e.key==="Escape")setEditOpen(false);
                  }}
                  style={{width:48,fontFamily:"monospace",fontSize:10,border:"1px solid #0369a1",borderRadius:4,padding:"2px 5px",outline:"none"}}/>
                <button onClick={()=>{const v=parseFloat(editVal);if(!isNaN(v))setExpected(p=>({...p,[asset.label]:{...ex,pct:v,overridden:true}}));setEditOpen(false);}}
                  style={{background:"#0369a1",color:"#fff",border:"none",borderRadius:4,padding:"2px 6px",fontSize:10,cursor:"pointer"}}>✓</button>
              </div>
            ):(
              <span onClick={()=>{setEditOpen(true);setEditVal(ex.pct.toFixed(2));}} title="Click to override"
                style={{background:exUp?"#dcfce7":"#fee2e2",color:exUp?"#166534":"#dc2626",borderRadius:5,padding:"2px 7px",fontFamily:"monospace",fontSize:10,fontWeight:600,cursor:"pointer",display:"inline-block",border:ex.overridden?"1px solid #7c3aed":"none"}}>
                {exUp?"▲":"▼"} {Math.abs(ex.pct).toFixed(2)}%
              </span>
            )
          ):<span style={{color:"#cbd5e1",fontSize:10}}>—</span>}
        </div>
      )}
      {showExp&&<div style={{fontSize:10,color:"#64748b",fontStyle:"italic",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ex?.note||""}</div>}
    </div>
  );
}

// ─── ADD ASSET FORM ───────────────────────────────────────────────────────────
function AddAssetForm({customAssets,setCustomAssets,matrixAssets,setMatrixAssets,onClose}){
  const [ticker,setTicker]=useState("");
  const [label,setLabel]=useState("");
  const [group,setGroup]=useState("Tech");
  const [benchmark,setBenchmark]=useState("NASDAQ");

  const add=()=>{
    const lbl=label.trim().toUpperCase();
    if(!lbl)return;
    if([...BASE_ASSETS,...customAssets].find(a=>a.label===lbl)){alert("Asset already exists.");return;}
    const a={ticker:ticker.trim()||lbl,label:lbl,group,benchmarkIdxs:[benchmark],custom:true};
    setCustomAssets(prev=>[...prev,a]);
    if(matrixAssets.length<20)setMatrixAssets(prev=>[...prev,lbl]);
    setTicker("");setLabel("");
    if(onClose)onClose();
  };

  return(
    <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:12,marginTop:8}}>
      <div style={{fontFamily:"monospace",fontSize:9,color:"#94a3b8",letterSpacing:"0.1em",marginBottom:8}}>ADD NEW ASSET — appears in all tabs immediately</div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"flex-end"}}>
        <div>
          <div style={{fontSize:10,color:"#64748b",marginBottom:3}}>Yahoo ticker</div>
          <input value={ticker} onChange={e=>setTicker(e.target.value)} placeholder="e.g. XS2D.L"
            style={{width:100,fontSize:11,border:"1px solid #e2e8f0",borderRadius:6,padding:"5px 8px",outline:"none"}}/>
        </div>
        <div>
          <div style={{fontSize:10,color:"#64748b",marginBottom:3}}>Display label</div>
          <input value={label} onChange={e=>setLabel(e.target.value)} placeholder="e.g. XS2D"
            style={{width:80,fontSize:11,border:"1px solid #e2e8f0",borderRadius:6,padding:"5px 8px",outline:"none"}}/>
        </div>
        <div>
          <div style={{fontSize:10,color:"#64748b",marginBottom:3}}>Group</div>
          <select value={group} onChange={e=>setGroup(e.target.value)}
            style={{fontSize:11,border:"1px solid #e2e8f0",borderRadius:6,padding:"5px 8px",outline:"none",color:"#0f172a"}}>
            {Object.keys(GC).map(g=><option key={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <div style={{fontSize:10,color:"#64748b",marginBottom:3}}>Benchmark index</div>
          <select value={benchmark} onChange={e=>setBenchmark(e.target.value)}
            style={{fontSize:11,border:"1px solid #e2e8f0",borderRadius:6,padding:"5px 8px",outline:"none",color:"#0f172a"}}>
            {FIXED_INDICES.map(i=><option key={i}>{i}</option>)}
          </select>
        </div>
        <button onClick={add}
          style={{background:"#0369a1",color:"#fff",border:"none",borderRadius:6,padding:"7px 14px",fontSize:11,fontFamily:"monospace",cursor:"pointer",whiteSpace:"nowrap"}}>
          + ADD
        </button>
      </div>
      <div style={{fontSize:10,color:"#94a3b8",marginTop:6}}>Correlation uses group-average estimates. Prices load from your live backend once connected.</div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const TABS=[
  {id:"prices",  label:"Prices & Expected"},
  {id:"matrix",  label:"Correlation"},
  {id:"pair",    label:"Pair Explorer"},
  {id:"world",   label:"World Indices"},
  {id:"settings",label:"Settings & Live Data"},
];

export default function CDRunway(){
  const [prices,setPrices]           = useState(null);
  const [dataMode,setDataMode]       = useState("demo");
  const [liveUrl,setLiveUrl]         = useState("");
  const [tab,setTab]                 = useState("prices");
  const [customAssets,setCustomAssets]= useState([]);

  // Prices
  const [priceSort,setPriceSort]     = useState({col:"pct",dir:-1});
  const [expected,setExpected]       = useState({});
  const [expLoading,setExpLoading]   = useState(false);
  const [showExp,setShowExp]         = useState(false);

  // Correlation matrix
  const [matrixAssets,setMatrixAssets]= useState(["NVIDIA","BAC","JPM","IB1T","COIN","JEDG","SEMI","RBOT","ISPY","IUVF","REMX","DAGB","ARKK","IUIT","IUCD","EIMI","EQQQ","AEMU","DXJ","BRNT"]);
  const [showPicker,setShowPicker]   = useState(false);
  const [showAddForm,setShowAddForm] = useState(false);

  // Pair explorer
  const [compareAsset,setCompareAsset]= useState("S&P500");
  const [pairSort,setPairSort]       = useState({col:"corr",dir:-1});
  const [rowAnalysis,setRowAnalysis] = useState({});
  const [rowLoading,setRowLoading]   = useState({});
  const [showPairAdd,setShowPairAdd] = useState(false);

  // World
  const [worldTip,setWorldTip]       = useState(null);

  // AI
  const [aiInsight,setAiInsight]     = useState(null);
  const [aiLoading,setAiLoading]     = useState(false);
  const [lastUpdated,setLastUpdated] = useState(null);

  const allAssets=[...BASE_ASSETS,...customAssets];

  useEffect(()=>{loadPrices();},[liveUrl]);

  const loadPrices=useCallback(async()=>{
    if(liveUrl){
      try{
        const r=await fetch(liveUrl);const d=await r.json();
        const p={};Object.entries(d).forEach(([k,v])=>{p[k]={price:v.price??0,pct:v.pct??0};});
        setPrices(p);setDataMode("live");setLastUpdated(new Date());return;
      }catch(e){}
    }
    const p={};
    [...allAssets,...WORLD_INDICES].forEach(a=>{p[a.label]=DEMO[a.label]||{price:0,pct:0};});
    setPrices(p);setDataMode("demo");setLastUpdated(new Date());
  },[liveUrl,customAssets.length]);

  const apiCall=useCallback(async(prompt,max=600)=>{
    const r=await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
      body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:max,messages:[{role:"user",content:prompt}]})
    });
    const d=await r.json();
    return d.content?.map(c=>c.text||"").join("")||"";
  },[]);

  const fetchExpected=useCallback(async()=>{
    setExpLoading(true);setShowExp(true);
    try{
      const text=await apiCall(`Pre-market analyst. Today ${new Date().toDateString()}, UK morning.
Estimate expected % change today for each: ${allAssets.map(a=>a.label).join(", ")}
Respond ONLY raw JSON array no markdown:
[{"label":"IB1T","pct":1.2,"note":"BTC up overnight"},...]
All assets. pct=number. note max 6 words.`,2000);
      const arr=JSON.parse(text.replace(/```json|```/g,"").trim());
      const map={};arr.forEach(x=>{map[x.label]={pct:x.pct,note:x.note,overridden:false};});
      setExpected(map);
    }catch(e){
      const map={};
      allAssets.forEach(a=>{const b=DEMO[a.label]?.pct??0;map[a.label]={pct:parseFloat((b*0.65+(Math.random()-0.5)*0.4).toFixed(2)),note:"Futures estimate",overridden:false};});
      setExpected(map);
    }
    setExpLoading(false);
  },[allAssets.length,apiCall]);

  const analyseRow=useCallback(async(asset)=>{
    const cmp=compareAsset;
    const corr=getCorr(asset,cmp,customAssets);
    const p1=prices?.[asset]||{pct:0};const p2=prices?.[cmp]||{pct:0};
    setRowLoading(prev=>({...prev,[asset]:true}));
    try{
      const text=await apiCall(`Portfolio analyst. Today ${new Date().toDateString()}.
${asset} vs ${cmp}. 30-day correlation: ${corr.toFixed(2)}.
${asset} today: ${p1.pct.toFixed(2)}%. ${cmp} today: ${p2.pct.toFixed(2)}%.
3 concise sentences: (1) what drives this correlation, (2) is it behaving as expected today, (3) key implication or risk. No disclaimer.`,300);
      setRowAnalysis(prev=>({...prev,[asset]:text}));
    }catch(e){
      setRowAnalysis(prev=>({...prev,[asset]:"Add VITE_ANTHROPIC_API_KEY to Vercel environment variables to enable AI analysis."}));
    }
    setRowLoading(prev=>({...prev,[asset]:false}));
  },[compareAsset,prices,customAssets,apiCall]);

  const runAI=useCallback(async()=>{
    setAiLoading(true);setAiInsight(null);setTab("settings");
    try{
      const top=allAssets.slice(0,16).map(a=>`${a.label}:${(DEMO[a.label]?.pct??0)>=0?"+":""}${(DEMO[a.label]?.pct??0).toFixed(2)}%`).join(", ");
      const text=await apiCall(`Senior portfolio analyst. Today ${new Date().toDateString()}.
Portfolio: ${allAssets.map(a=>a.label).join(", ")}.
Key moves: ${top}
Analysis in sections (2-3 sentences each):
1. CORRELATION SHIFTS 2. KEY DIVERGENCES 3. MACRO DRIVERS TODAY 4. HEDGING IMPLICATIONS
Direct. No disclaimers. Max 320 words.`,900);
      setAiInsight(text);
    }catch(e){setAiInsight("Add VITE_ANTHROPIC_API_KEY to Vercel environment variables to enable AI insights.");}
    setAiLoading(false);
  },[allAssets.length,apiCall]);

  const sortedPrices=useCallback(()=>[...allAssets].sort((a,b)=>{
    const va=priceSort.col==="pct"?(prices?.[a.label]?.pct??0):(prices?.[a.label]?.price??0);
    const vb=priceSort.col==="pct"?(prices?.[b.label]?.pct??0):(prices?.[b.label]?.price??0);
    return priceSort.dir*(vb-va);
  }),[prices,priceSort,allAssets.length]);

  const sortedPair=useCallback(()=>[...allAssets].filter(a=>a.label!==compareAsset).sort((a,b)=>{
    if(pairSort.col==="corr")return pairSort.dir*(getCorr(b.label,compareAsset,customAssets)-getCorr(a.label,compareAsset,customAssets));
    return pairSort.dir*((prices?.[b.label]?.pct??0)-(prices?.[a.label]?.pct??0));
  }),[compareAsset,pairSort,prices,allAssets.length,customAssets]);

  const togglePriceSort=col=>setPriceSort(p=>p.col===col?{col,dir:p.dir*-1}:{col,dir:-1});
  const togglePairSort=col=>setPairSort(p=>p.col===col?{col,dir:p.dir*-1}:{col,dir:-1});

  const SHdr=({col,which,children})=>{
    const s=which==="price"?priceSort:pairSort;
    const fn=which==="price"?togglePriceSort:togglePairSort;
    return<button onClick={()=>fn(col)} style={{background:"none",border:"none",cursor:"pointer",fontFamily:"monospace",fontSize:9,letterSpacing:"0.09em",color:s.col===col?"#0369a1":"#94a3b8",padding:0,display:"flex",alignItems:"center",gap:2}}>{children}{s.col===col?(s.dir===-1?"↓":"↑"):"↕"}</button>;
  };

  const fmtAI=text=>text.split(/\n(?=\d\.|[A-Z]{3,}[^a-z])/g).map((s,i)=>{
    const lines=s.trim().split("\n");
    return<div key={i} style={{marginBottom:14}}>
      <div style={{fontFamily:"monospace",fontSize:10,letterSpacing:"0.12em",color:"#0369a1",textTransform:"uppercase",marginBottom:5,borderLeft:"2px solid #0369a1",paddingLeft:8}}>{lines[0]}</div>
      <div style={{fontSize:13,lineHeight:1.8,color:"#1e293b",paddingLeft:10}}>{lines.slice(1).join("\n").trim()}</div>
    </div>;
  });

  const sortedMatrixAssets=[...matrixAssets].sort();

  return(
    <div style={{minHeight:"100vh",background:"#f8fafc",fontFamily:"system-ui,sans-serif",paddingBottom:40}}>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        .trow:hover{background:#f1f5f9!important;}
        .cell:hover{outline:2px solid #0369a1;outline-offset:-1px;z-index:2;position:relative;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:2px;}
      `}</style>

      {/* HEADER */}
      <div style={{background:"#fff",borderBottom:"1px solid #e2e8f0",padding:"16px 20px 0",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8,marginBottom:12}}>
          <div>
            <div style={{fontFamily:"monospace",fontSize:9,letterSpacing:"0.2em",color:"#94a3b8",marginBottom:2}}>CDRUNWAY · PORTFOLIO INTELLIGENCE</div>
            <div style={{fontSize:18,fontWeight:600,color:"#0f172a"}}>Market Dashboard</div>
            <div style={{fontSize:11,color:"#94a3b8",marginTop:2,display:"flex",gap:8,alignItems:"center"}}>
              {lastUpdated&&<span>{lastUpdated.toLocaleTimeString("en-GB")}</span>}
              <span style={{background:dataMode==="live"?"#dcfce7":"#fef9c3",color:dataMode==="live"?"#166534":"#92400e",borderRadius:10,padding:"1px 8px",fontSize:9,fontFamily:"monospace"}}>
                {dataMode==="live"?"● LIVE":"⚠ DEMO"}
              </span>
            </div>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button onClick={fetchExpected} style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:7,padding:"7px 12px",color:"#166534",fontSize:11,fontFamily:"monospace",cursor:"pointer"}}>◎ GET EXPECTED</button>
            <button onClick={runAI} style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:7,padding:"7px 12px",color:"#1e40af",fontSize:11,fontFamily:"monospace",cursor:"pointer"}}>◈ AI INSIGHTS</button>
          </div>
        </div>
        <div style={{display:"flex",overflowX:"auto",gap:0}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{background:"transparent",border:"none",borderBottom:tab===t.id?"2px solid #0369a1":"2px solid transparent",padding:"7px 14px",color:tab===t.id?"#0369a1":"#94a3b8",fontFamily:"monospace",fontSize:9,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:-1,cursor:"pointer",whiteSpace:"nowrap"}}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{padding:"18px 20px"}}>

        {/* ═══ PRICES & EXPECTED ═══ */}
        {tab==="prices"&&(
          <div style={{animation:"fadeIn 0.25s ease"}}>
            <div style={{display:"grid",gridTemplateColumns:"28px 1fr 80px 80px 130px"+(showExp?" 80px 110px":""),gap:6,padding:"5px 12px",marginBottom:4}}>
              <div style={{fontFamily:"monospace",fontSize:9,color:"#94a3b8"}}>#</div>
              <div style={{fontFamily:"monospace",fontSize:9,color:"#94a3b8"}}>ASSET</div>
              <SHdr col="price" which="price">PRICE</SHdr>
              <SHdr col="pct" which="price">CHANGE %</SHdr>
              <div style={{fontFamily:"monospace",fontSize:9,color:"#94a3b8"}}>BENCHMARK (dropdown if multiple)</div>
              {showExp&&<SHdr col="expPct" which="price">EXPECTED %</SHdr>}
              {showExp&&<div style={{fontFamily:"monospace",fontSize:9,color:"#94a3b8"}}>REASONING</div>}
            </div>

            {!prices&&[1,2,3,4,5].map(i=><div key={i} style={{background:"#fff",borderRadius:8,border:"1px solid #e2e8f0",padding:"10px 12px",marginBottom:4}}><Shimmer/></div>)}

            {prices&&sortedPrices().map((asset,idx)=>(
              <PriceRow key={asset.label} asset={asset} idx={idx} prices={prices} expected={expected}
                setExpected={setExpected} showExp={showExp} expLoading={expLoading} customAssets={customAssets}/>
            ))}

            {!showExp&&(
              <div style={{marginTop:10,padding:"9px 12px",background:"#eff6ff",borderRadius:7,border:"1px solid #bfdbfe",fontSize:11,color:"#1e40af"}}>
                Click <b>GET EXPECTED</b> at the top to show AI pre-market estimates alongside actuals.
              </div>
            )}
            {dataMode==="demo"&&(
              <div style={{marginTop:6,padding:"9px 12px",background:"#fef9c3",borderRadius:7,border:"1px solid #fde68a",fontSize:11,color:"#92400e"}}>
                ⚠ Demo data. Go to Settings & Live Data tab to connect real prices.
              </div>
            )}
          </div>
        )}

        {/* ═══ CORRELATION MATRIX ═══ */}
        {tab==="matrix"&&(
          <div style={{animation:"fadeIn 0.25s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8,marginBottom:10}}>
              <div>
                <div style={{fontFamily:"monospace",fontSize:9,color:"#94a3b8",letterSpacing:"0.1em",marginBottom:2}}>30-DAY ROLLING CORRELATION — Y: portfolio assets (A–Z) · X: world indices</div>
                <div style={{fontSize:12,color:"#475569"}}>Click any active asset to remove it. Max 20 on Y axis.</div>
              </div>
              <button onClick={()=>setShowPicker(p=>!p)}
                style={{background:showPicker?"#1e293b":"#f8fafc",color:showPicker?"#fff":"#475569",border:"1px solid #e2e8f0",borderRadius:7,padding:"6px 12px",fontSize:11,fontFamily:"monospace",cursor:"pointer"}}>
                {showPicker?"▲ CLOSE":"⚙ MANAGE"} ({matrixAssets.length}/20)
              </button>
            </div>

            {showPicker&&(
              <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:14,marginBottom:12,animation:"fadeIn 0.2s ease"}}>
                <div style={{fontFamily:"monospace",fontSize:9,color:"#94a3b8",marginBottom:8,letterSpacing:"0.1em"}}>ACTIVE (click to remove)</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>
                  {matrixAssets.map(l=>{
                    const a=allAssets.find(x=>x.label===l);
                    return<button key={l} onClick={()=>setMatrixAssets(prev=>prev.filter(x=>x!==l))}
                      style={{background:(GC[a?.group]||"#0369a1")+"18",border:`1px solid ${GC[a?.group]||"#0369a1"}44`,borderRadius:14,padding:"3px 10px",color:GC[a?.group]||"#0369a1",fontSize:10,fontFamily:"monospace",cursor:"pointer"}}>
                      {l} ✕
                    </button>;
                  })}
                </div>
                <div style={{fontFamily:"monospace",fontSize:9,color:"#94a3b8",marginBottom:6,letterSpacing:"0.1em"}}>ADD FROM LIST</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:10}}>
                  {allAssets.filter(a=>!matrixAssets.includes(a.label)&&!FIXED_INDICES.includes(a.label)).map(a=>(
                    <button key={a.label} onClick={()=>{if(matrixAssets.length>=20){alert("Max 20.");return;}setMatrixAssets(prev=>[...prev,a.label]);}}
                      style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:14,padding:"3px 10px",color:"#475569",fontSize:10,fontFamily:"monospace",cursor:"pointer"}}>
                      + {a.label}
                    </button>
                  ))}
                </div>
                <button onClick={()=>setShowAddForm(p=>!p)} style={{background:"none",border:"none",color:"#0369a1",fontSize:11,cursor:"pointer",fontFamily:"monospace",padding:0}}>
                  {showAddForm?"▲ hide":"+ Add brand new asset (not in list)"}
                </button>
                {showAddForm&&<AddAssetForm customAssets={customAssets} setCustomAssets={setCustomAssets} matrixAssets={matrixAssets} setMatrixAssets={setMatrixAssets} onClose={()=>setShowAddForm(false)}/>}
              </div>
            )}

            {/* Legend */}
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <div style={{width:80,height:6,borderRadius:3,background:"linear-gradient(90deg,#fca5a5,#f8fafc,#bfdbfe)"}}/>
              <span style={{fontFamily:"monospace",fontSize:9,color:"#94a3b8"}}>-1 (negative) → 0 → +1 (positive)</span>
            </div>

            <div style={{overflowX:"auto"}}>
              <table style={{borderCollapse:"separate",borderSpacing:2}}>
                <thead>
                  <tr>
                    <th style={{minWidth:65,textAlign:"right",paddingRight:8,paddingBottom:6}}>
                      <span style={{fontFamily:"monospace",fontSize:8,color:"#94a3b8",letterSpacing:"0.08em"}}>ASSET ↓ / INDEX →</span>
                    </th>
                    {FIXED_INDICES.map(idx=>{
                      const wi=WORLD_INDICES.find(w=>w.label===idx);
                      return<th key={idx} style={{fontFamily:"monospace",fontSize:10,fontWeight:700,color:RC[wi?.region]||"#6d28d9",padding:"0 3px 6px",textAlign:"center",minWidth:48,writingMode:"vertical-rl",transform:"rotate(180deg)",height:64,letterSpacing:"0.04em"}}>{idx}</th>;
                    })}
                  </tr>
                </thead>
                <tbody>
                  {sortedMatrixAssets.map(rowLabel=>{
                    const a=allAssets.find(x=>x.label===rowLabel);
                    return<tr key={rowLabel}>
                      <td style={{fontFamily:"monospace",fontSize:10,fontWeight:600,color:GC[a?.group]||"#0f172a",paddingRight:8,textAlign:"right",whiteSpace:"nowrap",paddingTop:1,paddingBottom:1}}>{rowLabel}</td>
                      {FIXED_INDICES.map(idx=>{
                        const v=getCorr(rowLabel,idx,customAssets);
                        return<td key={idx} className="cell"
                          style={{background:heatBg(v),width:48,height:30,textAlign:"center",verticalAlign:"middle",borderRadius:3}}>
                          <span style={{fontFamily:"monospace",fontSize:10,fontWeight:600,color:heatTxt(v)}}>{v.toFixed(2)}</span>
                        </td>;
                      })}
                    </tr>;
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ PAIR EXPLORER ═══ */}
        {tab==="pair"&&(
          <div style={{animation:"fadeIn 0.25s ease"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,flexWrap:"wrap"}}>
              <div style={{fontFamily:"monospace",fontSize:9,color:"#94a3b8",letterSpacing:"0.1em"}}>COMPARE ALL AGAINST</div>
              <select value={compareAsset} onChange={e=>{setCompareAsset(e.target.value);setRowAnalysis({});}}
                style={{fontSize:12,border:"1px solid #e2e8f0",borderRadius:7,padding:"6px 10px",outline:"none",color:"#0f172a",fontWeight:600,cursor:"pointer"}}>
                {allAssets.map(a=><option key={a.label} value={a.label}>{a.label} — {a.group}</option>)}
              </select>
              {prices&&prices[compareAsset]&&(
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <span style={{fontFamily:"monospace",fontSize:12,color:"#0f172a"}}>{fmt(prices[compareAsset].price)}</span>
                  <Badge pct={prices[compareAsset].pct}/>
                </div>
              )}
              <button onClick={()=>setShowPairAdd(p=>!p)} style={{marginLeft:"auto",background:showPairAdd?"#1e293b":"#f8fafc",color:showPairAdd?"#fff":"#475569",border:"1px solid #e2e8f0",borderRadius:7,padding:"6px 12px",fontSize:11,fontFamily:"monospace",cursor:"pointer"}}>
                {showPairAdd?"▲ CLOSE":"+ ADD ASSET"}
              </button>
            </div>

            {showPairAdd&&(
              <AddAssetForm customAssets={customAssets} setCustomAssets={setCustomAssets} matrixAssets={matrixAssets} setMatrixAssets={setMatrixAssets} onClose={()=>setShowPairAdd(false)}/>
            )}

            <div style={{display:"grid",gridTemplateColumns:"28px 1fr 80px 80px 70px 100px 80px",gap:6,padding:"5px 12px",marginBottom:4,marginTop:showPairAdd?10:0}}>
              {["#","ASSET","PRICE"].map(h=><div key={h} style={{fontFamily:"monospace",fontSize:9,color:"#94a3b8"}}>{h}</div>)}
              <SHdr col="pct" which="pair">CHANGE%</SHdr>
              <SHdr col="corr" which="pair">CORR</SHdr>
              <div style={{fontFamily:"monospace",fontSize:9,color:"#94a3b8"}}>STRENGTH</div>
              <div style={{fontFamily:"monospace",fontSize:9,color:"#94a3b8"}}>AI</div>
            </div>

            {sortedPair().map((asset,idx)=>{
              const d=prices?.[asset.label]||{price:0,pct:0};
              const corr=getCorr(asset.label,compareAsset,customAssets);
              const absC=Math.abs(corr);
              const strength=absC>0.7?"Strong":absC>0.4?"Moderate":"Weak";
              const col=GC[asset.group]||"#0f172a";
              const analysis=rowAnalysis[asset.label];
              const loading=rowLoading[asset.label];
              return(
                <div key={asset.label}>
                  <div className="trow" style={{background:"#fff",borderRadius:analysis||loading?"8px 8px 0 0":"8px",border:"1px solid #e2e8f0",borderBottom:analysis||loading?"none":"1px solid #e2e8f0",padding:"9px 12px",marginBottom:analysis||loading?0:4,display:"grid",gridTemplateColumns:"28px 1fr 80px 80px 70px 100px 80px",gap:6,alignItems:"center",transition:"background 0.12s"}}>
                    <div style={{fontFamily:"monospace",fontSize:9,color:"#cbd5e1",fontWeight:600}}>#{idx+1}</div>
                    <div>
                      <div style={{fontSize:12,fontWeight:600,color:col}}>{asset.label}</div>
                      <div style={{fontSize:9,color:"#94a3b8"}}>{asset.group}</div>
                    </div>
                    <div style={{fontFamily:"monospace",fontSize:11,color:"#0f172a"}}>{fmt(d.price)}</div>
                    <Badge pct={d.pct}/>
                    <div style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color:corr>=0?"#0369a1":"#dc2626"}}>{corr.toFixed(2)}</div>
                    <span style={{background:absC>0.7?"#dbeafe":absC>0.4?"#dcfce7":"#f1f5f9",color:absC>0.7?"#1e40af":absC>0.4?"#166534":"#475569",borderRadius:5,padding:"2px 7px",fontSize:10,fontFamily:"monospace",width:"fit-content"}}>
                      {strength} {corr>=0?"↑":"↓"}
                    </span>
                    <button onClick={()=>analyseRow(asset.label)} disabled={loading}
                      style={{background:loading?"#f8fafc":"#eff6ff",border:"1px solid #bfdbfe",borderRadius:6,padding:"4px 8px",color:"#1e40af",fontFamily:"monospace",fontSize:9,cursor:loading?"not-allowed":"pointer",whiteSpace:"nowrap"}}>
                      {loading?<span style={{animation:"pulse 1s infinite"}}>...</span>:"◈ Analyse"}
                    </button>
                  </div>
                  {(analysis||loading)&&(
                    <div style={{background:"#f0f9ff",border:"1px solid #e2e8f0",borderTop:"none",borderRadius:"0 0 8px 8px",padding:"10px 14px",marginBottom:4}}>
                      {loading?(<><Shimmer/><div style={{marginTop:6,width:"70%"}}><Shimmer/></div></>):(
                        <div style={{display:"flex",justifyContent:"space-between",gap:8}}>
                          <div style={{fontSize:12,lineHeight:1.8,color:"#1e293b",flex:1}}>{analysis}</div>
                          <button onClick={()=>setRowAnalysis(p=>{const n={...p};delete n[asset.label];return n;})}
                            style={{background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:14,padding:0,flexShrink:0}}>✕</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ WORLD INDICES ═══ */}
        {tab==="world"&&(
          <div style={{animation:"fadeIn 0.25s ease"}}>
            <div style={{fontFamily:"monospace",fontSize:9,color:"#94a3b8",letterSpacing:"0.1em",marginBottom:10}}>WORLD INDICES CORRELATION HEATMAP — 30-DAY ROLLING</div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,flexWrap:"wrap"}}>
              <div style={{width:80,height:6,borderRadius:3,background:"linear-gradient(90deg,#fca5a5,#f8fafc,#bfdbfe)"}}/>
              <span style={{fontFamily:"monospace",fontSize:9,color:"#94a3b8"}}>-1 → 0 → +1</span>
              {[...new Set(WORLD_INDICES.map(i=>i.region))].map(r=>(
                <div key={r} style={{display:"flex",alignItems:"center",gap:4}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:RC[r]||"#94a3b8"}}/>
                  <span style={{fontSize:10,color:"#64748b"}}>{r}</span>
                </div>
              ))}
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{borderCollapse:"separate",borderSpacing:2}}>
                <thead>
                  <tr>
                    <th style={{minWidth:90}}/>
                    {WORLD_INDICES.map(idx=>(
                      <th key={idx.label} style={{fontFamily:"monospace",fontSize:9,color:RC[idx.region]||"#94a3b8",padding:"0 2px 5px",textAlign:"center",minWidth:48,writingMode:"vertical-rl",transform:"rotate(180deg)",height:64}}>{idx.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {WORLD_INDICES.map(row=>(
                    <tr key={row.label}>
                      <td style={{paddingRight:8,textAlign:"right",whiteSpace:"nowrap",paddingBottom:1,paddingTop:1}}>
                        <div style={{fontFamily:"monospace",fontSize:10,fontWeight:700,color:RC[row.region]||"#0f172a"}}>{row.label}</div>
                        <div style={{fontSize:9,color:"#94a3b8"}}>{row.name}</div>
                      </td>
                      {WORLD_INDICES.map(col=>{
                        const v=getCorr(row.label,col.label,customAssets);
                        const isDiag=row.label===col.label;
                        return<td key={col.label} className="cell"
                          onMouseEnter={()=>setWorldTip({row:row.label,col:col.label,v})}
                          onMouseLeave={()=>setWorldTip(null)}
                          style={{background:isDiag?"#f1f5f9":heatBg(v),width:48,height:32,textAlign:"center",verticalAlign:"middle",borderRadius:3,border:isDiag?"1px solid #e2e8f0":"none"}}>
                          <span style={{fontFamily:"monospace",fontSize:9,fontWeight:600,color:isDiag?"#94a3b8":heatTxt(v)}}>{isDiag?"—":v.toFixed(2)}</span>
                        </td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {worldTip&&worldTip.row!==worldTip.col&&(
              <div style={{marginTop:10,background:"#fff",border:"1px solid #e2e8f0",borderRadius:7,padding:"9px 14px",display:"inline-flex",alignItems:"center",gap:10,boxShadow:"0 2px 6px rgba(0,0,0,0.05)"}}>
                <span style={{fontFamily:"monospace",fontSize:11}}>{worldTip.row} ↔ {worldTip.col}</span>
                <span style={{fontFamily:"monospace",fontSize:13,fontWeight:700,color:worldTip.v>=0?"#0369a1":"#dc2626"}}>{worldTip.v.toFixed(3)}</span>
                <span style={{fontSize:11,color:"#94a3b8"}}>{Math.abs(worldTip.v)>0.7?"Strong":Math.abs(worldTip.v)>0.4?"Moderate":"Weak"} {worldTip.v>=0?"positive":"negative"}</span>
              </div>
            )}
          </div>
        )}

        {/* ═══ SETTINGS & LIVE DATA ═══ */}
        {tab==="settings"&&(
          <div style={{animation:"fadeIn 0.25s ease"}}>

            {/* AI Insight result */}
            {(aiLoading||aiInsight)&&(
              <div style={{background:"#fff",borderRadius:10,padding:18,border:"1px solid #e2e8f0",marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,paddingBottom:10,borderBottom:"1px solid #e2e8f0"}}>
                  <span style={{color:"#0369a1"}}>◈</span>
                  <span style={{fontFamily:"monospace",fontSize:9,color:"#94a3b8",letterSpacing:"0.12em"}}>AI INSIGHTS · {new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}</span>
                </div>
                {aiLoading?(<><div style={{marginBottom:8}}><Shimmer/></div><div style={{marginBottom:8}}><Shimmer/></div><div style={{width:"60%"}}><Shimmer/></div></>):fmtAI(aiInsight)}
              </div>
            )}

            {/* Live data setup */}
            <div style={{background:"#fff",borderRadius:10,border:"1px solid #e2e8f0",padding:20}}>
              <div style={{fontFamily:"monospace",fontSize:10,color:"#0369a1",marginBottom:16,letterSpacing:"0.1em"}}>⚙ LIVE PRICE CONNECTION</div>
              <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6,flexWrap:"wrap"}}>
                <input value={liveUrl} onChange={e=>setLiveUrl(e.target.value)} placeholder="https://your-backend.onrender.com/prices"
                  style={{flex:1,minWidth:240,fontSize:11,border:"1px solid #e2e8f0",borderRadius:6,padding:"7px 10px",outline:"none",color:"#0f172a"}}/>
                <button onClick={loadPrices} style={{background:"#0369a1",color:"#fff",border:"none",borderRadius:6,padding:"7px 14px",fontSize:11,cursor:"pointer"}}>↻ Connect</button>
              </div>
              <div style={{fontSize:11,color:"#94a3b8",marginBottom:20}}>Leave blank to use demo data. Once your Render backend is running, paste its URL here.</div>

              <div style={{fontFamily:"monospace",fontSize:10,color:"#0369a1",marginBottom:12,letterSpacing:"0.1em"}}>FREE STEP-BY-STEP SETUP</div>
              <div style={{fontSize:13,lineHeight:2,color:"#1e293b"}}>
                <p style={{margin:"0 0 10px"}}><b>What this does:</b> Creates a tiny Python program on a free server that fetches prices from Yahoo Finance every time your app requests them. 15-minute delayed data, completely free.</p>
                <div style={{background:"#f8fafc",borderRadius:8,padding:14,marginBottom:12,border:"1px solid #e2e8f0"}}>
                  <div style={{fontFamily:"monospace",fontSize:10,color:"#0369a1",marginBottom:8,letterSpacing:"0.08em"}}>STEP 1 — Create two files in VS Code</div>
                  <p style={{margin:"0 0 6px",fontSize:12}}>In your <code style={{background:"#e2e8f0",padding:"1px 5px",borderRadius:3,fontSize:11}}>correlation-tool</code> folder, create a new folder called <code style={{background:"#e2e8f0",padding:"1px 5px",borderRadius:3,fontSize:11}}>backend</code>. Inside it, create these two files:</p>
                  <div style={{fontFamily:"monospace",fontSize:10,color:"#475569",marginBottom:4}}>backend/requirements.txt</div>
                  <pre style={{background:"#1e293b",color:"#e2e8f0",borderRadius:6,padding:10,fontSize:11,margin:"0 0 10px",overflowX:"auto"}}>fastapi{"\n"}uvicorn{"\n"}yfinance</pre>
                  <div style={{fontFamily:"monospace",fontSize:10,color:"#475569",marginBottom:4}}>backend/main.py</div>
                  <pre style={{background:"#1e293b",color:"#e2e8f0",borderRadius:6,padding:10,fontSize:10,margin:0,overflowX:"auto",lineHeight:1.6}}>{`from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf

app = FastAPI()
app.add_middleware(CORSMiddleware,
  allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

TICKERS = {
  "IB1T":"IB1T.L","BTC/USD":"BTC-USD","LQQS":"LQQS.L",
  "DAGB":"DAGB.L","IUIT":"IUIT.L","IUCD":"IUCD.L",
  "IITU":"IITU.L","SEMI":"SEMI.L","RBOT":"RBOT.L",
  "ARKK":"ARKK","SOIL":"SOIL.L","SBRT":"SBRT.L",
  "REMX":"REMX.L","BRNT":"BRNT.L","WTI":"CL=F",
  "S&P500":"^GSPC","NASDAQ":"^IXIC","FTSE":"^FTSE",
  "CSPX":"CSPX.L","SPYL":"SPYL.L","EQQQ":"EQQQ.L",
  "EQGB":"EQGB.L","ISF":"ISF.L","VUKE":"VUKE.L",
  "ISPY":"ISPY.L","NVIDIA":"NVDA","Tesla":"TSLA",
  "Apple":"AAPL","JPM":"JPM","BAC":"BAC","COIN":"COIN",
  "EIMI":"EIMI.L","EMIM":"EMIM.L","EMGU":"EMGU.L",
  "AEMU":"AEMU.L","REGB":"REGB.L","JEDG":"JEDG.L",
  "IUVF":"IUVF.L","DXJ":"DXJ.L","SUES":"SUES.L",
  "DJIA":"^DJI","DAX":"^GDAXI","CAC":"^FCHI",
  "STOXX":"^STOXX50E","Nikkei":"^N225","HSI":"^HSI",
  "SSE":"000001.SS","ASX":"^AXJO","Sensex":"^BSESN",
  "Bovespa":"^BVSP","TSX":"^GSPTSE"
}

@app.get("/prices")
def get_prices():
  result = {}
  for label, ticker in TICKERS.items():
    try:
      t = yf.Ticker(ticker)
      h = t.history(period="2d")
      if len(h) >= 2:
        prev = h["Close"].iloc[-2]
        curr = h["Close"].iloc[-1]
        pct = round((curr-prev)/prev*100, 2)
        result[label] = {"price": round(float(curr),2), "pct": pct}
    except:
      result[label] = {"price": 0, "pct": 0}
  return result`}</pre>
                </div>

                <div style={{background:"#f8fafc",borderRadius:8,padding:14,marginBottom:12,border:"1px solid #e2e8f0"}}>
                  <div style={{fontFamily:"monospace",fontSize:10,color:"#0369a1",marginBottom:8,letterSpacing:"0.08em"}}>STEP 2 — Push to GitHub</div>
                  <pre style={{background:"#1e293b",color:"#e2e8f0",borderRadius:6,padding:10,fontSize:11,margin:0}}>git add .{"\n"}git commit -m "added backend"{"\n"}git push</pre>
                </div>

                <div style={{background:"#f8fafc",borderRadius:8,padding:14,marginBottom:12,border:"1px solid #e2e8f0"}}>
                  <div style={{fontFamily:"monospace",fontSize:10,color:"#0369a1",marginBottom:8,letterSpacing:"0.08em"}}>STEP 3 — Deploy free on Render.com</div>
                  <ol style={{margin:0,paddingLeft:18,fontSize:12,lineHeight:2.2}}>
                    <li>Go to <b>render.com</b>, sign up with your GitHub account</li>
                    <li>Click <b>New +</b> then <b>Web Service</b></li>
                    <li>Select your <b>correlation-tool</b> repository</li>
                    <li>Set <b>Root Directory</b> to <code style={{background:"#e2e8f0",padding:"1px 5px",borderRadius:3,fontSize:11}}>backend</code></li>
                    <li>Set <b>Runtime</b> to <b>Python</b></li>
                    <li>Set <b>Start Command</b> to: <code style={{background:"#e2e8f0",padding:"1px 5px",borderRadius:3,fontSize:11}}>uvicorn main:app --host 0.0.0.0 --port 10000</code></li>
                    <li>Click <b>Create Web Service</b> — wait 2 minutes</li>
                    <li>Copy the URL Render gives you (e.g. <code style={{background:"#e2e8f0",padding:"1px 5px",borderRadius:3,fontSize:11}}>https://correlation-tool.onrender.com</code>)</li>
                  </ol>
                </div>

                <div style={{background:"#f8fafc",borderRadius:8,padding:14,border:"1px solid #e2e8f0"}}>
                  <div style={{fontFamily:"monospace",fontSize:10,color:"#0369a1",marginBottom:8,letterSpacing:"0.08em"}}>STEP 4 — Connect to your app</div>
                  <p style={{margin:0,fontSize:12}}>Paste the Render URL followed by <code style={{background:"#e2e8f0",padding:"1px 5px",borderRadius:3,fontSize:11}}>/prices</code> into the Live Price Connection box above and click Connect. Done.</p>
                </div>

                <div style={{marginTop:12,padding:"10px 14px",background:"#fef9c3",borderRadius:7,border:"1px solid #fde68a",fontSize:12,color:"#92400e"}}>
                  ⚠ Render free tier sleeps after 15 min of inactivity. First load after a gap takes ~30 seconds to wake up. This is normal and free.
                </div>

                <div style={{marginTop:10,padding:"10px 14px",background:"#eff6ff",borderRadius:7,border:"1px solid #bfdbfe",fontSize:12,color:"#1e40af"}}>
                  <b>For AI features</b> (Analyse button, Get Expected, AI Insights): go to your Vercel project → Settings → Environment Variables → add <code style={{background:"#dbeafe",padding:"1px 5px",borderRadius:3,fontSize:11}}>VITE_ANTHROPIC_API_KEY</code> with your key from console.anthropic.com. Then redeploy.
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
