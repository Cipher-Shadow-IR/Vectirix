import { Handle, NodeResizer, useStore as useReactFlowStore } from 'reactflow';
import { useStore } from '../store';
import './BaseNode.css';

const NODE_ICONS = {
  Input: '\u2192',
  LLM: '\u25C6',
  Output: '\u2190',
  Text: '\u00B6',
  'API Request': '\u26A1',
  Database: '\u2B21',
  Condition: '\u2327',
  Transform: '\u27F3',
  Notification: '\u25CB',
};

const NODE_DESCRIPTIONS = {
  Input: 'Provides data to the pipeline. Choose Text or File input.',
  LLM: 'Calls a language model with system prompt and user prompt inputs.',
  Output: 'Receives data from the pipeline and defines its output type.',
  Text: 'Static text block with variable interpolation ({{var}}).',
  'API Request': 'Makes HTTP requests to external APIs. Supports GET, POST, PUT, DELETE.',
  Database: 'Performs database operations: SELECT, INSERT, UPDATE, DELETE.',
  Condition: 'Branching logic. Routes to True/False paths based on an expression.',
  Transform: 'Transforms data using JavaScript or Python scripts.',
  Notification: 'Sends alerts via Email, Slack, or SMS channels.',
};

export const BaseNode = ({ id, title, handles = [], children, style = {}, icon, description }) => {
  const deleteNode = useStore((state) => state.deleteNode);
  const selected = useReactFlowStore((s) => s.nodeInternals.get(id)?.selected);
  const nodeIcon = icon || NODE_ICONS[title] || '\u25CF';
  const nodeDesc = description || NODE_DESCRIPTIONS[title] || '';

  return (
    <div className="base-node" style={style} title={nodeDesc}>
      <NodeResizer
        minWidth={200}
        minHeight={80}
        isVisible={selected}
        lineClassName="react-flow__node-resizer__line"
        handleClassName="react-flow__node-resizer__handle"
      />
      <div className="base-node-header">
        <span className="base-node-icon">{nodeIcon}</span>
        <span className="base-node-title">{title}</span>
        <button className="base-node-delete-btn" onClick={() => deleteNode(id)} title="Delete Node">
          &times;
        </button>
      </div>
      <div className="base-node-body">
        {children}
      </div>
      {nodeDesc && <div className="base-node-tooltip">{nodeDesc}</div>}
      {handles.map((h, i) => (
        <Handle
          key={i}
          type={h.type}
          position={h.position}
          id={h.id}
          style={h.style}
          className={`base-node-handle handle-${h.type} ${h.className || ''}`}
        />
      ))}
    </div>
  );
};
