import { useEffect, useState, useCallback, useRef } from 'react';
import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { SubmitButton } from './submit';
import { ExportImport } from './components/ExportImport';
import { PipelineTemplates } from './components/Templates';
import { NotificationContainer, notifySuccess } from './components/Notification';
import { ValidationPanel } from './components/ValidationPanel';
import { SearchBar } from './components/SearchBar';
import { useStore } from './store';
import { analyzePipeline } from './api';

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  const [validationOpen, setValidationOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const loadPipeline = useStore((s) => s.loadPipeline);
  const applyLayout = useStore((s) => s.applyLayout);
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const pipelineRef = useRef(null);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleTemplateSelect = useCallback((tpl) => {
    loadPipeline(tpl.nodes, tpl.edges);
    notifySuccess(`Loaded "${tpl.name}" template`);
  }, [loadPipeline]);

  const handleImport = useCallback((importedNodes, importedEdges) => {
    loadPipeline(importedNodes, importedEdges);
    notifySuccess('Pipeline imported successfully');
  }, [loadPipeline]);

  const handleAnalyze = useCallback(async () => {
    try {
      const result = await analyzePipeline(nodes, edges);
      setAnalysisResult(result);
      setValidationOpen(true);
    } catch (err) {
      setAnalysisResult(null);
      setValidationOpen(true);
    }
  }, [nodes, edges]);

  const handleSearch = useCallback((nodeId) => {
    if (pipelineRef.current?.focusNode) {
      pipelineRef.current.focusNode(nodeId);
    }
  }, []);

  const handleLayout = useCallback((direction) => {
    applyLayout(direction);
    notifySuccess(`Applied ${direction} layout`);
  }, [applyLayout]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-logo">
          <img src="/Vectirix_logo.png" alt="Vectirix Logo" className="app-logo-img" />
          <h1>Vectirix</h1>
          <span className="app-header-badge">v2</span>
        </div>

        <div className="app-header-actions">
          <ExportImport nodes={nodes} edges={edges} onImport={handleImport} />
          <PipelineTemplates onSelect={handleTemplateSelect} />
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="app-header-center">
          <button className="btn-layout" onClick={() => handleLayout('vertical')} title="Vertical Layout">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
            Layout
          </button>
          <button className="btn-layout" onClick={() => handleLayout('horizontal')} title="Horizontal Layout">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
            H-Layout
          </button>
        </div>

        <div className="app-header-right">
          <div className="creator-profile">
            <div className="creator-trigger">
              <span className="creator-made-by">Made by</span>
              <span className="creator-name">Ishaan Ray</span>
            </div>
            <div className="creator-dropdown">
              <p className="dropdown-title">Ishaan Ray (Cipher Shadow)</p>
              <div className="dropdown-divider"></div>
              <a href="https://github.com/Cipher-Shadow-IR" target="_blank" rel="noopener noreferrer" className="dropdown-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                </svg>
                <span>GitHub</span>
              </a>
              <a href="https://linkedin.com/in/ishaan-ray-cs" target="_blank" rel="noopener noreferrer" className="dropdown-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
                <span>LinkedIn</span>
              </a>
              <a href="https://galaxir.vercel.app" target="_blank" rel="noopener noreferrer" className="dropdown-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" />
                </svg>
                <span>Portfolio</span>
              </a>
            </div>
          </div>

          <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme">
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            )}
          </button>
        </div>
      </header>
      <PipelineToolbar />
      <div className="canvas-container">
        <PipelineUI ref={pipelineRef} />
        {validationOpen && (
          <ValidationPanel
            analysisResult={analysisResult}
            onClose={() => setValidationOpen(false)}
          />
        )}
      </div>
      <div className="submit-row">
        <SubmitButton onAnalyze={handleAnalyze} />
      </div>
      <NotificationContainer />
    </div>
  );
}

export default App;
