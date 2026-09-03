// Design system: Base Terminal — dedicated English live archive with graphite chrome, ivory catalog surfaces, orange signal accents, technical borders, and editorial asymmetry.
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Database, ExternalLink, Filter, RefreshCw, Search, ShieldCheck, SlidersHorizontal, X } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { cacheBustImageUrl, cacheLiveNft, fetchLiveSupply, readCachedLiveNfts, readLiveNft, readLiveNfts, type LiveCollectionNft } from "@/lib/live-collection";

const CONTRACT = "0xb9110ba3266f4983193c0d5f55c792a94368af28";
const OPENSEA = "https://opensea.io/collection/punks-base-1";
const BASESCAN = `https://basescan.org/address/${CONTRACT}`;
const ASSET_ROOT = window.location.hostname.endsWith("github.io") ? "/punks-base-collection/assets/" : "/assets/";

type Attribute = { trait_type?: string; value?: string | number };
type LiveNft = LiveCollectionNft;

type Progress = { scanned: number; readable: number; pending: number; retrying: number };
const EMPTY_PROGRESS: Progress = { scanned: 0, readable: 0, pending: 0, retrying: 0 };

function mergeItems(current: LiveNft[], incoming: LiveNft[]) {
  const map = new Map(current.map((item) => [item.tokenId, item]));
  incoming.forEach((item) => map.set(item.tokenId, item));
  return Array.from(map.values());
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
  const [refreshingTokenId, setRefreshingTokenId] = useState<string | null>(null);
  const [retryQueue, setRetryQueue] = useState<number[]>([]);
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);
  const [imageReloads, setImageReloads] = useState<Record<string, number>>({});
  const [imageFailures, setImageFailures] = useState<Record<string, boolean>>({});

  function onItem(item: LiveNft) {
    setItems((current) => mergeItems(current, [item]));
    setProgress((current) => ({ ...current, scanned: current.scanned + 1, readable: current.readable + 1, pending: Math.max(0, current.pending - 1) }));
    setLoading(false);
  }

  function onFailure(tokenId: number) {
    setRetryQueue((current) => current.includes(tokenId) ? current : [...current, tokenId]);
    setProgress((current) => ({ ...current, scanned: current.scanned + 1, pending: Math.max(0, current.pending - 1), retrying: current.retrying + 1 }));
  }

  async function loadBatch(start: number, count: number) {
    const end = Math.min(supply || start + count - 1, start + count - 1);
    const ids = Array.from({ length: end - start + 1 }, (_, offset) => start + offset);
    setProgress((current) => ({ ...current, pending: current.pending + ids.length }));
    const loaded = await readLiveNfts(ids, false, { onItem, onFailure });
    setItems((current) => mergeItems(current, loaded));
    setCursor(end + 1);
    setProgress((current) => ({ ...current, scanned: Math.max(current.scanned, end), pending: 0 }));
    setSyncAt(new Date().toISOString());
  }

  async function sync() {
    setLoading(true);
    setError(null);
    setRetryQueue([]);
    setProgress(EMPTY_PROGRESS);
    setCursor(1);
    try {
      const total = await fetchLiveSupply();
      setSupply(total);
      const end = Math.min(total, 12);
      const ids = Array.from({ length: end }, (_, index) => index + 1);
      setProgress((current) => ({ ...current, pending: ids.length }));
      const loaded = await readLiveNfts(ids, false, { onItem, onFailure });
      setItems((current) => mergeItems(current, loaded));
      setProgress((current) => ({ ...current, scanned: Math.max(current.scanned, end), pending: 0 }));
      setCursor(end + 1);
      setSyncAt(new Date().toISOString());
      if (!loaded.length && !items.length) setError("No readable token metadata was returned by the contract.");
    } catch (cause: any) {
      setError(cause?.message || "Unable to read the collection from Base.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    void readCachedLiveNfts().then((cached) => {
      if (!active || !cached.length) return;
      setItems(cached);
      setLoading(false);
      setProgress({ scanned: cached.length, readable: cached.length, pending: 0, retrying: 0 });
    });
    void sync();
    return () => { active = false; };
  }, []);

  function imageSrc(item: LiveNft) {
    return cacheBustImageUrl(item.image, imageReloads[item.tokenId] ?? 0);
  }

  function markImageFailed(tokenId: string) {
    setImageFailures((current) => current[tokenId] ? current : { ...current, [tokenId]: true });
  }

  function markImageLoaded(tokenId: string) {
    setImageFailures((current) => current[tokenId] ? { ...current, [tokenId]: false } : current);
  }

  async function refreshNft(tokenId: string) {
    setRefreshingTokenId(tokenId);
    setImageFailures((current) => ({ ...current, [tokenId]: false }));
    setImageReloads((current) => ({ ...current, [tokenId]: (current[tokenId] ?? 0) + 1 }));
    try {
      const refreshed = await readLiveNft(Number(tokenId), true);
      if (!refreshed) throw new Error("This token metadata is temporarily unavailable.");
      setItems((current) => current.map((item) => item.tokenId === tokenId ? refreshed : item));
      setSelected((current) => current?.tokenId === tokenId ? refreshed : current);
      setRetryQueue((current) => current.filter((id) => id !== Number(tokenId)));
      void cacheLiveNft(refreshed);
      setSyncAt(new Date().toISOString());
      toast.success(`Token #${tokenId} refreshed from Base.`);
    } catch (cause: any) {
      toast.error(cause?.message || `Unable to refresh token #${tokenId}.`);
    } finally {
      setRefreshingTokenId(null);
    }
  }

  async function retryFailed() {
    if (indexing || !retryQueue.length) return;
    const ids = retryQueue;
    setRetryQueue([]);
    setIndexing(true);
    setProgress((current) => ({ ...current, retrying: ids.length }));
    await readLiveNfts(ids, true, {
      onItem: (item) => {
        setItems((current) => mergeItems(current, [item]));
        void cacheLiveNft(item);
        setProgress((current) => ({ ...current, readable: current.readable + 1, retrying: Math.max(0, current.retrying - 1) }));
      },
      onFailure: (tokenId) => setRetryQueue((current) => current.includes(tokenId) ? current : [...current, tokenId]),
    });
    setProgress((current) => ({ ...current, retrying: 0 }));
    setIndexing(false);
  }

  async function loadAll() {
    if (!supply || indexing || cursor > supply) return;
    setIndexing(true);
    setError(null);
    try {
      let start = cursor;
      while (start <= supply) {
        await loadBatch(start, 40);
        start += 40;
        await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
      }
    } catch (cause: any) {
      setError(cause?.message || "The full live index stopped early.");
    } finally {
      setIndexing(false);
    }
  }

  const traitOptions = useMemo(() => Array.from(new Set(items.flatMap((item) => item.attributes.map((attribute) => `${attribute.trait_type || "Trait"}: ${String(attribute.value ?? "")}`)))).sort(), [items]);
  const progressPercent = supply ? Math.min(100, Math.round((progress.scanned / supply) * 100)) : 0;
  const visible = useMemo(() => items.filter((item) => {
    const matchesQuery = !query || `${item.tokenId} ${item.name}`.toLowerCase().includes(query.toLowerCase());
    const matchesTrait = trait === "all" || item.attributes.some((attribute) => `${attribute.trait_type || "Trait"}: ${String(attribute.value ?? "")}` === trait);
    return matchesQuery && matchesTrait;
  }).sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : Number(a.tokenId) - Number(b.tokenId)), [items, query, trait, sort]);

  return <div className="site-shell gallery-page">
    <div className="top-strip"><span>BASE NETWORK / LIVE ARCHIVE</span><span>STATUS <b className="status-dot" /> ON-CHAIN</span></div>
    <header className="nav-wrap"><Link className="brand" href="/punks-base-collection/"><span className="brand-mark"><img src={`${ASSET_ROOT}cryptopunk-2890.png`} alt="" /><i /></span><span>PUNKS<span>/</span>BASE</span></Link><nav className="gallery-nav"><Link className="gallery-back" href="/punks-base-collection/"><ArrowLeft size={13} /> Back to home</Link><a href={BASESCAN} target="_blank" rel="noreferrer">Contract <ExternalLink size={13} /></a><a href={OPENSEA} target="_blank" rel="noreferrer">OpenSea <ExternalLink size={13} /></a></nav></header>
    <main>
      <section className="gallery-intro"><div className="section-index">[ 04 / LIVE INDEX ]</div><div><p className="section-kicker">THE COMPLETE ARCHIVE / BASE MAINNET</p><h1>Every token.<br /><em>Every trait.</em></h1><p className="gallery-lede">A live, read-only catalog resolved from the Punks Base contract. Images and metadata are requested from each tokenURI; nothing in this archive is fabricated.</p><div className="gallery-actions"><button className="button button-orange" onClick={() => void loadAll()} disabled={loading || indexing || !supply || cursor > supply}><Database size={15} />{indexing ? `Indexing ${Math.min(cursor - 1, supply || 0)} / ${supply}` : "Load all 10,000"}</button><button className="button button-ghost" onClick={() => void sync()} disabled={loading || indexing}><RefreshCw size={15} className={loading ? "spin" : ""} /> Refresh live data</button></div></div><div className="gallery-stat-panel"><span>CONTRACT</span><strong>{CONTRACT.slice(0, 8)}…{CONTRACT.slice(-6)}</strong><span>SUPPLY</span><strong>{supply ?? "—"}</strong><span>READABLE NOW</span><strong>{items.length}</strong><small>{syncAt ? `Synced ${new Date(syncAt).toLocaleTimeString()}` : "Waiting for Base RPC"}</small></div></section>
      <section className="gallery-catalog"><div className="gallery-toolbar"><div className="gallery-status"><ShieldCheck size={16} /> {loading ? (items.length ? `${items.length} live records loading…` : "Reading tokenURI metadata…") : error ? error : `${items.length} readable / ${supply ?? "—"} total`}</div><div className="gallery-controls"><label className="gallery-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search token or name" /></label><label className="gallery-select"><Filter size={14} /><select value={trait} onChange={(event) => setTrait(event.target.value)}><option value="all">All traits</option>{traitOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label><label className="gallery-select"><SlidersHorizontal size={14} /><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="token">Token order</option><option value="name">Name order</option></select></label></div></div><div className="gallery-progress" aria-live="polite"><div className="gallery-progress-head"><span>INDEX PROGRESS</span><b>{progressPercent}%</b></div><div className="gallery-progress-track"><span style={{ width: `${progressPercent}%` }} /></div><div className="gallery-progress-stats"><span><b>{progress.scanned.toLocaleString()}</b> scanned</span><span><b>{progress.readable.toLocaleString()}</b> readable</span><span><b>{progress.pending.toLocaleString()}</b> pending</span><span className={retryQueue.length ? "has-retries" : ""}><b>{retryQueue.length.toLocaleString()}</b> retry queue</span>{retryQueue.length > 0 && <button className="gallery-retry-button" onClick={() => void retryFailed()} disabled={indexing}><RefreshCw size={13} /> Retry unavailable</button>}</div></div>{loading && items.length === 0 && <div className="gallery-skeletons">{Array.from({ length: 8 }, (_, index) => <div key={index} />)}</div>}{!loading && items.length === 0 && visible.length === 0 && <div className="gallery-empty"><b>No readable tokens match this filter.</b><span>Try another token ID, name or trait. The source remains the Base Mainnet contract.</span></div>}<div className="gallery-grid">{visible.map((item) => <article className="gallery-card" key={item.tokenId}><button className="gallery-image gallery-image-button" onClick={() => setSelected(item)} aria-label={`View details for ${item.name}`}><img src={imageSrc(item)} alt={item.name} loading="lazy" onError={() => markImageFailed(item.tokenId)} onLoad={() => markImageLoaded(item.tokenId)} /><span>#{item.tokenId}</span>{imageFailures[item.tokenId] && <span className="gallery-image-error">Image unavailable — press Refresh</span>}</button><div className="gallery-card-head"><div><p className="section-kicker">TOKEN {item.tokenId}</p><h2>{item.name}</h2></div><div className="gallery-card-links"><button className="gallery-card-refresh" onClick={() => void refreshNft(item.tokenId)} disabled={refreshingTokenId === item.tokenId} title={`Refresh ${item.name} from Base`} aria-label={`Refresh ${item.name} from Base`}><RefreshCw size={13} className={refreshingTokenId === item.tokenId ? "spin" : ""} /> {refreshingTokenId === item.tokenId ? "Refreshing" : "Refresh"}</button><a href={`https://opensea.io/assets/base/${CONTRACT}/${item.tokenId}`} target="_blank" rel="noreferrer" aria-label={`Open ${item.name} on OpenSea`}><ExternalLink size={14} /></a></div></div>{item.description && <p className="gallery-description">{item.description}</p>}<div className="trait-list">{item.attributes.length ? item.attributes.map((attribute, index) => <span key={`${item.tokenId}-${attribute.trait_type}-${index}`}><b>{attribute.trait_type || "Trait"}</b>{String(attribute.value ?? "—")}</span>) : <span><b>Metadata</b> No traits returned</span>}</div></article>)}</div>{!loading && cursor <= (supply || 0) && <button className="load-more gallery-load-more" onClick={() => void loadBatch(cursor, 40)} disabled={indexing}>Load next 40 tokens</button>}</section>
    </main>
    {selected && <div className="gallery-detail-overlay" role="dialog" aria-modal="true" aria-labelledby="gallery-detail-title" onClick={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><div className="gallery-detail-modal"><button className="modal-close gallery-detail-close" aria-label="Close NFT details" onClick={() => setSelected(null)}><X size={20} /></button><div className="gallery-detail-grid"><div className="gallery-detail-image"><img src={imageSrc(selected)} alt={selected.name} onError={() => markImageFailed(selected.tokenId)} onLoad={() => markImageLoaded(selected.tokenId)} />{imageFailures[selected.tokenId] && <p className="gallery-detail-image-error">Image unavailable — press Refresh.</p>}</div><div className="gallery-detail-copy"><p className="section-kicker">LIVE TOKEN RECORD / #{selected.tokenId}</p><h2 id="gallery-detail-title">{selected.name}</h2><p>{selected.description || "No description was published in this token’s metadata."}</p><div className="gallery-detail-traits">{selected.attributes.length ? selected.attributes.map((attribute, index) => <div key={`${selected.tokenId}-${attribute.trait_type}-${index}`}><span>{attribute.trait_type || "Trait"}</span><strong>{String(attribute.value ?? "—")}</strong></div>) : <div><span>Metadata</span><strong>No traits returned</strong></div>}</div><a className="button button-orange" href={`https://opensea.io/assets/base/${CONTRACT}/${selected.tokenId}`} target="_blank" rel="noreferrer">Open on OpenSea <ExternalLink size={15} /></a></div></div></div></div>}
  </div>;
}
