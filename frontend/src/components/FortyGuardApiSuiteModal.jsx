import React, { useState, useEffect } from 'react';
import { Sparkles, Terminal, Activity, Satellite, Eye, Flame, Map, CheckCircle2, ShieldCheck, RefreshCw, Cpu, Layers, DollarSign, Database, X, Wind, ThermometerSnowflake } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function FortyGuardApiSuiteModal({
  isOpen = true,
  onClose,
  currentLat = 40.7061,
  currentLng = -74.0092,
  theme = 'dark',
}) {
  const isLight = theme === 'light';
  // Active API Tab: 'heat_intelligence' | 'env_params' | 'heatmap' | 'satellite' | 'streetview' | 'credits'
  const [activeTab, setActiveTab] = useState('heat_intelligence');
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [creditsInfo, setCreditsInfo] = useState(null);

  const endpoints = [
    { id: 'heat_intelligence', name: 'Heat Intelligence', method: 'POST', path: '/v1/heat_intelligence', icon: Flame, badge: 'Canyon Heat Retention', hvacRole: 'Predicts how evening street-level heat traps impact building thermal mass' },
    { id: 'env_params', name: 'Environmental Parameters', method: 'POST', path: '/v1/env_params', icon: Activity, badge: 'Enthalpy & Wet-Bulb', hvacRole: 'Calculates psychrometric specific enthalpy (h) to trigger 100% free-air cooling' },
    { id: 'heatmap', name: 'Create Heatmap (2m)', method: 'POST', path: '/v1/heatmap', icon: Map, badge: 'Rooftop UHI Hotspots', hvacRole: 'Evaluates rooftop asphalt heat plumes to adjust chiller condenser COP efficiency' },
    { id: 'streetview', name: 'Street View Segmentation', method: 'POST', path: '/v1/streetview', icon: Eye, badge: 'Façade Solar Shading', hvacRole: 'Measures vertical solar irradiation & canyon airflow for zone-by-zone VAV balancing' },
    { id: 'satellite', name: 'Satellite View Segmentation', method: 'POST', path: '/v1/satellite', icon: Satellite, badge: 'Surface Albedo & Pavement', hvacRole: 'Calculates ground reflectivity and thermal soak near fresh air intake louvers' },
    { id: 'credits', name: 'API Credits & Quota', method: 'GET', path: '/v1/credits', icon: Database, badge: 'SLA & Metering', hvacRole: 'Live quota tracking and API health monitor for continuous BMS integration' },
  ];

  const currentEndpoint = endpoints.find(e => e.id === activeTab) || endpoints[0];

  // Fetch Credits on open
  useEffect(() => {
    if (isOpen) {
      executeEndpoint(activeTab);
      fetchCredits();
    }
  }, [isOpen, activeTab]);

  const fetchCredits = async () => {
    try {
      const res = await fetch(`${API_BASE}/fortyguard/credits`);
      const data = await res.json();
      setCreditsInfo(data);
    } catch (e) {
      console.error(e);
    }
  };

  const executeEndpoint = async (endpointId) => {
    setLoading(true);
    setApiResponse(null);

    const payload = {
      latitude: currentLat,
      longitude: currentLng,
      temperature: 34.5,
    };

    let url = `${API_BASE}/fortyguard/`;
    let method = 'POST';

    if (endpointId === 'heat_intelligence') url += 'heat-intelligence';
    else if (endpointId === 'env_params') url += 'env-params';
    else if (endpointId === 'heatmap') url += 'heatmap';
    else if (endpointId === 'satellite') url += 'satellite';
    else if (endpointId === 'streetview') url += 'streetview';
    else if (endpointId === 'credits') {
      url += 'credits';
      method = 'GET';
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        ...(method === 'POST' ? { body: JSON.stringify(payload) } : {}),
      });
      const data = await res.json();
      setApiResponse(data);
    } catch (err) {
      setApiResponse({ error: true, message: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in-up">
      <div className={`max-w-5xl w-full border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] flex flex-col transition-all duration-300 ${
        isLight ? 'bg-white border-slate-200 text-slate-900 shadow-2xl' : 'bg-[#0f172a] border-cyan-500/30 text-slate-100 ring-1 ring-cyan-500/20'
      }`}>
        {/* Modal Header */}
        <div className={`flex items-center justify-between border-b pb-4 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-blue-600 text-slate-950 font-black shadow-xl">
              <ThermometerSnowflake className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold tracking-wide text-white">FortyGuard LTM API Suite Explorer</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                  Live HVAC Diagnostics
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Direct inspect interface connecting all 7 FortyGuard Large Temperature Model (LTM) endpoints.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* HVAC Role Context Callout */}
        <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-cyan-300">
            <Wind className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span><strong>HVAC Role:</strong> {currentEndpoint.hvacRole}</span>
          </div>
          <div className="font-mono text-slate-400 text-[11px] flex-shrink-0">
            Target Lat: <span className="text-white font-bold">{currentLat}</span>, Lng: <span className="text-white font-bold">{currentLng}</span>
          </div>
        </div>

        {/* Endpoints Tab Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {endpoints.map((ep) => {
            const Icon = ep.icon;
            const isSelected = activeTab === ep.id;
            return (
              <button
                key={ep.id}
                onClick={() => setActiveTab(ep.id)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200 ring-1 ring-cyan-400 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-300' : 'text-slate-500'}`} />
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    {ep.method}
                  </span>
                </div>
                <div className="text-xs font-bold truncate text-white">{ep.name}</div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">{ep.badge}</div>
              </button>
            );
          })}
        </div>

        {/* JSON Response Window */}
        <div className="flex-1 min-h-[260px] bg-slate-950 rounded-2xl border border-slate-800 p-4 font-mono text-xs overflow-auto relative">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400 text-[11px]">
            <span className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              ENDPOINT: <strong className="text-cyan-300">{currentEndpoint.path}</strong>
            </span>
            <button
              onClick={() => executeEndpoint(activeTab)}
              disabled={loading}
              className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              Re-Execute Live
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 text-cyan-400 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="text-xs">Querying FortyGuard LTM API...</span>
            </div>
          ) : (
            <pre className="text-emerald-400 text-[11px] leading-relaxed">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
          <span>FortyGuard Large Temperature Model • REST v1 Architecture</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
          >
            Close Explorer
          </button>
        </div>
      </div>
    </div>
  );
}
