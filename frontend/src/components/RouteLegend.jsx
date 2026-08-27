const CLASSIFICATION_META = {
  SAFE_CORRIDOR: { color: '#10B981', label: 'Safe Corridor' },
  MODERATE_HEAT: { color: '#F59E0B', label: 'Moderate Heat' },
  CRITICAL_THERMAL_ZONE: { color: '#EF4444', label: 'Critical Thermal Zone' },
};

export default function RouteLegend({ segments, transitMins, recommendedTime, mitigation }) {
  if (!segments || segments.length === 0) return null;

  const classifications = [...new Set(segments.map(s => s.classification))];

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
          Route Thermal Profile
        </h3>
        <div className="text-right">
          <p className="text-xs text-zinc-500">Optimal dispatch</p>
          <p className="text-sm font-mono font-bold text-white">{recommendedTime}</p>
        </div>
      </div>

      {/* Segment legend */}
      <div className="flex flex-wrap gap-3">
        {classifications.map(cls => {
          const meta = CLASSIFICATION_META[cls] || { color: '#888', label: cls };
          return (
            <div key={cls} className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="inline-block w-8 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
              {meta.label}
            </div>
          );
        })}
      </div>

      {/* Segment detail table */}
      <div className="divide-y divide-slate-800 rounded-lg border border-zinc-700 overflow-hidden">
        {segments.map((seg, i) => {
          const meta = CLASSIFICATION_META[seg.classification] || { color: '#888', label: seg.classification };
          return (
            <div key={i} className="flex items-center justify-between px-3 py-2 bg-zinc-900/50 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
                <span className="text-zinc-400">Segment {i + 1}</span>
              </div>
              <span className="font-mono text-slate-200">{seg.avg_temp_celsius}°C</span>
              <span className="text-zinc-400">{meta.label}</span>
            </div>
          );
        })}
      </div>

      {/* Transit info */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-zinc-900/60 rounded-lg border border-zinc-700 p-3">
          <p className="text-zinc-500 mb-1">Est. Transit</p>
          <p className={`text-lg font-mono font-bold ${transitMins > 90 ? 'text-red-400' : 'text-emerald-400'}`}>
            {transitMins} <span className="text-sm font-normal text-zinc-400">min</span>
          </p>
          <p className="text-slate-600 mt-0.5">90-min ACI limit</p>
        </div>
        <div className="bg-zinc-900/60 rounded-lg border border-zinc-700 p-3">
          <p className="text-zinc-500 mb-1">Curing Method</p>
          <p className="text-sm font-semibold text-slate-200">{mitigation?.mandated_curing_method}</p>
          {mitigation?.requires_chilled_batch_water && (
            <p className="text-amber-400 mt-1 text-[11px] font-medium">Chilled batch water required</p>
          )}
        </div>
      </div>
    </div>
  );
}
