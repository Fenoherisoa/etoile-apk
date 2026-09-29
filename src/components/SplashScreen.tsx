import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import logoEtoile from "../assets/images/logo_etoile.png";

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 2400; // 2.4 seconds

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const nextProgress = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(nextProgress);

      if (elapsed >= duration) {
        clearInterval(timer);
        setTimeout(onComplete, 200);
      }
    }, 40);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-[#082832] via-[#0c3e4f] to-[#082029] text-white select-none">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl" />
      </div>

      <div className="w-full flex justify-end pt-2 relative z-10">
        <button
          onClick={onComplete}
          className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-full bg-white/5 border border-white/10 active:scale-95 transition-all flex items-center gap-1"
        >
          Passer
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Main Brand Section */}
      <div className="flex flex-col items-center text-center my-auto relative z-10 px-4">
        {/* Animated Brand Logo Container */}
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-2xl shadow-cyan-950/80 border-2 border-cyan-400/30 p-1 bg-gradient-to-tr from-[#082832] to-[#13677d] transform transition-transform duration-700 hover:scale-105">
            <img
              src={logoEtoile}
              alt="Logo Etoile Alu"
              className="w-full h-full object-cover rounded-xl"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback styled geometric star if image load fails
                const target = e.currentTarget;
                target.style.display = 'none';
              }}
            />
          </div>
          <div className="absolute -inset-1 bg-cyan-400/20 rounded-2xl blur-md -z-10 animate-pulse" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-xs font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Menuiserie & Miroiterie Aluminium</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2 font-sans">
          ETOILE ALU
        </h1>

        <p className="text-sm text-cyan-100/80 max-w-xs font-light">
          Bienvenue chez Etoile Alu
        </p>

        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Calculs de devis instantanés & optimisation de découpe de barres
        </p>
      </div>

      {/* Bottom Progress Bar & Loading */}
      <div className="w-full max-w-xs relative z-10 pb-6 flex flex-col items-center gap-3">
        <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-300 rounded-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between w-full text-[11px] text-slate-400">
          <span>Initialisation locale</span>
          <span className="tabular-nums font-medium text-cyan-300">{progress}%</span>
        </div>
      </div>
    </div>
  );
};
