import React, { useState, useEffect } from 'react';
import { BusVehicle, BusSeat, BusStop, BookingTicket } from '../types/transit';
import { useTransit } from '../context/TransitContext';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  CreditCard,
  QrCode,
  Sparkles,
  User,
  Phone,
  ArrowRight,
  Info,
  Smartphone,
  Check,
} from 'lucide-react';

interface SeatBookingModalProps {
  bus: BusVehicle;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: (ticket: BookingTicket) => void;
}

export const SeatBookingModal: React.FC<SeatBookingModalProps> = ({
  bus,
  isOpen,
  onClose,
  onBookingSuccess,
}) => {
  const { routes, stops, bookSeat, lang, calculateSmartETA } = useTransit();
  const route = routes.find((r) => r.id === bus.routeId);

  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [fromStopId, setFromStopId] = useState<string>(route?.stops[0] || 'stop_uttara_10');
  const [toStopId, setToStopId] = useState<string>(route?.stops[route.stops.length - 1] || 'stop_motijheel');
  const [passengerName, setPassengerName] = useState('Raihanul Islam Nahid');
  const [passengerPhone, setPassengerPhone] = useState('01712-345678');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket' | 'SSLCommerz'>('bKash');

  // Multi-step modal state: 'seats' -> 'payment' -> 'success'
  const [step, setStep] = useState<'seats' | 'payment' | 'processing' | 'success'>('seats');
  const [holdTimerSeconds, setHoldTimerSeconds] = useState(120); // 2 minute no-show hold timer
  const [bKashPin, setBKashPin] = useState('');
  const [bKashOtp, setBKashOtp] = useState('784920');
  const [paymentStep, setPaymentStep] = useState<'number' | 'otp' | 'pin'>('number');
  const [confirmedTicket, setConfirmedTicket] = useState<BookingTicket | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize from/to stops based on bus route
  useEffect(() => {
    if (route) {
      setFromStopId(route.stops[Math.min(bus.currentStopIndex, route.stops.length - 2)]);
      setToStopId(route.stops[route.stops.length - 1]);
    }
  }, [bus, route]);

  // Hold Timer countdown
  useEffect(() => {
    if (!isOpen || selectedSeatIds.length === 0) return;
    const interval = setInterval(() => {
      setHoldTimerSeconds((t) => {
        if (t <= 1) {
          setSelectedSeatIds([]);
          clearInterval(interval);
          return 120;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, selectedSeatIds.length]);

  if (!isOpen || !route) return null;

  const smartEta = calculateSmartETA(route.id, fromStopId, toStopId);
  const farePerSeat = route.standardFareBdt || 45;
  const totalAmount = farePerSeat * selectedSeatIds.length;

  const handleSeatClick = (seat: BusSeat) => {
    if (seat.isBooked) return;
    if (selectedSeatIds.includes(seat.id)) {
      setSelectedSeatIds((prev) => prev.filter((id) => id !== seat.id));
    } else {
      if (selectedSeatIds.length >= 4) {
        alert(lang === 'en' ? 'Maximum 4 seats can be booked per transaction.' : 'একসাথে সর্বোচ্চ ৪টি সিট বুক করা যাবে।');
        return;
      }
      setSelectedSeatIds((prev) => [...prev, seat.id]);
      setHoldTimerSeconds(120); // reset 2 min timer
    }
  };

  const handleProceedToPayment = () => {
    if (selectedSeatIds.length === 0) {
      alert(lang === 'en' ? 'Please select at least 1 seat.' : 'অনুগ্রহ করে অন্তত ১টি আসন নির্বাচন করুন।');
      return;
    }
    if (!passengerName.trim() || !passengerPhone.trim()) {
      alert(lang === 'en' ? 'Please enter your name and phone number.' : 'আপনার নাম এবং মোবাইল নম্বর দিন।');
      return;
    }
    setStep('payment');
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    setStep('processing');

    // Simulate authentic payment processing delay
    setTimeout(async () => {
      try {
        const ticket = await bookSeat(
          bus.id,
          fromStopId,
          toStopId,
          selectedSeatIds,
          passengerName,
          passengerPhone,
          paymentMethod
        );
        setConfirmedTicket(ticket);
        setIsProcessing(false);
        setStep('success');
        onBookingSuccess(ticket);
      } catch (err) {
        console.error(err);
        setIsProcessing(false);
        setStep('payment');
      }
    }, 1800);
  };

  // Format timer
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/10"
              style={{ backgroundColor: route.color || '#10b981' }}
            >
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {lang === 'en' ? 'Reserve Seat on ' : 'সিট বুকিং - '} {bus.busNumber}
                {bus.isAc && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/40">
                    AC
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {route.code} • {bus.operator}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Seat Selection & Trip Details */}
        {step === 'seats' && (
          <div className="p-6 space-y-6">
            {/* Origin & Destination Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">
                  {lang === 'en' ? 'Boarding Stop' : 'উঠা হবে'}
                </label>
                <select
                  value={fromStopId}
                  onChange={(e) => setFromStopId(e.target.value)}
                  className="w-full bg-slate-900 text-white text-xs font-semibold p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {route.stops.map((sid) => {
                    const st = stops.find((s) => s.id === sid);
                    return (
                      <option key={sid} value={sid}>
                        {lang === 'en' ? st?.nameEn : st?.nameBn}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">
                  {lang === 'en' ? 'Drop-off Destination' : 'গন্তব্য'}
                </label>
                <select
                  value={toStopId}
                  onChange={(e) => setToStopId(e.target.value)}
                  className="w-full bg-slate-900 text-white text-xs font-semibold p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {route.stops.map((sid) => {
                    const st = stops.find((s) => s.id === sid);
                    return (
                      <option key={sid} value={sid}>
                        {lang === 'en' ? st?.nameEn : st?.nameBn}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Smart ETA Banner */}
            <div className="flex items-center justify-between bg-emerald-950/30 border border-emerald-500/30 px-4 py-2.5 rounded-xl text-xs">
              <div className="flex items-center gap-2 text-emerald-300">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>AI Smart ETA: {smartEta.etaMinutes} mins</strong> ({smartEta.trafficNotes})
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                ৳{farePerSeat} / seat
              </span>
            </div>

            {/* Bus Seat Layout Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  {lang === 'en' ? 'Select Preferred Seats (Front ➔ Back)' : 'আসন নির্বাচন করুন'}
                </h4>
                {selectedSeatIds.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 animate-pulse">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Held for: {formatTimer(holdTimerSeconds)}</span>
                  </div>
                )}
              </div>

              {/* Seat Legend */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mb-4 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-slate-800 border border-slate-600" />
                  <span>{lang === 'en' ? 'Available' : 'ফাঁকা'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-[9px]">✓</div>
                  <span>{lang === 'en' ? 'Selected' : 'নির্বাচিত'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-slate-800/50 opacity-40 border border-slate-700 text-slate-500 flex items-center justify-center text-[9px]">✕</div>
                  <span>{lang === 'en' ? 'Booked' : 'বুকড'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-pink-500/20 border border-pink-500/40 text-pink-300 flex items-center justify-center text-[9px]">🌸</div>
                  <span>{lang === 'en' ? 'Women/Elderly' : 'মহিলা/বয়স্ক'}</span>
                </div>
              </div>

              {/* Coach Floor Plan (2 x Aisle x 2) */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 max-h-56 overflow-y-auto">
                {/* Driver Cabin Indicator */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-400">🚪 Front Door / Scanner</span>
                  <span className="font-semibold text-slate-400">🚌 Driver Cabin ({bus.driverNameEn})</span>
                </div>

                {/* Rows Grid */}
                <div className="space-y-2">
                  {Array.from({ length: 9 }).map((_, rIdx) => {
                    const rowNum = rIdx + 1;
                    const seatA = bus.seats.find((s) => s.row === rowNum && s.col === 'A');
                    const seatB = bus.seats.find((s) => s.row === rowNum && s.col === 'B');
                    const seatC = bus.seats.find((s) => s.row === rowNum && s.col === 'C');
                    const seatD = bus.seats.find((s) => s.row === rowNum && s.col === 'D');

                    const renderSeatBtn = (seat?: BusSeat) => {
                      if (!seat) return <div className="w-9 h-9" />;
                      const isSelected = selectedSeatIds.includes(seat.id);
                      const isWomen = seat.category === 'women_elderly';

                      return (
                        <button
                          key={seat.id}
                          disabled={seat.isBooked}
                          onClick={() => handleSeatClick(seat)}
                          className={`w-9 h-9 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center relative ${
                            seat.isBooked
                              ? 'bg-slate-900/60 text-slate-600 border border-slate-800/80 cursor-not-allowed line-through'
                              : isSelected
                              ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300 shadow-md shadow-emerald-500/30 scale-105'
                              : isWomen
                              ? 'bg-pink-950/40 text-pink-300 border border-pink-500/40 hover:bg-pink-900/50'
                              : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:border-emerald-500'
                          }`}
                        >
                          <span>{seat.id}</span>
                          {isWomen && !isSelected && !seat.isBooked && (
                            <span className="text-[8px] leading-none text-pink-400">🌸</span>
                          )}
                        </button>
                      );
                    };

                    return (
                      <div key={rowNum} className="flex items-center justify-between px-2">
                        {/* Left Side (A, B) */}
                        <div className="flex items-center gap-2">
                          {renderSeatBtn(seatA)}
                          {renderSeatBtn(seatB)}
                        </div>

                        {/* Aisle */}
                        <span className="text-[10px] font-mono text-slate-600">R{rowNum}</span>

                        {/* Right Side (C, D) */}
                        <div className="flex items-center gap-2">
                          {renderSeatBtn(seatC)}
                          {renderSeatBtn(seatD)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Commuter Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  {lang === 'en' ? 'Passenger Name' : 'যাত্রীর নাম'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    className="w-full bg-slate-950 text-white text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Full Name"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  {lang === 'en' ? 'Mobile Number (for SMS & WhatsApp Ticket)' : 'মোবাইল নম্বর'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={passengerPhone}
                    onChange={(e) => setPassengerPhone(e.target.value)}
                    className="w-full bg-slate-950 text-white text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="017XXXXXXXX"
                  />
                </div>
              </div>
            </div>

            {/* Footer Summary & Proceed Button */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <div>
                <span className="text-xs text-slate-400 block">
                  {selectedSeatIds.length} {lang === 'en' ? 'seat(s) selected' : 'সিট নির্বাচিত'}:{' '}
                  <strong className="text-white">{selectedSeatIds.join(', ') || 'None'}</strong>
                </span>
                <span className="text-base font-black text-emerald-400">৳{totalAmount} BDT</span>
              </div>

              <button
                disabled={selectedSeatIds.length === 0}
                onClick={handleProceedToPayment}
                className={`py-3 px-6 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all ${
                  selectedSeatIds.length > 0
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-500/20 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>{lang === 'en' ? 'Proceed to Payment' : 'পেমেন্টে এগিয়ে যান'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Authentic Bangladeshi Payment Gateways Checkout */}
        {step === 'payment' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">
                  {lang === 'en' ? 'Select Payment Gateway' : 'পেমেন্ট মাধ্যম বেছে নিন'}
                </h4>
                <p className="text-xs text-slate-400">
                  {lang === 'en' ? 'Instant digital QR ticket generation' : 'তাত্ক্ষণিক ডিজিটাল কিউআর টিকেট'}
                </p>
              </div>
              <span className="text-base font-extrabold text-emerald-400">৳{totalAmount}</span>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => setPaymentMethod('bKash')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'bKash'
                    ? 'bg-pink-600/20 border-pink-500 text-pink-400 ring-2 ring-pink-500/40'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-[#E2136E] text-white flex items-center justify-center font-black text-[11px] shadow">
                  bK
                </div>
                <span className="text-[11px] font-bold">bKash</span>
              </button>

              <button
                onClick={() => setPaymentMethod('Nagad')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'Nagad'
                    ? 'bg-amber-600/20 border-amber-500 text-amber-400 ring-2 ring-amber-500/40'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-[#F7941D] text-white flex items-center justify-center font-black text-[11px] shadow">
                  N
                </div>
                <span className="text-[11px] font-bold">Nagad</span>
              </button>

              <button
                onClick={() => setPaymentMethod('Rocket')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'Rocket'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-400 ring-2 ring-purple-500/40'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-[#8C3494] text-white flex items-center justify-center font-black text-[11px] shadow">
                  🚀
                </div>
                <span className="text-[11px] font-bold">Rocket</span>
              </button>

              <button
                onClick={() => setPaymentMethod('SSLCommerz')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'SSLCommerz'
                    ? 'bg-cyan-600/20 border-cyan-500 text-cyan-400 ring-2 ring-cyan-500/40'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-black text-[11px] shadow">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold">Cards</span>
              </button>
            </div>

            {/* Gateway UI Simulation Box */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              {paymentMethod === 'bKash' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-pink-400 flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      bKash Payment Gateway
                    </span>
                    <span className="text-[11px] text-slate-400">Merchant: DhakaMove BRTA</span>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">bKash Account Number</label>
                    <input
                      type="text"
                      disabled
                      value={passengerPhone}
                      className="w-full bg-slate-900 text-slate-300 text-xs px-3 py-2 rounded-xl border border-slate-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">OTP (Auto-filled)</label>
                      <input
                        type="text"
                        value={bKashOtp}
                        onChange={(e) => setBKashOtp(e.target.value)}
                        className="w-full bg-slate-900 text-emerald-400 font-mono text-xs px-3 py-2 rounded-xl border border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Enter 5-digit PIN</label>
                      <input
                        type="password"
                        value={bKashPin}
                        onChange={(e) => setBKashPin(e.target.value)}
                        placeholder="•••••"
                        maxLength={5}
                        className="w-full bg-slate-900 text-white font-mono text-xs px-3 py-2 rounded-xl border border-slate-700 focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'Nagad' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-amber-400">Nagad Direct Debit</span>
                    <span className="text-[11px] text-slate-400">Amount: ৳{totalAmount}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Your registered Nagad account <strong className="text-white">{passengerPhone}</strong> will be debited.
                  </p>
                </div>
              )}

              {paymentMethod === 'Rocket' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-purple-400">DBBL Rocket Pay</span>
                    <span className="text-[11px] text-slate-400">Amount: ৳{totalAmount}</span>
                  </div>
                  <p className="text-xs text-slate-400">Instant authorization from your Rocket 12-digit wallet.</p>
                </div>
              )}

              {paymentMethod === 'SSLCommerz' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-cyan-400">SSLCommerz Secured Gateway</span>
                    <span className="text-[11px] text-slate-400">Visa / Mastercard / NexusPay</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Card Number: 4532 •••• •••• 8821"
                    defaultValue="4532 •••• •••• 8821"
                    className="w-full bg-slate-900 text-slate-300 text-xs px-3 py-2 rounded-xl border border-slate-700"
                  />
                </div>
              )}
            </div>

            {/* Security Guarantee Notice */}
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                256-bit SSL encrypted. Seat release protection active: if you miss boarding, refund credits apply automatically.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                onClick={() => setStep('seats')}
                className="py-2.5 px-4 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Back to Seats
              </button>

              <button
                onClick={handleConfirmPayment}
                className="py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Pay ৳{totalAmount} & Generate QR Pass</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Processing */}
        {step === 'processing' && (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin mx-auto" />
            <h4 className="text-base font-bold text-white">
              {lang === 'en' ? 'Securing Seat & Generating Digital QR Ticket...' : 'আসন নিশ্চিত করা হচ্ছে...'}
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Connecting with {paymentMethod} payment gateway & caching offline cryptographic QR ticket...
            </p>
          </div>
        )}

        {/* Step 4: Success & E-Ticket QR Code Pass */}
        {step === 'success' && confirmedTicket && (
          <div className="p-6 space-y-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-4 ring-emerald-500/10">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h4 className="text-lg font-black text-white">
                {lang === 'en' ? 'Seat Reserved Successfully!' : 'সিট বুকিং সফল হয়েছে!'}
              </h4>
              <p className="text-xs text-slate-400 font-mono">
                Booking ID: {confirmedTicket.bookingRef}
              </p>
            </div>

            {/* Crisp QR Code Box */}
            <div className="bg-white p-4 rounded-2xl shadow-xl inline-block mx-auto border-4 border-slate-800">
              {confirmedTicket.qrCodeDataUrl ? (
                <img
                  src={confirmedTicket.qrCodeDataUrl}
                  alt="Boarding QR Ticket"
                  className="w-48 h-48 mx-auto"
                />
              ) : (
                <div className="w-48 h-48 bg-slate-100 flex items-center justify-center font-mono text-xs text-slate-800">
                  QR Generated
                </div>
              )}
              <p className="text-[10px] font-bold text-slate-800 mt-2 uppercase tracking-widest">
                Scan on Bus Boarding
              </p>
            </div>

            {/* Ticket Summary Details */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-left grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 text-[10px] block">Route & Bus</span>
                <strong className="text-white block">{confirmedTicket.routeCode}</strong>
                <span className="text-slate-400 text-[11px]">{confirmedTicket.busNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Seats & Fare</span>
                <strong className="text-emerald-400 block">{confirmedTicket.seatNumbers.join(', ')}</strong>
                <span className="text-slate-400 text-[11px]">৳{confirmedTicket.totalFareBdt} ({confirmedTicket.paymentMethod})</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">From</span>
                <strong className="text-slate-200">{confirmedTicket.fromStopNameEn}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">To</span>
                <strong className="text-slate-200">{confirmedTicket.toStopNameEn}</strong>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={onClose}
                className="py-2.5 px-6 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all"
              >
                Close & View on Map
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
