import React, { useState } from 'react';
import { useTransit } from '../context/TransitContext';
import { BusVehicle } from '../types/transit';
import {
  Bot,
  Send,
  Sparkles,
  MapPin,
  Clock,
  Bus,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  Compass,
} from 'lucide-react';

interface AITripAssistantProps {
  onSelectBusForBooking?: (bus: BusVehicle) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  suggestedBusId?: string;
  suggestedRouteId?: string;
}

export const AITripAssistant: React.FC<AITripAssistantProps> = ({
  onSelectBusForBooking,
}) => {
  const { buses, routes, stops, userLocation, weather, timeOfDay, lang, setCommuterTab } = useTransit();

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text:
        lang === 'en'
          ? "Salam! I am your DhakaMove AI Trip Assistant. Ask me in Bangla, Banglish, or English for the best routes, real-time traffic delays, AC buses, and departure alerts. How can I assist your commute today?"
          : "সালাম! আমি আপনার ঢাকা মুভ এআই ট্রিপ অ্যাসিস্ট্যান্ট। ঢাকা শহরের যে কোনো গন্তব্যে দ্রুত ও আরামদায়ক বাসের রুট, লাইভ ট্রাফিক ও সিট বুকিং সম্পর্কে বাংলায় অথবা ইংরেজিতে জিজ্ঞাসা করুন।",
      timestamp: new Date(),
    },
  ]);

  const quickPrompts = [
    {
      labelEn: "Uttara to Motijheel by 9:00 AM",
      labelBn: "উত্তরা থেকে মতিঝিল ৯টার মধ্যে",
      query: "Amare sokal 9tar moddhe Motijheel pouchate hobe, ami Uttaray achi. Kon bus bhalo hobe?",
    },
    {
      labelEn: "Mirpur 10 to Gulshan-2 Traffic",
      labelBn: "মিরপুর ১০ থেকে গুলশান ২ ট্রাফিক",
      query: "Mirpur 10 theke Gulshan 2 jabo, ekhon traffic situation kemon ar kon bus pabo?",
    },
    {
      labelEn: "AC Bus from Dhanmondi to Airport",
      labelBn: "ধানমন্ডি থেকে এয়ারপোর্ট এসি বাস",
      query: "Is there an AC bus from Dhanmondi to Airport right now? How long will it take?",
    },
    {
      labelEn: "Farmgate Jam & Rain Impact",
      labelBn: "ফার্মগেটে জ্যাম ও বৃষ্টির প্রভাব",
      query: "Heavy rain detected in Dhaka, how much extra delay at Farmgate and Mohakhali?",
    },
  ];

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/trip-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          userLocation: userLocation.name,
          weather,
          timeOfDay,
        }),
      });

      const data = await response.json();
      const aiReply: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: data.reply || data.error || 'Here is your optimal transit recommendation.',
        timestamp: new Date(),
        suggestedBusId: data.suggestedBusId || 'DM-1901',
        suggestedRouteId: data.suggestedRouteId || 'route-19',
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      console.error('Trip assistant fetch error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_err_${Date.now()}`,
          sender: 'ai',
          text:
            lang === 'en'
              ? 'Recommendation: Take Route 19 (Uttara ➔ Motijheel) from Kakoli. Current ETA 43 minutes with 14 seats available.'
              : 'পরামর্শ: কাকলী থেকে রুট ১৯ বাসে উঠুন। প্রায় ৪৩ মিনিটে পৌঁছাতে পারবেন এবং বাসে আসন ফাঁকা আছে।',
          timestamp: new Date(),
          suggestedBusId: 'DM-1901',
          suggestedRouteId: 'route-19',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[620px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Assistant Header */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                {lang === 'en' ? 'DhakaMove AI Trip Assistant' : 'ঢাকা মুভ এআই ট্রিপ অ্যাসিস্ট্যান্ট'}
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Gemini 3.7
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {lang === 'en' ? 'Bilingual Dhaka transit routing & live traffic predictions' : 'বাংলা ও ইংরেজিতে স্মার্ট রুট ও ট্রাফিক নির্দেশনা'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Prompts Carousel */}
      <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-400" />
          {lang === 'en' ? 'Quick Ask:' : 'দ্রুত প্রশ্ন:'}
        </span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p.query)}
            className="px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 rounded-lg border border-slate-700/80 whitespace-nowrap transition-all flex items-center gap-1.5"
          >
            <span>{lang === 'en' ? p.labelEn : p.labelBn}</span>
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const suggestedBus = msg.suggestedBusId ? buses.find((b) => b.id === msg.suggestedBusId) : null;
          const suggestedRoute = msg.suggestedRouteId ? routes.find((r) => r.id === msg.suggestedRouteId) : null;

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-slate-950 font-medium rounded-tr-none shadow-md shadow-emerald-500/10'
                    : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none space-y-3'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Rich Direct Booking Action Card if AI recommended a bus */}
                {!isUser && suggestedBus && (
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700 flex items-center justify-between gap-3 mt-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-950 font-bold text-xs"
                        style={{ backgroundColor: suggestedRoute?.color || '#10b981' }}
                      >
                        <Bus className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">{suggestedBus.busNumber}</div>
                        <div className="text-[10px] text-slate-400">
                          {suggestedRoute?.code} • {suggestedBus.totalSeats - suggestedBus.bookedSeatsCount} seats available
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onSelectBusForBooking?.(suggestedBus);
                        setCommuterTab('plan');
                      }}
                      className="py-1.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center gap-1 shadow-md"
                    >
                      <span>Book (৳{suggestedRoute?.standardFareBdt || 45})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className={`text-[9px] ${isUser ? 'text-slate-900/70' : 'text-slate-500'} text-right`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 items-center text-xs text-slate-400">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-950 px-4 py-2.5 rounded-2xl rounded-tl-none border border-slate-800 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-teal-400 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
              <span className="text-slate-400 text-[11px] ml-1">Analyzing Dhaka corridor traffic...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={
            lang === 'en'
              ? 'Ask in Bangla, Banglish or English (e.g., Kuril to Farmgate fast bus)...'
              : 'বাংলা বা ইংরেজিতে লিখুন (যেমন: কুড়িল থেকে ফার্মগেট দ্রুততম বাস কোনটি?)...'
          }
          className="flex-1 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isLoading}
          className={`p-3 rounded-xl font-bold transition-all flex items-center justify-center ${
            inputQuery.trim() && !isLoading
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
