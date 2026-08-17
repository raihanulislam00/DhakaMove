/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TransitProvider, useTransit } from './context/TransitContext';
import { Header } from './components/Header';
import { CommuterApp } from './components/CommuterApp';
import { OperatorDashboard } from './components/OperatorDashboard';
import { CityPlannerPortal } from './components/CityPlannerPortal';
import {
  Bus,
  ShieldCheck,
  Sparkles,
  MapPin,
  Heart,
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeView, lang } = useTransit();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950 relative overflow-x-hidden">
      {/* Sleek Ambient Background Grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <Header />

      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {activeView === 'commuter' && <CommuterApp />}
        {activeView === 'operator' && <OperatorDashboard />}
        {activeView === 'planner' && <CityPlannerPortal />}
      </main>

      {/* Sleek Modern Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-md py-6 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shadow-md shadow-emerald-500/10">
              <Bus className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-200 font-bold tracking-tight">DhakaMove Engine v1.0.4</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 font-medium">Smart Transit Intelligence & BRTA Compliance</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>System Online (GPS 5s)</span>
            </span>
            <span className="text-slate-700">•</span>
            <span>Gemini 3.7 AI Assistant</span>
            <span className="text-slate-700">•</span>
            <span>bKash & Nagad Direct</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <TransitProvider>
      <MainContent />
    </TransitProvider>
  );
}
