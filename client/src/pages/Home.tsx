// Design system: Base Terminal — English-first collector interface, graphite archive surfaces, ivory catalog panels, and Base Signal Orange reserved for actions and verified states.
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BadgeCheck, Check, ChevronRight, CircleDollarSign, Clipboard, Copy, Database, ExternalLink, Github, LayoutDashboard, Menu, RefreshCw, ShieldCheck, Sparkles, Wallet, X } from "lucide-react";
import { toast } from "sonner";
import { MARKETPLACE_MAINNET_ADDRESS, ROYALTY_PERCENT, ROYALTY_RECIPIENT } from "@/lib/marketplace";
import { cacheLiveNft, fetchLiveSupply, readCachedLiveNfts, readLiveNft, readLiveNfts, type LiveCollectionNft } from "@/lib/live-collection";

const CONTRACT = "0xb9110ba3266f4983193c0d5f55c792a94368af28";
const BASE_CHAIN_ID = "0x2105";
const BASESCAN_URL = `https://basescan.org/address/${CONTRACT}`;

type View = "collection" | "creator" | "wallet";
type Action = "buy" | "sell" | "list" | null;

const shortAddress = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`;
const OPENSEA_COLLECTION_URL = "https://opensea.io/collection/punks-base-1";
const RARIBLE_COLLECTION_URL = "https://og.rarible.com/collection/base/0xb9110ba3266f4983193c0d5f55c792a94368af28/items";

type NftItem = { id: string; name: string; trait: string; price: string; image: string; tokenId: string; listed?: boolean; description?: string; attributes?: Array<{ trait_type?: string; value?: string | number }> };
type FeaturedItem = { id: string; label: string; image: string; tokenId?: string };
const FEATURED_ITEMS: FeaturedItem[] = [
  { id: "635", label: "Punk #635", tokenId: "635", image: "./assets/cryptopunk-635.png" },
  { id: "3443", label: "Punk #3443", tokenId: "3443", image: "./assets/cryptopunk-3443.png" },
  { id: "IMG_3579", label: "Featured collection item", image: "./assets/IMG_3579.png" },
];

function mergeNftItems(current: NftItem[], incoming: NftItem[]) {
  const map = new Map(current.map((item) => [item.tokenId, item]));
  incoming.forEach((item) => map.set(item.tokenId, item));
  return Array.from(map.values());
}

function mapLiveNft(item: LiveCollectionNft): NftItem {
  return {
    id: item.tokenId.padStart(4, "0"),
    tokenId: item.tokenId,
    name: item.name,
    trait: item.attributes.slice(0, 2).map((attribute) => `${attribute.trait_type || "Trait"}: ${String(attribute.value ?? "—")}`).join(" · ") || "On-chain metadata",
    price: "—",
    image: item.image,
    description: item.description,
    attributes: item.attributes,
    listed: false,
  };
}

export default function Home() {
  const [view, setView] = useState<View>("collection");
  const [action, setAction] = useState<Action>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [network, setNetwork] = useState("Base");
  const [connecting, setConnecting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [nfts, setNfts] = useState<NftItem[]>([]);
  const [supply, setSupply] = useState<number | null>(null);
  const [loadingNfts, setLoadingNfts] = useState(true);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(24);
  const [selectedNft, setSelectedNft] = useState<NftItem | null>(null);
  const [nextTokenIndex, setNextTokenIndex] = useState(1);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [indexingAll, setIndexingAll] = useState(false);
  const [refreshingTokenId, setRefreshingTokenId] = useState<string | null>(null);
  const [retryQueue, setRetryQueue] = useState<number[]>([]);
  const [progress, setProgress] = useState({ scanned: 0, readable: 0, pending: 0, retrying: 0 });
  const contractLabel = useMemo(() => `${CONTRACT.slice(0, 8)}…${CONTRACT.slice(-6)}`, []);
  const scannedCount = supply ? Math.min(Math.max(progress.scanned, nextTokenIndex - 1), supply) : progress.scanned;

  useEffect(() => {
    let cancelled = false;
    async function loadOnChainCollection() {
      try {
        setLoadingNfts(true);
        setMetadataError(null);
        setRetryQueue([]);
        setProgress({ scanned: 0, readable: 0, pending: 0, retrying: 0 });
        const cached = await readCachedLiveNfts();
        if (!cancelled && cached.length) { setNfts(cached.map(mapLiveNft)); setLoadingNfts(false); setProgress({ scanned: cached.length, readable: cached.length, pending: 0, retrying: 0 }); }
        const total = await fetchLiveSupply();
        if (!Number.isFinite(total) || total <= 0) throw new Error("The contract did not return a readable total supply.");
        setSupply(total);
        const batchEnd = Math.min(total, 12);
        const ids = Array.from({ length: batchEnd }, (_, index) => index + 1);
        setProgress((current) => ({ ...current, pending: ids.length }));
        const loaded = (await readLiveNfts(ids, false, { onItem: (item) => { if (!cancelled) { setNfts((current) => mergeNftItems(current, [mapLiveNft(item)])); setLoadingNfts(false); setProgress((current) => ({ ...current, scanned: current.scanned + 1, readable: current.readable + 1, pending: Math.max(0, current.pending - 1) })); } }, onFailure: (tokenId) => { if (!cancelled) { setRetryQueue((current) => current.includes(tokenId) ? current : [...current, tokenId]); setProgress((current) => ({ ...current, scanned: current.scanned + 1, pending: Math.max(0, current.pending - 1), retrying: current.retrying + 1 })); } } })).map(mapLiveNft);
        if (!cancelled) { setNfts((current) => mergeNftItems(current, loaded)); setProgress((current) => ({ ...current, scanned: Math.max(current.scanned, batchEnd), pending: 0 })); setNextTokenIndex(batchEnd + 1); setLastSyncedAt(new Date().toISOString()); if (!loaded.length && !cached.length) setMetadataError("No readable token metadata was returned by the contract."); }
      } catch (error: any) { if (!cancelled) setMetadataError(error?.message || "Unable to load this collection from Base."); }
      finally { if (!cancelled) setLoadingNfts(false); }
    }
    loadOnChainCollection();
    return () => { cancelled = true; };
  }, [refreshNonce]);

  async function loadMoreMetadata() {
    if (!supply || nextTokenIndex > supply || indexingAll) return;
    const start = nextTokenIndex;
    const end = Math.min(supply, start + 11);
    const ids = Array.from({ length: end - start + 1 }, (_, offset) => start + offset);
    setProgress((current) => ({ ...current, pending: current.pending + ids.length }));
    const loaded = (await readLiveNfts(ids, false, { onItem: (item) => { setNfts((current) => mergeNftItems(current, [mapLiveNft(item)])); setProgress((current) => ({ ...current, scanned: current.scanned + 1, readable: current.readable + 1, pending: Math.max(0, current.pending - 1) })); }, onFailure: (tokenId) => { setRetryQueue((current) => current.includes(tokenId) ? current : [...current, tokenId]); setProgress((current) => ({ ...current, scanned: current.scanned + 1, pending: Math.max(0, current.pending - 1), retrying: current.retrying + 1 })); } })).map(mapLiveNft);
    setNfts((current) => mergeNftItems(current, loaded));
    setNextTokenIndex(end + 1);
    setProgress((current) => ({ ...current, scanned: Math.max(current.scanned, end), pending: 0 }));
    setVisibleCount((count) => count + 12);
    setLastSyncedAt(new Date().toISOString());
  }

  async function loadAllMetadata() {
    if (!supply || indexingAll || nextTokenIndex > supply) return;
    setIndexingAll(true);
    setMetadataError(null);
    let cursor = nextTokenIndex;
    try {
      while (cursor <= supply) {
        const end = Math.min(supply, cursor + 31);
        const ids = Array.from({ length: end - cursor + 1 }, (_, offset) => cursor + offset);
        setProgress((current) => ({ ...current, pending: current.pending + ids.length }));
        const loaded = (await readLiveNfts(ids, false, { onItem: (item) => { setNfts((current) => mergeNftItems(current, [mapLiveNft(item)])); setProgress((current) => ({ ...current, scanned: current.scanned + 1, readable: current.readable + 1, pending: Math.max(0, current.pending - 1) })); }, onFailure: (tokenId) => { setRetryQueue((current) => current.includes(tokenId) ? current : [...current, tokenId]); setProgress((current) => ({ ...current, scanned: current.scanned + 1, pending: Math.max(0, current.pending - 1), retrying: current.retrying + 1 })); } })).map(mapLiveNft);
        setNfts((current) => mergeNftItems(current, loaded));
        cursor = end + 1;
        setNextTokenIndex(cursor);
        setProgress((current) => ({ ...current, scanned: Math.max(current.scanned, end), pending: 0 }));
        setVisibleCount((count) => Math.max(count, 24 + Math.max(0, cursor - 1)));
        setLastSyncedAt(new Date().toISOString());
        await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
      }
    } catch (error: any) {
      setMetadataError(error?.message || "The live collection index stopped before reaching the full supply.");
    } finally {
      setIndexingAll(false);
    }
  }

  async function retryFailedMetadata() {
    if (indexingAll || !retryQueue.length) return;
    const pendingIds = retryQueue;
    setRetryQueue([]);
    setProgress((current) => ({ ...current, retrying: pendingIds.length }));
    try {
      const loaded = (await readLiveNfts(pendingIds, true, { onItem: (item) => { const mapped = mapLiveNft(item); setNfts((current) => mergeNftItems(current, [mapped])); void cacheLiveNft(item); setProgress((current) => ({ ...current, readable: current.readable + 1, retrying: Math.max(0, current.retrying - 1) })); }, onFailure: (tokenId) => setRetryQueue((current) => current.includes(tokenId) ? current : [...current, tokenId]) })).map(mapLiveNft);
      setNfts((current) => mergeNftItems(current, loaded));
    } finally {
      setProgress((current) => ({ ...current, retrying: 0 }));
    }
  }

  async function refreshNft(tokenId: string) {
    setRefreshingTokenId(tokenId);
    try {
      const refreshed = await readLiveNft(Number(tokenId), true);
      if (!refreshed) throw new Error("This token metadata is temporarily unavailable.");
      const mapped = mapLiveNft(refreshed);
      setNfts((current) => current.map((item) => item.tokenId === tokenId ? mapped : item));
      setSelectedNft((current) => current?.tokenId === tokenId ? mapped : current);
      setLastSyncedAt(new Date().toISOString());
      void cacheLiveNft(refreshed);
      setRetryQueue((current) => current.filter((id) => id !== Number(tokenId)));
      toast.success(`Token #${tokenId} refreshed from Base.`);
    } catch (error: any) {
      toast.error(error?.message || `Unable to refresh token #${tokenId}.`);
    } finally {
      setRefreshingTokenId(null);
    }
  }

  useEffect(() => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;
    const accountsChanged = (accounts: string[]) => setWallet(accounts[0] || null);
    const chainChanged = (chainId: string) => setNetwork(chainId?.toLowerCase() === BASE_CHAIN_ID ? "Base" : "Wrong network");
    ethereum.request({ method: "eth_accounts" }).then(accountsChanged).catch(() => undefined);
    ethereum.request({ method: "eth_chainId" }).then(chainChanged).catch(() => undefined);
    ethereum.on?.("accountsChanged", accountsChanged);
    ethereum.on?.("chainChanged", chainChanged);
    return () => { ethereum.removeListener?.("accountsChanged", accountsChanged); ethereum.removeListener?.("chainChanged", chainChanged); };
  }, []);

  async function connectMetaMask() {
    const ethereum = (window as any).ethereum;
    if (!ethereum) { toast.error("MetaMask was not detected. Install the MetaMask extension to connect."); return; }
    setConnecting(true);
    try {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      const chainId = await ethereum.request({ method: "eth_chainId" });
      if (chainId?.toLowerCase() !== BASE_CHAIN_ID) {
        try { await ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: BASE_CHAIN_ID }] }); } catch { toast.error("Switch to Base Mainnet to continue."); }
      }
      setWallet(accounts[0] || null); setNetwork("Base"); toast.success("Wallet connected on Base.");
    } catch (error: any) { toast.error(error?.message || "Connection cancelled."); } finally { setConnecting(false); }
  }


  async function disconnect() { setWallet(null); toast.success("Wallet disconnected."); }
  function copyContract() { navigator.clipboard?.writeText(CONTRACT); toast.success("Contract address copied."); }
  function startAction(next: Action) { if (!wallet && next !== "buy") { toast.info("Connect your wallet first to continue."); return; } setAction(next); }
  function scrollTo(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); }

  return <div className="site-shell">
    <div className="top-strip"><span>BASE NETWORK / COLLECTION TERMINAL</span><span>STATUS <b className="status-dot" /> ONLINE</span></div>
    <header className="nav-wrap"><button className="brand" onClick={() => { setView("collection"); scrollTo("top"); }} aria-label="Punks Base Collection"><span className="brand-mark"><img src="./assets/cryptopunk-2890.png" alt="" /><i /></span><span>PUNKS<span>/</span>BASE</span></button>
      <nav className={menuOpen ? "nav-links open" : "nav-links"}><a href="./gallery">Live gallery</a><button onClick={() => { setView("collection"); scrollTo("collection"); }}>Collection</button><button onClick={() => { setView("creator"); scrollTo("dashboard"); }}>Creator dashboard</button><button onClick={() => { setView("wallet"); scrollTo("dashboard"); }}>My wallet</button><a href={BASESCAN_URL} target="_blank" rel="noreferrer">Contract <ExternalLink size={13} /></a></nav>
      <div className="nav-actions">{wallet ? <button className="wallet-pill connected" onClick={disconnect}><span className="wallet-live" />{shortAddress(wallet)}</button> : <button className="button button-orange button-small" onClick={connectMetaMask} disabled={connecting}><Wallet size={15} />{connecting ? "Connecting…" : "Connect wallet"}</button>}<button className="menu-button" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button></div>
    </header>

    <main id="top">
      {view === "collection" && <>
        <section className="hero-section"><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-line" /> ARCHIVE 001 / BASE MAINNET</div><h1>Small format.<br /><em>On-chain</em><br />identity.</h1><p className="hero-lede">Punks Base is a collection of digital characters, recorded on Base and made for people who prefer proof over promises.</p><div className="hero-cta-row"><button className="button button-orange" onClick={() => scrollTo("collection")}>Explore collection <ArrowUpRight size={17} /></button><a className="button button-orange gallery-access-button" href="./gallery">View Full Collection <ArrowUpRight size={17} /></a><button className="button button-ghost" onClick={connectMetaMask}><Wallet size={16} /> Connect MetaMask</button></div><div className="hero-note"><ShieldCheck size={15} /> Public contract · Base network · transparent reading <span className="verified-badge"><img src="./assets/verifier.png" alt="" /> Verified on Base</span></div></div><div className="hero-art-wrap"><div className="art-index">FIG. 001<br /><span>PUNK / BASE</span></div>{nfts[0] ? <img className="hero-art real-nft-image" src={nfts[0].image} alt={nfts[0].name} /> : <div className="hero-image-loading">{loadingNfts ? "WAITING FOR REAL TOKEN IMAGE / BASE" : "REAL TOKEN IMAGE UNAVAILABLE"}</div>}<div className="art-caption"><span>01</span><span>ORIGINAL CHARACTER STUDY</span><span>BASE / 8453</span></div></div></section>
        <section className="ticker"><span>COLLECTION / PUNKS BASE</span><span>NETWORK / BASE</span><span>CONTRACT / {contractLabel}</span><span>STANDARD / ERC-721</span><span>COLLECTION / PUNKS BASE</span></section>
        <section id="manifesto" className="manifesto-section"><div className="section-index">[ 00 / NOTE ]</div><div className="manifesto-content"><p className="section-kicker">A PROTOCOL FOR TINY IDENTITIES</p><h2>Every Punk is a <span>signature.</span></h2><p>No inflated roadmap. No magical access promise. Just a readable collection, a verifiable contract and a new place for avatars with nothing to prove.</p><a className="text-link" href={BASESCAN_URL} target="_blank" rel="noreferrer">Read contract on BaseScan <ArrowUpRight size={15} /></a></div><div className="manifesto-stamp"><img src="./assets/cryptopunk-2890.png" alt="" /><span>VERIFIED<br />ON BASE</span></div></section>
        <section id="collection" className="collection-section"><div className="collection-head"><div><p className="section-kicker">THE ARCHIVE / LIVE BASE DATA</p><h2>The collection<span>.</span></h2><a className="collection-gallery-link" href="./gallery">View Full Collection <ArrowUpRight size={14} /></a></div><div className="collection-meta"><span><b>{supply ?? "—"}</b> total supply</span><span><b>8453</b> chain id</span><button className="live-refresh" onClick={() => setRefreshNonce((value) => value + 1)} disabled={loadingNfts || indexingAll}><RefreshCw size={14} className={loadingNfts ? "spin" : ""} /> {loadingNfts ? "SYNCING" : "REFRESH LIVE DATA"}</button><button className="live-refresh full-index-button" onClick={loadAllMetadata} disabled={loadingNfts || indexingAll || !supply || scannedCount >= supply}><Database size={14} className={indexingAll ? "spin" : ""} /> {indexingAll ? `INDEXING ${scannedCount}/${supply}` : "LOAD ALL 10,000"}</button>{retryQueue.length > 0 && <button className="live-refresh retry-index-button" onClick={() => void retryFailedMetadata()} disabled={indexingAll}><RefreshCw size={14} className={progress.retrying ? "spin" : ""} /> RETRY {retryQueue.length}</button>}{lastSyncedAt && <small>SYNCED {new Date(lastSyncedAt).toLocaleTimeString()}</small>}</div></div><div className="collection-layout"><aside className="filter-rail"><span className="rail-label">INDEX</span><button className="filter-active">01 / ALL PUNKS</button><button onClick={() => toast.info("Trait filtering is ready for the metadata index.")}>02 / TRAITS</button><button onClick={() => { setView("wallet"); scrollTo("dashboard"); }}>03 / MY WALLET</button><div className="rail-bottom">SORT<br /><button onClick={() => toast.info("Sorting will use the live marketplace index.")}>LATEST <ChevronRight size={14} /></button></div></aside><div className="featured-items" aria-label="Featured collection items">{FEATURED_ITEMS.map((item) => <article className="featured-item" key={item.id}><div className="featured-image-wrap"><img src={item.image} alt={item.label} /><span className="featured-check"><img src="./assets/verifier.png" alt="" /> Verified on Base</span></div><div className="featured-item-meta"><div><span className="section-kicker">FEATURED ITEM</span><h3>{item.label}</h3></div>{item.tokenId ? <a href={`https://opensea.io/assets/base/${CONTRACT}/${item.tokenId}`} target="_blank" rel="noreferrer" aria-label={`Open ${item.label} on OpenSea`}><ExternalLink size={14} /></a> : <BadgeCheck size={16} aria-label="Verified collection image" />}</div></article>)}</div><div className="metadata-state">{loadingNfts ? <><RefreshCw size={15} /> Reading real tokenURI metadata from Base…</> : metadataError ? <><ShieldCheck size={15} /> {metadataError} <a href={RARIBLE_COLLECTION_URL} target="_blank" rel="noreferrer">Open marketplace collection <ExternalLink size={13} /></a></> : <><BadgeCheck size={15} /> Live on-chain metadata · {nfts.length} readable / {scannedCount} scanned / {supply ?? "—"} total · {progress.pending} pending{retryQueue.length ? ` · ${retryQueue.length} retry queued` : ""}</>}</div>{loadingNfts && <div className="metadata-skeleton-grid" aria-label="Loading real NFT metadata"><div /><div /><div /></div>}{!loadingNfts && nfts.length > 0 && <div className="punk-grid">{nfts.slice(0, visibleCount).map((punk, index) => <article className={`punk-card card-${index + 1}`} key={punk.id}><div className="punk-image-wrap"><span className="card-number">#{punk.id}</span><img className="real-nft-image" src={punk.image} alt={punk.name} /><span className="scan-line" /></div><div className="punk-info"><div><h3>{punk.name}</h3><p>{punk.trait}</p></div><div className="punk-price"><span>PRICE</span><strong>{punk.price}</strong></div></div><div className="punk-actions"><button className="card-link" onClick={() => setSelectedNft(punk)}>Metadata <ChevronRight size={14} /></button><button className="card-refresh" onClick={() => void refreshNft(punk.tokenId)} disabled={refreshingTokenId === punk.tokenId} title={`Refresh ${punk.name} from Base`} aria-label={`Refresh ${punk.name} from Base`}><RefreshCw size={13} className={refreshingTokenId === punk.tokenId ? "spin" : ""} /> {refreshingTokenId === punk.tokenId ? "Refreshing" : "Refresh"}</button><a className="sell-link" href={`https://opensea.io/assets/base/${CONTRACT}/${punk.tokenId}`} target="_blank" rel="noreferrer">OpenSea <ExternalLink size={14} /></a></div></article>)}</div>}{!loadingNfts && nfts.length > 0 && nfts.length < (supply ?? 0) && <button className="load-more" onClick={loadMoreMetadata} disabled={indexingAll}>Load next metadata batch <ChevronRight size={14} /></button>}</div></section>
      </>}

      {view !== "collection" && <section id="dashboard" className="dashboard-page"><div className="dashboard-header"><div><p className="section-kicker">{view === "creator" ? "CREATOR CONTROL / 01" : "WALLET CONTROL / 02"}</p><h1>{view === "creator" ? <>Creator<br /><em>dashboard.</em></> : <>Your wallet<br /><em>terminal.</em></>}</h1><p className="dashboard-lede">{view === "creator" ? "A clear control surface for collection status, contract references and future marketplace configuration." : "Your Base account, holdings and marketplace activity in one verifiable view."}</p></div><div className="dashboard-status"><span className="status-box-label">CONNECTION STATUS</span><strong className={wallet ? "is-live" : ""}>{wallet ? "CONNECTED" : "NOT CONNECTED"}</strong><span>{wallet ? shortAddress(wallet) : "Connect a wallet to load live data"}</span><button className="button button-orange button-small" onClick={wallet ? disconnect : connectMetaMask}>{wallet ? "Disconnect" : "Connect wallet"}</button></div></div>
        <div className="dashboard-grid"><div className="metric-panel"><span>NETWORK</span><strong>{network}</strong><small>Base Mainnet · 8453</small></div><div className="metric-panel"><span>CONTRACT</span><strong>{contractLabel}</strong><small>ERC-721 reference</small></div><div className="metric-panel"><span>{view === "creator" ? "INDEXED PIECES" : "YOUR NFTs"}</span><strong>{view === "creator" ? "03" : wallet ? "0" : "—"}</strong><small>{view === "creator" ? "Archive entries" : "Live wallet index"}</small></div><div className="metric-panel"><span>ROYALTY</span><strong>{ROYALTY_PERCENT}%</strong><small>Recipient {shortAddress(ROYALTY_RECIPIENT)}</small></div><div className="metric-panel"><span>MARKETPLACE</span><strong>{MARKETPLACE_MAINNET_ADDRESS ? "READY" : "PENDING AUDIT"}</strong><small>{MARKETPLACE_MAINNET_ADDRESS ? "Base Mainnet contract" : "Not deployed"}</small></div></div>
        {view === "creator" ? <div className="dashboard-columns"><div className="control-panel"><div className="panel-heading"><span className="panel-kicker">CREATOR TOOLS</span><LayoutDashboard size={17} /></div><button onClick={() => toast.info("Mint configuration requires a verified mint contract.")}><Sparkles size={18} /><span><b>Mint configuration</b><small>Set supply, metadata and mint status</small></span><ChevronRight /></button><a href={OPENSEA_COLLECTION_URL} target="_blank" rel="noreferrer"><CircleDollarSign size={18} /><span><b>Marketplace links</b><small>Open the official OpenSea collection</small></span><ExternalLink /></a><a href={RARIBLE_COLLECTION_URL} target="_blank" rel="noreferrer"><ArrowUpRight size={18} /><span><b>Rarible collection</b><small>Open the official Rarible items page</small></span><ExternalLink /></a><button onClick={() => window.open(BASESCAN_URL, "_blank")}><BadgeCheck size={18} /><span><b>Contract verification</b><small>Open the BaseScan contract record</small></span><ExternalLink /></button></div><div className="control-panel archive-panel"><div className="panel-heading"><span className="panel-kicker">CREATOR CHECKLIST</span><ShieldCheck size={17} /></div><p><Check size={16} /> Contract address is pinned</p><p><Check size={16} /> Base Mainnet is the target chain</p><p className="pending"><RefreshCw size={16} /> Marketplace adapter pending</p><p><BadgeCheck size={16} /> Live metadata index active</p></div></div> : <div className="dashboard-columns"><div className="control-panel"><div className="panel-heading"><span className="panel-kicker">WALLET ACTIONS</span><Wallet size={17} /></div><a href={OPENSEA_COLLECTION_URL} target="_blank" rel="noreferrer"><CircleDollarSign size={18} /><span><b>Buy a Punk</b><small>Open the live OpenSea collection</small></span><ExternalLink /></a><a href={RARIBLE_COLLECTION_URL} target="_blank" rel="noreferrer"><ArrowUpRight size={18} /><span><b>Sell an NFT</b><small>Open the live Rarible collection</small></span><ExternalLink /></a><a href={OPENSEA_COLLECTION_URL} target="_blank" rel="noreferrer"><Clipboard size={18} /><span><b>Create a listing</b><small>List through the marketplace you choose</small></span><ExternalLink /></a></div><div className="control-panel archive-panel"><div className="panel-heading"><span className="panel-kicker">ACCOUNT ACTIVITY</span><RefreshCw size={17} /></div><div className="empty-state"><Wallet size={22} /><b>{wallet ? "No indexed NFTs yet" : "Wallet not connected"}</b><span>{wallet ? "Your live holdings will appear when the metadata index is connected." : "Connect MetaMask to load your Base account."}</span></div></div></div>}
      </section>}
    </main>

    <section id="market" className="market-section"><div className="market-marker"><b>03</b><span>MARKET PROTOCOL</span><i className="marker-line" /></div><div className="market-copy"><p className="section-kicker">BUY / SELL / LIST</p><h2>Choose your<br /><em>entry point.</em></h2><p>Every action is prepared in the interface and confirmed by your wallet. Nothing is transferred and no signature is requested without your approval.</p><div className="market-buttons"><a className="button button-orange" href={OPENSEA_COLLECTION_URL} target="_blank" rel="noreferrer">OpenSea collection <ArrowUpRight size={16} /></a><a className="button button-outline" href={RARIBLE_COLLECTION_URL} target="_blank" rel="noreferrer"><span className="qr-mark dark" /> Rarible collection</a></div></div><div className="market-spec"><div><span>NETWORK</span><strong>{network}</strong></div><div><span>CONTRACT</span><strong>{contractLabel}</strong></div><div><span>WALLET</span><strong>{wallet ? shortAddress(wallet) : "NOT CONNECTED"}</strong></div><button className="contract-copy" onClick={copyContract}><Copy size={14} /> Copy address</button></div></section>
    <section className="github-section"><div><p className="section-kicker">OPEN SOURCE / GITHUB PAGES</p><h2>Built to be<br /><span>verifiable.</span></h2><p>This static front-end can run for free on GitHub Pages. It never stores private keys and never asks for a seed phrase.</p></div><div className="github-card"><div className="terminal-label">[ OPEN / SOURCE ]</div><Github size={25} /><span>PUBLIC REPOSITORY</span><strong>punks-base-collection</strong><a href="https://github.com/Demro-Labs/punks-base-collection" target="_blank" rel="noreferrer">Prepare repository <ArrowUpRight size={15} /></a></div></section>
    <footer><div className="brand footer-brand"><span className="brand-mark"><img src="./assets/cryptopunk-2890.png" alt="" /><i /></span><span>PUNKS<span>/</span>BASE</span></div><span>© 2026 PUNKS BASE / BASE MAINNET</span><a href={BASESCAN_URL} target="_blank" rel="noreferrer">0xb911…af28 <ExternalLink size={13} /></a></footer>
    {selectedNft && <div className="action-overlay" role="dialog" aria-modal="true"><div className="metadata-modal"><button className="modal-close" aria-label="Close metadata" onClick={() => setSelectedNft(null)}><X /></button><div className="metadata-modal-grid"><img src={selectedNft.image} alt={selectedNft.name} /><div><p className="section-kicker">ON-CHAIN METADATA / TOKEN {selectedNft.tokenId}</p><h2>{selectedNft.name}</h2><p className="metadata-description">{selectedNft.description || "No description was published in this token’s metadata."}</p><div className="attribute-list">{selectedNft.attributes?.length ? selectedNft.attributes.map((attribute, index) => <div key={`${attribute.trait_type}-${index}`}><span>{attribute.trait_type || "Trait"}</span><strong>{String(attribute.value ?? "—")}</strong></div>) : <div><span>ATTRIBUTES</span><strong>Not available</strong></div>}</div><a className="text-link" href={`https://opensea.io/assets/base/${CONTRACT}/${selectedNft.tokenId}`} target="_blank" rel="noreferrer">Open this token on OpenSea <ExternalLink size={14} /></a></div></div></div></div>}
    {action && <div className="action-overlay" role="dialog" aria-modal="true"><div className="action-modal"><button className="modal-close" aria-label="Close" onClick={() => setAction(null)}><X /></button><p className="section-kicker">{action.toUpperCase()} / WALLET CONFIRMATION</p><h2>{action === "buy" ? "Inspect before you buy." : action === "sell" ? "Prepare a sale." : "Create a listing."}</h2><p>{action === "buy" ? "The marketplace page will show the live price and ask your wallet to confirm only after you review the details." : "This flow is prepared for wallet confirmation. A verified marketplace adapter is still required before any real approval or transfer."}</p><div className="modal-contract"><span>COLLECTION CONTRACT</span><strong>{CONTRACT}</strong><button onClick={copyContract}><Copy size={14} /></button></div><div className="modal-actions"><button className="button button-orange" onClick={() => { setAction(null); toast.info("Marketplace adapter required before a real transaction can be signed."); }}>Continue securely <ArrowUpRight size={15} /></button><button className="button button-ghost" onClick={() => setAction(null)}>Cancel</button></div></div></div>}
  </div>;
}
