import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  Database, 
  Cpu, 
  Lock, 
  Code, 
  RefreshCw, 
  RotateCcw, 
  Move, 
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
  { id: 'PO-2026-8821', name: 'Marcus Vance', entity: 'Vance Riverfront Properties IV, LLC', type: 'Taxable Cash-Out', conf: 94 },
  { id: 'PO-2026-7492', name: 'Arthur Pendelton', entity: 'Buckeye Precision Tooling Corp.', type: '1031 Exchange', conf: 88 },
  { id: 'PO-2026-6104', name: 'Dr. Robert Miller', entity: 'Columbus Medical Arts Center LLC', type: 'Loan Refinance', conf: 58 }
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
  const [isSimActive, setIsSimActive] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const nodesRef = useRef<SimNode[]>(seedNodesForMode(graphData.nodes, 'flow', 270));
  const edgesRef = useRef<SpannerGraphEdge[]>(graphData.edges);
  const alphaRef = useRef<number>(1.0);
  const animFrameRef = useRef<number | null>(null);
  const layoutModeRef = useRef<'flow' | 'radial'>('flow');
  const springSpreadRef = useRef<number>(270);
  const dragRef = useRef<{
    nodeId: string | null;
    startX: number;
    startY: number;
    moved: boolean;
  }>({ nodeId: null, startX: 0, startY: 0, moved: false });

  // Keep refs updated
  layoutModeRef.current = layoutMode;
  springSpreadRef.current = springSpread;

  // Sync selectedDealId with prop changes
  useEffect(() => {
    if (activePayoffId && activePayoffId !== selectedDealId) {
      setSelectedDealId(activePayoffId);
    }
  }, [activePayoffId]);

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
        const halfW1 = n1.tier === 'verdict' ? 98 : 86;
        const halfH1 = n1.tier === 'verdict' ? 27 : 24;
        const halfW2 = n2.tier === 'verdict' ? 98 : 86;
        const halfH2 = n2.tier === 'verdict' ? 27 : 24;
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

        const halfW = n.tier === 'verdict' ? 98 : 86;
        const halfH = n.tier === 'verdict' ? 27 : 24;
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

    setIsSimActive(true);

    const tick = () => {
      const active = runSimulationStep();
      setSimNodes([...nodesRef.current]);

      if (active) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        setIsSimActive(false);
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

  // Reheat physics simulation
  const reheatSimulation = () => {
    alphaRef.current = 0.85;
    for (const n of nodesRef.current) {
      if (!n.isPinned) {
        n.vx += (Math.random() - 0.5) * 6;
        n.vy += (Math.random() - 0.5) * 6;
      }
    }
    startSimulation();
  };

  // Reset positions to canonical seeds
  const resetLayout = () => {
    const resetNodes = seedNodesForMode(graphData.nodes, layoutMode, springSpread);
    nodesRef.current = resetNodes;
    setSimNodes(resetNodes);
    alphaRef.current = 0.6;
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

  // SVG coordinate transform helper with W3C CTM inversion
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
    const x = ((clientX - rect.left) / rect.width) * CANVAS_WIDTH;
    const y = ((clientY - rect.top) / rect.height) * CANVAS_HEIGHT;
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

  // Global mouse move and mouse up handlers for smooth dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
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
    if (onSelectPayoffId) {
      onSelectPayoffId(id);
    }
  };

  // Compute responsive dynamic viewBox based on Zoom
  const vbW = CANVAS_WIDTH / zoom;
  const vbH = CANVAS_HEIGHT / zoom;
  const vbX = (CANVAS_WIDTH - vbW) / 2;
  const vbY = (CANVAS_HEIGHT - vbH) / 2;
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
        <div className="px-6 py-2 bg-[#F6F7F4] border-b border-slate-200/80 flex items-center justify-between flex-shrink-0 gap-3 overflow-x-auto">
          {/* Left: Clean Deal Switcher (Chips Removed - Pure Executive Names) */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Deal:</span>
            <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 shadow-xs text-xs">
              {DEALS.map((deal) => {
                const isSelected = selectedDealId === deal.id;
                return (
                  <button
                    key={deal.id}
                    onClick={() => handleSelectDeal(deal.id)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#004724] text-white shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {deal.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Center: Topology Mode Switcher & Dynamic Spread Slider */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Layout Mode Segmented Control */}
            <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 shadow-xs text-xs">
              <button
                type="button"
                onClick={() => switchLayoutMode('flow')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
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
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
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
            <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#006738]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Spacing:</span>
              <input
                type="range"
                min="190"
                max="380"
                step="10"
                value={springSpread}
                onChange={(e) => handleSpreadChange(Number(e.target.value))}
                className="w-20 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#004724]"
                title={`Target Spring Distance: ${springSpread}px`}
              />
              <span className="tabular-nums font-bold text-slate-800 text-[11px] w-9 text-right">{springSpread}px</span>
            </div>
          </div>

          {/* Right: Exactly Matching Image 2 (Simulation State, Zoom, Reheat, Reset) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Simulation Status Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-xs text-[11px] font-semibold text-slate-600">
              <span className={`w-2 h-2 rounded-full ${isSimActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {isSimActive ? 'Simulating' : 'Equilibrium'}
              </span>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-xs">
              <button
                type="button"
                onClick={() => setZoom(z => Math.max(0.65, Number((z - 0.15).toFixed(2))))}
                className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1 text-[11px] font-bold tabular-nums text-slate-700 min-w-[36px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom(z => Math.min(1.75, Number((z + 0.15).toFixed(2))))}
                className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(1.0)}
                className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition cursor-pointer ml-0.5"
                title="Reset Zoom"
              >
                <Maximize2 className="w-3 h-3" />
              </button>
            </div>

            {pinnedCount > 0 && (
              <button
                type="button"
                onClick={unpinAllNodes}
                className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-semibold flex items-center gap-1.5 transition border border-amber-200 shadow-xs cursor-pointer active:scale-[0.98]"
                title="Release manually pinned positions"
              >
                <PinOff className="w-3 h-3 text-amber-600" />
                <span>Unpin ({pinnedCount})</span>
              </button>
            )}

            <button
              type="button"
              onClick={reheatSimulation}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold flex items-center gap-1.5 transition border border-slate-200 shadow-xs cursor-pointer active:scale-[0.98]"
              title="Reheat spring simulation to relax forces"
            >
              <RefreshCw className={`w-3 h-3 text-[#006738] ${isSimActive ? 'animate-spin' : ''}`} />
              <span>Reheat</span>
            </button>

            <button
              type="button"
              onClick={resetLayout}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold flex items-center gap-1.5 transition border border-slate-200 shadow-xs cursor-pointer active:scale-[0.98]"
              title="Reset springs to initial topological spread"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Main Body: Graph Canvas (Left 68%) + Inspector Pane (Right 32%) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Canvas: SVG Visualizer */}
          <div className="flex-1 relative bg-[#FAFAFA] flex flex-col overflow-hidden border-r border-slate-200">
            {/* Interactive SVG Diagram with Spring-Directed Nodes */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center relative bg-[#FAFAFA]">
              <svg
                ref={svgRef}
                viewBox={dynamicViewBox}
                className={`w-full h-full max-h-[720px] select-none ${isDragging ? 'cursor-grabbing' : 'cursor-default'}`}
                style={{ minWidth: '900px', minHeight: '540px' }}
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

                  const strokeWidth = isVerdict ? 2.4 : isSignal ? 1.9 : 1.4;
                  const markerId = isQuarantined 
                    ? 'url(#arrow-quarantined)' 
                    : isVerdict 
                      ? 'url(#arrow-verdict)' 
                      : isSignal 
                        ? 'url(#arrow-signal)' 
                        : 'url(#arrow-primary)';

                  const srcW = srcNode.tier === 'verdict' ? 196 : 172;
                  const srcH = srcNode.tier === 'verdict' ? 54 : 48;
                  const tgtW = tgtNode.tier === 'verdict' ? 196 : 172;
                  const tgtH = tgtNode.tier === 'verdict' ? 54 : 48;

                  const start = getRectIntersection(tgtNode.x, tgtNode.y, srcNode.x, srcNode.y, srcW, srcH);
                  const end = getRectIntersection(srcNode.x, srcNode.y, tgtNode.x, tgtNode.y, tgtW, tgtH);

                  const midX = (start.x + end.x) / 2;
                  const midY = (start.y + end.y) / 2;
                  const labelWidth = Math.max(52, edge.label.length * 5.5 + 16);

                  return (
                    <g key={edge.id} className="transition-opacity">
                      {/* Spring Edge Line */}
                      <line
                        x1={start.x}
                        y1={start.y}
                        x2={end.x}
                        y2={end.y}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeDasharray={isQuarantined ? '4 3' : undefined}
                        markerEnd={markerId}
                        opacity={0.88}
                      />
                      {/* Dynamic Edge Label Pill Badge */}
                      <g transform={`translate(${midX}, ${midY})`}>
                        <rect
                          x={-labelWidth / 2}
                          y="-8.5"
                          width={labelWidth}
                          height="17"
                          rx="3.5"
                          fill="#FFFFFF"
                          stroke={strokeColor}
                          strokeWidth="0.85"
                          opacity="0.96"
                        />
                        <text
                          x="0"
                          y="3.5"
                          textAnchor="middle"
                          fontSize="7.5"
                          fontWeight="700"
                          fill={strokeColor}
                          className="font-sans uppercase tracking-tight select-none pointer-events-none"
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

                  const nodeWidth = isVerdict ? 196 : 172;
                  const nodeHeight = isVerdict ? 54 : 48;
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

                  const badgeWidth = Math.max(50, node.badge.length * 5.6 + 12);

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
                        rx="6"
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
                        height="13"
                        rx="2.5"
                        fill={badgeFill}
                      />
                      <text
                        x={-halfW + 8 + badgeWidth / 2}
                        y={-halfH + 16.5}
                        textAnchor="middle"
                        fontSize="7.5"
                        fontWeight="700"
                        fill="#FFFFFF"
                        className="font-sans tracking-wider uppercase select-none pointer-events-none"
                      >
                        {node.badge}
                      </text>

                      {/* Right Pin / Status Indicator */}
                      <g 
                        transform={`translate(${halfW - 14}, ${-halfH + 13})`}
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

                      {/* Main Node Label Text */}
                      <text
                        x={-halfW + 8}
                        y={-halfH + 31}
                        fontSize={isVerdict ? '10.5' : '10'}
                        fontWeight="700"
                        fill={isQuarantined ? '#991B1B' : '#0F172A'}
                        className="font-sans select-none pointer-events-none"
                      >
                        {node.label.length > 25 ? node.label.substring(0, 24) + '..' : node.label}
                      </text>

                      {/* Node Subtitle */}
                      {node.subtitle && (
                        <text
                          x={-halfW + 8}
                          y={-halfH + 42}
                          fontSize="8.5"
                          fontWeight="500"
                          fill={isQuarantined ? '#B91C1C' : '#64748B'}
                          className="font-sans select-none pointer-events-none"
                        >
                          {node.subtitle.length > 28 ? node.subtitle.substring(0, 27) + '..' : node.subtitle}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Bottom Canvas Legend */}
            <div className="px-6 py-2.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 flex-shrink-0">
              <div className="flex items-center space-x-5">
                <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Legend:</span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" />
                  <span>Core & Entities</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                  <span>Behavioral Signals</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
                  <span>GLBA Quarantined</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#008559] inline-block" />
                  <span>Classification Verdict</span>
                </span>
              </div>
              <div className="text-slate-500 text-[11px] font-medium flex items-center space-x-1.5">
                <Move className="w-3 h-3 text-[#008559]" />
                <span>Adjust Spacing slider or drag nodes to shape topology &bull; Zero-overlap collision active</span>
              </div>
            </div>
          </div>

          {/* Right Inspector Pane (32%) */}
          <div className="w-[410px] flex-shrink-0 bg-white flex flex-col overflow-y-auto border-l border-slate-200">
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

                {/* Live Spanner ISO GQL Query */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <Code className="w-3.5 h-3.5 text-slate-600" />
                      <span>Executed Spanner ISO GQL</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">Cloud Spanner Graph</span>
                  </div>
                  <pre className="p-3 bg-slate-950 text-emerald-400 rounded-lg text-[11px] font-mono leading-relaxed overflow-x-auto border border-slate-800">
                    {graphData.spanner_stats.gql_query || 'GRAPH HuntingtonCommercialGraph MATCH ...'}
                  </pre>
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
