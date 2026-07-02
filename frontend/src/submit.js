import { useState } from 'react';
import { useStore } from './store';

export const SubmitButton = () => {
  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);
  const clearPlayground = useStore((state) => state.clearPlayground);
  const [modalData, setModalData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/pipelines/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      });
      if (!response.ok) throw new Error(`Server responded with ${response.status}`);
      const data = await response.json();
      setModalData(data);
    } catch (err) {
      setError(err.message || 'Could not reach the backend. Is it running?');
      setModalData(null);
    } finally {
      setLoading(false);
      setIsOpen(true);
    }
  };

  const handleClear = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmClear = () => {
    clearPlayground();
    setIsConfirmOpen(false);
  };

  return (
    <>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button className="btn-clear" onClick={handleClear} disabled={loading}>
          🗑 Clear Playground
        </button>
        <button className="btn-submit" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <span style={{ opacity: 0.7 }}>●</span>
              Analysing…
            </>
          ) : (
            <>
              <span>▶</span>
              Run Pipeline Analysis
            </>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <p className="modal-title">Pipeline Analysis</p>

            {error ? (
              <div className="modal-error">{error}</div>
            ) : modalData ? (
              <>
                <div className="modal-stat-row">
                  <span className="modal-stat-label">Nodes</span>
                  <span className="modal-stat-value">{modalData.num_nodes}</span>
                </div>
                <div className="modal-stat-row">
                  <span className="modal-stat-label">Edges</span>
                  <span className="modal-stat-value">{modalData.num_edges}</span>
                </div>
                <div className="modal-stat-row">
                  <span className="modal-stat-label">Is DAG</span>
                  <span className={`modal-stat-value ${modalData.num_nodes === 0 ? '' : (modalData.is_dag ? 'dag-yes' : 'dag-no')}`}>
                    {modalData.num_nodes === 0 ? '— (Empty)' : (modalData.is_dag ? '✓ Yes — acyclic' : '✗ No — cycle detected')}
                  </span>
                </div>
              </>
            ) : null}

            <button className="modal-close-btn" onClick={() => setIsOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {isConfirmOpen && (
        <div className="modal-overlay" onClick={() => setIsConfirmOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <p className="modal-title">Clear Playground</p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '24px', lineHeight: '1.5' }}>
              Are you sure you want to clear the workflow? This will permanently remove all nodes and connections from the canvas.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="modal-close-btn" 
                onClick={() => setIsConfirmOpen(false)}
                style={{ marginTop: 0, background: 'var(--bg-chip)', borderColor: 'var(--border-primary)' }}
              >
                Cancel
              </button>
              <button 
                className="modal-close-btn" 
                onClick={handleConfirmClear}
                style={{ marginTop: 0, background: '#f43f5e', color: '#fff', borderColor: '#f43f5e' }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
