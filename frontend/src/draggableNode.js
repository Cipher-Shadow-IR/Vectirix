

const NODE_META = {
  customInput:        { label: 'Input',        icon: '→', color: '#10b981' },
  llm:                { label: 'LLM',          icon: '◈', color: '#8b5cf6' },
  customOutput:       { label: 'Output',       icon: '←', color: '#f59e0b' },
  text:               { label: 'Text',         icon: '¶', color: '#6366f1' },
  customAPI:          { label: 'API Request',  icon: '⚡', color: '#06b6d4' },
  customDatabase:     { label: 'Database',     icon: '⬡', color: '#3b82f6' },
  customCondition:    { label: 'Condition',    icon: '⌥', color: '#f97316' },
  customTransform:    { label: 'Transform',    icon: '⟳', color: '#a855f7' },
  customNotification: { label: 'Notification', icon: '◎', color: '#ec4899' },
};

export const DraggableNode = ({ type }) => {
  const meta = NODE_META[type] || { label: type, icon: '●', color: '#6366f1' };

  const onDragStart = (event) => {
    const appData = { nodeType: type };
    event.dataTransfer.setData('application/reactflow', JSON.stringify(appData));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="draggable-chip"
      draggable
      onDragStart={onDragStart}
    >
      <span
        className="chip-icon"
        style={{ background: `${meta.color}22`, color: meta.color }}
      >
        {meta.icon}
      </span>
      <span>{meta.label}</span>
    </div>
  );
};