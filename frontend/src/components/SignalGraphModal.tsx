import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  Database, 
  Cpu, 
  Lock, 
  Code, 
  RotateCcw, 
  PinOff, 
  GitFork, 
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  SlidersHorizontal
} from 'lucide-react';
import { SpannerGraphData, SpannerGraphNode, SpannerGraphEdge } from '../types';
import { mockSignalGraphs } from '../mockData';

export interface SignalGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePayoffId: string;
  onSelectPayoffId?: (payoffId: string) => void;
}

interface SimNode extends SpannerGraphNode {
  vx: number;
  vy: number;
  fx?: number | null;
  fy?: number | null;
  isPinned?: boolean;
}

const DEALS = [
  { id: 'PO-2026-8821', short: 'Vance', name: 'Marcus Vance', entity: 'Vance Riverfront Properties IV, LLC', type: 'Taxable Cash-Out', conf: 94 },
  { id: 'PO-2026-7492', short: 'Buckeye', name: 'Arthur Pendelton', entity: 'Buckeye Precision Tooling Corp.', type: '1031 Exchange', conf: 88 },
  { id: 'PO-2026-6104', short: 'Miller', name: 'Dr. Robert Miller', entity: 'Columbus Medical Arts Center LLC', type: 'Loan Refinance', conf: 58 }
];

const CANVAS_WIDTH = 1340;
const CANVAS_HEIGHT = 700;
const CENTER_X = CANVAS_WIDTH / 2;
const CENTER_Y = CANVAS_HEIGHT / 2;

function getSeedData(dealId: string): SpannerGraphData {
  return mockSignalGraphs[dealId] || mockSignalGraphs['PO-2026-8821'];
}

// Initial positioning helpers for clean, expansive spring relaxation
function seedNodesForMode(nodes: SpannerGraphNode[], mode: 'flow' | 'radial', spread: number = 270): SimNode[] {
  if (mode === 'radial') {
    const center = { x: CENTER_X, y: CENTER_Y };
    const tierRanks: Record<string, number> = {
      entity: 0,
      contract: 1,
      source: 2,
      principal: 2,
      signal: 3,
      verdict: 3,
    };
    const scale = spread / 270;
    const radii = [0, 240 * scale, 430 * scale, 580 * scale];
    
    const groups: Record<number, SpannerGraphNode[]> = { 0: [], 1: [], 2: [], 3: [] };
    nodes.forEach(n => {
      const r = tierRanks[n.tier] ?? 2;
      groups[r].push(n);
    });

    const result: SimNode[] = [];
    Object.entries(groups).forEach(([rankStr, groupNodes]) => {
      const rank = parseInt(rankStr, 10);
      const radius = radii[rank];
      const count = groupNodes.length;
      groupNodes.forEach((n, idx) => {
        if (rank === 0 && count === 1) {
          result.push({ ...n, x: center.x, y: center.y, vx: 0, vy: 0, fx: null, fy: null, isPinned: false });
        } else {
          const angle = (idx / Math.max(1, count)) * 2 * Math.PI - Math.PI / 2;
          const x = center.x + Math.cos(angle) * radius;
          const y = center.y + Math.sin(angle) * radius * 0.76;
          result.push({ ...n, x, y, vx: 0, vy: 0, fx: null, fy: null, isPinned: false });
        }
      });
    });
    return result;
  }

  // Directional Flow initial seed positions: wide horizontal pipeline spanning 1340px
  const tierX: Record<string, number> = {
    source: 140,
    contract: 390,
    entity: 640,
    principal: 890,
    signal: 1110,
    verdict: 1240,
  };

  const tierCounts: Record<string, number> = {};
  nodes.forEach(n => {
    tierCounts[n.tier] = (tierCounts[n.tier] || 0) + 1;
  });
  const tierSeen: Record<string, number> = {};

  return nodes.map((n) => {
    const totalInTier = tierCounts[n.tier] || 1;
    const indexInTier = tierSeen[n.tier] || 0;
    tierSeen[n.tier] = indexInTier + 1;

    const x = tierX[n.tier] ?? CENTER_X;
    const stepY = 560 / (totalInTier + 1);
    const y = 65 + stepY * (indexInTier + 1);

    return {
      ...n,
      x,
      y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      fx: null,
      fy: null,
      isPinned: false,
    };
  });
}

// Parametric ray intersection with box boundary (boxW x boxH) centered at (toX, toY)
function getRectIntersection(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  boxW: number,
  boxH: number
): { x: number; y: number } {
  const dx = fromX - toX;
  const dy = fromY - toY;
  if (dx === 0 && dy === 0) return { x: toX, y: toY };

  const halfW = boxW / 2;
  const halfH = boxH / 2;
  const tx = dx !== 0 ? halfW / Math.abs(dx) : Infinity;
  const ty = dy !== 0 ? halfH / Math.abs(dy) : Infinity;
  const t = Math.min(tx, ty);

  return {
    x: toX + t * dx,
    y: toY + t * dy,
  };
}

// Adaptive text splitter to eliminate truncation and render multi-line labels cleanly
function splitLabel(label: string, maxChars: number = 26): string[] {
  if (label.length <= maxChars) return [label];
  const words = label.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    if ((current + (current ? ' ' : '') + w).length <= maxChars) {
      current += (current ? ' ' : '') + w;
    } else {
      if (current) lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [label];
}

function formatGqlRest(rest: string): React.ReactNode {
  // Highlight Spanner Graph node labels like :BorrowerEntity, :Principal, :CreditFacility in bold blue
  const parts = rest.split(/(:[A-Za-z0-9_]+)/g);
  return parts.map((part, i) => {
    if (part.startsWith(':')) {
      return (
        <span key={i} className="text-blue-700 font-bold">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function formatGqlClause(queryStr: string): React.ReactNode[] {
  const lines = queryStr.trim().split('\n');
  return lines.map((line, idx) => {
    const match = line.match(/^(\s*)(GRAPH|OPTIONAL MATCH|MATCH|RETURN|WHERE|AND)\b(.*)$/i);
    if (match) {
      const [, indent, keyword, rest] = match;
      return (
        <div key={idx} className="flex items-start py-0.5" style={{ paddingLeft: `${(indent?.length || 0) * 6}px` }}>
          <span className="font-extrabold text-[#004724] tracking-tight shrink-0 mr-1.5 uppercase text-[11px]">
            {keyword}
          </span>
          <span className="text-slate-800 break-all font-medium text-[11px] leading-snug">
            {formatGqlRest(rest)}
          </span>
        </div>
      );
    }
    return (
      <div key={idx} className="py-0.5 text-slate-800 text-[11px] leading-snug">
        {line}
      </div>
    );
  });
}

export const SignalGraphModal: React.FC<SignalGraphModalProps> = ({
  isOpen,
  onClose,
  activePayoffId,
  onSelectPayoffId
}) => {
  const [selectedDealId, setSelectedDealId] = useState<string>(activePayoffId || 'PO-2026-8821');
  const [layoutMode, setLayoutMode] = useState<'flow' | 'radial'>('flow');
  const [springSpread, setSpringSpread] = useState<number>(270);
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  
  // Synchronous seed data initialization
  const [graphData, setGraphData] = useState<SpannerGraphData>(() => getSeedData(activePayoffId || 'PO-2026-8821'));
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(() => {
    const seed = getSeedData(activePayoffId || 'PO-2026-8821');
    return seed.nodes.find(n => n.tier === 'verdict')?.id || seed.nodes[0]?.id || null;
  });
  const [simNodes, setSimNodes] = useState<SimNode[]>(() => {
    const seed = getSeedData(activePayoffId || 'PO-2026-8821');
    return seedNodesForMode(seed.nodes, 'flow', 270);
  });
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const nodesRef = useRef<SimNode[]>(seedNodesForMode(graphData.nodes, 'flow', 270));
  const edgesRef = useRef<SpannerGraphEdge[]>(graphData.edges);
  const alphaRef = useRef<number>(1.0);
  const animFrameRef = useRef<number | null>(null);
  const layoutModeRef = useRef<'flow' | 'radial'>('flow');
  const springSpreadRef = useRef<number>(270);
  const zoomRef = useRef<number>(1.0);
  const panRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panDragRef = useRef<{
    isPanning: boolean;
    startX: number;
    startY: number;
    startPanX: number;
    startPanY: number;
  }>({
    isPanning: false,
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0,
  });
  const dragRef = useRef<{
    nodeId: string | null;
    startX: number;
    startY: number;
    moved: boolean;
  }>({ nodeId: null, startX: 0, startY: 0, moved: false });

  // Keep refs updated
  layoutModeRef.current = layoutMode;
  springSpreadRef.current = springSpread;
  panRef.current = pan;
  zoomRef.current = zoom;

  // Sync selectedDealId with prop changes when modal opens or activePayoffId changes
  useEffect(() => {
    if (isOpen && activePayoffId && activePayoffId !== selectedDealId) {
      setSelectedDealId(activePayoffId);
    }
  }, [isOpen, activePayoffId]);

  // Main Spring Force Calculation (pure ref-based, zero dependency churn)
  const runSimulationStep = useCallback(() => {
    const nodes = nodesRef.current;
    const edges = edgesRef.current;
    if (!nodes || nodes.length === 0) return false;

    const alpha = alphaRef.current;
    const currentMode = layoutModeRef.current;
    const spread = springSpreadRef.current;
    const isDragActive = dragRef.current.nodeId !== null;

    // 1. Hooke's Law Edge Springs
    if (edges && edges.length > 0) {
      const nodeMap = new Map<string, SimNode>(nodes.map(n => [n.id, n]));
      for (const edge of edges) {
        const src = nodeMap.get(edge.source);
        const tgt = nodeMap.get(edge.target);
        if (!src || !tgt) continue;

        const dx = tgt.x - src.x;
        const dy = tgt.y - src.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
        const targetLen = edge.type === 'verdict' ? spread * 1.15 : spread;
        const displacement = dist - targetLen;
        const springK = 0.042 * alpha;
        const fx = (dx / dist) * displacement * springK;
        const fy = (dy / dist) * displacement * springK;

        if (src.fx == null) {
          src.vx += fx;
          src.vy += fy;
        }
        if (tgt.fx == null) {
          tgt.vx -= fx;
          tgt.vy -= fy;
        }

        // Directional flow spring (if mode is flow): maintain left-to-right causal order
        if (currentMode === 'flow') {
          const minGap = spread * 0.58;
          if (tgt.x < src.x + minGap) {
            const push = (src.x + minGap - tgt.x) * 0.035 * alpha;
            if (src.fx == null) src.vx -= push;
            if (tgt.fx == null) tgt.vx += push;
          }
        }
      }
    }

    // 2. Coulomb Repulsion
    const repBase = 44000 * (spread / 240);
    const maxRepulseDist = Math.max(780, spread * 2.8);

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n1 = nodes[i];
        const n2 = nodes[j];
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const normDy = dy * 2.1;
        const distSq = dx * dx + normDy * normDy + 1;
        const dist = Math.sqrt(distSq);

        if (dist < maxRepulseDist) {
          const force = (alpha * repBase) / distSq;
          const fx = (dx / dist) * force;
          const fy = (normDy / dist) * (force / 2.1);

          if (n1.fx == null) {
            n1.vx -= fx;
            n1.vy -= fy;
          }
          if (n2.fx == null) {
            n2.vx += fx;
            n2.vy += fy;
          }
        }
      }
    }

    // 3. Hard Rectangular Collision Resolution (Anti-Overlap)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n1 = nodes[i];
        const n2 = nodes[j];
        const halfW1 = n1.tier === 'verdict' ? 124 : 112;
        const halfH1 = n1.tier === 'verdict' ? 34 : 29;
        const halfW2 = n2.tier === 'verdict' ? 124 : 112;
        const halfH2 = n2.tier === 'verdict' ? 34 : 29;
        const padX = 46;
        const padY = 34;

        const reqX = halfW1 + halfW2 + padX;
        const reqY = halfH1 + halfH2 + padY;

        const deltaX = n2.x - n1.x;
        const deltaY = n2.y - n1.y;
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (absX < reqX && absY < reqY) {
          const overlapX = reqX - absX;
          const overlapY = reqY - absY;

          if (overlapX < overlapY) {
            const push = overlapX * 0.5 * 0.88;
            const sign = deltaX >= 0 ? 1 : -1;
            if (n1.fx == null) n1.x -= sign * push;
            if (n2.fx == null) n2.x += sign * push;
          } else {
            const push = overlapY * 0.5 * 0.88;
            const sign = deltaY >= 0 ? 1 : -1;
            if (n1.fy == null) n1.y -= sign * push;
            if (n2.fy == null) n2.y += sign * push;
          }
        }
      }
    }

    // 4. Center-of-Mass Gravitation (gentle tether)
    for (const n of nodes) {
      if (n.fx != null) continue;
      n.vx += (CENTER_X - n.x) * (0.0012 * alpha);
      n.vy += (CENTER_Y - n.y) * (0.0016 * alpha);
    }

    // 5. Velocity Integration, Damping & Canvas Bounding
    const damping = 0.82;
    let totalVelocity = 0;

    for (const n of nodes) {
      if (n.fx != null && n.fy != null) {
        n.x = n.fx;
        n.y = n.fy;
        n.vx = 0;
        n.vy = 0;
      } else {
        n.vx *= damping;
        n.vy *= damping;
        n.x += n.vx;
        n.y += n.vy;

        const halfW = n.tier === 'verdict' ? 124 : 112;
        const halfH = n.tier === 'verdict' ? 34 : 29;
        n.x = Math.max(halfW + 15, Math.min(CANVAS_WIDTH - halfW - 15, n.x));
        n.y = Math.max(halfH + 15, Math.min(CANVAS_HEIGHT - halfH - 15, n.y));

        totalVelocity += Math.abs(n.vx) + Math.abs(n.vy);
      }
    }

    // 6. Cooling decay
    if (!isDragActive) {
      alphaRef.current *= 0.985;
    }

    const shouldContinue = isDragActive || (alphaRef.current > 0.004 && totalVelocity > 0.08);
    return shouldContinue;
  }, []);

  // Animation Loop Runner
  const startSimulation = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    const tick = () => {
      const active = runSimulationStep();
      setSimNodes([...nodesRef.current]);

      if (active) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        animFrameRef.current = null;
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, [runSimulationStep]);

  // Handle deal switching and background API sync
  useEffect(() => {
    if (!isOpen) return;

    // Load seed data immediately
    const seed = getSeedData(selectedDealId);
    setGraphData(seed);
    edgesRef.current = seed.edges;

    const initialized = seedNodesForMode(seed.nodes, layoutModeRef.current, springSpreadRef.current);
    nodesRef.current = initialized;
    setSimNodes(initialized);

    const defaultNode = seed.nodes.find(n => n.tier === 'verdict') || seed.nodes[0];
    setSelectedNodeId(defaultNode ? defaultNode.id : null);

    alphaRef.current = 1.0;
    startSimulation();

    // Fetch live backend data without blocking UI
    let isMounted = true;
    fetch(`/api/signal-graph?payoff_id=${selectedDealId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: SpannerGraphData | null) => {
        if (!isMounted || !data) return;
        setGraphData(data);
        edgesRef.current = data.edges;
      })
      .catch(() => {});

    return () => {
      isMounted = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [isOpen, selectedDealId, startSimulation]);

  // Handle spread change
  const handleSpreadChange = (newSpread: number) => {
    setSpringSpread(newSpread);
    springSpreadRef.current = newSpread;
    alphaRef.current = Math.max(alphaRef.current, 0.75);
    startSimulation();
  };

  // Switch layout mode (Flow vs Radial)
  const switchLayoutMode = (newMode: 'flow' | 'radial') => {
    if (newMode === layoutMode) return;
    setLayoutMode(newMode);
    layoutModeRef.current = newMode;
    const reseeded = seedNodesForMode(graphData.nodes, newMode, springSpreadRef.current);
    nodesRef.current = reseeded;
    setSimNodes(reseeded);
    alphaRef.current = 1.0;
    startSimulation();
  };

  // Reset positions to canonical seeds and reset pan & zoom
  const resetLayout = () => {
    const resetNodes = seedNodesForMode(graphData.nodes, layoutMode, springSpread);
    nodesRef.current = resetNodes;
    setSimNodes(resetNodes);
    alphaRef.current = 0.6;
    panRef.current = { x: 0, y: 0 };
    setPan({ x: 0, y: 0 });
    zoomRef.current = 1.0;
    setZoom(1.0);
    startSimulation();
  };

  // Unpin all nodes
  const unpinAllNodes = () => {
    for (const n of nodesRef.current) {
      n.fx = null;
      n.fy = null;
      n.isPinned = false;
    }
    setSimNodes([...nodesRef.current]);
    alphaRef.current = 0.7;
    startSimulation();
  };

  // Toggle pin on specific node
  const toggleNodePin = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = nodesRef.current.find(n => n.id === nodeId);
    if (!target) return;

    if (target.isPinned) {
      target.isPinned = false;
      target.fx = null;
      target.fy = null;
      alphaRef.current = 0.5;
      startSimulation();
    } else {
      target.isPinned = true;
      target.fx = target.x;
      target.fy = target.y;
    }
    setSimNodes([...nodesRef.current]);
  };

  // SVG coordinate transform helper with W3C CTM inversion and pan/zoom awareness
  const getSvgCoordinates = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: CENTER_X, y: CENTER_Y };

    try {
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const ctm = svg.getScreenCTM();
      if (ctm) {
        const transformed = pt.matrixTransform(ctm.inverse());
        return { x: transformed.x, y: transformed.y };
      }
    } catch {
      // Fallback
    }

    const rect = svg.getBoundingClientRect();
    const currentZoom = zoomRef.current || 1.0;
    const vbW = CANVAS_WIDTH / currentZoom;
    const vbH = CANVAS_HEIGHT / currentZoom;
    const vbX = (CANVAS_WIDTH - vbW) / 2 - (panRef.current.x || 0);
    const vbY = (CANVAS_HEIGHT - vbH) / 2 - (panRef.current.y || 0);
    const x = vbX + ((clientX - rect.left) / rect.width) * vbW;
    const y = vbY + ((clientY - rect.top) / rect.height) * vbH;
    return { x, y };
  };

  // Node Mouse Down handler
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const { x, y } = getSvgCoordinates(e.clientX, e.clientY);

    dragRef.current = {
      nodeId,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
    };

    const targetNode = nodesRef.current.find(n => n.id === nodeId);
    if (targetNode) {
      targetNode.fx = x;
      targetNode.fy = y;
    }

    setIsDragging(true);
    alphaRef.current = Math.max(alphaRef.current, 0.6);
    startSimulation();
  };

  // Canvas Mouse Down handler for click-and-drag panning across 2D plane
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;

    panDragRef.current = {
      isPanning: true,
      startX: e.clientX,
      startY: e.clientY,
      startPanX: panRef.current.x,
      startPanY: panRef.current.y,
    };
    setIsPanning(true);
  };

  // Wheel and trackpad gesture handler for smooth 2D navigation & pinch zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      const newZoom = Math.max(0.65, Math.min(1.75, Number((zoomRef.current * zoomFactor).toFixed(2))));
      zoomRef.current = newZoom;
      setZoom(newZoom);
    } else {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const currentZoom = zoomRef.current || 1.0;
      const vbW = CANVAS_WIDTH / currentZoom;
      const vbH = CANVAS_HEIGHT / currentZoom;
      const scaleX = vbW / rect.width;
      const scaleY = vbH / rect.height;

      const newPan = {
        x: panRef.current.x - e.deltaX * scaleX,
        y: panRef.current.y - e.deltaY * scaleY,
      };
      panRef.current = newPan;
      setPan(newPan);
    }
  };

  // Global mouse move and mouse up handlers for smooth dragging & canvas panning
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      // 1. Canvas Pan Dragging
      if (panDragRef.current.isPanning) {
        const svg = svgRef.current;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;

        const currentZoom = zoomRef.current || 1.0;
        const vbW = CANVAS_WIDTH / currentZoom;
        const vbH = CANVAS_HEIGHT / currentZoom;
        const scaleX = vbW / rect.width;
        const scaleY = vbH / rect.height;

        const deltaX = (e.clientX - panDragRef.current.startX) * scaleX;
        const deltaY = (e.clientY - panDragRef.current.startY) * scaleY;

        const newPan = {
          x: panDragRef.current.startPanX + deltaX,
          y: panDragRef.current.startPanY + deltaY,
        };
        panRef.current = newPan;
        setPan(newPan);
        return;
      }

      // 2. Node Dragging
      const { nodeId, startX, startY } = dragRef.current;
      if (!nodeId) return;

      const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
      if (dist > 3) {
        dragRef.current.moved = true;
      }

      const { x, y } = getSvgCoordinates(e.clientX, e.clientY);
      const targetNode = nodesRef.current.find(n => n.id === nodeId);
      if (targetNode) {
        targetNode.fx = Math.max(90, Math.min(CANVAS_WIDTH - 90, x));
        targetNode.fy = Math.max(30, Math.min(CANVAS_HEIGHT - 30, y));
        alphaRef.current = Math.max(alphaRef.current, 0.4);
      }
    };

    const handleGlobalMouseUp = () => {
      if (panDragRef.current.isPanning) {
        panDragRef.current.isPanning = false;
        setIsPanning(false);
      }

      const { nodeId, moved } = dragRef.current;
      if (nodeId) {
        if (!moved) {
          setSelectedNodeId(nodeId);
        } else {
          const targetNode = nodesRef.current.find(n => n.id === nodeId);
          if (targetNode) {
            targetNode.isPinned = true;
          }
        }
      }

      dragRef.current = { nodeId: null, startX: 0, startY: 0, moved: false };
      setIsDragging(false);
      setSimNodes([...nodesRef.current]);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const displayNodes = simNodes.length > 0 ? simNodes : seedNodesForMode(graphData.nodes, layoutMode, springSpread);
  const displayEdges = edgesRef.current.length > 0 ? edgesRef.current : graphData.edges;

  const activeNode: SimNode | undefined = 
    displayNodes.find(n => n.id === selectedNodeId) || displayNodes[0];

  const pinnedCount = displayNodes.filter(n => n.isPinned).length;

  const handleSelectDeal = (id: string) => {
    setSelectedDealId(id);
    panRef.current = { x: 0, y: 0 };
    setPan({ x: 0, y: 0 });
    if (onSelectPayoffId) {
      onSelectPayoffId(id);
    }
  };

  // Compute responsive dynamic viewBox based on Zoom and Pan
  const vbW = CANVAS_WIDTH / zoom;
  const vbH = CANVAS_HEIGHT / zoom;
  const vbX = (CANVAS_WIDTH - vbW) / 2 - pan.x;
  const vbY = (CANVAS_HEIGHT - vbH) / 2 - pan.y;
  const dynamicViewBox = `${vbX} ${vbY} ${vbW} ${vbH}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-[1440px] h-[92vh] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="spanner-graph-title"
      >
        {/* Primary Executive Header Bar (Swiss Technical Minimalism) */}
        <div className="px-6 py-3 bg-white border-b border-slate-200 flex items-center justify-between flex-shrink-0 gap-4">
          {/* Left: Brand Identity & Subtitle Hierarchy */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[#004724] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Database className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#006738]">
                  Cloud Spanner Graph
                </span>
                <span className="text-slate-300">&bull;</span>
                <span className="text-[11px] font-semibold text-slate-500">
                  ISO GQL Grounding Engine
                </span>
                <span className="text-slate-300">&bull;</span>
                <span className="text-[11px] text-slate-600 font-medium truncate">
                  {graphData.borrower_entity || graphData.deal_name}
                </span>
              </div>
              <h2 id="spanner-graph-title" className="text-base font-bold text-slate-900 tracking-tight truncate">
                Signal Grounding & Topology Engine
              </h2>
            </div>
          </div>

          {/* Right: Close Dialog */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer active:scale-[0.98]"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Consolidated Precision Control Ribbon (Single Clean Surface - Warm Chalk #F6F7F4) */}
        <div className="bg-[#F6F7F4] border-b border-slate-200/80 flex items-center flex-shrink-0">
          {/* Left: Over Graph Canvas Area (flex-1 border-r border-slate-200) */}
          <div className="flex-1 relative px-4 py-1.5 flex items-center justify-between border-r border-slate-200 min-h-[44px]">
            {/* Left: Clean Deal Switcher (Chips Removed - Pure Executive Names) */}
            <div className="flex items-center gap-1.5 shrink-0 z-10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Deal:</span>
              <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 shadow-xs text-xs">
                {DEALS.map((deal) => {
                  const isSelected = selectedDealId === deal.id;
                  return (
                    <button
                      key={deal.id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelectDeal(deal.id);
                      }}
                      title={`${deal.name} — ${deal.entity}`}
                      className={`px-1.5 py-0.5 rounded-md text-[10.5px] font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#004724] text-white shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {deal.short}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Centered Over Graph Area: Mode, Spacing, Zoom, Reset */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 shrink-0 z-10">
              {/* Layout Mode Segmented Control */}
              <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 shadow-xs text-xs">
                <button
                  type="button"
                  onClick={() => switchLayoutMode('flow')}
                  className={`px-2 py-0.5 rounded-md text-[10.5px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                    layoutMode === 'flow'
                      ? 'bg-[#004724] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Directional pipeline flow (Left to Right)"
                >
                  <GitFork className="w-3 h-3" />
                  <span>Pipeline</span>
                </button>
                <button
                  type="button"
                  onClick={() => switchLayoutMode('radial')}
                  className={`px-2 py-0.5 rounded-md text-[10.5px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                    layoutMode === 'radial'
                      ? 'bg-[#004724] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Organic radial clusters"
                >
                  <Layers className="w-3 h-3" />
                  <span>Radial</span>
                </button>
              </div>

              {/* Spacing / Spread Slider */}
              <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-xs text-xs">
                <SlidersHorizontal className="w-3 h-3 text-[#006738]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Spacing:</span>
                <input
                  type="range"
                  min="190"
                  max="380"
                  step="10"
                  value={springSpread}
                  onChange={(e) => handleSpreadChange(Number(e.target.value))}
                  className="w-12 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#004724]"
                  title={`Target Spring Distance: ${springSpread}px`}
                />
                <span className="tabular-nums font-bold text-slate-800 text-[10.5px] w-8 text-right">{springSpread}px</span>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-xs">
                <button
                  type="button"
                  onClick={() => setZoom(z => Math.max(0.65, Number((z - 0.15).toFixed(2))))}
                  className="p-0.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-1 text-[10.5px] font-bold tabular-nums text-slate-700 min-w-[32px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom(z => Math.min(1.75, Number((z + 0.15).toFixed(2))))}
                  className="p-0.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    zoomRef.current = 1.0;
                    setZoom(1.0);
                    panRef.current = { x: 0, y: 0 };
                    setPan({ x: 0, y: 0 });
                  }}
                  className="p-0.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition cursor-pointer ml-0.5"
                  title="Reset Zoom & Pan"
                >
                  <Maximize2 className="w-3 h-3" />
                </button>
              </div>

              {pinnedCount > 0 && (
                <button
                  type="button"
                  onClick={unpinAllNodes}
                  className="px-2 py-0.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10.5px] font-semibold flex items-center gap-1 transition border border-amber-200 shadow-xs cursor-pointer active:scale-[0.98] whitespace-nowrap shrink-0"
                  title="Release manually pinned positions"
                >
                  <PinOff className="w-3 h-3 text-amber-600 shrink-0" />
                  <span className="whitespace-nowrap">Unpin ({pinnedCount})</span>
                </button>
              )}

              <button
                type="button"
                onClick={resetLayout}
                className="px-2 py-0.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-[10.5px] font-semibold flex items-center gap-1 transition border border-slate-200 shadow-xs cursor-pointer active:scale-[0.98] whitespace-nowrap shrink-0"
                title="Reset springs to initial topological spread"
              >
                <RotateCcw className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="whitespace-nowrap">Reset</span>
              </button>
            </div>
          </div>

          {/* Right: Over Inspector Pane (w-[410px] flex-shrink-0) */}
          <div className="w-[300px] lg:w-[340px] xl:w-[410px] flex-shrink-0 px-5 py-2 flex items-center justify-between text-xs min-h-[44px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Verified Entity Attributes
            </span>
            <span className="text-[10px] font-semibold text-slate-400">
              Spanner ISO GQL
            </span>
          </div>
        </div>

        {/* Main Body: Graph Canvas (Left 68%) + Inspector Pane (Right 32%) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Canvas: SVG Visualizer */}
          <div className="flex-1 relative bg-[#FAFAFA] flex flex-col overflow-hidden border-r border-slate-200 select-none">
            {/* Interactive SVG Diagram with Spring-Directed Nodes & 2D Canvas Panning */}
            <div 
              className={`flex-1 overflow-auto p-4 flex items-center justify-center relative bg-[#FAFAFA] select-none ${
                isPanning || isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              onMouseDown={handleCanvasMouseDown}
              onWheel={handleWheel}
            >
              {/* The SVG scales via viewBox, so the width floor steps down on smaller
                  viewports. A fixed 900px floor plus the inspector pane overflowed a
                  1280x800 projector and clipped the graph with no way to scroll. */}
              <svg
                ref={svgRef}
                viewBox={dynamicViewBox}
                className={`w-full h-full max-h-[720px] select-none min-w-[560px] md:min-w-[680px] lg:min-w-[780px] xl:min-w-[900px] ${
                  isPanning || isDragging ? 'cursor-grabbing' : 'cursor-grab'
                }`}
                style={{ minHeight: '540px', touchAction: 'none' }}
                onMouseDown={handleCanvasMouseDown}
              >
                <defs>
                  <marker
                    id="arrow-primary"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto"
                  >
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748B" />
                  </marker>
                  <marker
                    id="arrow-signal"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto"
                  >
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#2563EB" />
                  </marker>
                  <marker
                    id="arrow-verdict"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto"
                  >
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#008559" />
                  </marker>
                  <marker
                    id="arrow-quarantined"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto"
                  >
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#DC2626" />
                  </marker>
                  <filter id="node-shadow" x="-10%" y="-10%" width="125%" height="125%">
                    <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.08" />
                  </filter>
                  <filter id="selected-shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="5" floodColor="#008559" floodOpacity="0.32" />
                  </filter>
                </defs>

                {/* Full-bleed transparent backdrop for seamless click-and-drag panning across canvas */}
                <rect
                  x={-CANVAS_WIDTH * 3}
                  y={-CANVAS_HEIGHT * 3}
                  width={CANVAS_WIDTH * 7}
                  height={CANVAS_HEIGHT * 7}
                  fill="transparent"
                  className={isPanning || isDragging ? 'cursor-grabbing' : 'cursor-grab'}
                />

                {/* Render Dynamic Edges following Simulated Node Coordinates with Exact Card Perimeter Intersections */}
                {displayEdges.map((edge) => {
                  const srcNode = displayNodes.find(n => n.id === edge.source);
                  const tgtNode = displayNodes.find(n => n.id === edge.target);
                  if (!srcNode || !tgtNode) return null;

                  const isQuarantined = edge.type === 'quarantined';
                  const isVerdict = edge.type === 'verdict';
                  const isSignal = edge.type === 'signal';

                  const strokeColor = isQuarantined 
                    ? '#DC2626' 
                    : isVerdict 
                      ? '#008559' 
                      : isSignal 
                        ? '#2563EB' 
                        : '#94A3B8';

                  const strokeWidth = isVerdict ? 2.5 : isSignal ? 2.0 : 1.5;
                  const markerId = isQuarantined 
                    ? 'url(#arrow-quarantined)' 
                    : isVerdict 
                      ? 'url(#arrow-verdict)' 
                      : isSignal 
                        ? 'url(#arrow-signal)' 
                        : 'url(#arrow-primary)';

                  const isEdgeConnectedToSelected = selectedNodeId && (edge.source === selectedNodeId || edge.target === selectedNodeId);

                  const srcW = srcNode.tier === 'verdict' ? 248 : 224;
                  const srcH = srcNode.tier === 'verdict' ? 68 : 58;
                  const tgtW = tgtNode.tier === 'verdict' ? 248 : 224;
                  const tgtH = tgtNode.tier === 'verdict' ? 68 : 58;

                  const start = getRectIntersection(tgtNode.x, tgtNode.y, srcNode.x, srcNode.y, srcW, srcH);
                  const end = getRectIntersection(srcNode.x, srcNode.y, tgtNode.x, tgtNode.y, tgtW, tgtH);

                  let pathD = '';
                  let labelX = (start.x + end.x) / 2;
                  let labelY = (start.y + end.y) / 2;

                  if (layoutMode === 'flow') {
                    const dx = end.x - start.x;
                    const curveWeight = Math.min(130, Math.max(35, Math.abs(dx) * 0.45));
                    const cx1 = start.x + curveWeight;
                    const cy1 = start.y;
                    const cx2 = end.x - curveWeight;
                    const cy2 = end.y;
                    pathD = `M ${start.x} ${start.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${end.x} ${end.y}`;
                    labelX = 0.125 * start.x + 0.375 * cx1 + 0.375 * cx2 + 0.125 * end.x;
                    labelY = 0.125 * start.y + 0.375 * cy1 + 0.375 * cy2 + 0.125 * end.y;
                  } else {
                    const midX = (start.x + end.x) / 2;
                    const midY = (start.y + end.y) / 2;
                    const dist = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2) || 1;
                    const bow = Math.min(26, dist * 0.09);
                    const perpX = (-(end.y - start.y) / dist) * bow;
                    const perpY = ((end.x - start.x) / dist) * bow;
                    const cx = midX + perpX;
                    const cy = midY + perpY;
                    pathD = `M ${start.x} ${start.y} Q ${cx} ${cy}, ${end.x} ${end.y}`;
                    labelX = 0.25 * start.x + 0.5 * cx + 0.25 * end.x;
                    labelY = 0.25 * start.y + 0.5 * cy + 0.25 * end.y;
                  }

                  const labelWidth = Math.max(56, edge.label.length * 6 + 18);

                  return (
                    <g key={edge.id} className="transition-opacity pointer-events-none">
                      {/* Smooth Bezier Curve Edge */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={isEdgeConnectedToSelected ? strokeWidth + 0.8 : strokeWidth}
                        strokeDasharray={isQuarantined ? '5 4' : undefined}
                        markerEnd={markerId}
                        opacity={isEdgeConnectedToSelected ? 1 : 0.84}
                      />
                      {/* Dynamic Edge Label Pill Badge */}
                      <g transform={`translate(${labelX}, ${labelY})`} className="pointer-events-none select-none">
                        <rect
                          x={-labelWidth / 2}
                          y="-9.5"
                          width={labelWidth}
                          height="19"
                          rx="4.5"
                          fill="#FFFFFF"
                          stroke={strokeColor}
                          strokeWidth="1"
                          opacity="0.98"
                        />
                        <text
                          x="0"
                          y="3.5"
                          textAnchor="middle"
                          fontSize="8"
                          fontWeight="700"
                          fill={strokeColor}
                          className="font-sans uppercase tracking-wider select-none pointer-events-none"
                        >
                          {edge.label}
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* Render Spring Nodes with Drag and Pin Handles */}
                {displayNodes.map((node) => {
                  const isSelected = selectedNodeId === node.id;
                  const isQuarantined = node.status === 'quarantined';
                  const isVerdict = node.tier === 'verdict';
                  const isSignal = node.tier === 'signal';
                  const isNodeBeingDragged = dragRef.current.nodeId === node.id;

                  const nodeWidth = isVerdict ? 248 : 224;
                  const nodeHeight = isVerdict ? 68 : 58;
                  const halfW = nodeWidth / 2;
                  const halfH = nodeHeight / 2;

                  const rectFill = isVerdict 
                    ? '#F0FDF4' 
                    : isQuarantined 
                      ? '#FEF2F2' 
                      : isSignal 
                        ? '#EFF6FF' 
                        : '#FFFFFF';

                  const rectStroke = isSelected
                    ? '#008559'
                    : isQuarantined
                      ? '#DC2626'
                      : isVerdict
                        ? '#008559'
                        : isSignal
                          ? '#3B82F6'
                          : '#CBD5E1';

                  const strokeWidth = isSelected ? 2.5 : isVerdict ? 2 : 1.2;

                  const badgeFill = isQuarantined 
                    ? '#DC2626' 
                    : isVerdict 
                      ? '#008559' 
                      : isSignal 
                        ? '#2563EB' 
                        : '#475569';

                  const badgeWidth = Math.max(52, node.badge.length * 6.2 + 14);

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                      className={`transition-shadow ${isNodeBeingDragged ? 'cursor-grabbing' : 'cursor-grab'}`}
                      filter={isSelected ? 'url(#selected-shadow)' : 'url(#node-shadow)'}
                    >
                      {/* Node Card Background */}
                      <rect
                        x={-halfW}
                        y={-halfH}
                        width={nodeWidth}
                        height={nodeHeight}
                        rx="7"
                        fill={rectFill}
                        stroke={rectStroke}
                        strokeWidth={strokeWidth}
                        strokeDasharray={isQuarantined ? '4 3' : undefined}
                      />

                      {/* Top Category Badge */}
                      <rect
                        x={-halfW + 8}
                        y={-halfH + 7}
                        width={badgeWidth}
                        height="14"
                        rx="3"
                        fill={badgeFill}
                      />
                      <text
                        x={-halfW + 8 + badgeWidth / 2}
                        y={-halfH + 17.5}
                        textAnchor="middle"
                        fontSize="8"
                        fontWeight="700"
                        fill="#FFFFFF"
                        className="font-sans tracking-wider uppercase select-none pointer-events-none"
                      >
                        {node.badge}
                      </text>

                      {/* Right Pin / Status Indicator */}
                      <g 
                        transform={`translate(${halfW - 14}, ${-halfH + 14})`}
                        onClick={(e) => toggleNodePin(node.id, e)}
                        className="cursor-pointer"
                      >
                        <title>{node.isPinned ? 'Node pinned in place (click to release)' : 'Click to pin node'}</title>
                        {node.isPinned ? (
                          <circle cx="0" cy="0" r="4.5" fill="#D97706" />
                        ) : isQuarantined ? (
                          <circle cx="0" cy="0" r="3.5" fill="#DC2626" />
                        ) : isVerdict ? (
                          <circle cx="0" cy="0" r="3.5" fill="#008559" />
                        ) : (
                          <circle cx="0" cy="0" r="2.5" fill="#94A3B8" />
                        )}
                      </g>

                      {/* Main Node Label Text (Adaptive 1-line or 2-line, Zero Truncation) */}
                      {(() => {
                        const lines = splitLabel(node.label, isVerdict ? 28 : 25);
                        if (lines.length > 1) {
                          return (
                            <>
                              <text
                                x={-halfW + 8}
                                y={-halfH + 29}
                                fontSize={isVerdict ? '11' : '10.5'}
                                fontWeight="700"
                                fill={isQuarantined ? '#991B1B' : '#0F172A'}
                                className="font-sans select-none pointer-events-none"
                              >
                                {lines[0]}
                              </text>
                              <text
                                x={-halfW + 8}
                                y={-halfH + 41}
                                fontSize={isVerdict ? '11' : '10.5'}
                                fontWeight="700"
                                fill={isQuarantined ? '#991B1B' : '#0F172A'}
                                className="font-sans select-none pointer-events-none"
                              >
                                {lines[1]}
                              </text>
                              {node.subtitle && (
                                <text
                                  x={-halfW + 8}
                                  y={isVerdict ? -halfH + 55 : -halfH + 52}
                                  fontSize="9"
                                  fontWeight="500"
                                  fill={isQuarantined ? '#B91C1C' : '#64748B'}
                                  className="font-sans select-none pointer-events-none"
                                >
                                  {node.subtitle}
                                </text>
                              )}
                            </>
                          );
                        }
                        return (
                          <>
                            <text
                              x={-halfW + 8}
                              y={-halfH + 32}
                              fontSize={isVerdict ? '11.5' : '11'}
                              fontWeight="700"
                              fill={isQuarantined ? '#991B1B' : '#0F172A'}
                              className="font-sans select-none pointer-events-none"
                            >
                              {node.label}
                            </text>
                            {node.subtitle && (
                              <text
                                x={-halfW + 8}
                                y={-halfH + 46}
                                fontSize="9.5"
                                fontWeight="500"
                                fill={isQuarantined ? '#B91C1C' : '#64748B'}
                                className="font-sans select-none pointer-events-none"
                              >
                                {node.subtitle}
                              </text>
                            )}
                          </>
                        );
                      })()}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Bottom Canvas Legend */}
            <div className="px-6 py-2.5 bg-white border-t border-slate-200 flex items-center text-xs text-slate-600 flex-shrink-0">
              <div className="flex items-center space-x-6 whitespace-nowrap">
                <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Legend:</span>
                <span className="flex items-center space-x-1.5 whitespace-nowrap">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block shrink-0" />
                  <span>Core & Entities</span>
                </span>
                <span className="flex items-center space-x-1.5 whitespace-nowrap">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block shrink-0" />
                  <span>Behavioral Signals</span>
                </span>
                <span className="flex items-center space-x-1.5 whitespace-nowrap">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block shrink-0" />
                  <span>GLBA Quarantined</span>
                </span>
                <span className="flex items-center space-x-1.5 whitespace-nowrap">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#008559] inline-block shrink-0" />
                  <span>Classification Verdict</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Inspector Pane (32%) */}
          <div className="w-[300px] lg:w-[340px] xl:w-[410px] flex-shrink-0 bg-white flex flex-col overflow-y-auto border-l border-slate-200">
            {activeNode ? (
              <div className="p-5 flex flex-col space-y-5">
                {/* Node Identity Card */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase ${
                      activeNode.status === 'quarantined'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : activeNode.tier === 'verdict'
                          ? 'bg-[#008559]/10 text-[#008559] border border-[#008559]/20'
                          : activeNode.tier === 'signal'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {activeNode.badge}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      {activeNode.isPinned && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                          PINNED
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 uppercase font-semibold">
                        Tier: {activeNode.tier}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-2 tracking-tight">
                    {activeNode.label}
                  </h3>
                  {activeNode.subtitle && (
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      {activeNode.subtitle}
                    </p>
                  )}
                </div>

                {/* Quarantined Compliance Warning */}
                {activeNode.status === 'quarantined' && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 space-y-1.5">
                    <div className="flex items-center space-x-1.5 font-bold text-red-900">
                      <Lock className="w-3.5 h-3.5 text-red-600" />
                      <span>GLBA & FCRA Firewall Active</span>
                    </div>
                    <p className="leading-relaxed text-[11px]">
                      Nonpublic Personal Information (NPI) of non-guarantor beneficial owners is firewalled from retail wealth systems until affirmative verbal opt-in consent is documented.
                    </p>
                  </div>
                )}

                {/* Agent Relevance Box */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <Cpu className="w-3.5 h-3.5 text-[#008559]" />
                    <span>Agent Grounding Relevance</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {activeNode.agent_relevance}
                  </p>
                </div>

                {/* Properties Table */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                    Node Attributes & Verified Records
                  </h4>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <tbody className="divide-y divide-slate-100">
                        {Object.entries(activeNode.properties).map(([key, value]) => (
                          <tr key={key} className="hover:bg-slate-50/50">
                            <td className="px-3 py-2 text-slate-500 font-medium bg-slate-50/40 w-2/5">
                              {key}
                            </td>
                            <td className="px-3 py-2 text-slate-900 font-semibold w-3/5 break-words tabular-nums">
                              {value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Live Spanner ISO GQL Query - Swiss Sans-Serif Container */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                      <Code className="w-3.5 h-3.5 text-[#008559]" />
                      <span>Executed Spanner ISO GQL</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold tabular-nums">
                        {graphData.spanner_stats.query_latency_ms}ms
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-medium tabular-nums">
                        {graphData.spanner_stats.nodes_matched} nodes • {graphData.spanner_stats.edges_traversed} edges
                      </span>
                    </div>
                  </div>
                  <div className="p-3.5 bg-[#F8F9FA] rounded-xl border border-slate-200/90 text-xs font-sans space-y-1 shadow-sm">
                    {formatGqlClause(graphData.spanner_stats.gql_query || 'GRAPH HuntingtonCommercialGraph\nMATCH (n)\nRETURN n')}
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 font-medium px-1">
                    <span>Engine: {graphData.spanner_stats.engine}</span>
                    <span>Instance: {graphData.spanner_stats.instance}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs my-auto">
                Select a node to inspect verified attributes.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
