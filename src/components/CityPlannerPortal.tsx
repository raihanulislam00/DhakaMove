import React, { useState } from 'react';
import { useTransit } from '../context/TransitContext';
import {
  BarChart,
  FileText,
  TrendingDown,
  Clock,
  Leaf,
  DollarSign,
  AlertOctagon,
  Sparkles,
  Download,
  Building,
  CheckCircle2,
  Shield,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

export const CityPlannerPortal: React.FC = () => {
  const { lang, weather, timeOfDay } = useTransit();
  const [downloadedReport, setDownloadedReport] = useState(false);

  const handleDownloadReport = () => {
    setDownloadedReport(true);
    setTimeout(() => setDownloadedReport(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/30 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">
              BRTA & DTCA City Transit Intelligence Portal
            </h3>
          </div>
          <p className="text-xs text-slate-300 max-w-xl">
            Macro-level mobility analytics, carbon emission reduction metrics, and AI dynamic route optimization for the Dhaka Metropolitan Area.
          </p>
        </div>

        <button
          onClick={handleDownloadReport}
          className="py-2.5 px-5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>{downloadedReport ? 'Briefing Generated!' : 'Export BRTA Policy Brief'}</span>
        </button>
      </div>

      {/* High-Level Impact Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Daily Hours Saved</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">54,200 hrs</div>
          <p className="text-[11px] text-emerald-400 font-semibold">~48 mins saved / commuter</p>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>CO2 Emissions Mitigated</span>
            <Leaf className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-white">16.4 Tons</div>
          <p className="text-[11px] text-teal-400 font-semibold">via optimized idling & speed</p>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Economic Value Unlocked</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">৳4.8M / Day</div>
          <p className="text-[11px] text-slate-400">World Bank $3.8B loss model</p>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Digital Fare Inclusion</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">92.4%</div>
          <p className="text-[11px] text-slate-400">bKash, Nagad & SSLCommerz</p>
        </div>
      </div>

      {/* Corridor Congestion Index & Hotspot Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            Corridor Congestion & Delay Matrix
          </h4>

          <div className="space-y-3">
            {[
              { name: 'Farmgate Ananda Junction', delay: '+16m delay', index: 88, status: 'Severe Bottleneck' },
              { name: 'Mohakhali Flyover Descent', delay: '+9m delay', index: 68, status: 'Moderate Friction' },
              { name: 'Mirpur 10 to Kazipara', delay: '+12m delay (Rain)', index: 74, status: 'Weather Sensitive' },
              { name: 'Airport to Kuril 300ft', delay: '+4m delay', index: 32, status: 'Smooth Corridor' },
              { name: 'Shahbagh / DU Crossing', delay: '+7m delay', index: 58, status: 'Moderate Signal' },
            ].map((c, idx) => (
              <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{c.name}</span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      c.index > 80
                        ? 'bg-rose-500/20 text-rose-300'
                        : c.index > 50
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {c.delay}
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      c.index > 80 ? 'bg-rose-500' : c.index > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${c.index}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Dynamic Route Optimization Proposals */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            AI Dynamic Route Optimization Proposals
          </h4>

          <div className="space-y-3">
            {[
              {
                title: 'Add Express Feeder Stop at Kuril 300ft Interchange',
                desc: 'GPS heatmap shows 38% commuter drop-offs transferring to Purbachal CNGs with no designated bay.',
                impact: 'Reduces curb friction by 14%',
              },
              {
                title: 'Sync Route 8 Schedules with MRT-6 Agargaon Station',
                desc: 'Metro arrival spikes passenger demand by +60% every 8 minutes at Agargaon interchange.',
                impact: 'Eliminates 18 min platform wait time',
              },
              {
                title: 'Implement Dedicated Bus Rapid Lane at Farmgate',
                desc: 'AI modeling indicates reserving left lane for public buses reduces transit delay from 16m to 4m.',
                impact: 'Saves 32,000 commuter hours daily',
              },
            ].map((p, idx) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-slate-100">{p.title}</h5>
                  <ArrowUpRight className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
                <p className="text-slate-400 leading-relaxed">{p.desc}</p>
                <span className="text-[11px] font-semibold text-emerald-400 block pt-1">
                  ✓ Projected Impact: {p.impact}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
