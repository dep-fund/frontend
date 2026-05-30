import { useWalletClient, useConnection } from "wagmi";
import { walletClientToSigner } from "./config";
import type { JsonRpcSigner } from "ethers";

export function useBlockchain() {
  const { data: walletClient } = useWalletClient();
  const { isConnected } = useConnection();

  const getSigner = (): JsonRpcSigner => {
    if (!walletClient) throw new Error("No hay wallet conectada");
    return walletClientToSigner(walletClient);
  };

  return {
    getSigner,
    isReady: !!walletClient && isConnected,
  };
}