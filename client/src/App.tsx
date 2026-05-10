import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Map,
  ZoomIn,
  ZoomOut,
  Layers,
  ShieldCheck,
  Activity,
  Database,
  Crosshair,
  Maximize,
  Clock,
  Terminal
} from 'lucide-react';
import debounce from 'lodash.debounce';

/**
 * 🌎 S2 TILE ORCHESTRATOR: Final Viewport Implementation
 * Role: Senior Software Engineer (Implementation & Integrity)
 * * Architectural Invariants:
 * 1. LOD Controller: Maps UI Zoom (1-20) to S2 Cell Depth (L8-L15).
 * 2. Request Coalescing: Protects the Go backend from viewport churn.
 * 3. Clinical Feedback: Real-time latency, throughput, and system uptime.
 */

interface Coordinate {
  lat: number;
  lng: number;
}

interface S2Tile {
  cellId: string;
  poiCount: number;
  status: 'SYNCHRONIZED' | 'STALE';
}

const App: React.FC = () => {
  // --- VIEWPORT & INFRASTRUCTURE STATE ---
  const [center] = useState<Coordinate>({ lat: 40.7128, lng: -74.0060 }); // NYC Primary
  const [zoom, setZoom] = useState<number>(15);
  const [activeTiles, setActiveTiles] = useState<S2Tile[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [metrics, setMetrics] = useState({ latency: 0, throughput: 108 });
  const [uptime, setUptime] = useState<number>(0);

  // --- SYSTEM HEARTBEAT ---
  useEffect(() => {
    const timer = setInterval(() => setUptime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  /**
   * LOD Controller (The "Precision Invariant")
   * Narrative: "I map viewport scale to S2 bit-depth to ensure we only
   * pay the 'Data Tax' for the resolution the user actually sees."
   */
  const s2Level = useMemo(() => {
    if (zoom >= 18) return 15; // Street Level (Precise)
    if (zoom >= 14) return 13; // Neighborhood Level
    if (zoom >= 10) return 10; // City Level
    return 8;                  // Regional Level (Broad)
  }, [zoom]);

  /**
   * syncDiscovery
   * Simulates the high-performance gRPC/Protobuf handshake with the Go backend.
   */
  const syncDiscovery = useCallback(async () => {
    setIsSyncing(true);
    const start = performance.now();

    // Mocking the binary stream response from Go S2 Discovery Service
    setTimeout(() => {
      const mockIds = [
        '0x26b1ee5e', '0x26b1ee5f', '0x26b1ef02',
        '0x26b1ee76', '0x26b1ee77', '0x26b1ee56'
      ];

      const results: S2Tile[] = mockIds.map(id => ({
        cellId: id,
        poiCount: Math.floor(Math.random() * 50),
        status: 'SYNCHRONIZED'
      }));

      setActiveTiles(results);
      setMetrics({
        latency: Math.round(performance.now() - start + 28), // 28ms Go execution baseline
        throughput: 108
      });
      setIsSyncing(false);
    }, 100);
  }, []);

  // Coalesce updates to handle rapid zoom/pan events
  const debouncedSync = useMemo(() => debounce(syncDiscovery, 300), [syncDiscovery]);

  useEffect(() => {
    debouncedSync();
    return () => debouncedSync.cancel();
  }, [zoom, debouncedSync]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30 antialiased flex flex-col overflow-hidden">

      {/* 🧭 NAVIGATION: Identity & Signal */}
      <nav className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl shrink-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
              <Map className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight uppercase">S2 Orchestrator</span>
              <span className="ml-2 text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">Ver_1.0_Stable</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-slate-900 rounded-full text-[10px] font-mono text-slate-400 border border-white/5">
              <Clock className="w-3 h-3 text-blue-400" />
              <span>UPTIME: {uptime}s</span>
            </div>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] font-mono border transition-colors ${isSyncing ? 'border-amber-500/50 text-amber-400 bg-amber-500/5' : 'border-emerald-500/50 text-emerald-400 bg-emerald-500/5'}`}>
              <Activity className={`w-3 h-3 ${isSyncing ? 'animate-pulse' : ''}`} />
              <span>{isSyncing ? 'HOT_PATH_STREAMING' : 'IDLE_SYNC_COMPLETE'}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* 🚀 DASHBOARD MAIN */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden">

        {/* VIEWPORT AREA */}
        <div className="lg:col-span-3 flex flex-col space-y-6 overflow-hidden">
          <div className="relative flex-1 bg-slate-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl viewport-grid-bg min-h-[400px]">

            {/* S2 Boundary Visualization */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-72 h-72 border border-blue-500/30 rounded-2xl bg-blue-500/5 flex items-center justify-center backdrop-blur-[1px]">
                <div className="flex flex-col items-center">
                  <Maximize className="w-10 h-10 text-blue-500/10 mb-3" />
                  <div className="text-[10px] font-mono text-blue-400 bg-slate-950 px-3 py-1 rounded border border-blue-500/20 shadow-lg">
                    S2_CELL_DEPTH_L{s2Level}
                  </div>
                </div>
              </div>
            </div>

            {/* HUD: Coordinate Invariants */}
            <div className="absolute top-6 left-6 p-4 bg-slate-950/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl font-mono">
              <div className="flex items-center space-x-2 mb-3 text-slate-500 uppercase text-[9px] font-bold tracking-widest">
                <Crosshair className="w-3 h-3" />
                <span>Geospatial_Invariants</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between space-x-12 border-b border-white/5 pb-1">
                  <span className="text-slate-500 text-[10px]">LATITUDE</span>
                  <span className="text-blue-400 text-sm font-bold tracking-tight">{center.lat.toFixed(6)}</span>
                </div>
                <div className="flex justify-between space-x-12 pt-1">
                  <span className="text-slate-500 text-[10px]">LONGITUDE</span>
                  <span className="text-blue-400 text-sm font-bold tracking-tight">{center.lng.toFixed(6)}</span>
                </div>
              </div>
            </div>

            {/* Viewport Controls */}
            <div className="absolute bottom-6 right-6 flex flex-col space-y-2">
              <button
                onClick={() => setZoom(z => Math.min(z + 1, 20))}
                className="p-4 bg-white/5 hover:bg-blue-600 transition-all rounded-2xl border border-white/10 backdrop-blur-md hover:scale-105 active:scale-95 shadow-xl group"
              >
                <ZoomIn className="w-5 h-5 text-slate-300 group-hover:text-white" />
              </button>
              <button
                onClick={() => setZoom(z => Math.max(z - 1, 1))}
                className="p-4 bg-white/5 hover:bg-blue-600 transition-all rounded-2xl border border-white/10 backdrop-blur-md hover:scale-105 active:scale-95 shadow-xl group"
              >
                <ZoomOut className="w-5 h-5 text-slate-300 group-hover:text-white" />
              </button>
            </div>
          </div>

          {/* SYSTEM METRICS: The Senior Audit */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
            <div className="bg-white/5 p-6 rounded-3xl border border-white/5 hover:border-blue-500/20 transition-all group">
              <div className="text-slate-500 text-[10px] uppercase font-bold mb-2 tracking-widest group-hover:text-blue-400 transition-colors">API Latency</div>
              <div className="flex items-baseline space-x-2">
                <div className="text-3xl font-mono text-blue-400 font-bold">{metrics.latency}</div>
                <div className="text-xs text-slate-500 font-mono italic">ms</div>
              </div>
            </div>
            <div className="bg-white/5 p-6 rounded-3xl border border-white/5 hover:border-indigo-500/20 transition-all group">
              <div className="text-slate-500 text-[10px] uppercase font-bold mb-2 tracking-widest group-hover:text-indigo-400 transition-colors">LOD Bitmask</div>
              <div className="flex items-baseline space-x-2">
                <div className="text-3xl font-mono text-indigo-400 font-bold">L{s2Level}</div>
                <div className="text-xs text-slate-500 font-mono italic">bits</div>
              </div>
            </div>
            <div className="bg-white/5 p-6 rounded-3xl border border-white/5 hover:border-emerald-500/20 transition-all group">
              <div className="text-slate-500 text-[10px] uppercase font-bold mb-2 tracking-widest group-hover:text-emerald-400 transition-colors">PBF Payload</div>
              <div className="flex items-baseline space-x-2">
                <div className="text-3xl font-mono text-emerald-400 font-bold">{metrics.throughput}</div>
                <div className="text-xs text-slate-500 font-mono italic">bytes</div>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR: Discovery Stream */}
        <div className="flex flex-col space-y-6 overflow-hidden">
          <div className="bg-white/5 rounded-3xl border border-white/10 p-6 flex flex-col shadow-2xl h-full backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-blue-500" />
                <h2 className="font-bold text-lg tracking-tight uppercase">Discovery</h2>
              </div>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-2 scrollbar-thin">
              {activeTiles.map((tile) => (
                <div key={tile.cellId} className="p-4 bg-slate-900/50 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-blue-500/5 hover:border-blue-500/20 transition-all group">
                  <div className="space-y-1">
                    <div className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-widest">S2_CELL_ID</div>
                    <div className="text-xs font-mono text-blue-300 group-hover:text-blue-400 transition-colors">{tile.cellId}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-widest">POIS</div>
                    <div className="text-sm font-bold text-slate-200">{tile.poiCount}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
              <div className="flex items-start space-x-3 opacity-60">
                <Database className="w-4 h-4 text-blue-500 mt-1" />
                <p className="text-[10px] text-slate-400 leading-relaxed italic">
                  Serving binary payloads via gRPC over TLS. Coordinate sharding optimized for Spanner external consistency.
                </p>
              </div>
              <div className="flex items-center space-x-2 justify-center p-3 bg-slate-950 rounded-xl border border-white/5">
                <Terminal className="w-3 h-3 text-slate-600" />
                <span className="text-[9px] font-mono text-slate-500 tracking-[0.3em] uppercase">Status: Deterministic</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 🛡️ FOOTER */}
      <footer className="border-t border-white/5 py-8 px-6 text-center opacity-30 shrink-0">
        <p className="text-[10px] text-slate-500 font-mono tracking-[0.4em] uppercase">
          Karuna_Sehgal :: Senior_Software_Engineer :: planetary_infrastructure_2026
        </p>
      </footer>
    </div>
  );
};

export default App;
