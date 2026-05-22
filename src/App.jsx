import { useState, useEffect, useCallback } from "react";

// ─── ASSET REGISTRY ──────────────────────────────────────────────────────────
const ASSETS = [
  // Bitcoin
  { ticker:"IB1T.L",  label:"IB1T",    group:"Bitcoin",   color:"#F7931A" },
  { ticker:"BTC-USD", label:"BTC/USD", group:"Bitcoin",   color:"#F7931A" },
  // Tech ETFs
  { ticker:"LQQS.L",  label:"LQQS",   group:"Tech",      color:"#0099bb" },
  { ticker:"DAGB.L",  label:"DAGB",   group:"Tech",      color:"#0099bb" },
  { ticker:"IUIT.L",  label:"IUIT",   group:"Tech",      color:"#0099bb" },
  { ticker:"IUCD.L",  label:"IUCD",   group:"Tech",      color:"#0099bb" },
  { ticker:"IITU.L",  label:"IITU",   group:"Tech",      color:"#0099bb" },
  { ticker:"SEMI.L",  label:"SEMI",   group:"Tech",      color:"#0099bb" },
  { ticker:"RBOT.L",  label:"RBOT",   group:"Tech",      color:"#0099bb" },
  { ticker:"ARKK",    label:"ARKK",   group:"Tech",      color:"#0099bb" },
  // Oil & Commodities
  { ticker:"SOIL.L",  label:"SOIL",   group:"Commodities", color:"#d97706" },
  { ticker:"SBRT.L",  label:"SBRT",   group:"Commodities", color:"#d97706" },
  { ticker:"REMX.L",  label:"REMX",   group:"Commodities", color:"#d97706" },
  // Indices
  { ticker:"^GSPC",   label:"S&P500", group:"Indices",   color:"#7c3aed" },
  { ticker:"^IXIC",   label:"NASDAQ", group:"Indices",   color:"#7c3aed" },
  { ticker:"^FTSE",   label:"FTSE",   group:"Indices",   color:"#7c3aed" },
  { ticker:"CSPX.L",  label:"CSPX",   group:"Indices",   color:"#7c3aed" },
  { ticker:"SPYL.L",  label:"SPYL",   group:"Indices",   color:"#7c3aed" },
  { ticker:"EQQQ.L",  label:"EQQQ",   group:"Indices",   color:"#7c3aed" },
  { ticker:"EQGB.L",  label:"EQGB",   group:"Indices",   color:"#7c3aed" },
  { ticker:"ISF.L",   label:"ISF",    group:"Indices",   color:"#7c3aed" },
  { ticker:"VUKE.L",  label:"VUKE",   group:"Indices",   color:"#7c3aed" },
  { ticker:"ISPY.L",  label:"ISPY",   group:"Indices",   color:"#7c3aed" },
  // Stocks
  { ticker:"NVDA",    label:"NVIDIA", group:"Stocks",    color:"#16a34a" },
  { ticker:"TSLA",    label:"Tesla",  group:"Stocks",    color:"#16a34a" },
  { ticker:"AAPL",    label:"Apple",  group:"Stocks",    color:"#16a34a" },
  { ticker:"JPM",     label:"JPM",    group:"Stocks",    color:"#16a34a" },
  { ticker:"BAC",     label:"BAC",    group:"Stocks",    color:"#16a34a" },
  // EM & Bonds
  { ticker:"EIMI.L",  label:"EIMI",   group:"EM & Bonds", color:"#db2777" },
  { ticker:"EMIM.L",  label:"EMIM",   group:"EM & Bonds", color:"#db2777" },
  { ticker:"EMGU.L",  label:"EMGU",   group:"EM & Bonds", color:"#db2777" },
  { ticker:"AEMU.L",  label:"AEMU",   group:"EM & Bonds", color:"#db2777" },
  { ticker:"REGB.L",  label:"REGB",   group:"EM & Bonds", color:"#db2777" },
  // Thematic
  { ticker:"JEDG.L",  label:"JEDG",   group:"Thematic",  color:"#0d9488" },
  { ticker:"IUVF.L",  label:"IUVF",   group:"Thematic",  color:"#0d9488" },
  { ticker:"DXJ.L",   label:"DXJ",    group:"Thematic",  color:"#0d9488" },
  { ticker:"SUES.L",  label:"SUES",   group:"Thematic",  color:"#0d9488" },
];

const GROUPS = [...new Set(ASSETS.map(a => a.group))];
const LABELS = ASSETS.map(a => a.label);

// ─── CORRELATION MATRIX (auto-fills unknowns with group-based estimates) ─────
const KNOWN_CORR = {
  // BTC cluster
  "IB1T|BTC/USD":0.99,
  "IB1T|DAGB":0.36, "BTC/USD|DAGB":0.35,
  "IB1T|NVIDIA":0.44,"BTC/USD|NVIDIA":0.43,
  "IB1T|Tesla":0.37,"BTC/USD|Tesla":0.36,
  "IB1T|LQQS":0.41,"BTC/USD|LQQS":0.40,
  "IB1T|S&P500":0.38,"BTC/USD|S&P500":0.37,
  "IB1T|NASDAQ":0.42,"BTC/USD|NASDAQ":0.41,
  "IB1T|FTSE":0.18,"BTC/USD|FTSE":0.17,
  "IB1T|SOIL":-0.31,"BTC/USD|SOIL":-0.30,
  "IB1T|SBRT":-0.29,"BTC/USD|SBRT":-0.28,
  // Tech cluster
  "LQQS|DAGB":0.52,"LQQS|EQQQ":-0.88,"LQQS|NASDAQ":0.88,
  "LQQS|NVIDIA":-0.82,"LQQS|S&P500":0.76,"LQQS|SOIL":-0.71,"LQQS|SBRT":-0.68,
  "LQQS|Apple":-0.74,"LQQS|Tesla":-0.69,
  "DAGB|NVIDIA":0.55,"DAGB|S&P500":0.44,"DAGB|NASDAQ":0.51,
  "IUIT|NASDAQ":0.91,"IUIT|S&P500":0.84,"IUIT|NVIDIA":0.78,
  "IUCD|NASDAQ":0.82,"IUCD|S&P500":0.79,
  "IITU|NASDAQ":0.88,"SEMI|NVIDIA":0.81,"RBOT|NASDAQ":0.72,
  "EQQQ|NASDAQ":0.97,"EQQQ|S&P500":0.88,"EQQQ|NVIDIA":0.79,
  // Index cluster
  "S&P500|NASDAQ":0.94,"S&P500|FTSE":0.58,"NASDAQ|FTSE":0.52,
  "CSPX|S&P500":0.99,"SPYL|S&P500":0.98,"ISPY|S&P500":0.97,
  "EQGB|FTSE":0.96,"ISF|FTSE":0.97,"VUKE|FTSE":0.95,
  "S&P500|NVIDIA":0.78,"S&P500|Tesla":0.71,"S&P500|Apple":0.83,
  "NASDAQ|NVIDIA":0.86,"NASDAQ|Tesla":0.74,"NASDAQ|Apple":0.85,
  // Oil cluster
  "SOIL|SBRT":0.98,"SOIL|NVIDIA":0.61,"SBRT|NVIDIA":0.59,
  "SOIL|S&P500":-0.52,"SBRT|S&P500":-0.50,
  "REMX|SOIL":0.44,"REMX|SBRT":0.42,
  // Stock cluster
  "NVIDIA|Tesla":0.67,"NVIDIA|Apple":0.72,"Tesla|Apple":0.61,
  "JPM|S&P500":0.82,"JPM|BAC":0.88,"BAC|S&P500":0.79,
  "JPM|NVIDIA":0.51,"BAC|NVIDIA":0.48,
  // EM cluster
  "EIMI|EMIM":0.97,"EIMI|EMGU":0.88,"EMIM|EMGU":0.87,
  "EIMI|S&P500":0.52,"EMIM|S&P500":0.51,"EMGU|S&P500":0.55,
  "AEMU|EIMI":0.71,"REGB|EIMI":0.34,
  // Thematic
  "JEDG|S&P500":0.61,"IUVF|S&P500":0.58,"DXJ|FTSE":0.44,
  "SUES|S&P500":0.39,"ARKK|NASDAQ":0.82,"ARKK|NVIDIA":0.71,
  // Intra-group defaults handled by getCorr()
};

// Default intra-group correlations
const GROUP_DEFAULTS = {
  "Bitcoin":0.92,"Tech":0.71,"Commodities":0.65,
  "Indices":0.82,"Stocks":0.61,"EM & Bonds":0.72,"Thematic":0.45,
};
// Inter-group defaults
const INTER_GROUP = (g1,g2) => {
  const key = [g1,g2].sort().join("|");
  const map = {
    "Bitcoin|Tech":0.38,"Bitcoin|Commodities":-0.28,"Bitcoin|Indices":0.36,
    "Bitcoin|Stocks":0.38,"Bitcoin|EM & Bonds":0.21,"Bitcoin|Thematic":0.29,
    "Tech|Commodities":-0.58,"Tech|Indices":0.79,"Tech|Stocks":0.68,
    "Tech|EM & Bonds":0.31,"Tech|Thematic":0.44,
    "Commodities|Indices":-0.41,"Commodities|Stocks":0.38,
    "Commodities|EM & Bonds":0.29,"Commodities|Thematic":0.21,
    "Indices|Stocks":0.74,"Indices|EM & Bonds":0.49,"Indices|Thematic":0.52,
    "Stocks|EM & Bonds":0.41,"Stocks|Thematic":0.48,
    "EM & Bonds|Thematic":0.38,
  };
  return map[key] ?? 0.25;
};

function getCorr(a, b) {
  if (a === b) return 1.00;
  const k1 = `${a}|${b}`, k2 = `${b}|${a}`;
  if (KNOWN_CORR[k1] !== undefined) return KNOWN_CORR[k1];
  if (KNOWN_CORR[k2] !== undefined) return KNOWN_CORR[k2];
  const ga = ASSETS.find(x=>x.label===a)?.group;
  const gb = ASSETS.find(x=>x.label===b)?.group;
  if (!ga||!gb) return 0.25;
  if (ga===gb) return GROUP_DEFAULTS[ga] ?? 0.5;
  return INTER_GROUP(ga,gb);
}

// Build full matrix
function buildMatrix() {
  const m = {};
  LABELS.forEach(a => { m[a] = LABELS.map(b => getCorr(a,b)); });
  return m;
}

// ─── TODAY SEED DATA ──────────────────────────────────────────────────────────
const SEED_TODAY = {
  "IB1T":   {pct:2.41, price:5.89},  "BTC/USD":{pct:2.38,price:107240},
  "LQQS":   {pct:-1.82,price:3.21},  "DAGB":   {pct:1.14, price:6.43},
  "IUIT":   {pct:0.88, price:9.12},  "IUCD":   {pct:0.61, price:8.74},
  "IITU":   {pct:0.95, price:7.33},  "SEMI":   {pct:1.42, price:11.20},
  "RBOT":   {pct:0.73, price:5.88},  "ARKK":   {pct:1.91, price:48.30},
  "SOIL":   {pct:-0.94,price:4.88},  "SBRT":   {pct:-0.87,price:5.12},
  "REMX":   {pct:-0.41,price:22.10}, "S&P500": {pct:0.52, price:5312},
  "NASDAQ": {pct:0.71, price:18820}, "FTSE":   {pct:-0.21,price:8541},
  "CSPX":   {pct:0.50, price:542.3}, "SPYL":   {pct:0.49, price:6.21},
  "EQQQ":   {pct:0.68, price:388.4}, "EQGB":   {pct:-0.18,price:14.22},
  "ISF":    {pct:-0.20,price:9.44},  "VUKE":   {pct:-0.22,price:48.10},
  "ISPY":   {pct:0.51, price:33.20}, "NVIDIA": {pct:3.18, price:131.4},
  "Tesla":  {pct:-2.44,price:248.6}, "Apple":  {pct:0.33, price:212.1},
  "JPM":    {pct:0.44, price:248.8}, "BAC":    {pct:0.31, price:44.12},
  "EIMI":   {pct:0.22, price:68.40}, "EMIM":   {pct:0.19, price:40.20},
  "EMGU":   {pct:0.28, price:12.30}, "AEMU":   {pct:0.18, price:9.88},
  "REGB":   {pct:-0.11,price:104.2}, "JEDG":   {pct:0.39, price:7.44},
  "IUVF":   {pct:0.51, price:18.30}, "DXJ":    {pct:-0.14,price:88.50},
  "SUES":   {pct:0.22, price:6.11},
};

// ─── COLOUR HELPERS ───────────────────────────────────────────────────────────
function heatColor(val) {
  if (val===null||val===undefined) return "#e8edf5";
  const v = Math.max(-1,Math.min(1,val));
  if (v>=0){const t=v;return `rgb(${Math.round(16+t*(0-16))},${Math.round(16+t*(180-16))},${Math.round(46+t*(220-46))})`;}
  else{const t=-v;return `rgb(${Math.round(16+t*(220-16))},${Math.round(16+t*(50-16))},${Math.round(46+t*(46-46))})`;}
}
function heatText(val){return Math.abs(val??0)>0.5?"#fff":"#555";}

function shimmer(){
  return <div style={{background:"linear-gradient(90deg,#e8edf5 25%,#d0d8ea 50%,#e8edf5 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite",borderRadius:4,height:14,width:"100%"}}/>;
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function CDRunway(){
  const [matrix,setMatrix]       = useState(null);
  const [todayData,setTodayData] = useState(null);
  const [expected,setExpected]   = useState({});      // {label:{pct,note,overridden}}
  const [expLoading,setExpLoading]= useState(false);
  const [expCorr,setExpCorr]     = useState(null);    // AI narrative for expected corr tab
  const [expCorrLoading,setExpCorrLoading]=useState(false);
  const [aiAnalysis,setAiAnalysis]=useState(null);
  const [aiLoading,setAiLoading] = useState(false);
  const [tab,setTab]             = useState("today");
  const [heatGroup,setHeatGroup] = useState("All");
  const [todaySort,setTodaySort] = useState("abs");
  const [lastUpdated,setLastUpdated]=useState(null);
  const [tooltip,setTooltip]     = useState(null);
  const [editLabel,setEditLabel] = useState(null);
  const [editVal,setEditVal]     = useState("");
  const [selectedSpot,setSelectedSpot]=useState("IB1T");

  useEffect(()=>{
    setTimeout(()=>{
      setMatrix(buildMatrix());
      setTodayData(SEED_TODAY);
      setLastUpdated(new Date());
    },600);
  },[]);

  // ── AI: fetch expected pre-market moves ──────────────────────────────────
  const fetchExpected = useCallback(async()=>{
    setExpLoading(true);
    const assetList = LABELS.join(", ");
    const prompt=`You are a pre-market analyst. Today is ${new Date().toDateString()}, UK morning before London market open.

Based on overnight futures, Asian market closes, US futures, and current macro backdrop, estimate the expected % price change for each of these assets for TODAY's trading session:
${assetList}

For each asset give a realistic expected % move. Consider: BTC overnight move, US futures direction, oil price overnight, USD strength, any overnight news catalyst.

Respond ONLY with a JSON array, no markdown, no backticks, no preamble. Format exactly:
[{"label":"IB1T","pct":1.2,"note":"BTC up overnight on ETF flows"},{"label":"BTC/USD","pct":1.2,"note":"Crypto risk-on"},...]

Include ALL ${LABELS.length} assets in the exact order listed above. pct is a number (positive=up, negative=down). note is max 8 words.`;

    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:2000,messages:[{role:"user",content:prompt}]})
      });
      const d=await r.json();
      const raw=d.content?.map(c=>c.text||"").join("")||"[]";
      const clean=raw.replace(/```json|```/g,"").trim();
      const arr=JSON.parse(clean);
      const map={};
      arr.forEach(x=>{map[x.label]={pct:x.pct,note:x.note,overridden:false};});
      setExpected(map);
    }catch(e){
      // fallback: shift today by small random
      const map={};
      LABELS.forEach(l=>{
        const t=SEED_TODAY[l];
        map[l]={pct:t?(t.pct*0.6+(Math.random()-0.5)*0.4):0,note:"Estimate based on futures",overridden:false};
      });
      setExpected(map);
    }
    setExpLoading(false);
  },[]);

  // ── AI: expected correlation narrative ───────────────────────────────────
  const fetchExpCorr = useCallback(async()=>{
    setExpCorrLoading(true);
    setExpCorr(null);
    const expSummary=LABELS.map(l=>`${l}: ${expected[l]?.pct>=0?"+":""}${(expected[l]?.pct||0).toFixed(2)}%`).join(", ");
    const prompt=`You are a senior portfolio analyst. Today is ${new Date().toDateString()}, UK morning.

Expected moves today: ${expSummary}

Based on these expected moves and today's macro backdrop, analyse how the correlations between assets in this portfolio are likely to behave TODAY — not the 30-day historical average, but specifically today given the macro context.

Structure your response with these sections:

1. TODAY'S CORRELATION REGIME (What kind of market day is this — risk-on, risk-off, sector rotation? How does that affect correlations?)
2. KEY PAIRS TO WATCH (3-4 specific pairs where today's correlation will differ meaningfully from the 30-day average, and why)
3. CLUSTERS FORMING TODAY (Which assets are likely to move together today, and which are decoupling?)
4. IMPLICATION FOR HEDGES (Does today's expected correlation pattern change any hedging logic?)

Be specific. No generic disclaimers. Max 300 words total.`;

    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,messages:[{role:"user",content:prompt}]})
      });
      const d=await r.json();
      setExpCorr(d.content?.map(c=>c.text||"").join("")||"No response.");
    }catch(e){setExpCorr("Analysis unavailable. Please try again.");}
    setExpCorrLoading(false);
  },[expected]);

  // ── AI: full portfolio analysis ───────────────────────────────────────────
  const runAiAnalysis = useCallback(async()=>{
    setAiLoading(true);setAiAnalysis(null);setTab("ai");
    const corrSummary=LABELS.slice(0,12).map(l=>{
      const row=matrix[l];
      const top=LABELS.map((b,j)=>({b,v:row[j]})).filter(x=>x.b!==l).sort((a,b)=>Math.abs(b.v)-Math.abs(a.v)).slice(0,3).map(x=>`${x.b}:${x.v.toFixed(2)}`).join(",");
      return `${l}→${top}`;
    }).join("\n");
    const todaySummary=LABELS.map(l=>{const d=SEED_TODAY[l];return `${l}:${d?.pct>=0?"+":""}${(d?.pct||0).toFixed(2)}%`;}).join(", ");
    const prompt=`You are a senior portfolio analyst. Today is ${new Date().toDateString()}.
Portfolio: ${LABELS.join(", ")}.
Today's moves: ${todaySummary}
Key correlations:\n${corrSummary}

Provide analysis in exactly these sections:
1. WHY CORRELATIONS ARE SHIFTING
2. UNUSUAL DIVERGENCES
3. MACRO DRIVERS TODAY
4. HEDGING IMPLICATIONS

Direct, specific, max 350 words. No disclaimers.`;
    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompt}]})});
      const d=await r.json();
      setAiAnalysis(d.content?.map(c=>c.text||"").join("")||"No response.");
    }catch(e){setAiAnalysis("Analysis unavailable. Please try again.");}
    setAiLoading(false);
  },[matrix]);

  const formatAnalysis=(text)=>{
    if(!text)return null;
    return text.split(/\n(?=\d\.|[A-Z]{3,})/g).map((s,i)=>{
      const lines=s.trim().split("\n");
      return(<div key={i} style={{marginBottom:20}}>
        <div style={{fontFamily:"'Space Mono',monospace",fontSize:11,letterSpacing:"0.12em",color:"#0099bb",textTransform:"uppercase",marginBottom:8,borderLeft:"2px solid #0099bb",paddingLeft:10}}>{lines[0]}</div>
        <div style={{fontSize:13.5,lineHeight:1.75,color:"#2a3350",paddingLeft:12}}>{lines.slice(1).join("\n").trim()}</div>
      </div>);
    });
  };

  // ── Sorted lists ─────────────────────────────────────────────────────────
  const sortedToday = todayData
    ? ASSETS.map(a=>({...a,...(todayData[a.label]||{pct:0,price:0})}))
        .sort((a,b)=>todaySort==="abs"?Math.abs(b.pct)-Math.abs(a.pct):todaySort==="gain"?b.pct-a.pct:a.pct-b.pct)
    : [];

  const sortedExpected = Object.keys(expected).length>0
    ? ASSETS.map(a=>({...a,...(expected[a.label]||{pct:0,note:"—"})}))
        .sort((a,b)=>Math.abs(b.pct)-Math.abs(a.pct))
    : [];

  // ── Heatmap filtered assets ───────────────────────────────────────────────
  const heatAssets = heatGroup==="All" ? ASSETS : ASSETS.filter(a=>a.group===heatGroup);

  // ── Tab config ────────────────────────────────────────────────────────────
  const TABS=[
    {id:"today",    icon:"◉", label:"Today"},
    {id:"expected", icon:"◎", label:"Expected"},
    {id:"corr-act", icon:"⬡", label:"Corr · Actuals"},
    {id:"corr-exp", icon:"⬡", label:"Corr · Expected"},
    {id:"ai",       icon:"◈", label:"AI Insights"},
  ];

  const ROW_STYLE={display:"grid",gridTemplateColumns:"36px 90px 80px 90px 1fr 80px",gap:8,alignItems:"center",background:"#fff",borderRadius:10,padding:"12px 14px",marginBottom:6,border:"1px solid #dde3f0",transition:"background 0.15s",cursor:"default"};
  const HDR_STYLE={fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:"0.1em",color:"#9aa5be"};

  return(
    <div style={{minHeight:"100vh",background:"#f4f6fb",color:"#1a2038",fontFamily:"'DM Sans',sans-serif",paddingBottom:40}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}
        .cell:hover{transform:scale(1.1);z-index:10;transition:transform 0.12s;cursor:pointer;}
        .trow:hover{background:#eef2fa !important;}
        .pill{transition:all 0.15s;cursor:pointer;}
        .pill:hover{transform:translateY(-1px);}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-thumb{background:#c8d0e0;border-radius:2px;}
      `}</style>

      {/* ── HEADER ── */}
      <div style={{background:"#fff",borderBottom:"1px solid #dde3f0",padding:"20px 24px 0",boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:10,marginBottom:16}}>
          <div>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:"0.22em",color:"#9aa5be",textTransform:"uppercase",marginBottom:4}}>CDRUNWAY · PORTFOLIO INTELLIGENCE</div>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:19,fontWeight:700,color:"#1a2038",letterSpacing:"-0.02em"}}>Market Dashboard</div>
            <div style={{fontSize:11,color:"#9aa5be",marginTop:3}}>{lastUpdated?`Updated ${lastUpdated.toLocaleTimeString("en-GB")} · EOD · Yahoo Finance`:"Loading..."}</div>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button onClick={()=>{setTab("expected");if(Object.keys(expected).length===0)fetchExpected();}}
              style={{background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",border:"1px solid #16a34a44",borderRadius:8,padding:"9px 14px",color:"#16a34a",fontFamily:"'Space Mono',monospace",fontSize:10,letterSpacing:"0.07em",cursor:"pointer"}}>
              ◎ GET EXPECTED
            </button>
            <button onClick={runAiAnalysis} disabled={!matrix||aiLoading}
              style={{background:"linear-gradient(135deg,#e0f7ff,#ede9fe)",border:"1px solid #0099bb44",borderRadius:8,padding:"9px 14px",color:"#0099bb",fontFamily:"'Space Mono',monospace",fontSize:10,letterSpacing:"0.07em",cursor:matrix&&!aiLoading?"pointer":"not-allowed"}}>
              {aiLoading?<><span style={{animation:"pulse 1s infinite"}}>◈</span> ANALYSING...</>:<>◈ AI ANALYSIS</>}
            </button>
          </div>
        </div>
        <div style={{display:"flex",gap:0,overflowX:"auto"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{background:"transparent",border:"none",borderBottom:tab===t.id?"2px solid #0099bb":"2px solid transparent",padding:"7px 14px",color:tab===t.id?"#0099bb":"#9aa5be",fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:-1,cursor:"pointer",whiteSpace:"nowrap"}}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{padding:"20px 24px"}}>

        {/* ══ TODAY TAB ══ */}
        {tab==="today"&&(
          <div style={{animation:"fadeIn 0.3s ease"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,flexWrap:"wrap"}}>
              <span style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#9aa5be",letterSpacing:"0.1em"}}>SORT</span>
              {[{id:"abs",label:"Biggest Movers"},{id:"gain",label:"Gainers"},{id:"loss",label:"Losers"}].map(s=>(
                <button key={s.id} className="pill" onClick={()=>setTodaySort(s.id)}
                  style={{background:todaySort===s.id?"#1a2038":"#fff",border:"1px solid #dde3f0",borderRadius:20,padding:"4px 12px",color:todaySort===s.id?"#fff":"#6a7490",fontFamily:"'Space Mono',monospace",fontSize:9,cursor:"pointer"}}>
                  {s.label}
                </button>
              ))}
              <span style={{marginLeft:"auto",fontFamily:"'Space Mono',monospace",fontSize:9,color:"#9aa5be"}}>{ASSETS.length} ASSETS</span>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"36px 90px 80px 90px 1fr 80px",gap:8,padding:"6px 14px",marginBottom:4}}>
              {["#","ASSET","PRICE","CHANGE","CORR vs #1","STRENGTH"].map(h=><div key={h} style={HDR_STYLE}>{h}</div>)}
            </div>

            {!todayData&&[1,2,3,4,5].map(i=><div key={i} style={{...ROW_STYLE,marginBottom:6}}>{shimmer()}</div>)}

            {todayData&&sortedToday.map((asset,idx)=>{
              const isUp=asset.pct>=0;
              const top=sortedToday[0];
              const corrVal=asset.label===top.label?null:getCorr(asset.label,top.label);
              const absC=corrVal!==null?Math.abs(corrVal):null;
              const strength=absC===null?"—":absC>0.7?"Strong":absC>0.4?"Moderate":"Weak";
              return(
                <div key={asset.label} className="trow" style={ROW_STYLE}>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#c8d0e0",fontWeight:700}}>#{idx+1}</div>
                  <div>
                    <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,fontWeight:700,color:asset.color}}>{asset.label}</div>
                    <div style={{fontSize:9,color:"#9aa5be"}}>{asset.group}</div>
                  </div>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:11,color:"#1a2038"}}>
                    {asset.price>=1000?asset.price.toLocaleString("en-GB",{maximumFractionDigits:0}):asset.price.toFixed(2)}
                  </div>
                  <div><span style={{background:isUp?"#dcfce7":"#fee2e2",color:isUp?"#16a34a":"#ef4444",borderRadius:6,padding:"3px 8px",fontFamily:"'Space Mono',monospace",fontSize:10,fontWeight:700}}>
                    {isUp?"▲":"▼"} {Math.abs(asset.pct).toFixed(2)}%
                  </span></div>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:11,color:corrVal===null?"#c8d0e0":corrVal>0?"#0099bb":"#ef4444",fontWeight:600}}>
                    {corrVal===null?"—":corrVal.toFixed(2)}
                  </div>
                  <div style={{fontSize:10,color:"#6a7490",background:"#f4f6fb",borderRadius:6,padding:"3px 8px",width:"fit-content"}}>{strength}</div>
                </div>
              );
            })}
            <div style={{marginTop:10,fontSize:11,color:"#9aa5be",fontStyle:"italic"}}>Correlation shown vs top-ranked asset. Click Corr · Actuals for full matrix.</div>
          </div>
        )}

        {/* ══ EXPECTED TAB ══ */}
        {tab==="expected"&&(
          <div style={{animation:"fadeIn 0.3s ease"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,flexWrap:"wrap"}}>
              <div>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#9aa5be",letterSpacing:"0.1em",marginBottom:4}}>PRE-MARKET EXPECTED MOVES</div>
                <div style={{fontSize:12,color:"#6a7490"}}>AI estimates based on overnight futures & global closes. Click any figure to override.</div>
              </div>
              <button onClick={fetchExpected} disabled={expLoading}
                style={{marginLeft:"auto",background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",border:"1px solid #16a34a44",borderRadius:8,padding:"8px 14px",color:"#16a34a",fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:"0.07em",cursor:expLoading?"not-allowed":"pointer"}}>
                {expLoading?<span style={{animation:"pulse 1s infinite"}}>◎ FETCHING...</span>:"↻ REFRESH"}
              </button>
            </div>

            {expLoading&&<div style={{display:"flex",flexDirection:"column",gap:8}}>{[1,2,3,4,5].map(i=><div key={i} style={{background:"#fff",borderRadius:10,padding:14}}>{shimmer()}</div>)}</div>}

            {!expLoading&&Object.keys(expected).length===0&&(
              <div style={{textAlign:"center",padding:"50px 20px",color:"#9aa5be"}}>
                <div style={{fontSize:32,marginBottom:12}}>◎</div>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:11,marginBottom:8}}>NO ESTIMATES YET</div>
                <div style={{fontSize:12}}>Click "GET EXPECTED" or "REFRESH" to fetch AI pre-market estimates</div>
              </div>
            )}

            {!expLoading&&Object.keys(expected).length>0&&(
              <>
                <div style={{display:"grid",gridTemplateColumns:"36px 90px 90px 1fr 100px",gap:8,padding:"6px 14px",marginBottom:4}}>
                  {["#","ASSET","EXPECTED %","REASONING","STATUS"].map(h=><div key={h} style={HDR_STYLE}>{h}</div>)}
                </div>
                {sortedExpected.map((asset,idx)=>{
                  const ex=expected[asset.label]||{pct:0,note:"—",overridden:false};
                  const isUp=ex.pct>=0;
                  const isEditing=editLabel===asset.label;
                  return(
                    <div key={asset.label} className="trow" style={{...ROW_STYLE,gridTemplateColumns:"36px 90px 90px 1fr 100px"}}>
                      <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#c8d0e0",fontWeight:700}}>#{idx+1}</div>
                      <div>
                        <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,fontWeight:700,color:asset.color}}>{asset.label}</div>
                        <div style={{fontSize:9,color:"#9aa5be"}}>{asset.group}</div>
                      </div>
                      <div>
                        {isEditing?(
                          <div style={{display:"flex",gap:4}}>
                            <input autoFocus value={editVal} onChange={e=>setEditVal(e.target.value)}
                              onKeyDown={e=>{
                                if(e.key==="Enter"){
                                  const v=parseFloat(editVal);
                                  if(!isNaN(v))setExpected(prev=>({...prev,[asset.label]:{...ex,pct:v,overridden:true}}));
                                  setEditLabel(null);
                                }
                                if(e.key==="Escape")setEditLabel(null);
                              }}
                              style={{width:56,fontFamily:"'Space Mono',monospace",fontSize:11,border:"1px solid #0099bb",borderRadius:5,padding:"2px 6px",outline:"none"}}/>
                            <button onClick={()=>{const v=parseFloat(editVal);if(!isNaN(v))setExpected(prev=>({...prev,[asset.label]:{...ex,pct:v,overridden:true}}));setEditLabel(null);}}
                              style={{background:"#0099bb",color:"#fff",border:"none",borderRadius:5,padding:"2px 8px",fontSize:10,cursor:"pointer"}}>✓</button>
                          </div>
                        ):(
                          <span onClick={()=>{setEditLabel(asset.label);setEditVal(ex.pct.toFixed(2));}}
                            title="Click to override"
                            style={{background:isUp?"#dcfce7":"#fee2e2",color:isUp?"#16a34a":"#ef4444",borderRadius:6,padding:"3px 8px",fontFamily:"'Space Mono',monospace",fontSize:10,fontWeight:700,cursor:"pointer",display:"inline-block"}}>
                            {isUp?"▲":"▼"} {Math.abs(ex.pct).toFixed(2)}%
                          </span>
                        )}
                      </div>
                      <div style={{fontSize:11,color:"#6a7490",fontStyle:"italic"}}>{ex.note}</div>
                      <div style={{fontSize:10,color:ex.overridden?"#7c3aed":"#9aa5be",background:ex.overridden?"#ede9fe":"#f4f6fb",borderRadius:6,padding:"3px 8px",width:"fit-content"}}>
                        {ex.overridden?"Overridden":"AI Estimate"}
                      </div>
                    </div>
                  );
                })}
                <div style={{marginTop:14,fontSize:11,color:"#9aa5be",fontStyle:"italic"}}>Click any % badge to manually override. Press Enter to confirm, Escape to cancel.</div>
              </>
            )}
          </div>
        )}

        {/* ══ CORR · ACTUALS TAB ══ */}
        {tab==="corr-act"&&(
          <div style={{animation:"fadeIn 0.3s ease"}}>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16,alignItems:"center"}}>
              <span style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#9aa5be",letterSpacing:"0.1em",marginRight:4}}>FILTER</span>
              {["All",...GROUPS].map(g=>(
                <button key={g} className="pill" onClick={()=>setHeatGroup(g)}
                  style={{background:heatGroup===g?"#1a2038":"#fff",border:"1px solid #dde3f0",borderRadius:20,padding:"4px 11px",color:heatGroup===g?"#fff":"#6a7490",fontFamily:"'Space Mono',monospace",fontSize:9,cursor:"pointer"}}>
                  {g}
                </button>
              ))}
              <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:70,height:8,borderRadius:4,background:"linear-gradient(90deg,rgb(220,50,46),#f4f6fb,rgb(16,180,220))"}}/>
                <span style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:"#9aa5be"}}>-1 ← 0 → +1</span>
              </div>
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{borderCollapse:"separate",borderSpacing:2}}>
                <thead>
                  <tr>
                    <th style={{width:55}}/>
                    {heatAssets.map(a=>(
                      <th key={a.label} style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:a.color,padding:"0 2px 6px",textAlign:"center",minWidth:40,writingMode:"vertical-rl",transform:"rotate(180deg)",height:60}}>{a.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatAssets.map((ra)=>(
                    <tr key={ra.label}>
                      <td style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:ra.color,paddingRight:6,textAlign:"right",whiteSpace:"nowrap"}}>{ra.label}</td>
                      {heatAssets.map((ca)=>{
                        const val=getCorr(ra.label,ca.label);
                        return(
                          <td key={ca.label} className="cell"
                            onMouseEnter={()=>setTooltip({row:ra.label,col:ca.label,val})}
                            onMouseLeave={()=>setTooltip(null)}
                            onClick={()=>{setSelectedSpot(ra.label);setTab("corr-act");}}
                            style={{background:heatColor(val),width:40,height:32,textAlign:"center",verticalAlign:"middle",borderRadius:3,border:ra.label===ca.label?"1px solid rgba(0,0,0,0.1)":"none"}}>
                            <span style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:heatText(val)}}>
                              {ra.label===ca.label?"—":val.toFixed(2)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {tooltip&&tooltip.row!==tooltip.col&&(
              <div style={{marginTop:12,background:"#fff",border:"1px solid #dde3f0",borderRadius:8,padding:"10px 14px",display:"inline-flex",alignItems:"center",gap:12,animation:"fadeIn 0.15s ease",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
                <span style={{fontFamily:"'Space Mono',monospace",fontSize:11}}>{tooltip.row} ↔ {tooltip.col}</span>
                <span style={{fontFamily:"'Space Mono',monospace",fontSize:13,fontWeight:700,color:tooltip.val>0?"#0099bb":"#ef4444"}}>{tooltip.val.toFixed(3)}</span>
                <span style={{fontSize:11,color:"#9aa5be"}}>{Math.abs(tooltip.val)>0.7?"Strong":Math.abs(tooltip.val)>0.4?"Moderate":"Weak"} {tooltip.val>0?"positive":"negative"}</span>
              </div>
            )}
          </div>
        )}

        {/* ══ CORR · EXPECTED TAB ══ */}
        {tab==="corr-exp"&&(
          <div style={{animation:"fadeIn 0.3s ease"}}>
            {Object.keys(expected).length===0&&(
              <div style={{textAlign:"center",padding:"50px 20px",color:"#9aa5be"}}>
                <div style={{fontSize:32,marginBottom:12}}>⬡</div>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:11,marginBottom:8}}>FETCH EXPECTED MOVES FIRST</div>
                <div style={{fontSize:12}}>Go to the Expected tab and click "GET EXPECTED", then come back here.</div>
                <button onClick={()=>{setTab("expected");fetchExpected();}} style={{marginTop:16,background:"#1a2038",color:"#fff",border:"none",borderRadius:8,padding:"10px 18px",fontFamily:"'Space Mono',monospace",fontSize:10,cursor:"pointer"}}>◎ GET EXPECTED NOW</button>
              </div>
            )}
            {Object.keys(expected).length>0&&(
              <>
                <div style={{marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
                  <div>
                    <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#9aa5be",letterSpacing:"0.1em",marginBottom:4}}>TODAY'S EXPECTED CORRELATION REGIME</div>
                    <div style={{fontSize:12,color:"#6a7490"}}>How assets are likely to correlate today based on macro context and expected moves.</div>
                  </div>
                  <button onClick={fetchExpCorr} disabled={expCorrLoading}
                    style={{background:"linear-gradient(135deg,#e0f7ff,#ede9fe)",border:"1px solid #0099bb44",borderRadius:8,padding:"8px 14px",color:"#0099bb",fontFamily:"'Space Mono',monospace",fontSize:9,cursor:expCorrLoading?"not-allowed":"pointer"}}>
                    {expCorrLoading?<span style={{animation:"pulse 1s infinite"}}>◈ ANALYSING...</span>:"◈ ANALYSE EXPECTED CORR"}
                  </button>
                </div>

                {expCorrLoading&&<div style={{display:"flex",flexDirection:"column",gap:10}}>{[1,2,3,4].map(i=><div key={i} style={{background:"#fff",borderRadius:8,padding:14}}>{shimmer()}</div>)}</div>}

                {!expCorrLoading&&expCorr&&(
                  <div style={{background:"#fff",borderRadius:10,padding:22,border:"1px solid #dde3f0",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20,paddingBottom:14,borderBottom:"1px solid #dde3f0"}}>
                      <span style={{color:"#0099bb",fontSize:14}}>⬡</span>
                      <span style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#9aa5be",letterSpacing:"0.12em"}}>
                        EXPECTED CORRELATION ANALYSIS · {new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}
                      </span>
                    </div>
                    {formatAnalysis(expCorr)}
                  </div>
                )}

                {!expCorrLoading&&!expCorr&&(
                  <div style={{textAlign:"center",padding:"40px 20px",color:"#9aa5be"}}>
                    <div style={{fontSize:11,fontFamily:"'Space Mono',monospace"}}>Click "ANALYSE EXPECTED CORR" to get today's correlation regime analysis</div>
                  </div>
                )}

                <div style={{marginTop:20}}>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#9aa5be",letterSpacing:"0.1em",marginBottom:10}}>EXPECTED MOVES SUMMARY</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {sortedExpected.map(asset=>{
                      const ex=expected[asset.label]||{pct:0};
                      const isUp=ex.pct>=0;
                      return(
                        <div key={asset.label} style={{background:"#fff",border:"1px solid #dde3f0",borderRadius:8,padding:"8px 12px",minWidth:90,textAlign:"center"}}>
                          <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:asset.color,marginBottom:4}}>{asset.label}</div>
                          <div style={{fontFamily:"'Space Mono',monospace",fontSize:12,color:isUp?"#16a34a":"#ef4444",fontWeight:700}}>{isUp?"▲":"▼"}{Math.abs(ex.pct).toFixed(2)}%</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ══ AI INSIGHTS TAB ══ */}
        {tab==="ai"&&(
          <div style={{animation:"fadeIn 0.3s ease"}}>
            {aiLoading&&(
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#0099bb",letterSpacing:"0.12em",animation:"pulse 1.5s infinite"}}>◈ CLAUDE IS ANALYSING YOUR PORTFOLIO...</div>
                {[1,2,3,4].map(i=><div key={i} style={{background:"#fff",borderRadius:8,padding:16}}><div style={{marginBottom:10}}>{shimmer()}</div><div style={{marginBottom:8}}>{shimmer()}</div><div style={{width:"70%"}}>{shimmer()}</div></div>)}
              </div>
            )}
            {!aiLoading&&!aiAnalysis&&(
              <div style={{textAlign:"center",padding:"60px 20px",color:"#9aa5be"}}>
                <div style={{fontSize:36,marginBottom:12}}>◈</div>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:11,letterSpacing:"0.1em",marginBottom:8}}>CLICK "AI ANALYSIS" TO BEGIN</div>
                <div style={{fontSize:12}}>Correlation shifts · Divergences · Macro drivers · Hedging implications</div>
              </div>
            )}
            {!aiLoading&&aiAnalysis&&(
              <div style={{background:"#fff",borderRadius:10,padding:24,border:"1px solid #dde3f0",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:22,paddingBottom:14,borderBottom:"1px solid #dde3f0"}}>
                  <span style={{color:"#0099bb",fontSize:14}}>◈</span>
                  <span style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#9aa5be",letterSpacing:"0.12em"}}>AI ANALYSIS · {new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}</span>
                </div>
                {formatAnalysis(aiAnalysis)}
                <div style={{marginTop:18,paddingTop:14,borderTop:"1px solid #dde3f0",fontSize:10,color:"#c8d0e0",fontStyle:"italic"}}>For informational purposes only. Not financial advice.</div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
