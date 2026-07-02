import { Handle, NodeResizer, useStore as useReactFlowStore } from 'reactflow';
import { useStore } from '../store';
import './BaseNode.css';

export const BaseNode = ({ id, title, handles = [], children, style = {} }) => {
  const deleteNode = useStore((state) => state.deleteNode);
  const selected = useReactFlowStore((s) => s.nodeInternals.get(id)?.selected);

  return (
    <div className="base-node" style={style}>
      <NodeResizer
        minWidth={200}
        minHeight={80}
        isVisible={selected}
        lineClassName="react-flow__node-resizer__line"
        handleClassName="react-flow__node-resizer__handle"
      />
      <div className="base-node-header">
        <span className="base-node-title">{title}</span>
        <button className="base-node-delete-btn" onClick={() => deleteNode(id)} title="Delete Node">
          &times;
        </button>
      </div>
      <div className="base-node-body">
        {children}
      </div>
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
