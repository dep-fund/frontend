import { ConnectButton } from '../components/ConnectButton';
import { WalletCard } from '../components/WalletCard';
import { TransactionPanel } from '../components/TransactionPanel';
import { useWallet } from '../hooks/useWallet';
import './WalletPage.css';

export function WalletPage() {
  const { isConnected } = useWallet();

  return (
    <div className="wallet-page">
      {/* Header */}
      <div className="wallet-page__header">
        <div>
          <h1 className="wallet-page__title">Wallet</h1>
          <p className="wallet-page__subtitle">
            Conecta MetaMask para gestionar tus activos e inversiones en blockchain.
          </p>
        </div>
        <ConnectButton />
      </div>

      {/* Content */}
      {isConnected ? (
        <div className="wallet-page__grid">
          <WalletCard />
          <TransactionPanel />
        </div>
      ) : (
        <div className="wallet-page__empty">
          <WalletCard />
        </div>
      )}
    </div>
  );
}
