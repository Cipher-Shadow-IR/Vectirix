import { useMemo } from 'react';
import { useStore } from '../store';

const SEVERITY_COLORS = {
  error: '#f43f5e',
  warning: '#f59e0b',
  suggestion: '#6366f1',
  info: '#06b6d4',
};

export function ValidationPanel({ analysisResult, onClose }) {
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);

  const issues = useMemo(() => {
    const result = [];

    if (!analysisResult) {
      result.push({ severity: 'info', text: 'Run pipeline analysis to see validation results.' });
      return result;
    }

    const { summary, graph, validation } = analysisResult;

    if (!summary || graph === undefined) {
      result.push({ severity: 'error', text: 'Invalid analysis response from server.' });
      return result;
    }

    if (validation?.errors?.length > 0) {
      validation.errors.forEach((e) => result.push({ severity: 'error', text: e }));
    }

    if (validation?.invalid_connections?.length > 0) {
      validation.invalid_connections.forEach((ic) =>
        result.push({ severity: 'error', text: `Invalid connection: ${ic.source} → ${ic.target} (${ic.reason})` })
      );
    }

    if (summary.is_dag === false && summary.num_nodes > 0) {
      result.push({ severity: 'error', text: 'Graph contains cycles — not a valid DAG.' });
    }

    if (validation?.has_cycle) {
      result.push({ severity: 'error', text: 'Cycle detected in pipeline.' });
    }

    if (validation?.duplicate_edges?.length > 0) {
      validation.duplicate_edges.forEach((de) =>
        result.push({ severity: 'warning', text: `Duplicate edge: ${de.source} → ${de.target}` })
      );
    }

    if (graph.disconnected_nodes?.length > 0) {
      result.push({ severity: 'warning', text: `${graph.disconnected_nodes.length} disconnected node(s): ${graph.disconnected_nodes.join(', ')}` });
    }

    if (graph.orphan_nodes?.length > 0) {
      result.push({ severity: 'warning', text: `${graph.orphan_nodes.length} orphan node(s): ${graph.orphan_nodes.join(', ')}` });
    }

    if (summary.num_nodes > 0 && summary.num_edges === 0) {
      result.push({ severity: 'warning', text: 'Pipeline has nodes but no connections.' });
    }

    if (graph.entry_nodes?.length === 0 && summary.num_nodes > 0) {
      result.push({ severity: 'warning', text: 'No entry nodes found — graph may be cyclical.' });
    }

    if (summary.complexity_score !== undefined) {
      result.push({ severity: 'info', text: `Complexity score: ${summary.complexity_score}/100` });
    }

    if (graph.max_depth > 0) {
      result.push({ severity: 'info', text: `Max graph depth: ${graph.max_depth} levels` });
    }

    if (graph.longest_path?.length > 0) {
      result.push({ severity: 'info', text: `Longest path: ${graph.longest_path.join(' → ')}` });
    }

    if (summary.num_nodes > 0) {
      result.push({ severity: 'info', text: `Graph: ${summary.num_nodes} nodes, ${summary.num_edges} edges, ${graph.entry_nodes.length} entry, ${graph.exit_nodes.length} exit` });
    }

    return result;
  }, [analysisResult]);

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;

  return (
    <div className="validation-panel">
      <div className="validation-panel-header">
        <span className="validation-panel-title">Validation</span>
        <button className="validation-panel-close" onClick={onClose}>×</button>
      </div>

      <div className="validation-panel-stats">
        <div className="validation-stat">
          <span className="validation-stat-value">{nodes.length}</span>
          <span className="validation-stat-label">Nodes</span>
        </div>
        <div className="validation-stat">
          <span className="validation-stat-value">{edges.length}</span>
          <span className="validation-stat-label">Edges</span>
        </div>
        <div className="validation-stat">
          <span className="validation-stat-value validation-stat-errors">{errorCount}</span>
          <span className="validation-stat-label">Errors</span>
        </div>
        <div className="validation-stat">
          <span className="validation-stat-value validation-stat-warnings">{warningCount}</span>
          <span className="validation-stat-label">Warnings</span>
        </div>
      </div>

      <div className="validation-panel-issues">
        {issues.length === 0 && (
          <div className="validation-empty">No issues found.</div>
        )}
        {issues.map((issue, i) => (
          <div key={i} className={`validation-issue validation-issue-${issue.severity}`}>
            <span
              className="validation-issue-dot"
              style={{ background: SEVERITY_COLORS[issue.severity] }}
            />
            <span className="validation-issue-text">{issue.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
