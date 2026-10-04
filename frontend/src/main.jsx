import React,{useState,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import './styles.css';

/* ── n8n Webhook Configuration ─────────────────────────────── */
const N8N_WEBHOOK_URL = '/api/internshield';

/*
 * Expected n8n response JSON schema:
 * {
 *   "score": 91,                  // 0-100 risk score
 *   "risk": "HIGH",               // HIGH | MEDIUM | LOW
 *   "company": "Microsoft",       // claimed company name
 *   "domain": "microsoft-xyz.com",// domain found in offer
 *   "ageDays": 12,                // domain age in days (optional)
 *   "flags": [                    // array of [label, description]
 *     ["PAYMENT REQUEST", "₹2,000 registration/security fee requested"],
 *     ...
 *   ],
 *   "summary": "...",             // AI contextual summary
 *   "actions": [                  // recommended actions / recommendations
 *     "Verify the vacancy on the company's official careers website.",
 *     ...
 *   ]
 * }
 */

/* ── API Service ───────────────────────────────────────────── */
async function callWebhook(payload) {
  const res = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`n8n returned ${res.status}${errText ? ': ' + errText : ''}`);
  }
  const parsed = await res.json();
  // Normalize — n8n may wrap the result in an array
  const data = Array.isArray(parsed) ? parsed[0] : parsed;
  return data;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ── Helpers ───────────────────────────────────────────────── */
function parseAiPayload(value) {
  if (!value) return null;

  if (typeof value === "object") {
    return value;
  }

  let raw = String(value).trim();

  raw = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "string" ? parseAiPayload(parsed) : parsed;
  } catch {}

  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(raw.slice(firstBrace, lastBrace + 1));
    } catch {}
  }

  return null;
}

function riskLabel(risk) {
  const r = (risk || 'UNKNOWN').toUpperCase();
  if (r === 'HIGH') return 'HIGH RISK';
  if (r === 'MEDIUM') return 'MEDIUM RISK';
  if (r === 'LOW') return 'LOW RISK';
  return r + ' RISK';
}

function riskClass(risk) {
  return (risk || '').toLowerCase();
}

/* ── App ───────────────────────────────────────────────────── */
function App(){
  const [page,setPage]=useState('home');
  const [text,setText]=useState('');
  const [file,setFile]=useState(null);
  const [result,setResult]=useState(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState(null);
  const [history,setHistory]=useState([]);
  const fileRef=useRef(null);

  /* ── File handling ─────────────────────────────────────── */
  const onFileSelect = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  const clearFile = () => {
    setFile(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  /* ── Analyze ───────────────────────────────────────────── */
  const analyze = async () => {
    if (!text.trim() && !file) return;
    setBusy(true);
    setError(null);
    try {
      // Build the exact payload n8n expects
      const payload = {
        inputType: 'text',
        text: text.trim(),
        url: '',
      };

      const data = await callWebhook(payload);
      console.log('FINAL N8N DATA', data);

      // Validate minimum response structure
      if (!data || typeof data.score === 'undefined') {
        throw new Error('Invalid response from n8n — missing "score" field. Check your workflow output.');
      }

      // Ensure flags is always an array of [label, description]
      if (data.flags && !Array.isArray(data.flags)) {
        data.flags = [];
      }

      setResult(data);
      setHistory(prev => [{ ...data, analyzedAt: new Date().toISOString() }, ...prev].slice(0, 50));
      setPage('result');
    } catch (err) {
      console.error('InternShield analysis error:', err);
      setError('n8n is not reachable. Make sure n8n is running and the webhook is listening.');
    } finally {
      setBusy(false);
    }
  };

  /* ── Computed dashboard stats from history ──────────────── */
  const stats = {
    total: history.length,
    high: history.filter(h => (h.risk||'').toUpperCase() === 'HIGH').length,
    medium: history.filter(h => (h.risk||'').toUpperCase() === 'MEDIUM').length,
    domains: new Set(history.map(h => h.domain).filter(Boolean)).size,
  };

return <div className="app"><div className="orb o1"/><div className="orb o2"/><header><button className="brand" onClick={()=>setPage('home')}><span className="shield">✦</span><span>Intern<span>Shield</span></span></button><nav><button onClick={()=>setPage('home')}>Analyze</button><button onClick={()=>setPage('dashboard')}>Command Center</button><button onClick={()=>setPage('learn')}>Learn</button></nav><div className="status"><i/> LOCAL-FIRST</div></header>
{page==='home'&&<main className="hero"><div className="eyebrow">AI-POWERED RECRUITMENT FRAUD INTELLIGENCE</div><h1>Verify before<br/><em>you trust.</em></h1><p className="lead">Submit an internship or job offer in almost any common format. InternShield extracts evidence, checks multiple signals, and explains the risk.</p><section className="analyzer"><div className="drop" onDragOver={e=>e.preventDefault()} onDrop={onDrop} onClick={()=>fileRef.current?.click()}><input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.eml,.txt" style={{display:'none'}} onChange={onFileSelect}/>{file?<><div className="dropIcon">✓</div><strong>{file.name}</strong><span>{(file.size/1024).toFixed(1)} KB · {file.type||'unknown'}</span><small onClick={e=>{e.stopPropagation();clearFile()}} style={{cursor:'pointer',color:'#ff6d78'}}>✕ Remove file</small></>:<><div className="dropIcon">↥</div><strong>Drop suspicious evidence here</strong><span>PDF · Screenshot · Image · Email</span><small>or paste the message, link, or offer text below</small></>}</div><textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Paste a suspicious internship/job offer, email, or URL..."/>{error&&<div className="errorBanner">⚠ {error}<button onClick={()=>setError(null)} className="errorClose">✕</button></div>}<div className="row"><span className="privacy">◉ Local-first · zero data shared externally</span><button className="primary" disabled={busy||(!text.trim()&&!file)} onClick={analyze}>Analyze offer <b>→</b></button></div></section><div className="miniStats"><div><b>Multi-modal</b><span>Text · image · PDF · URL</span></div><div><b>Evidence-first</b><span>Rules + domain + AI</span></div><div><b>Explainable</b><span>Every flag has a reason</span></div></div></main>}
{page==='result'&&result&&(()=>{
  const data = result;

  let ai = parseAiPayload(data.aiAnalysis);

  // If aiAnalysis was an object but its summary contains the
  // complete JSON object, parse the summary too.
  if (
    ai &&
    typeof ai.summary === "string"
  ) {
    const nested = parseAiPayload(ai.summary);

    if (
      nested &&
      typeof nested === "object" &&
      (
        "summary" in nested ||
        "additionalRedFlags" in nested ||
        "questionsToAsk" in nested ||
        "recommendations" in nested
      )
    ) {
      ai = nested;
    }
  }

  let aiSummary =
    ai?.summary ||
    data.aiSummary ||
    data.summary ||
    "";

  // Ensure aiSummary never retains raw markdown code fences or raw JSON string
  if (typeof aiSummary === "string") {
    const trimmed = aiSummary.trim();
    if (trimmed.startsWith("```") || trimmed.startsWith("{")) {
      const parsedAgain = parseAiPayload(trimmed);
      if (parsedAgain && typeof parsedAgain === "object" && typeof parsedAgain.summary === "string") {
        aiSummary = parsedAgain.summary;
      }
    }
    aiSummary = aiSummary
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
  }

  const additionalRedFlags =
    Array.isArray(ai?.additionalRedFlags)
      ? ai.additionalRedFlags
      : Array.isArray(data.additionalRedFlags)
        ? data.additionalRedFlags
        : [];

  const questionsToAsk =
    Array.isArray(ai?.questionsToAsk)
      ? ai.questionsToAsk
      : Array.isArray(data.questionsToAsk)
        ? data.questionsToAsk
        : [];

  const recommendations =
    Array.isArray(ai?.recommendations)
      ? ai.recommendations
      : Array.isArray(data.recommendations)
        ? data.recommendations
        : (Array.isArray(data.actions) ? data.actions : []);

  return (
    <main className="content">
      <button className="back" onClick={()=>setPage('home')}>← New analysis</button>
      <div className="resultTop">
        <div>
          <div className="eyebrow">ANALYSIS COMPLETE</div>
          <h2>Risk assessment</h2>
        </div>
        <div className={`risk risk-${riskClass(data.risk)}`}>
          <span>{riskLabel(data.risk)}</span>
          <strong>{data.score}</strong>
          <small>/ 100</small>
        </div>
      </div>
      <div className="grid">
        <section className="panel">
          <div className="panelTitle">Evidence detected</div>
          {(data.flags||[]).length===0&&<p className="summary">No specific flags were detected.</p>}
          {(data.flags||[]).map((f,i)=>(
            <div className="flag" key={i}>
              <span>!</span>
              <div>
                <b>{Array.isArray(f)?f[0]:(f.label||f.title||f.name||(typeof f==='string'?f:'FLAG'))}</b>
                <p>{Array.isArray(f)?f[1]:(f.description||f.desc||'')}</p>
              </div>
            </div>
          ))}
        </section>
        <section className="panel">
          <div className="panelTitle">Domain intelligence</div>
          {data.domain ? (
            <div className="domain">
              <b>{data.domain}</b>
              {(data.company || data.organization) && (
                <span>Claimed organization: {data.company || data.organization}</span>
              )}
              {data.registrationDate && (
                <span style={{ display: 'block', marginTop: '4px' }}>
                  Registration date: {data.registrationDate.includes('T') ? data.registrationDate.split('T')[0] : data.registrationDate}
                </span>
              )}
              {(data.domainAgeDays != null || data.ageDays != null) && (
                <div className="domainAge">
                  <strong>{data.domainAgeDays != null ? data.domainAgeDays : data.ageDays}</strong>
                  <span>days old</span>
                </div>
              )}
            </div>
          ) : (
            <div className="domain">
              <b>N/A</b>
              <span>Claimed organization: {data.company || data.organization || 'Unknown'}</span>
            </div>
          )}
          {(data.domainAgeDays != null || data.ageDays != null) && (
            <div className="notice">⚠ Recently registered domains can be a risk signal, but domain age alone does not prove fraud.</div>
          )}
        </section>
        <section className="panel wide">
          <div className="panelTitle">AI contextual analysis</div>
          {aiSummary?<p className="summary">{aiSummary}</p>:<p className="summary">No AI summary available.</p>}
          {additionalRedFlags.length>0&&<>
            <div className="panelTitle" style={{marginTop:'18px'}}>Additional red flags</div>
            {additionalRedFlags.map((rf,i)=><div className="flag" key={'rf'+i}><span>⚠</span><div><p>{typeof rf==='string'?rf:(rf.description||rf.text||rf.reason||rf.flag||'')}</p></div></div>)}
          </>}
          {questionsToAsk.length>0&&<>
            <div className="panelTitle" style={{marginTop:'18px'}}>Questions to ask</div>
            <div className="actions">{questionsToAsk.map((q,i)=><div key={'q'+i}><span>?</span>{typeof q==='string'?q:(q.question||q.text||'')}</div>)}</div>
          </>}
        </section>
        <section className="panel wide">
          <div className="panelTitle">What you should do</div>
          {recommendations.length>0?<div className="actions">{recommendations.map((a,i)=><div key={i}><span>{i<2?'✓':'×'}</span>{typeof a==='string'?a:(a.action||a.recommendation||a.text||'')}</div>)}</div>:<p className="summary">No specific recommendations available.</p>}
        </section>
      </div>
    </main>
  );
})()}
{page==='dashboard'&&<main className="content"><div className="eyebrow">INTERN SHIELD / COMMAND CENTER</div><div className="dashHead"><div><h2>Threat intelligence</h2><p>Live-style overview of analyzed recruitment offers.</p></div><button className="primary" onClick={()=>setPage('home')}>+ New analysis</button></div><div className="cards"><Stat n={stats.total.toLocaleString()} l="Offers analyzed"/><Stat n={stats.high.toLocaleString()} l="High risk" danger/><Stat n={stats.medium.toLocaleString()} l="Medium risk"/><Stat n={stats.domains.toLocaleString()} l="Flagged domains"/></div><div className="dashgrid"><section className="panel chart"><div className="panelTitle">Risk distribution</div><div className="bars">{history.length>0?history.slice(0,7).map((h,i)=><i key={i} style={{height:Math.max(10,h.score)+'%'}} title={`${h.domain||'?'}: ${h.score}`}/>):<>{[82,56,34,70,46,88,61].map((h,i)=><i key={i} style={{height:h+'%'}}/>)}</>}</div><div className="legend"><span>● High</span><span>● Medium</span><span>● Low</span></div></section><section className="panel"><div className="panelTitle">Recent detections</div>{history.length>0?history.slice(0,4).map((x,i)=><div className="recent" key={i}><span>{x.domain||'unknown'}</span><b className={riskClass(x.risk)}>{x.score}</b></div>):[['microsoft-careers-xyz.com','91','HIGH'],['amazon-internship.xyz','88','HIGH'],['company-careers.in','64','MEDIUM'],['officialcompany.com','12','LOW']].map((x,i)=><div className="recent" key={i}><span>{x[0]}</span><b className={x[2].toLowerCase()}>{x[1]}</b></div>)}</section></div></main>}
{page==='learn'&&<main className="content"><div className="eyebrow">STUDENT SAFETY / LEARN</div><h2>Know the patterns.</h2><p className="lead small">Scammers often repeat recognizable recruitment patterns. InternShield turns these patterns into explainable signals.</p><div className="learnGrid">{[['₹','Upfront payment','Registration, security or training fees.'],['!','OTP & identity','Requests for OTPs, Aadhaar, PAN or banking credentials.'],['@','Fake domains','Lookalike or newly registered recruitment domains.'],['◉','Urgency','Pressure to pay, accept or share information immediately.'],['⌁','Private channels','WhatsApp-only or personal-email recruitment.'],['✓','Verify independently','Use the company\u2019s official website and contact channels.']].map((x,i)=><div className="learnCard" key={i}><b>{x[0]}</b><h3>{x[1]}</h3><p>{x[2]}</p></div>)}</div></main>}
{busy&&<div className="modal"><div className="loader"><div className="spin"/><h3>Analyzing evidence</h3><p>Sending to n8n · extracting signals · building risk assessment</p></div></div>}
<footer>INTERN<span>SHIELD</span><small>Risk assessment, not proof of fraud. Always verify through official channels.</small></footer></div>}
function Stat({n,l,danger}){return <div className="stat"><strong className={danger?'danger':''}>{n}</strong><span>{l}</span></div>}
createRoot(document.getElementById('root')).render(<App/>);

