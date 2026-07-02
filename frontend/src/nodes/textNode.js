import { useState, useEffect, useRef } from 'react';
import { Position, useStore as useReactFlowStore } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const TextNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const nodeWidth = useReactFlowStore((s) => s.nodeInternals.get(id)?.width);
  const [currText, setCurrText] = useState(data?.text || '{{input}}');
  const [variables, setVariables] = useState([]);
  const textareaRef = useRef(null);

  useEffect(() => {
    const regex = /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g;
    const matches = [];
    let match;
    while ((match = regex.exec(currText)) !== null) {
      if (!matches.includes(match[1])) {
        matches.push(match[1]);
      }
    }
    setVariables(matches);
    updateNodeField(id, 'text', currText);
  }, [currText, id, updateNodeField]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [currText]);

  const handleTextChange = (e) => {
    setCurrText(e.target.value);
  };

  const lines = currText.split('\n');
  const maxLineLength = Math.max(...lines.map((l) => l.length));
  const dynamicWidth = Math.min(450, Math.max(200, 160 + maxLineLength * 7));

  const variableHandles = variables.map((varName, index) => {
    const topPercent = variables.length === 1
      ? '50%'
      : `${20 + (index * (60 / (variables.length - 1)))}%`;

    return {
      type: 'target',
      position: Position.Left,
      id: `${id}-${varName}`,
      style: { top: topPercent },
      className: 'variable-handle'
    };
  });

  const handles = [
    ...variableHandles,
    { type: 'source', position: Position.Right, id: `${id}-output` }
  ];

  const nodeStyle = {};
  if (!nodeWidth) {
    nodeStyle.width = `${dynamicWidth}px`;
  }

  return (
    <BaseNode id={id} title="Text" handles={handles} style={nodeStyle}>
      <label>
        Text:
        <textarea
          ref={textareaRef}
          value={currText}
          onChange={handleTextChange}
          rows={1}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            resize: 'none',
            overflow: 'hidden',
            minHeight: '40px',
            lineHeight: '1.4'
          }}
        />
      </label>
      {variables.length > 0 && (
        <div style={{ marginTop: '4px' }}>
          <div style={{ fontSize: '9px', fontWeight: '700', color: '#4a5270', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Variables</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {variables.map((v) => (
              <span key={v} style={{ fontSize: '10px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', padding: '2px 7px', borderRadius: '99px', fontFamily: 'monospace' }}>
                {v}
              </span>
            ))}
          </div>
        </div>
      )}
    </BaseNode>
  );
};
