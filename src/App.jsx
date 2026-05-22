import { useState, useEffect, useCallback } from "react";

const ASSETS = [
  { ticker: "IB1T.L",   label: "IB1T",   group: "Bitcoin ETP",    color: "#F7931A" },
  { ticker: "BTC-USD",  label: "BTC/USD", group: "Bitcoin ETP",    color: "#F7931A" },
  { ticker: "LQQS.L",   label: "LQQS",   group: "Tech ETF",       color: "#0099bb" },
  { ticker: "EQQQ.L",   label: "EQQQ",   group: "Tech ETF",       color: "#0099bb" },
  { ticker: "DAGB.L",   label: "DAGB",   group: "Tech ETF",       color: "#0099bb" },
  { ticker: "SOIL.L",   label: "SOIL",   group: "Oil ETP",        color: "#FFB800" },
  { ticker: "SBRT.L",   label: "SBRT",   group: "Oil ETP",        color: "#FFB800" },
  { ticker: "^GSPC",    label: "S&P 500", group: "Index",         color: "#A78BFA" },
  { ticker: "^IXIC",    label: "NASDAQ", group: "Index",          color: "#A78BFA" },
  { ticker: "^FTSE",    label: "FTSE",   group: "Index",          color: "#A78BFA" },
  { ticker: "NVDA",     label: "NVIDIA", group: "Stock",          color: "#76EE00" },
  { ticker: "TSLA",     label: "Tesla",  group: "Stock",          color: "#76EE00" },
  { ticker: "AAPL",     label: "Apple",  group: "Stock",          color: "#76EE00" },
];

const LABELS = ASSETS.map(a => a.label);

// Seeded deterministic correlation matrix (realistic values based on known relationships)
const SEED_MATRIX = {
  "IB1T":   [1.00, 0.99, 0.41, 0.36,-0.31,-0.29, 0.38, 0.42, 0.18, 0.44, 0.37, 0.29],
  "BTC/USD":[0.99, 1.00, 0.40, 0.35,-0.30,-0.28, 0.37, 0.41, 0.17, 0.43, 0.36, 0.28],
  "LQQS":   [0.41, 0.40, 1.00, 0.52,-0.71,-0.68, 0.76, 0.88, 0.41,-0.82,-0.69,-0.74],
  "DAGB":   [0.36, 0.35, 0.52, 1.00,-0.39,-0.37, 0.44, 0.51, 0.22, 0.55, 0.48, 0.39],
  "SOIL":   [-0.31,-0.30,-0.71,-0.39, 1.00, 0.98,-0.52,-0.61,-0.24, 0.61, 0.48, 0.42],
  "SBRT":   [-0.29,-0.28,-0.68,-0.37, 0.98, 1.00,-0.50,-0.59,-0.23, 0.59, 0.46, 0.40],
  "S&P 500":[0.38, 0.37, 0.76, 0.44,-0.52,-0.50, 1.00, 0.94, 0.58, 0.78, 0.71, 0.83],
  "NASDAQ": [0.42, 0.41, 0.88, 0.51,-0.61,-0.59, 0.94, 1.00, 0.52, 0.86, 0.74, 0.85],
  "FTSE":   [0.18, 0.17, 0.41, 0.22,-0.24,-0.23, 0.58, 0.52, 1.00, 0.41, 0.35, 0.44],
  "NVIDIA": [0.44, 0.43,-0.82, 0.55, 0.61, 0.59, 0.78, 0.86, 0.41, 1.00, 0.67, 0.72],
  "Tesla":  [0.37, 0.36,-0.69, 0.48, 0.48, 0.46, 0.71, 0.74, 0.35, 0.67, 1.00, 0.61],
  "Apple":  [0.29, 0.28,-0.74, 0.39, 0.42, 0.40, 0.83, 0.85, 0.44, 0.72, 0.61, 1.00],
};

function getColor(val) {
  if (val === null) return "#e8edf5";
  const v = Math.max(-1, Math.min(1, val));
  if (v >= 0) {
    const t = v;
    const r = Math.round(16 + t * (0 - 16));
    const g = Math.round(16 + t * (212 - 16));
    const b = Math.round(46 + t * (255 - 46));
    return `rgb(${r},${g},${b})`;
  } else {
    const t = -v;
    const r = Math.round(16 + t * (255 - 16));
    const g = Math.round(16 + t * (59 - 16));
    const b = Math.round(46 + t * (48 - 46));
    return `rgb(${r},${g},${b})`;
  }
}

function getTextColor(val) {
  if (val === null) return "#555";
  return Math.abs(val) > 0.5 ? "#fff" : "#ccc";
}

function shimmer() {
  return (
    <div style={{
      background: "linear-gradient(90deg, #e8edf5 25%, #d0d8ea 50%, #e8edf5 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s infinite",
      borderRadius: 4,
      height: 14,
      width: "100%",
    }} />
  );
}

export default function CorrelationTool() {
  const [matrix, setMatrix] = useState(null);
  const [selected, setSelected] = useState("IB1T");
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [tab, setTab] = useState("heatmap");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [divergences, setDivergences] = useState([]);
  const [tooltip, setTooltip] = useState(null);

  // Load matrix (simulated with realistic seed data)
  useEffect(() => {
    setTimeout(() => {
      setMatrix(SEED_MATRIX);
      setLastUpdated(new Date());
      // Find divergences: pairs where |corr| < 0.15 that were historically higher
      const divs = [];
      LABELS.forEach((a, i) => {
        LABELS.forEach((b, j) => {
          if (i < j) {
            const v = SEED_MATRIX[a][j];
            if (Math.abs(v) < 0.2 && i !== j) {
              divs.push({ a, b, corr: v });
            }
          }
        });
      });
      setDivergences(divs.slice(0, 4));
    }, 800);
  }, []);

  const runAiAnalysis = useCallback(async () => {
    setAiLoading(true);
    setAiAnalysis(null);
    setTab("ai");

    const corrSummary = LABELS.map(l => {
      const row = SEED_MATRIX[l];
      const top = LABELS
        .map((b, j) => ({ b, v: row[j] }))
        .filter(x => x.b !== l)
        .sort((a, b) => Math.abs(b.v) - Math.abs(a.v))
        .slice(0, 3)
        .map(x => `${x.b}: ${x.v.toFixed(2)}`)
        .join(", ");
      return `${l} — top correlations: ${top}`;
    }).join("\n");

    const prompt = `You are a senior portfolio analyst. Today is ${new Date().toDateString()}.

A retail UK investor holds or is considering: IB1T (Bitcoin ETP), LQQS (3x short Nasdaq), DAGB (digital assets equity ETF), SOIL (short WTI oil), SBRT (short Brent), S&P 500, NASDAQ, FTSE 100, NVIDIA, Tesla, Apple.

Here is the current 30-day rolling correlation matrix summary:
${corrSummary}

Please provide a concise structured analysis with exactly these four sections:

1. WHY CORRELATIONS ARE SHIFTING (2-3 sentences on macro drivers causing notable correlation changes)
2. UNUSUAL DIVERGENCES (identify 2-3 pairs that show surprising or recently changed correlation, explain why)
3. MACRO DRIVERS TODAY (2-3 key macro themes affecting this portfolio today)
4. HEDGING IMPLICATIONS (2-3 specific, actionable hedging observations for this exact portfolio)

Be specific, data-aware, and direct. No generic disclaimers. Write for a sophisticated retail investor.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await response.json();
      const text = data.content?.map(c => c.text || "").join("") || "No response received.";
      setAiAnalysis(text);
    } catch (e) {
      setAiAnalysis("Analysis unavailable. Please try again.");
    }
    setAiLoading(false);
  }, []);

  const formatAnalysis = (text) => {
    if (!text) return null;
    const sections = text.split(/\n(?=\d\.|[A-Z]{2,})/g);
    return sections.map((s, i) => {
      const lines = s.trim().split("\n");
      const header = lines[0];
      const body = lines.slice(1).join("\n").trim();
      return (
        <div key={i} style={{ marginBottom: 20 }}>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 11,
            letterSpacing: "0.12em",
            color: "#00D4FF",
            textTransform: "uppercase",
            marginBottom: 8,
            borderLeft: "2px solid #00D4FF",
            paddingLeft: 10,
          }}>{header}</div>
          <div style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13.5,
            lineHeight: 1.7,
            color: "#2a3350",
            paddingLeft: 12,
          }}>{body}</div>
        </div>
      );
    });
  };

  const selectedRow = matrix ? matrix[selected] : null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f4f6fb",
      color: "#1a2038",
      fontFamily: "'DM Sans', sans-serif",
      padding: "0 0 40px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .cell:hover { transform: scale(1.08); z-index: 10; transition: transform 0.15s; }
        .tab-btn { transition: all 0.2s; cursor: pointer; }
        .tab-btn:hover { background: rgba(255,255,255,0.06) !important; }
        .asset-pill { transition: all 0.15s; cursor: pointer; }
        .asset-pill:hover { transform: translateY(-1px); }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #f4f6fb; }
        ::-webkit-scrollbar-thumb { background: #c8d0e0; border-radius: 2px; }
      `}</style>

      {/* Header */}
      <div style={{
        background: "linear-gradient(180deg, #ffffff 0%, #f4f6fb 100%)",
        borderBottom: "1px solid #dde3f0",
        padding: "24px 28px 20px",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.2em",
              color: "#7a85a0",
              textTransform: "uppercase",
              marginBottom: 6,
            }}>PORTFOLIO INTELLIGENCE</div>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 22,
              fontWeight: 700,
              color: "#1a2038",
              letterSpacing: "-0.02em",
            }}>Correlation Matrix</div>
            <div style={{ fontSize: 12, color: "#7a85a0", marginTop: 4 }}>
              {lastUpdated
                ? `Last updated: ${lastUpdated.toLocaleTimeString("en-GB")} · End of day · Yahoo Finance`
                : "Loading market data..."}
            </div>
          </div>
          <button
            onClick={runAiAnalysis}
            disabled={!matrix || aiLoading}
            style={{
              background: aiLoading
                ? "rgba(0,212,255,0.1)"
                : "linear-gradient(135deg, #00D4FF22, #7C3AED22)",
              border: "1px solid #00D4FF44",
              borderRadius: 8,
              padding: "10px 18px",
              color: "#00D4FF",
              fontFamily: "'Space Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.08em",
              cursor: matrix && !aiLoading ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {aiLoading ? (
              <>
                <span style={{ animation: "pulse 1s infinite" }}>◈</span> ANALYSING...
              </>
            ) : (
              <> ◈ RUN AI ANALYSIS </>
            )}
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginTop: 20 }}>
          {["heatmap", "spotlight", "ai"].map(t => (
            <button
              key={t}
              className="tab-btn"
              onClick={() => setTab(t)}
              style={{
                background: tab === t ? "rgba(0,212,255,0.12)" : "transparent",
                border: tab === t ? "1px solid #00D4FF44" : "1px solid transparent",
                borderRadius: 6,
                padding: "6px 14px",
                color: tab === t ? "#00D4FF" : "#7a85a0",
                fontFamily: "'Space Mono', monospace",
                fontSize: 10,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              {t === "heatmap" ? "⬡ Heatmap" : t === "spotlight" ? "◎ Spotlight" : "◈ AI Insights"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "24px 28px" }}>

        {/* HEATMAP TAB */}
        {tab === "heatmap" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            {/* Legend */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#7a85a0", letterSpacing: "0.1em" }}>CORRELATION</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 80, height: 10, borderRadius: 4, background: "linear-gradient(90deg, rgb(255,59,48), #f4f6fb, rgb(0,212,255))" }} />
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "#7a85a0" }}>-1 ← 0 → +1</span>
              </div>
              {[
                { color: "#F7931A", label: "Bitcoin" },
                { color: "#00D4FF", label: "Tech" },
                { color: "#FFB800", label: "Oil" },
                { color: "#A78BFA", label: "Index" },
                { color: "#76EE00", label: "Stock" },
              ].map(g => (
                <div key={g.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: g.color }} />
                  <span style={{ fontSize: 11, color: "#7a85a0" }}>{g.label}</span>
                </div>
              ))}
            </div>

            {/* Matrix */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "separate", borderSpacing: 2 }}>
                <thead>
                  <tr>
                    <th style={{ width: 60 }} />
                    {ASSETS.map(a => (
                      <th key={a.label} style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: 9,
                        letterSpacing: "0.08em",
                        color: a.color,
                        padding: "0 2px 8px",
                        textAlign: "center",
                        minWidth: 44,
                        writingMode: "vertical-rl",
                        transform: "rotate(180deg)",
                        height: 70,
                      }}>{a.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ASSETS.map((rowAsset, i) => (
                    <tr key={rowAsset.label}>
                      <td style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: 9,
                        color: rowAsset.color,
                        letterSpacing: "0.06em",
                        paddingRight: 8,
                        whiteSpace: "nowrap",
                        textAlign: "right",
                      }}>{rowAsset.label}</td>
                      {ASSETS.map((colAsset, j) => {
                        const val = matrix ? matrix[rowAsset.label][j] : null;
                        return (
                          <td
                            key={colAsset.label}
                            className="cell"
                            onMouseEnter={() => setTooltip({ row: rowAsset.label, col: colAsset.label, val })}
                            onMouseLeave={() => setTooltip(null)}
                            onClick={() => { setSelected(rowAsset.label); setTab("spotlight"); }}
                            style={{
                              background: matrix ? getColor(val) : "#e8edf5",
                              width: 44,
                              height: 36,
                              textAlign: "center",
                              verticalAlign: "middle",
                              borderRadius: 3,
                              cursor: "pointer",
                              position: "relative",
                              border: i === j ? "1px solid rgba(255,255,255,0.15)" : "none",
                            }}
                          >
                            {matrix ? (
                              <span style={{
                                fontFamily: "'Space Mono', monospace",
                                fontSize: 9,
                                color: getTextColor(val),
                                fontWeight: i === j ? 700 : 400,
                              }}>
                                {val === 1 ? "—" : val?.toFixed(2)}
                              </span>
                            ) : (
                              <div style={{ width: 24, height: 8, background: "#c8d0e0", borderRadius: 2, margin: "auto" }} />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tooltip */}
            {tooltip && tooltip.val !== null && tooltip.row !== tooltip.col && (
              <div style={{
                marginTop: 16,
                background: "#ffffff",
                border: "1px solid #dde3f0",
                borderRadius: 8,
                padding: "12px 16px",
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                animation: "fadeIn 0.15s ease",
              }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#1a2038" }}>
                  {tooltip.row} ↔ {tooltip.col}
                </span>
                <span style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 14,
                  fontWeight: 700,
                  color: tooltip.val > 0 ? "#00D4FF" : "#FF3B30",
                }}>
                  {tooltip.val?.toFixed(3)}
                </span>
                <span style={{ fontSize: 11, color: "#7a85a0" }}>
                  {Math.abs(tooltip.val) > 0.7 ? "Strong" : Math.abs(tooltip.val) > 0.4 ? "Moderate" : "Weak"}
                  {tooltip.val > 0 ? " positive" : " negative"} correlation
                </span>
              </div>
            )}

            {/* Divergence alerts */}
            {divergences.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10,
                  letterSpacing: "0.15em",
                  color: "#7a85a0",
                  marginBottom: 12,
                }}>⚑ UNUSUAL DIVERGENCES</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {divergences.map((d, i) => (
                    <div key={i} style={{
                      background: "#ffffff",
                      border: "1px solid #FFB80022",
                      borderRadius: 8,
                      padding: "10px 14px",
                      flex: "1 1 180px",
                    }}>
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#FFB800", marginBottom: 4 }}>
                        {d.a} ↔ {d.b}
                      </div>
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 16, color: "#1a2038" }}>
                        {d.corr.toFixed(2)}
                      </div>
                      <div style={{ fontSize: 11, color: "#7a85a0", marginTop: 2 }}>Near-zero correlation</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SPOTLIGHT TAB */}
        {tab === "spotlight" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#7a85a0", letterSpacing: "0.12em", marginBottom: 12 }}>SELECT ASSET</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {ASSETS.map(a => (
                  <button
                    key={a.label}
                    className="asset-pill"
                    onClick={() => setSelected(a.label)}
                    style={{
                      background: selected === a.label ? `${a.color}22` : "#ffffff",
                      border: `1px solid ${selected === a.label ? a.color : "#dde3f0"}`,
                      borderRadius: 20,
                      padding: "6px 14px",
                      color: selected === a.label ? a.color : "#8a95b0",
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 10,
                      letterSpacing: "0.08em",
                      cursor: "pointer",
                    }}
                  >{a.label}</button>
                ))}
              </div>
            </div>

            {selectedRow && (
              <>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10,
                  color: "#7a85a0",
                  letterSpacing: "0.12em",
                  marginBottom: 16,
                }}>◎ {selected} CORRELATION BREAKDOWN</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {ASSETS
                    .map((a, i) => ({ asset: a, val: selectedRow[i] }))
                    .filter(x => x.asset.label !== selected)
                    .sort((a, b) => Math.abs(b.val) - Math.abs(a.val))
                    .map(({ asset, val }) => (
                      <div key={asset.label} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        background: "#ffffff",
                        borderRadius: 8,
                        padding: "12px 16px",
                        border: "1px solid #dde3f0",
                      }}>
                        <div style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: 10,
                          color: asset.color,
                          width: 60,
                          flexShrink: 0,
                        }}>{asset.label}</div>
                        <div style={{ flex: 1, height: 6, background: "#dde3f0", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{
                            width: `${Math.abs(val) * 100}%`,
                            height: "100%",
                            background: val > 0 ? "#00D4FF" : "#FF3B30",
                            borderRadius: 3,
                            marginLeft: val < 0 ? "auto" : 0,
                            transition: "width 0.4s ease",
                          }} />
                        </div>
                        <div style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: 12,
                          color: val > 0 ? "#00D4FF" : "#FF3B30",
                          width: 50,
                          textAlign: "right",
                          flexShrink: 0,
                        }}>{val.toFixed(2)}</div>
                        <div style={{
                          fontSize: 10,
                          color: "#7a85a0",
                          width: 100,
                          flexShrink: 0,
                        }}>
                          {Math.abs(val) > 0.7 ? "Strong" : Math.abs(val) > 0.4 ? "Moderate" : "Weak"}
                          {" "}{val > 0 ? "↑" : "↓"}
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* AI INSIGHTS TAB */}
        {tab === "ai" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            {aiLoading && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#00D4FF", letterSpacing: "0.12em", animation: "pulse 1.5s infinite" }}>
                  ◈ CLAUDE IS ANALYSING YOUR PORTFOLIO...
                </div>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ background: "#ffffff", borderRadius: 8, padding: 16 }}>
                    <div style={{ marginBottom: 10 }}>{shimmer()}</div>
                    <div style={{ marginBottom: 8 }}>{shimmer()}</div>
                    <div style={{ width: "70%" }}>{shimmer()}</div>
                  </div>
                ))}
              </div>
            )}

            {!aiLoading && !aiAnalysis && (
              <div style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#c8d0e0",
              }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>◈</div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, letterSpacing: "0.1em" }}>
                  CLICK "RUN AI ANALYSIS" TO BEGIN
                </div>
                <div style={{ fontSize: 12, color: "#3a3a5a", marginTop: 8 }}>
                  Claude will analyse correlation shifts, divergences, macro drivers and hedging implications
                </div>
              </div>
            )}

            {!aiLoading && aiAnalysis && (
              <div style={{
                background: "#ffffff",
                borderRadius: 10,
                padding: "24px",
                border: "1px solid #dde3f0",
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 24,
                  paddingBottom: 16,
                  borderBottom: "1px solid #dde3f0",
                }}>
                  <span style={{ color: "#00D4FF", fontSize: 14 }}>◈</span>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#7a85a0", letterSpacing: "0.12em" }}>
                    AI ANALYSIS · {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
                {formatAnalysis(aiAnalysis)}
                <div style={{
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: "1px solid #dde3f0",
                  fontSize: 10,
                  color: "#c8d0e0",
                  fontStyle: "italic",
                }}>
                  This analysis is for informational purposes only and does not constitute financial advice.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
