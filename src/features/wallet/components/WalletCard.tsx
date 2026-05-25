import { useWallet } from '../hooks/useWallet';
import './WalletCard.css';

export function WalletCard() {
  const {
    address,
    isConnected,
    balance,
    currentChain,
    chains,
    switchChain,
    isSwitching,
  } = useWallet();

  if (!isConnected || !address) {
    return (
      <div className="wallet-card wallet-card--empty">
        <div className="wallet-card__icon">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="12" fill="#1a1f2e" />
            <path
              d="M30 16H10a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h20a1 1 0 0 0 1-1V17a1 1 0 0 0-1-1Z"
              stroke="#4b5563"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M22.5 22.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0ZM10 16l2.5-4h15l2.5 4"
              stroke="#4b5563"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="wallet-card__empty-text">
          Conecta tu wallet para ver tu saldo y realizar transacciones
        </p>
      </div>
    );
  }

  const truncate = (addr: string) =>
    `${addr.slice(0, 8)}...${addr.slice(-6)}`;

  return (
    <div className="wallet-card">
      {/* Header */}
      <div className="wallet-card__header">
        <div className="wallet-card__label">Mi Wallet</div>
        <div className="wallet-card__chain-badge">
          <span className="wallet-dot" />
          {currentChain?.name ?? 'Desconocida'}
        </div>
      </div>

      {/* Balance */}
      <div className="wallet-card__balance">
        <span className="wallet-card__balance-amount">{balance ?? '—'}</span>
        <span className="wallet-card__balance-label">Balance</span>
      </div>

      {/* Address */}
      <div className="wallet-card__address">
        <span className="wallet-card__address-label">Dirección</span>
        <span className="wallet-card__address-value">{truncate(address)}</span>
        <button
          className="wallet-card__copy-btn"
          title="Copiar dirección"
          onClick={() => navigator.clipboard.writeText(address)}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M2 10V2h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Chain switcher */}
      <div className="wallet-card__chains">
        <span className="wallet-card__chains-label">Red</span>
        <div className="wallet-card__chain-list">
          {chains.map((chain) => (
            <button
              key={chain.id}
              className={`wallet-card__chain-btn ${
                chain.id === currentChain?.id ? 'wallet-card__chain-btn--active' : ''
              }`}
              disabled={chain.id === currentChain?.id || isSwitching}
              onClick={() => switchChain(chain.id)}
            >
              {chain.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
