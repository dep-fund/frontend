import { Contract, JsonRpcSigner } from "ethers";
import { ABI, ADDRESSES, ensureAllowance, getReadProvider } from "./config";

/**
 * Reclama los dividendos acumulados del caller.
 */
export async function claimDividends(
  signer:           JsonRpcSigner,
  dividendsAddress: string
): Promise<string> {
  const dividends = new Contract(dividendsAddress, ABI.DIVIDENDS, signer);

  const tx      = await dividends.claim();
  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * El issuer distribuye USDC como dividendos.
 * Hace approve de USDC automáticamente si es necesario.
 */
export async function distributeDividends(
  signer:           JsonRpcSigner,
  dividendsAddress: string,
  usdcAmount:       bigint
): Promise<string> {
  const dividends = new Contract(dividendsAddress, ABI.DIVIDENDS, signer);

  await ensureAllowance(signer, ADDRESSES.USDC, dividendsAddress, usdcAmount);

  const tx      = await dividends.distribute(usdcAmount);
  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Consulta los dividendos pendientes sin wallet conectada.
 */
export async function getPendingDividends(
  dividendsAddress: string,
  holderAddress:    string
): Promise<bigint> {
  const provider  = getReadProvider();
  const dividends = new Contract(dividendsAddress, ABI.DIVIDENDS, provider);
  return await dividends.pending(holderAddress) as bigint;
}
