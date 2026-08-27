import React, { useState } from 'react';
import { Factory, Send, Sparkles, CheckCircle2, ShieldCheck, Flame, Droplets, Clock, AlertTriangle, Layers, Truck, Gauge, Users } from 'lucide-react';
import InteractiveThermalMap from './InteractiveThermalMap';
import ScheduleTimeline from './ScheduleTimeline';
import ACIReadout from './ACIReadout';
import DispatchForm from './DispatchForm';
import FiveFactorOptimizerCard from './FiveFactorOptimizerCard';
import WorkerTaskSchedulerView from './WorkerTaskSchedulerView';

export default function PlantManagerView({
  orders = [],
  selectedOrder,
  onSelectOrder,
  onDispatchOrder,
  result,
  loading,
  onRunOptimization,
  dynamicallyShadedSegments,
  selectedSlotOffset,
  onSelectSlot,
  activeSlot,
  truckProgress,
  isPlaying,
}) {
  const [activeTab, setActiveTab] = useState('dispatch'); // 'dispatch' | 'worker_health'

  return (
    <div className="space-y-6">
      {/* View Switcher Tabs - Clean Pill Switcher */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400">
            <Factory className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Site Manager Command Center
            </h3>
            <p className="text-xs text-slate-400">
              {selectedOrder?.site_name || 'Hudson Yards'} • {selectedOrder?.volume_m3 || 10} m³ Pour
            </p>
          </div>
        </div>

        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
          <button
            onClick={() => setActiveTab('dispatch')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'dispatch'
                ? 'bg-orange-500 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Thermal Route & Dispatch</span>
          </button>

          <button
            onClick={() => setActiveTab('worker_health')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'worker_health'
                ? 'bg-orange-500 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>24h Worker Health Schedule</span>
          </button>
        </div>
      </div>

      {/* 5-Factor Optimizer Card */}
      <FiveFactorOptimizerCard optimizerData={result?.optimizer_5factor} />

      {/* Tab 1: Thermal Route & Dispatch Matrix */}
      {activeTab === 'dispatch' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Pour Decision & Physics (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Mission Handshake Card */}
            <div className="rounded-3xl border border-orange-500/50 bg-gradient-to-br from-orange-950/80 via-slate-900 to-slate-900 p-6 shadow-xl space-y-4">
              <div className="space-y-1.5">
                <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider">
                  Recommended Dispatch Time
                </span>
                <div className="text-3xl font-black text-white font-mono">
                  {result?.recommended_dispatch_time || '07:00'} <span className="text-sm font-normal text-slate-300">Optimal Pour</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  FortyGuard predictive models show lowest thermal stress and zero slump loss at this hour.
                </p>
              </div>

              <button
                onClick={() => onDispatchOrder && onDispatchOrder(selectedOrder?.id)}
                className="w-full enterprise-btn py-3.5 text-xs font-bold uppercase tracking-wider"
              >
                <Send className="w-4 h-4" />
                <span>Approve Pour & Transmit to Driver Tablet</span>
              </button>
            </div>

            {/* ACI Physics Readout */}
            {activeSlot && (
              <ACIReadout
                slot={activeSlot}
                batchTemp={selectedOrder?.batch_temp_celsius || 28.5}
                transitMins={result?.transit_time_minutes || 24}
                hydrationIndex={result?.hydration_index || 15.4}
                batchRejected={result?.batch_rejected || false}
                mitigation={result?.mismatch_mitigation}
              />
            )}
          </div>

          {/* Right: Map & 12-Hour Matrix (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  FortyGuard Microclimate Route Navigation
                </h4>
                <span className="text-[11px] font-mono text-orange-400">
                  Selected Window: <b>{activeSlot?.clock_time || '07:00'}</b>
                </span>
              </div>

              <InteractiveThermalMap
                routeSegments={dynamicallyShadedSegments}
                plantCoords={{ lat: selectedOrder?.plant_lat || 40.7447, lng: selectedOrder?.plant_lng || -73.9485 }}
                siteCoords={{ lat: selectedOrder?.site_lat || 40.7538, lng: selectedOrder?.site_lng || -74.0022 }}
                truckProgress={truckProgress}
                isPlaying={isPlaying}
                selectedHourLabel={activeSlot?.clock_time || '07:00'}
                showHeatmap={true}
              />
            </div>

            {/* 12-Hour Schedule Explorer */}
            {result?.full_12h_schedule && (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    12-Hour Microclimate Pour Schedule Explorer
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">Click any hour to test route</span>
                </div>

                <ScheduleTimeline
                  slots={result.full_12h_schedule}
                  recommendedTime={result.recommended_dispatch_time}
                  selectedSlotOffset={selectedSlotOffset}
                  onSelectSlot={(slot) => onSelectSlot && onSelectSlot(slot.dispatch_hour_offset)}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: 24-Hour Worker Health Task Scheduler */}
      {activeTab === 'worker_health' && (
        <WorkerTaskSchedulerView
          siteCoords={{ lat: selectedOrder?.site_lat || 40.7538, lng: selectedOrder?.site_lng || -74.0022 }}
        />
      )}
    </div>
  );
}
