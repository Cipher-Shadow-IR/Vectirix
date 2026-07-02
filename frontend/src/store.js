import { create } from "zustand";
import {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    MarkerType,
} from 'reactflow';

const HISTORY_LIMIT = 50;
const SAVE_KEY = 'vectirix-pipeline';
const AUTO_SAVE_INTERVAL = 5000;

function loadSavedPipeline() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      if (data.nodes && data.edges) {
        return { nodes: data.nodes, edges: data.edges };
      }
    }
  } catch {
    // ignore
  }
  return null;
}

let autoSaveTimer = null;

export const useStore = create((set, get) => {
  const saved = loadSavedPipeline();

  if (typeof window !== 'undefined' && !autoSaveTimer) {
    autoSaveTimer = setInterval(() => {
      try { get()._persist(); } catch { /* ignore */ }
    }, AUTO_SAVE_INTERVAL);
  }

  return {
    nodes: saved?.nodes || [],
    edges: saved?.edges || [],
    nodeIDs: {},
    history: [],
    historyIndex: -1,

    getNodeID: (type) => {
        const newIDs = {...get().nodeIDs};
        if (newIDs[type] === undefined) {
            newIDs[type] = 0;
        }
        newIDs[type] += 1;
        set({nodeIDs: newIDs});
        return `${type}-${newIDs[type]}`;
    },

    _saveToHistory: () => {
      const { nodes, edges, history, historyIndex } = get();
      const snapshot = { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) };
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(snapshot);
      if (newHistory.length > HISTORY_LIMIT) {
        newHistory.shift();
      }
      set({ history: newHistory, historyIndex: newHistory.length - 1 });
    },

    _persist: () => {
      const { nodes, edges } = get();
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify({ nodes, edges }));
      } catch {
        // storage full or unavailable
      }
    },

    addNode: (node) => {
        set({ nodes: [...get().nodes, node] });
        get()._saveToHistory();
        get()._persist();
    },
    deleteNode: (nodeId) => {
        const { nodes, edges } = get();
        set({
            nodes: nodes.filter((node) => node.id !== nodeId),
            edges: edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
        });
        get()._saveToHistory();
        get()._persist();
    },
    deleteEdge: (edgeId) => {
        set({ edges: get().edges.filter((edge) => edge.id !== edgeId) });
        get()._saveToHistory();
        get()._persist();
    },
    clearPlayground: () => {
        set({ nodes: [], edges: [], nodeIDs: {} });
        get()._saveToHistory();
        get()._persist();
    },
    onNodesChange: (changes) => {
      set({ nodes: applyNodeChanges(changes, get().nodes) });
      const hasDrag = changes.some(c => c.type === 'position' && c.dragging === false);
      if (hasDrag) {
        get()._persist();
      }
    },
    onEdgesChange: (changes) => {
      set({ edges: applyEdgeChanges(changes, get().edges) });
      get()._persist();
    },
    onConnect: (connection) => {
      set({
        edges: addEdge({...connection, type: 'draggable', animated: true, markerEnd: {type: MarkerType.Arrow, height: '20px', width: '20px'}}, get().edges),
      });
      get()._saveToHistory();
      get()._persist();
    },
    updateNodeField: (nodeId, fieldName, fieldValue) => {
      set({
        nodes: get().nodes.map((node) => {
          if (node.id === nodeId) {
            node.data = { ...node.data, [fieldName]: fieldValue };
          }
          return node;
        }),
      });
      get()._persist();
    },

    undo: () => {
      const { history, historyIndex } = get();
      if (historyIndex < 0) return;
      const snapshot = history[historyIndex];
      let newIDs = {};
      snapshot.nodes.forEach(n => {
        const parts = n.id.split('-');
        const type = parts.slice(0, -1).join('-');
        const num = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(num) && (!newIDs[type] || newIDs[type] < num)) {
          newIDs[type] = num;
        }
      });
      set({
        nodes: JSON.parse(JSON.stringify(snapshot.nodes)),
        edges: JSON.parse(JSON.stringify(snapshot.edges)),
        nodeIDs: newIDs,
        historyIndex: historyIndex - 1,
      });
      get()._persist();
    },

    redo: () => {
      const { history, historyIndex } = get();
      if (historyIndex >= history.length - 2) return;
      const snapshot = history[historyIndex + 2];
      if (!snapshot) return;
      let newIDs = {};
      snapshot.nodes.forEach(n => {
        const parts = n.id.split('-');
        const type = parts.slice(0, -1).join('-');
        const num = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(num) && (!newIDs[type] || newIDs[type] < num)) {
          newIDs[type] = num;
        }
      });
      set({
        nodes: JSON.parse(JSON.stringify(snapshot.nodes)),
        edges: JSON.parse(JSON.stringify(snapshot.edges)),
        nodeIDs: newIDs,
        historyIndex: historyIndex + 1,
      });
      get()._persist();
    },

    loadPipeline: (nodes, edges) => {
      let newIDs = {};
      nodes.forEach(n => {
        const parts = n.id.split('-');
        const type = parts.slice(0, -1).join('-');
        const num = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(num) && (!newIDs[type] || newIDs[type] < num)) {
          newIDs[type] = num;
        }
      });
      set({ nodes, edges, nodeIDs: newIDs });
      get()._saveToHistory();
      get()._persist();
    },

    duplicateNode: (nodeId) => {
      const node = get().nodes.find(n => n.id === nodeId);
      if (!node) return;
      const newId = get().getNodeID(node.type);
      const newNode = {
        ...node,
        id: newId,
        position: { x: node.position.x + 50, y: node.position.y + 50 },
        data: { ...node.data },
        selected: false,
      };
      set({ nodes: [...get().nodes, newNode] });
      get()._saveToHistory();
      get()._persist();
    },

    deleteSelected: () => {
      const { nodes, edges } = get();
      const selectedNodeIds = nodes.filter(n => n.selected).map(n => n.id);
      if (selectedNodeIds.length === 0) return;
      set({
        nodes: nodes.filter(n => !n.selected),
        edges: edges.filter(e => !selectedNodeIds.includes(e.source) && !selectedNodeIds.includes(e.target)),
      });
      get()._saveToHistory();
      get()._persist();
    },

    hasUndo: () => get().historyIndex >= 0,
    hasRedo: () => get().historyIndex < get().history.length - 2,
  };
});
