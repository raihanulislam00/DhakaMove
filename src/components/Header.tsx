import React, { useState } from 'react';
import { useTransit } from '../context/TransitContext';
import { WeatherCondition, TimeOfDay } from '../types/transit';
import {
  Bus,
  CloudRain,
  Sun,
  CloudSun,
  Moon,
  Clock,
  Bell,
  Languages,
  Sliders,
  Play,
  Pause,
  Zap,
  Building,
  User,
  ShieldCheck,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeView,
    setActiveView,
    weather,
    setWeather,
    timeOfDay,
    setTimeOfDay,
    lang,
    setLang,
    isSimRunning,
    setIsSimRunning,
    simSpeed,
    setSimSpeed,
    alerts,
    dismissAlert,
  } = useTransit();

  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const unreadAlerts = alerts.filter((a) => !a.isRead);

  // Weather icons
  const weatherIcons: Record<WeatherCondition, { icon: React.ReactNode; labelEn: string; labelBn: string }> = {
    clear: { icon: <Sun className="w-3.5 h-3.5 text-amber-400" />, labelEn: 'Clear Sky', labelBn: 'পরিষ্কার আকাশ' },
    monsoon_rain: { icon: <CloudRain className="w-3.5 h-3.5 text-cyan-400" />, labelEn: 'Monsoon Rain', labelBn: 'ভারী বৃষ্টি' },
    evening_fog: { icon: <CloudSun className="w-3.5 h-3.5 text-purple-400" />, labelEn: 'Evening Drizzle', labelBn: 'হালকা গুঁড়ি বৃষ্টি' },
    heatwave: { icon: <Sun className="w-3.5 h-3.5 text-rose-400" />, labelEn: 'Peak Summer', labelBn: 'প্রখর রোদ' },
  };

  // Time of day options
  const timeOptions: Record<TimeOfDay, { labelEn: string; labelBn: string; timeStr: string }> = {
    morning_peak: { labelEn: 'Morning Rush', labelBn: 'সকালের পিক', timeStr: '08:35 AM' },
    mid_day: { labelEn: 'Mid-Day Offpeak', labelBn: 'দুপুর অফপিক', timeStr: '01:15 PM' },
    evening_peak: { labelEn: 'Evening Rush', labelBn: 'সন্ধ্যার পিক', timeStr: '06:45 PM' },
    late_night: { labelEn: 'Late Night', labelBn: 'গভীর রাত', timeStr: '10:30 PM' },
  };

  return (
    <header className="bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/90 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Brand & Main Role Tabs */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/20">
              D
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight">
                  Dhaka<span className="text-emerald-400">Move</span>
                </h1>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-semibold text-emerald-300">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {lang === 'en' ? 'Smart Mobility Hub • Dhaka' : 'স্মার্ট গণপরিবহন ব্যবস্থা'}
              </p>
            </div>
          </div>

          {/* Mobile Notification Bell */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsAlertsOpen(!isAlertsOpen)}
              className="relative p-2 text-slate-400 hover:text-white bg-slate-800/80 rounded-xl border border-slate-700/60"
            >
              <Bell className="w-4 h-4" />
              {unreadAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-slate-950 font-bold text-[9px] rounded-full flex items-center justify-center">
                  {unreadAlerts.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Center: 3-Sided Role View Switcher */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800/90 shadow-inner">
          <button
            onClick={() => setActiveView('commuter')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'commuter'
                ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === 'en' ? 'Commuter Hub' : 'যাত্রী অ্যাপ'}</span>
          </button>

          <button
            onClick={() => setActiveView('operator')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'operator'
                ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Bus className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'en' ? 'Fleet Operator' : 'বাস অপারেটর'}</span>
          </button>

          <button
            onClick={() => setActiveView('planner')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'planner'
                ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-blue-400" />
            <span>{lang === 'en' ? 'BRTA Portal' : 'বিআরটিএ পোর্টাল'}</span>
          </button>
        </div>

        {/* Right: Simulation Controls & Language & Notifications */}
        <div className="flex items-center gap-2">
          {/* Time of Day Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs">
            <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <select
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value as TimeOfDay)}
              className="bg-transparent text-slate-200 font-medium text-xs outline-none cursor-pointer"
            >
              {(Object.keys(timeOptions) as TimeOfDay[]).map((key) => (
                <option key={key} value={key} className="bg-slate-900 text-white">
                  {timeOptions[key].timeStr} ({lang === 'en' ? timeOptions[key].labelEn : timeOptions[key].labelBn})
                </option>
              ))}
            </select>
          </div>

          {/* Weather Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 px-2 py-1.5 rounded-lg border border-slate-800 text-xs">
            {weatherIcons[weather].icon}
            <select
              value={weather}
              onChange={(e) => setWeather(e.target.value as WeatherCondition)}
              className="bg-transparent text-slate-200 font-medium text-xs outline-none cursor-pointer"
            >
              {(Object.keys(weatherIcons) as WeatherCondition[]).map((key) => (
                <option key={key} value={key} className="bg-slate-900 text-white">
                  {lang === 'en' ? weatherIcons[key].labelEn : weatherIcons[key].labelBn}
                </option>
              ))}
            </select>
          </div>

          {/* Simulation Play/Pause & Speed */}
          <button
            onClick={() => setIsSimRunning(!isSimRunning)}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              isSimRunning
                ? 'bg-slate-800 text-emerald-400 border-slate-700 hover:bg-slate-750'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}
            title={isSimRunning ? 'Pause GPS Simulation' : 'Resume GPS Simulation'}
          >
            {isSimRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setSimSpeed(simSpeed === 1 ? 2 : simSpeed === 2 ? 5 : 1)}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs rounded-lg border border-slate-700 transition-colors"
            title="GPS Speed Multiplier"
          >
            {simSpeed}x
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg border border-slate-700 flex items-center gap-1 transition-colors"
          >
            <Languages className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === 'en' ? 'বাং' : 'EN'}</span>
          </button>

          {/* Desktop Notifications Bell */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setIsAlertsOpen(!isAlertsOpen)}
              className="relative p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-slate-950 font-black text-[9px] rounded-full flex items-center justify-center">
                  {unreadAlerts.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {isAlertsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-4 space-y-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-emerald-400" />
                    Proactive Transit Alerts
                  </h4>
                  <span className="text-[10px] text-slate-500">{alerts.length} alerts</span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {alerts.map((alt) => (
                    <div
                      key={alt.id}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1 relative group"
                    >
                      <div className="flex items-center justify-between pr-4">
                        <span className="font-bold text-white text-[11px]">
                          {lang === 'en' ? alt.titleEn : alt.titleBn}
                        </span>
                        <button
                          onClick={() => dismissAlert(alt.id)}
                          className="text-slate-500 hover:text-slate-300 absolute top-2 right-2"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        {lang === 'en' ? alt.messageEn : alt.messageBn}
                      </p>
                      <span className="text-[9px] text-slate-500 block">
                        {new Date(alt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
