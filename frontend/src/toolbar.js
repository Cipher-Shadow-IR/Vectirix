// toolbar.js

import { DraggableNode } from './draggableNode';

export const PipelineToolbar = () => {
  return (
    <div className="toolbar-container">
      <div className="toolbar-label">Nodes</div>
      <div className="toolbar-nodes">
        <DraggableNode type='customInput' />
        <DraggableNode type='llm' />
        <DraggableNode type='customOutput' />
        <DraggableNode type='text' />
        <DraggableNode type='customAPI' />
        <DraggableNode type='customDatabase' />
        <DraggableNode type='customCondition' />
        <DraggableNode type='customTransform' />
        <DraggableNode type='customNotification' />
      </div>
    </div>
  );
};
