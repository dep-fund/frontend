import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, WagmiProvider, createConfig, useReconnect } from 'wagmi';
import { mainnet, sepolia, lineaSepolia } from 'wagmi/chains';
import { defineChain } from 'viem';
import { metaMask } from 'wagmi/connectors';

// ── Anvil local ───────────────────────────────────────────────────────────────
const anvil = defineChain({
  id:   31337,
  name: 'Anvil Local',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
  },
});

const INFURA_KEY = import.meta.env.VITE_INFURA_API_KEY ?? '';

export const wagmiConfig = createConfig({
  chains: [anvil, mainnet, sepolia, lineaSepolia],
  ssr: false,
  connectors: [
    metaMask({
      dapp: {
        name: 'DepFund',
        url: window.location.origin,
      },
    }),
  ],
  transports: {
    [anvil.id]:       http('http://127.0.0.1:8545'),
    [mainnet.id]:     http(INFURA_KEY ? `https://mainnet.infura.io/v3/${INFURA_KEY}` : 'https://cloudflare-eth.com'),
    [sepolia.id]:     http(INFURA_KEY ? `https://sepolia.infura.io/v3/${INFURA_KEY}` : undefined),
    [lineaSepolia.id]:http(INFURA_KEY ? `https://linea-sepolia.infura.io/v3/${INFURA_KEY}` : undefined),
  },
});

const queryClient = new QueryClient();

function AutoReconnect({ children }: { children: React.ReactNode }) {
  const { reconnect } = useReconnect();
  useEffect(() => { reconnect(); }, []);
  return <>{children}</>;
}

interface WalletProviderProps {
  children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AutoReconnect>
          {children}
        </AutoReconnect>
      </QueryClientProvider>
    </WagmiProvider>
  );
}