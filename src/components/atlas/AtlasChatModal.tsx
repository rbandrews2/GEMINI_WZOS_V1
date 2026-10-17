import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Send,
  Sparkles,
  ShieldCheck,
  Phone,
  HelpCircle,
  X,
  RotateCcw,
  Clock,
  Navigation,
  FileText,
  Briefcase,
  Users,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const ATLAS_AVATAR = '/src/assets/images/atlas_assistant_avatar_1792228946675.jpg';
const SUPPORT_PHONE = '18446857207';

interface AtlasChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AtlasChatModal: React.FC<AtlasChatModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, setActiveTab } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      text: `Greetings, ${currentUser?.name || 'Worker'}. I am Atlas, the operations and safety guardian for Work Zone OS.

I'm here to assist you with everything in the app:
• Punching in/out with the 4 task subcategories (Travel Time, Job Site, Meeting, Other)
• Turn-by-turn work zone GPS navigation & speed limit alerts
• Completing MUTCD daily inspections, JHA safety briefings, and TMA pre-trip forms
• Viewing shift assignments and contacting 24/7 dispatch

How can I help you on the field today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const quickPrompts = [
    'How do severe weather warnings work?',
    'How does GPS geofence arrival detection work?',
    'How do Google Meet team & 1-on-1 meetings work?',
    'How do I clock into Travel Time vs Job Site?',
    'How does turn-by-turn navigation work?',
    'Where do I sign the MUTCD inspection form?',
    'How do Admins edit timesheet punches?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Build history for multi-turn chat
      const historyPayload = [...messages, userMsg].map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/atlas/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historyPayload }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const botText = data.reply || "I am on watch. For more help you can reach support at 18446857207";

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          text: botText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      console.warn('Atlas API offline, using intelligent guardian fallback:', err);
      // Fallback response with app awareness & mandatory support phone
      const fallbackReply = generateAtlasFallback(text);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          text: fallbackReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `msg-reset-${Date.now()}`,
        role: 'assistant',
        text: `Atlas standing by. What section of Work Zone OS do you need guidance on? For more help you can reach support at 18446857207`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#101115] border-2 border-amber-500/50 rounded-3xl w-full max-w-lg h-[92vh] max-h-[780px] shadow-2xl flex flex-col overflow-hidden relative">
        {/* Top Header with Atlas Identity */}
        <div className="bg-[#14151a] border-b border-[#252830] p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] bg-black shrink-0">
              <img
                src={ATLAS_AVATAR}
                alt="Atlas Guardian"
                className="w-full h-full object-cover object-top"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-black" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-base text-white tracking-wide">
                  ATLAS ASSISTANT
                </h3>
                <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  AI GUARDIAN
                </span>
              </div>
              <p className="text-xs text-[#8e929b]">Work Zone OS Field Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleResetChat}
              title="Reset Chat Thread"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1f2128] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1f2128] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
          {messages.map((msg) => {
            const isBot = msg.role === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isBot ? 'items-start' : 'items-end justify-end'}`}
              >
                {isBot && (
                  <div className="w-8 h-8 rounded-xl overflow-hidden border border-amber-500/50 bg-black shrink-0 mt-0.5">
                    <img
                      src={ATLAS_AVATAR}
                      alt="Atlas"
                      className="w-full h-full object-cover object-top"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <div
                  className={`max-w-[84%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                    isBot
                      ? 'bg-[#15161b] border border-[#272a33] text-slate-200 shadow-md'
                      : 'bg-[#ff6700] text-black font-semibold shadow-lg shadow-orange-600/20'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  <div
                    className={`text-[10px] mt-1.5 text-right font-mono ${
                      isBot ? 'text-[#6b707d]' : 'text-black/70'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-xl overflow-hidden border border-amber-500/50 bg-black shrink-0">
                <img
                  src={ATLAS_AVATAR}
                  alt="Atlas"
                  className="w-full h-full object-cover object-top"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="bg-[#15161b] border border-[#272a33] rounded-2xl px-4 py-2.5 text-xs text-amber-400 font-semibold flex items-center gap-2 shadow-md">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Atlas is analyzing Work Zone protocols...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 py-1.5 bg-[#0d0e12] border-t border-[#1f2128] overflow-x-auto scrollbar-none flex items-center gap-1.5 shrink-0">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] whitespace-nowrap px-3 py-1.5 rounded-xl bg-[#15161a] hover:bg-[#1e2027] border border-[#252830] hover:border-amber-500/50 text-[#8e929b] hover:text-white transition-colors shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Mandatory Support Bar Callout */}
        <div className="px-4 py-1.5 bg-[#121316] border-t border-[#1f2128] flex items-center justify-between text-[11px] text-[#8e929b] shrink-0">
          <span>Need live phone help?</span>
          <a
            href={`tel:${SUPPORT_PHONE}`}
            className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
          >
            <Phone className="w-3 h-3" />
            <span>Support: 1-844-685-7207</span>
          </a>
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 bg-[#14151a] border-t border-[#252830] shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask Atlas about any Work Zone OS feature..."
              className="flex-1 h-12 bg-[#090a0c] border border-[#2a2c35] rounded-2xl px-4 text-xs sm:text-sm text-white placeholder-[#5d616c] focus:outline-none focus:border-amber-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="w-12 h-12 rounded-2xl bg-[#ff6700] hover:bg-[#ea580c] disabled:opacity-40 text-black font-black flex items-center justify-center shrink-0 shadow-lg shadow-orange-600/30 transition-transform active:scale-[0.98] cursor-pointer"
            >
              <Send className="w-4 h-4 fill-current" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Intelligent Guardian fallback logic when network is restricted or API key is pending
function generateAtlasFallback(userPrompt: string): string {
  const p = userPrompt.toLowerCase();

  if (p.includes('weather') || p.includes('storm') || p.includes('wind') || p.includes('lightning') || p.includes('rain') || p.includes('fog') || p.includes('heat')) {
    return `Work Zone OS integrates real-time GPS weather monitoring and severe weather warnings directly on the Work Zone Dashboard:
• Live GPS & Active Site Tracking: Automatically pulls ambient temperature, heat index, wind velocity, max gusts, and precipitation using your device's location.
• MUTCD & OSHA Hazard Alerts: Triggers audible and visual warnings for High Wind (>30-38 MPH gusts requiring sign stand sandbagging), Severe Lightning (suspending crane/metal barrier ops), Dense Fog (requiring illuminated flagger wands), and High Heat (mandatory hydration rest intervals).
• Safety Drill Simulator: Use the slider icon on the weather widget to simulate adverse weather conditions (High Wind, Lightning, Dense Fog, Extreme Heat) to test crew emergency preparedness.

For more help you can reach support at 18446857207`;
  }

  if (p.includes('geofence') || p.includes('arrive') || p.includes('arrival') || p.includes('proximity')) {
    return `Work Zone OS features an automated GPS Geofencing utility integrated directly into the Time Clock:
• Automatic Work Zone Detection: Monitors your coordinates against job site perimeters (standard radius 350m / 1,150ft).
• One-Tap Check-In Suggestion: When you arrive at a work zone and are clocked out, a high-visibility card suggests checking in immediately, auto-selecting the job.
• Travel-to-Site Transition: If you clocked into 'Travel Time' on the drive over, the geofence prompts you to switch to 'Job Site' work immediately upon arrival.
• Field Test Simulator: Use the "Test / Config" button in the Geofence bar to test arrivals, simulate en-route travel, or adjust radius sensitivity.

For more help you can reach support at 18446857207`;
  }

  if (p.includes('clock') || p.includes('time') || p.includes('subcategor') || p.includes('task')) {
    return `In Work Zone OS, the Time Clock (Time Tracker) includes 4 official subcategories:
1. "Travel Time": Vehicle transport and equipment mobilization to the work zone.
2. "Job Site": Live taper setup, flagging operations, and attenuator barrier maintenance.
3. "Meeting": Tailgate safety briefings, JHA reviews, and Caltrans DOT inspector meetings.
4. "Other": Yard work, TMA pre-trip inspection, or administrative reports.

To clock in, select your job and subcategory, then tap the large "CLOCK IN NOW" button. You can also use "Switch Task" anytime during your shift without clocking out!

For more help you can reach support at 18446857207`;
  }

  if (p.includes('navigat') || p.includes('map') || p.includes('gps') || p.includes('direction')) {
    return `The Navigation tab provides a Google Maps-comparable turn-by-turn guidance experience:
• Green turn banner with distance and maneuver instructions.
• Live speedometer paired with work zone speed limit compliance indicators (e.g., 45 MPH in cone zones).
• Simulated drive button with voice announcements to preview the route from the staging yard to your job site.

For more help you can reach support at 18446857207`;
  }

  if (p.includes('form') || p.includes('mutcd') || p.includes('jha') || p.includes('sign') || p.includes('inspect')) {
    return `The Forms Hub gives you access to digital road work compliance forms:
• Daily Work Zone MUTCD Inspection & Sign Log
• Job Hazard Analysis (JHA) & Tailgate Safety Briefing
• Attenuator Truck (TMA) Pre-Trip Inspection
• Incident & Near-Miss Report

Every form includes a digital finger/stylus signature pad and automatically delivers to the appropriate destination (Safety Department, Dispatch, or DOT Inspector).

For more help you can reach support at 18446857207`;
  }

  if (p.includes('admin') || p.includes('edit') || p.includes('punch') || p.includes('sheet') || p.includes('role')) {
    return `Elevated Admins in Work Zone OS have full edit authority:
• Edit any timesheet punch (adjust start/end times, durations, and notes with an audit trail).
• Add manual missed punches for crew members.
• Create new jobs in the Job Directory.
• Upload new contacts and bulk import via CSV.
• Design custom checklist forms in the Forms Hub.
• Establish and reset worker usernames and passwords.

For more help you can reach support at 18446857207`;
  }

  if (p.includes('assignment') || p.includes('schedule') || p.includes('tomorrow') || p.includes('message') || p.includes('dispatch')) {
    return `Your shift assignments appear in the Schedule Management / Notifications tab.
You will see your report time, assigned staging yard, assigned TMA truck, and weather advisories.
Make sure to tap "Confirm & Acknowledge Shift" to let dispatch know you are confirmed!

For more help you can reach support at 18446857207`;
  }

  if (p.includes('meet') || p.includes('google meet') || p.includes('video') || p.includes('1 on 1') || p.includes('tailgate')) {
    return `In Work Zone OS, Google Meet video sync is available for team safety briefings and 1-on-1 performance reviews:
• Created by Admins Only: Admins use their Google Workspace OAuth access to schedule meetings or launch instant Google Meet video spaces.
• Viewable & Accessible by All: Field members and admins can view meeting schedules, copy meeting links, and tap "Join Google Meet" for one-touch video room entry.
• Scopes & Integration: Integrated with Google Meet API (spaces.created, spaces.readonly, spaces.settings) for official Google Meet rooms.

For more help you can reach support at 18446857207`;
  }

  return `I am standing by to assist with any Work Zone OS feature—including Google Meet Video Sync, the Time Tracker, Navigation, Job List, Forms Hub, or Contacts.

If you are experiencing an unresolvable technical or dispatch issue:
For more help you can reach support at 18446857207`;
}
