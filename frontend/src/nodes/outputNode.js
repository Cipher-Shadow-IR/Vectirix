import { useState, useEffect } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const OutputNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);

  const initialName = data?.outputName || id.replace('customOutput-', 'output_');
  const initialType = data?.outputType || 'Text';

  const [currName, setCurrName] = useState(initialName);
  const [outputType, setOutputType] = useState(initialType);

  useEffect(() => {
    updateNodeField(id, 'outputName', initialName);
    updateNodeField(id, 'outputType', initialType);
  }, [id, initialName, initialType, updateNodeField]);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setCurrName(val);
    updateNodeField(id, 'outputName', val);
  };

  const handleTypeChange = (e) => {
    const val = e.target.value;
    setOutputType(val);
    updateNodeField(id, 'outputType', val);
  };

  const handles = [
    { type: 'target', position: Position.Left, id: `${id}-value` }
  ];

  return (
    <BaseNode id={id} title="Output" handles={handles}>
      <label>
        Name:
        <input 
          type="text" 
          value={currName} 
          onChange={handleNameChange} 
        />
      </label>
      <label>
        Type:
        <select value={outputType} onChange={handleTypeChange}>
          <option value="Text">Text</option>
          <option value="File">Image</option>
        </select>
      </label>
    </BaseNode>
  );
};
