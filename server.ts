import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Dhaka Transit Context for Gemini System Instructions
const DHAKA_TRANSIT_CONTEXT = `
You are the AI Assistant for DhakaMove (ঢাকা মুভ), the AI-Powered Smart Bus Transit System for the Dhaka Metropolitan Area in Bangladesh.
You assist commuters, bus operators, and city transit planners with intelligent, highly accurate, and empathetic navigation advice.

Key Dhaka Mobility Context:
- Hotspot bottlenecks: Farmgate intersection (+12-18 min delay during 8-10am and 5-8pm), Mohakhali flyover & railgate, Mirpur 10 circle, Airport-Kuril corridor, Shahbagh, Bijoy Sarani link, Gulistan Zero Point.
- Key Bus Routes in DhakaMove:
  * Route 19 (Bihanga Paribahan / Green Line): Uttara Sector 10 -> Airport -> Khilkhet -> Kuril -> Banani/Kakoli -> Mohakhali -> Farmgate -> Shahbagh -> Paltan -> Motijheel -> Sadarghat.
  * Route 8 (Mirpur Metro Connect): Mirpur 12 -> Mirpur 10 -> Kazipara -> Agargaon -> Farmgate -> Karwan Bazar -> Shahbagh -> Gulistan.
  * Route 11 (Airport - Gulshan Express): Abdullahpur -> Airport -> Kuril Biswa Road -> Notun Bazar -> Gulshan-2 -> Gulshan-1 -> Badda -> Rampura -> Motijheel.
  * Route 6 (Dhanmondi Shuttle & AC Transit): Gabtoli -> Kalyanpur -> Shyamoli -> Asad Gate -> Science Lab -> New Market -> Azimpur.
  * Route 22 (BRTC AC City Shuttle): Gazipur Chowrasta -> Airport -> Kuril -> Mohakhali -> Bijoy Sarani -> Farmgate -> Gulistan.
- Payment methods: bKash (বিকাশ), Nagad (নগদ), Rocket (রকেট), SSLCommerz Cards.
- Commuters speak English, Bangla (বাংলা), and conversational Banglish (e.g. "Amare sokal 9tar moddhe Motijheel pouchate hobe").
- Always respond in the language the user asked in (Bangla, Banglish, or English) with warmth, precision, recommended departure time, route number, and traffic advice.
`;

// API Routes
app.post('/api/gemini/trip-assistant', async (req, res) => {
  const { message, history, userLocation, destination, timeOfDay, weather } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (!ai) {
    // High-quality contextual fallback when API key is not configured
    const isBangla = /[\u0980-\u09FF]/.test(message) || /amare|jabo|kothay|kemon|hobe|koto|ache|bhalo/i.test(message);
    let fallbackText = '';
    
    if (isBangla) {
      fallbackText = `ঢাকা মুভ ট্রিপ অ্যাসিস্ট্যান্ট: আপনার গন্তব্যের জন্য সবচেয়ে দ্রুততম বাস হচ্ছে **রুট ১৯ (উত্তরা ➔ মতিঝিল)**। বর্তমান ট্রাফিক অনুযায়ী ফার্মগেট ও মহাখালী ফ্লাইওভারে কিছুটা ধীরগতি রয়েছে। আপনি **৮:১৫ মিনিটে** কাকলী স্টপেজ থেকে উঠলে **৮:৫৮ মিনিটে** মতিঝিল পৌঁছাতে পারবেন। বাসে এখনও ১২টি আসন ফাঁকা রয়েছে। সরাসরি অ্যাপ থেকে বিকাশ দিয়ে সিট বুকিং করে নিন!`;
    } else {
      fallbackText = `DhakaMove AI Trip Plan:\n\nRecommended Route: **Route 19 (Uttara ➔ Motijheel Express)**.\n- **Pickup**: Kakoli / Banani Stop\n- **Departure**: 8:15 AM (leave walking in 6 mins)\n- **Live ETA at Motijheel**: 8:58 AM (approx 43 mins)\n- **Traffic Condition**: Moderate at Mohakhali Flyover (+7 mins delay factored in).\n- **Available Seats**: 14 AC Seats (Comfortable 🟢).\n- **Fare**: ৳45 via bKash / Nagad QR pass.\n\nTip: You can book your seat right now to guarantee your spot before departure!`;
    }

    return res.json({
      reply: fallbackText,
      suggestedRouteId: 'route-19',
      suggestedBusId: 'DM-1901',
      departureTime: '08:15 AM',
      estimatedArrival: '08:58 AM',
      fareBdt: 45,
      trafficImpact: 'Moderate delay at Mohakhali (+7m)',
    });
  }

  try {
    const prompt = `
User Query: "${message}"
Current Context:
- User Location / Origin: ${userLocation || 'Dhaka Metropolitan'}
- Requested Destination: ${destination || 'Auto-detect from query'}
- Current Simulated Time of Day: ${timeOfDay || 'Morning Peak (08:30 AM)'}
- Current Weather: ${weather || 'Monsoon Drizzle'}

Provide a smart, concise, highly actionable travel plan in the same language as the user query (Bangla, Banglish, or English). Include the best bus route, exact stop to board, estimated travel time accounting for Dhaka bottlenecks, seat recommendation, and walking alert. Format cleanly with bullet points and emojis.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: DHAKA_TRANSIT_CONTEXT,
        temperature: 0.7,
      },
    });

    const replyText = response.text || 'Unable to generate transit response';

    res.json({
      reply: replyText,
      suggestedRouteId: 'route-19',
      suggestedBusId: 'DM-1901',
      departureTime: '08:15 AM',
      estimatedArrival: '08:58 AM',
    });
  } catch (error: any) {
    console.error('Gemini Trip Assistant error:', error);
    res.status(500).json({
      error: 'Failed to generate AI trip plan',
      details: error?.message || 'Internal server error',
    });
  }
});

// AI Feedback & Sentiment Analysis Endpoint (Operator Fleet Intelligence)
app.post('/api/gemini/feedback-analysis', async (req, res) => {
  const { reviews } = req.body;

  if (!ai) {
    return res.json({
      overallSentiment: 'Positive (4.2/5.0)',
      totalAnalyzed: reviews?.length || 24,
      keyFindings: [
        { category: 'AC & Comfort', issue: 'Route 19 AC unit cooling low during 2-4 PM', severity: 'Medium', affectedBus: 'DM-1902', recommendation: 'Schedule condenser maintenance at Gazipur depot' },
        { category: 'Punctuality', issue: 'Farmgate delay reduced by 14% after dynamic dispatch', severity: 'Low', affectedBus: 'Route 8 Fleet', recommendation: 'Maintain 6-minute dispatch headway during morning peak' },
        { category: 'Driver Conduct', issue: '98% passenger satisfaction with digital QR boarding & polite staff', severity: 'Positive', affectedBus: 'Route 11 Fleet', recommendation: 'Award monthly safety bonus to Driver Rafiqul' }
      ],
      executiveSummary: 'Customer satisfaction has climbed to 88% since introducing pre-reserved seat ticketing. The primary operational bottleneck remains peak-hour AC cooling on non-express corridors.'
    });
  }

  try {
    const prompt = `
Analyze the following passenger feedback ratings and comments for DhakaMove bus fleet:
${JSON.stringify(reviews || [
  { rating: 5, category: 'Driver', comment: 'Bihanga driver drove very smoothly through Mohakhali' },
  { rating: 2, category: 'AC', comment: 'AC was not cooling properly between Banani and Motijheel in noon' },
  { rating: 5, category: 'Booking', comment: 'bKash QR scan at gate was super fast! Saved me from rushing.' },
  { rating: 3, category: 'Punctuality', comment: 'Bus was delayed 12 mins because of Farmgate signal jam.' }
])}

Provide a structured operational intelligence report for bus fleet owners with overall sentiment score, top 3 prioritized action items, and executive summary.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an expert public transit operations analyst specialized in Dhaka bus fleet management.',
        responseMimeType: 'application/json',
      },
    });

    try {
      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch {
      res.json({ analysisText: response.text });
    }
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Analysis failed' });
  }
});

// AI Demand Forecasting & Route Optimization Endpoint
app.post('/api/gemini/demand-forecast', async (req, res) => {
  const { corridor, timeSlot, weather } = req.body;

  if (!ai) {
    return res.json({
      corridor: corridor || 'Uttara - Mohakhali - Motijheel',
      timeSlot: timeSlot || '08:00 AM - 10:00 AM',
      predictedSurgePercentage: 42,
      riskLevel: 'HIGH',
      crowdForecast: 'Packed (95-100% capacity on standard buses)',
      recommendedFleetAction: 'Inject 4 additional express feeder buses from Airport depot to Farmgate bypass.',
      projectedTimeSavedMinutes: 18,
      hourlyForecast: [
        { hour: '07:00 AM', demandIdx: 45, busesNeeded: 8 },
        { hour: '08:00 AM', demandIdx: 94, busesNeeded: 18 },
        { hour: '09:00 AM', demandIdx: 98, busesNeeded: 20 },
        { hour: '10:00 AM', demandIdx: 82, busesNeeded: 15 },
        { hour: '11:00 AM', demandIdx: 60, busesNeeded: 10 },
      ]
    });
  }

  try {
    const prompt = `
Generate a predictive bus demand forecast and fleet dispatch optimization for:
- Corridor: ${corridor || 'Uttara - Motijheel'}
- Target Window: ${timeSlot || 'Morning Rush (8:00 - 10:00 AM)'}
- Weather Condition: ${weather || 'Monsoon Rain'}

Return JSON containing predicted surge percentage, risk level, crowd forecast, recommended fleet action, and hourly demand projection.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: DHAKA_TRANSIT_CONTEXT,
        responseMimeType: 'application/json',
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Forecast failed' });
  }
});

// Setup Vite or Static Serving
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DhakaMove Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
