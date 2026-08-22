/**
 * Signal Room design reminder: Swiss observability canvas, graphite + mineral surfaces,
 * Quorum Lime for verified state, cyan for observation, coral for challenge, and
 * Space Grotesk + IBM Plex Mono for a precise evidence-workbench feel.
 */
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleDot,
  Clipboard,
  Code2,
  Download,
  ExternalLink,
  FileCheck2,
  GitBranch,
  Layers3,
  Link2,
  LockKeyhole,
  Menu,
  Network,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  EVIDENCEQUORUM_ADDRESS,
  type CanonicalAttestation,
  readLiveContractState,
  submitAttestation,
  submitChallenge,
} from "@/lib/genlayer";

const heroImage = "/manus-storage/evidencequorum-hero_6ed527c1.png";
const textureImage = "/manus-storage/evidencequorum-texture_139b8e1a.png";
const evidenceMap = "/manus-storage/evidencequorum-evidence-map_20f710b1.png";
const logoImage = "/manus-storage/evidencequorum-logo_a26bd26b.png";
const explorerUrl = "https://explorer-studio.genlayer.com/address/0x11Bf9d2268Eccb8539A17528586E324b1cFDdbC8";
const githubUrl = "https://github.com/farzad-eth/evidencequorum";

const codeSnippet = `def validate_assessment(leader_result):
    if not isinstance(leader_result, gl.vm.Return):
        return False
    leader = leader_result.calldata
    validator = assess_sources()  # fresh source fetch
    return decision_signature(leader) == \
           decision_signature(validator)

result = gl.vm.run_nondet_unsafe(
    assess_sources, validate_assessment
)`;

const pipeline = [
  { id: "01", label: "Sources", title: "Bounded evidence captures", copy: "2–8 HTTPS sources are independently rendered into bounded text. Captures are untrusted evidence, never instructions.", icon: Network, color: "cyan" },
  { id: "02", label: "Adjudication", title: "Independent judgment", copy: "Leader and validators fetch and assess the same bounded source set; each result cites direct source quotations.", icon: Sparkles, color: "lime" },
  { id: "03", label: "Equivalence", title: "Decision over prose", copy: "Consensus compares the status and material source set, not free-form wording or a JSON schema alone.", icon: ShieldCheck, color: "coral" },
  { id: "04", label: "State", title: "Immutable evidence trail", copy: "The decision, bounded captures, citations, timestamp, and challenge state become durable contract records.", icon: FileCheck2, color: "paper" },
];

const states = {
  evidence: { eyebrow: "01 / source set", title: "Public evidence enters the room.", copy: "EvidenceQuorum accepts a proposition and a bounded set of source URLs. It stores bounded rendered captures and the cited quotation from every accepted source, so a record remains inspectable after a URL changes.", metric: "02—08", metricLabel: "HTTPS SOURCES" },
  consensus: { eyebrow: "02 / validator agreement", title: "Consensus is an evidence boundary.", copy: "A valid schema is not enough. Validators independently fetch the source set, derive a decision, and must agree with the leader on status and material evidence before state changes.", metric: "02", metricLabel: "INDEPENDENT READS" },
  record: { eyebrow: "03 / durable state", title: "A claim becomes inspectable state.", copy: "The contract appends an Attestation plus its bounded immutable evidence capture. A challenge marks the record without erasing the decision trail.", metric: "07", metricLabel: "DIRECT TESTS" },
};

const initialSources = [
  "https://",
  "https://",
];

function isPublicHttpsSource(value: string): boolean {
  try {
    const url = new URL(value.trim());
    const host = url.hostname.toLowerCase();
    if (url.protocol !== "https:" || !host || host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) return false;
    if (host === "::1" || host === "[::1]") return false;

    const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (!ipv4) return true;
    const octets = ipv4.slice(1).map(Number);
    if (octets.some((octet) => octet > 255)) return false;
    const [first, second] = octets;
    return !(
      first === 0 || first === 10 || first === 127 || first >= 224 ||
      (first === 169 && second === 254) ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && second === 168)
    );
  } catch {
    return false;
  }
}

export default function Home() {
  const [activeState, setActiveState] = useState<keyof typeof states>("consensus");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const [claim, setClaim] = useState("The submitted proposition is supported by two independent public sources.");
  const [sources, setSources] = useState(initialSources);
  const [dossierStatus, setDossierStatus] = useState<"draft" | "ready" | "writing" | "accepted" | "challenged" | "error">("draft");
  const [liveAttestation, setLiveAttestation] = useState<CanonicalAttestation | null>(null);
  const [liveCount, setLiveCount] = useState(0);
  const [readStatus, setReadStatus] = useState<"idle" | "loading" | "ready" | "error">("loading");
  const [liveError, setLiveError] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [showPacket, setShowPacket] = useState(false);
  const current = states[activeState];

  const validSources = useMemo(() => {
    const seen = new Set<string>();
    return sources.filter((source) => {
      if (!isPublicHttpsSource(source)) return false;
      const canonical = source.trim();
      if (seen.has(canonical)) return false;
      seen.add(canonical);
      return true;
    });
  }, [sources]);
  const statusLabel = dossierStatus === "writing" ? "WALLET / PENDING" : dossierStatus === "error" ? "RETRY NEEDED" : dossierStatus === "challenged" ? "CHALLENGED" : dossierStatus === "accepted" ? liveAttestation?.status ?? "ACCEPTED" : dossierStatus === "ready" ? "READY TO ATTEST" : readStatus === "loading" ? "READING GENLAYER" : "DRAFT";
  const statusColor = dossierStatus === "error" || dossierStatus === "challenged" ? "coral" : dossierStatus === "accepted" ? "lime" : "cyan";

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  const updateSource = (index: number, value: string) => setSources((currentSources) => currentSources.map((source, sourceIndex) => sourceIndex === index ? value : source));
  const addSource = () => sources.length < 8 && setSources([...sources, "https://"]);
  const removeSource = (index: number) => sources.length > 2 && setSources(sources.filter((_, sourceIndex) => sourceIndex !== index));
  const refreshLiveState = async () => {
    setReadStatus("loading");
    setLiveError(null);
    try {
      const state = await readLiveContractState();
      setLiveCount(state.count);
      setLiveAttestation(state.latest);
      setReadStatus("ready");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to read the deployed EvidenceQuorum contract.";
      setLiveError(message);
      setReadStatus("error");
    }
  };
  useEffect(() => { void refreshLiveState(); }, []);

  const prepareDossier = () => {
    if (validSources.length < 2 || claim.trim().length < 20) {
      setDossierStatus("draft");
      toast.error("A live attestation needs a proposition of 20+ characters and at least two distinct public HTTPS sources.");
      return;
    }
    setDossierStatus("ready");
    toast.success("Packet preflight passed. The next step opens your wallet for a GenLayer transaction.");
  };
  const submitLiveAttestation = async () => {
    if (validSources.length < 2 || claim.trim().length < 20) {
      prepareDossier();
      return;
    }
    setDossierStatus("writing");
    setLiveError(null);
    try {
      const write = await submitAttestation(claim.trim(), validSources);
      setTransactionHash(write.txHash);
      setWalletAddress(write.walletAddress);
      await refreshLiveState();
      setDossierStatus("accepted");
      toast.success("GenLayer accepted the attestation transaction. Canonical state was refreshed.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "The GenLayer attestation transaction was not completed.";
      setLiveError(message);
      setDossierStatus("error");
      toast.error(message);
    }
  };
  const challengeLiveRecord = async () => {
    if (!liveAttestation) {
      toast.error("There is no canonical attestation to challenge yet. Read the contract or submit one first.");
      return;
    }
    setDossierStatus("writing");
    setLiveError(null);
    try {
      const write = await submitChallenge(liveAttestation.claimId);
      setTransactionHash(write.txHash);
      setWalletAddress(write.walletAddress);
      await refreshLiveState();
      setDossierStatus("challenged");
      toast.success("GenLayer accepted the challenge transaction. The canonical record was refreshed.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "The GenLayer challenge transaction was not completed.";
      setLiveError(message);
      setDossierStatus("error");
      toast.error(message);
    }
  };

  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="EvidenceQuorum home"><img src={logoImage} alt="" className="brand-mark" /><span>evidence<span>quorum</span></span></a>
        <nav className={mobileOpen ? "nav-links is-open" : "nav-links"} aria-label="Main navigation">
          <button onClick={() => scrollTo("workspace")}>Workspace</button>
          <button onClick={() => scrollTo("how-it-works")}>How it works</button>
          <button onClick={() => scrollTo("proof")}>Proof surface</button>
          <a href={explorerUrl} target="_blank" rel="noreferrer">Explorer <ExternalLink size={13} /></a>
        </nav>
        <button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation">{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button>
        <button className="top-cta" onClick={() => scrollTo("workspace")}>Open dossier <ArrowUpRight size={15} /></button>
      </header>

      <aside className="evidence-rail" aria-label="EvidenceQuorum sections"><div className="rail-pulse"><span /> quorum online</div><div className="rail-track"><span className="rail-node rail-node-lime"><i />01</span><span className="rail-node rail-node-cyan"><i />02</span><span className="rail-node rail-node-coral"><i />03</span><span className="rail-node rail-node-paper"><i />04</span><span className="rail-node rail-node-lime"><i />05</span></div><div className="rail-label">EVIDENCE / CONSENSUS / STATE</div><div className="rail-index">01—07</div></aside>

      <section id="top" className="hero-section">
        <div className="hero-image" style={{ backgroundImage: `url(${heroImage})` }} /><div className="hero-noise" />
        <div className="container hero-grid"><div className="hero-copy"><div className="overline"><span className="status-dot" /> GENLAYER PROJECT EDITION / EVIDENCE WORKBENCH</div><h1>Consensus for claims that <em>code</em> cannot settle.</h1><p className="hero-lede">EvidenceQuorum turns conflicting public web information into conservative, auditable attestations—without pretending that one model is an oracle.</p><div className="hero-actions"><button className="button button-primary" onClick={() => scrollTo("workspace")}>Create an evidence packet <ArrowDownRight size={17} /></button><button className="button button-ghost" onClick={() => setCodeOpen(true)}><Code2 size={16} /> Read the contract</button></div><div className="hero-footnote"><span>01</span> A deployed contract primitive, with live reads and explicit wallet-backed writes.</div></div><div className="hero-readout"><div className="readout-head"><span>LIVE GENLAYER READ</span><span>EQ / 002</span></div><div className="readout-body"><div className="readout-signal"><CircleDot size={16} /><span>CONTRACT STATE</span><strong>{readStatus === "ready" ? (liveAttestation?.status ?? "EMPTY") : readStatus === "error" ? "UNAVAILABLE" : "READING"}</strong></div><div className="readout-lines"><i /><i /><i /><i /></div><div className="readout-footer"><span>canonical records</span><strong>{readStatus === "ready" ? liveCount : "—"}</strong></div></div></div></div>
      </section>

      <section id="workspace" className="workspace-section">
        <div className="container workspace-grid">
          <div className="workspace-intro"><div className="section-kicker">THE WORKSPACE <span>— 01</span></div><h2>Make a claim.<br /><em>Keep the trail.</em></h2><p>Build an evidence packet, then submit it through an explicit browser-wallet transaction. The dossier reads canonical contract state before and after every accepted write.</p><div className="workspace-note"><span className={`state-marker ${readStatus === "error" ? "coral" : readStatus === "ready" ? "lime" : "cyan"}`} /> <strong>{readStatus === "ready" ? "LIVE READ CONNECTED" : readStatus === "error" ? "LIVE READ ERROR" : "READING CONTRACT"}</strong><span>{readStatus === "ready" ? `${liveCount} canonical record${liveCount === 1 ? "" : "s"} loaded from GenLayer` : liveError ?? "Querying deployed Studio contract"}</span></div><div className="panel-actions"><button className="button button-small" onClick={() => void refreshLiveState()} disabled={readStatus === "loading"}><RotateCcw size={15} /> Refresh live state</button></div><a className="text-link" href={explorerUrl} target="_blank" rel="noreferrer">Inspect deployed contract <ExternalLink size={15} /></a></div>
          <div className="dossier-panel"><div className="panel-top"><div><span className="panel-kicker">DOSSIER / NEW</span><h3>Evidence intake</h3></div><span className="panel-state"><i className={`state-marker ${statusColor}`} /> {statusLabel}</span></div><label className="field-label" htmlFor="claim">PROPOSITION</label><textarea id="claim" className="claim-input" value={claim} onChange={(event) => { setClaim(event.target.value); setDossierStatus("draft"); }} />
            <div className="source-header"><label className="field-label">SOURCE SET / {sources.length.toString().padStart(2, "0")}</label><span className="source-hint">PUBLIC HTTPS · 2 MINIMUM</span></div>
            <div className="source-list">{sources.map((source, index) => <div className="source-row" key={`${index}-${source}`}><span className="source-index">0{index + 1}</span><Link2 size={14} /><input aria-label={`Evidence source ${index + 1}`} value={source} onChange={(event) => updateSource(index, event.target.value)} /><button className="icon-button" onClick={() => removeSource(index)} aria-label={`Remove source ${index + 1}`} disabled={sources.length <= 2}><X size={14} /></button></div>)}</div>
            <div className="panel-actions"><button className="button button-primary" onClick={prepareDossier}><ShieldCheck size={15} /> Validate packet</button><button className="button button-small" onClick={addSource} disabled={sources.length >= 8}><Plus size={15} /> Add source</button></div><div className="panel-footer"><span><LockKeyhole size={13} /> preflight only / no state is written</span><span>{validSources.length} valid sources</span></div>
          </div>
        </div>
      </section>

      {dossierStatus !== "draft" && <section className={`attestation-section ${dossierStatus}`}><div className="container attestation-grid"><div><div className="section-kicker">PACKET STATUS <span>— 02</span></div><h2>{dossierStatus === "ready" ? "Ready for a" : dossierStatus === "writing" ? "Waiting for a" : dossierStatus === "accepted" ? "Canonical state" : dossierStatus === "error" ? "Transaction needs" : "Challenge state"}<br /><em>{dossierStatus === "ready" ? "network write." : dossierStatus === "writing" ? "wallet decision." : dossierStatus === "accepted" ? "is re-read." : dossierStatus === "error" ? "your attention." : "is preserved."}</em></h2><p>{dossierStatus === "ready" ? "The packet passed local input checks. Submitting now opens your wallet and calls EvidenceQuorum.attest on GenLayer." : dossierStatus === "writing" ? "No result is assumed while the wallet and GenLayer consensus flow are in progress." : dossierStatus === "accepted" ? "This card is populated from a fresh read of the deployed contract after the accepted transaction." : dossierStatus === "error" ? liveError ?? "The contract transaction did not complete, so no canonical state is shown." : "The challenge call updates the canonical record without deleting its source snapshot."}</p></div><div className="attestation-card"><div className="record-top"><span className="record-id">{liveAttestation ? `GENLAYER / ${liveAttestation.claimId.toUpperCase()}` : "PACKET / PREFLIGHT"}</span><span className={`record-status ${statusColor}`}><i /> {statusLabel}</span></div><div className="record-claim">“{liveAttestation?.claim ?? claim}”</div><div className="record-details"><div><span>CONFIDENCE</span><strong>{liveAttestation ? liveAttestation.confidence : "—"}<span>/100</span></strong></div><div><span>SOURCES</span><strong>{(liveAttestation?.sourceCount ?? validSources.length).toString().padStart(2, "0")}</strong></div><div><span>REVISION</span><strong>{liveAttestation ? liveAttestation.revision + 1 : "—"}</strong></div></div><div className="record-footer"><span>{transactionHash ? `GENLAYER TX / ${transactionHash.slice(0, 10)}…${transactionHash.slice(-6)}` : liveAttestation ? "CANONICAL READ CONFIRMED" : "AWAITING EXPLICIT WALLET WRITE"}</span><FileCheck2 size={15} /></div></div></div><div className="container attestation-actions"><button className="button button-primary" onClick={() => void submitLiveAttestation()} disabled={dossierStatus === "writing"}><Zap size={15} /> Submit to GenLayer</button><button className="button button-outline" onClick={() => void challengeLiveRecord()} disabled={!liveAttestation || dossierStatus === "writing" || liveAttestation.challenged}><RotateCcw size={15} /> Challenge on GenLayer</button><button className="button button-ghost-dark" onClick={() => setShowPacket(true)}><Download size={15} /> View evidence packet</button></div>{walletAddress && <div className="container"><p className="transaction-note">Wallet: {walletAddress} · Contract: {EVIDENCEQUORUM_ADDRESS}</p></div>}</section>}

      <section className="manifesto-section" id="proof"><div className="container manifesto-grid"><div className="section-kicker">WHY THIS MATTERS <span>— 03</span></div><div className="manifesto-copy"><p className="display-copy">The internet is full of claims. Blockchains are good at state. <mark>EvidenceQuorum is the missing room between them.</mark></p><p className="body-copy">It packages the hard part—source handling, validator judgment, equivalence, and challenge history—into an inspectable contract primitive that other builders can compose.</p></div><div className="manifesto-aside"><span>THE DESIGN BET</span><strong>Meaning<br />over wording.</strong><div className="signal-tags"><span className="signal-tag cyan">OBSERVATION / 02 SOURCES</span><span className="signal-tag lime">CONSENSUS / VALID</span><span className="signal-tag coral">CHALLENGE / PRESERVED</span></div><ArrowDownRight size={23} /></div></div></section>

      <section id="how-it-works" className="pipeline-section"><div className="container"><div className="section-heading"><div><div className="section-kicker">THE EVIDENCE PATH <span>— 04</span></div><h2>From source<br /><em>to state.</em></h2><div className="instrument-strip"><span>ROUTE / 04 NODES</span><span>VALIDATORS / SEMANTIC</span><span>STATE / DURABLE</span></div></div><p>Four deliberate boundaries keep the contract conservative. Explore each layer to see what is observed, what is judged, and what finally persists.</p></div><div className="pipeline-grid">{pipeline.map((step, i) => { const Icon = step.icon; const stateKey = i === 0 ? "evidence" : i < 3 ? "consensus" : "record"; return <button key={step.id} className={`pipeline-card ${activeState === stateKey ? "is-active" : ""}`} onClick={() => setActiveState(stateKey as keyof typeof states)}><div className={`icon-orb ${step.color}`}><Icon size={19} /></div><div className="card-number">{step.id}</div><div className="card-label">{step.label}</div><h3>{step.title}</h3><p>{step.copy}</p><span className="card-arrow"><ArrowUpRight size={15} /></span></button>; })}</div><div className="state-console"><div className="console-copy"><div className="section-kicker">{current.eyebrow}</div><h3>{current.title}</h3><p>{current.copy}</p></div><div className="console-stat"><span>{current.metricLabel}</span><strong>{current.metric}</strong><div className="stat-bar"><i style={{ width: activeState === "record" ? "100%" : activeState === "consensus" ? "74%" : "54%" }} /></div></div></div></div></section>

      <section className="proof-section"><div className="container proof-grid"><div className="proof-visual"><img src={evidenceMap} alt="Abstract diagram showing independent sources converging into one quorum result" /><div className="visual-caption"><span>FIG 01</span><span>INDEPENDENT OBSERVATION → CONSTRAINED RESULT</span></div></div><div className="proof-copy"><div className="section-kicker">THE PROOF SURFACE <span>— 05</span></div><div className="proof-readout"><span>BOUNDARY / EVIDENCE + DECISION</span><strong>VERIFY</strong></div><h2>Not a schema check.<br /><em>An evidence test.</em></h2><p>LLM output is non-deterministic. The contract does not accept a verdict because its JSON looks valid: validators independently fetch the bounded sources and must agree on the evidence-backed decision.</p><div className="invariant-list"><div><Check size={14} /><span>Bounded immutable source captures</span></div><div><Check size={14} /><span>Direct quotation per material source</span></div><div><Check size={14} /><span>Independent decision agreement</span></div><div><Check size={14} /><span>Challenge does not erase history</span></div></div><button className="text-link" onClick={() => setCodeOpen(true)}>See the validator boundary <ArrowUpRight size={15} /></button></div></div></section>

      <section className="record-section" style={{ backgroundImage: `url(${textureImage})` }}><div className="container record-grid"><div className="record-intro"><div className="section-kicker">THE DEPLOYMENT <span>— 06</span></div><div className="deployment-readout"><span>CONTRACT / STUDIO</span><strong>0x11B…dbC8</strong></div><h2>A real contract<br /><em>behind the surface.</em></h2><p>EvidenceQuorum is deployed in GenLayer Studio. This application reads its canonical state through GenLayerJS and opens a browser-wallet confirmation before `attest` or `challenge` can write.</p><div className="deployment-links"><a href={explorerUrl} target="_blank" rel="noreferrer"><GitBranch size={14} /> Explorer contract <ExternalLink size={13} /></a><a href={githubUrl} target="_blank" rel="noreferrer"><Code2 size={14} /> Source repository <ExternalLink size={13} /></a></div></div><div className="record-card"><div className="record-top"><span className="record-id">CONTRACT / 0x11B…dbC8</span><span className="record-status"><i /> LIVE READ</span></div><div className="record-claim">“The contract is deployed, readable without a wallet, and only changes after an explicit signed transaction.”</div><div className="record-details"><div><span>DIRECT TESTS</span><strong>07</strong></div><div><span>STATES</span><strong>03</strong></div><div><span>SOURCES</span><strong>02—08</strong></div></div><div className="record-footer"><span>GENLAYERJS CLIENT ATTACHED</span><FileCheck2 size={15} /></div></div></div></section>

      <section id="builders" className="builder-section"><div className="container builder-grid"><div><div className="section-kicker">FOR BUILDERS <span>— 07</span></div><h2>Ship the evidence<br /><em>layer, not a demo.</em></h2></div><div className="builder-copy"><p>Use EvidenceQuorum where deterministic bytecode stops: DAO proposal gates, grant review, vendor due diligence, compliance checklists, and insurance-event attestations.</p><div className="builder-actions"><a className="button button-primary" href={githubUrl} target="_blank" rel="noreferrer">Inspect source <Code2 size={16} /></a><a className="button button-outline" href="https://docs.genlayer.com/developers/intelligent-contracts/equivalence-principle" target="_blank" rel="noreferrer">Read GenLayer docs <ExternalLink size={15} /></a></div></div></div><div className="container builder-stats"><div><strong>07</strong><span>DIRECT TESTS PASSED</span></div><div><strong>2—8</strong><span>SOURCE QUORUM</span></div><div><strong>3</strong><span>CONSERVATIVE STATES</span></div><div><strong>1</strong><span>EVIDENCE-BOUND PRIMITIVE</span></div></div></section>

      <footer className="footer"><div className="container footer-inner"><a className="brand" href="#top"><img src={logoImage} alt="" className="brand-mark" /><span>evidence<span>quorum</span></span></a><div className="footer-note">A GenLayer Intelligent Contract primitive<br />for the verifiable web.</div><div className="footer-links"><a href={explorerUrl} target="_blank" rel="noreferrer">Deployed Explorer <ExternalLink size={13} /></a><a href={githubUrl} target="_blank" rel="noreferrer">Source on GitHub <ExternalLink size={13} /></a></div></div></footer>

      {codeOpen && <div className="code-modal-backdrop" role="presentation" onClick={() => setCodeOpen(false)}><div className="code-modal" role="dialog" aria-modal="true" aria-labelledby="code-title" onClick={(event) => event.stopPropagation()}><div className="modal-head"><div><div className="section-kicker">CONSENSUS PREDICATE</div><h3 id="code-title">The boundary is the feature.</h3></div><button onClick={() => setCodeOpen(false)} aria-label="Close source viewer"><X size={18} /></button></div><pre><code>{codeSnippet}</code></pre><div className="modal-foot"><span><LockKeyhole size={14} /> exact prose is not required</span><span>PY / GENVM</span></div></div></div>}
      {showPacket && <div className="code-modal-backdrop" role="presentation" onClick={() => setShowPacket(false)}><div className="packet-modal" role="dialog" aria-modal="true" aria-labelledby="packet-title" onClick={(event) => event.stopPropagation()}><div className="modal-head"><div><div className="section-kicker">EVIDENCE PACKET</div><h3 id="packet-title">{liveAttestation ? "Canonical contract record." : "Proposed packet before signing."}</h3></div><button onClick={() => setShowPacket(false)} aria-label="Close packet viewer"><X size={18} /></button></div><div className="packet-list"><div><Clipboard size={16} /><span>Proposition</span><strong>{liveAttestation?.claim ?? claim}</strong></div><div><Layers3 size={16} /><span>Sources</span><strong>{(liveAttestation?.sources ?? validSources).length} bounded HTTPS URLs attached</strong></div><div><ShieldCheck size={16} /><span>Status</span><strong>{liveAttestation ? `${liveAttestation.status} · confidence ${liveAttestation.confidence}` : "PRE-SIGNING · no canonical state"}</strong></div><div><FileCheck2 size={16} /><span>Evidence binding</span><strong>{liveAttestation ? `${liveAttestation.evidence.length} immutable captures · ${liveAttestation.evidence.filter((item) => item.materialQuote).length} material quotations` : "Captures and quotations will become canonical only after acceptance"}</strong></div><div><FileCheck2 size={16} /><span>Provenance</span><strong>{liveAttestation ? `${liveAttestation.claimId} · immutable evidence read from GenLayer` : "Will become canonical only after an accepted transaction"}</strong></div></div><div className="modal-foot"><span>{transactionHash ? `GENLAYER TX / ${transactionHash}` : liveAttestation ? "CANONICAL CONTRACT READ" : "NO TRANSACTION HAS BEEN SENT"}</span><a href={explorerUrl} target="_blank" rel="noreferrer">Open Explorer <ExternalLink size={13} /></a></div></div></div>}
    </main>
  );
}
