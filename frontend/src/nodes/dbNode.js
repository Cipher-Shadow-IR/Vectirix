import { useState, useEffect } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const DatabaseNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);

  const initialTable = data?.dbTable || 'users';
  const initialOperation = data?.dbOperation || 'SELECT';

  const [dbTable, setDbTable] = useState(initialTable);
  const [dbOperation, setDbOperation] = useState(initialOperation);

  useEffect(() => {
    updateNodeField(id, 'dbTable', initialTable);
    updateNodeField(id, 'dbOperation', initialOperation);
  }, [id, initialTable, initialOperation, updateNodeField]);

  const handleTableChange = (e) => {
    const val = e.target.value;
    setDbTable(val);
    updateNodeField(id, 'dbTable', val);
  };

  const handleOperationChange = (e) => {
    const val = e.target.value;
    setDbOperation(val);
    updateNodeField(id, 'dbOperation', val);
  };

  const handles = [
    { type: 'target', position: Position.Left, id: `${id}-params` },
    { type: 'source', position: Position.Right, id: `${id}-result` }
  ];

  return (
    <BaseNode id={id} title="Database" handles={handles}>
      <label>
        Table:
        <input type="text" value={dbTable} onChange={handleTableChange} />
      </label>
      <label>
        Operation:
        <select value={dbOperation} onChange={handleOperationChange}>
          <option value="SELECT">SELECT</option>
          <option value="INSERT">INSERT</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
        </select>
      </label>
    </BaseNode>
  );
};
