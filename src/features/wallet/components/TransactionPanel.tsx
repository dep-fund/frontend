import { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import './TransactionPanel.css';


type Tab = 'history';

export function TransactionPanel() {
  const {
    isConnected,
    backendTransactions,
    isLoadingHistory,
    fetchHistory,
  } = useWallet();

  const [tab, setTab] = useState<Tab>('history');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (!isConnected) return null;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'history', label: 'Historial' },
  ];

  return (
    <div className="tx-panel">
      <div className="tx-panel__tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`tx-panel__tab ${
              tab === t.id ? 'tx-panel__tab--active' : ''
            }`}
            onClick={() => {
              setTab(t.id);
              setFeedback(null);
            }}
          >
            {t.label}
            {t.id === 'history' && backendTransactions.length > 0 && (
              <span className="tx-panel__badge">
                {backendTransactions.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {feedback && (
        <div
          className={`tx-panel__feedback tx-panel__feedback--${feedback.type}`}
        >
          {feedback.text}
        </div>
      )}

      {tab === 'history' && (
        <div className="tx-panel__history">
          {isLoadingHistory ? (
            <p className="tx-panel__empty">Cargando historial...</p>
          ) : backendTransactions.length === 0 ? (
            <p className="tx-panel__empty">No hay transacciones todavía.</p>
          ) : (
            backendTransactions.map((tx) => (
              <div key={tx.id} className="tx-panel__tx">
                <div className="tx-panel__tx-info">
                  <span className="tx-panel__tx-to">{tx.type}</span>
                  <span className="tx-panel__tx-value">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="tx-panel__tx-meta">
                  {tx.tx_hash ? (
                    <a
                      className="tx-panel__tx-hash"
                      href={`https://sepolia.basescan.org/tx/${tx.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver transacción
                    </a>
                  ) : (
                    <span className="tx-panel__tx-hash">
                      Sin hash disponible
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}