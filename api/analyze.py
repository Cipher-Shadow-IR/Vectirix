from http.server import BaseHTTPRequestHandler
import json
from typing import List, Dict, Any, Set, Tuple


class handler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        payload = json.loads(body)

        nodes = payload.get('nodes', [])
        edges = payload.get('edges', [])

        result = analyze_pipeline(nodes, edges)

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(result).encode('utf-8'))

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({"status": "healthy"}).encode('utf-8'))


def analyze_pipeline(nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]) -> Dict[str, Any]:
    num_nodes = len(nodes)
    num_edges = len(edges)

    node_ids: Set[str] = {n["id"] for n in nodes}

    adj: Dict[str, List[str]] = {n["id"]: [] for n in nodes}
    in_degree: Dict[str, int] = {n["id"]: 0 for n in nodes}
    edge_set: Set[Tuple[str, str]] = set()
    duplicate_edges: List[Dict[str, str]] = []
    invalid_connections: List[Dict[str, str]] = []

    for edge in edges:
        source = edge.get("source")
        target = edge.get("target")

        if source not in node_ids:
            invalid_connections.append({"source": source, "target": target, "reason": f"Source node '{source}' not found"})
            continue
        if target not in node_ids:
            invalid_connections.append({"source": source, "target": target, "reason": f"Target node '{target}' not found"})
            continue

        pair = (source, target)
        if pair in edge_set:
            duplicate_edges.append({"source": source, "target": target, "reason": "Duplicate edge"})
            continue

        edge_set.add(pair)
        adj[source].append(target)
        in_degree[target] = in_degree.get(target, 0) + 1

    entry_nodes = [n["id"] for n in nodes if in_degree.get(n["id"], 0) == 0]
    exit_nodes = [n["id"] for n in nodes if n["id"] not in adj or len(adj[n["id"]]) == 0]

    state: Dict[str, int] = {n["id"]: 0 for n in nodes}
    has_cycle = False
    max_depth = 0

    def dfs(u: str, depth: int = 0) -> bool:
        nonlocal max_depth
        state[u] = 1
        max_depth = max(max_depth, depth)
        for v in adj.get(u, []):
            if state[v] == 1:
                return True
            if state[v] == 0:
                if dfs(v, depth + 1):
                    return True
        state[u] = 2
        return False

    for n in nodes:
        nid = n["id"]
        if state[nid] == 0:
            if dfs(nid):
                has_cycle = True
                break

    if not has_cycle:
        for nid in node_ids:
            if state[nid] == 0:
                dfs(nid)

    warnings: List[str] = []
    errors: List[str] = []

    disconnected = [n["id"] for n in nodes if n["id"] not in [e["source"] for e in edges] and n["id"] not in [e["target"] for e in edges]]
    orphan_inputs = [n["id"] for n in nodes if n["type"] in ("customInput", "llm", "text", "customAPI", "customDatabase", "customCondition", "customTransform", "customNotification") and in_degree.get(n["id"], 0) == 0 and n["id"] not in entry_nodes]

    if disconnected:
        warnings.append(f"{len(disconnected)} disconnected node(s): {', '.join(disconnected)}")
    if duplicate_edges:
        warnings.append(f"{len(duplicate_edges)} duplicate edge(s) removed")
    if invalid_connections:
        errors.append(f"{len(invalid_connections)} invalid connection(s) found")
    if not entry_nodes and num_nodes > 0:
        warnings.append("No entry nodes found — graph may be cyclical")
    if num_nodes > 0 and num_edges == 0:
        warnings.append("Pipeline has nodes but no connections")
    if orphan_inputs:
        warnings.append(f"{len(orphan_inputs)} node(s) have no inputs")

    return {
        "summary": {
            "num_nodes": num_nodes,
            "num_edges": len(edge_set),
            "is_dag": not has_cycle
        },
        "graph": {
            "entry_nodes": entry_nodes,
            "exit_nodes": exit_nodes,
            "disconnected_nodes": disconnected,
            "max_depth": max_depth
        },
        "validation": {
            "warnings": warnings,
            "errors": errors,
            "duplicate_edges": duplicate_edges,
            "invalid_connections": invalid_connections
        }
    }
