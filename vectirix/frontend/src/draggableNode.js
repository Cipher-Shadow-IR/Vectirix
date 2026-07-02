

const NODE_META = {
  customInput:        { label: 'Input',        icon: '→', color: '#10b981', description: 'Pipeline entry point for text or file data' },
  llm:                { label: 'LLM',          icon: '◆', color: '#8b5cf6', description: 'Language model with system + prompt inputs' },
  customOutput:       { label: 'Output',       icon: '←', color: '#f59e0b', description: 'Pipeline exit point with typed output' },
  text:               { label: 'Text',         icon: '¶', color: '#6366f1', description: 'Static text with {{variable}} interpolation' },
  customAPI:          { label: 'API Request',  icon: '⚡', color: '#06b6d4', description: 'HTTP request to external API endpoints' },
  customDatabase:     { label: 'Database',     icon: '⬢', color: '#3b82f6', description: 'Database CRUD operations (SELECT/INSERT/etc.)' },
  customCondition:    { label: 'Condition',    icon: '⌥', color: '#f97316', description: 'Boolean branch: True (top) / False (bottom)' },
  customTransform:    { label: 'Transform',    icon: '↻', color: '#a855f7', description: 'Data transformation via JS or Python script' },
  customNotification: { label: 'Notification', icon: '◎', color: '#ec4899', description: 'Send alerts via Email, Slack, or SMS' },
};

export const DraggableNode = ({ type }) => {
  const meta = NODE_META[type] || { label: type, icon: '●', color: '#6366f1', description: '' };

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
      title={meta.description}
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