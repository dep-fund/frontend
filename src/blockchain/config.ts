import { AbstractProvider, BrowserProvider, Contract, JsonRpcProvider, JsonRpcSigner } from "ethers";
import type { WalletClient } from "viem";

// ─── Addresses ───────────────────────────────────────────────────────────────

export const ADDRESSES = {
  MARKETPLACE: import.meta.env.VITE_MARKETPLACE_ADDRESS as string,
  USDC:        import.meta.env.VITE_USDC_ADDRESS        as string,
};

// ─── ABIs ────────────────────────────────────────────────────────────────────

export const ABI = {
  ERC20: [
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function balanceOf(address account) view returns (uint256)",
    "function totalSupply() view returns (uint256)",
  ],

  MARKETPLACE: [
    "function list(address token, uint256 amount, uint256 priceUsdc) returns (uint256)",
    "function buy(uint256 listingId)",
    "function cancel(uint256 listingId)",
    "function listings(uint256) view returns (address seller, address token, uint256 amount, uint256 priceUsdc, bool active)",
    "function listingsCount() view returns (uint256)",
    "event Listed(uint256 indexed listingId, address indexed seller, uint256 amount, uint256 priceUsdc)",
    "event Sold(uint256 indexed listingId, address indexed buyer, uint256 amount, uint256 priceUsdc)",
    "event Cancelled(uint256 indexed listingId)",
  ],

  OFFERING: [
    "function invest(uint256 usdcAmount)",
    "function refund()",
    "function withdraw()",
    "function totalRaised() view returns (uint256)",
    "function SOFT_CAP() view returns (uint256)",
    "function HARD_CAP() view returns (uint256)",
    "function TOKEN_PRICE() view returns (uint256)",
    "function DEADLINE() view returns (uint256)",
    "function contributions(address) view returns (uint256)",
  ],

  DIVIDENDS: [
    "function claim()",
    "function distribute(uint256 usdcAmount)",
    "function pending(address holder) view returns (uint256)",
    "function dividendPerToken() view returns (uint256)",
    "event Claimed(address indexed holder, uint256 amount)",
    "event Distributed(uint256 usdcAmount, uint256 dividendPerToken)",
  ],
};

// ─── Wagmi → ethers ──────────────────────────────────────────────────────────

/**
 * Convierte el walletClient de Wagmi a un JsonRpcSigner de ethers.
 * Necesario porque los contratos usan ethers, pero Wagmi usa viem internamente.
 */
export function walletClientToSigner(walletClient: WalletClient): JsonRpcSigner {
  const { account, chain, transport } = walletClient;
  const provider = new BrowserProvider(transport as any, {
    chainId: chain!.id,
    name:    chain!.name,
  });
  return new JsonRpcSigner(provider, account.address);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Verifica allowance y hace approve si es necesario.
 * Reutilizado internamente por todos los servicios.
 */
export async function ensureAllowance(
  signer:       JsonRpcSigner,
  tokenAddress: string,
  spender:      string,
  amount:       bigint
): Promise<void> {
  const token     = new Contract(tokenAddress, ABI.ERC20, signer);
  const owner     = await signer.getAddress();
  const allowance = await token.allowance(owner, spender) as bigint;

  if (allowance >= amount) return;

  const tx = await token.approve(spender, amount);
  await tx.wait();
}

/**
 * Retorna un provider de solo lectura desde MetaMask.
 * Para consultas que no requieren firma.
 */
export function getReadProvider(): AbstractProvider {
  const rpc = import.meta.env.VITE_RPC_URL ?? "http://127.0.0.1:8545";
  return new JsonRpcProvider(rpc);
}