import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Volume2, VolumeX, X, RotateCcw } from 'lucide-react';

const VoiceContext = createContext(null);

export function useVoiceAssistant() {
  const ctx = useContext(VoiceContext);
  if (!ctx) {
    throw new Error('useVoiceAssistant must be used within a VoiceAssistantProvider');
  }
  return ctx;
}

export function VoiceAssistantProvider({ children, theme = 'dark' }) {
  const isLight = theme === 'light';
  const [isMuted, setIsMuted] = useState(false);
  const [activeSpeech, setActiveSpeech] = useState(null); // { title, text, isStartup, timestamp }
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isStartupNoticeActive, setIsStartupNoticeActive] = useState(true);
  const debounceTimerRef = useRef(null);
  const synthRef = useRef(null);

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const cancelSpeech = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
    setIsStartupNoticeActive(false); // Unlocks hover voices immediately if dismissed
    setActiveSpeech(null);
  }, []);

  const speak = useCallback((title, text, options = {}) => {
    // If the on-enter startup notice is currently speaking and this is a hover request, don't interrupt
    if (isStartupNoticeActive && !options.isStartup && !options.force) {
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Small debounce to avoid audio jitter on fast mouse sweeps
    const delay = options.immediate ? 0 : 200;

    debounceTimerRef.current = setTimeout(() => {
      if (!synthRef.current) return;

      synthRef.current.cancel();
      setActiveSpeech({
        title: title || 'Voice Guide',
        text: text,
        isStartup: options.isStartup || false,
        timestamp: Date.now()
      });

      if (isMuted && !options.force) {
        setIsSpeaking(false);
        return;
      }

      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = options.rate || 0.95;
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = options.volume || 1.0;

        utterance.onstart = () => {
          setIsSpeaking(true);
          if (options.isStartup) {
            setIsStartupNoticeActive(true);
          }
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          if (options.isStartup) {
            setIsStartupNoticeActive(false); // Startup finished -> Unlock hover voices!
          }

          // Auto-hide non-startup hover tooltips after speech completes
          if (!options.isStartup) {
            setTimeout(() => {
              setActiveSpeech(prev => (prev && prev.text === text ? null : prev));
            }, 3000);
          }
        };

        utterance.onerror = () => {
          setIsSpeaking(false);
          setIsStartupNoticeActive(false);
        };

        // Pick preferred natural voice
        const voices = synthRef.current.getVoices();
        const preferredVoice = voices.find(v =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Zira') || v.name.includes('Jenny') || v.name.includes('Female'))
        ) || voices.find(v => v.lang.startsWith('en'));

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        synthRef.current.speak(utterance);
      } catch (e) {
        console.warn('Voice speech synthesis error:', e);
        setIsSpeaking(false);
        setIsStartupNoticeActive(false);
      }
    }, delay);
  }, [isMuted, isStartupNoticeActive]);

  // Initial On-Enter Voice Notice (Runs automatically by default on page load)
  useEffect(() => {
    const startupText = "Welcome to ThermoShift AI. Please note: internal building temperatures shown in this simulation are assumed and modeled based on standard engineering conventions. For real-world deployments, live indoor temperatures should be collected directly from physical IoT thermal sensors. Once this introduction concludes, hover over any building component, simulation control, or map feature for interactive voice explanations.";
    const startupTitle = "Engineering Sensor Convention & Platform Guide";

    const timer = setTimeout(() => {
      speak(startupTitle, startupText, { isStartup: true, immediate: true });
    }, 800);

    // Modern browser audio unlock fallback on first user touch/interaction
    const handleFirstGesture = () => {
      if (synthRef.current && !synthRef.current.speaking && activeSpeech?.isStartup) {
        speak(startupTitle, startupText, { isStartup: true, immediate: true });
      }
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };

    window.addEventListener('pointerdown', handleFirstGesture, { once: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [speak]);

  return (
    <VoiceContext.Provider value={{ speak, cancelSpeech, isMuted, setIsMuted, isSpeaking, activeSpeech, isStartupNoticeActive }}>
      {children}

      {/* ========================================================================= */}
      {/* 🎙️ FLOATING INTERACTIVE VOICE TOOLTIP & TRANSCRIPT HUD (WITH CANCEL ICON) */}
      {/* ========================================================================= */}
      {activeSpeech && (
        <div className="fixed bottom-5 right-5 z-[9999] max-w-sm sm:max-w-md w-[calc(100vw-2.5rem)] animate-in slide-in-from-bottom-5 duration-200">
          <div className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-xl relative transition-all ${
            isLight
              ? 'bg-white/95 border-cyan-300 text-slate-900 shadow-cyan-900/20'
              : 'bg-slate-950/95 border-cyan-500/50 text-slate-100 shadow-2xl shadow-cyan-500/20'
          }`}>
            {/* Header with Wave Indicator & Cancel Button */}
            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
                  <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'animate-bounce text-cyan-300' : ''}`} />
                </span>
                <div>
                  <h4 className="text-xs font-black tracking-tight flex items-center gap-1.5">
                    <span>{activeSpeech.title}</span>
                    {activeSpeech.isStartup && (
                      <span className="px-1.5 py-0.2 rounded-md bg-amber-500 text-slate-950 font-mono text-[9px] font-bold">
                        Startup Notice
                      </span>
                    )}
                  </h4>
                  <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                    {isSpeaking ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                        Speaking Voice Note...
                      </>
                    ) : (
                      'Voice Ready • Hover for notes'
                    )}
                  </span>
                </div>
              </div>

              {/* Cancel Button (✕) */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => speak(activeSpeech.title, activeSpeech.text, { immediate: true, force: true })}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-white transition-all cursor-pointer text-xs"
                  title="Replay Voice Note"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={cancelSpeech}
                  className="p-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 hover:text-white transition-all cursor-pointer text-xs"
                  title="Close & Stop Voice (Cancel)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Transcript Text */}
            <p className="text-xs leading-relaxed text-slate-300 font-sans">
              {activeSpeech.text}
            </p>

            {/* Bottom Audio Helper Controls */}
            <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                  isMuted ? 'bg-rose-950/60 text-rose-300 border-rose-500/40' : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                {isMuted ? <VolumeX className="w-3 h-3 text-rose-400" /> : <Volume2 className="w-3 h-3 text-cyan-400" />}
                <span>{isMuted ? 'Hover Audio Muted' : 'Hover Audio Active'}</span>
              </button>

              <span className="text-[9px] text-slate-500">
                Hover any card for voice guide
              </span>
            </div>
          </div>
        </div>
      )}
    </VoiceContext.Provider>
  );
}

/**
 * Reusable wrapper component for adding hover voice notes with speech synthesis to any group or button.
 */
export function VoiceHoverCard({ title, voiceText, children, className = '', onMouseLeaveCustom }) {
  const { speak } = useVoiceAssistant();

  const handleMouseEnter = () => {
    if (voiceText) {
      speak(title || 'Component Guide', voiceText);
    }
  };

  const handleMouseLeave = () => {
    if (onMouseLeaveCustom) {
      onMouseLeaveCustom();
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </div>
  );
}
