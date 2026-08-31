/*
 * Base Terminal data layer: live Punks reads stay read-only, batched, cancellable,
 * and resilient to RPC/IPFS rate limits. Keep this file free of UI concerns.
 */

export const PUNKS_BASE_CONTRACT = "0xb9110ba3266f4983193c0d5f55c792a94368af28";

const RPC_ENDPOINTS = [
  "https://mainnet.base.org",
  "https://base-rpc.publicnode.com",
  "https://1rpc.io/base",
];

const IPFS_GATEWAYS = [
  "https://ipfs.filebase.io/ipfs/",
  "https://ipfs.io/ipfs/",
  "https://dweb.link/ipfs/",
];

const RPC_TIMEOUT_MS = 8_000;
const METADATA_TIMEOUT_MS = 6_000;

export type LiveAttribute = { trait_type?: string; value?: string | number };

export type LiveCollectionNft = {
  tokenId: string;
  name: string;
  image: string;
  description?: string;
  attributes: LiveAttribute[];
};

type RpcResult = { jsonrpc: string; id: number; result?: string; error?: { message?: string } };

type TokenUriEntry = { tokenId: number; uri: string };

function withTimeout(init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);
  return { init: { ...init, signal: controller.signal }, timeout };
}

async function fetchJson(url: string, init: RequestInit, timeoutMs: number) {
  const request = withTimeout(init, timeoutMs);
  try {
    const response = await fetch(url, request.init);
    if (!response.ok) throw new Error(`Request returned ${response.status}`);
    return await response.json();
  } finally {
    globalThis.clearTimeout(request.timeout);
  }
}

async function callRpc(method: string, params: unknown[] = []) {
  let lastError: unknown;
  for (const endpoint of RPC_ENDPOINTS) {
    try {
      const payload = await fetchJson(endpoint, {
        method: "POST",
        cache: "no-store",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params }),
      }, RPC_TIMEOUT_MS);
      if (payload.error) throw new Error(payload.error.message || "Base RPC error");
      return payload.result as string;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("Base RPC unavailable");
}

async function callRpcBatch(tokenIds: number[]) {
  const requests = tokenIds.map((tokenId, index) => ({
    jsonrpc: "2.0",
    id: index + 1,
    method: "eth_call",
    params: [{ to: PUNKS_BASE_CONTRACT, data: `0xc87b56dd${tokenId.toString(16).padStart(64, "0")}` }, "latest"],
  }));
  let lastError: unknown;
  for (const endpoint of RPC_ENDPOINTS) {
    try {
      const payload = await fetchJson(endpoint, {
        method: "POST",
        cache: "no-store",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(requests),
      }, RPC_TIMEOUT_MS);
      if (!Array.isArray(payload)) throw new Error("Base RPC batch response was not an array");
      return (payload as RpcResult[]).sort((a, b) => a.id - b.id);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("Base RPC batch unavailable");
}

function decodeAbiString(value: string) {
  const hex = value?.replace(/^0x/, "") || "";
  try {
    const offset = Number.parseInt(hex.slice(0, 64), 16) * 2;
    const length = Number.parseInt(hex.slice(offset, offset + 64), 16) * 2;
    const data = hex.slice(offset + 64, offset + 64 + length);
    return decodeURIComponent(data.replace(/(..)/g, "%$1"));
  } catch {
    return "";
  }
}

export function normalizeLiveUri(uri: string) {
  if (!uri) return "";
  if (uri.startsWith("ipfs://")) return `${IPFS_GATEWAYS[0]}${uri.slice(7)}`;
  if (uri.startsWith("ar://")) return `https://arweave.net/${uri.slice(5)}`;
  return uri;
}

function uriCandidates(uri: string) {
  if (!uri.startsWith("ipfs://")) return [normalizeLiveUri(uri)];
  const path = uri.slice(7);
  return IPFS_GATEWAYS.map((gateway) => `${gateway}${path}`);
}

const metadataCache = new Map<string, Promise<Record<string, any>>>();

async function fetchMetadata(uri: string, forceFresh = false) {
  if (!forceFresh) {
    const cached = metadataCache.get(uri);
    if (cached) return cached;
  }
  const request = (async () => {
    const attempts = uriCandidates(uri).map((candidate) => fetchJson(candidate, { cache: "no-store" }, METADATA_TIMEOUT_MS));
    try {
      return await Promise.any(attempts) as Record<string, any>;
    } catch {
      throw new Error("Metadata gateways unavailable");
    }
  })();
  if (!forceFresh) {
    metadataCache.set(uri, request);
    request.catch(() => {
      if (metadataCache.get(uri) === request) metadataCache.delete(uri);
    });
  }
  return request;
}

async function mapWithConcurrency<T, R>(values: T[], concurrency: number, mapper: (value: T) => Promise<R>) {
  const results = new Array<R>(values.length);
  let cursor = 0;
  async function worker() {
    while (cursor < values.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await mapper(values[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, () => worker()));
  return results;
}

async function tokenUris(tokenIds: number[]) {
  try {
    const batch = await callRpcBatch(tokenIds);
    return batch.map((result, index) => ({ tokenId: tokenIds[index], uri: result.result ? decodeAbiString(result.result) : "" }));
  } catch {
    const fallback = await mapWithConcurrency(tokenIds, 4, async (tokenId) => {
      try {
        const raw = await callRpc("eth_call", [{ to: PUNKS_BASE_CONTRACT, data: `0xc87b56dd${tokenId.toString(16).padStart(64, "0")}` }, "latest"]);
        return { tokenId, uri: decodeAbiString(raw) };
      } catch {
        return { tokenId, uri: "" };
      }
    });
    return fallback;
  }
}

export async function fetchLiveSupply() {
  const raw = await callRpc("eth_call", [{ to: PUNKS_BASE_CONTRACT, data: "0x18160ddd" }, "latest"]);
  const supply = Number.parseInt(raw, 16);
  if (!Number.isFinite(supply) || supply <= 0) throw new Error("The contract did not return a readable total supply.");
  return supply;
}

function buildNft(tokenId: number, data: Record<string, any>): LiveCollectionNft | null {
  const image = normalizeLiveUri(data.image || data.image_url || "");
  if (!image) return null;
  return {
    tokenId: String(tokenId),
    name: data.name || `Punk / ${tokenId}`,
    image,
    description: data.description,
    attributes: Array.isArray(data.attributes) ? data.attributes : [],
  };
}

export async function readLiveNft(tokenId: number, forceFresh = false): Promise<LiveCollectionNft | null> {
  const [entry] = await tokenUris([tokenId]);
  if (!entry?.uri) return null;
  try {
    return buildNft(tokenId, await fetchMetadata(entry.uri, forceFresh));
  } catch {
    return null;
  }
}

export async function readLiveNfts(tokenIds: number[], forceFresh = false, onItem?: (item: LiveCollectionNft) => void): Promise<LiveCollectionNft[]> {
  const ids = Array.from(new Set(tokenIds.filter((tokenId) => Number.isInteger(tokenId) && tokenId > 0)));
  if (!ids.length) return [];
  const entries = await tokenUris(ids);
  const resolved = await mapWithConcurrency(entries.filter((entry): entry is TokenUriEntry => Boolean(entry.uri)), 4, async (entry) => {
    try {
      const item = buildNft(entry.tokenId, await fetchMetadata(entry.uri, forceFresh));
      if (item) onItem?.(item);
      return item;
    } catch {
      return null;
    }
  });
  return resolved.filter((item): item is LiveCollectionNft => Boolean(item));
}
