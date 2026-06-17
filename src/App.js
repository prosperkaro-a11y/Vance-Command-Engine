import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ── VANCE CORE IDENTITY ─────────────────────────────────────────────────────
const SYSTEM = `You are VANCE — Voice-Activated Neural Command Engine — the personal AI of Prosper, known as "The Senator." You are a razor-sharp, loyal chief of staff, strategic advisor, and execution engine.

IDENTITY: Speak with authority, warmth, and precision. Address him as "Senator" naturally. You deeply understand Nigerian culture, Warri identity, Isoko heritage, Pidgin English. Lead with the answer — no filler. You are proactive, discreet, trustworthy.

THE SENATOR: Prosper — accountant, Warri Nigeria. Security and hospitality sectors. Eldest of six siblings. Shola Mese Foundation. Music: Afrobeat, Highlife, Afro-fusion. Loves Flavour, Johnny Drille, Chike. Songwriter, storyteller. Ambitious, authoritative.

CAPABILITIES: Web search for live info. Draft any document. Write songs in any Nigerian genre. Accounting and financial analysis. Relationship coaching. Business strategy. OSINT investigation guidance. Email drafting. Task and schedule management. Creative direction. You are VANCE.`;

const MK = "vance_os_mem";
const HK = "vance_os_hist";
const TK = "vance_os_tasks";
const lm = () => { try { return JSON.parse(localStorage.getItem(MK) || "[]"); } catch { return []; } };
const sm = m => localStorage.setItem(MK, JSON.stringify(m));
const lh = () => { try { return JSON.parse(localStorage.getItem(HK) || "[]"); } catch { return []; } };
const sh = h => localStorage.setItem(HK, JSON.stringify(h.slice(-80)));
const lt = () => { try { return JSON.parse(localStorage.getItem(TK) || "[]"); } catch { return []; } };
const st = t => localStorage.setItem(TK, JSON.stringify(t));

const QUICK = [
  { icon: "🌐", label: "Web Search", color: "#C8881A", prompt: "Search the web for the latest news and developments in Nigeria today. Give me a sharp briefing." },
  { icon: "📊", label: "Financial", color: "#D4A017", prompt: "Create a professional monthly financial summary template for my security and hospitality company." },
  { icon: "📧", label: "Draft Email", color: "#B87333", prompt: "Help me draft a professional business email. Ask me who it is to and what it is about." },
  { icon: "🧾", label: "Invoice", color: "#C8881A", prompt: "Generate a clean professional invoice template for my security company." },
  { icon: "🎵", label: "Write Song", color: "#D4A017", prompt: "Help me write an original song. Ask me about the theme, mood, and genre." },
  { icon: "📋", label: "Shift Report", color: "#B87333", prompt: "Generate a security shift handover report template." },
  { icon: "📰", label: "News Brief", color: "#C8881A", prompt: "Give me an intelligence briefing: top Nigerian business news, global markets, key developments right now." },
  { icon: "🎯", label: "Strategy", color: "#D4A017", prompt: "Help me think through a business or personal strategy. Ask me what challenge I am facing." },
  { icon: "✉️", label: "Foundation", color: "#B87333", prompt: "Help me draft a formal letter for the Shola Mese Foundation." },
  { icon: "🧮", label: "Calculate", color: "#C8881A", prompt: "I need help with a calculation or financial analysis. What should I provide?" },
  { icon: "📅", label: "Plan Day", color: "#D4A017", prompt: "Help me plan and structure my day optimally. Ask me what is on my schedule." },
  { icon: "🤝", label: "Negotiate", color: "#B87333", prompt: "Coach me through a negotiation or business deal. Ask me about the situation." },
];

const OSINT = {
  "🔍 Search": { color: "#C8881A", desc: "Deep web discovery", tools: [
    { name: "Google Advanced", url: "https://www.google.com/advanced_search", tag: "FREE" },
    { name: "Shodan", url: "https://www.shodan.io", tag: "FREE" },
    { name: "DuckDuckGo", url: "https://duckduckgo.com", tag: "FREE" },
    { name: "Censys", url: "https://search.censys.io", tag: "FREE" },
    { name: "Yandex", url: "https://yandex.com", tag: "FREE" },
  ]},
  "👤 People": { color: "#D4A017", desc: "Find individuals", tools: [
    { name: "Spokeo", url: "https://www.spokeo.com", tag: "FREE" },
    { name: "TruePeopleSearch", url: "https://www.truepeoplesearch.com", tag: "FREE" },
    { name: "Pipl", url: "https://pipl.com", tag: "PAID" },
    { name: "WhitePages", url: "https://www.whitepages.com", tag: "FREE" },
    { name: "BeenVerified", url: "https://www.beenverified.com", tag: "PAID" },
  ]},
  "📧 Email": { color: "#B87333", desc: "Breach checks, verify", tools: [
    { name: "HaveIBeenPwned", url: "https://haveibeenpwned.com", tag: "FREE" },
    { name: "Hunter.io", url: "https://hunter.io", tag: "FREE" },
    { name: "EmailRep", url: "https://emailrep.io", tag: "FREE" },
    { name: "MXToolbox", url: "https://mxtoolbox.com", tag: "FREE" },
  ]},
  "🌐 Domain/IP": { color: "#C8881A", desc: "WHOIS, DNS, infra", tools: [
    { name: "WHOIS Lookup", url: "https://www.whois.com/whois", tag: "FREE" },
    { name: "IPinfo", url: "https://ipinfo.io", tag: "FREE" },
    { name: "DNSDumpster", url: "https://dnsdumpster.com", tag: "FREE" },
    { name: "VirusTotal", url: "https://www.virustotal.com", tag: "FREE" },
  ]},
  "📱 Social": { color: "#D4A017", desc: "Social media intel", tools: [
    { name: "Social Searcher", url: "https://www.social-searcher.com", tag: "FREE" },
    { name: "IntelligenceX", url: "https://intelx.io", tag: "FREE" },
    { name: "Maltego", url: "https://www.maltego.com", tag: "FREE" },
    { name: "Followerwonk", url: "https://followerwonk.com", tag: "FREE" },
  ]},
  "🔑 Username": { color: "#B87333", desc: "Cross-platform tracing", tools: [
    { name: "WhatsMyName", url: "https://whatsmyname.app", tag: "FREE" },
    { name: "Namechk", url: "https://namechk.com", tag: "FREE" },
    { name: "Sherlock", url: "https://github.com/sherlock-project/sherlock", tag: "FREE" },
    { name: "UserSearch.org", url: "https://usersearch.org", tag: "FREE" },
  ]},
  "📞 Phone": { color: "#C8881A", desc: "Reverse lookup", tools: [
    { name: "Truecaller", url: "https://www.truecaller.com", tag: "FREE" },
    { name: "NumLookup", url: "https://www.numlookup.com", tag: "FREE" },
    { name: "PhoneInfoga", url: "https://github.com/sundowndev/phoneinfoga", tag: "FREE" },
    { name: "Sync.ME", url: "https://sync.me", tag: "FREE" },
  ]},
  "🗺️ Geo": { color: "#D4A017", desc: "Location intelligence", tools: [
    { name: "Google Maps", url: "https://maps.google.com", tag: "FREE" },
    { name: "OpenStreetMap", url: "https://www.openstreetmap.org", tag: "FREE" },
    { name: "SunCalc", url: "https://www.suncalc.org", tag: "FREE" },
    { name: "Sentinel Hub", url: "https://www.sentinel-hub.com", tag: "FREE" },
  ]},
  "🖼️ Images": { color: "#B87333", desc: "Reverse search, metadata", tools: [
    { name: "TinEye", url: "https://tineye.com", tag: "FREE" },
    { name: "Yandex Images", url: "https://yandex.com/images", tag: "FREE" },
    { name: "PimEyes", url: "https://pimeyes.com", tag: "FREE" },
    { name: "FotoForensics", url: "https://fotoforensics.com", tag: "FREE" },
  ]},
  "💼 Business": { color: "#C8881A", desc: "Company intelligence", tools: [
    { name: "OpenCorporates", url: "https://opencorporates.com", tag: "FREE" },
    { name: "LinkedIn", url: "https://www.linkedin.com", tag: "FREE" },
    { name: "Crunchbase", url: "https://www.crunchbase.com", tag: "FREE" },
    { name: "SEC EDGAR", url: "https://www.sec.gov/cgi-bin/browse-edgar", tag: "FREE" },
  ]},
  "🔐 Threats": { color: "#D4A017", desc: "Cyber threat intel", tools: [
    { name: "VirusTotal", url: "https://www.virustotal.com", tag: "FREE" },
    { name: "AbuseIPDB", url: "https://www.abuseipdb.com", tag: "FREE" },
    { name: "URLScan", url: "https://urlscan.io", tag: "FREE" },
    { name: "AlienVault OTX", url: "https://otx.alienvault.com", tag: "FREE" },
  ]},
  "🕸️ Dark Web": { color: "#B87333", desc: "Onion and breach intel", tools: [
    { name: "Tor Browser", url: "https://www.torproject.org", tag: "FREE" },
    { name: "IntelligenceX", url: "https://intelx.io", tag: "FREE" },
    { name: "Ahmia", url: "https://ahmia.fi", tag: "FREE" },
    { name: "DarkSearch", url: "https://darksearch.io", tag: "FREE" },
  ]},
  "₿ Crypto": { color: "#C8881A", desc: "Blockchain tracing", tools: [
    { name: "Blockchain Explorer", url: "https://www.blockchain.com/explorer", tag: "FREE" },
    { name: "Etherscan", url: "https://etherscan.io", tag: "FREE" },
    { name: "BitcoinAbuse", url: "https://www.bitcoinabuse.com", tag: "FREE" },
    { name: "OXT", url: "https://oxt.me", tag: "FREE" },
  ]},
};

const DEVICE_APPS = [
  { icon: "📧", name: "Gmail", desc: "Read, draft, send emails", status: "CONNECT", color: "#C8881A", url: "https://mail.google.com" },
  { icon: "💬", name: "WhatsApp", desc: "Messages and calls", status: "CONNECT", color: "#D4A017", url: "https://web.whatsapp.com" },
  { icon: "📅", name: "Google Calendar", desc: "Events and scheduling", status: "CONNECT", color: "#B87333", url: "https://calendar.google.com" },
  { icon: "📂", name: "Google Drive", desc: "Files and documents", status: "CONNECT", color: "#C8881A", url: "https://drive.google.com" },
  { icon: "📞", name: "Phone/Calls", desc: "Call logs and contacts", status: "SOON", color: "#D4A017", url: null },
  { icon: "📱", name: "SMS/Messages", desc: "Text message access", status: "SOON", color: "#B87333", url: null },
  { icon: "🗂️", name: "Notion", desc: "Notes and databases", status: "CONNECT", color: "#C8881A", url: "https://notion.so" },
  { icon: "📊", name: "Google Sheets", desc: "Spreadsheets and data", status: "CONNECT", color: "#D4A017", url: "https://sheets.google.com" },
  { icon: "🔗", name: "LinkedIn", desc: "Professional network", status: "CONNECT", color: "#B87333", url: "https://linkedin.com" },
  { icon: "🐦", name: "X / Twitter", desc: "Social monitoring", status: "CONNECT", color: "#C8881A", url: "https://x.com" },
  { icon: "💻", name: "Desktop App", desc: "Native app via Electron", status: "SOON", color: "#D4A017", url: null },
  { icon: "🔔", name: "Push Alerts", desc: "Proactive notifications", status: "SOON", color: "#B87333", url: null },
];

function VLogo({ size }) {
  const s = size || 40;
  return React.createElement("svg", { width: s, height: s, viewBox: "0 0 48 48", fill: "none" },
    React.createElement("defs", null,
      React.createElement("linearGradient", { id: "vosgl", x1: "0", y1: "0", x2: "48", y2: "48", gradientUnits: "userSpaceOnUse" },
        React.createElement("stop", { offset: "0%", stopColor: "#F5C842" }),
        React.createElement("stop", { offset: "50%", stopColor: "#C8881A" }),
        React.createElement("stop", { offset: "100%", stopColor: "#8B4A00" })
      ),
      React.createElement("filter", { id: "vosglow" },
        React.createElement("feGaussianBlur", { stdDeviation: "1.5", result: "b" }),
        React.createElement("feMerge", null,
          React.createElement("feMergeNode", { in: "b" }),
          React.createElement("feMergeNode", { in: "SourceGraphic" })
        )
      )
    ),
    React.createElement("polygon", { points: "24,2 44,13 44,35 24,46 4,35 4,13", stroke: "url(#vosgl)", strokeWidth: "1.5", fill: "rgba(200,136,26,0.08)", filter: "url(#vosglow)" }),
    React.createElement("polygon", { points: "24,7 39,15.5 39,32.5 24,41 9,32.5 9,15.5", stroke: "url(#vosgl)", strokeWidth: "0.5", fill: "none", opacity: "0.4" }),
    [{ cx: 24, cy: 2 }, { cx: 44, cy: 13 }, { cx: 44, cy: 35 }, { cx: 24, cy: 46 }, { cx: 4, cy: 35 }, { cx: 4, cy: 13 }].map((p, i) =>
      React.createElement("circle", { key: i, cx: p.cx, cy: p.cy, r: "1.5", fill: "#F5C842", filter: "url(#vosglow)" })
    ),
    React.createElement("path", { d: "M14 16 L24 33 L34 16", stroke: "url(#vosgl)", strokeWidth: "3.5", strokeLinecap: "round", strokeLinejoin: "round", fill: "none", filter: "url(#vosglow)" }),
    React.createElement("circle", { cx: "24", cy: "33", r: "2.5", fill: "#F5C842", filter: "url(#vosglow)" })
  );
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("chat");
  const [memory, setMemory] = useState(lm);
  const [newMem, setNewMem] = useState("");
  const [tasks, setTasks] = useState(lt);
  const [newTask, setNewTask] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [time, setTime] = useState(new Date());
  const [inited, setInited] = useState(false);
  const [webSearch, setWebSearch] = useState(true);
  const [osintCat, setOsintCat] = useState(null);
  const [osintSearch, setOsintSearch] = useState("");
  const [osintQ, setOsintQ] = useState("");
  const [osintResult, setOsintResult] = useState("");
  const [osintLoading, setOsintLoading] = useState(false);
  const [osintMode, setOsintMode] = useState("grid");
  const [fileAttachment, setFileAttachment] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const pendingTasks = useMemo(() => tasks.filter(t => !t.done), [tasks]);
  const doneTasks = useMemo(() => tasks.filter(t => t.done), [tasks]);
  const totalTools = useMemo(() => Object.values(OSINT).reduce((a, c) => a + c.tools.length, 0), []);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (inited) return;
    setInited(true);
    const h = lh();
    if (h.length > 0) setMessages(h);
    else boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (messages.length > 0) sh(messages);
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sys = useCallback(() => {
    let s = SYSTEM;
    if (memory.length > 0) s += "\n\nMEMORY BANK:\n" + memory.map((m, i) => (i + 1) + ". " + m).join("\n");
    const pending = tasks.filter(t => !t.done);
    if (pending.length > 0) s += "\n\nPENDING TASKS:\n" + pending.map(t => "- [" + t.priority.toUpperCase() + "] " + t.text).join("\n");
    return s;
  }, [memory, tasks]);

  const api = useCallback(async (msgs, customSys) => {
    const body = { model: "claude-sonnet-4-20250514", max_tokens: 1000, system: customSys || sys(), messages: msgs };
    if (webSearch) body.tools = [{ type: "web_search_20250305", name: "web_search" }];
    const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json();
    return d.content?.filter(b => b.type === "text").map(b => b.text).join("") || "Try again, Senator.";
  }, [webSearch, sys]);

  const boot = useCallback(async () => {
    setLoading(true);
    try {
      const t = await api([{ role: "user", content: "Boot up VANCE OS. Greet The Senator — you are fully online with Chat, Business, OSINT, Tasks, Device Integrations, and Memory. Warm and sharp — 3 lines max." }]);
      setMessages([{ role: "assistant", content: t, ts: Date.now() }]);
    } catch {
      setMessages([{ role: "assistant", content: "VANCE OS online. All systems operational, Senator.", ts: Date.now() }]);
    }
    setLoading(false);
  }, [api]);

  const send = useCallback(async (override) => {
    const txt = (override || input).trim();
    if (!txt || loading) return;

    let userContent = txt;
    if (fileAttachment) {
      userContent += "\n\n[Attached file: " + fileAttachment.name + "]\n" + fileAttachment.content;
      setFileAttachment(null);
    }

    const uMsg = { role: "user", content: userContent, ts: Date.now() };
    const newMsgs = [...messages, uMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);

    if (/remember that|note that|save this|don't forget/i.test(txt)) {
      const fact = txt.replace(/remember that|note that|save this|don't forget/gi, "").trim();
      if (fact) { const u = [...memory, fact]; setMemory(u); sm(u); }
    }
    if (/add task|task:|todo:|remind me to/i.test(txt)) {
      const taskText = txt.replace(/add task|task:|todo:|remind me to/gi, "").trim();
      if (taskText) { const u = [...tasks, { id: Date.now(), text: taskText, priority: "medium", done: false, created: Date.now() }]; setTasks(u); st(u); }
    }

    try {
      const reply = await api(newMsgs.slice(-20).map(m => ({ role: m.role, content: m.content })));
      setMessages([...newMsgs, { role: "assistant", content: reply, ts: Date.now() }]);
    } catch (err) {
      setMessages([...newMsgs, { role: "assistant", content: "⚠️ Signal lost. Try again, Senator.", ts: Date.now() }]);
    }
    setLoading(false);
  }, [input, loading, messages, fileAttachment, memory, tasks, api]);

  const addTask = useCallback(() => {
    if (!newTask.trim()) return;
    const u = [...tasks, { id: Date.now(), text: newTask.trim(), priority: taskPriority, done: false, created: Date.now() }];
    setTasks(u); st(u); setNewTask("");
  }, [newTask, taskPriority, tasks]);

  const toggleTask = useCallback((id) => {
    const u = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    setTasks(u); st(u);
  }, [tasks]);

  const deleteTask = useCallback((id) => {
    const u = tasks.filter(t => t.id !== id);
    setTasks(u); st(u);
  }, [tasks]);

  const osintAI = useCallback(async () => {
    if (!osintQ.trim() || osintLoading) return;
    setOsintLoading(true); setOsintResult("");
    try {
      const r = await api([{ role: "user", content: osintQ }], "You are VANCE, expert OSINT analyst. Build a precise numbered step-by-step investigation plan. Recommend specific tool names. Be sharp, practical, professional.");
      setOsintResult(r);
    } catch { setOsintResult("Error. Try again."); }
    setOsintLoading(false);
  }, [osintQ, osintLoading, api]);

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target.result;
      if (file.type.startsWith("text/")) {
        setFileAttachment({ name: file.name, content });
      } else {
        setFileAttachment({ name: file.name, content: "[Binary file: " + file.name + ", type: " + file.type + ", size: " + file.size + " bytes]" });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, []);

  const confirmAction = useCallback((message, callback) => {
    if (window.confirm(message)) callback();
  }, []);

  const fT = d => d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const fD = d => d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const fTs = ts => new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  const filteredOsint = osintSearch.trim()
    ? Object.fromEntries(Object.entries(OSINT).filter(([k, v]) =>
        k.toLowerCase().includes(osintSearch.toLowerCase()) ||
        v.desc.toLowerCase().includes(osintSearch.toLowerCase()) ||
        v.tools.some(t => t.name.toLowerCase().includes(osintSearch.toLowerCase()))))
    : OSINT;

  const TABS = [
    ["chat", "💬", "Command"],
    ["tasks", "✅", "Tasks (" + pendingTasks.length + ")"],
    ["business", "⚡", "Modules"],
    ["osint", "🕵️", "OSINT"],
    ["devices", "📱", "Devices"],
    ["memory", "🧠", "Memory"],
  ];

  return React.createElement("div", { style: { minHeight: "100vh", height: "100vh", display: "flex", flexDirection: "column", background: "#1A1208", color: "#F0E0C0", fontFamily: "system-ui,-apple-system,'Segoe UI',sans-serif", overflow: "hidden" } },

    React.createElement("style", null, `
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Crimson+Pro:wght@400;500;600&family=Share+Tech+Mono&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: #1A1208; }
      ::-webkit-scrollbar { width: 4px; height: 4px; }
      ::-webkit-scrollbar-track { background: rgba(200,136,26,0.05); }
      ::-webkit-scrollbar-thumb { background: rgba(200,136,26,0.3); border-radius: 2px; }
      ::-webkit-scrollbar-thumb:hover { background: rgba(200,136,26,0.5); }
      @keyframes vp { 0%,100%{opacity:.3} 50%{opacity:1} }
      @keyframes vf { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      @keyframes vr { 0%,100%{transform:scale(1);opacity:.3} 50%{transform:scale(1.08);opacity:.08} }
      @keyframes vs { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      .vfade { animation: vf 0.3s ease; }
      input, textarea, select { font-family: inherit; }
      input::placeholder, textarea::placeholder { color: #6B4F28; font-style: italic; }
      a { text-decoration: none; }
      .module-card:hover { transform: translateY(-5px); box-shadow: 0 14px 35px rgba(0,0,0,0.5), 0 0 20px rgba(200,136,26,0.12); border-color: rgba(200,136,26,0.5); }
      .osint-cat:hover { border-color: rgba(200,136,26,0.4); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
      .tool-link:hover { border-color:rgba(200,136,26,0.5); background:rgba(200,136,26,0.08); transform:translateX(4px); }
      .device-card:hover { border-color:rgba(200,136,26,0.35); transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,0.4); }
      .task-item:hover { border-color:rgba(200,136,26,0.3); }
      .send-btn:hover:not(:disabled) { transform:scale(1.08); box-shadow:0 0 24px rgba(200,136,26,0.3); border-color:rgba(245,200,66,0.6); }
      .vbtn-primary:hover { background:rgba(200,136,26,0.22); box-shadow:0 0 16px rgba(200,136,26,0.2); }
      .vbtn-danger:hover { background:rgba(200,80,40,0.16); }
      .sug-pill:hover { border-color:rgba(200,136,26,0.5); color:#F5C842; background:rgba(200,136,26,0.08); }
      .gold-chip:hover { transform:scale(1.04); }
      .nav-tab:hover { color: #F5C842 !important; }
      .nav-tab.active { color: #F5C842 !important; border-bottom-color: #C8881A !important; background: rgba(200,136,26,0.05) !important; }
      .input-wrap:focus-within { border-color:rgba(200,136,26,0.6); box-shadow:0 0 20px rgba(200,136,26,0.08); }
      .vfield:focus { border-color:rgba(200,136,26,0.5); }
      .priority-high { border-left-color: #E07050 !important; }
      .priority-medium { border-left-color: #C8881A !important; }
      .priority-low { border-left-color: #6B9060 !important; }
      .attach-label:hover { opacity: 1 !important; }
    `),

    // HEADER
    React.createElement("header", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", flexWrap: "wrap", gap: "10px", flexShrink: 0, background: "linear-gradient(180deg, #0F0A04 0%, #1A1208 100%)", borderBottom: "1px solid rgba(200,136,26,0.25)", zIndex: 100 } },
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "14px" } },
        React.createElement("div", { style: { position: "relative" } },
          React.createElement("div", { style: { position: "absolute", inset: "-8px", borderRadius: "50%", border: "1px solid rgba(200,136,26,0.15)", animation: "vr 3s ease-in-out infinite" } }),
          React.createElement(VLogo, { size: 44 })
        ),
        React.createElement("div", null,
          React.createElement("div", { style: { fontFamily: "'Cinzel',serif", fontSize: "18px", letterSpacing: "6px", background: "linear-gradient(135deg, #F5C842 0%, #C8881A 50%, #8B4A00 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" } }, "VANCE"),
          React.createElement("div", { style: { fontFamily: "'Share Tech Mono',monospace", color: "#6B4F28", letterSpacing: "3px", fontSize: "8px", marginTop: "3px" } }, "VOICE-ACTIVATED NEURAL COMMAND ENGINE · OS v5.0")
        )
      ),
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" } },
        React.createElement("div", { className: "gold-chip", style: { display: "flex", alignItems: "center", gap: "5px", padding: "5px 12px", borderRadius: "20px", fontSize: "10px", fontWeight: 600, letterSpacing: "0.5px", cursor: "pointer", border: "1px solid rgba(200,136,26,0.35)", background: "rgba(200,136,26,0.08)", color: "#F5C842", animation: "vp 2.5s infinite", userSelect: "none" } },
          React.createElement("span", { style: { width: "6px", height: "6px", borderRadius: "50%", background: "#F5C842", boxShadow: "0 0 8px #F5C842", display: "inline-block" } }), " ONLINE"
        ),
        React.createElement("div", { className: "gold-chip", style: { display: "flex", alignItems: "center", gap: "5px", padding: "5px 12px", borderRadius: "20px", fontSize: "10px", fontWeight: 600, letterSpacing: "0.5px", cursor: "pointer", border: webSearch ? "1px solid rgba(200,136,26,0.4)" : "1px solid rgba(200,136,26,0.1)", background: webSearch ? "rgba(200,136,26,0.1)" : "transparent", color: webSearch ? "#F5C842" : "#6B4F28", userSelect: "none" }, onClick: () => setWebSearch(v => !v) },
          webSearch ? "🌐 WEB ON" : "WEB OFF"
        ),
        React.createElement("div", { style: { textAlign: "right" } },
          React.createElement("div", { style: { fontFamily: "'Share Tech Mono',monospace", fontSize: "16px", color: "#D4A017", letterSpacing: "2px" } }, fT(time)),
          React.createElement("div", { style: { fontFamily: "'Share Tech Mono',monospace", fontSize: "8px", color: "#6B4F28", letterSpacing: "1px", marginTop: "1px" } }, fD(time).toUpperCase())
        )
      )
    ),

    // STATUS BAR
    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "14px", padding: "4px 18px", borderBottom: "1px solid rgba(200,136,26,0.1)", background: "#0F0A04", overflowX: "auto", flexShrink: 0 } },
      ...[
        ["MEMORY", memory.length + " NODES", "#C8881A"], null,
        ["TASKS", pendingTasks.length + " PENDING", pendingTasks.length > 0 ? "#E07050" : "#6B4F28"], null,
        ["WEB", webSearch ? "ACTIVE" : "OFF", webSearch ? "#D4A017" : "#6B4F28"], null,
        ["OSINT", totalTools + "+ TOOLS", "#B87333"], null,
        ["MSGS", messages.length + "", "#C8881A"], null,
        ["ENGINE", "CLAUDE SONNET", "#6B4F28"], null,
        ["STATUS", "ALL SYSTEMS GO", "#D4A017"],
      ].map((s, i) => s === null
        ? React.createElement("div", { key: i, style: { width: "1px", height: "12px", background: "rgba(200,136,26,0.15)", flexShrink: 0 } })
        : React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", gap: "5px", whiteSpace: "nowrap", flexShrink: 0 } },
            React.createElement("span", { style: { fontFamily: "'Share Tech Mono',monospace", fontSize: "8px", color: "#6B4F28", letterSpacing: "1px" } }, s[0]),
            React.createElement("span", { style: { fontFamily: "'Share Tech Mono',monospace", fontSize: "8px", color: s[2], letterSpacing: "1px" } }, s[1])
          )
      )
    ),

    // TABS
    React.createElement("div", { style: { display: "flex", flexShrink: 0, background: "#0F0A04", borderBottom: "1px solid rgba(200,136,26,0.15)", overflowX: "auto", zIndex: 50 } },
      ...TABS.map(([id, icon, label]) =>
        React.createElement("button", { key: id, className: tab === id ? "nav-tab active" : "nav-tab", style: { flexShrink: 0, padding: "12px 14px", border: "none", background: "transparent", cursor: "pointer", fontSize: "11px", fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", transition: "all 0.2s", borderBottom: "2px solid transparent", whiteSpace: "nowrap", fontFamily: "inherit", color: tab === id ? "#F5C842" : "#6B4F28" }, onClick: () => setTab(id) },
          icon + " " + label
        )
      )
    ),

    // MAIN CONTENT
    React.createElement("div", { style: { flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" } },

      // CHAT
      tab === "chat" && React.createElement("div", { style: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" } },
        React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: "16px 20px" } },
          React.createElement("div", { style: { maxWidth: "860px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px" } },
            ...messages.map((m, i) =>
              React.createElement("div", { key: i, className: "vfade", style: { display: "flex", alignItems: "flex-start", gap: "12px", flexDirection: m.role === "assistant" ? "row" : "row-reverse" } },
                React.createElement("div", { style: { width: "36px", height: "36px", borderRadius: "12px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: m.role === "assistant" ? "rgba(200,136,26,0.12)" : "rgba(200,136,26,0.08)", border: "1px solid rgba(200,136,26,0.25)" } },
                  m.role === "assistant" ? React.createElement(VLogo, { size: 24 }) : React.createElement("span", { style: { fontFamily: "'Cinzel',serif", fontSize: "11px", color: "#C8881A", fontWeight: 700 } }, "S")
                ),
                React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "4px", maxWidth: "78%", alignItems: m.role === "assistant" ? "flex-start" : "flex-end" } },
                  React.createElement("div", { style: { padding: "14px 18px", fontSize: "14px", lineHeight: 1.8, whiteSpace: "pre-wrap", wordBreak: "break-word", background: m.role === "assistant" ? "linear-gradient(135deg, #1F1508, #2A1C08)" : "linear-gradient(135deg, rgba(200,136,26,0.12), rgba(139,74,0,0.06))", border: m.role === "assistant" ? "1px solid rgba(200,136,26,0.2)" : "1px solid rgba(200,136,26,0.18)", borderLeft: m.role === "assistant" ? "3px solid #C8881A" : "none", borderRight: m.role === "assistant" ? "none" : "3px solid #D4A017", borderRadius: m.role === "assistant" ? "0 14px 14px 14px" : "14px 0 14px 14px", boxShadow: m.role === "assistant" ? "0 4px 20px rgba(0,0,0,0.4)" : "none" } }, m.content),
                  m.ts && React.createElement("span", { style: { fontFamily: "'Share Tech Mono',monospace", fontSize: "9px", color: "#6B4F28", padding: "0 4px" } }, fTs(m.ts))
                )
              )
            ),
            loading && React.createElement("div", { className: "vfade", style: { display: "flex", alignItems: "flex-start", gap: "12px" } },
              React.createElement("div", { style: { width: "36px", height: "36px", borderRadius: "12px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(200,136,26,0.12)", border: "1px solid rgba(200,136,26,0.25)" } }, React.createElement(VLogo, { size: 24 })),
              React.createElement("div", { style: { padding: "14px 18px", background: "linear-gradient(135deg, #1F1508, #2A1C08)", border: "1px solid rgba(200,136,26,0.2)", borderLeft: "3px solid #C8881A", borderRadius: "0 14px 14px 14px", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" } },
                React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "10px" } },
                  React.createElement("span", { style: { fontFamily: "'Share Tech Mono',monospace", fontSize: "10px", color: "#C8881A", letterSpacing: "2px" } }, "PROCESSING"),
                  ...[0, 1, 2].map(i => React.createElement("span", { key: i, style: { width: "5px", height: "5px", borderRadius: "50%", background: "#D4A017", display: "inline-block", animation: "vp 1.2s " + (i * 0.2) + "s infinite" } }))
                )
              )
            ),
            React.createElement("div", { ref: bottomRef })
          )
        ),

        // INPUT AREA (chat tab only)
        React.createElement("div", { style: { flexShrink: 0, padding: "12px 20px 16px", borderTop: "1px solid rgba(200,136,26,0.15)", background: "#0F0A04", zIndex: 100 } },
          React.createElement("div", { style: { maxWidth: "860px", margin: "0 auto", display: "flex", gap: "10px", alignItems: "flex-end", position: "relative" } },
            React.createElement("div", { className: "input-wrap", style: { flex: 1, border: "1px solid rgba(200,136,26,0.25)", borderRadius: "16px", background: "#1F1508", transition: "all 0.2s", position: "relative" } },
              React.createElement("textarea", { ref: inputRef, value: input, onChange: e => setInput(e.target.value), onKeyDown: e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }, placeholder: "Command VANCE, Senator...", rows: 1, disabled: loading, style: { width: "100%", background: "transparent", border: "none", outline: "none", color: "#F0E0C0", fontSize: "14px", padding: "14px 44px 14px 16px", resize: "none", minHeight: "50px", maxHeight: "130px", lineHeight: 1.6, fontFamily: "inherit" } }),
              React.createElement("label", { className: "attach-label", style: { position: "absolute", right: "12px", bottom: "13px", fontSize: "18px", cursor: "pointer", opacity: 0.55, transition: "opacity 0.2s" } },
                "📎",
                React.createElement("input", { type: "file", style: { display: "none" }, onChange: handleFileUpload })
              ),
              fileAttachment && React.createElement("div", { style: { position: "absolute", left: "16px", bottom: "-28px", background: "rgba(200,136,26,0.15)", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", color: "#D4A017", display: "flex", alignItems: "center", gap: "6px" } },
                "📄 " + fileAttachment.name,
                React.createElement("span", { onClick: () => setFileAttachment(null), style: { cursor: "pointer", fontWeight: "bold", color: "#E07050", marginLeft: "4px" } }, "×")
              )
            ),
            React.createElement("button", { className: "send-btn", style: { width: "50px", height: "50px", borderRadius: "14px", cursor: loading || !input.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", transition: "all 0.2s", border: "1px solid rgba(200,136,26,0.5)", background: "linear-gradient(135deg,rgba(200,136,26,0.2),rgba(200,136,26,0.06))", color: "#F5C842", flexShrink: 0, opacity: loading || !input.trim() ? 0.3 : 1 }, onClick: () => send(), disabled: loading || !input.trim() },
              loading ? React.createElement("div", { style: { width: "18px", height: "18px", border: "2px solid rgba(200,136,26,0.3)", borderTopColor: "#C8881A", borderRadius: "50%", animation: "vs 0.8s linear infinite" } }) : "➤"
            )
          ),
          React.createElement("p", { style: { textAlign: "center", marginTop: "10px", fontFamily: "'Share Tech Mono',monospace", fontSize: "8px", color: "#4A3010", letterSpacing: "1px" } }, "ENTER TO SEND · SHIFT+ENTER NEW LINE · 📎 ATTACH FILES")
        )
      ),

      // TASKS
      tab === "tasks" && React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: "16px 20px" } },
        React.createElement("div", { style: { maxWidth: "860px", margin: "0 auto" } },
          React.createElement("div", { style: { fontFamily: "'Share Tech Mono',monospace", fontSize: "10px", color: "#8B6020", letterSpacing: "3px", textTransform: "uppercase", paddingBottom: "6px", borderBottom: "1px solid rgba(200,136,26,0.15)", marginBottom: "14px" } }, "TASK COMMAND CENTRE"),
          React.createElement("div", { style: { display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" } },
            React.createElement("input", { className: "vfield", style: { flex: 1, minWidth: "200px", background: "#1F1508", border: "1px solid rgba(200,136,26,0.2)", borderRadius: "10px", color: "#F0E0C0", fontSize: "13px", padding: "10px 14px", outline: "none" }, placeholder: "Add a task or command VANCE to create one...", value: newTask, onChange: e => setNewTask(e.target.value), onKeyDown: e => { if (e.key === "Enter") addTask(); } }),
            React.createElement("select", { className: "vfield", style: { width: "110px", background: "#1F1508", border: "1px solid rgba(200,136,26,0.2)", borderRadius: "10px", color: "#F0E0C0", fontSize: "13px", padding: "10px 14px", outline: "none" }, value: taskPriority, onChange: e => setTaskPriority(e.target.value) },
              React.createElement("option", { value: "high" }, "🔴 High"),
              React.createElement("option", { value: "medium" }, "🟡 Medium"),
              React.createElement("option", { value: "low" }, "🟢 Low")
            ),
            React.createElement("button", { className: "vbtn-primary", style: { padding: "10px 18px", borderRadius: "10px", cursor: "pointer", fontSize: "12px", fontWeight: 700, letterSpacing: "0.5px", border: "1px solid rgba(200,136,26,0.5)", background: "rgba(200,136,26,0.12)", color: "#F5C842" }, onClick: addTask }, "ADD TASK")
          ),
          React.createElement("div", { style: { display: "flex", gap: "10px", marginBottom: "12px", flexWrap: "wrap" } },
            React.createElement("button", { className: "sug-pill", style: { padding: "5px 12px", border: "1px solid rgba(200,136,26,0.2)", borderRadius: "20px", background: "#1F1508", cursor: "pointer", fontSize: "11px", color: "#9B7040" }, onClick: () => { setTab("chat"); setTimeout(() => send("Create a task list for my day"), 100); } }, "📅 Plan my day"),
            React.createElement("button", { className: "sug-pill", style: { padding: "5px 12px", border: "1px solid rgba(200,136,26,0.2)", borderRadius: "20px", background: "#1F1508", cursor: "pointer", fontSize: "11px", color: "#9B7040" }, onClick: () => { setTab("chat"); setTimeout(() => send("What tasks should I prioritize today based on what you know about me?"), 100); } }, "🎯 Prioritize tasks"),
            React.createElement("button", { className: "sug-pill", style: { padding: "5px 12px", border: "1px solid rgba(200,136,26,0.2)", borderRadius: "20px", background: "#1F1508", cursor: "pointer", fontSize: "11px", color: "#9B7040" }, onClick: () => { setTab("chat"); setTimeout(() => send("Give me a summary of all my pending tasks and suggest how to tackle them efficiently"), 100); } }, "📊 Task summary")
          ),
          pendingTasks.length > 0 && React.createElement("div", { style: { marginBottom: "20px" } },
            React.createElement("div", { style: { fontFamily: "'Share Tech Mono',monospace", fontSize: "9px", color: "#8B6020", letterSpacing: "2px", marginBottom: "10px" } }, "PENDING — " + pendingTasks.length + " ITEMS"),
            React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "8px" } },
              ...pendingTasks.map(t =>
                React.createElement("div", { key: t.id, className: "task-item priority-" + t.priority, style: { display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", border: "1px solid rgba(200,136,26,0.15)", borderLeft: "3px solid", borderRadius: "10px", background: "linear-gradient(135deg,#1F1508,#2A1C08)" } },
                  React.createElement("div", { onClick: () => toggleTask(t.id), style: { width: "20px", height: "20px", borderRadius: "6px", border: "1px solid rgba(200,136,26,0.4)", cursor: "pointer", flexShrink: 0, background: "transparent" } }),
                  React.createElement("span", { style: { flex: 1, fontSize: "14px", color: "#F0E0C0", lineHeight: 1.5 } }, t.text),
                  React.createElement("span", { style: { fontFamily: "'Share Tech Mono',monospace", fontSize: "8px", padding: "3px 8px", borderRadius: "8px", background: t.priority === "high" ? "rgba(200,80,40,0.15)" : t.priority === "medium" ? "rgba(200,136,26,0.15)" : "rgba(100,150,80,0.15)", color: t.priority === "high" ? "#E07050" : t.priority === "medium" ? "#D4A017" : "#6B9060", border: "1px solid " + (t.priority === "high" ? "rgba(200,80,40,0.3)" : t.priority === "medium" ? "rgba(200,136,26,0.3)" : "rgba(100,150,80,0.3)"), flexShrink: 0 } }, t.priority.toUpperCase()),
                  React.createElement("button", { onClick: () => deleteTask(t.id), style: { background: "none", border: "none", color: "#6B4F28", cursor: "pointer", fontSize: "14px", padding: "0 4px", flexShrink: 0 } }, "✕")
                )
              )
            )
          ),
          doneTasks.length > 0 && React.createElement("div", null,
            React.createElement("div", { style: { fontFamily: "'Share Tech Mono',monospace", fontSize: "9px", color: "#6B4F28", letterSpacing: "2px", marginBottom: "10px" } }, "COMPLETED — " + doneTasks.length + " ITEMS"),
            React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "6px" } },
              ...doneTasks.map(t =>
                React.createElement("div", { key: t.id, style: { display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", border: "1px solid rgba(200,136,26,0.15)", borderLeft: "3px solid rgba(200,136,26,0.2)", borderRadius: "10px", background: "linear-gradient(135deg,#1F1508,#2A1C08)", opacity: 0.5 } },
                  React.createElement("div", { onClick: () => toggleTask(t.id), style: { width: "20px", height: "20px", borderRadius: "6px", border: "1px solid rgba(200,136,26,0.3)", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(200,136,26,0.15)", color: "#C8881A", fontSize: "12px" } }, "✓"),
                  React.createElement("span", { style: { flex: 1, fontSize: "13px", color: "#6B4F28", textDecoration: "line-through" } }, t.text),
                  React.createElement("button", { onClick: () => deleteTask(t.id), style: { background: "none", border: "none", color: "#4A3010", cursor: "pointer", fontSize: "14px", padding: "0 4px" } }, "✕")
                )
              )
            )
          ),
          tasks.length === 0 && React.createElement("div", { style: { textAlign: "center", padding: "40px 20px", fontFamily: "'Share Tech Mono',monospace", fontSize: "11px", color: "#4A3010", letterSpacing: "1px" } },
            React.createElement("div", { style: { fontSize: "32px", marginBottom: "12px" } }, "✅"),
            "NO TASKS YET · ADD YOUR FIRST ABOVE OR ASK VANCE TO PLAN YOUR DAY"
          ),
          tasks.length > 0 && React.createElement("button", { className: "vbtn-danger", style: { padding: "10px 18px", borderRadius: "10px", cursor: "pointer", fontSize: "12px", fontWeight: 700, letterSpacing: "0.5px", border: "1px solid rgba(200,80,40,0.4)", background: "rgba(200,80,40,0.08)", color: "#E07050", marginTop: "16px" }, onClick: () => confirmAction("Delete ALL tasks? This cannot be undone.", () => { setTasks([]); st([]); }) }, "Clear All Tasks")
        )
      ),

      // BUSINESS
      tab === "business" && React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: "16px 20px" } },
        React.createElement("div", { style: { maxWidth: "860px", margin: "0 auto" } },
          React.createElement("div", { style: { fontFamily: "'Share Tech Mono',monospace", fontSize: "10px", color: "#8B6020", letterSpacing: "3px", textTransform: "uppercase", paddingBottom: "6px", borderBottom: "1px solid rgba(200,136,26,0.15)", marginBottom: "14px" } }, "QUICK COMMAND MODULES"),
          React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: "10px", marginBottom: "24px" } },
            ...QUICK.map((q, i) =>
              React.createElement("div", { key: i, className: "module-card", style: { border: "1px solid rgba(200,136,26,0.2)", borderRadius: "14px", background: "linear-gradient(135deg, #1F1508, #2A1C08)", cursor: "pointer", padding: "16px 12px", textAlign: "center", transition: "all 0.25s" }, onClick: () => { setTab("chat"); setTimeout(() => send(q.prompt), 100); } },
                React.createElement("div", { style: { width: "40px", height: "40px", borderRadius: "12px", background: q.color + "22", border: "1px solid " + q.color + "44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", margin: "0 auto 10px" } }, q.icon),
                React.createElement("div", { style: { fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px", color: "#B8905A", textTransform: "uppercase" } }, q.label)
              )
            )
          ),
          React.createElement("div", { style: { fontFamily: "'Share Tech Mono',monospace", fontSize: "10px", color: "#8B6020", letterSpacing: "3px", textTransform: "uppercase", paddingBottom: "6px", borderBottom: "1px solid rgba(200,136,26,0.15)", marginBottom: "14px" } }, "DIRECT COMMAND"),
          React.createElement("div", { style: { display: "flex", gap: "8px", marginBottom: "20px" } },
            React.createElement("input", { className: "vfield", style: { flex: 1, background: "#1F1508", border: "1px solid rgba(200,136,26,0.2)", borderRadius: "10px", color: "#F0E0C0", fontSize: "13px", padding: "10px 14px", outline: "none" }, placeholder: "Issue any command to VANCE...", value: input, onChange: e => setInput(e.target.value), onKeyDown: e => { if (e.key === "Enter") { setTab("chat"); setTimeout(() => send(), 100); } } }),
            React.createElement("button", { className: "vbtn-primary", style: { padding: "10px 18px", borderRadius: "10px", cursor: "pointer", fontSize: "12px", fontWeight: 700, letterSpacing: "0.5px", border: "1px solid rgba(200,136,26,0.5)", background: "rgba(200,136,26,0.12)", color: "#F5C842" }, onClick: () => { setTab("chat"); setTimeout(() => send(), 100); } }, "EXECUTE")
          ),
          React.createElement("div", { style: { fontFamily: "'Share Tech Mono',monospace", fontSize: "10px", color: "#8B6020", letterSpacing: "3px", textTransform: "uppercase", paddingBottom: "6px", borderBottom: "1px solid rgba(200,136,26,0.15)", marginBottom: "14px" } }, "SESSION CONTROL"),
          React.createElement("button", { className: "vbtn-danger", style: { padding: "10px 18px", borderRadius: "10px", cursor: "pointer", fontSize: "12px", fontWeight: 700, letterSpacing: "0.5px", border: "1px solid rgba(200,80,40,0.4)", background: "rgba(200,80,40,0.08)", color: "#E07050" }, onClick: () => confirmAction("Clear chat history and reboot VANCE?", () => { setMessages([]); localStorage.removeItem(HK); setTimeout(boot, 300); }) }, "Clear Chat History and Reboot VANCE")
        )
      ),

      // OSINT
      tab === "osint" && React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: "16px 20px" } },
        React.createElement("div", { style: { maxWidth: "860px", margin: "0 auto" } },
          React.createElement("div", { style: { fontFamily: "'Share Tech Mono',monospace", fontSize: "10px", color: "#8B6020", letterSpacing: "3px", textTransform: "uppercase", paddingBottom: "6px", borderBottom: "1px solid rgba(200,136,26,0.15)", marginBottom: "14px" } }, "OSINT INTELLIGENCE FRAMEWORK · " + totalTools + "+ TOOLS · " + Object.keys(OSINT).length + " CATEGORIES"),
          React.createElement("div", { style: { display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap" } },
            React.createElement("input", { className: "vfield", style: { flex: 1, minWidth: "200px", background: "#1F1508", border: "1px solid rgba(200,136,26,0.2)", borderRadius: "10px", color: "#F0E0C0", fontSize: "13px", padding: "10px 14px", outline: "none" }, placeholder: "Search tools or categories...", value: osintSearch, onChange: e => setOsintSearch(e.target.value) }),
            React.createElement("button", { className: "vbtn-primary", style: { padding: "10px 18px", borderRadius: "10px", cursor: "pointer", fontSize: "12px", fontWeight: 700, letterSpacing: "0.5px", border: "1px solid rgba(200,136,26,0.5)", background: "rgba(200,136,26,0.12)", color: "#F5C842", opacity: osintMode === "grid" ? 1 : 0.5 }, onClick: () => setOsintMode("grid") }, "⚡ Tools"),
            React.createElement("button", { className: "vbtn-primary", style: { padding: "10px 18px", borderRadius: "10px", cursor: "pointer", fontSize: "12px", fontWeight: 700, letterSpacing: "0.5px", border: "1px solid rgba(200,136,26,0.5)", background: "rgba(200,136,26,0.12)", color: "#F5C842", opacity: osintMode === "ai" ? 1 : 0.5 }, onClick: () => setOsintMode("ai") }, "🧠 AI Investigate")
          ),
          osintMode === "grid" && React.createElement("div", null,
            React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: "8px", marginBottom: "14px" } },
              ...Object.entries(filteredOsint).map(([cat, data]) =>
                React.createElement("div", { key: cat, className: "osint-cat", style: { border: "1px solid rgba(200,136,26,0.15)", borderRadius: "10px", background: "linear-gradient(135deg,#1F1508,#2A1C08)", cursor: "pointer", overflow: "hidden", transition: "all 0.2s", borderColor: osintCat === cat ? data.color + "88" : "rgba(200,136,26,0.15)", boxShadow: osintCat === cat ? "0 0 20px " + data.color + "22" : "none" }, onClick: () => setOsintCat(osintCat === cat ? null : cat) },
                  React.createElement("div", { style: { height: "3px", background: "linear-gradient(90deg," + data.color + ",transparent)" } }),
                  React.createElement("div", { style: { padding: "10px 12px" } },
                    React.createElement("div", { style: { fontSize: "14px", marginBottom: "4px" } }, cat.split(" ")[0]),
                    React.createElement("div", { style: { fontSize: "10px", fontWeight: 700, color: "#D4A017", textTransform: "uppercase", letterSpacing: "0.5px", lineHeight: 1.3 } }, cat.replace(/^[^ ]+ /, "")),
                    React.createElement("div", { style: { fontSize: "9px", color: "#6B4F28", marginTop: "3px" } }, data.desc),
                    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginTop: "6px" } },
                      React.createElement("span", { style: { fontFamily: "'Share Tech Mono',monospace", fontSize: "8px", color: "#8B6020" } }, data.tools.length + " TOOLS"),
                      React.createElement("span", { style: { color: data.color, fontSize: "11px", display: "inline-block", transform: osintCat === cat ? "rotate(90deg)" : "none" } }, "▶")
                    )
                  )
                )
              )
            ),
            osintCat && OSINT[osintCat] && React.createElement("div", { className: "vfade", style: { padding: "14px", border: "1px solid rgba(200,136,26,0.25)", borderRadius: "12px", background: "#1F1508", marginBottom: "14px" } },
              React.createElement("div", { style: { fontFamily: "'Share Tech Mono',monospace", fontSize: "9px", color: "#8B6020", letterSpacing: "2px", marginBottom: "12px" } }, osintCat + " — " + OSINT[osintCat].tools.length + " TOOLS"),
              React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "6px" } },
                ...OSINT[osintCat].tools.map((t, i) =>
                  React.createElement("a", { key: i, href: t.url, target: "_blank", rel: "noreferrer", className: "tool-link", style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", border: "1px solid rgba(200,136,26,0.15)", borderRadius: "10px", background: "#1F1508", color: "#F0E0C0" } },
                    React.createElement("span", { style: { fontSize: "13px", fontWeight: 600 } }, t.name),
                    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "5px" } },
                      React.createElement("span", { style: { fontFamily: "'Share Tech Mono',monospace", fontSize: "8px", padding: "2px 6px", borderRadius: "6px", background: t.tag === "FREE" ? "rgba(100,160,80,0.15)" : "rgba(200,136,26,0.15)", color: t.tag === "FREE" ? "#6B9060" : "#D4A017", border: "1px solid " + (t.tag === "FREE" ? "rgba(100,160,80,0.25)" : "rgba(200,136,26,0.25)") } }, t.tag),
                      React.createElement("span", { style: { color: "#6B4F28", fontSize: "12px" } }, "↗")
                    )
                  )
                )
              )
            )
          ),
          osintMode === "ai" && React.createElement("div", null,
            React.createElement("p", { style: { fontFamily: "'Share Tech Mono',monospace", fontSize: "9px", color: "#6B4F28", letterSpacing: "1px", marginBottom: "12px" } }, "DESCRIBE YOUR TARGET — VANCE BUILDS YOUR COMPLETE INVESTIGATION STRATEGY"),
            React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" } },
              ...["Who owns this domain?", "Trace a suspicious phone number", "Find all social accounts by username", "Research a Nigerian company background", "Check if email address was breached", "Investigate a suspicious IP address", "Reverse search an image"].map((s, i) =>
                React.createElement("button", { key: i, className: "sug-pill", style: { padding: "5px 12px", border: "1px solid rgba(200,136,26,0.2)", borderRadius: "20px", background: "#1F1508", cursor: "pointer", fontSize: "11px", color: "#9B7040" }, onClick: () => setOsintQ(s) }, s)
              )
            ),
            React.createElement("div", { style: { display: "flex", gap: "8px", marginBottom: "14px" } },
              React.createElement("input", { className: "vfield", style: { flex: 1, background: "#1F1508", border: "1px solid rgba(200,136,26,0.2)", borderRadius: "10px", color: "#F0E0C0", fontSize: "13px", padding: "10px 14px", outline: "none" }, placeholder: "e.g. Investigate a suspicious business contact in Warri...", value: osintQ, onChange: e => setOsintQ(e.target.value), onKeyDown: e => { if (e.key === "Enter") osintAI(); } }),
              React.createElement("button", { className: "vbtn-primary", style: { padding: "10px 18px", borderRadius: "10px", cursor: "pointer", fontSize: "12px", fontWeight: 700, letterSpacing: "0.5px", border: "1px solid rgba(200,136,26,0.5)", background: "rgba(200,136,26,0.12)", color: "#F5C842" }, onClick: osintAI, disabled: osintLoading || !osintQ.trim() }, osintLoading ? "..." : "INVESTIGATE")
            ),
            osintLoading && React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "10px", padding: "14px" } },
              React.createElement("div", { style: { width: "14px", height: "14px", border: "2px solid rgba(200,136,26,0.2)", borderTopColor: "#C8881A", borderRadius: "50%", animation: "vs 0.8s linear infinite" } }),
              React.createElement("span", { style: { fontFamily: "'Share Tech Mono',monospace", fontSize: "10px", color: "#8B6020", letterSpacing: "2px" } }, "BUILDING YOUR OSINT STRATEGY...")
            ),
            osintResult && React.createElement("div", { className: "vfade", style: { padding: "16px 18px", border: "1px solid rgba(200,136,26,0.2)", borderLeft: "3px solid #C8881A", borderRadius: "12px", background: "#1F1508", fontSize: "14px", lineHeight: 1.8, color: "#F0E0C0", whiteSpace: "pre-wrap" } }, osintResult)
          )
        )
      ),

      // DEVICES
      tab === "devices" && React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: "16px 20px" } },
        React.createElement("div", { style: { maxWidth: "860px", margin: "0 auto" } },
          React.createElement("div", { style: { fontFamily: "'Share Tech Mono',monospace", fontSize: "10px", color: "#8B6020", letterSpacing: "3px", textTransform: "uppercase", paddingBottom: "6px", borderBottom: "1px solid rgba(200,136,26,0.15)", marginBottom: "14px" } }, "CONNECTED APPS AND DEVICES"),
          React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "10px", marginBottom: "24px" } },
            ...DEVICE_APPS.map((app, i) =>
              React.createElement("div", { key: i, className: "device-card", style: { border: "1px solid rgba(200,136,26,0.15)", borderRadius: "14px", background: "linear-gradient(135deg,#1F1508,#2A1C08)", overflow: "hidden" } },
                React.createElement("div", { style: { height: "3px", background: "linear-gradient(90deg," + app.color + ",transparent)" } }),
                React.createElement("div", { style: { padding: "14px" } },
                  React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" } },
                    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px" } },
                      React.createElement("span", { style: { fontSize: "22px" } }, app.icon),
                      React.createElement("span", { style: { fontSize: "13px", fontWeight: 700, color: "#D4A017" } }, app.name)
                    ),
                    React.createElement("span", { style: { fontFamily: "'Share Tech Mono',monospace", fontSize: "8px", padding: "3px 8px", borderRadius: "8px", background: app.status === "CONNECT" ? "rgba(200,136,26,0.12)" : "rgba(200,136,26,0.05)", color: app.status === "CONNECT" ? "#C8881A" : "#6B4F28", border: "1px solid " + (app.status === "CONNECT" ? "rgba(200,136,26,0.3)" : "rgba(200,136,26,0.1)") } }, app.status === "CONNECT" ? "AVAILABLE" : "COMING")
                  ),
                  React.createElement("p", { style: { fontSize: "11px", color: "#6B4F28", marginBottom: "10px", lineHeight: 1.5 } }, app.desc),
                  app.url
                    ? React.createElement("a", { href: app.url, target: "_blank", rel: "noreferrer", style: { display: "block", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(200,136,26,0.3)", background: "rgba(200,136,26,0.08)", color: "#F5C842", fontSize: "11px", fontWeight: 700, textAlign: "center" } }, "OPEN " + app.name.toUpperCase())
                    : React.createElement("div", { style: { padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(200,136,26,0.1)", color: "#4A3010", fontSize: "11px", fontWeight: 700, textAlign: "center" } }, "COMING SOON")
                )
              )
            )
          ),
          React.createElement("div", { style: { fontFamily: "'Share Tech Mono',monospace", fontSize: "10px", color: "#8B6020", letterSpacing: "3px", textTransform: "uppercase", paddingBottom: "6px", borderBottom: "1px solid rgba(200,136,26,0.15)", marginBottom: "14px" } }, "INSTALL VANCE ON YOUR DEVICES"),
          React.createElement("div", { style: { background: "#1F1508", border: "1px solid rgba(200,136,26,0.2)", borderLeft: "3px solid #C8881A", borderRadius: "12px", padding: "18px" } },
            React.createElement("p", { style: { fontFamily: "'Share Tech Mono',monospace", fontSize: "11px", color: "#9B7040", lineHeight: 2.2, whiteSpace: "pre-wrap" } },
              "ANDROID: Open in Chrome → Menu (⋮) → Add to Home Screen → VANCE\n\niPHONE: Open in Safari → Share (□↑) → Add to Home Screen → VANCE\n\nPC/MAC: Open in Chrome → Install icon (⊕) in address bar → Install VANCE\n\nVANCE runs fullscreen like a native app on all your devices."
            )
          )
        )
      ),

      // MEMORY
      tab === "memory" && React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: "16px 20px" } },
        React.createElement("div", { style: { maxWidth: "860px", margin: "0 auto" } },
          React.createElement("div", { style: { fontFamily: "'Share Tech Mono',monospace", fontSize: "10px", color: "#8B6020", letterSpacing: "3px", textTransform: "uppercase", paddingBottom: "6px", borderBottom: "1px solid rgba(200,136,26,0.15)", marginBottom: "14px" } }, "VANCE MEMORY BANK"),
          React.createElement("p", { style: { fontFamily: "'Share Tech Mono',monospace", fontSize: "9px", color: "#6B4F28", letterSpacing: "1px", marginBottom: "16px" } }, "VANCE references these in every session · Say 'remember that...' in chat to auto-save"),
          React.createElement("div", { style: { display: "flex", gap: "8px", marginBottom: "18px" } },
            React.createElement("input", { className: "vfield", style: { flex: 1, background: "#1F1508", border: "1px solid rgba(200,136,26,0.2)", borderRadius: "10px", color: "#F0E0C0", fontSize: "13px", padding: "10px 14px", outline: "none" }, placeholder: "Add a fact VANCE should always know...", value: newMem, onChange: e => setNewMem(e.target.value), onKeyDown: e => { if (e.key === "Enter") { if (!newMem.trim()) return; const u = [...memory, newMem.trim()]; setMemory(u); sm(u); setNewMem(""); } } }),
            React.createElement("button", { className: "vbtn-primary", style: { padding: "10px 18px", borderRadius: "10px", cursor: "pointer", fontSize: "12px", fontWeight: 700, letterSpacing: "0.5px", border: "1px solid rgba(200,136,26,0.5)", background: "rgba(200,136,26,0.12)", color: "#F5C842" }, onClick: () => { if (!newMem.trim()) return; const u = [...memory, newMem.trim()]; setMemory(u); sm(u); setNewMem(""); } }, "SAVE")
          ),
          React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "8px", marginBottom: "18px" } },
            memory.length === 0
              ? React.createElement("div", { style: { textAlign: "center", padding: "30px", fontFamily: "'Share Tech Mono',monospace", fontSize: "11px", color: "#4A3010", letterSpacing: "1px" } },
                  React.createElement("div", { style: { fontSize: "28px", marginBottom: "10px" } }, "🧠"),
                  "NO MEMORIES SAVED · ADD YOUR FIRST ONE ABOVE"
                )
              : memory.map((m, i) =>
                React.createElement("div", { key: i, style: { display: "flex", alignItems: "flex-start", gap: "10px", padding: "12px 14px", border: "1px solid rgba(200,136,26,0.15)", borderLeft: "3px solid #C8881A", borderRadius: "10px", background: "#1F1508" } },
                  React.createElement("span", { style: { fontFamily: "'Share Tech Mono',monospace", fontSize: "10px", color: "#C8881A", minWidth: "24px" } }, "#" + (i + 1)),
                  React.createElement("span", { style: { flex: 1, fontSize: "13px", color: "#B8905A", lineHeight: 1.5 } }, m),
                  React.createElement("button", { onClick: () => { const u = memory.filter((_, x) => x !== i); setMemory(u); sm(u); }, style: { background: "none", border: "none", color: "#4A3010", cursor: "pointer", fontSize: "14px", padding: "0 4px" } }, "✕")
                )
              )
          ),
          memory.length > 0 && React.createElement("button", { className: "vbtn-danger", style: { padding: "10px 18px", borderRadius: "10px", cursor: "pointer", fontSize: "12px", fontWeight: 700, letterSpacing: "0.5px", border: "1px solid rgba(200,80,40,0.4)", background: "rgba(200,80,40,0.08)", color: "#E07050" }, onClick: () => confirmAction("Clear all memories? This cannot be undone.", () => { setMemory([]); sm([]); }) }, "Clear All Memories")
        )
      )
    )
  );
}
