import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, WagmiProvider, createConfig } from 'wagmi';
import { mainnet, sepolia, lineaSepolia } from 'wagmi/chains';
import { metaMask } from 'wagmi/connectors';

const INFURA_KEY = import.meta.env.VITE_INFURA_API_KEY ?? '';

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia, lineaSepolia],
  connectors: [
    metaMask({
      dapp: {
        name: 'DepFund',
        url: window.location.origin,
      },
    }),
  ],
  transports: {
    [mainnet.id]: http(
      INFURA_KEY
        ? `https://mainnet.infura.io/v3/${INFURA_KEY}`
        : 'https://cloudflare-eth.com'
    ),
    [sepolia.id]: http(
      INFURA_KEY
        ? `https://sepolia.infura.io/v3/${INFURA_KEY}`
        : undefined
    ),
    [lineaSepolia.id]: http(
      INFURA_KEY
        ? `https://linea-sepolia.infura.io/v3/${INFURA_KEY}`
        : undefined
    ),
  },
});

const queryClient = new QueryClient();

interface WalletProviderProps {
  children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
