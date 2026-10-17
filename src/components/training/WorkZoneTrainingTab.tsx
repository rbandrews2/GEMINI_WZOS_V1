import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Play,
  Video,
  ShieldCheck,
  CheckCircle,
  Clock,
  BookOpen,
  Users,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Sparkles,
} from 'lucide-react';

export const WorkZoneTrainingTab: React.FC = () => {
  const { currentUser, playBeep } = useApp();

  const [activeVideoModal, setActiveVideoModal] = useState<any | null>(null);
  const [isInMeeting, setIsInMeeting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);

  const trainingModules = [
    {
      id: 'train-1',
      title: 'MUTCD Section 6C: Highway Taper Geometry & Cone Spacing',
      duration: '8 min',
      category: 'Certification',
      description: 'Learn formulas for calculating 500ft to 1,000ft merging taper lengths based on posted speed limit (W x S²/60 vs W x S).',
      instructor: 'Marcus Vance (Safety Director)',
      completed: true,
    },
    {
      id: 'train-2',
      title: 'Attenuator TMA Scorpion Rig Buffer Zone Placement',
      duration: '6 min',
      category: 'Equipment',
      description: 'Standoff buffer calculation, hydraulic latch inspection, and roll-ahead clearance rules when protecting workers in live traffic.',
      instructor: 'Dave Conner (TMA Fleet Lead)',
      completed: false,
    },
    {
      id: 'train-3',
      title: 'Flagger Paddle Control & Blind Curve Communication',
      duration: '11 min',
      category: 'Field Safety',
      description: 'Two-way radio protocol, STOP/SLOW paddle presentation, emergency escape route discipline, and night beacon wands.',
      instructor: 'Maria Rodriguez (TCS)',
      completed: false,
    },
    {
      id: 'train-4',
      title: 'Emergency Vehicle Incursion: Rapid Whistle Evacuation Protocol',
      duration: '5 min',
      category: 'Emergency',
      description: 'Air horn warning sequences, TMA impact procedures, and coordinating traffic stops with highway patrol escorts.',
      instructor: 'Caltrans Safety Liaison',
      completed: false,
    },
  ];

  const handleStartMeeting = () => {
    setIsInMeeting(true);
    playBeep('punch');
  };

  const handleLeaveMeeting = () => {
    setIsInMeeting(false);
    playBeep('alert');
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Top Banner */}
      <div className="bg-[#121316] border border-[#212328] rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center">
              <Play className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-white">Video Training & Safety Sync</h2>
              <p className="text-xs text-[#8e929b]">Certified MUTCD video courses and field team video meetings.</p>
            </div>
          </div>

          <button
            onClick={() => (isInMeeting ? handleLeaveMeeting() : handleStartMeeting())}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              isInMeeting
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-[#ff6700] hover:bg-[#ea580c] text-black shadow-md shadow-orange-600/30'
            }`}
          >
            <Video className="w-4 h-4 fill-current" />
            <span>{isInMeeting ? 'Leave Meeting Room' : 'Join Tailgate Video Meeting'}</span>
          </button>
        </div>
      </div>

      {/* Tailgate Video Meeting Room (Active state) */}
      {isInMeeting && (
        <div className="bg-[#121316] border border-amber-500/60 rounded-3xl p-5 shadow-2xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-[#212328] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-bold text-sm text-white">Live Tailgate Safety Meeting #WZ-104</span>
              <span className="text-xs text-[#8e929b]">· 4 Crew Active</span>
            </div>
            <span className="text-xs font-mono text-amber-400 font-bold">MUTCD Channel 1</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="aspect-video bg-[#0d0e12] rounded-2xl border border-amber-500/40 p-2 flex flex-col justify-between relative overflow-hidden">
              <span className="text-[10px] font-bold text-amber-300 bg-black/60 px-2 py-0.5 rounded w-fit">
                {currentUser?.name} (You)
              </span>
              <div className="text-center py-4">
                <div className="w-10 h-10 rounded-full bg-[#ff6700] text-black font-extrabold flex items-center justify-center mx-auto text-sm">
                  {currentUser?.name.charAt(0)}
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>{currentUser?.position}</span>
                <span>{isMuted ? 'Muted' : 'Mic On'}</span>
              </div>
            </div>

            <div className="aspect-video bg-[#0d0e12] rounded-2xl border border-[#212328] p-2 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-300 bg-black/60 px-2 py-0.5 rounded w-fit">
                Marcus Vance
              </span>
              <div className="text-center py-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center mx-auto text-sm">
                  MV
                </div>
              </div>
              <span className="text-[10px] text-slate-400">Operations Director</span>
            </div>

            <div className="aspect-video bg-[#0d0e12] rounded-2xl border border-[#212328] p-2 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-300 bg-black/60 px-2 py-0.5 rounded w-fit">
                Dave Conner
              </span>
              <div className="text-center py-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center mx-auto text-sm">
                  DC
                </div>
              </div>
              <span className="text-[10px] text-slate-400">TMA Driver</span>
            </div>

            <div className="aspect-video bg-[#0d0e12] rounded-2xl border border-[#212328] p-2 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-300 bg-black/60 px-2 py-0.5 rounded w-fit">
                Sam Jenkins
              </span>
              <div className="text-center py-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center mx-auto text-sm">
                  SJ
                </div>
              </div>
              <span className="text-[10px] text-slate-400">Flagger Lead</span>
            </div>
          </div>

          {/* Meeting Controls */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsMuted((m) => !m)}
              className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                isMuted ? 'bg-red-950/60 border-red-700 text-red-300' : 'bg-[#18191f] border-[#2c2f38] text-white'
              }`}
            >
              {isMuted ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
              <span>{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>

            <button
              onClick={() => setIsVideoOn((v) => !v)}
              className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                !isVideoOn ? 'bg-red-950/60 border-red-700 text-red-300' : 'bg-[#18191f] border-[#2c2f38] text-white'
              }`}
            >
              {isVideoOn ? <Video className="w-4 h-4 text-amber-400" /> : <VideoOff className="w-4 h-4 text-red-400" />}
              <span>{isVideoOn ? 'Camera On' : 'Camera Off'}</span>
            </button>

            <button
              onClick={handleLeaveMeeting}
              className="p-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <PhoneOff className="w-4 h-4" />
              <span>Leave Room</span>
            </button>
          </div>
        </div>
      )}

      {/* Video Training Library */}
      <div className="space-y-3">
        <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
          <span>Required Work Zone Video Modules</span>
          <span className="text-xs text-[#8e929b] font-normal">· Annual Caltrans Compliance</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {trainingModules.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveVideoModal(item)}
              className="bg-[#121316] hover:bg-[#18191f] border border-[#212328] hover:border-amber-500/50 rounded-2xl p-4 shadow-lg cursor-pointer transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-[#8e929b]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{item.duration}</span>
                  </div>
                </div>

                <h4 className="font-bold text-sm text-white group-hover:text-amber-300 leading-snug">
                  {item.title}
                </h4>

                <p className="text-xs text-[#8e929b] line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#212328] text-xs">
                <span className="text-slate-400">Instructor: <b className="text-white">{item.instructor}</b></span>
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <Play className="w-3 h-3 fill-current" />
                  <span>Watch Video</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Simulation Modal */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#121316] border border-[#2c2f38] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between pb-2 border-b border-[#212328]">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400">Video Training Player</span>
                <h3 className="font-display font-bold text-base text-white mt-0.5">{activeVideoModal.title}</h3>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Video Simulated Canvas */}
            <div className="aspect-video bg-[#090a0c] rounded-2xl border border-[#212328] flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="w-16 h-16 rounded-full bg-[#ff6700] text-black flex items-center justify-center shadow-lg shadow-orange-600/40">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
              <span className="text-xs text-[#8e929b] mt-3 font-semibold">
                MUTCD Video Stream: {activeVideoModal.duration}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {activeVideoModal.description}
            </p>

            <button
              onClick={() => setActiveVideoModal(null)}
              className="w-full h-11 rounded-xl bg-[#ff6700] hover:bg-[#ea580c] text-black font-extrabold text-xs uppercase"
            >
              Complete Video Lesson
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
