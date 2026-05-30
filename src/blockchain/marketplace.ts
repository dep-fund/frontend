import { Contract, JsonRpcSigner } from "ethers";
import { ABI, ADDRESSES, ensureAllowance, getReadProvider } from "./config";

/**
 * Lista tokens DPF en el Marketplace.
 * Hace approve del token automáticamente si es necesario.
 * Retorna el listingId para registrarlo en el backend.
 */
export async function listToken(
  signer:       JsonRpcSigner,
  tokenAddress: string,
  amount:       bigint,
  priceUsdc:    bigint
): Promise<number> {
  const marketplace = new Contract(ADDRESSES.MARKETPLACE, ABI.MARKETPLACE, signer);

  await ensureAllowance(signer, tokenAddress, ADDRESSES.MARKETPLACE, amount);

  const tx      = await marketplace.list(tokenAddress, amount, priceUsdc);
  const receipt = await tx.wait();

  const event = receipt.logs
    .map((log: any) => { try { return marketplace.interface.parseLog(log); } catch { return null; } })
    .find((e: any) => e?.name === "Listed");

  return Number(event?.args.listingId ?? 0);
}

/**
 * Compra una oferta activa.
 * Hace approve de USDC automáticamente si es necesario.
 */
export async function buyListing(
  signer:    JsonRpcSigner,
  listingId: number,
  priceUsdc: bigint
): Promise<string> {
  const marketplace = new Contract(ADDRESSES.MARKETPLACE, ABI.MARKETPLACE, signer);

  await ensureAllowance(signer, ADDRESSES.USDC, ADDRESSES.MARKETPLACE, priceUsdc);

  const tx      = await marketplace.buy(listingId);
  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Cancela una oferta activa del caller.
 */
export async function cancelListing(
  signer:    JsonRpcSigner,
  listingId: number
): Promise<string> {
  const marketplace = new Contract(ADDRESSES.MARKETPLACE, ABI.MARKETPLACE, signer);

  const tx      = await marketplace.cancel(listingId);
  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Consulta una oferta sin wallet conectada.
 */
export async function getListing(listingId: number) {
  const provider    = getReadProvider();
  const marketplace = new Contract(ADDRESSES.MARKETPLACE, ABI.MARKETPLACE, provider);
  const result      = await marketplace.listings(listingId);

  return {
    seller:    result[0] as string,
    token:     result[1] as string,
    amount:    result[2] as bigint,
    priceUsdc: result[3] as bigint,
    active:    result[4] as boolean,
  };
}
