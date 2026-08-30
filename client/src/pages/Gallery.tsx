// Design system: Base Terminal — dedicated English live archive with graphite chrome, ivory catalog surfaces, orange signal accents, technical borders, and editorial asymmetry.
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Database, ExternalLink, Filter, RefreshCw, Search, ShieldCheck, SlidersHorizontal, X } from "lucide-react";
import { Link } from "wouter";

const CONTRACT = "0xb9110ba3266f4983193c0d5f55c792a94368af28";
const BASE_RPC = "https://mainnet.base.org";
const OPENSEA = "https://opensea.io/collection/punks-base-1";
const BASESCAN = `https://basescan.org/address/${CONTRACT}`;
const ASSET_ROOT = window.location.hostname.endsWith("github.io") ? "/punks-base-collection/assets/" : "/assets/";

type Attribute = { trait_type?: string; value?: string | number };
type LiveNft = { tokenId: string; name: string; image: string; description?: string; attributes: Attribute[] };

async function rpc(method: string, params: unknown[] = []) {
  const response = await fetch(BASE_RPC, { method: "POST", cache: "no-store", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params }) });
  const payload = await response.json();
  if (payload.error) throw new Error(payload.error.message || "Base RPC error");
  return payload.result;
}

function decodeAbiString(value: string) {
  const hex = value?.replace(/^0x/, "") || "";
  try { const offset = Number.parseInt(hex.slice(0, 64), 16) * 2; const length = Number.parseInt(hex.slice(offset, offset + 64), 16) * 2; return decodeURIComponent(hex.slice(offset + 64, offset + 64 + length).replace(/(..)/g, "%$1")); } catch { return ""; }
}

function normalizeUri(uri: string) {
  if (!uri) return "";
  if (uri.startsWith("ipfs://")) return `https://ipfs.filebase.io/ipfs/${uri.slice(7)}`;
  if (uri.startsWith("ar://")) return `https://arweave.net/${uri.slice(5)}`;
  return uri;
}

function candidates(uri: string) {
  if (!uri.startsWith("ipfs://")) return [normalizeUri(uri)];
  const path = uri.slice(7);
  return [`https://ipfs.filebase.io/ipfs/${path}`, `https://ipfs.io/ipfs/${path}`, `https://dweb.link/ipfs/${path}`];
}

async function metadata(uri: string) {
  let last: unknown;
  for (const candidate of candidates(uri)) {
    try { const response = await fetch(candidate, { cache: "no-store" }); if (!response.ok) throw new Error(`Metadata gateway returned ${response.status}`); return response.json(); } catch (error) { last = error; }
  }
  throw last || new Error("Metadata gateway unavailable");
}

async function readNft(tokenId: number): Promise<LiveNft | null> {
  try {
    const encoded = tokenId.toString(16).padStart(64, "0");
    const raw = await rpc("eth_call", [{ to: CONTRACT, data: `0xc87b56dd${encoded}` }, "latest"]);
    const uri = decodeAbiString(raw);
    const data = await metadata(uri);
    const image = normalizeUri(data.image || data.image_url || "");
    if (!image) return null;
    return { tokenId: String(tokenId), name: data.name || `Punk / ${tokenId}`, image, description: data.description, attributes: Array.isArray(data.attributes) ? data.attributes : [] };
  } catch { return null; }
}

export default function Gallery() {
  const [items, setItems] = useState<LiveNft[]>([]);
  const [supply, setSupply] = useState<number | null>(null);
  const [cursor, setCursor] = useState(1);
  const [loading, setLoading] = useState(true);
  const [indexing, setIndexing] = useState(false);
  const [query, setQuery] = useState("");
  const [trait, setTrait] = useState("all");
  const [sort, setSort] = useState("token");
  const [error, setError] = useState<string | null>(null);
  const [syncAt, setSyncAt] = useState<string | null>(null);
  const [selected, setSelected] = useState<LiveNft | null>(null);

  async function loadBatch(start: number, count: number) {
    const end = Math.min(supply || start + count - 1, start + count - 1);
    const loaded = (await Promise.all(Array.from({ length: end - start + 1 }, (_, offset) => readNft(start + offset)))).filter(Boolean) as LiveNft[];
    setItems((current) => { const map = new Map(current.map((item) => [item.tokenId, item])); loaded.forEach((item) => map.set(item.tokenId, item)); return Array.from(map.values()); });
    setCursor(end + 1); setSyncAt(new Date().toISOString());
  }

  async function sync(reset = true) {
    setLoading(true); setError(null); setItems([]); setCursor(1);
    try { const raw = await rpc("eth_call", [{ to: CONTRACT, data: "0x18160ddd" }, "latest"]); const total = Number.parseInt(raw, 16); if (!total) throw new Error("The contract did not return a readable total supply."); setSupply(total); const end = Math.min(total, 24); const loaded = (await Promise.all(Array.from({ length: end }, (_, index) => readNft(index + 1)))).filter(Boolean) as LiveNft[]; setItems(loaded); setCursor(end + 1); setSyncAt(new Date().toISOString()); } catch (cause: any) { setError(cause?.message || "Unable to read the collection from Base."); } finally { setLoading(false); }
  }

  useEffect(() => { void sync(); }, []);

  async function loadAll() {
    if (!supply || indexing || cursor > supply) return;
    setIndexing(true); setError(null);
    try { let start = cursor; while (start <= supply) { await loadBatch(start, 40); start += 40; await new Promise<void>((resolve) => window.setTimeout(resolve, 0)); } } catch (cause: any) { setError(cause?.message || "The full live index stopped early."); } finally { setIndexing(false); }
  }

  const traitOptions = useMemo(() => Array.from(new Set(items.flatMap((item) => item.attributes.map((attribute) => `${attribute.trait_type || "Trait"}: ${String(attribute.value ?? "")}`)))).sort(), [items]);
  const visible = useMemo(() => items.filter((item) => { const matchesQuery = !query || `${item.tokenId} ${item.name}`.toLowerCase().includes(query.toLowerCase()); const matchesTrait = trait === "all" || item.attributes.some((attribute) => `${attribute.trait_type || "Trait"}: ${String(attribute.value ?? "")}` === trait); return matchesQuery && matchesTrait; }).sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : Number(a.tokenId) - Number(b.tokenId)), [items, query, trait, sort]);

  return <div className="site-shell gallery-page">
    <div className="top-strip"><span>BASE NETWORK / LIVE ARCHIVE</span><span>STATUS <b className="status-dot" /> ON-CHAIN</span></div>
    <header className="nav-wrap"><Link className="brand" href="/punks-base-collection/"><span className="brand-mark"><img src={`${ASSET_ROOT}cryptopunk-2890.png`} alt="" /><i /></span><span>PUNKS<span>/</span>BASE</span></Link><nav className="gallery-nav"><Link className="gallery-back" href="/punks-base-collection/"><ArrowLeft size={13} /> Back to home</Link><a href={BASESCAN} target="_blank" rel="noreferrer">Contract <ExternalLink size={13} /></a><a href={OPENSEA} target="_blank" rel="noreferrer">OpenSea <ExternalLink size={13} /></a></nav></header>
    <main>
      <section className="gallery-intro"><div className="section-index">[ 04 / LIVE INDEX ]</div><div><p className="section-kicker">THE COMPLETE ARCHIVE / BASE MAINNET</p><h1>Every token.<br /><em>Every trait.</em></h1><p className="gallery-lede">A live, read-only catalog resolved from the Punks Base contract. Images and metadata are requested from each tokenURI; nothing in this archive is fabricated.</p><div className="gallery-actions"><button className="button button-orange" onClick={() => void loadAll()} disabled={loading || indexing || !supply || cursor > supply}><Database size={15} />{indexing ? `Indexing ${Math.min(cursor - 1, supply || 0)} / ${supply}` : "Load all 10,000"}</button><button className="button button-ghost" onClick={() => void sync()} disabled={loading || indexing}><RefreshCw size={15} className={loading ? "spin" : ""} /> Refresh live data</button></div></div><div className="gallery-stat-panel"><span>CONTRACT</span><strong>{CONTRACT.slice(0, 8)}…{CONTRACT.slice(-6)}</strong><span>SUPPLY</span><strong>{supply ?? "—"}</strong><span>READABLE NOW</span><strong>{items.length}</strong><small>{syncAt ? `Synced ${new Date(syncAt).toLocaleTimeString()}` : "Waiting for Base RPC"}</small></div></section>
      <section className="gallery-catalog"><div className="gallery-toolbar"><div className="gallery-status"><ShieldCheck size={16} /> {loading ? "Reading tokenURI metadata…" : error ? error : `${items.length} readable / ${supply ?? "—"} total`}</div><div className="gallery-controls"><label className="gallery-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search token or name" /></label><label className="gallery-select"><Filter size={14} /><select value={trait} onChange={(event) => setTrait(event.target.value)}><option value="all">All traits</option>{traitOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label><label className="gallery-select"><SlidersHorizontal size={14} /><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="token">Token order</option><option value="name">Name order</option></select></label></div></div>{loading && <div className="gallery-skeletons">{Array.from({ length: 8 }, (_, index) => <div key={index} />)}</div>}{!loading && visible.length === 0 && <div className="gallery-empty"><b>No readable tokens match this filter.</b><span>Try another token ID, name or trait. The source remains the Base Mainnet contract.</span></div>}<div className="gallery-grid">{visible.map((item) => <article className="gallery-card" key={item.tokenId}><button className="gallery-image gallery-image-button" onClick={() => setSelected(item)} aria-label={`View details for ${item.name}`}><img src={item.image} alt={item.name} loading="lazy" /><span>#{item.tokenId}</span></button><div className="gallery-card-head"><div><p className="section-kicker">TOKEN {item.tokenId}</p><h2>{item.name}</h2></div><a href={`https://opensea.io/assets/base/${CONTRACT}/${item.tokenId}`} target="_blank" rel="noreferrer" aria-label={`Open ${item.name} on OpenSea`}><ExternalLink size={14} /></a></div>{item.description && <p className="gallery-description">{item.description}</p>}<div className="trait-list">{item.attributes.length ? item.attributes.map((attribute, index) => <span key={`${item.tokenId}-${attribute.trait_type}-${index}`}><b>{attribute.trait_type || "Trait"}</b>{String(attribute.value ?? "—")}</span>) : <span><b>Metadata</b> No traits returned</span>}</div></article>)}</div>{!loading && cursor <= (supply || 0) && <button className="load-more gallery-load-more" onClick={() => void loadBatch(cursor, 40)} disabled={indexing}>Load next 40 tokens</button>}</section>
    </main>
    {selected && <div className="gallery-detail-overlay" role="dialog" aria-modal="true" aria-labelledby="gallery-detail-title" onClick={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><div className="gallery-detail-modal"><button className="modal-close gallery-detail-close" aria-label="Close NFT details" onClick={() => setSelected(null)}><X size={20} /></button><div className="gallery-detail-grid"><div className="gallery-detail-image"><img src={selected.image} alt={selected.name} /></div><div className="gallery-detail-copy"><p className="section-kicker">LIVE TOKEN RECORD / #{selected.tokenId}</p><h2 id="gallery-detail-title">{selected.name}</h2><p>{selected.description || "No description was published in this token’s metadata."}</p><div className="gallery-detail-traits">{selected.attributes.length ? selected.attributes.map((attribute, index) => <div key={`${selected.tokenId}-${attribute.trait_type}-${index}`}><span>{attribute.trait_type || "Trait"}</span><strong>{String(attribute.value ?? "—")}</strong></div>) : <div><span>Metadata</span><strong>No traits returned</strong></div>}</div><a className="button button-orange" href={`https://opensea.io/assets/base/${CONTRACT}/${selected.tokenId}`} target="_blank" rel="noreferrer">Open on OpenSea <ExternalLink size={15} /></a></div></div></div></div>}
  </div>;
}
