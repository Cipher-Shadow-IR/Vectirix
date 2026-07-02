import { useState, useRef, useEffect, useMemo } from 'react';
import { useStore } from '../store';

export function SearchBar({ onSearch }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const nodes = useStore((s) => s.nodes);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return nodes
      .map((n) => ({
        id: n.id,
        type: n.type,
        label: n.data?.inputName || n.data?.outputName || n.data?.text || n.type,
        score: matchesScore(n, q),
      }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [query, nodes]);

  function matchesScore(node, q) {
    let score = 0;
    if (node.id.toLowerCase().includes(q)) score += 10;
    if (node.type.toLowerCase().includes(q)) score += 5;
    const strFields = JSON.stringify(node.data || {}).toLowerCase();
    if (strFields.includes(q)) score += 3;
    return score;
  }

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      onSearch(results[selectedIndex].id);
      setIsOpen(false);
      setQuery('');
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
    }
  }

  function handleResultClick(result) {
    onSearch(result.id);
    setIsOpen(false);
    setQuery('');
  }

  if (!isOpen) {
    return (
      <button className="search-toggle-btn" onClick={() => setIsOpen(true)} title="Search nodes (Ctrl+F)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
    );
  }

  return (
    <div className="search-overlay" onClick={() => { setIsOpen(false); setQuery(''); }}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-input-wrapper">
          <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            className="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search nodes by name, type, or variable..."
          />
          <button className="search-close-btn" onClick={() => { setIsOpen(false); setQuery(''); }}>×</button>
        </div>

        {results.length > 0 && (
          <div className="search-results">
            {results.map((r, i) => (
              <div
                key={r.id}
                className={`search-result-item ${i === selectedIndex ? 'search-result-selected' : ''}`}
                onClick={() => handleResultClick(r)}
                onMouseEnter={() => setSelectedIndex(i)}
              >
                <span className="search-result-id">{r.id}</span>
                <span className="search-result-label">{r.label}</span>
                <span className="search-result-type">{r.type}</span>
              </div>
            ))}
          </div>
        )}

        {query.trim() && results.length === 0 && (
          <div className="search-no-results">No matching nodes</div>
        )}
      </div>
    </div>
  );
}
