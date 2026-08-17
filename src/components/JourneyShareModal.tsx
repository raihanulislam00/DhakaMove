import React, { useState } from 'react';
import { useTransit } from '../context/TransitContext';
import {
  ShieldCheck,
  Share2,
  Phone,
  User,
  AlertOctagon,
  Copy,
  Check,
  Navigation,
  MessageSquare,
  Clock,
  MapPin,
  ExternalLink,
  X,
  Radio,
} from 'lucide-react';

interface JourneyShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JourneyShareModal: React.FC<JourneyShareModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    activeTicket,
    journeyShare,
    startJourneyShare,
    triggerEmergencySOS,
    buses,
    lang,
  } = useTransit();

  const [contactName, setContactName] = useState('Anika Tabassum (Sister)');
  const [contactPhone, setContactPhone] = useState('01819-876543');
  const [copiedLink, setCopiedLink] = useState(false);
  const [simulatedView, setSimulatedView] = useState<'setup' | 'family_view'>(journeyShare ? 'family_view' : 'setup');

  if (!isOpen) return null;

  const currentBus = buses.find((b) => b.id === (journeyShare?.busId || activeTicket?.busId)) || buses[0];
  const shareUrl = `https://dhakamove.gov.bd/live-track/${journeyShare?.id || 'live-8921'}`;

  const handleStartShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket) {
      alert(lang === 'en' ? 'Please book a ticket first to activate Live Journey Sharing.' : 'জার্নি শেয়ার করতে আগে একটি টিকিট বুক করুন।');
      return;
    }
    startJourneyShare(activeTicket.id, contactName, contactPhone);
    setSimulatedView('family_view');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center ring-2 ring-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {lang === 'en' ? 'Journey Share & Safety Shield' : 'জার্নি শেয়ার ও নিরাপত্তা শিল্ড'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'en' ? 'Live family tracking for peace of mind' : 'পরিবারের সাথে সার্বক্ষণিক লাইভ অবস্থান শেয়ার'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {simulatedView === 'setup' && (
            <form onSubmit={handleStartShare} className="space-y-4">
              <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-2xl text-xs text-emerald-300/90 leading-relaxed">
                <p className="font-semibold text-emerald-200 mb-1 flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  {lang === 'en' ? 'How Journey Share Protects You:' : 'জার্নি শেয়ার যেভাবে কাজ করে:'}
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li>Your contact gets a 1-click web map link (no app download needed).</li>
                  <li>Automatic WhatsApp/SMS sent when you board and reach 2 stops away.</li>
                  <li>Instant route deviation alert if the bus goes off registered corridor.</li>
                </ul>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  {lang === 'en' ? 'Family / Friend Contact Name' : 'পরিবারের সদস্যের নাম'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-slate-950 text-white text-xs pl-9 pr-3 py-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. Mother / Spouse / Friend"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  {lang === 'en' ? 'Emergency WhatsApp / Mobile Number' : 'জরুরি মোবাইল বা হোয়াটসঅ্যাপ নম্বর'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full bg-slate-950 text-white text-xs pl-9 pr-3 py-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="01XXXXXXXXX"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>{lang === 'en' ? 'Generate & Share Live Tracking Link' : 'লাইভ ট্র্যাকিং লিংক তৈরি করুন'}</span>
              </button>
            </form>
          )}

          {simulatedView === 'family_view' && journeyShare && (
            <div className="space-y-5">
              {/* Simulated Live View from Contact's Perspective */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold text-slate-200">
                    Live Broadcast Active • {journeyShare.emergencyContactName}
                  </span>
                </div>
                <button
                  onClick={() => setSimulatedView('setup')}
                  className="text-[11px] text-slate-400 hover:text-white"
                >
                  Edit Contact
                </button>
              </div>

              {/* Shareable Link Box */}
              <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-transparent text-xs font-mono text-emerald-400 outline-none truncate"
                />
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Live Bus Telemetry Card */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Current Bus</span>
                    <h4 className="text-sm font-bold text-white">{currentBus.busNumber}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Live Speed</span>
                    <span className="text-sm font-extrabold text-emerald-400 block">{currentBus.currentSpeedKmH} km/h</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-slate-500 text-[10px]">Driver</span>
                    <p className="font-semibold text-slate-300">{currentBus.driverNameEn} (4.8 ⭐)</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">Route Status</span>
                    <p className="font-semibold text-emerald-400">On Designated Corridor</p>
                  </div>
                </div>
              </div>

              {/* Automatic Checkpoints Trigger Log */}
              <div>
                <h5 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  {lang === 'en' ? 'Automated Checkpoint Notifications' : 'স্বয়ংক্রিয় নোটিফিকেশন লগ'}
                </h5>

                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {journeyShare.statusLog.map((log, idx) => (
                    <div
                      key={idx}
                      className="text-xs p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5"
                    >
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-300 rounded shrink-0">
                        {log.channel}
                      </span>
                      <div className="flex-1">
                        <p className="text-slate-200">{log.event}</p>
                        <span className="text-[10px] text-slate-500">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emergency SOS Button */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => triggerEmergencySOS('Emergency triggered by passenger.')}
                  className="flex-1 py-3 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <AlertOctagon className="w-4 h-4 text-rose-400" />
                  <span>{lang === 'en' ? 'Trigger Emergency SOS (999)' : 'জরুরি এসওএস (৯৯৯)'}</span>
                </button>

                <button
                  onClick={onClose}
                  className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-2xl transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
