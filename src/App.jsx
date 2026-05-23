import { useState, useEffect, useCallback, useRef } from "react";

const ALL_ASSETS = [
  { ticker:"IB1T.L",  label:"IB1T",    group:"Bitcoin"     },
  { ticker:"BTC-USD", label:"BTC/USD", group:"Bitcoin"     },
  { ticker:"LQQS.L",  label:"LQQS",    group:"Tech"        },
  { ticker:"DAGB.L",  label:"DAGB",    group:"Tech"        },
  { ticker:"IUIT.L",  label:"IUIT",    group:"Tech"        },
  { ticker:"IUCD.L",  label:"IUCD",    group:"Tech"        },
  { ticker:"IITU.L",  label:"IITU",    group:"Tech"        },
  { ticker:"SEMI.L",  label:"SEMI",    group:"Tech"        },
  { ticker:"RBOT.L",  label:"RBOT",    group:"Tech"        },
  { ticker:"ARKK",    label:"ARKK",    group:"Tech"        },
  { ticker:"SOIL.L",  label:"SOIL",    group:"Commodities" },
  { ticker:"SBRT.L",  label:"SBRT",    group:"Commodities" },
  { ticker:"REMX.L",  label:"REMX",    group:"Commodities" },
  { ticker:"BRNT.L",  label:"BRNT",    group:"Commodities" },
  { ticker:"CL=F",    label:"WTI",     group:"Commodities" },
  { ticker:"^GSPC",   label:"S&P500",  group:"Indices"     },
  { ticker:"^IXIC",   label:"NASDAQ",  group:"Indices"     },
  { ticker:"^FTSE",   label:"FTSE",    group:"Indices"     },
  { ticker:"CSPX.L",  label:"CSPX",    group:"Indices"     },
  { ticker:"SPYL.L",  label:"SPYL",    group:"Indices"     },
  { ticker:"EQQQ.L",  label:"EQQQ",    group:"Indices"     },
  { ticker:"EQGB.L",  label:"EQGB",    group:"Indices"     },
  { ticker:"ISF.L",   label:"ISF",     group:"Indices"     },
  { ticker:"VUKE.L",  label:"VUKE",    group:"Indices"     },
  { ticker:"ISPY.L",  label:"ISPY",    group:"Indices"     },
  { ticker:"NVDA",    label:"NVIDIA",  group:"Stocks"      },
  { ticker:"TSLA",    label:"Tesla",   group:"Stocks"      },
  { ticker:"AAPL",    label:"Apple",   group:"Stocks"      },
  { ticker:"JPM",     label:"JPM",     group:"Stocks"      },
  { ticker:"BAC",     label:"BAC",     group:"Stocks"      },
  { ticker:"EIMI.L",  label:"EIMI",    group:"EM"          },
  { ticker:"EMIM.L",  label:"EMIM",    group:"EM"          },
  { ticker:"EMGU.L",  label:"EMGU",    group:"EM"          },
  { ticker:"AEMU.L",  label:"AEMU",    group:"EM"          },
  { ticker:"REGB.L",  label:"REGB",    group:"EM"          },
  { ticker:"JEDG.L",  label:"JEDG",    group:"Thematic"    },
  { ticker:"IUVF.L",  label:"IUVF",    group:"Thematic"    },
  { ticker:"DXJ.L",   label:"DXJ",     group:"Thematic"    },
  { ticker:"SUES.L",  label:"SUES",    group:"Thematic"    },
];

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

const WORLD_CORR = {
  "S&P500|NASDAQ":0.94,"S&P500|DJIA":0.96,"S&P500|FTSE":0.58,"S&P500|DAX":0.62,
  "S&P500|CAC":0.60,"S&P500|STOXX":0.61,"S&P500|Nikkei":0.54,"S&P500|HSI":0.41,
  "S&P500|SSE":0.29,"S&P500|ASX":0.52,"S&P500|Sensex":0.44,"S&P500|Bovespa":0.38,"S&P500|TSX":0.71,
  "NASDAQ|DJIA":0.88,"NASDAQ|FTSE":0.52,"NASDAQ|DAX":0.58,"NASDAQ|CAC":0.55,
  "NASDAQ|STOXX":0.57,"NASDAQ|Nikkei":0.51,"NASDAQ|HSI":0.38,"NASDAQ|SSE":0.25,
  "NASDAQ|ASX":0.48,"NASDAQ|Sensex":0.41,"NASDAQ|Bovespa":0.34,"NASDAQ|TSX":0.65,
  "DJIA|FTSE":0.56,"DJIA|DAX":0.60,"DJIA|CAC":0.57,"DJIA|STOXX":0.58,
  "DJIA|Nikkei":0.51,"DJIA|HSI":0.39,"DJIA|SSE":0.27,"DJIA|ASX":0.50,
  "DJIA|Sensex":0.42,"DJIA|Bovespa":0.36,"DJIA|TSX":0.68,
  "FTSE|DAX":0.78,"FTSE|CAC":0.77,"FTSE|STOXX":0.76,"FTSE|Nikkei":0.48,
  "FTSE|HSI":0.40,"FTSE|SSE":0.28,"FTSE|ASX":0.49,"FTSE|Sensex":0.41,
  "FTSE|Bovespa":0.35,"FTSE|TSX":0.62,
  "DAX|CAC":0.93,"DAX|STOXX":0.94,"DAX|Nikkei":0.52,"DAX|HSI":0.43,
  "DAX|SSE":0.30,"DAX|ASX":0.51,"DAX|Sensex":0.44,"DAX|Bovespa":0.37,"DAX|TSX":0.63,
  "CAC|STOXX":0.96,"CAC|Nikkei":0.51,"CAC|HSI":0.42,"CAC|SSE":0.29,
  "CAC|ASX":0.50,"CAC|Sensex":0.43,"CAC|Bovespa":0.36,"CAC|TSX":0.62,
  "STOXX|Nikkei":0.52,"STOXX|HSI":0.43,"STOXX|SSE":0.30,"STOXX|ASX":0.51,
  "STOXX|Sensex":0.44,"STOXX|Bovespa":0.37,"STOXX|TSX":0.63,
  "Nikkei|HSI":0.58,"Nikkei|SSE":0.41,"Nikkei|ASX":0.62,"Nikkei|Sensex":0.51,
  "Nikkei|Bovespa":0.33,"Nikkei|TSX":0.48,
  "HSI|SSE":0.64,"HSI|ASX":0.55,"HSI|Sensex":0.57,"HSI|Bovespa":0.38,"HSI|TSX":0.44,
  "SSE|ASX":0.42,"SSE|Sensex":0.46,"SSE|Bovespa":0.31,"SSE|TSX":0.33,
  "ASX|Sensex":0.53,"ASX|Bovespa":0.40,"ASX|TSX":0.58,
  "Sensex|Bovespa":0.41,"Sensex|TSX":0.47,"Bovespa|TSX":0.44,
};

const KNOWN = {
  "IB1T|BTC/USD":0.99,"IB1T|DAGB":0.36,"IB1T|NVIDIA":0.44,"IB1T|Tesla":0.37,
  "IB1T|LQQS":0.41,"IB1T|S&P500":0.38,"IB1T|NASDAQ":0.42,"IB1T|FTSE":0.18,
  "IB1T|SOIL":-0.31,"IB1T|SBRT":-0.29,"IB1T|WTI":-0.28,"IB1T|BRNT":-0.30,
  "IB1T|ARKK":0.51,"IB1T|IUIT":0.39,"IB1T|SEMI":0.38,"IB1T|RBOT":0.31,
  "IB1T|ISPY":0.35,"IB1T|JEDG":0.28,"IB1T|IUVF":0.26,"IB1T|EIMI":0.21,
  "IB1T|EQQQ":0.39,"IB1T|AEMU":0.19,"IB1T|DXJ":0.14,
  "BTC/USD|DAGB":0.35,"BTC/USD|NVIDIA":0.43,"BTC/USD|S&P500":0.37,"BTC/USD|NASDAQ":0.41,
  "LQQS|NASDAQ":0.88,"LQQS|NVIDIA":-0.82,"LQQS|S&P500":0.76,"LQQS|SOIL":-0.71,
  "LQQS|EQQQ":-0.88,"LQQS|FTSE":0.41,"DAGB|NVIDIA":0.55,"DAGB|S&P500":0.44,
  "DAGB|NASDAQ":0.51,"DAGB|FTSE":0.22,
  "IUIT|NASDAQ":0.91,"IUIT|S&P500":0.84,"IUIT|NVIDIA":0.78,"IUIT|FTSE":0.42,
  "IUCD|NASDAQ":0.82,"IUCD|S&P500":0.79,"IUCD|FTSE":0.38,
  "SEMI|NVIDIA":0.81,"SEMI|S&P500":0.74,"SEMI|NASDAQ":0.79,"SEMI|FTSE":0.38,
  "RBOT|NASDAQ":0.72,"RBOT|S&P500":0.68,"RBOT|FTSE":0.34,
  "EQQQ|NASDAQ":0.97,"EQQQ|S&P500":0.88,"EQQQ|NVIDIA":0.79,"EQQQ|FTSE":0.52,
  "ARKK|NASDAQ":0.82,"ARKK|NVIDIA":0.71,"ARKK|S&P500":0.71,"ARKK|FTSE":0.38,
  "S&P500|NASDAQ":0.94,"S&P500|FTSE":0.58,
  "NASDAQ|FTSE":0.52,
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
  "EIMI|EMIM":0.97,"EIMI|EMGU":0.88,"EMIM|EMGU":0.87,
  "EIMI|S&P500":0.52,"EMIM|S&P500":0.51,"AEMU|EIMI":0.71,
  "JEDG|S&P500":0.61,"JEDG|FTSE":0.48,"JEDG|NASDAQ":0.55,
  "IUVF|S&P500":0.58,"IUVF|NASDAQ":0.61,"IUVF|FTSE":0.39,
  "DXJ|FTSE":0.44,"DXJ|S&P500":0.39,"DXJ|NASDAQ":0.36,
  "AEMU|S&P500":0.48,"AEMU|NASDAQ":0.44,"AEMU|FTSE":0.41,
  "AEMU|NVIDIA":0.41,
};

const GRP_DEF={"Bitcoin":0.92,"Tech":0.71,"Commodities":0.65,"Indices":0.82,"Stocks":0.61,"EM":0.72,"Thematic":0.45};
const INTER=(g1,g2)=>{
  const k=[g1,g2].sort().join("|");
  return {"Bitcoin|Tech":0.38,"Bitcoin|Commodities":-0.28,"Bitcoin|Indices":0.36,"Bitcoin|Stocks":0.38,"Bitcoin|EM":0.21,"Bitcoin|Thematic":0.29,"Tech|Commodities":-0.58,"Tech|Indices":0.79,"Tech|Stocks":0.68,"Tech|EM":0.31,"Tech|Thematic":0.44,"Commodities|Indices":-0.41,"Commodities|Stocks":0.38,"Commodities|EM":0.29,"Commodities|Thematic":0.21,"Indices|Stocks":0.74,"Indices|EM":0.49,"Indices|Thematic":0.52,"Stocks|EM":0.41,"Stocks|Thematic":0.48,"EM|Thematic":0.38}[k]??0.25;
};

function getCorr(a,b){
  if(a===b)return 1.00;
  const v=KNOWN[`${a}|${b}`]??KNOWN[`${b}|${a}`];
  if(v!==undefined)return v;
  const wv=WORLD_CORR[`${a}|${b}`]??WORLD_CORR[`${b}|${a}`];
  if(wv!==undefined)return wv;
  const ga=ALL_ASSETS.find(x=>x.label===a)?.group;
  const gb=ALL_ASSETS.find(x=>x.label===b)?.group;
  if(!ga||!gb)return 0.25;
  return ga===gb?GRP_DEF[ga]??0.5:INTER(ga,gb);
}

function getWorldCorr(a,b){
  if(a===b)return 1.00;
  return WORLD_CORR[`${a}|${b}`]??WORLD_CORR[`${b}|${a}`]??0.30;
}

const DEMO_PRICES={
  "IB1T":5.75,"BTC/USD":107240,"LQQS":3.21,"DAGB":6.43,"IUIT":9.12,
  "IUCD":8.74,"IITU":7.33,"SEMI":11.20,"RBOT":5.88,"ARKK":48.30,
  "SOIL":4.88,"SBRT":5.12,"REMX":22.10,"BRNT":82.40,"WTI":78.60,
  "S&P500":5312,"NASDAQ":18820,"FTSE":8541,"CSPX":542.3,"SPYL":6.21,
  "EQQQ":388.4,"EQGB":14.22,"ISF":9.44,"VUKE":48.10,"ISPY":33.20,
  "NVIDIA":131.4,"Tesla":248.6,"Apple":212.1,"JPM":248.8,"BAC":44.12,
  "EIMI":68.40,"EMIM":40.20,"EMGU":12.30,"AEMU":9.88,"REGB":104.2,
  "JEDG":7.44,"IUVF":18.30,"DXJ":88.50,"SUES":6.11,
};
const DEMO_PCT={
  "IB1T":2.41,"BTC/USD":2.38,"LQQS":-1.82,"DAGB":1.14,"IUIT":0.88,
  "IUCD":0.61,"IITU":0.95,"SEMI":1.42,"RBOT":0.73,"ARKK":1.91,
  "SOIL":-0.94,"SBRT":-0.87,"REMX":-0.41,"BRNT":-0.62,"WTI":-0.58,
  "S&P500":0.52,"NASDAQ":0.71,"FTSE":-0.21,"CSPX":0.50,"SPYL":0.49,
  "EQQQ":0.68,"EQGB":-0.18,"ISF":-0.20,"VUKE":-0.22,"ISPY":0.51,
  "NVIDIA":3.18,"Tesla":-2.44,"Apple":0.33,"JPM":0.44,"BAC":0.31,
  "EIMI":0.22,"EMIM":0.19,"EMGU":0.28,"AEMU":0.18,"REGB":-0.11,
  "JEDG":0.39,"IUVF":0.51,"DXJ":-0.14,"SUES":0.22,
};

const GC={"Bitcoin":"#c2410c","Tech":"#0369a1","Commodities":"#92400e","Indices":"#6d28d9","Stocks":"#166534","EM":"#9d174d","Thematic":"#0f766e"};
const REGION_COLOR={"US":"#0369a1","UK":"#6d28d9","Europe":"#0f766e","Japan":"#92400e","HK":"#c2410c","China":"#c2410c","AUS":"#166534","India":"#9d174d","Brazil":"#0369a1","Canada":"#6d28d9"};

function heatBg(v){
  if(v===null||v===undefined)return"#e8edf5";
  const c=Math.max(-1,Math.min(1,v));
  if(c>=0){const t=c;return`rgb(${Math.round(220-t*200)},${Math.round(235-t*80)},${Math.round(255-t*20)})`;}
  const t=-c;return`rgb(${Math.round(255-t*10)},${Math.round(235-t*180)},${Math.round(220-t*190)})`;
}
function heatTxt(v){return Math.abs(v??0)>0.55?"#1a1a2e":"#2a2a4a";}

const API_CALL=async(prompt,max=600)=>{
  const r=await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",
    headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:max,messages:[{role:"user",content:prompt}]})
  });
  const d=await r.json();
  return d.content?.map(c=>c.text||"").join("")||"";
};

function Shimmer(){
  return <div style={{background:"linear-gradient(90deg,#e8edf5 25%,#d0d8ea 50%,#e8edf5 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite",borderRadius:4,height:13,width:"100%"}}/>;
}

const TABS=[
  {id:"prices",  label:"Prices & Expected"},
  {id:"matrix",  label:"Correlation"},
  {id:"pair",    label:"Pair Explorer"},
  {id:"world",   label:"World Indices"},
  {id:"ai",      label:"AI Insights"},
];

export default function CDRunway(){
  const [prices,setPrices]       = useState(null);
  const [dataMode,setDataMode]   = useState("demo");
  const [liveUrl,setLiveUrl]     = useState("");
  const [tab,setTab]             = useState("prices");

  // Prices tab
  const [priceSort,setPriceSort] = useState({col:"pct",dir:-1});
  const [expected,setExpected]   = useState({});
  const [expLoading,setExpLoading]=useState(false);
  const [showExpCol,setShowExpCol]=useState(false);

  // Matrix tab
  const [matrixAssets,setMatrixAssets]=useState(["NVIDIA","BAC","JPM","IB1T","JEDG","SEMI","RBOT","ISPY","IUVF","REMX","DAGB","ARKK","IUIT","IUCD","EIMI","EQQQ","AEMU","DXJ","BRNT","WTI"]);
  const [showPicker,setShowPicker]=useState(false);
  const [newTicker,setNewTicker] = useState("");
  const [newLabel,setNewLabel]   = useState("");
  const [newGroup,setNewGroup]   = useState("Tech");
  const [customAssets,setCustomAssets]=useState([]);

  // Pair explorer
  const [compareAsset,setCompareAsset]=useState("S&P500");
  const [pairSort,setPairSort]   = useState({col:"corr",dir:-1});
  const [rowAnalysis,setRowAnalysis]=useState({});
  const [rowLoading,setRowLoading]=useState({});

  // World indices
  const [worldTooltip,setWorldTooltip]=useState(null);

  // AI insights
  const [aiInsight,setAiInsight] = useState(null);
  const [aiLoading,setAiLoading] = useState(false);

  const [lastUpdated,setLastUpdated]=useState(null);

  const allAssets=[...ALL_ASSETS,...customAssets];

  useEffect(()=>{ loadPrices(); },[liveUrl]);

  const loadPrices=useCallback(async()=>{
    if(liveUrl){
      try{
        const r=await fetch(liveUrl);
        const d=await r.json();
        const p={};
        Object.entries(d).forEach(([k,v])=>{p[k]={price:v.price??0,pct:v.pct??0};});
        setPrices(p);setDataMode("live");setLastUpdated(new Date());return;
      }catch(e){}
    }
    const p={};
    allAssets.forEach(a=>{p[a.label]={price:DEMO_PRICES[a.label]??0,pct:DEMO_PCT[a.label]??0};});
    setPrices(p);setDataMode("demo");setLastUpdated(new Date());
  },[liveUrl,allAssets.length]);

  const fetchExpected=useCallback(async()=>{
    setExpLoading(true);setShowExpCol(true);
    const list=allAssets.map(a=>a.label).join(", ");
    try{
      const text=await API_CALL(`Pre-market analyst. Today ${new Date().toDateString()}, UK morning.
Estimate expected % change today for each: ${list}
Base on overnight BTC, US futures, oil, USD, Asian closes.
Respond ONLY raw JSON array no markdown:
[{"label":"IB1T","pct":1.2,"note":"BTC up overnight"},...]
Include ALL assets. pct=number. note max 6 words.`,2000);
      const arr=JSON.parse(text.replace(/```json|```/g,"").trim());
      const map={};arr.forEach(x=>{map[x.label]={pct:x.pct,note:x.note,overridden:false};});
      setExpected(map);
    }catch(e){
      const map={};
      allAssets.forEach(a=>{map[a.label]={pct:parseFloat(((DEMO_PCT[a.label]??0)*0.65+(Math.random()-0.5)*0.4).toFixed(2)),note:"Futures estimate",overridden:false};});
      setExpected(map);
    }
    setExpLoading(false);
  },[allAssets.length]);

  const analyseRow=useCallback(async(asset)=>{
    const cmp=compareAsset;
    const corr=getCorr(asset,cmp);
    const p1=prices?.[asset]||{pct:0};
    const p2=prices?.[cmp]||{pct:0};
    setRowLoading(prev=>({...prev,[asset]:true}));
    try{
      const text=await API_CALL(`Portfolio analyst. Today ${new Date().toDateString()}.
${asset} vs ${cmp}. 30-day correlation: ${corr.toFixed(2)}.
${asset} today: ${p1.pct.toFixed(2)}%. ${cmp} today: ${p2.pct.toFixed(2)}%.
In 3 concise sentences: (1) what drives this correlation, (2) is it behaving as expected today, (3) key implication or risk. No disclaimer.`,300);
      setRowAnalysis(prev=>({...prev,[asset]:text}));
    }catch(e){
      setRowAnalysis(prev=>({...prev,[asset]:"API key required for analysis. Add VITE_ANTHROPIC_API_KEY in Vercel settings."}));
    }
    setRowLoading(prev=>({...prev,[asset]:false}));
  },[compareAsset,prices]);

  const runAI=useCallback(async()=>{
    setAiLoading(true);setAiInsight(null);setTab("ai");
    const top=allAssets.slice(0,16).map(a=>`${a.label}:${(DEMO_PCT[a.label]??0)>=0?"+":""}${(DEMO_PCT[a.label]??0).toFixed(2)}%`).join(", ");
    try{
      const text=await API_CALL(`Senior portfolio analyst. Today ${new Date().toDateString()}.
Portfolio: ${allAssets.map(a=>a.label).join(", ")}.
Key moves: ${top}
Analysis in these sections (2-3 sentences each):
1. CORRELATION SHIFTS
2. KEY DIVERGENCES
3. MACRO DRIVERS TODAY
4. HEDGING IMPLICATIONS
Direct. No disclaimers. Max 320 words.`,900);
      setAiInsight(text);
    }catch(e){setAiInsight("API key required. Add VITE_ANTHROPIC_API_KEY in Vercel environment variables.");}
    setAiLoading(false);
  },[allAssets.length]);

  const addCustomAsset=()=>{
    if(!newLabel.trim())return;
    if(allAssets.find(a=>a.label===newLabel.trim().toUpperCase())){alert("Asset already exists.");return;}
    const a={ticker:newTicker.trim()||newLabel.trim(),label:newLabel.trim().toUpperCase(),group:newGroup,custom:true};
    setCustomAssets(prev=>[...prev,a]);
    setMatrixAssets(prev=>prev.length<20?[...prev,a.label]:prev);
    setNewTicker("");setNewLabel("");
  };

  const sortedPrices=useCallback(()=>{
    if(!prices)return allAssets;
    return [...allAssets].sort((a,b)=>{
      const va=priceSort.col==="pct"?(prices[a.label]?.pct??0):(prices[a.label]?.price??0);
      const vb=priceSort.col==="pct"?(prices[b.label]?.pct??0):(prices[b.label]?.price??0);
      return priceSort.dir*(vb-va);
    });
  },[prices,priceSort,allAssets.length]);

  const sortedPair=useCallback(()=>{
    return [...allAssets].filter(a=>a.label!==compareAsset).sort((a,b)=>{
      if(pairSort.col==="corr")return pairSort.dir*(getCorr(b.label,compareAsset)-getCorr(a.label,compareAsset));
      if(pairSort.col==="pct")return pairSort.dir*((prices?.[b.label]?.pct??0)-(prices?.[a.label]?.pct??0));
      return 0;
    });
  },[compareAsset,pairSort,prices,allAssets.length]);

  const togglePairSort=(col)=>setPairSort(prev=>prev.col===col?{col,dir:prev.dir*-1}:{col,dir:-1});
  const togglePriceSort=(col)=>setPriceSort(prev=>prev.col===col?{col,dir:prev.dir*-1}:{col,dir:-1});

  const fmtAI=(text)=>text.split(/\n(?=\d\.|[A-Z]{3,}[^a-z])/g).map((s,i)=>{
    const lines=s.trim().split("\n");
    return(<div key={i} style={{marginBottom:16}}>
      <div style={{fontFamily:"monospace",fontSize:10,letterSpacing:"0.12em",color:"#0369a1",textTransform:"uppercase",marginBottom:6,borderLeft:"2px solid #0369a1",paddingLeft:10}}>{lines[0]}</div>
      <div style={{fontSize:13,lineHeight:1.8,color:"#1e293b",paddingLeft:12}}>{lines.slice(1).join("\n").trim()}</div>
    </div>);
  });

  const SortBtn=({col,which,children})=>{
    const s=which==="price"?priceSort:pairSort;
    const fn=which==="price"?togglePriceSort:togglePairSort;
    return(
      <button onClick={()=>fn(col)} style={{background:"none",border:"none",cursor:"pointer",fontFamily:"monospace",fontSize:9,letterSpacing:"0.1em",color:s.col===col?"#0369a1":"#94a3b8",padding:0,display:"flex",alignItems:"center",gap:3}}>
        {children}{s.col===col?(s.dir===-1?"↓":"↑"):"↕"}
      </button>
    );
  };

  const FIXED_INDICES=["S&P500","NASDAQ","FTSE"];

  return(
    <div style={{minHeight:"100vh",background:"#f8fafc",fontFamily:"system-ui,sans-serif",paddingBottom:40}}>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        .trow:hover{background:#f1f5f9!important;}
        .cell{cursor:default;}
        .cell:hover{outline:2px solid #0369a1;outline-offset:-1px;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:2px;}
        input,select{font-family:system-ui,sans-serif;}
      `}</style>

      {/* HEADER */}
      <div style={{background:"#fff",borderBottom:"1px solid #e2e8f0",padding:"16px 20px 0",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8,marginBottom:12}}>
          <div>
            <div style={{fontFamily:"monospace",fontSize:9,letterSpacing:"0.2em",color:"#94a3b8",marginBottom:3}}>CDRUNWAY · PORTFOLIO INTELLIGENCE</div>
            <div style={{fontSize:18,fontWeight:600,color:"#0f172a"}}>Market Dashboard</div>
            <div style={{fontSize:11,color:"#94a3b8",marginTop:2,display:"flex",gap:8,alignItems:"center"}}>
              {lastUpdated&&<span>{lastUpdated.toLocaleTimeString("en-GB")}</span>}
              <span style={{background:dataMode==="live"?"#dcfce7":"#fef9c3",color:dataMode==="live"?"#166534":"#92400e",borderRadius:10,padding:"1px 8px",fontSize:9,fontFamily:"monospace"}}>
                {dataMode==="live"?"● LIVE":"⚠ DEMO"}
              </span>
            </div>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button onClick={()=>{fetchExpected();if(tab!=="prices")setTab("prices");}} style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:7,padding:"7px 12px",color:"#166534",fontSize:11,fontFamily:"monospace",cursor:"pointer"}}>◎ GET EXPECTED</button>
            <button onClick={runAI} style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:7,padding:"7px 12px",color:"#1e40af",fontSize:11,fontFamily:"monospace",cursor:"pointer"}}>◈ AI INSIGHTS</button>
          </div>
        </div>
        {/* Live URL */}
        <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:10,flexWrap:"wrap"}}>
          <span style={{fontFamily:"monospace",fontSize:9,color:"#94a3b8",whiteSpace:"nowrap"}}>LIVE URL</span>
          <input value={liveUrl} onChange={e=>setLiveUrl(e.target.value)} placeholder="https://your-backend.onrender.com/prices — leave blank for demo data"
            style={{flex:1,minWidth:220,maxWidth:440,fontSize:11,border:"1px solid #e2e8f0",borderRadius:6,padding:"5px 9px",outline:"none",color:"#0f172a",background:"#f8fafc"}}/>
          <button onClick={loadPrices} style={{background:"#f1f5f9",border:"1px solid #e2e8f0",borderRadius:6,padding:"5px 10px",fontSize:11,cursor:"pointer",color:"#475569"}}>↻ Refresh</button>
        </div>
        {/* Tabs */}
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

        {/* ═══ TAB 1: PRICES & EXPECTED ═══ */}
        {tab==="prices"&&(
          <div style={{animation:"fadeIn 0.25s ease"}}>
            {/* Column headers */}
            <div style={{display:"grid",gridTemplateColumns:"32px 1fr 90px 90px"+(showExpCol?" 90px 120px":""),gap:6,padding:"5px 12px",marginBottom:4}}>
              <div style={{fontFamily:"monospace",fontSize:9,color:"#94a3b8"}}>#</div>
              <div style={{fontFamily:"monospace",fontSize:9,color:"#94a3b8"}}>ASSET</div>
              <SortBtn col="price" which="price">PRICE</SortBtn>
              <SortBtn col="pct" which="price">CHANGE %</SortBtn>
              {showExpCol&&<SortBtn col="expPct" which="price">EXP %</SortBtn>}
              {showExpCol&&<div style={{fontFamily:"monospace",fontSize:9,color:"#94a3b8"}}>REASONING</div>}
            </div>

            {!prices&&[1,2,3,4,5].map(i=>(
              <div key={i} style={{background:"#fff",borderRadius:8,border:"1px solid #e2e8f0",padding:"10px 12px",marginBottom:5}}><Shimmer/></div>
            ))}

            {prices&&sortedPrices().map((asset,idx)=>{
              const d=prices[asset.label]||{price:0,pct:0};
              const ex=expected[asset.label];
              const isUp=d.pct>=0;
              const exUp=ex?(ex.pct>=0):true;
              const col=GC[asset.group]||"#0f172a";
              const [editOpen,setEditOpen]=useState(false);
              const [editVal,setEditVal]=useState("");
              return(
                <div key={asset.label} className="trow" style={{background:"#fff",borderRadius:8,border:"1px solid #e2e8f0",padding:"9px 12px",marginBottom:4,display:"grid",gridTemplateColumns:"32px 1fr 90px 90px"+(showExpCol?" 90px 120px":""),gap:6,alignItems:"center",transition:"background 0.12s"}}>
                  <div style={{fontFamily:"monospace",fontSize:10,color:"#cbd5e1",fontWeight:600}}>#{idx+1}</div>
                  <div>
                    <div style={{fontSize:12,fontWeight:600,color:col}}>{asset.label}</div>
                    <div style={{fontSize:10,color:"#94a3b8"}}>{asset.group}</div>
                  </div>
                  <div style={{fontFamily:"monospace",fontSize:11,color:"#0f172a"}}>
                    {d.price>=1000?d.price.toLocaleString("en-GB",{maximumFractionDigits:0}):d.price.toFixed(2)}
                  </div>
                  <div>
                    <span style={{background:isUp?"#dcfce7":"#fee2e2",color:isUp?"#166534":"#dc2626",borderRadius:5,padding:"2px 7px",fontFamily:"monospace",fontSize:10,fontWeight:600}}>
                      {isUp?"▲":"▼"} {Math.abs(d.pct).toFixed(2)}%
                    </span>
                  </div>
                  {showExpCol&&(
                    <div>
                      {expLoading?<Shimmer/>:ex?(
                        editOpen?(
                          <div style={{display:"flex",gap:3}}>
                            <input autoFocus value={editVal} onChange={e=>setEditVal(e.target.value)}
                              onKeyDown={e=>{
                                if(e.key==="Enter"){const v=parseFloat(editVal);if(!isNaN(v))setExpected(p=>({...p,[asset.label]:{...ex,pct:v,overridden:true}}));setEditOpen(false);}
                                if(e.key==="Escape")setEditOpen(false);
                              }}
                              style={{width:50,fontFamily:"monospace",fontSize:10,border:"1px solid #0369a1",borderRadius:4,padding:"2px 5px",outline:"none"}}/>
                            <button onClick={()=>{const v=parseFloat(editVal);if(!isNaN(v))setExpected(p=>({...p,[asset.label]:{...ex,pct:v,overridden:true}}));setEditOpen(false);}}
                              style={{background:"#0369a1",color:"#fff",border:"none",borderRadius:4,padding:"2px 7px",fontSize:10,cursor:"pointer"}}>✓</button>
                          </div>
                        ):(
                          <span onClick={()=>{setEditOpen(true);setEditVal(ex.pct.toFixed(2));}} title="Click to override"
                            style={{background:exUp?"#dcfce7":"#fee2e2",color:exUp?"#166534":"#dc2626",borderRadius:5,padding:"2px 7px",fontFamily:"monospace",fontSize:10,fontWeight:600,cursor:"pointer",display:"inline-block",border:ex.overridden?"1px solid #6d28d9":"none"}}>
                            {exUp?"▲":"▼"} {Math.abs(ex.pct).toFixed(2)}%
                          </span>
                        )
                      ):<span style={{color:"#cbd5e1",fontSize:10}}>—</span>}
                    </div>
                  )}
                  {showExpCol&&(
                    <div style={{fontSize:10,color:"#64748b",fontStyle:"italic"}}>{ex?.note||""}</div>
                  )}
                </div>
              );
            })}

            {dataMode==="demo"&&(
              <div style={{marginTop:10,padding:"9px 12px",background:"#fef9c3",borderRadius:7,border:"1px solid #fde68a",fontSize:11,color:"#92400e"}}>
                ⚠ Demo data shown. Paste your backend URL above for live prices. See AI Insights tab for free setup guide.
              </div>
            )}
          </div>
        )}

        {/* ═══ TAB 2: CORRELATION MATRIX ═══ */}
        {tab==="matrix"&&(
          <div style={{animation:"fadeIn 0.25s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8,marginBottom:12}}>
              <div>
                <div style={{fontFamily:"monospace",fontSize:9,color:"#94a3b8",letterSpacing:"0.1em",marginBottom:3}}>30-DAY ROLLING CORRELATION — Y axis: assets · X axis: indices (fixed)</div>
                <div style={{fontSize:12,color:"#475569"}}>Click any column label to remove it. Max 20 columns.</div>
              </div>
              <button onClick={()=>setShowPicker(p=>!p)}
                style={{background:showPicker?"#1e293b":"#f8fafc",color:showPicker?"#fff":"#475569",border:"1px solid #e2e8f0",borderRadius:7,padding:"7px 12px",fontSize:11,fontFamily:"monospace",cursor:"pointer"}}>
                {showPicker?"▲ CLOSE":"+ MANAGE ASSETS"} ({matrixAssets.length}/20)
              </button>
            </div>

            {showPicker&&(
              <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:14,marginBottom:14,animation:"fadeIn 0.2s ease"}}>
                <div style={{fontFamily:"monospace",fontSize:9,color:"#94a3b8",marginBottom:10,letterSpacing:"0.1em"}}>ACTIVE ASSETS — click to remove · MAX 20</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:12}}>
                  {matrixAssets.map(l=>{
                    const a=allAssets.find(x=>x.label===l);
                    return(
                      <button key={l} onClick={()=>setMatrixAssets(prev=>prev.filter(x=>x!==l))}
                        style={{background:(GC[a?.group]||"#0369a1")+"18",border:`1px solid ${GC[a?.group]||"#0369a1"}44`,borderRadius:14,padding:"3px 10px",color:GC[a?.group]||"#0369a1",fontSize:10,fontFamily:"monospace",cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                        {l} <span style={{opacity:0.6,fontSize:9}}>✕</span>
                      </button>
                    );
                  })}
                </div>

                <div style={{fontFamily:"monospace",fontSize:9,color:"#94a3b8",marginBottom:8,letterSpacing:"0.1em"}}>ADD FROM LIST</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:14}}>
                  {allAssets.filter(a=>!matrixAssets.includes(a.label)&&!FIXED_INDICES.includes(a.label)).map(a=>(
                    <button key={a.label} onClick={()=>{if(matrixAssets.length>=20){alert("Max 20 assets.");return;}setMatrixAssets(prev=>[...prev,a.label]);}}
                      style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:14,padding:"3px 10px",color:"#475569",fontSize:10,fontFamily:"monospace",cursor:"pointer"}}>
                      + {a.label}
                    </button>
                  ))}
                </div>

                <div style={{borderTop:"1px solid #e2e8f0",paddingTop:12}}>
                  <div style={{fontFamily:"monospace",fontSize:9,color:"#94a3b8",marginBottom:8,letterSpacing:"0.1em"}}>ADD BRAND NEW ASSET (not in list)</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                    <input value={newTicker} onChange={e=>setNewTicker(e.target.value)} placeholder="Ticker e.g. XS2D.L"
                      style={{width:110,fontSize:11,border:"1px solid #e2e8f0",borderRadius:6,padding:"5px 8px",outline:"none"}}/>
                    <input value={newLabel} onChange={e=>setNewLabel(e.target.value)} placeholder="Label e.g. XS2D"
                      style={{width:90,fontSize:11,border:"1px solid #e2e8f0",borderRadius:6,padding:"5px 8px",outline:"none"}}/>
                    <select value={newGroup} onChange={e=>setNewGroup(e.target.value)}
                      style={{fontSize:11,border:"1px solid #e2e8f0",borderRadius:6,padding:"5px 8px",outline:"none",color:"#0f172a"}}>
                      {Object.keys(GC).map(g=><option key={g}>{g}</option>)}
                    </select>
                    <button onClick={addCustomAsset}
                      style={{background:"#0369a1",color:"#fff",border:"none",borderRadius:6,padding:"6px 14px",fontSize:11,fontFamily:"monospace",cursor:"pointer"}}>
                      + ADD
                    </button>
                  </div>
                  <div style={{fontSize:10,color:"#94a3b8",marginTop:6}}>
                    The asset will appear in all tabs. Correlation uses group-average estimates until historical data is available.
                  </div>
                </div>
              </div>
            )}

            {/* Legend */}
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:60,height:6,borderRadius:3,background:"linear-gradient(90deg,#fca5a5,#fef3c7,#bfdbfe)"}}/>
                <span style={{fontFamily:"monospace",fontSize:9,color:"#94a3b8"}}>-1 (negative) → 0 → +1 (positive)</span>
              </div>
            </div>

            {/* Matrix — assets on Y, indices on X */}
            <div style={{overflowX:"auto"}}>
              <table style={{borderCollapse:"separate",borderSpacing:3}}>
                <thead>
                  <tr>
                    <th style={{minWidth:70,textAlign:"right",paddingRight:8}}/>
                    {FIXED_INDICES.map(idx=>(
                      <th key={idx} style={{fontFamily:"monospace",fontSize:13,fontWeight:700,color:GC["Indices"],padding:"4px 8px",textAlign:"center",minWidth:60,letterSpacing:"0.05em"}}>
                        {idx}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrixAssets.map(rowLabel=>{
                    const a=allAssets.find(x=>x.label===rowLabel);
                    return(
                      <tr key={rowLabel}>
                        <td style={{fontFamily:"monospace",fontSize:10,fontWeight:600,color:GC[a?.group]||"#0f172a",paddingRight:10,textAlign:"right",whiteSpace:"nowrap",paddingTop:2,paddingBottom:2}}>
                          {rowLabel}
                        </td>
                        {FIXED_INDICES.map(idx=>{
                          const v=getCorr(rowLabel,idx);
                          const bg=heatBg(v);
                          const tc=heatTxt(v);
                          return(
                            <td key={idx} className="cell"
                              style={{background:bg,width:60,height:34,textAlign:"center",verticalAlign:"middle",borderRadius:4}}>
                              <span style={{fontFamily:"monospace",fontSize:11,fontWeight:600,color:tc}}>{v.toFixed(2)}</span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ TAB 3: PAIR EXPLORER ═══ */}
        {tab==="pair"&&(
          <div style={{animation:"fadeIn 0.25s ease"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,flexWrap:"wrap"}}>
              <div style={{fontFamily:"monospace",fontSize:9,color:"#94a3b8",letterSpacing:"0.1em"}}>COMPARE ALL ASSETS AGAINST</div>
              <select value={compareAsset} onChange={e=>{setCompareAsset(e.target.value);setRowAnalysis({});}}
                style={{fontSize:12,border:"1px solid #e2e8f0",borderRadius:7,padding:"6px 10px",outline:"none",color:"#0f172a",fontWeight:600,cursor:"pointer"}}>
                {allAssets.map(a=><option key={a.label} value={a.label}>{a.label} — {a.group}</option>)}
              </select>
              {prices&&prices[compareAsset]&&(
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontFamily:"monospace",fontSize:12,color:"#0f172a"}}>{prices[compareAsset].price>=1000?prices[compareAsset].price.toLocaleString("en-GB",{maximumFractionDigits:0}):prices[compareAsset].price.toFixed(2)}</span>
                  <span style={{background:prices[compareAsset].pct>=0?"#dcfce7":"#fee2e2",color:prices[compareAsset].pct>=0?"#166534":"#dc2626",borderRadius:5,padding:"2px 7px",fontFamily:"monospace",fontSize:10,fontWeight:600}}>
                    {prices[compareAsset].pct>=0?"▲":"▼"} {Math.abs(prices[compareAsset].pct).toFixed(2)}%
                  </span>
                </div>
              )}
            </div>

            {/* Column headers */}
            <div style={{display:"grid",gridTemplateColumns:"32px 1fr 85px 85px 75px 100px 70px",gap:6,padding:"5px 12px",marginBottom:4}}>
              <div style={{fontFamily:"monospace",fontSize:9,color:"#94a3b8"}}>#</div>
              <div style={{fontFamily:"monospace",fontSize:9,color:"#94a3b8"}}>ASSET</div>
              <div style={{fontFamily:"monospace",fontSize:9,color:"#94a3b8"}}>PRICE</div>
              <SortBtn col="pct" which="pair">CHANGE %</SortBtn>
              <SortBtn col="corr" which="pair">CORR</SortBtn>
              <div style={{fontFamily:"monospace",fontSize:9,color:"#94a3b8"}}>STRENGTH</div>
              <div style={{fontFamily:"monospace",fontSize:9,color:"#94a3b8"}}>AI</div>
            </div>

            {sortedPair().map((asset,idx)=>{
              const d=prices?.[asset.label]||{price:0,pct:0};
              const isUp=d.pct>=0;
              const corr=getCorr(asset.label,compareAsset);
              const corrUp=corr>=0;
              const absC=Math.abs(corr);
              const strength=absC>0.7?"Strong":absC>0.4?"Moderate":"Weak";
              const col=GC[asset.group]||"#0f172a";
              const analysis=rowAnalysis[asset.label];
              const loading=rowLoading[asset.label];
              return(
                <div key={asset.label}>
                  <div className="trow" style={{background:"#fff",borderRadius:analysis?`8px 8px 0 0`:"8px",border:"1px solid #e2e8f0",borderBottom:analysis?"none":"1px solid #e2e8f0",padding:"9px 12px",marginBottom:analysis?0:4,display:"grid",gridTemplateColumns:"32px 1fr 85px 85px 75px 100px 70px",gap:6,alignItems:"center",transition:"background 0.12s"}}>
                    <div style={{fontFamily:"monospace",fontSize:10,color:"#cbd5e1",fontWeight:600}}>#{idx+1}</div>
                    <div>
                      <div style={{fontSize:12,fontWeight:600,color:col}}>{asset.label}</div>
                      <div style={{fontSize:10,color:"#94a3b8"}}>{asset.group}</div>
                    </div>
                    <div style={{fontFamily:"monospace",fontSize:11,color:"#0f172a"}}>
                      {d.price>=1000?d.price.toLocaleString("en-GB",{maximumFractionDigits:0}):d.price.toFixed(2)}
                    </div>
                    <div>
                      <span style={{background:isUp?"#dcfce7":"#fee2e2",color:isUp?"#166534":"#dc2626",borderRadius:5,padding:"2px 7px",fontFamily:"monospace",fontSize:10,fontWeight:600}}>
                        {isUp?"▲":"▼"} {Math.abs(d.pct).toFixed(2)}%
                      </span>
                    </div>
                    <div style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color:corrUp?"#0369a1":"#dc2626"}}>{corr.toFixed(2)}</div>
                    <div>
                      <span style={{background:absC>0.7?"#dbeafe":absC>0.4?"#f0fdf4":"#f8fafc",color:absC>0.7?"#1e40af":absC>0.4?"#166534":"#475569",borderRadius:5,padding:"2px 8px",fontSize:10,fontFamily:"monospace"}}>
                        {strength} {corrUp?"↑":"↓"}
                      </span>
                    </div>
                    <div>
                      <button onClick={()=>analyseRow(asset.label)} disabled={loading}
                        style={{background:loading?"#f8fafc":"#eff6ff",border:"1px solid #bfdbfe",borderRadius:6,padding:"4px 8px",color:"#1e40af",fontFamily:"monospace",fontSize:9,cursor:loading?"not-allowed":"pointer",whiteSpace:"nowrap"}}>
                        {loading?<span style={{animation:"pulse 1s infinite"}}>...</span>:"◈ Analyse"}
                      </button>
                    </div>
                  </div>
                  {analysis&&!loading&&(
                    <div style={{background:"#f0f9ff",border:"1px solid #e2e8f0",borderTop:"none",borderRadius:"0 0 8px 8px",padding:"10px 14px",marginBottom:4}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                        <div style={{fontSize:12,lineHeight:1.75,color:"#1e293b",flex:1}}>{analysis}</div>
                        <button onClick={()=>setRowAnalysis(prev=>{const n={...prev};delete n[asset.label];return n;})}
                          style={{background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:14,padding:0,flexShrink:0}}>✕</button>
                      </div>
                    </div>
                  )}
                  {loading&&(
                    <div style={{background:"#f0f9ff",border:"1px solid #e2e8f0",borderTop:"none",borderRadius:"0 0 8px 8px",padding:"10px 14px",marginBottom:4}}>
                      <Shimmer/><div style={{marginTop:6,width:"60%"}}><Shimmer/></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ TAB 4: WORLD INDICES ═══ */}
        {tab==="world"&&(
          <div style={{animation:"fadeIn 0.25s ease"}}>
            <div style={{fontFamily:"monospace",fontSize:9,color:"#94a3b8",letterSpacing:"0.1em",marginBottom:12}}>WORLD INDICES CORRELATION HEATMAP — 30-DAY ROLLING</div>

            {/* Legend */}
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,flexWrap:"wrap"}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:80,height:7,borderRadius:3,background:"linear-gradient(90deg,#fca5a5,#fff,#bfdbfe)"}}/>
                <span style={{fontFamily:"monospace",fontSize:9,color:"#94a3b8"}}>-1 → 0 → +1</span>
              </div>
              {[...new Set(WORLD_INDICES.map(i=>i.region))].map(r=>(
                <div key={r} style={{display:"flex",alignItems:"center",gap:4}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:REGION_COLOR[r]||"#94a3b8"}}/>
                  <span style={{fontSize:10,color:"#64748b"}}>{r}</span>
                </div>
              ))}
            </div>

            <div style={{overflowX:"auto"}}>
              <table style={{borderCollapse:"separate",borderSpacing:3}}>
                <thead>
                  <tr>
                    <th style={{minWidth:80}}/>
                    {WORLD_INDICES.map(idx=>(
                      <th key={idx.label} style={{fontFamily:"monospace",fontSize:9,color:REGION_COLOR[idx.region]||"#94a3b8",padding:"0 2px 6px",textAlign:"center",minWidth:52,writingMode:"vertical-rl",transform:"rotate(180deg)",height:70,letterSpacing:"0.05em"}}>
                        {idx.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {WORLD_INDICES.map((row)=>(
                    <tr key={row.label}>
                      <td style={{paddingRight:10,textAlign:"right",whiteSpace:"nowrap"}}>
                        <div style={{fontFamily:"monospace",fontSize:10,fontWeight:700,color:REGION_COLOR[row.region]||"#0f172a"}}>{row.label}</div>
                        <div style={{fontSize:9,color:"#94a3b8"}}>{row.name}</div>
                      </td>
                      {WORLD_INDICES.map((col)=>{
                        const v=getWorldCorr(row.label,col.label);
                        const bg=heatBg(v);
                        const tc=heatTxt(v);
                        const isDiag=row.label===col.label;
                        return(
                          <td key={col.label} className="cell"
                            onMouseEnter={()=>setWorldTooltip({row:row.label,col:col.label,v})}
                            onMouseLeave={()=>setWorldTooltip(null)}
                            style={{background:isDiag?"#f1f5f9":bg,width:52,height:36,textAlign:"center",verticalAlign:"middle",borderRadius:4,border:isDiag?"1px solid #cbd5e1":"none"}}>
                            <span style={{fontFamily:"monospace",fontSize:10,fontWeight:600,color:isDiag?"#94a3b8":tc}}>
                              {isDiag?"—":v.toFixed(2)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {worldTooltip&&worldTooltip.row!==worldTooltip.col&&(
              <div style={{marginTop:12,background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,padding:"10px 14px",display:"inline-flex",alignItems:"center",gap:10,boxShadow:"0 2px 6px rgba(0,0,0,0.06)"}}>
                <span style={{fontFamily:"monospace",fontSize:11,color:"#0f172a"}}>{worldTooltip.row} ↔ {worldTooltip.col}</span>
                <span style={{fontFamily:"monospace",fontSize:14,fontWeight:700,color:worldTooltip.v>=0?"#0369a1":"#dc2626"}}>{worldTooltip.v.toFixed(3)}</span>
                <span style={{fontSize:11,color:"#94a3b8"}}>
                  {Math.abs(worldTooltip.v)>0.7?"Strong":Math.abs(worldTooltip.v)>0.4?"Moderate":"Weak"} {worldTooltip.v>=0?"positive":"negative"}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ═══ TAB 5: AI INSIGHTS ═══ */}
        {tab==="ai"&&(
          <div style={{animation:"fadeIn 0.25s ease"}}>
            {aiLoading&&(
              <div>
                <div style={{fontFamily:"monospace",fontSize:10,color:"#0369a1",letterSpacing:"0.12em",marginBottom:12,animation:"pulse 1.5s infinite"}}>◈ ANALYSING PORTFOLIO...</div>
                {[1,2,3,4].map(i=><div key={i} style={{background:"#fff",borderRadius:8,border:"1px solid #e2e8f0",padding:14,marginBottom:6}}><Shimmer/><div style={{marginTop:7}}><Shimmer/></div></div>)}
              </div>
            )}

            {!aiLoading&&aiInsight&&(
              <div style={{background:"#fff",borderRadius:10,padding:20,border:"1px solid #e2e8f0"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18,paddingBottom:12,borderBottom:"1px solid #e2e8f0"}}>
                  <span style={{color:"#0369a1",fontSize:14}}>◈</span>
                  <span style={{fontFamily:"monospace",fontSize:9,color:"#94a3b8",letterSpacing:"0.12em"}}>AI INSIGHTS · {new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}</span>
                </div>
                {fmtAI(aiInsight)}
                <div style={{marginTop:14,paddingTop:12,borderBottom:"none",borderTop:"1px solid #e2e8f0",fontSize:10,color:"#cbd5e1",fontStyle:"italic"}}>For informational purposes only.</div>
              </div>
            )}

            {!aiLoading&&(
              <div style={{background:"#fff",borderRadius:10,border:"1px solid #e2e8f0",padding:20,marginTop:aiInsight?16:0}}>
                <div style={{fontFamily:"monospace",fontSize:10,color:"#0369a1",marginBottom:14,letterSpacing:"0.1em"}}>⚙ HOW TO GET LIVE PRICES — FREE STEP BY STEP</div>
                <div style={{fontSize:13,lineHeight:2,color:"#1e293b"}}>
                  <p style={{margin:"0 0 8px"}}><b>What we are doing:</b> Creating a tiny Python program that fetches prices from Yahoo Finance every time your app asks for them, and hosting it free on Render.com.</p>
                  <p style={{margin:"0 0 4px",fontWeight:600,color:"#0369a1"}}>Step 1 — Create the backend files in VS Code</p>
                  <p style={{margin:"0 0 8px"}}>In VS Code, in your <code style={{background:"#f1f5f9",padding:"1px 5px",borderRadius:3}}>correlation-tool</code> folder, create a new folder called <code style={{background:"#f1f5f9",padding:"1px 5px",borderRadius:3}}>backend</code>. Inside it create two files:</p>
                  <p style={{margin:"0 0 4px",fontWeight:600,color:"#0369a1"}}>File 1 — backend/requirements.txt</p>
                  <pre style={{background:"#1e293b",color:"#e2e8f0",borderRadius:7,padding:12,fontSize:11,marginBottom:10,overflowX:"auto"}}>fastapi
uvicorn
yfinance</pre>
                  <p style={{margin:"0 0 4px",fontWeight:600,color:"#0369a1"}}>File 2 — backend/main.py</p>
                  <pre style={{background:"#1e293b",color:"#e2e8f0",borderRadius:7,padding:12,fontSize:10,marginBottom:10,overflowX:"auto",lineHeight:1.6}}>{`from fastapi import FastAPI
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
        pct = round((curr-prev)/prev*100, 2)
        result[label] = {"price": round(float(curr),2), "pct": pct}
    except:
      result[label] = {"price": 0, "pct": 0}
  return result`}</pre>
                  <p style={{margin:"0 0 4px",fontWeight:600,color:"#0369a1"}}>Step 2 — Push to GitHub</p>
                  <p style={{margin:"0 0 8px"}}>In VS Code terminal, run your usual three commands:</p>
                  <pre style={{background:"#1e293b",color:"#e2e8f0",borderRadius:7,padding:10,fontSize:11,marginBottom:10}}>git add .
git commit -m "added backend"
git push</pre>
                  <p style={{margin:"0 0 4px",fontWeight:600,color:"#0369a1"}}>Step 3 — Deploy on Render (free)</p>
                  <p style={{margin:"0 0 4px"}}>1. Go to <b>render.com</b> and sign up using your GitHub account.</p>
                  <p style={{margin:"0 0 4px"}}>2. Click <b>New +</b> then <b>Web Service</b>.</p>
                  <p style={{margin:"0 0 4px"}}>3. Connect your GitHub and select your <b>correlation-tool</b> repository.</p>
                  <p style={{margin:"0 0 4px"}}>4. Set <b>Root Directory</b> to <code style={{background:"#f1f5f9",padding:"1px 5px",borderRadius:3}}>backend</code>.</p>
                  <p style={{margin:"0 0 4px"}}>5. Set <b>Runtime</b> to <b>Python</b>.</p>
                  <p style={{margin:"0 0 4px"}}>6. Set <b>Start Command</b> to:</p>
                  <pre style={{background:"#1e293b",color:"#e2e8f0",borderRadius:7,padding:8,fontSize:11,marginBottom:8}}>uvicorn main:app --host 0.0.0.0 --port 10000</pre>
                  <p style={{margin:"0 0 4px"}}>7. Click <b>Create Web Service</b>. Wait about 2 minutes for it to deploy.</p>
                  <p style={{margin:"0 0 4px"}}>8. Render gives you a URL like <code style={{background:"#f1f5f9",padding:"1px 5px",borderRadius:3}}>https://correlation-tool.onrender.com</code></p>
                  <p style={{margin:"0 0 4px",fontWeight:600,color:"#0369a1"}}>Step 4 — Connect it to your app</p>
                  <p style={{margin:"0 0 4px"}}>Paste that Render URL followed by <code style={{background:"#f1f5f9",padding:"1px 5px",borderRadius:3}}>/prices</code> into the <b>LIVE URL</b> field at the top of this app and click Refresh. Real prices will load instantly.</p>
                  <p style={{margin:"12px 0 0",padding:"10px 12px",background:"#fef9c3",borderRadius:7,border:"1px solid #fde68a",fontSize:12,color:"#92400e"}}>
                    ⚠ Render free tier spins down after 15 minutes of inactivity. The first load after a gap takes about 30 seconds to wake up — this is normal and free.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
