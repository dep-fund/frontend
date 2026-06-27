import { useState, useCallback, useRef } from "react";
import {
  useConnection,
  useConnect,
  useConnectors,
  useDisconnect,
  useChains,
  useSwitchChain,
  useSignMessage,
  useSendTransaction,
  useBalance,
} from "wagmi";
import { parseEther } from "viem";
import type { WalletTransaction, SendTransactionParams } from "../types";

const WALLETS_ENDPOINT = `${import.meta.env.VITE_API_URL}/api/wallets`;

/**
 * Registra la wallet conectada en el backend.
 * Si responde 409 (ya existe), se ignora: es un caso esperado.
 */
async function registerWallet(address: string): Promise<void> {
  const token = localStorage.getItem("token");

  const res = await fetch(WALLETS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ address }),
  });

  if (res.ok || res.status === 409) return;

  throw new Error(`Error registrando wallet (status ${res.status})`);
}

export function useWallet() {
  const { address, isConnected, chainId } = useConnection();
  const connectors = useConnectors();
  const connect = useConnect();
  const disconnect = useDisconnect();
  const chains = useChains();
  const switchChain = useSwitchChain();
  const signMessage = useSignMessage();
  const sendTx = useSendTransaction();

  const { data: balanceData } = useBalance({ address });

  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);

  // Evita registrar dos veces la misma address en la misma sesión del hook
  const registeredAddressRef = useRef<string | null>(null);

  const ensureWalletRegistered = useCallback(async (addr: string) => {
    if (registeredAddressRef.current === addr) return;
    try {
      await registerWallet(addr);
      registeredAddressRef.current = addr;
    } catch (err) {
      console.error("Error registrando wallet:", err);
    }
  }, []);

  const handleConnect = async () => {
    const connector =
      connectors.find((c) => c.id === "metaMaskSDK") ?? connectors[0];
    if (!connector) throw new Error("No MetaMask connector found");

    const result = await connect.mutateAsync({ connector });

    const connectedAddress = result?.accounts?.[0] ?? address;
    if (connectedAddress) {
      await ensureWalletRegistered(connectedAddress);
    }
  };

  const handleDisconnect = () => {
    registeredAddressRef.current = null;
    disconnect.mutate();
  };

  const handleSwitchChain = (id: number) => {
    switchChain.mutate({ chainId: id });
  };

  const handleSignMessage = async (message: string) => {
    return signMessage.mutateAsync({ message } as any);
  };

  const handleSendTransaction = async ({ to, value }: SendTransactionParams) => {
    const hash = await sendTx.mutateAsync({
      to: to as `0x${string}`,
      value: parseEther(value),
    });

    const tx: WalletTransaction = {
      hash,
      to,
      value,
      status: "pending",
      timestamp: Date.now(),
    };
    setTransactions((prev) => [tx, ...prev]);

    return hash;
  };

  const formattedBalance = balanceData
    ? `${(Number(balanceData.value) / 1e18).toFixed(4)} ${balanceData.symbol}`
    : undefined;

  const currentChain = chains.find((c) => c.id === chainId);

  return {
    address,
    isConnected,
    chainId,
    chains,
    currentChain,
    balance: formattedBalance,
    transactions,

    connect: handleConnect,
    disconnect: handleDisconnect,
    switchChain: handleSwitchChain,
    signMessage: handleSignMessage,
    sendTransaction: handleSendTransaction,

    isConnecting: connect.isPending,
    isSwitching: switchChain.isPending,
    isSigning: signMessage.isPending,
    isSending: sendTx.isPending,

    lastSignature: signMessage.data,
    lastTxHash: sendTx.data,
  };
}