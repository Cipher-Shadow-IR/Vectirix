import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Vectirix API")

cors_origins = os.getenv("CORS_ORIGINS", "*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PipelinePayload(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]

@app.get('/')
def read_root():
    return {'Ping': 'Pong'}

@app.get('/health')
def health():
    return {'status': 'healthy'}

@app.post('/pipelines/parse')
def parse_pipeline(payload: PipelinePayload):
    nodes = payload.nodes
    edges = payload.edges

    num_nodes = len(nodes)
    num_edges = len(edges)

    adj = {node["id"]: [] for node in nodes}
    for edge in edges:
        source = edge.get("source")
        target = edge.get("target")
        if source in adj and target in adj:
            adj[source].append(target)

    state = {node["id"]: 0 for node in nodes}
    has_cycle = False

    def dfs(u: str) -> bool:
        state[u] = 1
        for v in adj[u]:
            if state[v] == 1:
                return True
            if state[v] == 0:
                if dfs(v):
                    return True
        state[u] = 2
        return False

    for node in nodes:
        node_id = node["id"]
        if state[node_id] == 0:
            if dfs(node_id):
                has_cycle = True
                break

    is_dag = not has_cycle

    logger.info(f"Pipeline analysis: {num_nodes} nodes, {num_edges} edges, is_dag={is_dag}")

    return {
        'num_nodes': num_nodes,
        'num_edges': num_edges,
        'is_dag': is_dag
    }

