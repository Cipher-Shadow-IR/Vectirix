import { useState, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import ReactFlow, { Controls, Background, MiniMap, ReactFlowProvider } from 'reactflow';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { InputNode } from './nodes/inputNode';
import { LLMNode } from './nodes/llmNode';
import { OutputNode } from './nodes/outputNode';
import { TextNode } from './nodes/textNode';
import { APINode } from './nodes/apiNode';
import { DatabaseNode } from './nodes/dbNode';
import { ConditionNode } from './nodes/conditionNode';
import { TransformNode } from './nodes/transformNode';
import { NotificationNode } from './nodes/notificationNode';
import { DraggableEdge } from './nodes/DraggableEdge';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

import 'reactflow/dist/style.css';

const gridSize = 20;
const proOptions = { hideAttribution: true };
const nodeTypes = {
  customInput: InputNode,
  llm: LLMNode,
  customOutput: OutputNode,
  text: TextNode,
  customAPI: APINode,
  customDatabase: DatabaseNode,
  customCondition: ConditionNode,
  customTransform: TransformNode,
  customNotification: NotificationNode,
};

const edgeTypes = {
  draggable: DraggableEdge,
};

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

const CanvasInner = forwardRef((props, ref) => {
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const {
      nodes,
      edges,
      getNodeID,
      addNode,
      onNodesChange,
      onEdgesChange,
      onConnect
    } = useStore(selector, shallow);

    useKeyboardShortcuts();

    useImperativeHandle(ref, () => ({
      focusNode: (nodeId) => {
        if (!reactFlowInstance) return;
        const node = nodes.find((n) => n.id === nodeId);
        if (!node) return;
        reactFlowInstance.setCenter(node.position.x + 100, node.position.y + 50, { zoom: 1.5, duration: 400 });
        const updatedNodes = nodes.map((n) => ({
          ...n,
          selected: n.id === nodeId,
          data: { ...n.data },
        }));
        useStore.getState().onNodesChange(
          updatedNodes.filter((n) => n.selected).map((n) => ({
            type: 'select',
            id: n.id,
            selected: true,
          }))
        );
      },
    }), [reactFlowInstance, nodes]);

    const getInitNodeData = (nodeID, type) => {
      return { id: nodeID, nodeType: type };
    }

    const onDrop = useCallback(
        (event) => {
          event.preventDefault();
          const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
          if (event?.dataTransfer?.getData('application/reactflow')) {
            const appData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
            const type = appData?.nodeType;
            if (typeof type === 'undefined' || !type) return;

            const position = reactFlowInstance.project({
              x: event.clientX - reactFlowBounds.left,
              y: event.clientY - reactFlowBounds.top,
            });

            const nodeID = getNodeID(type);
            const newNode = {
              id: nodeID,
              type,
              position,
              data: getInitNodeData(nodeID, type),
            };
            addNode(newNode);
          }
        },
        [reactFlowInstance, getNodeID, addNode]
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    return (
        <div ref={reactFlowWrapper} style={{width: '100%', height: '100%', position: 'absolute', top: 0, left: 0}}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onInit={setReactFlowInstance}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                defaultEdgeOptions={{ type: 'draggable' }}
                proOptions={proOptions}
                snapToGrid
                snapGrid={[gridSize, gridSize]}
                connectionLineType='smoothstep'
                fitView
                fitViewOptions={{ padding: 0.2 }}
                style={{ background: '#0f1117' }}
            >
                <Background color="#1e2130" gap={gridSize} variant="dots" />
                <Controls showInteractive={false} />
                <MiniMap nodeColor="#252840" maskColor="rgba(15,17,23,0.75)" pannable zoomable />
            </ReactFlow>
        </div>
    )
});

export const PipelineUI = forwardRef((props, ref) => (
  <ReactFlowProvider>
    <CanvasInner ref={ref} />
  </ReactFlowProvider>
));
