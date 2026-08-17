import React, { useState } from 'react';
import { useTransit } from '../context/TransitContext';
import { DhakaMap } from './DhakaMap';
import { SeatBookingModal } from './SeatBookingModal';
import { JourneyShareModal } from './JourneyShareModal';
import { AITripAssistant } from './AITripAssistant';
import { BusVehicle, BusStop, BookingTicket } from '../types/transit';
import {
  Map,
  Search,
  Compass,
  Bot,
  Ticket,
  ShieldCheck,
  Star,
  Bus,
  Clock,
  MapPin,
  Users,
  Sparkles,
  ArrowRight,
  WifiOff,
  CheckCircle2,
  Share2,
  ThumbsUp,
  AlertTriangle,
  Flame,
  Check,
  Radio,
} from 'lucide-react';

export const CommuterApp: React.FC = () => {
  const {
    buses,
    routes,
    stops,
    activeTicket,
    ticketsHistory,
    alerts,
    userLocation,
    weather,
    timeOfDay,
    lang,
    journeyShare,
    commuterTab,
    setCommuterTab,
    calculateSmartETA,
    submitTripRating,
    setSelectedBusId,
  } = useTransit();

  const [bookingModalBus, setBookingModalBus] = useState<BusVehicle | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Origin / Destination search inputs in Plan tab
  const [searchFrom, setSearchFrom] = useState<string>('stop_banani_kakoli');
  const [searchTo, setSearchTo] = useState<string>('stop_motijheel');

  // Trip Rating State
  const [rateDriver, setRateDriver] = useState(5);
  const [rateCleanliness, setRateCleanliness] = useState(4);
  const [rateAc, setRateAc] = useState(5);
  const [ratePunctuality, setRatePunctuality] = useState(4);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Crowd badge styling helper
  const getCrowdStyle = (crowd: string) => {
    if (crowd === 'Comfortable')
      return { bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', label: lang === 'en' ? 'Comfortable (Seats Available)' : 'আরামদায়ক (আসন খালি)' };
    if (crowd === 'Moderate')
      return { bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30', label: lang === 'en' ? 'Moderate Crowd' : 'মাঝারি ভীড়' };
    return { bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30', label: lang === 'en' ? 'Packed (Standing Only)' : 'ভীড় (দাঁড়িয়ে যাওয়া)' };
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBus = buses.find((b) => b.id === (activeTicket?.busId || 'DM-1901')) || buses[0];
    const avg = Number(((rateDriver + rateCleanliness + rateAc + ratePunctuality) / 4).toFixed(1));

    submitTripRating({
      ticketId: activeTicket?.id || 'demo_ticket',
      busId: targetBus.id,
      driverRating: rateDriver,
      cleanlinessRating: rateCleanliness,
      acFanRating: rateAc,
      punctualityRating: ratePunctuality,
      averageRating: avg,
      comment: ratingComment || 'Very smooth ride with prompt digital QR scan.',
      language: lang,
      passengerName: activeTicket?.passengerName || 'Raihanul Islam',
    });

    setRatingSubmitted(true);
    setTimeout(() => {
      setRatingSubmitted(false);
      setRatingComment('');
    }, 3500);
  };

  return (
    <div className="space-y-6">
      {/* Active Boarding Ticket HUD Bar (if user booked a seat) */}
      {activeTicket && (
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/40 p-4 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/30">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-400 font-mono">{activeTicket.bookingRef}</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                  {activeTicket.status.toUpperCase()}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">
                {activeTicket.routeCode} • Seat {activeTicket.seatNumbers.join(', ')} ({activeTicket.fromStopNameEn} ➔ {activeTicket.toStopNameEn})
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCommuterTab('tickets')}
              className="py-2 px-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Ticket className="w-4 h-4" />
              <span>{lang === 'en' ? 'Show Offline QR' : 'অফলাইন কিউআর'}</span>
            </button>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>{journeyShare ? (lang === 'en' ? 'Tracking Shared' : 'লাইভ শেয়ার সক্রিয়') : (lang === 'en' ? 'Share Journey' : 'পরিবারকে শেয়ার')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Commuter Tab Navigation Bar */}
      <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800/90 overflow-x-auto shadow-md">
        <button
          onClick={() => setCommuterTab('map')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            commuterTab === 'map'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Map className="w-4 h-4" />
          <span>{lang === 'en' ? 'Live Bus Map' : 'লাইভ বাস ম্যাপ'}</span>
        </button>

        <button
          onClick={() => setCommuterTab('plan')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            commuterTab === 'plan'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>{lang === 'en' ? 'Search & Book' : 'রুট খুঁজুন ও বুকিং'}</span>
        </button>

        <button
          onClick={() => setCommuterTab('nearby')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            commuterTab === 'nearby'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>{lang === 'en' ? 'Nearest Stops' : 'নিকটবর্তী স্টপ'}</span>
        </button>

        <button
          onClick={() => setCommuterTab('ai_assistant')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            commuterTab === 'ai_assistant'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Bot className="w-4 h-4 text-cyan-400" />
          <span>{lang === 'en' ? 'AI Trip Assistant' : 'এআই অ্যাসিস্ট্যান্ট'}</span>
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        </button>

        <button
          onClick={() => setCommuterTab('tickets')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            commuterTab === 'tickets'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>{lang === 'en' ? 'Offline QR Pass' : 'অফলাইন টিকিট'}</span>
          {ticketsHistory.length > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] bg-slate-800 text-slate-300 rounded-full font-mono">
              {ticketsHistory.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setCommuterTab('safety')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            commuterTab === 'safety'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{lang === 'en' ? 'Journey Share (Safety)' : 'জার্নি শেয়ার'}</span>
        </button>

        <button
          onClick={() => setCommuterTab('rate')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            commuterTab === 'rate'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Star className="w-4 h-4 text-amber-400" />
          <span>{lang === 'en' ? 'Rate Trip' : 'রেটিং দিন'}</span>
        </button>
      </div>

      {/* Tab 1: Live Interactive Map */}
      {commuterTab === 'map' && (
        <div className="space-y-4">
          <DhakaMap
            onSelectBusForBooking={(bus) => {
              setBookingModalBus(bus);
            }}
          />

          {/* Quick Route Highlights Grid & AI Trip Card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Sleek Indigo AI Assistant Callout Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-4 rounded-2xl shadow-lg text-white flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">
                    Smart Assistant
                  </span>
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                </div>
                <h4 className="text-sm font-bold leading-snug mb-1">
                  {lang === 'en' ? 'Need AI Route Advice?' : 'দ্রুততম রুট জানতে চান?'}
                </h4>
                <p className="text-xs text-indigo-100/90 leading-relaxed">
                  {lang === 'en'
                    ? 'Ask Gemini in Bangla or English for real-time congestion avoidance.'
                    : 'বাংলায় বা ইংরেজিতে ট্রাফিক ও দ্রুত বাসের খোঁজ নিন।'}
                </p>
              </div>
              <button
                onClick={() => setCommuterTab('ai_assistant')}
                className="mt-3 w-full py-2 bg-white text-indigo-950 font-bold text-xs rounded-xl shadow-md hover:bg-indigo-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Open Assistant' : 'এআই ওপেন করুন'}</span>
              </button>
            </div>

            {routes.slice(0, 3).map((r) => {
              const activeRouteBuses = buses.filter((b) => b.routeId === r.id);
              const nextBus = activeRouteBuses[0] || buses[0];
              const crowd = getCrowdStyle(nextBus?.currentCrowd || 'Comfortable');

              return (
                <div
                  key={r.id}
                  className="bg-slate-900/90 border border-slate-800/90 p-4 rounded-2xl hover:border-slate-700 transition-all flex flex-col justify-between shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="px-2.5 py-0.5 text-xs font-bold rounded-lg text-slate-950"
                        style={{ backgroundColor: r.color }}
                      >
                        {r.code.split(' ')[0]} {r.code.split(' ')[1]}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${crowd.bg}`}>
                        {nextBus?.currentCrowd}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white mb-1">{r.nameEn}</h4>
                    <p className="text-xs text-slate-400">
                      {activeRouteBuses.length} {lang === 'en' ? 'buses live on map' : 'টি বাস চলমান'} • ৳{r.standardFareBdt}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      {nextBus?.etaToNextStopMinutes || 6} min ETA
                    </span>
                    <button
                      onClick={() => setBookingModalBus(nextBus)}
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{lang === 'en' ? 'Book Seat' : 'সিট বুকিং'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Plan & Book (From ➔ To Corridor Search) */}
      {commuterTab === 'plan' && (
        <div className="space-y-6">
          {/* Search Inputs Card */}
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-emerald-400" />
              {lang === 'en' ? 'Find Buses between Dhaka Corridors' : 'ঢাকা শহরের যেকোনো প্রান্তে বাস খুঁজুন'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                  {lang === 'en' ? 'From (Boarding Stop)' : 'যাত্রা শুরু (স্টপেজ)'}
                </label>
                <select
                  value={searchFrom}
                  onChange={(e) => setSearchFrom(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs font-semibold p-3.5 rounded-xl border border-slate-700 focus:ring-2 focus:ring-emerald-500"
                >
                  {stops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {lang === 'en' ? s.nameEn : s.nameBn} ({s.area})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                  {lang === 'en' ? 'To (Destination)' : 'গন্তব্য (স্টপেজ)'}
                </label>
                <select
                  value={searchTo}
                  onChange={(e) => setSearchTo(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs font-semibold p-3.5 rounded-xl border border-slate-700 focus:ring-2 focus:ring-emerald-500"
                >
                  {stops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {lang === 'en' ? s.nameEn : s.nameBn} ({s.area})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Available Buses on Selected Corridor */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-200">
              {lang === 'en' ? 'Available Buses on this Corridor' : 'এই রুটের চলমান বাসসমূহ'}
            </h4>

            <div className="space-y-3">
              {buses.map((bus) => {
                const route = routes.find((r) => r.id === bus.routeId);
                const smartEta = calculateSmartETA(route?.id || 'route-19', searchFrom, searchTo);
                const crowd = getCrowdStyle(bus.currentCrowd);

                return (
                  <div
                    key={bus.id}
                    className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-950 font-black text-sm shrink-0 shadow-md"
                        style={{ backgroundColor: route?.color || '#10b981' }}
                      >
                        <Bus className="w-6 h-6" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white">{bus.busNumber}</h4>
                          {bus.isAc && (
                            <span className="px-2 py-0.5 text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/40">
                              AC EXPRESS
                            </span>
                          )}
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${crowd.bg}`}>
                            {crowd.label}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400">
                          {route?.code} • {bus.operator} • Driver {bus.driverNameEn} ({bus.driverRating} ⭐)
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                          <span className="flex items-center gap-1 font-semibold text-emerald-400">
                            <Clock className="w-3.5 h-3.5" />
                            Arrives at pickup in {bus.etaToNextStopMinutes} mins
                          </span>
                          <span>•</span>
                          <span className="text-slate-400">
                            Total Journey: <strong>{smartEta.etaMinutes} mins</strong> ({smartEta.trafficNotes})
                          </span>
                          <span>•</span>
                          <span className="text-slate-400">
                            Available: <strong>{bus.totalSeats - bus.bookedSeatsCount} seats</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex md:flex-col items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Fare</span>
                        <span className="text-lg font-black text-emerald-400">৳{route?.standardFareBdt || 45}</span>
                      </div>

                      <button
                        onClick={() => setBookingModalBus(bus)}
                        className="py-2.5 px-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>{lang === 'en' ? 'Reserve Seat' : 'আসন বুক করুন'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Nearest Stop Finder */}
      {commuterTab === 'nearby' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <h3 className="text-base font-bold text-white">
                    {lang === 'en' ? 'GPS Nearest Bus Stops' : 'নিকটবর্তী বাস স্টপেজসমূহ'}
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  {lang === 'en' ? 'Ranked by walking distance from ' : 'আপনার বর্তমান অবস্থান '}{' '}
                  <strong className="text-slate-200">{userLocation.name}</strong>
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-emerald-950/40 text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-500/30 text-xs font-semibold">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline Cached</span>
              </div>
            </div>

            {/* List of Nearest Stops with live bus arrivals */}
            <div className="space-y-4">
              {stops.slice(0, 5).map((stop, idx) => {
                const distanceMeters = 240 + idx * 320;
                const walkMins = Math.max(2, Math.round(distanceMeters / 80));
                const passingBuses = buses.filter((b) =>
                  routes.find((r) => r.id === b.routeId)?.stops.includes(stop.id)
                );

                return (
                  <div
                    key={stop.id}
                    className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">
                            {lang === 'en' ? stop.nameEn : stop.nameBn}
                          </h4>
                          <p className="text-xs text-slate-400">
                            {stop.area} • {distanceMeters}m ({walkMins} min walk)
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSearchFrom(stop.id);
                          setCommuterTab('plan');
                        }}
                        className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg transition-all"
                      >
                        {lang === 'en' ? 'Board Here' : 'এখান থেকে উঠুন'}
                      </button>
                    </div>

                    {/* Upcoming Buses at this Stop */}
                    <div className="pt-2 border-t border-slate-800/80 space-y-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        {lang === 'en' ? 'Next Buses Arriving Live:' : 'পরবর্তী বাসসমূহ:'}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {passingBuses.slice(0, 2).map((b) => {
                          const r = routes.find((rt) => rt.id === b.routeId);
                          return (
                            <div
                              key={b.id}
                              className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: r?.color }}
                                />
                                <span className="font-semibold text-slate-200">{b.busNumber}</span>
                              </div>
                              <span className="font-bold text-emerald-400">{b.etaToNextStopMinutes} min</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Gemini AI Trip Assistant */}
      {commuterTab === 'ai_assistant' && (
        <AITripAssistant
          onSelectBusForBooking={(bus) => {
            setBookingModalBus(bus);
          }}
        />
      )}

      {/* Tab 5: Offline QR Tickets Pass */}
      {commuterTab === 'tickets' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                {lang === 'en' ? 'My Digital Boarding Tickets' : 'ডিজিটাল বোর্ডিং টিকেটসমূহ'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'en' ? 'Stored locally for 100% offline verification at bus scanner' : 'ইন্টারনেট ছাড়াই বাসে কিউআর স্ক্যান করে উঠতে পারবেন'}
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/30 px-3 py-1.5 rounded-xl border border-emerald-500/30 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Offline Ready</span>
            </div>
          </div>

          {ticketsHistory.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 p-12 rounded-3xl text-center space-y-4">
              <Ticket className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-300">
                {lang === 'en' ? 'No Booked Tickets Yet' : 'কোনো সক্রিয় টিকেট নেই'}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {lang === 'en' ? 'Select a bus on the live map and reserve your seat with bKash or Nagad to get your digital QR boarding ticket.' : 'লাইভ ম্যাপ থেকে বাস বেছে নিয়ে বিকাশ বা নগদ দিয়ে সিট বুকিং করুন।'}
              </p>
              <button
                onClick={() => setCommuterTab('plan')}
                className="py-2.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                {lang === 'en' ? 'Book a Seat Now' : 'সিট বুক করুন'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ticketsHistory.map((tkt) => (
                <div
                  key={tkt.id}
                  className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-emerald-400">{tkt.bookingRef}</span>
                        <span
                          className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${
                            tkt.status === 'boarded'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {tkt.status.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{tkt.routeCode}</h4>
                      <p className="text-xs text-slate-400">{tkt.busNumber} • {tkt.operatorName}</p>
                    </div>

                    {/* QR Code */}
                    <div className="bg-white p-2 rounded-xl border border-slate-700 shrink-0">
                      {tkt.qrCodeDataUrl && (
                        <img src={tkt.qrCodeDataUrl} alt="QR" className="w-20 h-20" />
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 text-xs grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Passenger</span>
                      <strong className="text-slate-200">{tkt.passengerName}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Reserved Seats</span>
                      <strong className="text-emerald-400">{tkt.seatNumbers.join(', ')}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">From</span>
                      <span className="text-slate-300">{tkt.fromStopNameEn}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">To</span>
                      <span className="text-slate-300">{tkt.toStopNameEn}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                    <span>Paid ৳{tkt.totalFareBdt} ({tkt.paymentMethod})</span>
                    <button
                      onClick={() => setIsShareModalOpen(true)}
                      className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share Track</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Journey Share Safety */}
      {commuterTab === 'safety' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 p-6 rounded-3xl border border-emerald-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">
                  {lang === 'en' ? 'DhakaMove Safety Shield & Journey Share' : 'ঢাকা মুভ সেফটি শিল্ড ও জার্নি শেয়ার'}
                </h3>
              </div>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                {lang === 'en'
                  ? 'Designed for solo commuters and women traveling across Dhaka. Share a live GPS web link with your family that updates automatically when you board, approach home, or if the bus deviates from registered routes.'
                  : 'একা যাতায়াতকারী ও নারীদের সর্বোচ্চ নিরাপত্তার জন্য তৈরি। পরিবারকে লাইভ লিংক শেয়ার করুন এবং স্বয়ংক্রিয় নোটিফিকেশন পাঠান।'}
              </p>
            </div>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="py-3 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all shrink-0 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{journeyShare ? 'View Shared Broadcast' : 'Start Journey Share'}</span>
            </button>
          </div>

          {/* Safety Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                📱
              </div>
              <h4 className="text-sm font-bold text-white">1-Click Browser Link</h4>
              <p className="text-slate-400">
                Your emergency contact does not need the DhakaMove app installed. They can open the tracking link on any browser.
              </p>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                ⚡
              </div>
              <h4 className="text-sm font-bold text-white">Auto Checkpoint SMS</h4>
              <p className="text-slate-400">
                Automatic WhatsApp and SMS alerts sent at boarding, 2 stops away from destination, and upon arrival.
              </p>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                🚨
              </div>
              <h4 className="text-sm font-bold text-white">Route Deviation & 999</h4>
              <p className="text-slate-400">
                If the bus veers more than 500 meters off registered corridor, immediate alerts dispatch to family and transit police.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Rate Trip & Driver */}
      {commuterTab === 'rate' && (
        <div className="max-w-2xl mx-auto bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              {lang === 'en' ? 'Rate Driver & Bus Experience' : 'বাস ও চালকের সেবামানের রেটিং'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'en' ? 'Your feedback feeds into AI Sentiment Analysis for bus operators and BRTA' : 'আপনার মতামত চালকদের মানোন্নয়নে ও বিআরটিএ ডেটায় ব্যবহৃত হয়'}
            </p>
          </div>

          {ratingSubmitted ? (
            <div className="p-8 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl text-center space-y-2 animate-in fade-in">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-white">Thank You for Your Feedback!</h4>
              <p className="text-xs text-slate-300">
                Your review has been logged and forwarded to Bihanga Paribahan fleet intelligence.
              </p>
            </div>
          ) : (
            <form onSubmit={handleRatingSubmit} className="space-y-5 text-xs">
              {/* 4 Dimension Rating */}
              <div className="space-y-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                {/* Driver Behaviour */}
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">1. Driver Conduct & Smooth Driving</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setRateDriver(num)}
                        className={`p-1.5 rounded-lg ${
                          num <= rateDriver ? 'text-amber-400' : 'text-slate-700'
                        }`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cleanliness */}
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">2. Bus Cleanliness & Hygiene</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setRateCleanliness(num)}
                        className={`p-1.5 rounded-lg ${
                          num <= rateCleanliness ? 'text-amber-400' : 'text-slate-700'
                        }`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* AC / Fan Condition */}
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">3. AC Cooling / Fan Condition</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setRateAc(num)}
                        className={`p-1.5 rounded-lg ${
                          num <= rateAc ? 'text-amber-400' : 'text-slate-700'
                        }`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Punctuality */}
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">4. Schedule Adherence & Punctuality</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setRatePunctuality(num)}
                        className={`p-1.5 rounded-lg ${
                          num <= ratePunctuality ? 'text-amber-400' : 'text-slate-700'
                        }`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Text Review Box */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  {lang === 'en' ? 'Comments in Bangla or English (Optional)' : 'মন্তব্য (বাংলা বা ইংরেজিতে)'}
                </label>
                <textarea
                  rows={3}
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="e.g., Driver Rafiqul drove safely through Farmgate jam, AC was cool and seat was clean."
                  className="w-full bg-slate-950 text-white text-xs p-3.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>Submit 4-Dimension Rating</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* Seat Booking Modal */}
      {bookingModalBus && (
        <SeatBookingModal
          bus={bookingModalBus}
          isOpen={!!bookingModalBus}
          onClose={() => setBookingModalBus(null)}
          onBookingSuccess={(ticket) => {
            // Keep ticket active and ready
          }}
        />
      )}

      {/* Journey Share Modal */}
      <JourneyShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
};
