import { useWallet } from '../hooks/useWallet';
import './ConnectButton.css';

export function ConnectButton() {
  const { address, isConnected, connect, disconnect, isConnecting } = useWallet();

  const truncate = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  if (isConnected && address) {
    return (
      <div className="wallet-connect-wrapper">
        <span className="wallet-address-badge">
          <span className="wallet-dot" />
          {truncate(address)}
        </span>
        <button className="wallet-btn wallet-btn--disconnect" onClick={disconnect}>
          Desconectar
        </button>
      </div>
    );
  }

  return (
    <button
      className="wallet-btn wallet-btn--connect"
      onClick={connect}
      disabled={isConnecting}
    >
      {isConnecting ? (
        <>
          <span className="wallet-spinner" />
          Conectando…
        </>
      ) : (
        <>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M17.5 6.25H2.5a.625.625 0 0 0-.625.625v8.75c0 .345.28.625.625.625h15a.625.625 0 0 0 .625-.625v-8.75a.625.625 0 0 0-.625-.625Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M13.125 11.875a.625.625 0 1 0 1.25 0 .625.625 0 0 0-1.25 0ZM2.5 6.25l1.875-2.5h11.25l1.875 2.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Conectar MetaMask
        </>
      )}
    </button>
  );
}
