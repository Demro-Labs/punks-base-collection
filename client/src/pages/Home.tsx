// Direction artistique : Base Terminal — néo-brutalisme éditorial, graphite, ivoire et orange Base Signal. Cette page privilégie l’asymétrie, les repères d’archive et la transparence des états Web3.
import { useEffect, useMemo, useState } from "react";
import { EthereumProvider } from "@walletconnect/ethereum-provider";
import {
  ArrowUpRight,
  BadgeCheck,
  ChevronDown,
  Copy,
  ExternalLink,
  Github,
  Menu,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "sonner";

const CONTRACT = "0xb9110ba3266f4983193c0d5f55c792a94368af28";
const BASE_CHAIN_ID = "0x2105";
const BASESCAN_URL = `https://basescan.org/address/${CONTRACT}`;
const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "";

const punks = [
  {
    id: "001",
    name: "Punk / 001",
    trait: "Blue cap · sunglasses",
    price: "0.18 ETH",
    image: "/manus-storage/punks-base-card-01_e1afb662.png",
    tokenId: "1",
  },
  {
    id: "002",
    name: "Punk / 002",
    trait: "Green mohawk · round frames",
    price: "0.24 ETH",
    image: "/manus-storage/punks-base-card-02_4c53008a.png",
    tokenId: "2",
  },
  {
    id: "003",
    name: "Punk / 003",
    trait: "Archive sample · Base native",
    price: "—",
    image: "/manus-storage/punks-base-card-01_e1afb662.png",
    tokenId: "3",
  },
];

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function Home() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [network, setNetwork] = useState("Base");
  const [menuOpen, setMenuOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [walletConnectProvider, setWalletConnectProvider] = useState<any>(null);

  const isConnected = Boolean(wallet);
  const contractLabel = useMemo(() => `${CONTRACT.slice(0, 8)}…${CONTRACT.slice(-6)}`, []);

  useEffect(() => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;
    const handleAccounts = (accounts: string[]) => setWallet(accounts[0] || null);
    const handleChain = (chainId: string) => setNetwork(chainId?.toLowerCase() === BASE_CHAIN_ID ? "Base" : "Autre réseau");
    ethereum.request({ method: "eth_accounts" }).then(handleAccounts).catch(() => undefined);
    ethereum.request({ method: "eth_chainId" }).then(handleChain).catch(() => undefined);
    ethereum.on?.("accountsChanged", handleAccounts);
    ethereum.on?.("chainChanged", handleChain);
    return () => {
      ethereum.removeListener?.("accountsChanged", handleAccounts);
      ethereum.removeListener?.("chainChanged", handleChain);
    };
  }, []);

  async function connectMetaMask() {
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      toast.error("MetaMask n’est pas détecté. Installez l’extension ou utilisez WalletConnect.");
      return;
    }
    setConnecting(true);
    try {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      const chainId = await ethereum.request({ method: "eth_chainId" });
      if (chainId?.toLowerCase() !== BASE_CHAIN_ID) {
        try {
          await ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: BASE_CHAIN_ID }] });
        } catch {
          toast.error("Passez sur le réseau Base dans votre wallet pour continuer.");
        }
      }
      setWallet(accounts[0] || null);
      setNetwork("Base");
      toast.success("Wallet connecté sur Base.");
    } catch (error: any) {
      toast.error(error?.message || "Connexion annulée.");
    } finally {
      setConnecting(false);
    }
  }

  async function connectWalletConnect() {
    if (!WALLETCONNECT_PROJECT_ID) {
      toast.info("WalletConnect est prêt : ajoutez VITE_WALLETCONNECT_PROJECT_ID dans GitHub Actions pour activer le QR code.");
      return;
    }
    setConnecting(true);
    try {
      const provider = await EthereumProvider.init({
        projectId: WALLETCONNECT_PROJECT_ID,
        chains: [8453],
        optionalChains: [8453],
        showQrModal: true,
        rpcMap: { 8453: "https://mainnet.base.org" },
      });
      await provider.connect();
      const accounts = await provider.request({ method: "eth_accounts" }) as string[];
      setWallet(accounts?.[0] || null);
      setNetwork("Base");
      setWalletConnectProvider(provider);
      toast.success("WalletConnect connecté sur Base.");
    } catch (error: any) {
      toast.error(error?.message || "Connexion WalletConnect annulée.");
    } finally {
      setConnecting(false);
    }
  }

  async function disconnect() {
    try { await walletConnectProvider?.disconnect(); } catch { /* provider may already be closed */ }
    setWallet(null);
    setWalletConnectProvider(null);
    toast.success("Wallet déconnecté.");
  }

  function copyContract() {
    navigator.clipboard?.writeText(CONTRACT);
    toast.success("Adresse du contrat copiée.");
  }

  function handleSell() {
    if (!isConnected) {
      toast.info("Connectez d’abord votre wallet pour préparer une vente.");
      return;
    }
    toast.info("Le listing de vente nécessite la configuration d’un contrat marketplace vérifié. Aucun actif n’est transféré ici.");
  }

  return (
    <div className="site-shell">
      <div className="top-strip"><span>BASE NETWORK / COLLECTION TERMINAL</span><span>STATUS <b className="status-dot" /> ONLINE</span></div>
      <header className="nav-wrap">
        <a className="brand" href="#top" aria-label="Punks Base Collection">
          <span className="brand-mark"><img src="/manus-storage/punks-base-mark_650b0dd6.png" alt="" /><i /></span>
          <span>PUNKS<span>/</span>BASE</span>
        </a>
        <nav className={menuOpen ? "nav-links open" : "nav-links"}>
          <a href="#collection" onClick={() => setMenuOpen(false)}>Collection</a>
          <a href="#manifesto" onClick={() => setMenuOpen(false)}>Manifesto</a>
          <a href="#market" onClick={() => setMenuOpen(false)}>Market</a>
          <a href={BASESCAN_URL} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)}>Contract <ExternalLink size={13} /></a>
        </nav>
        <div className="nav-actions">
          {isConnected ? (
            <button className="wallet-pill connected" onClick={disconnect}><span className="wallet-live" />{shortAddress(wallet!)}</button>
          ) : (
            <button className="button button-orange button-small" onClick={connectMetaMask} disabled={connecting}><Wallet size={15} />{connecting ? "Connexion…" : "Connect wallet"}</button>
          )}
          <button className="menu-button" aria-label="Ouvrir le menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> ARCHIVE 001 / BASE MAINNET</div>
            <h1>Un petit format.<br /><em>Une identité</em><br />sur chaîne.</h1>
            <p className="hero-lede">Punks Base est une collection de caractères numériques, enregistrée sur Base et pensée pour celles et ceux qui préfèrent les preuves aux promesses.</p>
            <div className="hero-cta-row">
              <a href="#collection" className="button button-orange">Explorer la collection <ArrowUpRight size={17} /></a>
              <button className="button button-ghost" onClick={connectWalletConnect}><span className="qr-mark" /> WalletConnect</button>
            </div>
            <div className="hero-note"><ShieldCheck size={15} /> Contrat public · réseau Base · lecture transparente</div>
          </div>
          <div className="hero-art-wrap">
            <div className="art-index">FIG. 001<br /><span>PUNK / BASE</span></div>
            <img className="hero-art" src="/manus-storage/punks-base-hero_109ab9ce.png" alt="Punk abstrait de la collection Punks Base" />
            <div className="art-caption"><span>01</span><span>ORIGINAL CHARACTER STUDY</span><span>BASE / 8453</span></div>
          </div>
        </section>

        <section className="ticker" aria-label="Informations de la collection"><span>COLLECTION / PUNKS BASE</span><span>NETWORK / BASE</span><span>CONTRACT / {contractLabel}</span><span>STANDARD / ERC-721</span><span>COLLECTION / PUNKS BASE</span></section>

        <section id="manifesto" className="manifesto-section">
          <div className="section-index">[ 00 / NOTE ]</div>
          <div className="manifesto-content"><p className="section-kicker">A PROTOCOL FOR TINY IDENTITIES</p><h2>Chaque Punk est une <span>signature.</span></h2><p>Pas de roadmap gonflée. Pas de promesse d’accès magique. Seulement une collection lisible, un contrat vérifiable et une nouvelle place pour les avatars qui n’ont rien à prouver.</p><a className="text-link" href={BASESCAN_URL} target="_blank" rel="noreferrer">Lire le contrat sur BaseScan <ArrowUpRight size={15} /></a></div>
          <div className="manifesto-stamp"><img src="/manus-storage/punks-base-mark_650b0dd6.png" alt="" /><span>VERIFIED<br />ON BASE</span></div>
        </section>

        <section id="collection" className="collection-section">
          <div className="collection-head"><div><p className="section-kicker">THE ARCHIVE / 2026</p><h2>La collection<span>.</span></h2></div><div className="collection-meta"><span><b>03</b> pièces indexées</span><span><b>8453</b> chain id</span></div></div>
          <div className="collection-layout"><aside className="filter-rail"><span className="rail-label">INDEX</span><button className="filter-active">01 / ALL PUNKS</button><button onClick={() => toast.info("Filtre traits : bientôt disponible.")}>02 / TRAITS</button><button onClick={() => toast.info("Vos Punks apparaîtront après connexion et indexation.")}>03 / MY WALLET</button><div className="rail-bottom">SORT<br /><button onClick={() => toast.info("Tri par prix : bientôt disponible.")}>LATEST <ChevronDown size={14} /></button></div></aside>
            <div className="punk-grid">{punks.map((punk, index) => <article className={`punk-card card-${index + 1}`} key={punk.id}><div className="punk-image-wrap"><span className="card-number">#{punk.id}</span><img src={punk.image} alt={punk.name} /><span className="scan-line" /></div><div className="punk-info"><div><h3>{punk.name}</h3><p>{punk.trait}</p></div><div className="punk-price"><span>PRICE</span><strong>{punk.price}</strong></div></div><div className="punk-actions"><a className="card-link" href={`https://opensea.io/assets/base/${CONTRACT}/${punk.tokenId}`} target="_blank" rel="noreferrer">Voir / acheter <ExternalLink size={14} /></a><button className="sell-link" onClick={handleSell}>Vendre <ArrowUpRight size={14} /></button></div></article>)}</div>
          </div>
        </section>

        <section id="market" className="market-section"><div className="market-marker"><b>02</b><span>MARKET PROTOCOL</span><i className="marker-line" /></div><div className="market-copy"><p className="section-kicker">BUY / SELL / VERIFY</p><h2>Choisir son<br /><em>point d’entrée.</em></h2><p>Connectez votre wallet pour vérifier votre réseau, consulter vos actifs et préparer une action. Les transactions sont toujours confirmées dans votre wallet avant signature.</p><div className="market-buttons"><button className="button button-orange" onClick={isConnected ? handleSell : connectMetaMask}>{isConnected ? "Préparer une vente" : "Connecter pour vendre"} <ArrowUpRight size={16} /></button><button className="button button-outline" onClick={connectWalletConnect}><span className="qr-mark dark" /> Connecter avec WalletConnect</button></div></div><div className="market-spec"><div><span>NETWORK</span><strong>{network}</strong></div><div><span>CONTRACT</span><strong>{contractLabel}</strong></div><div><span>WALLET</span><strong>{wallet ? shortAddress(wallet) : "NOT CONNECTED"}</strong></div><button className="contract-copy" onClick={copyContract}><Copy size={14} /> Copier l’adresse</button></div></section>

        <section className="github-section"><div><p className="section-kicker">OPEN SOURCE / GITHUB PAGES</p><h2>Construit pour être<br /><span>vérifiable.</span></h2><p>Le front-end est statique et peut être publié gratuitement sur GitHub Pages. Le site ne conserve aucune clé privée et ne demande jamais votre seed phrase.</p></div><div className="github-card"><div className="terminal-label">[ OPEN / SOURCE ]</div><Github size={25} /><span>PUBLIC REPOSITORY</span><strong>punks-base-collection</strong><a href="https://github.com" target="_blank" rel="noreferrer">Préparer le dépôt <ArrowUpRight size={15} /></a></div></section>
      </main>
      <footer><div className="brand footer-brand"><span className="brand-mark"><img src="/manus-storage/punks-base-mark_650b0dd6.png" alt="" /><i /></span><span>PUNKS<span>/</span>BASE</span></div><span>© 2026 PUNKS BASE / BASE MAINNET</span><a href={BASESCAN_URL} target="_blank" rel="noreferrer">0xb911…af28 <ExternalLink size={13} /></a></footer>
    </div>
  );
}
