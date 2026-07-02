import { useState } from 'react';
import { getSmoothStepPath, useReactFlow } from 'reactflow';
import { useStore } from '../store';

export const DraggableEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
}) => {
  const [controlPoint, setControlPoint] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const deleteEdge = useStore((state) => state.deleteEdge);
  const reactFlowInstance = useReactFlow();

  const centerX = (sourceX + targetX) / 2;
  const centerY = (sourceY + targetY) / 2;

  const px = controlPoint ? controlPoint.x : centerX;
  const py = controlPoint ? controlPoint.y : centerY;

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 12,
    centerX: px,
    centerY: py,
  });

  const handleMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const pane = document.querySelector('.react-flow__pane');
    if (!pane) return;

    const rect = pane.getBoundingClientRect();
    const { x: vpX, y: vpY, zoom } = reactFlowInstance.getViewport();

    const getCanvasCoords = (event) => {
      const x = (event.clientX - rect.left - vpX) / zoom;
      const y = (event.clientY - rect.top - vpY) / zoom;
      return { x, y };
    };

    const handleMouseMove = (moveEvent) => {
      const coords = getCanvasCoords(moveEvent);
      setControlPoint(coords);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <g
      className="react-flow__edge"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <path
        id={id}
        style={style}
        className={`react-flow__edge-path ${selected ? 'edge-selected' : ''}`}
        d={edgePath}
        markerEnd={markerEnd}
      />
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={15}
        style={{ cursor: 'pointer' }}
      />
      {(selected || isHovered) && (
        <foreignObject
          width={60}
          height={30}
          x={px - 30}
          y={py - 15}
          className="edge-handle-object"
          requiredExtensions="http://www.w3.org/1999/xhtml"
        >
          <div
            style={{
              display: 'flex',
              gap: '6px',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            <div
              className="edge-control-handle"
              onMouseDown={handleMouseDown}
              title="Drag to Route Connection"
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: 'var(--border-node-hover)',
                border: '2px solid var(--bg-card)',
                cursor: 'move',
                boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                transition: 'transform 0.1s',
              }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteEdge(id);
              }}
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#f43f5e',
                border: 'none',
                color: '#fff',
                fontSize: '10px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                padding: '0',
                lineHeight: '1',
              }}
              title="Delete Connection"
            >
              &times;
            </button>
          </div>
        </foreignObject>
      )}
    </g>
  );
};
