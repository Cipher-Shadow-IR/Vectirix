import { useState } from 'react';

const TEMPLATES = [
  {
    name: 'Chatbot',
    description: 'Input \u2192 LLM \u2192 Output conversation flow',
    nodes: [
      { id: 'customInput-1', type: 'customInput', position: { x: 100, y: 200 }, data: { inputName: 'user_input', inputType: 'Text' } },
      { id: 'llm-1', type: 'llm', position: { x: 350, y: 200 }, data: {} },
      { id: 'customOutput-1', type: 'customOutput', position: { x: 600, y: 200 }, data: { outputName: 'response', outputType: 'Text' } },
    ],
    edges: [
      { source: 'customInput-1', target: 'llm-1', sourceHandle: 'customInput-1-value', targetHandle: 'llm-1-prompt' },
      { source: 'llm-1', target: 'customOutput-1', sourceHandle: 'llm-1-response', targetHandle: 'customOutput-1-value' },
    ],
  },
  {
    name: 'RAG Pipeline',
    description: 'Query \u2192 LLM (with context) \u2192 Output',
    nodes: [
      { id: 'customInput-1', type: 'customInput', position: { x: 50, y: 150 }, data: { inputName: 'query', inputType: 'Text' } },
      { id: 'customInput-2', type: 'customInput', position: { x: 50, y: 300 }, data: { inputName: 'context', inputType: 'Text' } },
      { id: 'llm-1', type: 'llm', position: { x: 350, y: 200 }, data: {} },
      { id: 'customOutput-1', type: 'customOutput', position: { x: 650, y: 200 }, data: { outputName: 'result', outputType: 'Text' } },
    ],
    edges: [
      { source: 'customInput-1', target: 'llm-1', sourceHandle: 'customInput-1-value', targetHandle: 'llm-1-prompt' },
      { source: 'customInput-2', target: 'llm-1', sourceHandle: 'customInput-2-value', targetHandle: 'llm-1-system' },
      { source: 'llm-1', target: 'customOutput-1', sourceHandle: 'llm-1-response', targetHandle: 'customOutput-1-value' },
    ],
  },
  {
    name: 'Text Summarizer',
    description: 'Text input \u2192 Transform \u2192 Output summary',
    nodes: [
      { id: 'customInput-1', type: 'customInput', position: { x: 100, y: 200 }, data: { inputName: 'article', inputType: 'Text' } },
      { id: 'text-1', type: 'text', position: { x: 350, y: 200 }, data: { text: 'Summarize: {{input}}' } },
      { id: 'customOutput-1', type: 'customOutput', position: { x: 600, y: 200 }, data: { outputName: 'summary', outputType: 'Text' } },
    ],
    edges: [
      { source: 'customInput-1', target: 'text-1', sourceHandle: 'customInput-1-value', targetHandle: 'text-1-input' },
      { source: 'text-1', target: 'customOutput-1', sourceHandle: 'text-1-output', targetHandle: 'customOutput-1-value' },
    ],
  },
  {
    name: 'Translator',
    description: 'Input \u2192 LLM \u2192 Output translation',
    nodes: [
      { id: 'customInput-1', type: 'customInput', position: { x: 100, y: 200 }, data: { inputName: 'source_text', inputType: 'Text' } },
      { id: 'text-1', type: 'text', position: { x: 350, y: 150 }, data: { text: 'Translate to French' } },
      { id: 'llm-1', type: 'llm', position: { x: 350, y: 300 }, data: {} },
      { id: 'customOutput-1', type: 'customOutput', position: { x: 600, y: 200 }, data: { outputName: 'translation', outputType: 'Text' } },
    ],
    edges: [
      { source: 'customInput-1', target: 'llm-1', sourceHandle: 'customInput-1-value', targetHandle: 'llm-1-prompt' },
      { source: 'text-1', target: 'llm-1', sourceHandle: 'text-1-output', targetHandle: 'llm-1-system' },
      { source: 'llm-1', target: 'customOutput-1', sourceHandle: 'llm-1-response', targetHandle: 'customOutput-1-value' },
    ],
  },
  {
    name: 'Image Captioning',
    description: 'File input \u2192 API \u2192 Output caption',
    nodes: [
      { id: 'customInput-1', type: 'customInput', position: { x: 100, y: 200 }, data: { inputName: 'image', inputType: 'File' } },
      { id: 'customAPI-1', type: 'customAPI', position: { x: 350, y: 200 }, data: { apiUrl: 'https://api.example.com/caption', apiMethod: 'POST' } },
      { id: 'customOutput-1', type: 'customOutput', position: { x: 600, y: 200 }, data: { outputName: 'caption', outputType: 'Text' } },
    ],
    edges: [
      { source: 'customInput-1', target: 'customAPI-1', sourceHandle: 'customInput-1-value', targetHandle: 'customAPI-1-trigger' },
      { source: 'customAPI-1', target: 'customOutput-1', sourceHandle: 'customAPI-1-response', targetHandle: 'customOutput-1-value' },
    ],
  },
  {
    name: 'Email Automation',
    description: 'Trigger \u2192 Database lookup \u2192 Notification',
    nodes: [
      { id: 'customInput-1', type: 'customInput', position: { x: 100, y: 200 }, data: { inputName: 'user_id', inputType: 'Text' } },
      { id: 'customDatabase-1', type: 'customDatabase', position: { x: 350, y: 200 }, data: { dbTable: 'users', dbOperation: 'SELECT' } },
      { id: 'customNotification-1', type: 'customNotification', position: { x: 600, y: 200 }, data: { notiChannel: 'Email', notiMessage: 'Welcome!' } },
    ],
    edges: [
      { source: 'customInput-1', target: 'customDatabase-1', sourceHandle: 'customInput-1-value', targetHandle: 'customDatabase-1-params' },
      { source: 'customDatabase-1', target: 'customNotification-1', sourceHandle: 'customDatabase-1-result', targetHandle: 'customNotification-1-input' },
    ],
  },
  {
    name: 'API Workflow',
    description: 'API request \u2192 Transform \u2192 Database \u2192 Notification',
    nodes: [
      { id: 'customAPI-1', type: 'customAPI', position: { x: 100, y: 200 }, data: { apiUrl: 'https://api.example.com/data', apiMethod: 'GET' } },
      { id: 'customTransform-1', type: 'customTransform', position: { x: 350, y: 200 }, data: { transformLang: 'JavaScript', transformCode: 'return JSON.parse(input);' } },
      { id: 'customDatabase-1', type: 'customDatabase', position: { x: 600, y: 200 }, data: { dbTable: 'results', dbOperation: 'INSERT' } },
      { id: 'customNotification-1', type: 'customNotification', position: { x: 850, y: 200 }, data: { notiChannel: 'Slack', notiMessage: 'Data processed.' } },
    ],
    edges: [
      { source: 'customAPI-1', target: 'customTransform-1', sourceHandle: 'customAPI-1-response', targetHandle: 'customTransform-1-input' },
      { source: 'customTransform-1', target: 'customDatabase-1', sourceHandle: 'customTransform-1-output', targetHandle: 'customDatabase-1-params' },
      { source: 'customDatabase-1', target: 'customNotification-1', sourceHandle: 'customDatabase-1-result', targetHandle: 'customNotification-1-input' },
    ],
  },
];

export const PipelineTemplates = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="btn-template" onClick={() => setIsOpen(true)} title="Load Pipeline Template">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
        Templates
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-card template-modal" onClick={(e) => e.stopPropagation()}>
            <p className="modal-title">Pipeline Templates</p>
            <div className="template-grid">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.name}
                  className="template-card"
                  onClick={() => { onSelect(tpl); setIsOpen(false); }}
                >
                  <span className="template-name">{tpl.name}</span>
                  <span className="template-desc">{tpl.description}</span>
                  <span className="template-meta">{tpl.nodes.length} nodes, {tpl.edges.length} edges</span>
                </button>
              ))}
            </div>
            <button className="modal-close-btn" onClick={() => setIsOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
};
