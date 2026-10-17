import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AtlasFloatingAssistantProps {
  onOpenChat: () => void;
}

const ATLAS_AVATAR = '/src/assets/images/atlas_assistant_avatar_1792228946675.jpg';

export const AtlasFloatingAssistant: React.FC<AtlasFloatingAssistantProps> = ({ onOpenChat }) => {
  const [showTooltip, setShowTooltip] = useState(true);

  return (
    <div className="fixed bottom-20 right-4 z-40 flex items-center gap-2 select-none animate-in fade-in duration-300">
      {/* Speech bubble tooltip from reference screenshot */}
      {showTooltip && (
        <div
          onClick={onOpenChat}
          className="bg-[#14151a] border border-amber-500/60 text-slate-200 rounded-2xl px-3.5 py-2 shadow-2xl flex items-center gap-2 cursor-pointer hover:border-amber-400 hover:text-white transition-all text-xs"
        >
          <span className="font-semibold text-xs leading-none">
            I'm here if you need assistance
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="p-0.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white ml-1 transition-colors"
            title="Dismiss prompt"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Circular Avatar Trigger */}
      <button
        onClick={onOpenChat}
        className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-amber-500 shadow-[0_0_18px_rgba(245,158,11,0.4)] bg-black shrink-0 hover:scale-105 active:scale-95 transition-transform cursor-pointer group"
        title="Chat with Atlas Assistant"
      >
        <img
          src={ATLAS_AVATAR}
          alt="Atlas Guardian"
          className="w-full h-full object-cover object-top"
          referrerPolicy="no-referrer"
        />
        <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-[#090a0c] animate-pulse" />
      </button>
    </div>
  );
};
