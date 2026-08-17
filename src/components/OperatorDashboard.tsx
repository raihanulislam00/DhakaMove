import React, { useState, useEffect } from 'react';
import { useTransit } from '../context/TransitContext';
import { BusVehicle } from '../types/transit';
import {
  Bus,
  TrendingUp,
  Activity,
  Users,
  QrCode,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Zap,
  BarChart3,
  Bot,
  RefreshCw,
  Sliders,
  DollarSign,
  Fuel,
  Volume2,
} from 'lucide-react';

export const OperatorDashboard: React.FC = () => {
  const {
    buses,
    routes,
    stops,
    verifyTicketQR,
    activeTicket,
    weather,
    timeOfDay,
    lang,
  } = useTransit();

  const [activeTab, setActiveTab] = useState<'fleet' | 'scanner' | 'ai_feedback' | 'ai_demand'>('fleet');
  
  // Scanner state
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const [manualQrInput, setManualQrInput] = useState('');
  const [scannedCount, setScannedCount] = useState(48);

  // AI Feedback Analysis state
  const [feedbackReport, setFeedbackReport] = useState<any>(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

  // AI Demand Forecasting state
  const [demandForecast, setDemandForecast] = useState<any>(null);
  const [isLoadingDemand, setIsLoadingDemand] = useState(false);

  // Quick stats
  const totalBuses = buses.length;
  const onTimePercentage = 86;
  const avgSpeed = Math.round(buses.reduce((acc, b) => acc + b.currentSpeedKmH, 0) / buses.length);
  const dailyRevenue = 134250;

  // Load initial AI analyses
  useEffect(() => {
    fetchFeedbackAnalysis();
    fetchDemandForecast();
  }, []);

  const fetchFeedbackAnalysis = async () => {
    setIsLoadingFeedback(true);
    try {
      const res = await fetch('/api/gemini/feedback-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviews: [
            { rating: 5, category: 'Driver', comment: 'Bihanga driver drove very smoothly through Mohakhali' },
            { rating: 2, category: 'AC', comment: 'AC was not cooling properly on DM-1902 between Banani and Motijheel' },
            { rating: 5, category: 'Booking', comment: 'bKash QR scan at gate was super fast! Saved me from rushing.' },
            { rating: 3, category: 'Punctuality', comment: 'Bus was delayed 14 mins because of Farmgate signal jam.' }
          ]
        }),
      });
      const data = await res.json();
      setFeedbackReport(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  const fetchDemandForecast = async () => {
    setIsLoadingDemand(true);
    try {
      const res = await fetch('/api/gemini/demand-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          corridor: 'Uttara - Mohakhali - Motijheel',
          timeSlot: 'Morning Rush (8:00 - 10:00 AM)',
          weather,
        }),
      });
      const data = await res.json();
      setDemandForecast(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingDemand(false);
    }
  };

  const handleScanSimulation = (qrData?: string) => {
    const payload = qrData || (activeTicket ? activeTicket.qrDataString : '{"ref":"DM-2026-TKT-8942","bus":"DM-1901","passenger":"Ahmed Al-Mansur","seats":["A3"]}');
    const result = verifyTicketQR(payload);
    setScanResult(result);
    if (result.success) {
      setScannedCount((c) => c + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Operator KPIs Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{lang === 'en' ? 'Active Fleet Size' : 'সক্রিয় বাস বহর'}</span>
            <Bus className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalBuses} Buses</div>
          <p className="text-[11px] text-emerald-400 font-semibold">100% GPS Telemetry Active</p>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{lang === 'en' ? 'On-Time Performance' : 'সময়নিষ্ঠতা হার'}</span>
            <Activity className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-white">{onTimePercentage}%</div>
          <p className="text-[11px] text-slate-400">Target BRTA benchmark: 80%</p>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{lang === 'en' ? 'Avg Corridor Speed' : 'গড় গতিবেগ'}</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{avgSpeed} km/h</div>
          <p className="text-[11px] text-amber-400 font-semibold">Weather Impact: -18%</p>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{lang === 'en' ? "Today's Gross Fares" : 'দৈনিক ভাড়া আয়'}</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">৳{dailyRevenue.toLocaleString()}</div>
          <p className="text-[11px] text-slate-400">via bKash, Nagad & Cards</p>
        </div>
      </div>

      {/* Operator Section Switcher */}
      <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto shadow-md">
        <button
          onClick={() => setActiveTab('fleet')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'fleet' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bus className="w-4 h-4" />
          <span>{lang === 'en' ? 'Live Fleet Monitor' : 'বাস বহর পর্যবেক্ষণ'}</span>
        </button>

        <button
          onClick={() => setActiveTab('scanner')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'scanner' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>{lang === 'en' ? 'Conductor QR Scanner' : 'কন্ডাক্টর স্ক্যানার'}</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_feedback')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'ai_feedback' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{lang === 'en' ? 'AI Feedback Sentiment' : 'এআই ফিডব্যাক অ্যানালাইসিস'}</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_demand')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'ai_demand' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <span>{lang === 'en' ? 'AI Demand Forecasting' : 'এআই চাহিদা পূর্বাভাস'}</span>
        </button>
      </div>

      {/* View 1: Live Fleet Monitor Table */}
      {activeTab === 'fleet' && (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bus className="w-4 h-4 text-emerald-400" />
              {lang === 'en' ? 'Active Dhaka Bus Fleet Real-Time Status' : 'চলমান বাস বহরের লাইভ স্ট্যাটাস'}
            </h3>
            <span className="text-xs text-slate-400">Updates every 5 seconds</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Bus ID & Reg</th>
                  <th className="p-4">Route & Operator</th>
                  <th className="p-4">Driver & Rating</th>
                  <th className="p-4">Crowd Load</th>
                  <th className="p-4">Speed</th>
                  <th className="p-4">Next Stop & ETA</th>
                  <th className="p-4">Schedule Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {buses.map((bus) => {
                  const route = routes.find((r) => r.id === bus.routeId);
                  const nextStop = stops.find((s) => s.id === bus.nextStopId);

                  return (
                    <tr key={bus.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: route?.color }}
                          />
                          {bus.busNumber}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{bus.id}</span>
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-slate-300">{route?.code}</div>
                        <span className="text-[10px] text-slate-500">{bus.operator}</span>
                      </td>

                      <td className="p-4">
                        <div className="font-medium text-slate-200">{bus.driverNameEn}</div>
                        <span className="text-[10px] text-amber-400 font-bold">⭐ {bus.driverRating}</span>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                bus.loadPercentage > 85
                                  ? 'bg-rose-500'
                                  : bus.loadPercentage > 60
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${bus.loadPercentage}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px]">{bus.loadPercentage}%</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {bus.bookedSeatsCount}/{bus.totalSeats} seats
                        </span>
                      </td>

                      <td className="p-4 font-mono font-bold text-emerald-400">
                        {bus.currentSpeedKmH} km/h
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-slate-300">{nextStop?.nameEn || 'Next Station'}</div>
                        <span className="text-[10px] text-cyan-400">{bus.etaToNextStopMinutes} mins</span>
                      </td>

                      <td className="p-4">
                        {bus.delayMinutes > 5 ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-300 rounded border border-rose-500/30">
                            +{bus.delayMinutes}m delay
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                            On Time
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 2: Conductor Handheld Scanner Simulator */}
      {activeTab === 'scanner' && (
        <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {lang === 'en' ? 'Conductor Door Scanner Simulator' : 'কন্ডাক্টর কিউআর স্ক্যানার সিমুলেটর'}
                </h3>
                <p className="text-xs text-slate-400">Device ID: BRTA-COND-8842 (Bihanga Paribahan)</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Scanned Today</span>
              <span className="text-lg font-black text-emerald-400">{scannedCount}</span>
            </div>
          </div>

          {/* Scanner Viewfinder Box */}
          <div className="relative bg-slate-950 p-8 rounded-3xl border-2 border-dashed border-emerald-500/40 text-center space-y-4 overflow-hidden">
            <div className="w-24 h-24 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto ring-4 ring-emerald-500/10 animate-pulse">
              <QrCode className="w-12 h-12 text-emerald-400" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-white">Hold Commuter QR Ticket in Front of Lens</h4>
              <p className="text-xs text-slate-500">Decodes 256-bit signed DhakaMove E-Ticket Pass</p>
            </div>

            {/* Test Action Button */}
            <div className="pt-2">
              <button
                onClick={() => handleScanSimulation()}
                className="py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mx-auto transition-all cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>Simulate Scan Active Passenger Ticket</span>
              </button>
            </div>
          </div>

          {/* Scan Result Feedback Card */}
          {scanResult && (
            <div
              className={`p-4 rounded-2xl border text-xs space-y-1 animate-in fade-in slide-in-from-bottom-2 ${
                scanResult.success
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {scanResult.success ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-rose-400" />}
                <span>{scanResult.success ? 'BOARDING PERMITTED' : 'SCAN FAILED'}</span>
              </div>
              <p className="text-slate-300">{scanResult.message}</p>
            </div>
          )}
        </div>
      )}

      {/* View 3: AI Automated Feedback & Sentiment Analysis */}
      {activeTab === 'ai_feedback' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  AI Automated Feedback & Sentiment Analysis
                  <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                    Gemini 3.7
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Weekly NLP breakdown across 4 fleet dimensions</p>
              </div>
            </div>

            <button
              onClick={fetchFeedbackAnalysis}
              disabled={isLoadingFeedback}
              className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFeedback ? 'animate-spin' : ''}`} />
              <span>Refresh NLP</span>
            </button>
          </div>

          {feedbackReport ? (
            <div className="space-y-6">
              {/* Executive Summary */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Executive Intelligence Summary
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {feedbackReport.executiveSummary || 'Customer satisfaction has climbed to 88% since introducing pre-reserved seat ticketing.'}
                </p>
              </div>

              {/* Actionable Recommendations */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Prioritized Action Items for Fleet Owners
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(feedbackReport.keyFindings || [
                    { category: 'AC & Comfort', issue: 'Route 19 AC unit cooling low during 2-4 PM', severity: 'Medium', affectedBus: 'DM-1902', recommendation: 'Schedule condenser maintenance at Gazipur depot' },
                    { category: 'Punctuality', issue: 'Farmgate delay reduced by 14% after dynamic dispatch', severity: 'Low', affectedBus: 'Route 8 Fleet', recommendation: 'Maintain 6-minute dispatch headway during morning peak' },
                    { category: 'Driver Conduct', issue: '98% passenger satisfaction with digital QR boarding & polite staff', severity: 'Positive', affectedBus: 'Route 11 Fleet', recommendation: 'Award monthly safety bonus to Driver Rafiqul' }
                  ]).map((item: any, idx: number) => (
                    <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{item.category}</span>
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                          {item.severity}
                        </span>
                      </div>
                      <p className="text-slate-400">{item.issue}</p>
                      <div className="pt-2 border-t border-slate-800 text-[11px] text-emerald-400 font-medium">
                        👉 <strong>Action:</strong> {item.recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">Loading AI sentiment analysis...</div>
          )}
        </div>
      )}

      {/* View 4: AI Demand Forecasting */}
      {activeTab === 'ai_demand' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">AI Passenger Demand Forecasting</h3>
                <p className="text-xs text-slate-400">Predictive crowd surge model for proactive bus dispatching</p>
              </div>
            </div>

            <button
              onClick={fetchDemandForecast}
              disabled={isLoadingDemand}
              className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDemand ? 'animate-spin' : ''}`} />
              <span>Forecast</span>
            </button>
          </div>

          {demandForecast ? (
            <div className="space-y-6">
              {/* Surge Alert Box */}
              <div className="bg-rose-950/20 border border-rose-500/30 p-4 rounded-2xl text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    Surge Risk: {demandForecast.riskLevel || 'HIGH'} (+{demandForecast.predictedSurgePercentage || 42}% Demand)
                  </span>
                  <span className="text-[11px] text-slate-400">{demandForecast.timeSlot}</span>
                </div>
                <p className="text-slate-300">
                  <strong>Recommended Dispatch:</strong> {demandForecast.recommendedFleetAction}
                </p>
              </div>

              {/* Hourly Demand Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Hourly Passenger Demand Projection
                </h4>

                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                  {(demandForecast.hourlyForecast || [
                    { hour: '07:00 AM', demandIdx: 45, busesNeeded: 8 },
                    { hour: '08:00 AM', demandIdx: 94, busesNeeded: 18 },
                    { hour: '09:00 AM', demandIdx: 98, busesNeeded: 20 },
                    { hour: '10:00 AM', demandIdx: 82, busesNeeded: 15 },
                    { hour: '11:00 AM', demandIdx: 60, busesNeeded: 10 },
                  ]).map((h: any, idx: number) => (
                    <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                      <span className="text-[10px] text-slate-400 block font-semibold">{h.hour}</span>
                      <div className="h-16 bg-slate-900 rounded-lg flex items-end p-1">
                        <div
                          className={`w-full rounded-md ${
                            h.demandIdx > 85 ? 'bg-rose-500' : h.demandIdx > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ height: `${h.demandIdx}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-white">{h.busesNeeded} Buses</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">Generating demand forecast...</div>
          )}
        </div>
      )}
    </div>
  );
};
