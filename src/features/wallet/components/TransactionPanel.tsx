import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import './TransactionPanel.css';

type Tab = 'send' | 'sign' | 'history';

export function TransactionPanel() {
  const {
    isConnected,
    transactions,
  } = useWallet();

  const [tab, setTab] = useState<Tab>('send');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isConnected) return null;


  const tabs: { id: Tab; label: string }[] = [
    { id: 'history', label: 'Historial' },
  ];

  return (
    <div className="tx-panel">
      {/* Tabs */}
      <div className="tx-panel__tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`tx-panel__tab ${tab === t.id ? 'tx-panel__tab--active' : ''}`}
            onClick={() => { setTab(t.id); setFeedback(null); }}
          >
            {t.label}
            {t.id === 'history' && transactions.length > 0 && (
              <span className="tx-panel__badge">{transactions.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`tx-panel__feedback tx-panel__feedback--${feedback.type}`}>
          {feedback.text}
        </div>
      )}

      {/* History */}
      {tab === 'history' && (
        <div className="tx-panel__history">
          {transactions.length === 0 ? (
            <p className="tx-panel__empty">No hay transacciones todavía.</p>
          ) : (
            transactions.map((tx) => (
              <div key={tx.hash} className="tx-panel__tx">
                <div className="tx-panel__tx-info">
                  <span className="tx-panel__tx-to">{tx.to.slice(0, 10)}…</span>
                  <span className="tx-panel__tx-value">{tx.value} ETH</span>
                </div>
                <div className="tx-panel__tx-meta">
                  <span className={`tx-panel__tx-status tx-panel__tx-status--${tx.status}`}>
                    {tx.status}
                  </span>
                  <a
                    className="tx-panel__tx-hash"
                    href={`https://etherscan.io/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {tx.hash.slice(0, 12)}…
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
