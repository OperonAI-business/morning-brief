import { useState, useEffect, useRef } from "react";

const MARKETS = [
  { id: "SPY", name: "S&P 500 ETF", type: "US", emoji: "🇺🇸" },
  { id: "QQQ", name: "NASDAQ ETF", type: "US", emoji: "🇺🇸" },
  { id: "BTC", name: "Bitcoin", type: "CRYPTO", emoji: "₿" },
  { id: "ETH", name: "Ethereum", type: "CRYPTO", emoji: "Ξ" },
  { id: "HSI", name: "Hang Seng", type: "CN", emoji: "🇨🇳" },
  { id: "STI", name: "Straits Times Index", type: "SG", emoji: "🇸🇬" },
  { id: "TSLA", name: "Tesla", type: "US", emoji: "🇺🇸" },
  { id: "NVDA", name: "NVIDIA", type: "US", emoji: "🇺🇸" },
];

const SENTIMENT_COLORS = {
  Bullish: "#22c55e",
  Bearish: "#ef4444",
  Neutral: "#f59e0b",
};

const MOCK_ANALYSIS = {
  SPY: { price: 542.18, change: +1.23, pct: +0.23, signal: "Bullish", rsi: 58, trend: "Uptrend", note: "Breaking above 20-EMA. Watch 545 resistance.", action: "Consider long on pullback to 539." },
  QQQ: { price: 463.77, change: -2.11, pct: -0.45, signal: "Neutral", rsi: 48, trend: "Sideways", note: "Consolidating under 465. Volume declining.", action: "Wait for breakout confirmation above 465." },
  BTC: { price: 67400, change: +1850, pct: +2.82, signal: "Bullish", rsi: 63, trend: "Uptrend", note: "Reclaimed 67k. Momentum building.", action: "Good accumulation zone. Target 70k-72k." },
  ETH: { price: 3512, change: +88, pct: +2.57, signal: "Bullish", rsi: 61, trend: "Uptrend", note: "Following BTC strength. 3600 key level.", action: "Watch for 3600 breakout for continuation." },
  HSI: { price: 18230, change: -120, pct: -0.65, signal: "Bearish", rsi: 41, trend: "Downtrend", note: "Weak sentiment. PBOC policy uncertainty.", action: "Stay cautious. Short bias below 18500." },
  STI: { price: 3385, change: +12, pct: +0.35, signal: "Neutral", rsi: 52, trend: "Sideways", note: "Range-bound 3350-3420. Low volatility.", action: "No clear edge. Neutral stance." },
  TSLA: { price: 251.45, change: +8.32, pct: +3.42, signal: "Bullish", rsi: 66, trend: "Uptrend", note: "Strong bounce off 240 support. Momentum.", action: "Bullish above 250. Target 265-270 short-term." },
  NVDA: { price: 887.23, change: -14.55, pct: -1.61, signal: "Neutral", rsi: 55, trend: "Sideways", note: "Digesting recent gains. 900 key resistance.", action: "Hold existing. Add on confirmed break of 900." },
};

function RSIBar({ value }) {
  const pct = value;
  const color = value > 70 ? "#ef4444" : value < 30 ? "#22c55e" : "#60a5fa";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ flex: 1, height: 5, background: "#1e293b", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.8s ease" }} />
      </div>
      <span style={{ fontSize: 11, color, fontWeight: 700, minWidth: 24 }}>{value}</span>
    </div>
  );
}

function MarketCard({ symbol, data, isSelected, onClick }) {
  const pos = data.change >= 0;
  return (
    <div
      onClick={onClick}
      style={{
        background: isSelected ? "#1e3a5f" : "#0f172a",
        border: `1px solid ${isSelected ? "#3b82f6" : "#1e293b"}`,
        borderRadius: 12,
        padding: "14px 16px",
        cursor: "pointer",
        transition: "all 0.2s",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: SENTIMENT_COLORS[data.signal] }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#f1f5f9", letterSpacing: 0.5 }}>{symbol}</div>
          <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>{MARKETS.find(m => m.id === symbol)?.emoji} {MARKETS.find(m => m.id === symbol)?.name}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>
            {symbol === "BTC" ? `$${data.price.toLocaleString()}` : symbol === "ETH" ? `$${data.price.toLocaleString()}` : `$${data.price}`}
          </div>
          <div style={{ fontSize: 11, color: pos ? "#22c55e" : "#ef4444", fontWeight: 600 }}>
            {pos ? "▲" : "▼"} {Math.abs(data.pct).toFixed(2)}%
          </div>
        </div>
      </div>
      <RSIBar value={data.rsi} />
      <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 10, color: "#94a3b8" }}>{data.trend}</span>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
          background: SENTIMENT_COLORS[data.signal] + "22", color: SENTIMENT_COLORS[data.signal]
        }}>{data.signal}</span>
      </div>
    </div>
  );
}

function PulsingDot({ color = "#22c55e" }) {
  return (
    <span style={{ position: "relative", display: "inline-block", width: 8, height: 8 }}>
      <span style={{
        position: "absolute", inset: 0, borderRadius: "50%", background: color, opacity: 0.4,
        animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite"
      }} />
      <span style={{ position: "absolute", inset: 1, borderRadius: "50%", background: color }} />
    </span>
  );
}

export default function App() {
  const [selected, setSelected] = useState("BTC");
  const [tab, setTab] = useState("overview");
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [saved, setSaved] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const [brief, setBrief] = useState(null);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [previewMsg, setPreviewMsg] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const data = MOCK_ANALYSIS[selected];
  const now = new Date();

  const marketSummary = Object.entries(MOCK_ANALYSIS).map(([sym, d]) => ({
    symbol: sym, ...d,
  }));

  const bullCount = marketSummary.filter(m => m.signal === "Bullish").length;
  const bearCount = marketSummary.filter(m => m.signal === "Bearish").length;

  async function generateBrief() {
    setBriefLoading(true);
    setBrief(null);
    const prompt = `You are a professional quantitative financial analyst and trading advisor for a 21-year-old retail trader in Singapore. 

Market data summary as of ${now.toUTCString()}:
${marketSummary.map(m => `- ${m.symbol}: $${m.price}, ${m.pct > 0 ? "+" : ""}${m.pct}%, RSI ${m.rsi}, Signal: ${m.signal}, Trend: ${m.trend}. Note: ${m.note}`).join("\n")}

Write a concise morning market brief (use plain text, no markdown) covering:
1. OVERNIGHT OVERVIEW (2-3 sentences on overall market mood)
2. KEY OPPORTUNITIES (top 3 trade ideas with entry, target, stop-loss levels)
3. KEY RISKS (2-3 macro or technical risks to watch today)
4. CRYPTO WATCH (BTC/ETH outlook for the next 24h)
5. ASIA OPEN (what to expect for SG/HK markets)
6. TODAY'S WATCHLIST (3-5 tickers with one-line reasoning each)
7. TRADER'S MINDSET TIP (one short actionable discipline reminder)

Be specific, data-driven, and direct. Address the trader as "Trader". Keep total response under 450 words.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const json = await res.json();
      const text = json.content?.map(b => b.text || "").join("") || "Failed to generate brief.";
      setBrief(text);
    } catch (e) {
      setBrief("Error generating brief. Please try again.");
    }
    setBriefLoading(false);
  }

  async function sendToTelegram() {
    if (!botToken || !chatId) return;
    setSending(true);
    setSendResult(null);
    const msgText = brief || "No brief generated yet. Generate one first!";
    const formatted = `📊 *MORNING MARKET BRIEF*\n_${now.toLocaleString("en-SG", { timeZone: "Asia/Singapore" })} SGT_\n\n${msgText}\n\n—\n🤖 _SG Morning Brief Bot_`;
    try {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: formatted, parse_mode: "Markdown" }),
      });
      const json = await res.json();
      setSendResult(json.ok ? "✅ Sent to Telegram!" : "❌ Failed: " + (json.description || "Unknown error"));
    } catch (e) {
      setSendResult("❌ Network error. Check bot token & chat ID.");
    }
    setSending(false);
  }

  async function previewTelegramMessage() {
    setPreviewLoading(true);
    setPreviewMsg(null);
    const prompt = `You are a professional quantitative financial analyst for a Singapore retail trader.
Market snapshot: ${marketSummary.slice(0, 4).map(m => `${m.symbol} ${m.pct > 0 ? "+" : ""}${m.pct}% (${m.signal})`).join(", ")}.
Write a short Telegram message (under 200 words, plain text) as a morning market alert. Start with an emoji mood indicator. Be punchy and actionable.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const json = await res.json();
      setPreviewMsg(json.content?.map(b => b.text || "").join("") || "Error.");
    } catch {
      setPreviewMsg("Error generating preview.");
    }
    setPreviewLoading(false);
  }

  const tabs = ["overview", "deep-dive", "telegram"];

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#020817", minHeight: "100vh", color: "#f1f5f9", padding: "0 0 40px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes ping { 75%,100% { transform: scale(2); opacity: 0; } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0f172a; } ::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
        textarea, input { font-family: inherit; }
        .tab-btn { background: none; border: none; cursor: pointer; font-family: inherit; transition: all 0.2s; }
        .tab-btn:hover { opacity: 0.8; }
        .action-btn { border: none; cursor: pointer; font-family: inherit; font-weight: 700; transition: all 0.18s; }
        .action-btn:hover { filter: brightness(1.12); transform: translateY(-1px); }
        .action-btn:active { transform: translateY(0); }
      `}</style>

      {/* Header */}
      <div style={{ background: "#020817", borderBottom: "1px solid #1e293b", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📡</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 15, letterSpacing: -0.3 }}>SG Morning Brief</div>
            <div style={{ fontSize: 10, color: "#64748b" }}>AI Market Intelligence · 6AM SGT Daily</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <PulsingDot color="#22c55e" />
          <span style={{ fontSize: 11, color: "#64748b" }}>Live</span>
          <div style={{ width: 1, height: 16, background: "#1e293b", margin: "0 6px" }} />
          <span style={{ fontSize: 11, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>
            {now.toLocaleTimeString("en-SG", { timeZone: "Asia/Singapore", hour: "2-digit", minute: "2-digit" })} SGT
          </span>
        </div>
      </div>

      {/* Macro bar */}
      <div style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "10px 24px", display: "flex", gap: 24, overflowX: "auto" }}>
        {[
          { label: "Market Mood", value: bullCount > bearCount ? "Risk-On 🟢" : "Risk-Off 🔴", color: bullCount > bearCount ? "#22c55e" : "#ef4444" },
          { label: "Bulls", value: `${bullCount} / ${marketSummary.length}`, color: "#22c55e" },
          { label: "Bears", value: `${bearCount} / ${marketSummary.length}`, color: "#ef4444" },
          { label: "BTC Dominance", value: "54.2%", color: "#f59e0b" },
          { label: "VIX", value: "15.3 (Low)", color: "#22c55e" },
          { label: "DXY", value: "104.2 ↑", color: "#94a3b8" },
          { label: "Gold", value: "$2,342 ↑", color: "#f59e0b" },
        ].map(item => (
          <div key={item.label} style={{ whiteSpace: "nowrap" }}>
            <div style={{ fontSize: 9, color: "#475569", textTransform: "uppercase", letterSpacing: 0.8 }}>{item.label}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: item.color, marginTop: 2 }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Tab nav */}
      <div style={{ display: "flex", gap: 0, padding: "0 24px", borderBottom: "1px solid #1e293b", background: "#020817" }}>
        {[["overview", "Overview"], ["deep-dive", "AI Brief"], ["telegram", "Telegram Bot"]].map(([id, label]) => (
          <button key={id} className="tab-btn" onClick={() => setTab(id)} style={{
            padding: "14px 18px", fontSize: 12, fontWeight: 600,
            color: tab === id ? "#3b82f6" : "#64748b",
            borderBottom: tab === id ? "2px solid #3b82f6" : "2px solid transparent",
            marginBottom: -1,
          }}>{label}</button>
        ))}
      </div>

      <div style={{ padding: "24px", maxWidth: 900, margin: "0 auto" }}>

        {/* OVERVIEW TAB */}
        {tab === "overview" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Market Snapshot</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
                {MARKETS.map(m => (
                  <MarketCard key={m.id} symbol={m.id} data={MOCK_ANALYSIS[m.id]} isSelected={selected === m.id} onClick={() => setSelected(m.id)} />
                ))}
              </div>
            </div>

            {/* Selected detail */}
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 14, padding: 20, animation: "fadeIn 0.25s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>{selected}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{MARKETS.find(m => m.id === selected)?.name}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                    ${data.price.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: data.change >= 0 ? "#22c55e" : "#ef4444" }}>
                    {data.change >= 0 ? "+" : ""}{data.change} ({data.pct >= 0 ? "+" : ""}{data.pct.toFixed(2)}%)
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                {[
                  { label: "Signal", value: data.signal, color: SENTIMENT_COLORS[data.signal] },
                  { label: "Trend", value: data.trend, color: "#94a3b8" },
                  { label: "RSI", value: data.rsi, color: data.rsi > 70 ? "#ef4444" : data.rsi < 30 ? "#22c55e" : "#60a5fa" },
                  { label: "Market", value: MARKETS.find(m => m.id === selected)?.type, color: "#94a3b8" },
                ].map(item => (
                  <div key={item.label} style={{ background: "#020817", borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: item.color }}>{item.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ background: "#020817", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>📌 Note</div>
                  <div style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.6 }}>{data.note}</div>
                </div>
                <div style={{ background: "#0c1f38", border: "1px solid #1e3a5f", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 10, color: "#3b82f6", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>⚡ Action</div>
                  <div style={{ fontSize: 12, color: "#93c5fd", lineHeight: 1.6 }}>{data.action}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI BRIEF TAB */}
        {tab === "deep-dive" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>AI Morning Brief</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>Full analysis · powered by Claude</div>
              </div>
              <button className="action-btn" onClick={generateBrief} disabled={briefLoading} style={{
                background: briefLoading ? "#1e293b" : "linear-gradient(135deg,#3b82f6,#8b5cf6)",
                color: "#fff", padding: "10px 18px", borderRadius: 9, fontSize: 12,
                opacity: briefLoading ? 0.7 : 1,
              }}>
                {briefLoading ? "Generating..." : "⚡ Generate Brief"}
              </button>
            </div>

            {!brief && !briefLoading && (
              <div style={{ background: "#0f172a", border: "1px dashed #1e293b", borderRadius: 14, padding: 40, textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>🌅</div>
                <div style={{ fontSize: 14, color: "#64748b" }}>Click Generate Brief to get your AI market analysis</div>
                <div style={{ fontSize: 11, color: "#334155", marginTop: 6 }}>Analyzes {marketSummary.length} instruments across US, CN & SG markets</div>
              </div>
            )}

            {briefLoading && (
              <div style={{ background: "#0f172a", borderRadius: 14, padding: 40, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 12 }}>Analyzing market data...</div>
                <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", opacity: 0.8, animation: `ping ${0.8 + i * 0.2}s ease-in-out infinite` }} />
                  ))}
                </div>
              </div>
            )}

            {brief && (
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 14, padding: 22, animation: "fadeIn 0.3s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid #1e293b" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#3b82f6" }}>📊 MORNING BRIEF · {now.toLocaleDateString("en-SG", { timeZone: "Asia/Singapore", weekday: "long", month: "short", day: "numeric" })}</div>
                  <span style={{ fontSize: 10, color: "#475569" }}>Generated {now.toLocaleTimeString("en-SG", { timeZone: "Asia/Singapore" })} SGT</span>
                </div>
                <pre style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, lineHeight: 1.8, color: "#cbd5e1", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{brief}</pre>
                <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #1e293b", display: "flex", gap: 10 }}>
                  <button className="action-btn" onClick={() => setTab("telegram")} style={{ background: "#0088cc22", color: "#0088cc", padding: "8px 14px", borderRadius: 8, fontSize: 11, border: "1px solid #0088cc44" }}>
                    📨 Send to Telegram
                  </button>
                  <button className="action-btn" onClick={() => navigator.clipboard?.writeText(brief)} style={{ background: "#1e293b", color: "#94a3b8", padding: "8px 14px", borderRadius: 8, fontSize: 11, border: "none" }}>
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TELEGRAM TAB */}
        {tab === "telegram" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 14, padding: 22, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}>🤖 Telegram Bot Setup</div>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 18, lineHeight: 1.6 }}>
                Create a bot via <span style={{ color: "#0088cc" }}>@BotFather</span> on Telegram, then paste your token and chat ID below. The bot will send you a market brief every morning at 6AM SGT.
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 6 }}>Bot Token</label>
                  <input
                    type="password"
                    value={botToken}
                    onChange={e => setBotToken(e.target.value)}
                    placeholder="1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                    style={{ width: "100%", background: "#020817", border: "1px solid #1e293b", borderRadius: 8, padding: "10px 12px", color: "#f1f5f9", fontSize: 12, outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 6 }}>Chat ID (your personal or group chat ID)</label>
                  <input
                    type="text"
                    value={chatId}
                    onChange={e => setChatId(e.target.value)}
                    placeholder="-1001234567890 or 123456789"
                    style={{ width: "100%", background: "#020817", border: "1px solid #1e293b", borderRadius: 8, padding: "10px 12px", color: "#f1f5f9", fontSize: 12, outline: "none" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <button className="action-btn" onClick={() => setSaved(true)} style={{ background: "#22c55e", color: "#fff", padding: "10px 18px", borderRadius: 8, fontSize: 12 }}>
                  {saved ? "✓ Saved" : "Save Config"}
                </button>
              </div>
            </div>

            {/* Schedule display */}
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 14, padding: 22, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>⏰ Daily Schedule</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>6:00 AM Singapore Time (UTC+8)</div>
                </div>
                <button className="action-btn" onClick={() => setScheduleEnabled(!scheduleEnabled)} style={{
                  background: scheduleEnabled ? "#22c55e" : "#1e293b",
                  color: scheduleEnabled ? "#fff" : "#64748b",
                  padding: "8px 18px", borderRadius: 8, fontSize: 12,
                }}>
                  {scheduleEnabled ? "🟢 Active" : "⚪ Enable"}
                </button>
              </div>
              {scheduleEnabled && (
                <div style={{ marginTop: 14, padding: "10px 14px", background: "#0c1f38", borderRadius: 10, fontSize: 11, color: "#93c5fd", lineHeight: 1.7, animation: "fadeIn 0.3s ease" }}>
                  ✅ Scheduled: Daily brief at 06:00 SGT<br/>
                  📈 Covers: US close, China overnight, SG pre-market<br/>
                  📲 Delivers to: {chatId ? `Chat ${chatId}` : "your Telegram"}<br/>
                  <span style={{ color: "#475569", fontSize: 10 }}>Note: For true server-side scheduling, deploy this to a cloud function or use a cron job service (see setup guide below).</span>
                </div>
              )}
            </div>

            {/* Quick send */}
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 14, padding: 22 }}>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}>📨 Send Now</div>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 14 }}>
                {brief ? "Your AI brief is ready to send." : "Generate a brief first in the AI Brief tab, or preview a quick message below."}
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="action-btn" onClick={sendToTelegram} disabled={!botToken || !chatId || sending} style={{
                  background: (!botToken || !chatId) ? "#1e293b" : "linear-gradient(135deg,#0088cc,#0055a0)",
                  color: "#fff", padding: "10px 18px", borderRadius: 8, fontSize: 12, opacity: (!botToken || !chatId) ? 0.5 : 1,
                }}>
                  {sending ? "Sending..." : "📤 Send Full Brief"}
                </button>
                <button className="action-btn" onClick={previewTelegramMessage} disabled={previewLoading} style={{
                  background: "#1e293b", color: "#94a3b8", padding: "10px 18px", borderRadius: 8, fontSize: 12,
                }}>
                  {previewLoading ? "Generating..." : "👁 Preview Quick Alert"}
                </button>
              </div>
              {sendResult && (
                <div style={{ marginTop: 12, padding: "10px 14px", background: sendResult.startsWith("✅") ? "#14532d44" : "#7f1d1d44", borderRadius: 8, fontSize: 12, color: sendResult.startsWith("✅") ? "#86efac" : "#fca5a5", animation: "fadeIn 0.3s ease" }}>
                  {sendResult}
                </div>
              )}
              {previewMsg && (
                <div style={{ marginTop: 14, background: "#0c1f38", border: "1px solid #1e3a5f", borderRadius: 10, padding: "14px 16px", animation: "fadeIn 0.3s ease" }}>
                  <div style={{ fontSize: 10, color: "#3b82f6", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Preview Message</div>
                  <pre style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, lineHeight: 1.7, color: "#93c5fd", whiteSpace: "pre-wrap" }}>{previewMsg}</pre>
                </div>
              )}

              {/* Setup guide */}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #1e293b" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8 }}>Setup Guide</div>
                {[
                  ["1", "Create bot", "Message @BotFather → /newbot → copy your token"],
                  ["2", "Get Chat ID", "Message @userinfobot to get your personal chat ID"],
                  ["3", "Automate", "Deploy to Render.com / Railway free tier with a cron job at 0 22 * * * (10PM UTC = 6AM SGT)"],
                  ["4", "Test", "Click 'Send Full Brief' to verify delivery"],
                ].map(([num, title, desc]) => (
                  <div key={num} style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#3b82f6", flexShrink: 0 }}>{num}</div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#cbd5e1" }}>{title}</div>
                      <div style={{ fontSize: 10, color: "#64748b", lineHeight: 1.5 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
