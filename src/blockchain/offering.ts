import { Contract, JsonRpcSigner } from "ethers";
import { ABI, ADDRESSES, ensureAllowance, getReadProvider } from "./config";

/**
 * Invierte USDC en un Offering.
 * Hace approve de USDC automáticamente si es necesario.
 */
export async function invest(
  signer:          JsonRpcSigner,
  offeringAddress: string,
  usdcAmount:      bigint
): Promise<string> {
  const offering = new Contract(offeringAddress, ABI.OFFERING, signer);

  await ensureAllowance(signer, ADDRESSES.USDC, offeringAddress, usdcAmount);

  const tx      = await offering.invest(usdcAmount);
  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Solicita refund si el Offering no alcanzó el soft cap.
 */
export async function refund(
  signer:          JsonRpcSigner,
  offeringAddress: string
): Promise<string> {
  const offering = new Contract(offeringAddress, ABI.OFFERING, signer);

  const tx      = await offering.refund();
  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * El issuer retira los fondos una vez superado el soft cap.
 */
export async function withdraw(
  signer:          JsonRpcSigner,
  offeringAddress: string
): Promise<string> {
  const offering = new Contract(offeringAddress, ABI.OFFERING, signer);

  const tx      = await offering.withdraw();
  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Consulta el estado del Offering sin wallet conectada.
 */
export async function getOfferingState(offeringAddress: string) {
  const provider = getReadProvider();
  const offering = new Contract(offeringAddress, ABI.OFFERING, provider);

  const [totalRaised, softCap, hardCap, tokenPrice, deadline] = await Promise.all([
    offering.totalRaised() as Promise<bigint>,
    offering.SOFT_CAP()    as Promise<bigint>,
    offering.HARD_CAP()    as Promise<bigint>,
    offering.TOKEN_PRICE() as Promise<bigint>,
    offering.DEADLINE()    as Promise<bigint>,
  ]);

  return { totalRaised, softCap, hardCap, tokenPrice, deadline };
}

/**
 * Consulta cuánto invirtió una wallet en el Offering.
 */
export async function getContribution(
  offeringAddress: string,
  walletAddress:   string
): Promise<bigint> {
  const provider = getReadProvider();
  const offering = new Contract(offeringAddress, ABI.OFFERING, provider);
  return await offering.contributions(walletAddress) as bigint;
}
