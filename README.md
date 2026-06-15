import React, { useState, useEffect, useRef, useCallback } from "react";

const VANCE_SYSTEM = `You are VANCE — Voice-Activated Neural Command Engine — the personal AI of Prosper, known universally as "The Senator." You are not a generic assistant. You are a razor-sharp, loyal chief of staff, strategic advisor, and execution engine.

IDENTITY & TONE:
- Speak with authority, precision, and warmth. Never sycophantic. Never verbose.
- Address the user as "Senator" naturally — not every sentence, just where it lands right.
- You understand Nigerian culture deeply: Warri identity, Isoko heritage, Pidgin English. Use Pidgin authentically when the moment calls for it.
- You lead with the answer. No filler, no padding, no unnecessary disclaimers.
- You are completely discreet. Everything stays between VANCE and The Senator.
- You are proactive — you anticipate needs, flag risks, and suggest next steps.

WHO THE SENATOR IS:
- Prosper — accountant, based in Warri, Nigeria. Works across security and hospitality sectors.
- Eldest of six siblings. Community figure. Connected to Shola Mese Foundation.
- Music lover: Afrobeat, Afro-fusion, Rhumba, Highlife. Loves Flavour, Johnny Drille, Chike, Victor Uwaifo, King Sunny Ade.
- Creative soul — songwriter, storyteller. Values authentic emotional expression.
- Ambitious, socially intelligent, authoritative. Dislikes being judged or cornered.

CAPABILITIES:
- Search the web and provide live, up-to-date information with sources
- Draft any document: invoices, proposals, reports, emails, memos, contracts
- Write songs in any Nigerian genre with authentic feeling
- Provide accounting support: expense analysis, financial summaries, tax guidance
- Coach on relationships, social situations, communication
- Plan schedules, events, business strategies
- Perform calculations and data analysis instantly
- Translate between English, Pidgin, Yoruba, Igbo contexts
- Act as creative director for any project

RESPONSE STYLE:
- Business tasks: structured, precise, professional
- Personal/casual: warm but sharp
- Creative work: genuine artistry and soul
- Advice: honest even when uncomfortable
- Never say you cannot without offering an alternative path

You are VANCE. Act accordingly.`;

const MEM_KEY = "vance_v3_memory";
const HIST_KEY = "vance_v3_history";
const loadMem = () => { try { return JSON.parse(localStorage.getItem(MEM_KEY) || "[]"); } catch { return []; } };
const saveMem = (m) => localStorage.setItem(MEM_KEY, JSON.stringify(m));
const loadHist = () => { try { return JSON.parse(localStorage.getItem(HIST_KEY) || "[]"); } catch { return []; } };
const saveHist = (h) => localStorage.setItem(HIST_KEY, JSON.stringify(h.slice(-80)));

const speak = (text) => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const clean = text.replace(/[*_#`~\[\]]/g, "").substring(0, 600);
  const utt = new SpeechSynthesisUtterance(clean);
  const voices = window.speechSynthesis.getVoices();
  const pick = voices.find(v => v.name.includes("Daniel") || v.name.includes("Arthur") || v.name.includes("Google UK")) || voices.find(v => v.lang.startsWith("en")) || voices[0];
  if (pick) utt.voice = pick;
  utt.rate = 0.9; utt.pitch = 0.8; utt.volume = 1;
  window.speechSynthesis.speak(utt);
};
const stopSpeak = () => window.speechSynthesis?.cancel();

const QUICK = [
  { icon: "🌐", label: "Web Search", prompt: "Search the web for the latest news and developments in Nigeria today." },
  { icon: "📊", label: "Financial Report", prompt: "Create a professional monthly financial summary template for my security and hospitality company." },
  { icon: "📧", label: "Draft Email", prompt: "Help me draft a professional business email. Ask me who it's to and what it's about." },
  { icon: "🧾", label: "Invoice", prompt: "Generate a clean professional invoice template for my security company." },
  { icon: "🎵", label: "Write Song", prompt: "Help me write an original song. Ask me about the theme, mood, and genre." },
  { icon: "📋", label: "Shift Report", prompt: "Generate a security shift handover report template." },
  { icon: "📰", label: "News Brief", prompt: "Give me an intelligence briefing: top Nigerian business news, global markets, and key developments I should know about right now." },
  { icon: "🎯", label: "Strategy", prompt: "Help me think through a business or personal strategy. Ask me what challenge I am facing." },
  { icon: "✉️", label: "Foundation", prompt: "Help me draft a formal letter or document for the Shola Mese Foundation." },
  { icon: "🧮", label: "Calculate", prompt: "I need help with a calculation or financial analysis. What should I provide?" },
  { icon: "📅", label: "Plan My Day", prompt: "Help me plan and structure my day optimally. Ask me what is on my schedule." },
  { icon: "🤝", label: "Negotiation", prompt: "Coach me through a negotiation or business deal. Ask me about the situation." },
];

const VanceLogo = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lg1" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#60efff"/>
        <stop offset="100%" stopColor="#0061ff"/>
      </linearGradient>
      <linearGradient id="lg2" x1="0" y1="0" x2="48" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#60efff" stopOpacity="0.25"/>
        <stop offset="100%" stopColor="#0061ff" stopOpacity="0.08"/>
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <polygon points="24,2 44,13 44,35 24,46 4,35 4,13" stroke="url(#lg1)" strokeWidth="1.5" fill="url(#lg2)" filter="url(#glow)"/>
    <polygon points="24,7 39,15.5 39,32.5 24,41 9,32.5 9,15.5" stroke="url(#lg1)" strokeWidth="0.5" fill="none" opacity="0.35"/>
    <circle cx="24" cy="2" r="1.5" fill="#60efff" filter="url(#glow)"/>
    <circle cx="44" cy="13" r="1.5" fill="#60efff" filter="url(#glow)"/>
    <circle cx="44" cy="35" r="1.5" fill="#60efff" filter="url(#glow)"/>
    <circle cx="24" cy="46" r="1.5" fill="#60efff" filter="url(#glow)"/>
    <circle cx="4" cy="35" r="1.5" fill="#60efff" filter="url(#glow)"/>
    <circle cx="4" cy="13" r="1.5" fill="#60efff" filter="url(#glow)"/>
    <path d="M15 16 L24 33 L33 16" stroke="url(#lg1)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" filter="url(#glow)"/>
    <circle cx="24" cy="33" r="2" fill="#60efff" filter="url(#glow)"/>
  </svg>
);

const Thinking = () => (
  <div style={{display:"flex",alignItems:"center",gap:"8px",padding:"4px 0"}}>
    <div style={{fontSize:"10px",color:"var(--c2)",fontFamily:"'Share Tech Mono',monospace",letterSpacing:"2px",animation:"vpulse 1.5s infinite"}}>PROCESSING</div>
    {[0,1,2].map(i=>(
      <div key={i} style={{width:"5px",height:"5px",borderRadius:"50%",background:"var(--c1)",animation:`vblink 1.2s ${i*0.2}s infinite`}}/>
    ))}
  </div>
);

export default function VanceV3() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voice, setVoice] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [memory, setMemory] = useState(loadMem);
  const [newMem, setNewMem] = useState("");
  const [tab, setTab] = useState("chat");
  const [time, setTime] = useState(new Date());
  const [inited, setInited] = useState(false);
  const [webSearch, setWebSearch] = useState(true);
  const [particles] = useState(() => Array.from({length:18},(_,i)=>({id:i,x:Math.random()*100,y:Math.random()*100,size:Math.random()*2+0.5,dur:Math.random()*8+4,delay:Math.random()*5})));
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const recRef = useRef(null);

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  useEffect(() => {
    if (inited) return;
    setInited(true);
    const h = loadHist();
    if (h.length > 0) setMessages(h);
    else initVance();
  }, []);

  useEffect(() => {
    if (messages.length > 0) saveHist(messages);
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = false; r.interimResults = false; r.lang = "en-NG";
    r.onresult = e => { setInput(e.results[0][0].transcript); setListening(false); };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    recRef.current = r;
  }, []);

  const buildSystem = useCallback(() => {
    let sys = VANCE_SYSTEM;
    if (memory.length > 0) sys += `\n\nSENATOR MEMORY BANK:\n${memory.map((m,i)=>`${i+1}. ${m}`).join("\n")}`;
    return sys;
  }, [memory]);

  const initVance = async () => {
    setLoading(true);
    try {
      const body = {
        model: "claude-sonnet-4-20250514", max_tokens: 1000,
        system: buildSystem(),
        messages: [{ role: "user", content: "Initialize. Greet The Senator — VANCE v3 is now live with web search, memory, voice, and full business modules. Sharp, 3 lines max. JARVIS-boot energy." }]
      };
      if (webSearch) body.tools = [{ type: "web_search_20250305", name: "web_search" }];
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      const text = data.content?.filter(b => b.type === "text").map(b => b.text).join("") || "VANCE v3 online. All systems operational, Senator.";
      const msg = { role: "assistant", content: text, ts: Date.now() };
      setMessages([msg]);
      if (voice) { setSpeaking(true); speak(text); setTimeout(() => setSpeaking(false), 5000); }
    } catch {
      setMessages([{ role: "assistant", content: "VANCE v3 online. Web search, memory, voice — all live, Senator.", ts: Date.now() }]);
    }
    setLoading(false);
  };

  const sendMessage = async (override) => {
    const txt = (override || input).trim();
    if (!txt || loading) return;
    const userMsg = { role: "user", content: txt, ts: Date.now() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);
    stopSpeak();

    if (/remember that|note that|don't forget|keep in mind|save this/i.test(txt)) {
      const fact = txt.replace(/remember that|note that|don't forget|keep in mind|save this/gi, "").trim();
      if (fact) { const u = [...memory, fact]; setMemory(u); saveMem(u); }
    }

    try {
      const apiMsgs = newMsgs.slice(-24).map(m => ({ role: m.role, content: m.content }));
      const body = { model: "claude-sonnet-4-20250514", max_tokens: 1000, system: buildSystem(), messages: apiMsgs };
      if (webSearch) body.tools = [{ type: "web_search_20250305", name: "web_search" }];
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      const reply = data.content?.filter(b => b.type === "text").map(b => b.text).join("") || "Signal disrupted briefly, Senator. Repeat that.";
      const replyMsg = { role: "assistant", content: reply, ts: Date.now() };
      setMessages([...newMsgs, replyMsg]);
      if (voice) { setSpeaking(true); speak(reply); setTimeout(() => setSpeaking(false), Math.max(3000, reply.length * 55)); }
    } catch {
      setMessages([...newMsgs, { role: "assistant", content: "Connection interrupted, Senator. Try again.", ts: Date.now() }]);
    }
    setLoading(false);
  };

  const toggleMic = () => {
    if (!recRef.current) return;
    if (listening) { recRef.current.stop(); setListening(false); }
    else { recRef.current.start(); setListening(true); }
  };

  const addMem = () => { if (!newMem.trim()) return; const u = [...memory, newMem.trim()]; setMemory(u); saveMem(u); setNewMem(""); };
  const delMem = i => { const u = memory.filter((_, x) => x !== i); setMemory(u); saveMem(u); };
  const clearAll = () => { setMessages([]); localStorage.removeItem(HIST_KEY); setTimeout(() => initVance(), 300); };

  const fmtTime = d => d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const fmtDate = d => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase();
  const fmtTs = ts => new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700;800&family=Share+Tech+Mono&family=Orbitron:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{
          --bg:#020b18;--bg2:#041020;--bg3:#061528;--panel:#071a30;--card:#081e38;
          --border:#0d3050;--border2:#1a4a70;
          --c1:#60efff;--c2:#00b4d8;--c3:#0077b6;
          --accent:#7b2fff;--accent2:#a855f7;
          --green:#00f5a0;--red:#ff4466;--amber:#ffb700;
          --text:#d0eeff;--text2:#6a9fbf;--text3:#2a5070;
        }
        body{background:var(--bg);font-family:'Exo 2',sans-serif;color:var(--text);overflow:hidden;height:100vh;}
        @keyframes vfloat{from{transform:translateY(0) scale(1);opacity:.5}to{transform:translateY(-28px) scale(1.6);opacity:.05}}
        @keyframes vpulse{0%,100%{opacity:.4}50%{opacity:1}}
        @keyframes vblink{0%,100%{opacity:.15;transform:scale(.7)}50%{opacity:1;transform:scale(1.3)}}
        @keyframes vfadeup{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes vring{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.12);opacity:.1}}
        @keyframes vglow{0%,100%{box-shadow:0 0 8px rgba(96,239,255,.25)}50%{box-shadow:0 0 22px rgba(96,239,255,.65)}}
        @keyframes vspin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}

        .app{height:100vh;display:flex;flex-direction:column;position:relative;overflow:hidden;}

        .bg-wrap{position:fixed;inset:0;pointer-events:none;z-index:0;}
        .bg-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(96,239,255,.022) 1px,transparent 1px),linear-gradient(90deg,rgba(96,239,255,.022) 1px,transparent 1px);background-size:52px 52px;}
        .bg-rad{position:absolute;inset:0;background:radial-gradient(ellipse 80% 55% at 50% 0%,rgba(0,119,182,.1) 0%,transparent 70%);}
        .pt{position:absolute;border-radius:50%;background:var(--c1);}

        .hdr{position:relative;z-index:20;display:flex;align-items:center;justify-content:space-between;padding:10px 18px;border-bottom:1px solid var(--border);background:rgba(2,11,24,.97);backdrop-filter:blur(24px);}
        .hdr-l{display:flex;align-items:center;gap:12px;}
        .logo-wrap{position:relative;}
        .logo-ring{position:absolute;inset:-7px;border-radius:50%;border:1px solid rgba(96,239,255,.18);animation:vring 3s ease-in-out infinite;}
        .ttl h1{font-family:'Orbitron',monospace;font-size:15px;font-weight:800;color:var(--c1);letter-spacing:4px;text-shadow:0 0 18px rgba(96,239,255,.35);}
        .ttl p{font-family:'Share Tech Mono',monospace;font-size:8px;color:var(--text3);letter-spacing:2px;margin-top:2px;}
        .hdr-r{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}

        .chip{display:flex;align-items:center;gap:5px;padding:3px 9px;border-radius:2px;cursor:pointer;font-family:'Share Tech Mono',monospace;font-size:8px;letter-spacing:1px;border:1px solid;transition:all .2s;user-select:none;}
        .c-online{border-color:rgba(0,245,160,.3);background:rgba(0,245,160,.06);color:var(--green);}
        .c-web-on{border-color:rgba(96,239,255,.35);background:rgba(96,239,255,.07);color:var(--c1);}
        .c-web-off{border-color:var(--border);background:transparent;color:var(--text3);}
        .c-v-on{border-color:rgba(168,85,247,.4);background:rgba(168,85,247,.08);color:var(--accent2);}
        .c-v-off{border-color:var(--border);background:transparent;color:var(--text3);}
        .c-speak{border-color:rgba(96,239,255,.6);background:rgba(96,239,255,.1);color:var(--c1);animation:vglow .9s infinite;}
        .vdot{width:5px;height:5px;border-radius:50%;}
        .d-g{background:var(--green);box-shadow:0 0 5px var(--green);animation:vpulse 2s infinite;}
        .d-c{background:var(--c1);box-shadow:0 0 5px var(--c1);animation:vpulse .8s infinite;}
        .d-p{background:var(--accent2);box-shadow:0 0 5px var(--accent2);}

        .clk-b{text-align:right;}
        .clk-b .clk{font-family:'Orbitron',monospace;font-size:13px;color:var(--text);letter-spacing:2px;}
        .clk-b .dt{font-family:'Share Tech Mono',monospace;font-size:8px;color:var(--text3);letter-spacing:1px;margin-top:1px;}

        .sbar{position:relative;z-index:15;display:flex;align-items:center;gap:14px;padding:4px 18px;border-bottom:1px solid rgba(13,48,80,.4);background:rgba(4,16,32,.85);overflow-x:auto;}
        .sbar::-webkit-scrollbar{display:none;}
        .si{display:flex;align-items:center;gap:4px;white-space:nowrap;flex-shrink:0;}
        .sl{font-family:'Share Tech Mono',monospace;font-size:8px;color:var(--text3);letter-spacing:1px;}
        .sv{font-family:'Share Tech Mono',monospace;font-size:8px;letter-spacing:1px;}
        .sdiv{width:1px;height:10px;background:var(--border);flex-shrink:0;}

        .tabs{position:relative;z-index:15;display:flex;border-bottom:1px solid var(--border);background:rgba(2,11,24,.92);}
        .tb{flex:1;padding:9px 6px;border:none;background:transparent;cursor:pointer;font-family:'Exo 2',sans-serif;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;transition:all .2s;color:var(--text3);border-bottom:2px solid transparent;display:flex;align-items:center;justify-content:center;gap:4px;}
        .tb.on{color:var(--c1);border-bottom-color:var(--c1);background:rgba(96,239,255,.035);}
        .tb:hover:not(.on){color:var(--text2);}

        .chat{flex:1;overflow-y:auto;padding:14px;position:relative;z-index:5;}
        .chat::-webkit-scrollbar{width:3px;}
        .chat::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px;}
        .msgs{max-width:840px;margin:0 auto;display:flex;flex-direction:column;gap:13px;}

        .mrow{display:flex;align-items:flex-start;gap:9px;animation:vfadeup .25s ease;}
        .mr-v{flex-direction:row;}.mr-u{flex-direction:row-reverse;}
        .av{width:32px;height:32px;border-radius:3px;flex-shrink:0;display:flex;align-items:center;justify-content:center;}
        .av-v{background:linear-gradient(135deg,rgba(96,239,255,.14),rgba(0,119,182,.06));border:1px solid rgba(96,239,255,.28);box-shadow:0 0 10px rgba(96,239,255,.08);}
        .av-u{background:linear-gradient(135deg,rgba(123,47,255,.14),rgba(123,47,255,.04));border:1px solid rgba(123,47,255,.28);}
        .mwrap{display:flex;flex-direction:column;max-width:80%;gap:2px;}
        .mr-u .mwrap{align-items:flex-end;}
        .bub{padding:11px 15px;border-radius:4px;font-size:13.5px;line-height:1.75;white-space:pre-wrap;word-break:break-word;}
        .bv{background:linear-gradient(135deg,var(--bg3),var(--card));border:1px solid var(--border);border-left:2px solid var(--c1);color:var(--text);box-shadow:0 3px 18px rgba(0,0,0,.4);}
        .bu{background:linear-gradient(135deg,rgba(123,47,255,.1),rgba(123,47,255,.03));border:1px solid rgba(123,47,255,.18);border-right:2px solid var(--accent);color:var(--text);}
        .mts{font-family:'Share Tech Mono',monospace;font-size:8px;color:var(--text3);padding:0 3px;}
        .tbub{padding:11px 15px;background:var(--bg3);border:1px solid var(--border);border-left:2px solid var(--c1);border-radius:4px;}

        .panel{flex:1;overflow-y:auto;padding:14px;position:relative;z-index:5;}
        .panel::-webkit-scrollbar{width:3px;}
        .panel::-webkit-scrollbar-thumb{background:var(--border2);}
        .inner{max-width:840px;margin:0 auto;}
        .stitle{font-family:'Orbitron',monospace;font-size:10px;color:var(--c2);letter-spacing:3px;margin-bottom:12px;text-transform:uppercase;padding-bottom:5px;border-bottom:1px solid var(--border);}

        .qgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:20px;}
        @media(min-width:500px){.qgrid{grid-template-columns:repeat(4,1fr);}}
        @media(min-width:800px){.qgrid{grid-template-columns:repeat(6,1fr);}}
        .qcard{padding:12px 8px;border:1px solid var(--border);border-radius:4px;background:linear-gradient(135deg,var(--bg3),var(--card));cursor:pointer;transition:all .2s;text-align:center;}
        .qcard:hover{border-color:rgba(96,239,255,.4);background:linear-gradient(135deg,rgba(96,239,255,.06),var(--card));transform:translateY(-2px);box-shadow:0 6px 20px rgba(96,239,255,.07);}
        .qi{font-size:18px;margin-bottom:5px;}
        .ql{font-size:9px;font-weight:700;letter-spacing:.5px;color:var(--text2);text-transform:uppercase;}

        .frow{display:flex;gap:7px;margin-bottom:8px;}
        .field{flex:1;background:var(--bg3);border:1px solid var(--border);border-radius:3px;color:var(--text);font-family:'Exo 2',sans-serif;font-size:13px;padding:9px 13px;outline:none;transition:border-color .2s;}
        .field:focus{border-color:rgba(96,239,255,.4);}
        .field::placeholder{color:var(--text3);}
        .btn{padding:9px 16px;border-radius:3px;cursor:pointer;font-family:'Exo 2',sans-serif;font-size:11px;font-weight:700;letter-spacing:1px;transition:all .2s;border:1px solid;}
        .bp{border-color:var(--c1);background:rgba(96,239,255,.08);color:var(--c1);}
        .bp:hover{box-shadow:0 0 16px rgba(96,239,255,.18);}
        .bd{border-color:var(--red);background:rgba(255,68,102,.07);color:var(--red);}

        .igrid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:18px;}
        @media(min-width:600px){.igrid{grid-template-columns:repeat(3,1fr);}}
        .icard{padding:12px;border:1px solid var(--border);border-radius:4px;background:var(--bg3);}
        .icard h4{font-size:11px;font-weight:700;color:var(--text);margin-bottom:3px;}
        .icard p{font-size:10px;color:var(--text3);line-height:1.5;}
        .icard .st{display:inline-block;margin-top:5px;padding:2px 7px;border-radius:2px;font-family:'Share Tech Mono',monospace;font-size:8px;letter-spacing:1px;}
        .s-live{background:rgba(0,245,160,.1);color:var(--green);border:1px solid rgba(0,245,160,.2);}
        .s-soon{background:rgba(255,183,0,.07);color:var(--amber);border:1px solid rgba(255,183,0,.2);}
        .s-ready{background:rgba(96,239,255,.07);color:var(--c2);border:1px solid rgba(96,239,255,.2);}

        .mlist{display:flex;flex-direction:column;gap:7px;margin-bottom:18px;}
        .mitem{display:flex;align-items:flex-start;gap:9px;padding:10px 13px;border:1px solid var(--border);border-left:2px solid var(--c2);border-radius:3px;background:var(--bg3);animation:vfadeup .2s ease;}
        .mn{font-family:'Share Tech Mono',monospace;font-size:9px;color:var(--c2);min-width:20px;padding-top:1px;}
        .mt{flex:1;font-size:12px;color:var(--text2);line-height:1.5;}
        .mdel{background:none;border:none;color:var(--text3);cursor:pointer;font-size:12px;padding:0 3px;transition:color .15s;}
        .mdel:hover{color:var(--red);}
        .memp{font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--text3);letter-spacing:1px;text-align:center;padding:20px 0;}

        .ibar{position:relative;z-index:20;padding:9px 14px 13px;border-top:1px solid var(--border);background:rgba(2,11,24,.98);backdrop-filter:blur(24px);}
        .irow{max-width:840px;margin:0 auto;display:flex;gap:7px;align-items:flex-end;}
        .ibox{flex:1;position:relative;border:1px solid var(--border);border-radius:4px;background:var(--bg3);transition:border-color .2s,box-shadow .2s;}
        .ibox:focus-within{border-color:rgba(96,239,255,.5);box-shadow:0 0 18px rgba(96,239,255,.06);}
        .ipmt{position:absolute;left:11px;top:50%;transform:translateY(-50%);font-family:'Share Tech Mono',monospace;color:var(--c1);font-size:11px;pointer-events:none;opacity:.6;}
        textarea.ti{width:100%;background:transparent;border:none;outline:none;color:var(--text);font-family:'Exo 2',sans-serif;font-size:14px;padding:12px 11px 12px 27px;resize:none;min-height:46px;max-height:130px;line-height:1.5;}
        textarea.ti::placeholder{color:var(--text3);font-style:italic;}
        .ibtn{width:46px;height:46px;border-radius:4px;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:16px;transition:all .2s;border:1px solid;background:transparent;}
        .ib-send{border-color:rgba(96,239,255,.4);background:rgba(96,239,255,.07);color:var(--c1);}
        .ib-send:hover:not(:disabled){box-shadow:0 0 18px rgba(96,239,255,.2);transform:scale(1.05);}
        .ib-send:disabled{opacity:.2;cursor:not-allowed;}
        .ib-mic{border-color:rgba(168,85,247,.3);color:var(--accent2);}
        .ib-mic.on{border-color:var(--accent2);background:rgba(168,85,247,.1);animation:vglow .8s infinite;}
        .ihint{text-align:center;margin-top:4px;font-family:'Share Tech Mono',monospace;font-size:8px;color:var(--text3);letter-spacing:1px;}
      `}</style>

      <div className="app">
        <div className="bg-wrap">
          <div className="bg-grid"/>
          <div className="bg-rad"/>
          {particles.map(p => (
            <div key={p.id} className="pt" style={{left:`${p.x}%`,top:`${p.y}%`,width:`${p.size}px`,height:`${p.size}px`,animation:`vfloat ${p.dur}s ${p.delay}s ease-in-out infinite alternate`}}/>
          ))}
        </div>

        {/* HEADER */}
        <header className="hdr">
          <div className="hdr-l">
            <div className="logo-wrap">
              <div className="logo-ring"/>
              <VanceLogo size={42}/>
            </div>
            <div className="ttl">
              <h1>VANCE</h1>
              <p>PERSONAL COMMAND ENGINE · V3.0</p>
            </div>
          </div>
          <div className="hdr-r">
            <div className="chip c-online"><div className="vdot d-g"/>ONLINE</div>
            <div className={`chip ${webSearch?"c-web-on":"c-web-off"}`} onClick={()=>setWebSearch(v=>!v)}>
              <div className="vdot" style={{background:webSearch?"var(--c1)":"var(--text3)",boxShadow:webSearch?"0 0 5px var(--c1)":"none"}}/>
              {webSearch?"WEB ON":"WEB OFF"}
            </div>
            <div className={`chip ${speaking?"c-speak":voice?"c-v-on":"c-v-off"}`} onClick={()=>{setVoice(v=>!v);stopSpeak();setSpeaking(false);}}>
              <div className="vdot" style={{background:speaking?"var(--c1)":voice?"var(--accent2)":"var(--text3)",boxShadow:speaking?"0 0 5px var(--c1)":voice?"0 0 5px var(--accent2)":"none"}}/>
              {speaking?"SPEAKING":voice?"VOICE ON":"VOICE OFF"}
            </div>
            <div className="clk-b">
              <div className="clk">{fmtTime(time)}</div>
              <div className="dt">{fmtDate(time)}</div>
            </div>
          </div>
        </header>

        {/* STATUS BAR */}
        <div className="sbar">
          {[
            {l:"MEMORY",v:`${memory.length} NODES`,c:"var(--c1)"},null,
            {l:"WEB",v:webSearch?"ACTIVE":"OFF",c:webSearch?"var(--green)":"var(--text3)"},null,
            {l:"VOICE",v:voice?"ON":"OFF",c:voice?"var(--accent2)":"var(--text3)"},null,
            {l:"HISTORY",v:`${messages.length} MSGS`,c:"var(--c2)"},null,
            {l:"ENGINE",v:"CLAUDE SONNET",c:"var(--text2)"},null,
            {l:"STATUS",v:"ALL SYSTEMS GO",c:"var(--green)"},
          ].map((s,i)=>s===null
            ? <div key={i} className="sdiv"/>
            : <div key={i} className="si"><span className="sl">{s.l}</span><span className="sv" style={{color:s.c}}>{s.v}</span></div>
          )}
        </div>

        {/* TABS */}
        <div className="tabs">
          {[
            {id:"chat",icon:"💬",label:"Command"},
            {id:"business",icon:"⚡",label:"Modules"},
            {id:"integrations",icon:"🔗",label:"Integrations"},
            {id:"memory",icon:"🧠",label:`Memory (${memory.length})`},
          ].map(t=>(
            <button key={t.id} className={`tb ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* CHAT */}
        {tab==="chat" && (
          <div className="chat">
            <div className="msgs">
              {messages.map((m,i)=>(
                <div key={i} className={`mrow mr-${m.role==="assistant"?"v":"u"}`}>
                  <div className={`av av-${m.role==="assistant"?"v":"u"}`}>
                    {m.role==="assistant"
                      ? <VanceLogo size={20}/>
                      : <span style={{fontFamily:"'Orbitron',monospace",fontSize:"10px",color:"var(--accent2)",fontWeight:800}}>S</span>
                    }
                  </div>
                  <div className="mwrap">
                    <div className={`bub ${m.role==="assistant"?"bv":"bu"}`}>{m.content}</div>
                    {m.ts && <span className="mts">{fmtTs(m.ts)}</span>}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="mrow mr-v">
                  <div className="av av-v"><VanceLogo size={20}/></div>
                  <div className="tbub"><Thinking/></div>
                </div>
              )}
              <div ref={bottomRef}/>
            </div>
          </div>
        )}

        {/* MODULES */}
        {tab==="business" && (
          <div className="panel">
            <div className="inner">
              <p className="stitle">Quick Command Modules</p>
              <div className="qgrid">
                {QUICK.map((c,i)=>(
                  <div key={i} className="qcard" onClick={()=>{setTab("chat");setTimeout(()=>sendMessage(c.prompt),100);}}>
                    <div className="qi">{c.icon}</div>
                    <div className="ql">{c.label}</div>
                  </div>
                ))}
              </div>
              <p className="stitle">Direct Command</p>
              <div className="frow" style={{marginBottom:"20px"}}>
                <input className="field" placeholder="Type a command..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){setTab("chat");setTimeout(()=>sendMessage(),100);}}}/>
                <button className="btn bp" onClick={()=>{setTab("chat");setTimeout(()=>sendMessage(),100);}}>EXECUTE</button>
              </div>
              <p className="stitle">Session Control</p>
              <button className="btn bd" onClick={clearAll}>Clear History & Reboot VANCE</button>
            </div>
          </div>
        )}

        {/* INTEGRATIONS */}
        {tab==="integrations" && (
          <div className="panel">
            <div className="inner">
              <p className="stitle">System Integrations</p>
              <div className="igrid">
                {[
                  {icon:"🌐",name:"Live Web Search",desc:"Real-time internet access for news, prices, research.",sc:"s-live",st:"LIVE"},
                  {icon:"🎙️",name:"Voice I/O",desc:"Speak to VANCE and hear responses via browser speech.",sc:"s-live",st:"LIVE"},
                  {icon:"🧠",name:"Persistent Memory",desc:"VANCE remembers facts across all sessions.",sc:"s-live",st:"LIVE"},
                  {icon:"📱",name:"PWA / Mobile",desc:"Install on phone home screen like a native app.",sc:"s-ready",st:"READY"},
                  {icon:"📅",name:"Google Calendar",desc:"Read, create, manage events via natural language.",sc:"s-soon",st:"COMING"},
                  {icon:"📧",name:"Gmail",desc:"Read, draft, and send emails from VANCE.",sc:"s-soon",st:"COMING"},
                  {icon:"💬",name:"WhatsApp",desc:"Send messages via WhatsApp Business API.",sc:"s-soon",st:"COMING"},
                  {icon:"📂",name:"Google Drive",desc:"Access and manage your Drive documents.",sc:"s-soon",st:"COMING"},
                  {icon:"📞",name:"Call Logs",desc:"Access phone call history and contacts.",sc:"s-soon",st:"COMING"},
                  {icon:"💻",name:"Desktop App",desc:"Native Windows/Mac app via Electron.",sc:"s-soon",st:"COMING"},
                  {icon:"🔔",name:"Push Alerts",desc:"VANCE proactively notifies you of key updates.",sc:"s-soon",st:"COMING"},
                  {icon:"🏠",name:"Smart Devices",desc:"Control smart home/office via IFTTT.",sc:"s-soon",st:"COMING"},
                ].map((item,i)=>(
                  <div key={i} className="icard">
                    <h4>{item.icon} {item.name}</h4>
                    <p>{item.desc}</p>
                    <span className={`st ${item.sc}`}>{item.st}</span>
                  </div>
                ))}
              </div>
              <p className="stitle">Install VANCE on Your Phone</p>
              <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderLeft:"2px solid var(--c1)",borderRadius:"4px",padding:"13px 15px"}}>
                <p style={{fontSize:"12px",color:"var(--text2)",lineHeight:1.8,fontFamily:"'Share Tech Mono',monospace"}}>
                  {"ANDROID: Open in Chrome → Menu (⋮) → Add to Home Screen → VANCE\n\niPHONE: Open in Safari → Share (□↑) → Add to Home Screen → VANCE\n\nVANCE will appear as an app icon and run fullscreen."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* MEMORY */}
        {tab==="memory" && (
          <div className="panel">
            <div className="inner">
              <p className="stitle">VANCE Memory Bank</p>
              <p style={{fontFamily:"'Share Tech Mono',monospace",fontSize:"9px",color:"var(--text3)",letterSpacing:"1px",marginBottom:"16px"}}>
                VANCE references these in every session · Stored locally · Say "remember that..." in chat to auto-save
              </p>
              <div className="frow" style={{marginBottom:"18px"}}>
                <input className="field" placeholder="Add a fact VANCE should always know..." value={newMem} onChange={e=>setNewMem(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")addMem();}}/>
                <button className="btn bp" onClick={addMem}>SAVE</button>
              </div>
              <div className="mlist">
                {memory.length===0
                  ? <p className="memp">NO MEMORIES SAVED · ADD YOUR FIRST ABOVE</p>
                  : memory.map((m,i)=>(
                    <div key={i} className="mitem">
                      <span className="mn">#{i+1}</span>
                      <span className="mt">{m}</span>
                      <button className="mdel" onClick={()=>delMem(i)}>✕</button>
                    </div>
                  ))
                }
              </div>
              {memory.length>0 && <button className="btn bd" onClick={()=>{setMemory([]);saveMem([]);}}>Clear All Memories</button>}
            </div>
          </div>
        )}

        {/* INPUT BAR */}
        <div className="ibar">
          <div className="irow">
            {recRef.current && (
              <button className={`ibtn ib-mic ${listening?"on":""}`} onClick={toggleMic} title="Voice input">
                {listening?"🔴":"🎙️"}
              </button>
            )}
            <div className="ibox">
              <span className="ipmt">›_</span>
              <textarea
                className="ti" ref={inputRef} value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}}}
                placeholder={listening?"Listening, Senator...":"Issue your command..."}
                rows={1} disabled={loading}
              />
            </div>
            <button className="ibtn ib-send" onClick={()=>sendMessage()} disabled={loading||!input.trim()}>
              {loading?"⟳":"➤"}
            </button>
          </div>
          <p className="ihint">ENTER · SHIFT+ENTER NEW LINE · 🎙️ VOICE · 🧠 MEMORY · ⚡ MODULES · 🔗 INTEGRATIONS</p>
        </div>
      </div>
    </>
  );
}
