import { useState } from 'react';
import { useStore } from './store';
import { analyzePipeline } from './api';
import { notifySuccess } from './components/Notification';

export const SubmitButton = ({ onAnalyze }) => {
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
    if (onAnalyze) {
      onAnalyze();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await analyzePipeline(nodes, edges);
      setModalData(data);
      setIsOpen(true);
    } catch (err) {
      setError(err.message || 'Could not reach the API.');
      setModalData(null);
      setIsOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmClear = () => {
    clearPlayground();
    setIsConfirmOpen(false);
    notifySuccess('Playground cleared');
  };

  return (
    <>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button className="btn-clear" onClick={handleClear} disabled={loading}>
          Clear
        </button>
        <button className="btn-submit" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <span className="spinner" />
              Analyzing
            </>
          ) : (
            <>
              <span>▶</span>
              Analyze Pipeline
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
                <div className="modal-section">
                  <p className="modal-section-title">Summary</p>
                  <div className="modal-stat-row">
                    <span className="modal-stat-label">Nodes</span>
                    <span className="modal-stat-value">{modalData.summary.num_nodes}</span>
                  </div>
                  <div className="modal-stat-row">
                    <span className="modal-stat-label">Edges</span>
                    <span className="modal-stat-value">{modalData.summary.num_edges}</span>
                  </div>
                  <div className="modal-stat-row">
                    <span className="modal-stat-label">Is DAG</span>
                    <span className={`modal-stat-value ${modalData.summary.num_nodes === 0 ? '' : (modalData.summary.is_dag ? 'dag-yes' : 'dag-no')}`}>
                      {modalData.summary.num_nodes === 0 ? '\u2014 (Empty)' : (modalData.summary.is_dag ? '\u2713 Yes' : '\u2717 No')}
                    </span>
                  </div>
                </div>

                <div className="modal-section">
                  <p className="modal-section-title">Graph</p>
                  <div className="modal-stat-row">
                    <span className="modal-stat-label">Entry Nodes</span>
                    <span className="modal-stat-value">{modalData.graph.entry_nodes.length > 0 ? modalData.graph.entry_nodes.join(', ') : '\u2014'}</span>
                  </div>
                  <div className="modal-stat-row">
                    <span className="modal-stat-label">Exit Nodes</span>
                    <span className="modal-stat-value">{modalData.graph.exit_nodes.length > 0 ? modalData.graph.exit_nodes.join(', ') : '\u2014'}</span>
                  </div>
                  <div className="modal-stat-row">
                    <span className="modal-stat-label">Max Depth</span>
                    <span className="modal-stat-value">{modalData.graph.max_depth}</span>
                  </div>
                  {modalData.graph.disconnected_nodes.length > 0 && (
                    <div className="modal-stat-row">
                      <span className="modal-stat-label">Disconnected</span>
                      <span className="modal-stat-value dag-no">{modalData.graph.disconnected_nodes.join(', ')}</span>
                    </div>
                  )}
                  {modalData.graph.orphan_nodes && modalData.graph.orphan_nodes.length > 0 && (
                    <div className="modal-stat-row">
                      <span className="modal-stat-label">Orphan Nodes</span>
                      <span className="modal-stat-value dag-no">{modalData.graph.orphan_nodes.join(', ')}</span>
                    </div>
                  )}
                </div>

                {(modalData.validation.warnings.length > 0 || modalData.validation.errors.length > 0) && (
                  <div className="modal-section">
                    <p className="modal-section-title">Validation</p>
                    {modalData.validation.errors.map((err, i) => (
                      <div key={i} className="modal-error" style={{ marginBottom: '4px', fontSize: '11px' }}>{err}</div>
                    ))}
                    {modalData.validation.warnings.map((warn, i) => (
                      <div key={i} className="modal-warning" style={{ marginBottom: '4px', fontSize: '11px' }}>{warn}</div>
                    ))}
                  </div>
                )}
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
              Are you sure you want to clear the workflow?
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
