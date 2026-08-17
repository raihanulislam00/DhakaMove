export type CrowdLevel = 'Comfortable' | 'Moderate' | 'Packed';

export type WeatherCondition = 'clear' | 'monsoon_rain' | 'evening_fog' | 'heatwave';

export type TimeOfDay = 'morning_peak' | 'mid_day' | 'evening_peak' | 'late_night';

export type SeatCategory = 'standard' | 'window' | 'aisle' | 'women_elderly' | 'front_row';

export interface BusStop {
  id: string;
  nameEn: string;
  nameBn: string;
  lat: number;
  lng: number;
  area: string;
  connectingRoutes: string[];
  isMetroInterchange?: boolean;
  isTerminal?: boolean;
}

export interface BusRoute {
  id: string;
  code: string;
  nameEn: string;
  nameBn: string;
  color: string;
  stops: string[]; // BusStop IDs
  totalDistanceKm: number;
  standardFareBdt: number;
  operatingHours: string;
  operatorName: string;
  isAcService: boolean;
  polyline: { x: number; y: number }[]; // SVG Coordinate path
}

export interface BusSeat {
  id: string; // e.g. A1, A2, B1, B2
  row: number;
  col: 'A' | 'B' | 'C' | 'D';
  category: SeatCategory;
  priceBdt: number;
  isBooked: boolean;
  bookedBy?: string;
  holdExpiresAt?: number;
}

export interface BusVehicle {
  id: string;
  routeId: string;
  busNumber: string; // e.g., Dhaka Metro-Ba 14-8821
  operator: string;
  driverNameEn: string;
  driverNameBn: string;
  driverRating: number;
  isAc: boolean;
  totalSeats: number;
  bookedSeatsCount: number;
  standingCount: number;
  currentCrowd: CrowdLevel;
  loadPercentage: number; // 0-100% from axle weight sensor
  currentSpeedKmH: number;
  currentLat: number;
  currentLng: number;
  currentStopIndex: number; // index in route.stops
  progressToNextStop: number; // 0 to 1
  nextStopId: string;
  delayMinutes: number;
  delayReason?: string;
  etaToNextStopMinutes: number;
  seats: BusSeat[];
  lastGpsPingTime: Date;
}

export interface BookingTicket {
  id: string;
  bookingRef: string; // DM-2026-TKT-XXXX
  busId: string;
  routeId: string;
  routeCode: string;
  busNumber: string;
  operatorName: string;
  passengerName: string;
  passengerPhone: string;
  fromStopId: string;
  toStopId: string;
  fromStopNameEn: string;
  fromStopNameBn: string;
  toStopNameEn: string;
  toStopNameBn: string;
  seatNumbers: string[];
  totalFareBdt: number;
  paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'SSLCommerz';
  paymentTransactionId: string;
  bookedAt: Date;
  scheduledDepartureTime: string;
  status: 'confirmed' | 'boarded' | 'completed' | 'cancelled' | 'released';
  qrDataString: string;
  qrCodeDataUrl?: string;
  sharedJourneyId?: string;
}

export interface ProactiveAlert {
  id: string;
  timestamp: Date;
  type: 'leave_now' | 'delay_warning' | 'weather_alert' | 'booking_status' | 'safety';
  titleEn: string;
  titleBn: string;
  messageEn: string;
  messageBn: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  relatedBusId?: string;
  relatedRouteId?: string;
  isRead: boolean;
}

export interface JourneyShareSession {
  id: string;
  ticketId: string;
  commuterName: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  busId: string;
  fromStop: string;
  toStop: string;
  startedAt: Date;
  expectedArrivalAt: Date;
  isDeviated: boolean;
  deviationDistanceMeters: number;
  status: 'waiting_at_stop' | 'boarded' | 'in_transit' | 'near_destination' | 'arrived_safely' | 'emergency_sos';
  statusLog: { timestamp: Date; event: string; channel: 'SMS' | 'WhatsApp' | 'System' }[];
  emergencyNotes?: string;
}

export interface TripRating {
  id: string;
  ticketId: string;
  busId: string;
  driverRating: number;
  cleanlinessRating: number;
  acFanRating: number;
  punctualityRating: number;
  averageRating: number;
  comment: string;
  language: 'en' | 'bn';
  submittedAt: Date;
  passengerName: string;
}

export interface TrafficIncident {
  id: string;
  locationEn: string;
  locationBn: string;
  type: 'bottleneck' | 'rain_waterlogging' | 'signal_congestion' | 'flyover_merge';
  addedDelayMinutes: number;
  severity: 'moderate' | 'heavy' | 'gridlock';
  affectedRoutes: string[];
}
