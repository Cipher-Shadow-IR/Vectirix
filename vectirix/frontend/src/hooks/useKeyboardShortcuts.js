import { useEffect } from 'react';
import { useStore } from '../store';
import { useReactFlow } from 'reactflow';

export const useKeyboardShortcuts = () => {
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const deleteSelected = useStore((s) => s.deleteSelected);
  const duplicateNode = useStore((s) => s.duplicateNode);
  const nodes = useStore((s) => s.nodes);
  const instance = useReactFlow();

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
        return;
      }
      if (ctrl && e.key === 'd') {
        e.preventDefault();
        const selected = nodes.find((n) => n.selected);
        if (selected) {
          duplicateNode(selected.id);
        }
        return;
      }
      if (ctrl && e.key === 'a') {
        e.preventDefault();
        const allNodes = nodes.map((n) => ({ ...n, selected: true }));
        instance.setNodes(allNodes);
        return;
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [undo, redo, deleteSelected, duplicateNode, nodes, instance]);
};
