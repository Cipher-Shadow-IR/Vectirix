import { useState, useEffect } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const TransformNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);

  const initialLang = data?.transformLang || 'JavaScript';
  const initialCode = data?.transformCode || 'return input.trim();';

  const [lang, setLang] = useState(initialLang);
  const [code, setCode] = useState(initialCode);

  useEffect(() => {
    updateNodeField(id, 'transformLang', initialLang);
    updateNodeField(id, 'transformCode', initialCode);
  }, [id, initialLang, initialCode, updateNodeField]);

  const handleLangChange = (e) => {
    const val = e.target.value;
    setLang(val);
    updateNodeField(id, 'transformLang', val);
  };

  const handleCodeChange = (e) => {
    const val = e.target.value;
    setCode(val);
    updateNodeField(id, 'transformCode', val);
  };

  const handles = [
    { type: 'target', position: Position.Left, id: `${id}-input` },
    { type: 'source', position: Position.Right, id: `${id}-output` }
  ];

  return (
    <BaseNode id={id} title="Transform" handles={handles}>
      <label>
        Language:
        <select value={lang} onChange={handleLangChange}>
          <option value="JavaScript">JavaScript</option>
          <option value="Python">Python</option>
        </select>
      </label>
      <label>
        Script:
        <textarea 
          value={code} 
          onChange={handleCodeChange} 
          rows={3} 
          style={{ width: '100%', fontFamily: 'monospace', fontSize: '10px' }} 
        />
      </label>
    </BaseNode>
  );
};
