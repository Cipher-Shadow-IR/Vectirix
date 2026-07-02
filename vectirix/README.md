# Vectirix

Visual AI pipeline workflow builder. Design, analyze, and export data pipelines through a drag-and-drop interface.

## Problem

Building AI workflows often requires writing glue code between services, manually tracking data flow, and debugging pipeline logic without visibility into the graph structure. Teams waste time on integration instead of logic.

## Solution

Vectirix provides a visual canvas where you compose pipelines from reusable nodes — Input, LLM, Text, API, Database, Condition, Transform, Notification, and Output. Each node is configurable, resizable, and connectable via draggable edges.

The built-in graph analyzer validates pipeline structure (DAG detection, cycle detection, entry/exit node identification) and surfaces warnings for disconnected or invalid configurations.

## Architecture

```
vectirix/
├── api/                    # Vercel Python Serverless Functions
│   ├── analyze.py          # POST /api/analyze - pipeline graph analysis
│   └── health.py           # GET  /api/health  - health check
├── frontend/               # React 18 SPA (Create React App)
│   ├── src/
│   │   ├── api.js          # API client with timeout & error handling
│   │   ├── store.js        # Zustand store (undo/redo, localStorage)
│   │   ├── hooks/          # React hooks (keyboard shortcuts)
│   │   ├── components/     # Reusable UI (templates, export, notifications)
│   │   └── nodes/          # 9 custom ReactFlow node types
│   └── public/
├── vercel.json             # Vercel deployment config
├── requirements.txt        # Python dependencies
└── README.md
```

**Stack:** React 18, ReactFlow 11, Zustand, Vercel Python Serverless Functions, Vanilla CSS.

## Features

- **Drag-and-drop canvas** with 9 node types
- **Custom edges** with midpoint routing controls
- **Graph analysis** — node count, edge count, DAG validation, cycle detection, entry/exit/disconnected/orphan nodes, max depth
- **Undo/redo** (Ctrl+Z / Ctrl+Y)
- **Keyboard shortcuts** — Delete (remove selected), Ctrl+D (duplicate), Ctrl+A (select all)
- **Auto-save** — pipeline persists to localStorage every few seconds, restored on load
- **Export/Import** — download pipeline as JSON, upload JSON to restore
- **Pipeline templates** — 7 pre-built templates (Chatbot, RAG, Summarizer, Translator, etc.)
- **Dark/Light themes** — persistent toggle
- **Resizable nodes** with validation and dynamic handles (Text node auto-detects variables)
- **MiniMap, Controls, Background grid, Snap to grid**

## Installation

```bash
# Clone the repository
git clone https://github.com/Cipher-Shadow-IR/Vectirix.git
cd Vectirix

# Install frontend dependencies
cd vectirix/frontend && npm install

# Start the development server
npm start
```

The app runs on `http://localhost:3000`. API calls use relative `/api` paths.

## Development

```bash
# Frontend dev server with hot reload
cd vectirix/frontend && npm start

# Run tests
npm test

# Production build
npm run build
```

To test API functions locally with Vercel CLI:

```bash
npm install -g vercel
vercel dev
```

## Deployment

The entire application deploys to Vercel with a single connection.

1. Push the repository to GitHub
2. Import the project in Vercel
3. Set the root directory to `vectirix/`
4. Deploy

Vercel automatically detects the Python serverless functions (`api/*.py`) and the React build (`frontend/`). No environment variables required.

## API

### `POST /api/analyze`

Analyze a pipeline graph.

**Request body:**

```json
{
  "nodes": [{ "id": "customInput-1", "type": "customInput" }],
  "edges": [{ "source": "customInput-1", "target": "llm-1" }]
}
```

**Response:**

```json
{
  "summary": {
    "num_nodes": 2,
    "num_edges": 1,
    "is_dag": true
  },
  "graph": {
    "entry_nodes": ["customInput-1"],
    "exit_nodes": ["llm-1"],
    "disconnected_nodes": [],
    "orphan_nodes": [],
    "max_depth": 1
  },
  "validation": {
    "warnings": [],
    "errors": [],
    "duplicate_edges": [],
    "invalid_connections": []
  }
}
```

### `GET /api/health`

Returns `{"status": "healthy"}`.

## Roadmap

- [ ] User authentication and project workspaces
- [ ] Real-time collaboration
- [ ] Custom node SDK for third-party plugins
- [ ] Execution engine to run pipelines server-side
- [ ] Version history with diff view

## License

Apache License 2.0
