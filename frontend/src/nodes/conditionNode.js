import { useState, useEffect } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const ConditionNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);

  const initialExpression = data?.conditionExpression || 'value > 10';

  const [expression, setExpression] = useState(initialExpression);

  useEffect(() => {
    updateNodeField(id, 'conditionExpression', initialExpression);
  }, [id, initialExpression, updateNodeField]);

  const handleExpressionChange = (e) => {
    const val = e.target.value;
    setExpression(val);
    updateNodeField(id, 'conditionExpression', val);
  };

  const handles = [
    { type: 'target', position: Position.Left, id: `${id}-input` },
    { type: 'source', position: Position.Right, id: `${id}-true`, style: { top: '30%' } },
    { type: 'source', position: Position.Right, id: `${id}-false`, style: { top: '70%' } }
  ];

  return (
    <BaseNode id={id} title="Condition" handles={handles}>
      <label>
        If Expression:
        <input type="text" value={expression} onChange={handleExpressionChange} placeholder="e.g. x > 5" />
      </label>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>
        <span>T (Top)</span>
        <span>F (Bottom)</span>
      </div>
    </BaseNode>
  );
};
