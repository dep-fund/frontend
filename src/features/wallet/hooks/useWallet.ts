import { useState } from 'react';
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
} from 'wagmi';
import { parseEther } from 'viem';
import type { WalletTransaction, SendTransactionParams } from '../types';

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

  const handleConnect = async () => {
    const connector =
      connectors.find((c) => c.id === 'metaMaskSDK') ?? connectors[0];
    if (!connector) throw new Error('No MetaMask connector found');
    await connect.mutateAsync({ connector });
  };

  const handleDisconnect = () => {
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
      status: 'pending',
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
