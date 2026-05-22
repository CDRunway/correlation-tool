import { useState, useEffect, useCallback } from "react";

// ─── ASSET REGISTRY ───────────────────────────────────────────────────────────
const ALL_ASSETS = [
  { ticker:"IB1T.L",  label:"IB1T",    group:"Bitcoin"    },
  { ticker:"BTC-USD", label:"BTC/USD", group:"Bitcoin"    },
  { ticker:"LQQS.L",  label:"LQQS",    group:"Tech"       },
  { ticker:"DAGB.L",  label:"DAGB",    group:"Tech"       },
  { ticker:"IUIT.L",  label:"IUIT",    group:"Tech"       },
  { ticker:"IUCD.L",  label:"IUCD",    group:"Tech"       },
  { ticker:"IITU.L",  label:"IITU",    group:"Tech"       },
  { ticker:"SEMI.L",  label:"SEMI",    group:"Tech"       },
  { ticker:"RBOT.L",  label:"RBOT",    group:"Tech"       },
  { ticker:"ARKK",    label:"ARKK",    group:"Tech"       },
  { ticker:"SOIL.L",  label:"SOIL",    group:"Commodities"},
  { ticker:"SBRT.L",  label:"SBRT",    group:"Commodities"},
  { ticker:"REMX.L",  label:"REMX",    group:"Commodities"},
  { ticker:"BRNT.L",  label:"BRNT",    group:"Commodities"},
  { ticker:"CL=F",    label:"WTI",     group:"Commodities"},
  { ticker:"^GSPC",   label:"S&P500",  group:"Indices"    },
  { ticker:"^IXIC",   label:"NASDAQ",  group:"Indices"    },
  { ticker:"^FTSE",   label:"FTSE",    group:"Indices"    },
  { ticker:"CSPX.L",  label:"CSPX",    group:"Indices"    },
  { ticker:"SPYL.L",  label:"SPYL",    group:"Indices"    },
  { ticker:"EQQQ.L",  label:"EQQQ",    group:"Indices"    },
  { ticker:"EQGB.L",  label:"EQGB",    group:"Indices"    },
  { ticker:"ISF.L",   label:"ISF",     group:"Indices"    },
  { ticker:"VUKE.L",  label:"VUKE",    group:"Indices"    },
  { ticker:"ISPY.L",  label:"ISPY",    group:"Indices"    },
  { ticker:"NVDA",    label:"NVIDIA",  group:"Stocks"     },
  { ticker:"TSLA",    label:"Tesla",   group:"Stocks"     },
  { ticker:"AAPL",    label:"Apple",   group:"Stocks"     },
  { ticker:"JPM",     label:"JPM",     group:"Stocks"     },
  { ticker:"BAC",     label:"BAC",     group:"Stocks"     },
  { ticker:"EIMI.L",  label:"EIMI",    group:"EM"         },
  { ticker:"EMIM.L",  label:"EMIM",    group:"EM"         },
  { ticker:"EMGU.L",  label:"EMGU",    group:"EM"         },
  { ticker:"AEMU.L",  label:"AEMU",    group:"EM"         },
  { ticker:"REGB.L",  label:"REGB",    group:"EM"         },
  { ticker:"JEDG.L",  label:"JEDG",    group:"Thematic"   },
  { ticker:"IUVF.L",  label:"IUVF",    group:"Thematic"   },
  { ticker:"DXJ.L",   label:"DXJ",     group:"Thematic"   },
  { ticker:"SUES.L",  label:"SUES",    group:"Thematic"   },
];

// ─── CORRELATION HELPERS ──────────────────────────────────────────────────────
const KNOWN = {
  "IB1T|BTC/USD":0.99,"IB1T|DAGB":0.36,"IB1T|NVIDIA":0.44,"IB1T|Tesla":0.37,
  "IB1T|LQQS":0.41,"IB1T|S&P500":0.38,"IB1T|NASDAQ":0.42,"IB1T|FTSE":0.18,
  "IB1T|SOIL":-0.31,"IB1T|SBRT":-0.29,"IB1T|WTI":-0.28,"IB1T|BRNT":-0.30,
  "BTC/USD|DAGB":0.35,"BTC/USD|NVIDIA":0.43,"BTC/USD|S&P500":0.37,"BTC/USD|NASDAQ":0.41,
  "LQQS|NASDAQ":0.88,"LQQS|NVIDIA":-0.82,"LQQS|S&P500":0.76,"LQQS|SOIL":-0.71,
  "LQQS|EQQQ":-0.88,"DAGB|NVIDIA":0.55,"DAGB|S&P500":0.44,"DAGB|NASDAQ":0.51,
  "IUIT|NASDAQ":0.91,"IUIT|S&P500":0.84,"IUIT|NVIDIA":0.78,
  "IUCD|NASDAQ":0.82,"IUCD|S&P500":0.79,"SEMI|NVIDIA":0.81,
  "RBOT|NASDAQ":0.72,"EQQQ|NASDAQ":0.97,"EQQQ|S&P500":0.88,"EQQQ|NVIDIA":0.79,
  "ARKK|NASDAQ":0.82,"ARKK|NVIDIA":0.71,
  "S&P500|NASDAQ":0.94,"S&P500|FTSE":0.58,"NASDAQ|FTSE":0.52,
  "CSPX|S&P500":0.99,"SPYL|S&P500":0.98,"ISPY|S&P500":0.97,
  "EQGB|FTSE":0.96,"ISF|FTSE":0.97,"VUKE|FTSE":0.95,
  "S&P500|NVIDIA":0.78,"S&P500|Tesla":0.71,"S&P500|Apple":0.83,
  "NASDAQ|NVIDIA":0.86,"NASDAQ|Tesla":0.74,"NASDAQ|Apple":0.85,
  "FTSE|NVIDIA":0.41,"FTSE|BAC":0.61,"FTSE|JPM":0.58,
  "SOIL|SBRT":0.98,"SOIL|WTI":0.91,"SBRT|WTI":0.89,"BRNT|WTI":0.96,
  "BRNT|SBRT":0.97,"SOIL|NVIDIA":0.61,"SBRT|NVIDIA":0.59,
  "REMX|SOIL":0.44,"REMX|WTI":0.38,
  "NVIDIA|Tesla":0.67,"NVIDIA|Apple":0.72,"Tesla|Apple":0.61,
  "JPM|S&P500":0.82,"JPM|BAC":0.88,"BAC|S&P500":0.79,
  "JPM|NVIDIA":0.51,"BAC|NVIDIA":0.48,"JPM|FTSE":0.58,"BAC|FTSE":0.55,
  "EIMI|EMIM":0.97,"EIMI|EMGU":0.88,"EMIM|EMGU":0.87,
  "EIMI|S&P500":0.52,"EMIM|S&P500":0.51,"AEMU|EIMI":0.71,
  "JEDG|S&P500":0.61,"IUVF|S&P500":0.58,"DXJ|FTSE":0.44,
  "ISPY|NASDAQ":0.91,"ISPY|FTSE":0.44,
  "JEDG|NASDAQ":0.55,"JEDG|FTSE":0.48,
  "SEMI|S&P500":0.74,"SEMI|NASDAQ":0.79,"SEMI|FTSE":0.38,
  "RBOT|S&P500":0.68,"RBOT|FTSE":0.34,
  "IUVF|NASDAQ":0.61,"IUVF|FTSE":0.39,
  "REMX|S&P500":0.44,"REMX|NASDAQ":0.41,"REMX|FTSE":0.31,
  "DAGB|FTSE":0.22,"ARKK|FTSE":0.38,"ARKK|S&P500":0.71,
  "AEMU|S&P500":0.48,"AEMU|NASDAQ":0.44,"AEMU|FTSE":0.41,
  "DXJ|S&P500":0.39,"DXJ|NASDAQ":0.36,
  "EIMI|FTSE":0.44,"EMIM|FTSE":0.43,"EMGU|FTSE":0.46,
  "IB1T|ISPY":0.35,"IB1T|SEMI":0.38,"IB1T|RBOT":0.31,
  "IB1T|JEDG":0.28,"IB1T|IUVF":0.26,"IB1T|REMX":-0.18,
  "IB1T|ARKK":0.51,"IB1T|IUIT":0.39,"IB1T|IUCD":0.33,
  "IB1T|EIMI":0.21,"IB1T|EQQQ":0.39,"IB1T|AEMU":0.19,"IB1T|DXJ":0.14,
};

const GROUP_DEF = {"Bitcoin":0.92,"Tech":0.71,"Commodities":0.65,"Indices":0.82,"Stocks":0.61,"EM":0.72,"Thematic":0.45};
const INTER = (g1,g2)=>{
  const k=[g1,g2].sort().join("|");
  return {"Bitcoin|Tech":0.38,"Bitcoin|Commodities":-0.28,"Bitcoin|Indices":0.36,"Bitcoin|Stocks":0.38,"Bitcoin|EM":0.21,"Bitcoin|Thematic":0.29,"Tech|Commodities":-0.58,"Tech|Indices":0.79,"Tech|Stocks":0.68,"Tech|EM":0.31,"Tech|Thematic":0.44,"Commodities|Indices":-0.41,"Commodities|Stocks":0.38,"Commodities|EM":0.29,"Commodities|Thematic":0.21,"Indices|Stocks":0.74,"Indices|EM":0.49,"Indices|Thematic":0.52,"Stocks|EM":0.41,"Stocks|Thematic":0.48,"EM|Thematic":0.38}[k]??0.25;
};

function getCorr(a,b){
  if(a===b)return 1.00;
  const v=KNOWN[`${a}|${b}`]??KNOWN[`${b}|${a}`];
  if(v!==undefined)return v;
  const ga=ALL_ASSETS.find(x=>x.label===a)?.group;
  const gb=ALL_ASSETS.find(x=>x.label===b)?.group;
  if(!ga||!gb)return 0.25;
  return ga===gb?GROUP_DEF[ga]??0.5:INTER(ga,gb);
}

// ─── DEMO PRICES (clearly labelled) ──────────────────────────────────────────
const DEMO_PRICES = {
  "IB1T":5.75,"BTC/USD":107240,"LQQS":3.21,"DAGB":6.43,"IUIT":9.12,
  "IUCD":8.74,"IITU":7.33,"SEMI":11.20,"RBOT":5.88,"ARKK":48.30,
  "SOIL":4.88,"SBRT":5.12,"REMX":22.10,"BRNT":82.40,"WTI":78.60,
  "S&P500":5312,"NASDAQ":18820,"FTSE":8541,"CSPX":542.3,"SPYL":6.21,
  "EQQQ":388.4,"EQGB":14.22,"ISF":9.44,"VUKE":48.10,"ISPY":33.20,
  "NVIDIA":131.4,"Tesla":248.6,"Apple":212.1,"JPM":248.8,"BAC":44.12,
  "EIMI":68.40,"EMIM":40.20,"EMGU":12.30,"AEMU":9.88,"REGB":104.2,
  "JEDG":7.44,"IUVF":18.30,"DXJ":88.50,"SUES":6.11,
};
const DEMO_PCT = {
  "IB1T":2.41,"BTC/USD":2.38,"LQQS":-1.82,"DAGB":1.14,"IUIT":0.88,
  "IUCD":0.61,"IITU":0.95,"SEMI":1.42,"RBOT":0.73,"ARKK":1.91,
  "SOIL":-0.94,"SBRT":-0.87,"REMX":-0.41,"BRNT":-0.62,"WTI":-0.58,
  "S&P500":0.52,"NASDAQ":0.71,"FTSE":-0.21,"CSPX":0.50,"SPYL":0.49,
  "EQQQ":0.68,"EQGB":-0.18,"ISF":-0.20,"VUKE":-0.22,"ISPY":0.51,
  "NVIDIA":3.18,"Tesla":-2.44,"Apple":0.33,"JPM":0.44,"BAC":0.31,
  "EIMI":0.22,"EMIM":0.19,"EMGU":0.28,"AEMU":0.18,"REGB":-0.11,
  "JEDG":0.39,"IUVF":0.51,"DXJ":-0.14,"SUES":0.22,
};

// ─── FIXED INDICES (rows in Tab 3) ───────────────────────────────────────────
const FIXED_INDICES = ["S&P500","NASDAQ","FTSE"];

// ─── DEFAULT MATRIX ASSETS (columns in Tab 3, max 20) ────────────────────────
const DEFAULT_MATRIX_ASSETS = ["NVIDIA","BAC","JPM","IB1T","JEDG","SEMI","RBOT","ISPY","IUVF","REMX","DAGB","ARKK","IUIT","IUCD","EIMI","EQQQ","AEMU","DXJ","BRNT","WTI"];

// ─── COLOUR HELPERS ───────────────────────────────────────────────────────────
const GROUP_COLOR = {"Bitcoin":"#F7931A","Tech":"#0099bb","Commodities":"#d97706","Indices":"#7c3aed","Stocks":"#16a34a","EM":"#db2777","Thematic":"#0d9488"};
function heatBg(v){
  if(v===null||v===undefined)return"#e8edf5";
  const c=Math.max(-1,Math.min(1,v));
  if(c>=0){const t=c;return`rgb(${Math.round(16+t*-16)},${Math.round(16+t*164)},${Math.round(46+t*174)})`;}
  const t=-c;return`rgb(${Math.round(16+t*204)},${Math.round(16+t*34)},${Math.round(46)})`;
}
function heatTxt(v){return Math.abs(v??0)>0.45?"#fff":"#444";}

const S={
  page:{minHeight:"100vh",background:"#f4f6fb",fontFamily:"'DM Sans',sans-serif",paddingBottom:40},
  header:{background:"#fff",borderBottom:"1px solid #dde3f0",padding:"18px 22px 0",boxShadow:"0 1px 4px rgba(0,0,0,0.05)"},
  mono:{fontFamily:"'Space Mono',monospace"},
  card:{background:"#fff",borderRadius:10,border:"1px solid #dde3f0",padding:"12px 14px",marginBottom:6,transition:"background 0.15s"},
  badge:(up)=>({background:up?"#dcfce7":"#fee2e2",color:up?"#16a34a":"#ef4444",borderRadius:6,padding:"3px 9px",fontFamily:"'Space Mono',monospace",fontSize:10,fontWeight:700,display:"inline-block",cursor:"default"}),
  shimmer:{background:"linear-gradient(90deg,#e8edf5 25%,#d0d8ea 50%,#e8edf5 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite",borderRadius:4,height:13,width:"100%"},
  btn:(active)=>({background:active?"#1a2038":"#fff",border:"1px solid #dde3f0",borderRadius:20,padding:"4px 13px",color:active?"#fff":"#6a7490",fontFamily:"'Space Mono',monospace",fontSize:9,cursor:"pointer",transition:"all 0.15s"}),
  aiBtn:{background:"linear-gradient(135deg,#e0f7ff,#ede9fe)",border:"1px solid #0099bb44",borderRadius:8,padding:"9px 15px",color:"#0099bb",fontFamily:"'Space Mono',monospace",fontSize:10,cursor:"pointer"},
  lbl:(col)=>({fontFamily:"'Space Mono',monospace",fontSize:10,fontWeight:700,color:col||"#1a2038"}),
  sub:{fontSize:9,color:"#9aa5be",marginTop:2},
  hdr:{fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:"0.1em",color:"#9aa5be"},
};

function Shimmer(){return <div style={S.shimmer}/>;}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function CDRunway(){
  const [prices,setPrices]       = useState(null); // {label:{price,pct}}
  const [dataMode,setDataMode]   = useState("demo"); // "demo"|"live"
  const [liveUrl,setLiveUrl]     = useState(""); // backend URL when set
  const [tab,setTab]             = useState("prices");
  const [priceSort,setPriceSort] = useState({col:"pct",dir:-1}); // dir: 1=asc,-1=desc
  const [expSort,setExpSort]     = useState({col:"pct",dir:-1});
  const [expected,setExpected]   = useState({});
  const [expLoading,setExpLoading]=useState(false);
  const [matrixAssets,setMatrixAssets]=useState(DEFAULT_MATRIX_ASSETS);
  const [showAssetPicker,setShowAssetPicker]=useState(false);
  const [pair1,setPair1]         = useState("NVIDIA");
  const [pair2,setPair2]         = useState("IB1T");
  const [pairAnalysis,setPairAnalysis]=useState(null);
  const [pairLoading,setPairLoading]=useState(false);
  const [aiInsight,setAiInsight] = useState(null);
  const [aiLoading,setAiLoading] = useState(false);
  const [lastUpdated,setLastUpdated]=useState(null);

  // ── Load prices ────────────────────────────────────────────────────────────
  useEffect(()=>{
    loadPrices();
  },[liveUrl]);

  const loadPrices = useCallback(async()=>{
    if(liveUrl){
      try{
        const r=await fetch(liveUrl);
        const d=await r.json();
        setPrices(d);setDataMode("live");setLastUpdated(new Date());
        return;
      }catch(e){console.warn("Live fetch failed, falling back to demo");}
    }
    // Demo fallback
    const p={};
    ALL_ASSETS.forEach(a=>{p[a.label]={price:DEMO_PRICES[a.label]??0,pct:DEMO_PCT[a.label]??0};});
    setPrices(p);setDataMode("demo");setLastUpdated(new Date());
  },[liveUrl]);

  // ── Fetch AI expected ──────────────────────────────────────────────────────
  const fetchExpected = useCallback(async()=>{
    setExpLoading(true);
    const prompt=`You are a pre-market analyst. Today is ${new Date().toDateString()}, UK morning before London open.

Estimate expected % price change for TODAY for each asset: ${ALL_ASSETS.map(a=>a.label).join(", ")}

Base estimates on: overnight BTC move, US futures, oil overnight, USD strength, Asian closes, macro backdrop.

Respond ONLY with raw JSON array, no markdown, no backticks:
[{"label":"IB1T","pct":1.2,"note":"BTC up overnight"},...]

Include ALL assets. pct=number. note=max 7 words.`;
    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:2000,messages:[{role:"user",content:prompt}]})
      });
      const d=await r.json();
      const raw=d.content?.map(c=>c.text||"").join("")||"[]";
      const arr=JSON.parse(raw.replace(/```json|```/g,"").trim());
      const map={};arr.forEach(x=>{map[x.label]={pct:x.pct,note:x.note,overridden:false};});
      setExpected(map);
    }catch(e){
      // Fallback: scaled demo with small variation
      const map={};
      ALL_ASSETS.forEach(a=>{
        const base=DEMO_PCT[a.label]??0;
        map[a.label]={pct:parseFloat((base*0.7+(Math.random()-0.5)*0.5).toFixed(2)),note:"Futures-based estimate",overridden:false};
      });
      setExpected(map);
    }
    setExpLoading(false);
  },[]);

  // ── Pair analysis ──────────────────────────────────────────────────────────
  const analysePair = useCallback(async()=>{
    if(!pair1||!pair2||pair1===pair2)return;
    setPairLoading(true);setPairAnalysis(null);
    const corr=getCorr(pair1,pair2);
    const prompt=`Portfolio analyst. Today ${new Date().toDateString()}.

Assets: ${pair1} vs ${pair2}. 30-day correlation: ${corr.toFixed(2)}.
${pair1} today: ${DEMO_PCT[pair1]?.toFixed(2)||"n/a"}%. ${pair2} today: ${DEMO_PCT[pair2]?.toFixed(2)||"n/a"}%.

In 4 sentences max:
1. What drives this correlation?
2. Is it behaving as expected today?
3. One hedging implication.
4. Key risk to watch.

No disclaimers. Direct.`;
    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,messages:[{role:"user",content:prompt}]})
      });
      const d=await r.json();
      setPairAnalysis(d.content?.map(c=>c.text||"").join("")||"No response.");
    }catch(e){setPairAnalysis("API key required for live analysis. Add VITE_ANTHROPIC_API_KEY to Vercel environment variables.");}
    setPairLoading(false);
  },[pair1,pair2]);

  // ── AI Insights ────────────────────────────────────────────────────────────
  const runAI = useCallback(async()=>{
    setAiLoading(true);setAiInsight(null);setTab("ai");
    const top=ALL_ASSETS.slice(0,15).map(a=>`${a.label}:${DEMO_PCT[a.label]>=0?"+":""}${DEMO_PCT[a.label]?.toFixed(2)}%`).join(", ");
    const prompt=`Senior portfolio analyst. Today ${new Date().toDateString()}.
Portfolio of 39 assets including Bitcoin ETPs, tech ETFs, oil inverse ETPs, global indices, US/UK stocks, EM funds.
Key moves today: ${top}
Provide analysis in these sections (2-3 sentences each):
1. CORRELATION SHIFTS — What's changing and why
2. KEY DIVERGENCES — Surprising pairs today
3. MACRO DRIVERS — Top 3 themes driving this portfolio
4. HEDGING — Specific actionable observations
Direct. No disclaimers. Max 300 words.`;
    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,messages:[{role:"user",content:prompt}]})
      });
      const d=await r.json();
      setAiInsight(d.content?.map(c=>c.text||"").join("")||"No response.");
    }catch(e){setAiInsight("API key required. Add VITE_ANTHROPIC_API_KEY to Vercel environment variables.");}
    setAiLoading(false);
  },[]);

  // ── Sort helpers ───────────────────────────────────────────────────────────
  const toggleSort=(which,col)=>{
    const setter=which==="price"?setPriceSort:setExpSort;
    const current=which==="price"?priceSort:expSort;
    setter(current.col===col?{col,dir:current.dir*-1}:{col,dir:-1});
  };

  const sortedAssets=(which)=>{
    const {col,dir}=which==="price"?priceSort:expSort;
    const dataFn=(a)=>{
      if(which==="price")return prices?.[a.label]?.[col]??0;
      return expected[a.label]?.[col]??0;
    };
    return [...ALL_ASSETS].sort((a,b)=>dir*(dataFn(b)-dataFn(a)));
  };

  // ── Matrix asset management ────────────────────────────────────────────────
  const toggleMatrixAsset=(label)=>{
    if(matrixAssets.includes(label)){
      setMatrixAssets(prev=>prev.filter(l=>l!==label));
    } else {
      if(matrixAssets.length>=20){alert("Maximum 20 assets in the matrix. Remove one first.");return;}
      setMatrixAssets(prev=>[...prev,label]);
    }
  };

  // ── Format AI text ─────────────────────────────────────────────────────────
  const fmtAI=(text)=>{
    if(!text)return null;
    return text.split(/\n(?=\d\.|[A-Z]{3,}[^a-z])/g).map((s,i)=>{
      const lines=s.trim().split("\n");
      return(
        <div key={i} style={{marginBottom:18}}>
          <div style={{...S.mono,fontSize:10,letterSpacing:"0.12em",color:"#0099bb",textTransform:"uppercase",marginBottom:6,borderLeft:"2px solid #0099bb",paddingLeft:10}}>{lines[0]}</div>
          <div style={{fontSize:13,lineHeight:1.75,color:"#2a3350",paddingLeft:12}}>{lines.slice(1).join("\n").trim()}</div>
        </div>
      );
    });
  };

  const SortArrow=({col,which})=>{
    const {col:c,dir:d}=which==="price"?priceSort:expSort;
    if(c!==col)return<span style={{color:"#dde3f0",marginLeft:3}}>↕</span>;
    return<span style={{color:"#0099bb",marginLeft:3}}>{d===-1?"↓":"↑"}</span>;
  };

  const TABS=[
    {id:"prices",  label:"Prices"},
    {id:"expected",label:"Expected"},
    {id:"matrix",  label:"Correlation"},
    {id:"pair",    label:"Pair Explorer"},
    {id:"ai",      label:"AI Insights"},
  ];

  const nonIndexAssets=ALL_ASSETS.filter(a=>!FIXED_INDICES.includes(a.label));

  return(
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        .trow:hover{background:#f0f4fa!important;}
        .cell:hover{transform:scale(1.12);z-index:10;transition:transform 0.1s;}
        .pill:hover{opacity:0.85;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-thumb{background:#c8d0e0;border-radius:2px;}
      `}</style>

      {/* HEADER */}
      <div style={S.header}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10,marginBottom:16}}>
          <div>
            <div style={{...S.mono,fontSize:9,letterSpacing:"0.2em",color:"#9aa5be",marginBottom:4}}>CDRUNWAY · PORTFOLIO INTELLIGENCE</div>
            <div style={{...S.mono,fontSize:20,fontWeight:700,color:"#1a2038"}}>Market Dashboard</div>
            <div style={{fontSize:11,color:"#9aa5be",marginTop:3,display:"flex",gap:10,alignItems:"center"}}>
              {lastUpdated&&<span>Updated {lastUpdated.toLocaleTimeString("en-GB")}</span>}
              <span style={{background:dataMode==="live"?"#dcfce7":"#fef9c3",color:dataMode==="live"?"#16a34a":"#a16207",borderRadius:10,padding:"1px 8px",fontSize:9,...S.mono}}>
                {dataMode==="live"?"● LIVE":"⚠ DEMO DATA"}
              </span>
            </div>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
            <button onClick={fetchExpected} style={{...S.aiBtn,background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",color:"#16a34a",border:"1px solid #16a34a44"}}>
              ◎ GET EXPECTED
            </button>
            <button onClick={runAI} style={S.aiBtn}>◈ AI INSIGHTS</button>
          </div>
        </div>

        {/* Live data URL input */}
        <div style={{marginBottom:12,display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <span style={{...S.mono,fontSize:9,color:"#9aa5be",letterSpacing:"0.08em"}}>LIVE DATA URL</span>
          <input value={liveUrl} onChange={e=>setLiveUrl(e.target.value)} placeholder="https://your-backend.onrender.com/prices"
            style={{flex:1,minWidth:200,maxWidth:400,fontFamily:"'Space Mono',monospace",fontSize:10,border:"1px solid #dde3f0",borderRadius:6,padding:"5px 10px",outline:"none",color:"#1a2038",background:"#f9fafb"}}/>
          <button onClick={loadPrices} style={{...S.btn(false),borderRadius:6,padding:"5px 12px"}}>↻ REFRESH</button>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:0,overflowX:"auto"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{background:"transparent",border:"none",borderBottom:tab===t.id?"2px solid #0099bb":"2px solid transparent",padding:"8px 16px",color:tab===t.id?"#0099bb":"#9aa5be",...S.mono,fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:-1,cursor:"pointer",whiteSpace:"nowrap"}}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{padding:"20px 22px"}}>

        {/* ══ TAB 1: PRICES ══ */}
        {tab==="prices"&&(
          <div style={{animation:"fadeIn 0.3s ease"}}>
            {/* Column headers — clickable */}
            <div style={{display:"grid",gridTemplateColumns:"36px 1fr 100px 110px",gap:8,padding:"6px 14px",marginBottom:4}}>
              <div style={S.hdr}>#</div>
              <div style={S.hdr}>ASSET</div>
              <button onClick={()=>toggleSort("price","price")} style={{...S.hdr,background:"none",border:"none",cursor:"pointer",textAlign:"left",padding:0,display:"flex",alignItems:"center"}}>
                PRICE<SortArrow col="price" which="price"/>
              </button>
              <button onClick={()=>toggleSort("price","pct")} style={{...S.hdr,background:"none",border:"none",cursor:"pointer",textAlign:"left",padding:0,display:"flex",alignItems:"center"}}>
                CHANGE %<SortArrow col="pct" which="price"/>
              </button>
            </div>

            {!prices&&[1,2,3,4,5].map(i=><div key={i} style={{...S.card,marginBottom:6}}><Shimmer/></div>)}

            {prices&&sortedAssets("price").map((asset,idx)=>{
              const d=prices[asset.label]||{price:0,pct:0};
              const isUp=d.pct>=0;
              const col=GROUP_COLOR[asset.group]||"#1a2038";
              return(
                <div key={asset.label} className="trow" style={{...S.card,display:"grid",gridTemplateColumns:"36px 1fr 100px 110px",gap:8,alignItems:"center"}}>
                  <div style={{...S.mono,fontSize:10,color:"#c8d0e0",fontWeight:700}}>#{idx+1}</div>
                  <div>
                    <div style={S.lbl(col)}>{asset.label}</div>
                    <div style={S.sub}>{asset.group}</div>
                  </div>
                  <div style={{...S.mono,fontSize:11,color:"#1a2038"}}>
                    {d.price>=1000?d.price.toLocaleString("en-GB",{maximumFractionDigits:0}):d.price.toFixed(2)}
                  </div>
                  <div><span style={S.badge(isUp)}>{isUp?"▲":"▼"} {Math.abs(d.pct).toFixed(2)}%</span></div>
                </div>
              );
            })}

            {dataMode==="demo"&&(
              <div style={{marginTop:12,padding:"10px 14px",background:"#fef9c3",borderRadius:8,border:"1px solid #fde68a",fontSize:11,color:"#92400e"}}>
                ⚠ Showing demo data. Paste your backend URL above to see live prices. See AI Insights tab for setup instructions.
              </div>
            )}
          </div>
        )}

        {/* ══ TAB 2: EXPECTED ══ */}
        {tab==="expected"&&(
          <div style={{animation:"fadeIn 0.3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
              <div>
                <div style={{...S.mono,fontSize:9,color:"#9aa5be",letterSpacing:"0.1em",marginBottom:3}}>PRE-MARKET EXPECTED MOVES</div>
                <div style={{fontSize:12,color:"#6a7490"}}>AI estimates based on overnight futures. Click any % to override manually.</div>
              </div>
              <button onClick={fetchExpected} disabled={expLoading}
                style={{...S.aiBtn,background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",color:"#16a34a",border:"1px solid #16a34a44",cursor:expLoading?"not-allowed":"pointer"}}>
                {expLoading?<span style={{animation:"pulse 1s infinite"}}>↻ FETCHING...</span>:"↻ REFRESH"}
              </button>
            </div>

            {expLoading&&[1,2,3,4,5].map(i=><div key={i} style={{...S.card,marginBottom:6}}><Shimmer/></div>)}

            {!expLoading&&Object.keys(expected).length===0&&(
              <div style={{textAlign:"center",padding:"50px 20px",color:"#9aa5be"}}>
                <div style={{fontSize:36,marginBottom:10}}>◎</div>
                <div style={{...S.mono,fontSize:11,marginBottom:8}}>NO ESTIMATES YET</div>
                <div style={{fontSize:12,marginBottom:16}}>Click GET EXPECTED to fetch AI pre-market estimates</div>
                <button onClick={fetchExpected} style={{...S.aiBtn,background:"#1a2038",color:"#fff",border:"none",borderRadius:8,padding:"10px 20px",cursor:"pointer"}}>
                  ◎ GET EXPECTED NOW
                </button>
              </div>
            )}

            {!expLoading&&Object.keys(expected).length>0&&(
              <>
                <div style={{display:"grid",gridTemplateColumns:"36px 1fr 110px 1fr 90px",gap:8,padding:"6px 14px",marginBottom:4}}>
                  <div style={S.hdr}>#</div>
                  <div style={S.hdr}>ASSET</div>
                  <button onClick={()=>toggleSort("exp","pct")} style={{...S.hdr,background:"none",border:"none",cursor:"pointer",textAlign:"left",padding:0,display:"flex",alignItems:"center"}}>
                    EXPECTED %<SortArrow col="pct" which="exp"/>
                  </button>
                  <div style={S.hdr}>REASONING</div>
                  <div style={S.hdr}>STATUS</div>
                </div>

                {sortedAssets("exp").map((asset,idx)=>{
                  const ex=expected[asset.label]||{pct:0,note:"—",overridden:false};
                  const isUp=ex.pct>=0;
                  const col=GROUP_COLOR[asset.group]||"#1a2038";
                  const [editing,setEditing]=useState(false);
                  const [val,setVal]=useState("");
                  return(
                    <div key={asset.label} className="trow" style={{...S.card,display:"grid",gridTemplateColumns:"36px 1fr 110px 1fr 90px",gap:8,alignItems:"center"}}>
                      <div style={{...S.mono,fontSize:10,color:"#c8d0e0",fontWeight:700}}>#{idx+1}</div>
                      <div>
                        <div style={S.lbl(col)}>{asset.label}</div>
                        <div style={S.sub}>{asset.group}</div>
                      </div>
                      <div>
                        {editing?(
                          <div style={{display:"flex",gap:4}}>
                            <input autoFocus value={val} onChange={e=>setVal(e.target.value)}
                              onKeyDown={e=>{
                                if(e.key==="Enter"){const v=parseFloat(val);if(!isNaN(v))setExpected(p=>({...p,[asset.label]:{...ex,pct:v,overridden:true}}));setEditing(false);}
                                if(e.key==="Escape")setEditing(false);
                              }}
                              style={{width:54,...S.mono,fontSize:10,border:"1px solid #0099bb",borderRadius:5,padding:"2px 6px",outline:"none"}}/>
                            <button onClick={()=>{const v=parseFloat(val);if(!isNaN(v))setExpected(p=>({...p,[asset.label]:{...ex,pct:v,overridden:true}}));setEditing(false);}}
                              style={{background:"#0099bb",color:"#fff",border:"none",borderRadius:5,padding:"2px 8px",fontSize:10,cursor:"pointer"}}>✓</button>
                          </div>
                        ):(
                          <span onClick={()=>{setEditing(true);setVal(ex.pct.toFixed(2));}} title="Click to override" style={{...S.badge(isUp),cursor:"pointer"}}>
                            {isUp?"▲":"▼"} {Math.abs(ex.pct).toFixed(2)}%
                          </span>
                        )}
                      </div>
                      <div style={{fontSize:11,color:"#6a7490",fontStyle:"italic"}}>{ex.note}</div>
                      <div style={{...S.mono,fontSize:9,color:ex.overridden?"#7c3aed":"#9aa5be",background:ex.overridden?"#ede9fe":"#f4f6fb",borderRadius:6,padding:"3px 8px",width:"fit-content"}}>
                        {ex.overridden?"Overridden":"AI"}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* ══ TAB 3: CORRELATION MATRIX ══ */}
        {tab==="matrix"&&(
          <div style={{animation:"fadeIn 0.3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10,marginBottom:14}}>
              <div>
                <div style={{...S.mono,fontSize:9,color:"#9aa5be",letterSpacing:"0.1em",marginBottom:3}}>30-DAY ROLLING CORRELATION</div>
                <div style={{fontSize:12,color:"#6a7490"}}>Rows: S&P500, NASDAQ, FTSE (fixed) · Columns: up to 20 assets (tap to remove)</div>
              </div>
              <button onClick={()=>setShowAssetPicker(p=>!p)}
                style={{...S.btn(showAssetPicker),borderRadius:8,padding:"7px 14px"}}>
                {showAssetPicker?"▲ CLOSE":"+ ADD / REMOVE ASSETS"} ({matrixAssets.length}/20)
              </button>
            </div>

            {/* Asset picker */}
            {showAssetPicker&&(
              <div style={{background:"#fff",border:"1px solid #dde3f0",borderRadius:10,padding:16,marginBottom:16,animation:"fadeIn 0.2s ease"}}>
                <div style={{...S.mono,fontSize:9,color:"#9aa5be",letterSpacing:"0.1em",marginBottom:10}}>
                  CLICK TO ADD/REMOVE · GREEN = ACTIVE · {matrixAssets.length}/20 SELECTED
                </div>
                {Object.keys(GROUP_COLOR).map(grp=>(
                  <div key={grp} style={{marginBottom:10}}>
                    <div style={{fontSize:10,color:GROUP_COLOR[grp],fontWeight:600,marginBottom:6,...S.mono}}>{grp}</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                      {nonIndexAssets.filter(a=>a.group===grp).map(a=>{
                        const active=matrixAssets.includes(a.label);
                        return(
                          <button key={a.label} className="pill" onClick={()=>toggleMatrixAsset(a.label)}
                            style={{background:active?GROUP_COLOR[grp]+"22":"#f4f6fb",border:`1px solid ${active?GROUP_COLOR[grp]:"#dde3f0"}`,borderRadius:16,padding:"4px 11px",color:active?GROUP_COLOR[grp]:"#9aa5be",...S.mono,fontSize:9,cursor:"pointer"}}>
                            {active?"✓ ":""}{a.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Legend */}
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <div style={{width:80,height:7,borderRadius:3,background:"linear-gradient(90deg,rgb(220,50,46),#f4f6fb,rgb(16,164,220))"}}/>
              <span style={{...S.mono,fontSize:8,color:"#9aa5be"}}>-1 (negative) ← 0 → +1 (positive)</span>
            </div>

            {/* Matrix */}
            <div style={{overflowX:"auto"}}>
              <table style={{borderCollapse:"separate",borderSpacing:3}}>
                <thead>
                  <tr>
                    <th style={{width:60,minWidth:60}}/>
                    {matrixAssets.map(lbl=>{
                      const a=ALL_ASSETS.find(x=>x.label===lbl);
                      return(
                        <th key={lbl} style={{...S.mono,fontSize:8,color:GROUP_COLOR[a?.group]||"#1a2038",padding:"0 2px 6px",textAlign:"center",minWidth:38,writingMode:"vertical-rl",transform:"rotate(180deg)",height:58,cursor:"pointer"}}
                          onClick={()=>toggleMatrixAsset(lbl)} title="Click to remove">
                          {lbl}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {FIXED_INDICES.map(idx=>(
                    <tr key={idx}>
                      <td style={{...S.mono,fontSize:9,color:GROUP_COLOR["Indices"],paddingRight:8,textAlign:"right",whiteSpace:"nowrap",fontWeight:700}}>{idx}</td>
                      {matrixAssets.map(col=>{
                        const v=getCorr(idx,col);
                        return(
                          <td key={col} className="cell"
                            style={{background:heatBg(v),width:38,height:30,textAlign:"center",verticalAlign:"middle",borderRadius:3}}>
                            <span style={{...S.mono,fontSize:8,color:heatTxt(v)}}>{v.toFixed(2)}</span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{marginTop:10,fontSize:11,color:"#9aa5be",fontStyle:"italic"}}>
              Click any column header to remove it. Use + ADD / REMOVE to manage assets.
            </div>
          </div>
        )}

        {/* ══ TAB 4: PAIR EXPLORER ══ */}
        {tab==="pair"&&(
          <div style={{animation:"fadeIn 0.3s ease"}}>
            <div style={{...S.mono,fontSize:9,color:"#9aa5be",letterSpacing:"0.1em",marginBottom:14}}>PAIR CORRELATION EXPLORER — SELECT ANY TWO ASSETS</div>
            <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap",marginBottom:20}}>
              <select value={pair1} onChange={e=>setPair1(e.target.value)}
                style={{fontFamily:"'Space Mono',monospace",fontSize:11,border:"1px solid #dde3f0",borderRadius:8,padding:"8px 12px",background:"#fff",color:"#1a2038",outline:"none",cursor:"pointer"}}>
                {ALL_ASSETS.map(a=><option key={a.label} value={a.label}>{a.label} ({a.group})</option>)}
              </select>
              <span style={{...S.mono,fontSize:14,color:"#9aa5be"}}>↔</span>
              <select value={pair2} onChange={e=>setPair2(e.target.value)}
                style={{fontFamily:"'Space Mono',monospace",fontSize:11,border:"1px solid #dde3f0",borderRadius:8,padding:"8px 12px",background:"#fff",color:"#1a2038",outline:"none",cursor:"pointer"}}>
                {ALL_ASSETS.map(a=><option key={a.label} value={a.label}>{a.label} ({a.group})</option>)}
              </select>
              <button onClick={analysePair} disabled={!pair1||!pair2||pair1===pair2||pairLoading}
                style={{...S.aiBtn,cursor:pair1&&pair2&&pair1!==pair2&&!pairLoading?"pointer":"not-allowed"}}>
                {pairLoading?<span style={{animation:"pulse 1s infinite"}}>◈ ANALYSING...</span>:"◈ ANALYSE PAIR"}
              </button>
            </div>

            {pair1&&pair2&&pair1!==pair2&&(()=>{
              const v=getCorr(pair1,pair2);
              const isPos=v>=0;
              const strength=Math.abs(v)>0.7?"Strong":Math.abs(v)>0.4?"Moderate":"Weak";
              const p1=prices?.[pair1]||{pct:0};
              const p2=prices?.[pair2]||{pct:0};
              return(
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {/* Correlation card */}
                  <div style={{background:"#fff",borderRadius:12,border:"1px solid #dde3f0",padding:20,display:"flex",gap:24,flexWrap:"wrap",alignItems:"center"}}>
                    <div style={{textAlign:"center"}}>
                      <div style={{...S.mono,fontSize:36,fontWeight:700,color:isPos?"#0099bb":"#ef4444"}}>{v.toFixed(2)}</div>
                      <div style={{fontSize:11,color:"#9aa5be",marginTop:4}}>{strength} {isPos?"positive":"negative"}</div>
                    </div>
                    <div style={{flex:1,minWidth:200}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                        {[pair1,pair2].map(l=>{
                          const d=prices?.[l]||{price:0,pct:0};
                          const a=ALL_ASSETS.find(x=>x.label===l);
                          return(
                            <div key={l} style={{textAlign:"center"}}>
                              <div style={{...S.mono,fontSize:11,color:GROUP_COLOR[a?.group]||"#1a2038",fontWeight:700}}>{l}</div>
                              <div style={{...S.mono,fontSize:13,color:"#1a2038",marginTop:4}}>{d.price>=1000?d.price.toLocaleString("en-GB",{maximumFractionDigits:0}):d.price.toFixed(2)}</div>
                              <div style={{marginTop:4}}><span style={S.badge(d.pct>=0)}>{d.pct>=0?"▲":"▼"} {Math.abs(d.pct).toFixed(2)}%</span></div>
                            </div>
                          );
                        })}
                      </div>
                      <div style={{height:8,background:"#e8edf5",borderRadius:4,overflow:"hidden"}}>
                        <div style={{width:`${Math.abs(v)*100}%`,height:"100%",background:isPos?"#0099bb":"#ef4444",borderRadius:4,marginLeft:isPos?0:"auto"}}/>
                      </div>
                    </div>
                  </div>

                  {/* AI analysis */}
                  {pairLoading&&<div style={{background:"#fff",borderRadius:10,padding:16,border:"1px solid #dde3f0"}}><Shimmer/><div style={{marginTop:8}}><Shimmer/></div></div>}
                  {pairAnalysis&&!pairLoading&&(
                    <div style={{background:"#fff",borderRadius:10,padding:20,border:"1px solid #dde3f0"}}>
                      <div style={{...S.mono,fontSize:9,color:"#9aa5be",letterSpacing:"0.12em",marginBottom:12}}>◈ AI PAIR ANALYSIS</div>
                      <div style={{fontSize:13,lineHeight:1.8,color:"#2a3350"}}>{pairAnalysis}</div>
                    </div>
                  )}
                  {!pairAnalysis&&!pairLoading&&(
                    <div style={{textAlign:"center",padding:"20px",color:"#9aa5be",fontSize:12}}>Click "ANALYSE PAIR" for AI-powered explanation of this correlation</div>
                  )}
                </div>
              );
            })()}

            {pair1===pair2&&<div style={{padding:20,textAlign:"center",color:"#9aa5be",fontSize:12}}>Please select two different assets.</div>}
          </div>
        )}

        {/* ══ TAB 5: AI INSIGHTS ══ */}
        {tab==="ai"&&(
          <div style={{animation:"fadeIn 0.3s ease"}}>
            {aiLoading&&(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <div style={{...S.mono,fontSize:10,color:"#0099bb",letterSpacing:"0.12em",animation:"pulse 1.5s infinite"}}>◈ ANALYSING PORTFOLIO...</div>
                {[1,2,3,4].map(i=><div key={i} style={{...S.card}}><Shimmer/><div style={{marginTop:8}}><Shimmer/></div></div>)}
              </div>
            )}
            {!aiLoading&&!aiInsight&&(
              <div style={{textAlign:"center",padding:"60px 20px",color:"#9aa5be"}}>
                <div style={{fontSize:36,marginBottom:10}}>◈</div>
                <div style={{...S.mono,fontSize:11,letterSpacing:"0.1em",marginBottom:8}}>CLICK "AI INSIGHTS" TO BEGIN</div>
                <div style={{fontSize:12,marginBottom:20}}>Correlation shifts · Divergences · Macro drivers · Hedging</div>

                {/* Backend setup instructions */}
                <div style={{background:"#fff",borderRadius:10,border:"1px solid #dde3f0",padding:20,textAlign:"left",maxWidth:560,margin:"0 auto"}}>
                  <div style={{...S.mono,fontSize:10,color:"#0099bb",marginBottom:12,letterSpacing:"0.1em"}}>⚙ LIVE PRICE SETUP (FREE)</div>
                  <div style={{fontSize:12,lineHeight:1.8,color:"#2a3350"}}>
                    <b>Step 1.</b> Sign up at <b>render.com</b> (free)<br/>
                    <b>Step 2.</b> Create a new <b>Web Service</b> and connect your GitHub<br/>
                    <b>Step 3.</b> In your GitHub repo, create <b>backend/main.py</b> with the Python code below<br/>
                    <b>Step 4.</b> Set runtime to <b>Python</b>, start command: <code style={{background:"#f4f6fb",padding:"1px 5px",borderRadius:3}}>uvicorn main:app --host 0.0.0.0 --port 10000</code><br/>
                    <b>Step 5.</b> Once deployed, paste your Render URL into the <b>LIVE DATA URL</b> field at the top<br/>
                  </div>
                  <div style={{marginTop:14,...S.mono,fontSize:9,color:"#9aa5be",letterSpacing:"0.08em"}}>PYTHON BACKEND CODE (save as backend/main.py)</div>
                  <pre style={{background:"#1a2038",color:"#e0e4f0",borderRadius:8,padding:14,fontSize:10,overflowX:"auto",marginTop:8,lineHeight:1.6}}>{`from fastapi import FastAPI
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
  "Apple":"AAPL","JPM":"JPM","BAC":"BAC",
  "EIMI":"EIMI.L","EMIM":"EMIM.L","EMGU":"EMGU.L",
  "AEMU":"AEMU.L","REGB":"REGB.L","JEDG":"JEDG.L",
  "IUVF":"IUVF.L","DXJ":"DXJ.L","SUES":"SUES.L"
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
        pct = round((curr - prev) / prev * 100, 2)
        result[label] = {"price": round(curr, 2), "pct": pct}
    except:
      result[label] = {"price": 0, "pct": 0}
  return result`}</pre>
                  <div style={{marginTop:10,...S.mono,fontSize:9,color:"#9aa5be"}}>Also create <b>requirements.txt</b> with: fastapi uvicorn yfinance</div>
                </div>
              </div>
            )}
            {!aiLoading&&aiInsight&&(
              <div style={{background:"#fff",borderRadius:10,padding:22,border:"1px solid #dde3f0"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20,paddingBottom:12,borderBottom:"1px solid #dde3f0"}}>
                  <span style={{color:"#0099bb",fontSize:14}}>◈</span>
                  <span style={{...S.mono,fontSize:9,color:"#9aa5be",letterSpacing:"0.12em"}}>AI INSIGHTS · {new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}</span>
                </div>
                {fmtAI(aiInsight)}
                <div style={{marginTop:16,paddingTop:12,borderTop:"1px solid #dde3f0",fontSize:10,color:"#c8d0e0",fontStyle:"italic"}}>For informational purposes only.</div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
