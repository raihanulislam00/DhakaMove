import React, { useState, useRef } from 'react';
import { useTransit } from '../context/TransitContext';
import { STOP_CANVAS_COORDS } from '../data/dhakaTransitData';
import { BusVehicle, BusStop } from '../types/transit';
import {
  Navigation,
  Layers,
  Flame,
  Bus,
  Compass,
  ZoomIn,
  ZoomOut,
  Maximize2,
  AlertTriangle,
  Users,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  MapPin,
} from 'lucide-react';

interface DhakaMapProps {
  onSelectBusForBooking?: (bus: BusVehicle) => void;
  onSelectStop?: (stop: BusStop) => void;
}

export const DhakaMap: React.FC<DhakaMapProps> = ({
  onSelectBusForBooking,
  onSelectStop,
}) => {
  const {
    buses,
    routes,
    stops,
    selectedRouteId,
    selectedBusId,
    setSelectedBusId,
    setSelectedRouteId,
    userLocation,
    weather,
    lang,
    setCommuterTab,
  } = useTransit();

  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showTrafficHeat, setShowTrafficHeat] = useState(true);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [showMetroLine, setShowMetroLine] = useState(true);
  const [hoveredStop, setHoveredStop] = useState<BusStop | null>(null);
  const [hoveredBus, setHoveredBus] = useState<BusVehicle | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const activeBus = buses.find((b) => b.id === selectedBusId) || buses[0];

  // Helper to interpolate canvas coordinates for moving buses
  const getBusCanvasPosition = (bus: BusVehicle) => {
    const route = routes.find((r) => r.id === bus.routeId);
    if (!route || route.stops.length === 0) return { x: 500, y: 400 };

    const currentStopId = route.stops[bus.currentStopIndex];
    const nextStopId = route.stops[(bus.currentStopIndex + 1) % route.stops.length];

    const posA = STOP_CANVAS_COORDS[currentStopId] || { x: 500, y: 400 };
    const posB = STOP_CANVAS_COORDS[nextStopId] || { x: 500, y: 400 };

    return {
      x: posA.x + (posB.x - posA.x) * bus.progressToNextStop,
      y: posA.y + (posB.y - posA.y) * bus.progressToNextStop,
    };
  };

  // Drag pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const centerOnBus = (bus: BusVehicle) => {
    setSelectedBusId(bus.id);
    const pos = getBusCanvasPosition(bus);
    // Center at 800x950 canvas viewport
    setPanOffset({
      x: -(pos.x - 400) * zoomLevel,
      y: -(pos.y - 450) * zoomLevel,
    });
  };

  const centerOnUser = () => {
    const userStopPos = STOP_CANVAS_COORDS[userLocation.nearestStopId] || { x: 500, y: 350 };
    setPanOffset({
      x: -(userStopPos.x - 400) * zoomLevel,
      y: -(userStopPos.y - 450) * zoomLevel,
    });
  };

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Crowd level colors
  const getCrowdBadge = (crowd: string) => {
    if (crowd === 'Comfortable') return { bg: 'bg-emerald-500', text: 'text-emerald-400', label: lang === 'en' ? 'Comfortable' : 'আরামদায়ক' };
    if (crowd === 'Moderate') return { bg: 'bg-amber-500', text: 'text-amber-400', label: lang === 'en' ? 'Moderate' : 'মাঝারি' };
    return { bg: 'bg-rose-500', text: 'text-rose-400', label: lang === 'en' ? 'Packed' : 'ভীড়' };
  };

  return (
    <div className="relative w-full h-[620px] lg:h-[720px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl select-none flex flex-col">
      {/* Floating HUD Badges on Top Left / Center */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Route Filter Chips */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/70 shadow-lg pointer-events-auto overflow-x-auto max-w-[85vw] sm:max-w-none">
          <button
            onClick={() => setSelectedRouteId(null)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              selectedRouteId === null
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            {lang === 'en' ? 'All Corridors' : 'সব রুট'}
          </button>
          {routes.map((r) => {
            const isSel = selectedRouteId === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setSelectedRouteId(isSel ? null : r.id)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  isSel ? 'bg-slate-800 text-white ring-1 ring-emerald-400' : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                <span>{r.code.split(' ')[0]} {r.code.split(' ')[1]}</span>
              </button>
            );
          })}
        </div>

        {/* Map View Controls */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/70 shadow-lg pointer-events-auto">
          <button
            onClick={() => setShowTrafficHeat(!showTrafficHeat)}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
              showTrafficHeat ? 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/40' : 'text-slate-400 hover:bg-slate-800'
            }`}
            title="Toggle Dhaka Traffic Heatmap"
          >
            <Flame className="w-4 h-4 text-rose-400" />
            <span className="hidden sm:inline">{lang === 'en' ? 'Traffic Flow' : 'ট্রাফিক'}</span>
          </button>

          <button
            onClick={() => setShowMetroLine(!showMetroLine)}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
              showMetroLine ? 'bg-teal-500/20 text-teal-300 ring-1 ring-teal-500/40' : 'text-slate-400 hover:bg-slate-800'
            }`}
            title="MRT Line 6 Metro Overlay"
          >
            <Layers className="w-4 h-4 text-teal-400" />
            <span className="hidden sm:inline">MRT-6</span>
          </button>

          <div className="h-4 w-px bg-slate-700 mx-0.5" />

          <button
            onClick={() => setZoomLevel((z) => Math.min(2.2, z + 0.25))}
            className="p-1.5 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.25))}
            className="p-1.5 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={centerOnUser}
            className="p-1.5 text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Center on My Location (Kakoli)"
          >
            <Compass className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-1.5 text-slate-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Reset Map View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main SVG Vector Canvas */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`w-full h-full cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
      >
        <svg
          viewBox="0 0 850 980"
          className="w-full h-full transition-transform duration-75"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center',
          }}
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.75" strokeOpacity="0.4" />
            </pattern>
            {/* Glow Filter for Active Buses */}
            <filter id="busGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Water Linear Gradient */}
            <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#082f49" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.4" />
            </linearGradient>
            {/* Lake Gradient */}
            <linearGradient id="lakeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* Background & Urban Area Shapes */}
          <rect width="850" height="980" fill="#090d16" />
          <rect width="850" height="980" fill="url(#mapGrid)" />

          {/* Dhaka Water Bodies: Buriganga River (Bottom), Turag River (West), Hatirjheel & Gulshan Lakes */}
          {/* Buriganga River (South) */}
          <path
            d="M 100 920 Q 300 890, 520 900 T 800 930 L 850 980 L 50 980 Z"
            fill="url(#waterGrad)"
            stroke="#0284c7"
            strokeWidth="1.5"
            strokeOpacity="0.5"
          />
          <text x="360" y="945" fill="#38bdf8" fontSize="11" fontWeight="bold" opacity="0.4" letterSpacing="3">
            BURIGANGA RIVER (বুড়িগঙ্গা নদী)
          </text>

          {/* Turag River (West) */}
          <path
            d="M 60 50 Q 140 250, 100 450 T 80 750"
            fill="none"
            stroke="url(#waterGrad)"
            strokeWidth="24"
            strokeLinecap="round"
          />
          <text x="40" y="320" fill="#38bdf8" fontSize="10" fontWeight="bold" opacity="0.35" transform="rotate(-75 40,320)">
            TURAG RIVER
          </text>

          {/* Hatirjheel Lake (Center organic loop) */}
          <path
            d="M 450 490 Q 520 470, 580 500 Q 640 530, 590 560 Q 520 540, 480 530 Z"
            fill="url(#lakeGrad)"
            stroke="#38bdf8"
            strokeWidth="1"
            strokeOpacity="0.6"
          />
          <text x="500" y="525" fill="#7dd3fc" fontSize="9" fontWeight="600" opacity="0.6" letterSpacing="1">
            HATIRJHEEL (হাতিরঝিল)
          </text>

          {/* Gulshan Lake & Banani Lake */}
          <path
            d="M 540 330 Q 570 380, 560 440"
            fill="none"
            stroke="#0284c7"
            strokeWidth="12"
            strokeLinecap="round"
            strokeOpacity="0.4"
          />
          <path
            d="M 630 360 Q 640 430, 620 480"
            fill="none"
            stroke="#0284c7"
            strokeWidth="10"
            strokeLinecap="round"
            strokeOpacity="0.3"
          />

          {/* Dhaka Elevated Expressway & Major Road Corridors */}
          <path
            d="M 525 140 L 540 220 L 550 280 L 500 350 L 490 430 L 450 490 L 440 550 L 460 600 L 470 670 L 530 730 L 560 770 L 540 880"
            fill="none"
            stroke="#1e293b"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 260 200 L 280 290 L 300 360 L 340 450 L 440 550"
            fill="none"
            stroke="#1e293b"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 180 400 L 260 480 L 330 540 L 370 670 L 380 720 L 370 770"
            fill="none"
            stroke="#1e293b"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Metro Rail (MRT Line 6) Overlay - Uttara to Motijheel via Mirpur & Farmgate */}
          {showMetroLine && (
            <g opacity="0.75">
              <path
                d="M 500 60 L 480 120 L 260 200 L 280 290 L 300 360 L 340 450 L 450 490 L 440 550 L 460 600 L 470 670 L 530 730 L 560 770"
                fill="none"
                stroke="#14b8a6"
                strokeWidth="4"
                strokeDasharray="8 6"
                strokeLinecap="round"
              />
              <text x="210" y="240" fill="#2dd4bf" fontSize="9" fontWeight="bold" opacity="0.8">
                MRT LINE 6 (মেট্রোরেল)
              </text>
            </g>
          )}

          {/* Traffic Congestion Heatmap Overlays */}
          {showTrafficHeat && (
            <g opacity="0.6">
              {/* Farmgate Red Bottleneck */}
              <circle cx="440" cy="550" r="38" fill="url(#farmgateHeat)" opacity="0.8" />
              <radialGradient id="farmgateHeat">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#ef4444" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </radialGradient>

              {/* Mohakhali Flyover Amber Merge */}
              <circle cx="490" cy="430" r="30" fill="url(#mohakhaliHeat)" opacity="0.7" />
              <radialGradient id="mohakhaliHeat">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7" />
                <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>

              {/* Mirpur 10 Circle Amber */}
              <circle cx="280" cy="290" r="28" fill="url(#mirpurHeat)" opacity="0.7" />
              <radialGradient id="mirpurHeat">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7" />
                <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>
            </g>
          )}

          {/* Key Dhaka Landmarks */}
          {showLandmarks && (
            <g opacity="0.75">
              {/* Airport Landmark */}
              <g transform="translate(560, 150)">
                <rect x="0" y="0" width="75" height="20" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                <text x="6" y="14" fill="#94a3b8" fontSize="8" fontWeight="600">✈️ Airport DAC</text>
              </g>
              {/* National Parliament (Jatiya Sangsad) */}
              <g transform="translate(350, 480)">
                <rect x="0" y="0" width="84" height="20" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                <text x="6" y="14" fill="#94a3b8" fontSize="8" fontWeight="600">🏛️ Jatiya Sangsad</text>
              </g>
              {/* Motijheel Shapla Chhattor */}
              <g transform="translate(580, 785)">
                <rect x="0" y="0" width="88" height="20" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                <text x="6" y="14" fill="#94a3b8" fontSize="8" fontWeight="600">🏙️ Shapla Chhattor</text>
              </g>
            </g>
          )}

          {/* Bus Route Polylines */}
          {routes.map((route) => {
            const isSelected = selectedRouteId === route.id || selectedRouteId === null;
            const strokeWidth = selectedRouteId === route.id ? 7 : isSelected ? 4 : 2;
            const opacity = selectedRouteId === route.id ? 1 : selectedRouteId === null ? 0.8 : 0.2;

            const pathD = route.polyline.reduce(
              (acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
              ''
            );

            return (
              <g key={route.id}>
                {/* Route Glow when selected */}
                {selectedRouteId === route.id && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke={route.color}
                    strokeWidth="14"
                    strokeOpacity="0.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {/* Main Route Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={route.color}
                  strokeWidth={strokeWidth}
                  strokeOpacity={opacity}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedRouteId(route.id)}
                />
              </g>
            );
          })}

          {/* Bus Stop Markers */}
          {stops.map((stop) => {
            const coords = STOP_CANVAS_COORDS[stop.id];
            if (!coords) return null;

            const isUserNearest = stop.id === userLocation.nearestStopId;
            const isHovered = hoveredStop?.id === stop.id;

            return (
              <g
                key={stop.id}
                transform={`translate(${coords.x}, ${coords.y})`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredStop(stop)}
                onMouseLeave={() => setHoveredStop(null)}
                onClick={() => {
                  onSelectStop?.(stop);
                }}
              >
                {/* Nearest Stop Pulse Animation */}
                {isUserNearest && (
                  <circle r="16" fill="#10b981" opacity="0.25" className="animate-ping" />
                )}

                {/* Stop Circle */}
                <circle
                  r={isUserNearest ? 7 : isHovered ? 6 : 4.5}
                  fill={isUserNearest ? '#10b981' : stop.isTerminal ? '#f59e0b' : '#334155'}
                  stroke={isUserNearest ? '#ffffff' : '#94a3b8'}
                  strokeWidth={isUserNearest ? 2.5 : 1.5}
                />

                {/* Stop Name Label */}
                {(isHovered || isUserNearest || zoomLevel > 1.2) && (
                  <g transform="translate(10, 3)" className="pointer-events-none">
                    <rect
                      x="0"
                      y="-12"
                      width={lang === 'en' ? stop.nameEn.length * 6.5 + 14 : stop.nameBn.length * 8 + 14}
                      height="18"
                      rx="4"
                      fill="#0f172a"
                      stroke={isUserNearest ? '#10b981' : '#334155'}
                      strokeWidth="1"
                    />
                    <text
                      x="7"
                      y="1"
                      fill={isUserNearest ? '#34d399' : '#e2e8f0'}
                      fontSize="9.5"
                      fontWeight="600"
                    >
                      {lang === 'en' ? stop.nameEn : stop.nameBn}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* User Location Marker (Pulsing Pin) */}
          <g
            transform={`translate(${STOP_CANVAS_COORDS[userLocation.nearestStopId]?.x || 500}, ${
              (STOP_CANVAS_COORDS[userLocation.nearestStopId]?.y || 350) - 12
            })`}
          >
            <circle r="12" fill="#3b82f6" opacity="0.3" className="animate-pulse" />
            <circle r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
          </g>

          {/* Animated Moving Buses */}
          {buses.map((bus) => {
            const pos = getBusCanvasPosition(bus);
            const route = routes.find((r) => r.id === bus.routeId);
            const isSelected = selectedBusId === bus.id;
            const isHovered = hoveredBus?.id === bus.id;
            const crowd = getCrowdBadge(bus.currentCrowd);

            // Filter if route filter is active
            if (selectedRouteId && bus.routeId !== selectedRouteId) {
              return null;
            }

            return (
              <g
                key={bus.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer transition-all duration-1000 ease-linear"
                onMouseEnter={() => setHoveredBus(bus)}
                onMouseLeave={() => setHoveredBus(null)}
                onClick={() => {
                  setSelectedBusId(bus.id);
                  onSelectBusForBooking?.(bus);
                }}
              >
                {/* Active Selection Glow Ring */}
                {isSelected && (
                  <circle
                    r="22"
                    fill={route?.color || '#10b981'}
                    opacity="0.35"
                    className="animate-pulse"
                  />
                )}

                {/* Bus Marker Capsule */}
                <rect
                  x="-16"
                  y="-12"
                  width="32"
                  height="24"
                  rx="6"
                  fill="#0f172a"
                  stroke={isSelected ? '#ffffff' : route?.color || '#10b981'}
                  strokeWidth={isSelected ? 2.5 : 1.8}
                  filter="url(#busGlow)"
                />

                {/* Mini Bus Icon */}
                <g transform="translate(-7, -7) scale(0.65)">
                  <path
                    d="M4 16c0 .88.39 1.67 1 2.22V20a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h8v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm9 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM5 6h14v5H5V6z"
                    fill={route?.color || '#38bdf8'}
                  />
                </g>

                {/* Crowd Level Indicator Dot */}
                <circle cx="10" cy="-8" r="4" fill={crowd.bg.replace('bg-', '#')} stroke="#0f172a" strokeWidth="1.5" />

                {/* Speed & Bus ID Tag */}
                <g transform="translate(-18, 16)" className="pointer-events-none">
                  <rect x="0" y="0" width="36" height="14" rx="3" fill="#020617" opacity="0.9" />
                  <text x="18" y="10" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">
                    {bus.currentSpeedKmH} km/h
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Floating Selected Bus Quick-HUD Card (Bottom Left) */}
      {activeBus && (
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-20 bg-slate-900/95 backdrop-blur-xl p-5 rounded-2xl border border-slate-700/80 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/10"
                style={{
                  backgroundColor: routes.find((r) => r.id === activeBus.routeId)?.color || '#10b981',
                }}
              >
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white tracking-tight">{activeBus.busNumber}</h4>
                  {activeBus.isAc && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
                      AC
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  {activeBus.operator} • Driver {lang === 'en' ? activeBus.driverNameEn : activeBus.driverNameBn} ({activeBus.driverRating} ⭐)
                </p>
              </div>
            </div>

            {/* Crowd Badge */}
            <div className="flex flex-col items-end">
              <span
                className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full flex items-center gap-1 border ${
                  activeBus.currentCrowd === 'Comfortable'
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : activeBus.currentCrowd === 'Moderate'
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                }`}
              >
                <Users className="w-3 h-3" />
                {activeBus.currentCrowd}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 font-mono">
                {activeBus.totalSeats - activeBus.bookedSeatsCount} seats left
              </span>
            </div>
          </div>

          {/* Next Stop & ETA Row */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800 mb-3.5 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-slate-400 text-[10px] block uppercase tracking-wider font-semibold">
                  {lang === 'en' ? 'Next Stop' : 'পরবর্তী স্টপ'}
                </span>
                <span className="font-bold text-slate-200 truncate block">
                  {stops.find((s) => s.id === activeBus.nextStopId)?.nameEn || 'Next Station'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
              <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <span className="text-slate-400 text-[10px] block uppercase tracking-wider font-semibold">
                  {lang === 'en' ? 'Live Arrival' : 'পৌঁছাবে'}
                </span>
                <span className="font-black text-cyan-300 text-sm font-mono">
                  {activeBus.etaToNextStopMinutes} mins
                </span>
              </div>
            </div>
          </div>

          {/* Delay Alert (if any) */}
          {activeBus.delayMinutes > 5 && (
            <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 px-3 py-2 rounded-xl border border-amber-500/20 mb-3.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span className="truncate">{activeBus.delayReason || 'Traffic congestion causing slight delay.'}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onSelectBusForBooking?.(activeBus);
                setCommuterTab('plan');
              }}
              className="flex-1 py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {lang === 'en' ? 'Book Seat (৳' + (routes.find((r) => r.id === activeBus.routeId)?.standardFareBdt || 45) + ')' : 'সিট বুক করুন (৳' + (routes.find((r) => r.id === activeBus.routeId)?.standardFareBdt || 45) + ')'}
            </button>
            <button
              onClick={() => centerOnBus(activeBus)}
              className="py-2.5 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 text-slate-400" />
              {lang === 'en' ? 'Track' : 'ট্র্যাক'}
            </button>
          </div>
        </div>
      )}

      {/* Floating Bottom Left Telemetry Summary (Current ETA & Crowd Level) */}
      <div className="absolute bottom-4 right-4 hidden md:flex items-center gap-3 z-10">
        <div className="rounded-xl bg-slate-900/90 p-3 shadow-xl backdrop-blur-md border border-slate-700/80 min-w-[100px]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current ETA</p>
          <p className="text-xl font-black text-white font-mono">08 MIN</p>
        </div>
        <div className="rounded-xl bg-slate-900/90 p-3 shadow-xl backdrop-blur-md border border-slate-700/80 min-w-[100px]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Crowd Load</p>
          <p className="text-xl font-black text-emerald-400 font-mono">35%</p>
        </div>
      </div>
    </div>
  );
};
