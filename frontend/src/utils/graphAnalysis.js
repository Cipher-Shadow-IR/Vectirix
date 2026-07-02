export function computeGraphStats(nodes, edges) {
  const nodeIds = new Set(nodes.map((n) => n.id));
  const adj = {};
  const inDegree = {};
  nodes.forEach((n) => {
    adj[n.id] = [];
    inDegree[n.id] = 0;
  });

  const edgeSet = new Set();
  const duplicateEdges = [];
  const invalidConnections = [];

  for (const edge of edges) {
    const { source, target } = edge;
    if (!nodeIds.has(source)) {
      invalidConnections.push({ source, target, reason: `Source '${source}' not found` });
      continue;
    }
    if (!nodeIds.has(target)) {
      invalidConnections.push({ source, target, reason: `Target '${target}' not found` });
      continue;
    }
    const key = `${source}->${target}`;
    if (edgeSet.has(key)) {
      duplicateEdges.push({ source, target, reason: 'Duplicate edge' });
      continue;
    }
    edgeSet.add(key);
    adj[source].push(target);
    inDegree[target] = (inDegree[target] || 0) + 1;
  }

  const entryNodes = nodes.filter((n) => inDegree[n.id] === 0).map((n) => n.id);
  const exitNodes = nodes.filter((n) => adj[n.id].length === 0).map((n) => n.id);

  const sourceIds = new Set(edges.map((e) => e.source));
  const targetIds = new Set(edges.map((e) => e.target));
  const disconnectedNodes = nodes.filter((n) => !sourceIds.has(n.id) && !targetIds.has(n.id)).map((n) => n.id);
  const orphanNodes = nodes.filter((n) => sourceIds.has(n.id) && !targetIds.has(n.id) && inDegree[n.id] > 0 && adj[n.id].length === 0).map((n) => n.id);

  const state = {};
  nodes.forEach((n) => (state[n.id] = 0));
  let hasCycle = false;
  let maxDepth = 0;
  let longestPath = [];

  function dfs(u, depth, path) {
    state[u] = 1;
    if (depth > maxDepth) {
      maxDepth = depth;
      longestPath = [...path];
    }
    for (const v of adj[u] || []) {
      if (state[v] === 1) {
        hasCycle = true;
        return;
      }
      if (state[v] === 0) {
        dfs(v, depth + 1, [...path, v]);
      }
    }
    state[u] = 2;
  }

  for (const n of nodes) {
    if (state[n.id] === 0) {
      dfs(n.id, 1, [n.id]);
    }
  }

  const complexityScore = computeComplexity(nodes.length, edges.length, entryNodes.length, exitNodes.length, hasCycle);

  return {
    summary: {
      num_nodes: nodes.length,
      num_edges: edgeSet.size,
      is_dag: !hasCycle,
      complexity_score: complexityScore,
    },
    graph: {
      entry_nodes: entryNodes,
      exit_nodes: exitNodes,
      disconnected_nodes: disconnectedNodes,
      orphan_nodes: orphanNodes,
      max_depth: maxDepth,
      longest_path: longestPath,
    },
    validation: {
      has_cycle: hasCycle,
      duplicate_edges: duplicateEdges,
      invalid_connections: invalidConnections,
    },
  };
}

function computeComplexity(numNodes, numEdges, numEntry, numExit, hasCycle) {
  let score = 0;
  score += Math.min(numNodes * 5, 30);
  score += Math.min(numEdges * 3, 25);
  score += Math.min(numEntry * 2, 10);
  score += Math.min(numExit * 2, 10);
  score += hasCycle ? 15 : 0;
  if (numNodes > 0 && numEdges === 0) score += 10;
  return Math.min(Math.round(score), 100);
}
