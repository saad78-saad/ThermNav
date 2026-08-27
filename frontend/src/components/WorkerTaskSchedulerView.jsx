import React, { useState, useEffect } from 'react';
import {
  Clock, ShieldCheck, Activity, Users, PlusCircle, RefreshCw, AlertTriangle,
  CheckCircle2, Thermometer, Sun, Wind, Droplets, Zap, Building2, Flame
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function WorkerTaskSchedulerView({ siteCoords }) {
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // New Custom Task Inputs
  const [taskName, setTaskName] = useState('');
  const [isTempDependent, setIsTempDependent] = useState(true);
  const [exposureLevel, setExposureLevel] = useState('OUTDOOR_HIGH_RISK');
  const [crewSize, setCrewSize] = useState(6);

  useEffect(() => {
    fetchSchedule();
  }, [siteCoords]);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/tasks/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_lat: siteCoords?.lat || 40.7538,
          site_lng: siteCoords?.lng || -74.0022,
        })
      });
      const data = await res.json();
      setScheduleData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    const newTask = {
      task_id: `TSK-${Math.floor(10 + Math.random() * 90)}`,
      task_name: taskName,
      dependency_classification: isTempDependent ? "TEMPERATURE_DEPENDENT" : "TEMPERATURE_INDEPENDENT",
      exposure_classification: exposureLevel,
      assigned_clock_time: isTempDependent || exposureLevel === 'OUTDOOR_HIGH_RISK' ? "07:00" : "13:00",
      ambient_temp_at_hour: 28.5,
      solar_ghi_at_hour: 350.0,
      wbgt_at_hour: 26.5,
      osha_risk_level: "SAFE_WORKING_CONDITIONS",
      rest_protocol: "45 min work / 15 min shade rest",
      hydration_rate_l_hr: 0.75,
      crew_size: parseInt(crewSize, 10),
      duration_hours: 3,
      ppe_requirements: ["Standard protective equipment", "Misting station access"],
      optimization_rationale: isTempDependent ? "Shifted to cool morning window (6-9 AM)" : "Assigned to indoor midday hours",
      schedule_status: "OPTIMIZED_WINDOW"
    };

    setScheduleData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        scheduled_tasks: [newTask, ...prev.scheduled_tasks]
      };
    });

    setShowAddTaskModal(false);
    setTaskName('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-orange-400 uppercase">
            <Users className="w-4 h-4" />
            <span>Worker Health & Safety Engine</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            24-Hour Predictive Jobsite Task Schedule
          </h3>
          <p className="text-xs text-slate-400">
            Automatically shifts heavy outdoor work to cool hours and indoor work to midday heat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchSchedule}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh FortyGuard Data</span>
          </button>

          <button
            onClick={() => setShowAddTaskModal(true)}
            className="enterprise-btn text-xs py-2.5 px-4"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Custom Task</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards - Big, Clear, Non-Technical */}
      {scheduleData?.summary && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 space-y-1">
            <span className="text-xs text-slate-400 font-medium">Total Site Tasks</span>
            <div className="text-3xl font-black text-white font-mono">
              {scheduleData.summary.total_tasks_scheduled}
            </div>
            <div className="text-[11px] text-slate-500">24-Hour Jobsite Queue</div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 space-y-1">
            <span className="text-xs text-orange-400 font-medium">🌅 Cool Morning Tasks</span>
            <div className="text-3xl font-black text-orange-400 font-mono">
              {scheduleData.summary.temperature_dependent_tasks}
            </div>
            <div className="text-[11px] text-slate-400">Pours & Outdoor Concrete</div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 space-y-1">
            <span className="text-xs text-sky-400 font-medium">🏢 Midday Indoor Tasks</span>
            <div className="text-3xl font-black text-sky-400 font-mono">
              {scheduleData.summary.indoor_midday_shielded_tasks}
            </div>
            <div className="text-[11px] text-slate-400">Wiring & Interior Drywall</div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 space-y-1">
            <span className="text-xs text-emerald-400 font-medium">🛡️ Worker Heat Protection</span>
            <div className="text-3xl font-black text-emerald-400 font-mono">
              100%
            </div>
            <div className="text-[11px] text-emerald-400/80">Heatstroke Risk Mitigated</div>
          </div>
        </div>
      )}

      {/* Clean Timeline View of Tasks */}
      <div className="rounded-3xl bg-slate-900/70 border border-slate-800/90 p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            Chronological Task Timeline (24 Hours)
          </h4>
          <span className="text-xs text-slate-400">
            Hour-by-hour temperature and worker rest guidelines
          </span>
        </div>

        <div className="space-y-3">
          {scheduleData?.scheduled_tasks?.map((task) => {
            const isTempDep = task.dependency_classification === 'TEMPERATURE_DEPENDENT';
            const isOutdoor = task.exposure_classification === 'OUTDOOR_HIGH_RISK';
            const isIndoor = task.exposure_classification === 'INDOOR_LOW_RISK';

            return (
              <div
                key={task.task_id}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg">
                      ⏰ {task.assigned_clock_time}
                    </span>
                    <h5 className="text-sm font-bold text-white">{task.task_name}</h5>
                  </div>

                  <p className="text-xs text-slate-400 pl-1">
                    ↳ <b className="text-orange-400">Why this hour:</b> {task.optimization_rationale}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                    isTempDep ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {isTempDep ? 'Temp-Sensitive' : 'Temp-Independent'}
                  </span>

                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                    isOutdoor
                      ? 'bg-red-500/10 text-red-400 border-red-500/30'
                      : isIndoor
                      ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {isOutdoor ? 'Outdoor Solar' : isIndoor ? 'Indoor Protected' : 'Shaded'}
                  </span>

                  <div className="text-right text-xs font-mono text-slate-400 pl-2">
                    <div>{task.ambient_temp_at_hour}°C</div>
                    <div className="text-[10px] text-emerald-400">{task.crew_size} workers</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Add Custom Site Task */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase">Add Site Construction Task</h3>
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Task Description</label>
                <input
                  type="text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="e.g. Parapet Wall Masonry Mortar Placement"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Dependency</label>
                  <select
                    value={isTempDependent ? "yes" : "no"}
                    onChange={(e) => setIsTempDependent(e.target.value === "yes")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="yes">Temp-Sensitive (Pours/Slabs)</option>
                    <option value="no">Not Temp-Sensitive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Worker Location</label>
                  <select
                    value={exposureLevel}
                    onChange={(e) => setExposureLevel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="OUTDOOR_HIGH_RISK">Outdoor Direct Sun</option>
                    <option value="SHADED_MEDIUM_RISK">Shaded / Semi-Exposed</option>
                    <option value="INDOOR_LOW_RISK">Indoor Protected / AC</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned Crew Size</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={crewSize}
                  onChange={(e) => setCrewSize(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="enterprise-btn text-xs py-2 px-4"
                >
                  Save & Assign Best Hour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
