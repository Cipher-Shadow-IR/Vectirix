import dagre from 'dagre';

const NODE_WIDTH = 220;
const NODE_HEIGHT = 100;

export function autoLayout(nodes, edges, direction = 'vertical') {
  if (!nodes || nodes.length === 0) return nodes;

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: direction === 'horizontal' ? 'LR' : 'TB',
    nodesep: 60,
    ranksep: 100,
    marginx: 50,
    marginy: 50,
  });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    if (edge.source && edge.target) {
      g.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(g);

  const laidOutNodes = nodes.map((node) => {
    const dagreNode = g.node(node.id);
    if (dagreNode) {
      return {
        ...node,
        position: {
          x: dagreNode.x - NODE_WIDTH / 2,
          y: dagreNode.y - NODE_HEIGHT / 2,
        },
      };
    }
    return node;
  });

  return laidOutNodes;
}

export function layoutToStore(nodes, edges, direction = 'vertical') {
  const laidOut = autoLayout(nodes, edges, direction);
  return { nodes: laidOut, edges };
}
