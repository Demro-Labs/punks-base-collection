// Design system: Base Terminal — English-first collector interface, graphite archive surfaces, ivory catalog panels, and Base Signal Orange reserved for actions and verified states.
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BadgeCheck, Check, ChevronRight, CircleDollarSign, Clipboard, Copy, ExternalLink, Github, LayoutDashboard, Menu, RefreshCw, ShieldCheck, Sparkles, Wallet, X } from "lucide-react";
import { toast } from "sonner";

const CONTRACT = "0xb9110ba3266f4983193c0d5f55c792a94368af28";
const BASE_CHAIN_ID = "0x2105";
const BASESCAN_URL = `https://basescan.org/address/${CONTRACT}`;

type View = "collection" | "creator" | "wallet";
type Action = "buy" | "sell" | "list" | null;

const shortAddress = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`;
const BASE_RPC = "https://mainnet.base.org";
const OPENSEA_COLLECTION_URL = "https://opensea.io/collection/punks-base-1";
const RARIBLE_COLLECTION_URL = "https://og.rarible.com/collection/base/0xb9110ba3266f4983193c0d5f55c792a94368af28/items";

type NftItem = { id: string; name: string; trait: string; price: string; image: string; tokenId: string; listed?: boolean; description?: string; attributes?: Array<{ trait_type?: string; value?: string }> };
type FeaturedItem = { id: string; label: string; image: string; tokenId?: string };
const FEATURED_ITEMS: FeaturedItem[] = [
  { id: "635", label: "Punk #635", tokenId: "635", image: "/manus-storage/cryptopunk-635_7013741e.png" },
  { id: "3443", label: "Punk #3443", tokenId: "3443", image: "/manus-storage/cryptopunk-3443_06cfd633.png" },
  { id: "IMG_3579", label: "Featured collection item", image: "/manus-storage/IMG_3579_7c40faf1.png" },
];

async function rpc(method: string, params: unknown[] = []) {
  const response = await fetch(BASE_RPC, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params }) });
  const payload = await response.json();
  if (payload.error) throw new Error(payload.error.message || "Base RPC error");
  return payload.result;
}

function decodeAbiString(value: string) {
  const hex = value?.replace(/^0x/, "") || "";
  if (!hex) return "";
  try {
    const offset = Number.parseInt(hex.slice(0, 64), 16) * 2;
    const length = Number.parseInt(hex.slice(offset, offset + 64), 16) * 2;
    const data = hex.slice(offset + 64, offset + 64 + length);
    return decodeURIComponent(data.replace(/(..)/g, "%$1"));
  } catch { return ""; }
}

function normalizeUri(uri: string) {
  if (!uri) return "";
  if (uri.startsWith("ipfs://")) return `https://ipfs.io/ipfs/${uri.slice(7)}`;
  if (uri.startsWith("ar://")) return `https://arweave.net/${uri.slice(5)}`;
  return uri;
}

function uriCandidates(uri: string) {
  if (!uri.startsWith("ipfs://")) return [normalizeUri(uri)];
  const path = uri.slice(7);
  return [`https://ipfs.io/ipfs/${path}`, `https://dweb.link/ipfs/${path}`, `https://cloudflare-ipfs.com/ipfs/${path}`];
}

async function fetchMetadataJson(uri: string) {
  let lastError: unknown;
  for (const candidate of uriCandidates(uri)) {
    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 12000);
      const response = await fetch(candidate, { signal: controller.signal });
      window.clearTimeout(timeout);
      if (!response.ok) throw new Error(`Metadata gateway returned ${response.status}`);
      return response.json();
    } catch (error) { lastError = error; }
  }
  throw lastError || new Error("Metadata gateway unavailable");
}

async function fetchNftFromChain(tokenIndex: number): Promise<NftItem | null> {
  try {
    const encodedId = tokenIndex.toString(16).padStart(64, "0");
    const rawUri = await rpc("eth_call", [{ to: CONTRACT, data: `0xc87b56dd${encodedId}` }, "latest"]);
    const metadataUri = decodeAbiString(rawUri);
    if (!metadataUri) return null;
    const metadata = await fetchMetadataJson(metadataUri);
    const image = normalizeUri(metadata.image || metadata.image_url || "");
    if (!image) return null;
    return { id: String(tokenIndex).padStart(4, "0"), tokenId: String(tokenIndex), name: metadata.name || `Punk / ${tokenIndex}`, trait: metadata.attributes?.slice?.(0, 2).map((item: any) => `${item.trait_type}: ${item.value}`).join(" · ") || "On-chain metadata", price: "—", image, description: metadata.description, attributes: metadata.attributes, listed: false };
  } catch { return null; }
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
  const contractLabel = useMemo(() => `${CONTRACT.slice(0, 8)}…${CONTRACT.slice(-6)}`, []);

  useEffect(() => {
    let cancelled = false;
    async function loadOnChainCollection() {
      try {
        setLoadingNfts(true);
        const rawSupply = await rpc("eth_call", [{ to: CONTRACT, data: "0x18160ddd" }, "latest"]);
        const total = Number.parseInt(rawSupply, 16);
        if (!Number.isFinite(total) || total <= 0) throw new Error("The contract did not return a readable total supply.");
        setSupply(total);
        const ids = Array.from({ length: Math.min(total, 8) }, (_, index) => index + 1);
        const loaded = await Promise.all(ids.map(fetchNftFromChain));
        if (!cancelled) { const valid = loaded.filter(Boolean) as NftItem[]; setNfts(valid); if (!valid.length) setMetadataError("No readable token metadata was returned by the contract."); }
      } catch (error: any) { if (!cancelled) setMetadataError(error?.message || "Unable to load this collection from Base."); }
      finally { if (!cancelled) setLoadingNfts(false); }
    }
    loadOnChainCollection();
    return () => { cancelled = true; };
  }, []);

  async function loadMoreMetadata() {
    if (!supply || nfts.length >= supply) return;
    const start = nfts.length + 1;
    const end = Math.min(supply, start + 7);
    const loaded = (await Promise.all(Array.from({ length: end - start + 1 }, (_, offset) => fetchNftFromChain(start + offset)))).filter(Boolean) as NftItem[];
    setNfts((current) => [...current, ...loaded]);
    setVisibleCount((count) => count + 8);
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
    <header className="nav-wrap"><button className="brand" onClick={() => { setView("collection"); scrollTo("top"); }} aria-label="Punks Base Collection"><span className="brand-mark"><img src="/manus-storage/cryptopunk-2890_0bdcc470.png" alt="" /><i /></span><span>PUNKS<span>/</span>BASE</span></button>
      <nav className={menuOpen ? "nav-links open" : "nav-links"}><button onClick={() => { setView("collection"); scrollTo("collection"); }}>Collection</button><button onClick={() => { setView("creator"); scrollTo("dashboard"); }}>Creator dashboard</button><button onClick={() => { setView("wallet"); scrollTo("dashboard"); }}>My wallet</button><a href={BASESCAN_URL} target="_blank" rel="noreferrer">Contract <ExternalLink size={13} /></a></nav>
      <div className="nav-actions">{wallet ? <button className="wallet-pill connected" onClick={disconnect}><span className="wallet-live" />{shortAddress(wallet)}</button> : <button className="button button-orange button-small" onClick={connectMetaMask} disabled={connecting}><Wallet size={15} />{connecting ? "Connecting…" : "Connect wallet"}</button>}<button className="menu-button" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button></div>
    </header>

    <main id="top">
      {view === "collection" && <>
        <section className="hero-section"><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-line" /> ARCHIVE 001 / BASE MAINNET</div><h1>Small format.<br /><em>On-chain</em><br />identity.</h1><p className="hero-lede">Punks Base is a collection of digital characters, recorded on Base and made for people who prefer proof over promises.</p><div className="hero-cta-row"><button className="button button-orange" onClick={() => scrollTo("collection")}>Explore collection <ArrowUpRight size={17} /></button><button className="button button-ghost" onClick={connectMetaMask}><Wallet size={16} /> Connect MetaMask</button></div><div className="hero-note"><ShieldCheck size={15} /> Public contract · Base network · transparent reading <span className="verified-badge"><Check size={14} /> Verified on Base</span></div></div><div className="hero-art-wrap"><div className="art-index">FIG. 001<br /><span>PUNK / BASE</span></div>{nfts[0] ? <img className="hero-art real-nft-image" src={nfts[0].image} alt={nfts[0].name} /> : <div className="hero-image-loading">{loadingNfts ? "WAITING FOR REAL TOKEN IMAGE / BASE" : "REAL TOKEN IMAGE UNAVAILABLE"}</div>}<div className="art-caption"><span>01</span><span>ORIGINAL CHARACTER STUDY</span><span>BASE / 8453</span></div></div></section>
        <section className="ticker"><span>COLLECTION / PUNKS BASE</span><span>NETWORK / BASE</span><span>CONTRACT / {contractLabel}</span><span>STANDARD / ERC-721</span><span>COLLECTION / PUNKS BASE</span></section>
        <section id="manifesto" className="manifesto-section"><div className="section-index">[ 00 / NOTE ]</div><div className="manifesto-content"><p className="section-kicker">A PROTOCOL FOR TINY IDENTITIES</p><h2>Every Punk is a <span>signature.</span></h2><p>No inflated roadmap. No magical access promise. Just a readable collection, a verifiable contract and a new place for avatars with nothing to prove.</p><a className="text-link" href={BASESCAN_URL} target="_blank" rel="noreferrer">Read contract on BaseScan <ArrowUpRight size={15} /></a></div><div className="manifesto-stamp"><img src="/manus-storage/cryptopunk-2890_0bdcc470.png" alt="" /><span>VERIFIED<br />ON BASE</span></div></section>
        <section id="collection" className="collection-section"><div className="collection-head"><div><p className="section-kicker">THE ARCHIVE / 2026</p><h2>The collection<span>.</span></h2></div><div className="collection-meta"><span><b>{supply ?? "—"}</b> total supply</span><span><b>8453</b> chain id</span></div></div><div className="collection-layout"><aside className="filter-rail"><span className="rail-label">INDEX</span><button className="filter-active">01 / ALL PUNKS</button><button onClick={() => toast.info("Trait filtering is ready for the metadata index.")}>02 / TRAITS</button><button onClick={() => { setView("wallet"); scrollTo("dashboard"); }}>03 / MY WALLET</button><div className="rail-bottom">SORT<br /><button onClick={() => toast.info("Sorting will use the live marketplace index.")}>LATEST <ChevronRight size={14} /></button></div></aside><div className="featured-items" aria-label="Featured collection items">{FEATURED_ITEMS.map((item) => <article className="featured-item" key={item.id}><div className="featured-image-wrap"><img src={item.image} alt={item.label} /><span className="featured-check"><Check size={13} /> Verified on Base</span></div><div className="featured-item-meta"><div><span className="section-kicker">FEATURED ITEM</span><h3>{item.label}</h3></div>{item.tokenId ? <a href={`https://opensea.io/assets/base/${CONTRACT}/${item.tokenId}`} target="_blank" rel="noreferrer" aria-label={`Open ${item.label} on OpenSea`}><ExternalLink size={14} /></a> : <BadgeCheck size={16} aria-label="Verified collection image" />}</div></article>)}</div><div className="metadata-state">{loadingNfts ? <><RefreshCw size={15} /> Reading real tokenURI metadata from Base…</> : metadataError ? <><ShieldCheck size={15} /> {metadataError} <a href={RARIBLE_COLLECTION_URL} target="_blank" rel="noreferrer">Open marketplace collection <ExternalLink size={13} /></a></> : <><BadgeCheck size={15} /> Live on-chain metadata · {nfts.length} loaded of {supply ?? nfts.length}</>}</div>{loadingNfts && <div className="metadata-skeleton-grid" aria-label="Loading real NFT metadata"><div /><div /><div /></div>}{!loadingNfts && nfts.length > 0 && <div className="punk-grid">{nfts.slice(0, visibleCount).map((punk, index) => <article className={`punk-card card-${index + 1}`} key={punk.id}><div className="punk-image-wrap"><span className="card-number">#{punk.id}</span><img className="real-nft-image" src={punk.image} alt={punk.name} /><span className="scan-line" /></div><div className="punk-info"><div><h3>{punk.name}</h3><p>{punk.trait}</p></div><div className="punk-price"><span>PRICE</span><strong>{punk.price}</strong></div></div><div className="punk-actions"><button className="card-link" onClick={() => setSelectedNft(punk)}>Metadata <ChevronRight size={14} /></button><a className="sell-link" href={`https://opensea.io/assets/base/${CONTRACT}/${punk.tokenId}`} target="_blank" rel="noreferrer">OpenSea <ExternalLink size={14} /></a></div></article>)}</div>}{!loadingNfts && nfts.length > 0 && nfts.length < (supply ?? 0) && <button className="load-more" onClick={loadMoreMetadata}>Load next metadata batch <ChevronRight size={14} /></button>}</div></section>
      </>}

      {view !== "collection" && <section id="dashboard" className="dashboard-page"><div className="dashboard-header"><div><p className="section-kicker">{view === "creator" ? "CREATOR CONTROL / 01" : "WALLET CONTROL / 02"}</p><h1>{view === "creator" ? <>Creator<br /><em>dashboard.</em></> : <>Your wallet<br /><em>terminal.</em></>}</h1><p className="dashboard-lede">{view === "creator" ? "A clear control surface for collection status, contract references and future marketplace configuration." : "Your Base account, holdings and marketplace activity in one verifiable view."}</p></div><div className="dashboard-status"><span className="status-box-label">CONNECTION STATUS</span><strong className={wallet ? "is-live" : ""}>{wallet ? "CONNECTED" : "NOT CONNECTED"}</strong><span>{wallet ? shortAddress(wallet) : "Connect a wallet to load live data"}</span><button className="button button-orange button-small" onClick={wallet ? disconnect : connectMetaMask}>{wallet ? "Disconnect" : "Connect wallet"}</button></div></div>
        <div className="dashboard-grid"><div className="metric-panel"><span>NETWORK</span><strong>{network}</strong><small>Base Mainnet · 8453</small></div><div className="metric-panel"><span>CONTRACT</span><strong>{contractLabel}</strong><small>ERC-721 reference</small></div><div className="metric-panel"><span>{view === "creator" ? "INDEXED PIECES" : "YOUR NFTs"}</span><strong>{view === "creator" ? "03" : wallet ? "0" : "—"}</strong><small>{view === "creator" ? "Archive entries" : "Live wallet index"}</small></div></div>
        {view === "creator" ? <div className="dashboard-columns"><div className="control-panel"><div className="panel-heading"><span className="panel-kicker">CREATOR TOOLS</span><LayoutDashboard size={17} /></div><button onClick={() => toast.info("Mint configuration requires a verified mint contract.")}><Sparkles size={18} /><span><b>Mint configuration</b><small>Set supply, metadata and mint status</small></span><ChevronRight /></button><a href={OPENSEA_COLLECTION_URL} target="_blank" rel="noreferrer"><CircleDollarSign size={18} /><span><b>Marketplace links</b><small>Open the official OpenSea collection</small></span><ExternalLink /></a><a href={RARIBLE_COLLECTION_URL} target="_blank" rel="noreferrer"><ArrowUpRight size={18} /><span><b>Rarible collection</b><small>Open the official Rarible items page</small></span><ExternalLink /></a><button onClick={() => window.open(BASESCAN_URL, "_blank")}><BadgeCheck size={18} /><span><b>Contract verification</b><small>Open the BaseScan contract record</small></span><ExternalLink /></button></div><div className="control-panel archive-panel"><div className="panel-heading"><span className="panel-kicker">CREATOR CHECKLIST</span><ShieldCheck size={17} /></div><p><Check size={16} /> Contract address is pinned</p><p><Check size={16} /> Base Mainnet is the target chain</p><p className="pending"><RefreshCw size={16} /> Marketplace adapter pending</p><p className="pending"><RefreshCw size={16} /> Live metadata index pending</p></div></div> : <div className="dashboard-columns"><div className="control-panel"><div className="panel-heading"><span className="panel-kicker">WALLET ACTIONS</span><Wallet size={17} /></div><a href={OPENSEA_COLLECTION_URL} target="_blank" rel="noreferrer"><CircleDollarSign size={18} /><span><b>Buy a Punk</b><small>Open the live OpenSea collection</small></span><ExternalLink /></a><a href={RARIBLE_COLLECTION_URL} target="_blank" rel="noreferrer"><ArrowUpRight size={18} /><span><b>Sell an NFT</b><small>Open the live Rarible collection</small></span><ExternalLink /></a><a href={OPENSEA_COLLECTION_URL} target="_blank" rel="noreferrer"><Clipboard size={18} /><span><b>Create a listing</b><small>List through the marketplace you choose</small></span><ExternalLink /></a></div><div className="control-panel archive-panel"><div className="panel-heading"><span className="panel-kicker">ACCOUNT ACTIVITY</span><RefreshCw size={17} /></div><div className="empty-state"><Wallet size={22} /><b>{wallet ? "No indexed NFTs yet" : "Wallet not connected"}</b><span>{wallet ? "Your live holdings will appear when the metadata index is connected." : "Connect MetaMask to load your Base account."}</span></div></div></div>}
      </section>}
    </main>

    <section id="market" className="market-section"><div className="market-marker"><b>03</b><span>MARKET PROTOCOL</span><i className="marker-line" /></div><div className="market-copy"><p className="section-kicker">BUY / SELL / LIST</p><h2>Choose your<br /><em>entry point.</em></h2><p>Every action is prepared in the interface and confirmed by your wallet. Nothing is transferred and no signature is requested without your approval.</p><div className="market-buttons"><a className="button button-orange" href={OPENSEA_COLLECTION_URL} target="_blank" rel="noreferrer">OpenSea collection <ArrowUpRight size={16} /></a><a className="button button-outline" href={RARIBLE_COLLECTION_URL} target="_blank" rel="noreferrer"><span className="qr-mark dark" /> Rarible collection</a></div></div><div className="market-spec"><div><span>NETWORK</span><strong>{network}</strong></div><div><span>CONTRACT</span><strong>{contractLabel}</strong></div><div><span>WALLET</span><strong>{wallet ? shortAddress(wallet) : "NOT CONNECTED"}</strong></div><button className="contract-copy" onClick={copyContract}><Copy size={14} /> Copy address</button></div></section>
    <section className="github-section"><div><p className="section-kicker">OPEN SOURCE / GITHUB PAGES</p><h2>Built to be<br /><span>verifiable.</span></h2><p>This static front-end can run for free on GitHub Pages. It never stores private keys and never asks for a seed phrase.</p></div><div className="github-card"><div className="terminal-label">[ OPEN / SOURCE ]</div><Github size={25} /><span>PUBLIC REPOSITORY</span><strong>punks-base-collection</strong><a href="https://github.com" target="_blank" rel="noreferrer">Prepare repository <ArrowUpRight size={15} /></a></div></section>
    <footer><div className="brand footer-brand"><span className="brand-mark"><img src="/manus-storage/cryptopunk-2890_0bdcc470.png" alt="" /><i /></span><span>PUNKS<span>/</span>BASE</span></div><span>© 2026 PUNKS BASE / BASE MAINNET</span><a href={BASESCAN_URL} target="_blank" rel="noreferrer">0xb911…af28 <ExternalLink size={13} /></a></footer>
    {selectedNft && <div className="action-overlay" role="dialog" aria-modal="true"><div className="metadata-modal"><button className="modal-close" aria-label="Close metadata" onClick={() => setSelectedNft(null)}><X /></button><div className="metadata-modal-grid"><img src={selectedNft.image} alt={selectedNft.name} /><div><p className="section-kicker">ON-CHAIN METADATA / TOKEN {selectedNft.tokenId}</p><h2>{selectedNft.name}</h2><p className="metadata-description">{selectedNft.description || "No description was published in this token’s metadata."}</p><div className="attribute-list">{selectedNft.attributes?.length ? selectedNft.attributes.map((attribute, index) => <div key={`${attribute.trait_type}-${index}`}><span>{attribute.trait_type || "Trait"}</span><strong>{String(attribute.value ?? "—")}</strong></div>) : <div><span>ATTRIBUTES</span><strong>Not available</strong></div>}</div><a className="text-link" href={`https://opensea.io/assets/base/${CONTRACT}/${selectedNft.tokenId}`} target="_blank" rel="noreferrer">Open this token on OpenSea <ExternalLink size={14} /></a></div></div></div></div>}
    {action && <div className="action-overlay" role="dialog" aria-modal="true"><div className="action-modal"><button className="modal-close" aria-label="Close" onClick={() => setAction(null)}><X /></button><p className="section-kicker">{action.toUpperCase()} / WALLET CONFIRMATION</p><h2>{action === "buy" ? "Inspect before you buy." : action === "sell" ? "Prepare a sale." : "Create a listing."}</h2><p>{action === "buy" ? "The marketplace page will show the live price and ask your wallet to confirm only after you review the details." : "This flow is prepared for wallet confirmation. A verified marketplace adapter is still required before any real approval or transfer."}</p><div className="modal-contract"><span>COLLECTION CONTRACT</span><strong>{CONTRACT}</strong><button onClick={copyContract}><Copy size={14} /></button></div><div className="modal-actions"><button className="button button-orange" onClick={() => { setAction(null); toast.info("Marketplace adapter required before a real transaction can be signed."); }}>Continue securely <ArrowUpRight size={15} /></button><button className="button button-ghost" onClick={() => setAction(null)}>Cancel</button></div></div></div>}
  </div>;
}
