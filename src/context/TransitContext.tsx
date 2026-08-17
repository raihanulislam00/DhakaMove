import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import QRCode from 'qrcode';
import {
  BusRoute,
  BusStop,
  BusVehicle,
  BookingTicket,
  ProactiveAlert,
  JourneyShareSession,
  TripRating,
  WeatherCondition,
  TimeOfDay,
  CrowdLevel,
} from '../types/transit';
import {
  DHAKA_BUS_ROUTES,
  DHAKA_BUS_STOPS,
  INITIAL_BUS_FLEET,
  DHAKA_BOTTLENECKS,
  STOP_CANVAS_COORDS,
} from '../data/dhakaTransitData';

interface TransitContextType {
  buses: BusVehicle[];
  routes: BusRoute[];
  stops: BusStop[];
  selectedRouteId: string | null;
  selectedBusId: string | null;
  activeTicket: BookingTicket | null;
  ticketsHistory: BookingTicket[];
  alerts: ProactiveAlert[];
  userLocation: { lat: number; lng: number; nearestStopId: string; name: string };
  weather: WeatherCondition;
  timeOfDay: TimeOfDay;
  lang: 'en' | 'bn';
  journeyShare: JourneyShareSession | null;
  simSpeed: number;
  isSimRunning: boolean;
  activeView: 'commuter' | 'operator' | 'planner';
  commuterTab: 'map' | 'plan' | 'nearby' | 'ai_assistant' | 'tickets' | 'safety' | 'rate';
  
  // Actions
  setSelectedRouteId: (id: string | null) => void;
  setSelectedBusId: (id: string | null) => void;
  setWeather: (w: WeatherCondition) => void;
  setTimeOfDay: (t: TimeOfDay) => void;
  setLang: (l: 'en' | 'bn') => void;
  setSimSpeed: (speed: number) => void;
  setIsSimRunning: (running: boolean) => void;
  setActiveView: (view: 'commuter' | 'operator' | 'planner') => void;
  setCommuterTab: (tab: 'map' | 'plan' | 'nearby' | 'ai_assistant' | 'tickets' | 'safety' | 'rate') => void;
  setUserLocation: (loc: { lat: number; lng: number; nearestStopId: string; name: string }) => void;
  
  bookSeat: (
    busId: string,
    fromStopId: string,
    toStopId: string,
    seatIds: string[],
    passengerName: string,
    passengerPhone: string,
    paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'SSLCommerz'
  ) => Promise<BookingTicket>;
  
  cancelTicket: (ticketId: string) => void;
  verifyTicketQR: (qrString: string) => { success: boolean; message: string; ticket?: BookingTicket };
  startJourneyShare: (ticketId: string, contactName: string, contactPhone: string) => void;
  triggerEmergencySOS: (notes?: string) => void;
  submitTripRating: (rating: Omit<TripRating, 'id' | 'submittedAt'>) => void;
  dismissAlert: (id: string) => void;
  calculateSmartETA: (routeId: string, fromStopId: string, toStopId: string) => {
    etaMinutes: number;
    baseMinutes: number;
    delayMinutes: number;
    congestionRisk: 'low' | 'moderate' | 'high';
    trafficNotes: string;
  };
}

const TransitContext = createContext<TransitContextType | null>(null);

const STORAGE_KEY_TICKETS = 'dhakamove_tickets_v1';
const STORAGE_KEY_ACTIVE_TICKET = 'dhakamove_active_ticket_v1';

export const TransitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [buses, setBuses] = useState<BusVehicle[]>(INITIAL_BUS_FLEET);
  const [routes] = useState<BusRoute[]>(DHAKA_BUS_ROUTES);
  const [stops] = useState<BusStop[]>(DHAKA_BUS_STOPS);
  
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [selectedBusId, setSelectedBusId] = useState<string | null>('DM-1901');
  const [weather, setWeather] = useState<WeatherCondition>('monsoon_rain');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning_peak');
  const [lang, setLang] = useState<'en' | 'bn'>('en');
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [isSimRunning, setIsSimRunning] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<'commuter' | 'operator' | 'planner'>('commuter');
  const [commuterTab, setCommuterTab] = useState<'map' | 'plan' | 'nearby' | 'ai_assistant' | 'tickets' | 'safety' | 'rate'>('map');

  // Simulated user location in Banani / Kakoli area
  const [userLocation, setUserLocation] = useState({
    lat: 23.7937,
    lng: 90.4048,
    nearestStopId: 'stop_banani_kakoli',
    name: 'Banani Block B (near Kakoli)',
  });

  const [activeTicket, setActiveTicket] = useState<BookingTicket | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_TICKET);
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });

  const [ticketsHistory, setTicketsHistory] = useState<BookingTicket[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TICKETS);
    if (saved) {
      try { return JSON.parse(saved); } catch { return []; }
    }
    return [];
  });

  const [journeyShare, setJourneyShare] = useState<JourneyShareSession | null>(null);

  const [alerts, setAlerts] = useState<ProactiveAlert[]>([
    {
      id: 'alt-init-1',
      timestamp: new Date(),
      type: 'leave_now',
      titleEn: 'Bus DM-1901 is 10 mins away',
      titleBn: 'বাস DM-১৯০১ ১০ মিনিট দূরে আছে',
      messageEn: 'Leave Kakoli now to reach the stop comfortably without running.',
      messageBn: 'কাকলী স্টপেজে স্বাচ্ছন্দ্যে পৌঁছাতে এখনই রওনা দিন।',
      priority: 'high',
      relatedBusId: 'DM-1901',
      isRead: false,
    },
    {
      id: 'alt-init-2',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      type: 'weather_alert',
      titleEn: 'Monsoon Rain Alert on Mirpur Corridor',
      titleBn: 'মিরপুর রোডে বৃষ্টির কারণে সতর্কতা',
      messageEn: 'Heavy rain detected near Kazipara. AI ETA updated with +15m buffer.',
      messageBn: 'কাজীপাড়ায় বৃষ্টির কারণে অতিরিক্ত ১৫ মিনিট সময় লাগতে পারে।',
      priority: 'medium',
      isRead: false,
    },
  ]);

  // Sync tickets with localStorage
  useEffect(() => {
    if (activeTicket) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_TICKET, JSON.stringify(activeTicket));
    } else {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_TICKET);
    }
  }, [activeTicket]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(ticketsHistory));
  }, [ticketsHistory]);

  // Real-time GPS & Simulation Heartbeat (5 second standard interval adjusted by simSpeed)
  useEffect(() => {
    if (!isSimRunning) return;

    const intervalMs = Math.max(1000, 4000 / simSpeed);
    const interval = setInterval(() => {
      setBuses((prevBuses) => {
        return prevBuses.map((bus) => {
          const route = routes.find((r) => r.id === bus.routeId);
          if (!route || route.stops.length === 0) return bus;

          const stopsCount = route.stops.length;
          let nextProgress = bus.progressToNextStop + 0.12 * simSpeed;
          let currentStopIdx = bus.currentStopIndex;

          if (nextProgress >= 1) {
            nextProgress = 0;
            currentStopIdx = (currentStopIdx + 1) % stopsCount;
          }

          const currentStopId = route.stops[currentStopIdx];
          const nextStopId = route.stops[(currentStopIdx + 1) % stopsCount];

          const stopA = DHAKA_BUS_STOPS.find((s) => s.id === currentStopId);
          const stopB = DHAKA_BUS_STOPS.find((s) => s.id === nextStopId);

          let lat = stopA?.lat || bus.currentLat;
          let lng = stopA?.lng || bus.currentLng;

          if (stopA && stopB) {
            lat = stopA.lat + (stopB.lat - stopA.lat) * nextProgress;
            lng = stopA.lng + (stopB.lng - stopA.lng) * nextProgress;
          }

          // Calculate speed based on bottleneck in that area
          let baseSpeed = 28;
          let delay = 2;
          let delayReason = '';

          // Weather impact
          if (weather === 'monsoon_rain') {
            baseSpeed *= 0.7;
            delay += 6;
          } else if (weather === 'heatwave') {
            baseSpeed *= 0.9;
          }

          // Time of day impact
          if (timeOfDay === 'morning_peak' || timeOfDay === 'evening_peak') {
            baseSpeed *= 0.65;
            delay += 8;
          }

          // Local bottleneck check
          if (currentStopId === 'stop_farmgate' || nextStopId === 'stop_farmgate') {
            baseSpeed = Math.min(baseSpeed, 12);
            delay += 12;
            delayReason = 'Severe bottleneck at Farmgate Ananda intersection';
          } else if (currentStopId === 'stop_mohakhali' || nextStopId === 'stop_mohakhali') {
            baseSpeed = Math.min(baseSpeed, 15);
            delay += 7;
            delayReason = 'Mohakhali flyover merge delay';
          }

          // ETA to next stop (minutes)
          const etaMinutes = Math.max(1, Math.round((1 - nextProgress) * 7 + (delay > 6 ? 3 : 0)));

          // Dynamically compute crowd level from load percentage
          const totalOccupancy = bus.bookedSeatsCount + bus.standingCount;
          const loadPercentage = Math.min(100, Math.round((totalOccupancy / (bus.totalSeats + 15)) * 100));
          let currentCrowd: CrowdLevel = 'Comfortable';
          if (loadPercentage > 85) currentCrowd = 'Packed';
          else if (loadPercentage > 60) currentCrowd = 'Moderate';

          return {
            ...bus,
            currentLat: lat,
            currentLng: lng,
            currentStopIndex: currentStopIdx,
            progressToNextStop: nextProgress,
            nextStopId,
            currentSpeedKmH: Math.round(baseSpeed + (Math.random() * 4 - 2)),
            delayMinutes: delay,
            delayReason: delayReason || (delay > 5 ? 'Traffic congestion on transit artery' : undefined),
            etaToNextStopMinutes: etaMinutes,
            loadPercentage,
            currentCrowd,
            lastGpsPingTime: new Date(),
          };
        });
      });

      // Update Journey Share Status if active
      setJourneyShare((currShare) => {
        if (!currShare) return null;
        if (currShare.status === 'arrived_safely' || currShare.status === 'emergency_sos') return currShare;

        // Auto-progress journey status simulation
        const bus = buses.find((b) => b.id === currShare.busId);
        if (!bus) return currShare;

        let updatedStatus = currShare.status;
        const newLogs = [...currShare.statusLog];

        if (currShare.status === 'waiting_at_stop' && bus.etaToNextStopMinutes <= 2) {
          updatedStatus = 'boarded';
          newLogs.push({
            timestamp: new Date(),
            event: `${currShare.commuterName} boarded bus ${bus.busNumber}. QR Ticket scanned.`,
            channel: 'WhatsApp',
          });
        } else if (currShare.status === 'boarded' && bus.progressToNextStop > 0.6) {
          updatedStatus = 'in_transit';
          newLogs.push({
            timestamp: new Date(),
            event: `Bus en route. Live tracking link active. Speed: ${bus.currentSpeedKmH} km/h.`,
            channel: 'SMS',
          });
        } else if (currShare.status === 'in_transit' && bus.nextStopId === currShare.toStop) {
          updatedStatus = 'near_destination';
          newLogs.push({
            timestamp: new Date(),
            event: `Bus is 1 stop away from ${currShare.toStop}. Prepare for drop-off.`,
            channel: 'WhatsApp',
          });
        }

        return {
          ...currShare,
          status: updatedStatus,
          statusLog: newLogs,
        };
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isSimRunning, simSpeed, weather, timeOfDay, routes, buses]);

  // Smart ETA Calculator with Dhaka Traffic Intelligence
  const calculateSmartETA = useCallback(
    (routeId: string, fromStopId: string, toStopId: string) => {
      const route = routes.find((r) => r.id === routeId);
      if (!route) {
        return { etaMinutes: 25, baseMinutes: 20, delayMinutes: 5, congestionRisk: 'moderate' as const, trafficNotes: 'Standard estimation' };
      }

      const fromIdx = route.stops.indexOf(fromStopId);
      const toIdx = route.stops.indexOf(toStopId);
      const stopsDifference = fromIdx !== -1 && toIdx !== -1 ? Math.abs(toIdx - fromIdx) : 4;

      let baseMinutes = stopsDifference * 4.5;
      let delayMinutes = 0;
      let notes: string[] = [];

      // Time of day rules
      if (timeOfDay === 'morning_peak') {
        delayMinutes += stopsDifference * 2.2;
        notes.push('Morning office rush corridor (+35%)');
      } else if (timeOfDay === 'evening_peak') {
        delayMinutes += stopsDifference * 2.8;
        notes.push('Evening rush peak hours (+45%)');
      } else if (timeOfDay === 'late_night') {
        baseMinutes *= 0.75;
        notes.push('Clear night roads');
      }

      // Weather rules
      if (weather === 'monsoon_rain') {
        delayMinutes += 12;
        notes.push('Monsoon waterlogging delay (+40% on Mirpur & Mohakhali)');
      } else if (weather === 'heatwave') {
        delayMinutes += 3;
      }

      // Bottleneck intersection cross check
      const stopsSublist = route.stops.slice(Math.min(fromIdx, toIdx), Math.max(fromIdx, toIdx) + 1);
      if (stopsSublist.includes('stop_farmgate')) {
        delayMinutes += 14;
        notes.push('Farmgate junction queue (+14m)');
      }
      if (stopsSublist.includes('stop_mohakhali')) {
        delayMinutes += 8;
        notes.push('Mohakhali flyover merge (+8m)');
      }

      const totalEta = Math.round(baseMinutes + delayMinutes);
      let risk: 'low' | 'moderate' | 'high' = 'low';
      if (totalEta > 45) risk = 'high';
      else if (totalEta > 25) risk = 'moderate';

      return {
        etaMinutes: totalEta,
        baseMinutes: Math.round(baseMinutes),
        delayMinutes: Math.round(delayMinutes),
        congestionRisk: risk,
        trafficNotes: notes.join(' • ') || 'Normal traffic flow on route',
      };
    },
    [routes, timeOfDay, weather]
  );

  // Digital Seat Booking Flow
  const bookSeat = async (
    busId: string,
    fromStopId: string,
    toStopId: string,
    seatIds: string[],
    passengerName: string,
    passengerPhone: string,
    paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'SSLCommerz'
  ): Promise<BookingTicket> => {
    const bus = buses.find((b) => b.id === busId);
    const route = routes.find((r) => r.id === bus?.routeId);
    const fromStop = stops.find((s) => s.id === fromStopId);
    const toStop = stops.find((s) => s.id === toStopId);

    const bookingRef = `DM-2026-TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const txId = `${paymentMethod.toUpperCase()}-TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const fare = (route?.standardFareBdt || 45) * seatIds.length;

    // Generate QR payload string for offline verification
    const qrPayload = JSON.stringify({
      ref: bookingRef,
      bus: bus?.busNumber,
      seats: seatIds,
      passenger: passengerName,
      from: fromStop?.nameEn,
      to: toStop?.nameEn,
      time: new Date().toISOString(),
      status: 'VALID',
    });

    let qrDataUrl = '';
    try {
      qrDataUrl = await QRCode.toDataURL(qrPayload, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
    } catch (err) {
      console.error('QR code generation error:', err);
    }

    const ticket: BookingTicket = {
      id: `ticket_${Date.now()}`,
      bookingRef,
      busId,
      routeId: route?.id || 'route-19',
      routeCode: route?.code || 'Route 19',
      busNumber: bus?.busNumber || 'DM-1901',
      operatorName: bus?.operator || 'Bihanga Paribahan',
      passengerName,
      passengerPhone,
      fromStopId,
      toStopId,
      fromStopNameEn: fromStop?.nameEn || 'Kakoli',
      fromStopNameBn: fromStop?.nameBn || 'কাকলী',
      toStopNameEn: toStop?.nameEn || 'Motijheel',
      toStopNameBn: toStop?.nameBn || 'মতিঝিল',
      seatNumbers: seatIds,
      totalFareBdt: fare,
      paymentMethod,
      paymentTransactionId: txId,
      bookedAt: new Date(),
      scheduledDepartureTime: '08:20 AM',
      status: 'confirmed',
      qrDataString: qrPayload,
      qrCodeDataUrl: qrDataUrl,
    };

    // Update bus seats state to booked
    setBuses((prev) =>
      prev.map((b) => {
        if (b.id === busId) {
          const updatedSeats = b.seats.map((st) => (seatIds.includes(st.id) ? { ...st, isBooked: true, bookedBy: passengerName } : st));
          return {
            ...b,
            bookedSeatsCount: b.bookedSeatsCount + seatIds.length,
            seats: updatedSeats,
          };
        }
        return b;
      })
    );

    setActiveTicket(ticket);
    setTicketsHistory((prev) => [ticket, ...prev]);

    // Dispatch instant proactive booking alert
    const newAlert: ProactiveAlert = {
      id: `alt-book-${Date.now()}`,
      timestamp: new Date(),
      type: 'booking_status',
      titleEn: `Seat ${seatIds.join(', ')} Confirmed!`,
      titleBn: `সিট ${seatIds.join(', ')} কনফার্ম হয়েছে!`,
      messageEn: `Ticket ${bookingRef} stored offline. Bus ${bus?.busNumber} will arrive in approx ${bus?.etaToNextStopMinutes || 6} mins.`,
      messageBn: `টিকেট ${bookingRef} অফলাইনে সেভ করা আছে। বাস ${bus?.busNumber} শীঘ্রই পৌঁছাবে।`,
      priority: 'high',
      relatedBusId: busId,
      isRead: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);

    return ticket;
  };

  const cancelTicket = (ticketId: string) => {
    setTicketsHistory((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: 'cancelled' } : t))
    );
    if (activeTicket?.id === ticketId) {
      setActiveTicket(null);
    }
  };

  // Conductor Scanner Verification
  const verifyTicketQR = (qrString: string) => {
    try {
      const data = JSON.parse(qrString);
      const ticket = ticketsHistory.find((t) => t.bookingRef === data.ref) || activeTicket;

      if (!ticket) {
        return { success: false, message: 'Invalid ticket or ticket not found in DhakaMove registry.' };
      }
      if (ticket.status === 'boarded' || ticket.status === 'completed') {
        return { success: false, message: `Ticket ${ticket.bookingRef} was already scanned and used!` };
      }

      // Mark as boarded
      const updatedTicket: BookingTicket = { ...ticket, status: 'boarded' };
      setActiveTicket(updatedTicket);
      setTicketsHistory((prev) =>
        prev.map((t) => (t.id === ticket.id ? updatedTicket : t))
      );

      return {
        success: true,
        message: `PASSENGER VERIFIED: ${ticket.passengerName} (Seats: ${ticket.seatNumbers.join(', ')}) on ${ticket.routeCode}. Boarding confirmed.`,
        ticket: updatedTicket,
      };
    } catch {
      return { success: false, message: 'Malformed QR payload data.' };
    }
  };

  // Journey Share (Safety Feature)
  const startJourneyShare = (ticketId: string, contactName: string, contactPhone: string) => {
    const ticket = ticketsHistory.find((t) => t.id === ticketId) || activeTicket;
    if (!ticket) return;

    const newShare: JourneyShareSession = {
      id: `share_${Date.now()}`,
      ticketId,
      commuterName: ticket.passengerName,
      emergencyContactName: contactName,
      emergencyContactPhone: contactPhone,
      busId: ticket.busId,
      fromStop: ticket.fromStopNameEn,
      toStop: ticket.toStopNameEn,
      startedAt: new Date(),
      expectedArrivalAt: new Date(Date.now() + 45 * 60 * 1000),
      isDeviated: false,
      deviationDistanceMeters: 0,
      status: 'waiting_at_stop',
      statusLog: [
        {
          timestamp: new Date(),
          event: `Journey Share initiated with ${contactName} (${contactPhone}). Public live tracker URL active.`,
          channel: 'System',
        },
      ],
    };

    setJourneyShare(newShare);

    // Trigger proactive safety notification
    setAlerts((prev) => [
      {
        id: `alt-safe-${Date.now()}`,
        timestamp: new Date(),
        type: 'safety',
        titleEn: `Live Journey Shared with ${contactName}`,
        titleBn: `${contactName}-এর সাথে লাইভ ট্রিপ শেয়ার করা হয়েছে`,
        messageEn: `Automated SMS/WhatsApp alerts will update them when you board, reach 2 stops away, and arrive.`,
        messageBn: `আপনি বাসে উঠলে এবং গন্তব্যে পৌঁছালে স্বয়ংক্রিয় নোটিফিকেশন চলে যাবে।`,
        priority: 'medium',
        isRead: false,
      },
      ...prev,
    ]);
  };

  const triggerEmergencySOS = (notes?: string) => {
    if (!journeyShare) return;
    setJourneyShare((curr) => {
      if (!curr) return null;
      return {
        ...curr,
        status: 'emergency_sos',
        emergencyNotes: notes || 'Emergency SOS triggered by commuter. Live coordinates dispatched to 999 & contact.',
        statusLog: [
          {
            timestamp: new Date(),
            event: `🚨 EMERGENCY SOS TRIGGERED: Live GPS dispatched to BRTA Transit Police & ${curr.emergencyContactName}.`,
            channel: 'SMS',
          },
          ...curr.statusLog,
        ],
      };
    });

    setAlerts((prev) => [
      {
        id: `alt-sos-${Date.now()}`,
        timestamp: new Date(),
        type: 'safety',
        titleEn: '🚨 Emergency SOS Dispatched',
        titleBn: '🚨 জরুরি এসওএস পাঠানো হয়েছে',
        messageEn: 'BRTA Control Room and your emergency contact have received your exact GPS coordinates.',
        messageBn: 'বিআরটিএ কন্ট্রোল রুম ও আপনার পরিবারের কাছে লাইভ অবস্থান পাঠানো হয়েছে।',
        priority: 'urgent',
        isRead: false,
      },
      ...prev,
    ]);
  };

  const submitTripRating = (rating: Omit<TripRating, 'id' | 'submittedAt'>) => {
    const fullRating: TripRating = {
      ...rating,
      id: `rating_${Date.now()}`,
      submittedAt: new Date(),
    };

    // Update driver rating average on bus
    setBuses((prev) =>
      prev.map((b) => {
        if (b.id === rating.busId) {
          const newAvg = Number(((b.driverRating * 4 + rating.driverRating) / 5).toFixed(1));
          return { ...b, driverRating: newAvg };
        }
        return b;
      })
    );

    // Add alert
    setAlerts((prev) => [
      {
        id: `alt-rated-${Date.now()}`,
        timestamp: new Date(),
        type: 'booking_status',
        titleEn: 'Thank you for your rating!',
        titleBn: 'আপনার মতামতের জন্য ধন্যবাদ!',
        messageEn: 'Your feedback directly helps improve Dhaka bus services and driver accountability.',
        messageBn: 'আপনার মতামত চালকদের মানোন্নয়নে সাহায্য করবে।',
        priority: 'low',
        isRead: false,
      },
      ...prev,
    ]);
  };

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <TransitContext.Provider
      value={{
        buses,
        routes,
        stops,
        selectedRouteId,
        selectedBusId,
        activeTicket,
        ticketsHistory,
        alerts,
        userLocation,
        weather,
        timeOfDay,
        lang,
        journeyShare,
        simSpeed,
        isSimRunning,
        activeView,
        commuterTab,
        setSelectedRouteId,
        setSelectedBusId,
        setWeather,
        setTimeOfDay,
        setLang,
        setSimSpeed,
        setIsSimRunning,
        setActiveView,
        setCommuterTab,
        setUserLocation,
        bookSeat,
        cancelTicket,
        verifyTicketQR,
        startJourneyShare,
        triggerEmergencySOS,
        submitTripRating,
        dismissAlert,
        calculateSmartETA,
      }}
    >
      {children}
    </TransitContext.Provider>
  );
};

export const useTransit = () => {
  const ctx = useContext(TransitContext);
  if (!ctx) {
    throw new Error('useTransit must be used within a TransitProvider');
  }
  return ctx;
};
