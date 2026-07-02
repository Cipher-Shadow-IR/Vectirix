import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';

export const LLMNode = ({ id, data }) => {
  const handles = [
    { type: 'target', position: Position.Left, id: `${id}-system`, style: { top: '33%' } },
    { type: 'target', position: Position.Left, id: `${id}-prompt`, style: { top: '66%' } },
    { type: 'source', position: Position.Right, id: `${id}-response` }
  ];

  return (
    <BaseNode id={id} title="LLM" handles={handles}>
      <div style={{ padding: '4px 0', fontSize: '11px', color: '#4a5270', lineHeight: '1.5' }}>
        Connect <strong style={{color:'#6366f1'}}>system</strong> and <strong style={{color:'#6366f1'}}>prompt</strong> inputs. Response exits on the right.
      </div>
    </BaseNode>
  );
};
