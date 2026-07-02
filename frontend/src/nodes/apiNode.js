import { useState, useEffect } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const APINode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);

  const initialUrl = data?.apiUrl || 'https://api.example.com';
  const initialMethod = data?.apiMethod || 'GET';

  const [apiUrl, setApiUrl] = useState(initialUrl);
  const [apiMethod, setApiMethod] = useState(initialMethod);

  useEffect(() => {
    updateNodeField(id, 'apiUrl', initialUrl);
    updateNodeField(id, 'apiMethod', initialMethod);
  }, [id, initialUrl, initialMethod, updateNodeField]);

  const handleUrlChange = (e) => {
    const val = e.target.value;
    setApiUrl(val);
    updateNodeField(id, 'apiUrl', val);
  };

  const handleMethodChange = (e) => {
    const val = e.target.value;
    setApiMethod(val);
    updateNodeField(id, 'apiMethod', val);
  };

  const handles = [
    { type: 'target', position: Position.Left, id: `${id}-trigger` },
    { type: 'source', position: Position.Right, id: `${id}-response` }
  ];

  return (
    <BaseNode id={id} title="API Request" handles={handles}>
      <label>
        Endpoint URL:
        <input type="text" value={apiUrl} onChange={handleUrlChange} />
      </label>
      <label>
        Method:
        <select value={apiMethod} onChange={handleMethodChange}>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
      </label>
    </BaseNode>
  );
};
