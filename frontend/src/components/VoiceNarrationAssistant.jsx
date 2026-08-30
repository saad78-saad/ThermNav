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
    setIsStartupNoticeActive(false);
    setActiveSpeech(null);
  }, []);

  // Speak function (triggers audio synthesis)
  const speak = useCallback((title, text, options = {}) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const delay = options.immediate ? 0 : 100;

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
            setIsStartupNoticeActive(false);
          }
        };

        utterance.onerror = () => {
          setIsSpeaking(false);
          setIsStartupNoticeActive(false);
        };

        // Pick preferred natural English voice
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
  }, [isMuted]);

  // Show visual tooltip on hover WITHOUT auto-speaking (audio only on click)
  const showTooltip = useCallback((title, text) => {
    if (isStartupNoticeActive) return; // Don't replace startup notice while it is speaking
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setActiveSpeech({
        title: title || 'Component Overview',
        text: text,
        isStartup: false,
        timestamp: Date.now()
      });
    }, 80);
  }, [isStartupNoticeActive]);

  // Automated 2-Part Introduction (First Voice + Product Overview) on Page Load
  useEffect(() => {
    const startupCombinedText = "Please note: internal building temperatures are assumed and modeled based on standard engineering conventions. For real-world deployments, live indoor temperatures should be collected directly from physical IoT thermal sensors. Welcome to ThermoShift AI: the Hyperlocal Microclimate Digital Twin and Predictive HVAC Optimization Platform. We ingest Autodesk 3D BIM models, FortyGuard street canyon sensor streams, and ConEdison tariff arbitrage to shave peak power demand and eliminate carbon penalties. Hover over any component to view detailed tooltips, and click the Voice button to listen to audio explanations.";
    const startupTitle = "Engineering Sensor Notice & Platform Overview";

    const timer = setTimeout(() => {
      speak(startupTitle, startupCombinedText, { isStartup: true, immediate: true, force: true });
    }, 700);

    // Modern browser gesture unlock fallback
    const handleFirstGesture = () => {
      if (synthRef.current && !synthRef.current.speaking && activeSpeech?.isStartup) {
        speak(startupTitle, startupCombinedText, { isStartup: true, immediate: true, force: true });
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
    <VoiceContext.Provider value={{ speak, showTooltip, cancelSpeech, isMuted, setIsMuted, isSpeaking, activeSpeech, isStartupNoticeActive }}>
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
            {/* Header with Wave Indicator & Actions */}
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
                        Auto Introduction
                      </span>
                    )}
                  </h4>
                  <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                    {isSpeaking ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                        Speaking Audio Voice Note...
                      </>
                    ) : (
                      'Tooltip Active • Click Voice Button to Listen'
                    )}
                  </span>
                </div>
              </div>

              {/* Cancel Button (✕) & Play Button */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => speak(activeSpeech.title, activeSpeech.text, { immediate: true, force: true })}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer text-xs flex items-center gap-1 ${
                    isSpeaking
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40'
                  }`}
                  title="Click to Listen / Play Voice Audio"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold">{isSpeaking ? 'Replay' : 'Listen'}</span>
                </button>
                <button
                  type="button"
                  onClick={cancelSpeech}
                  className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 hover:text-white transition-all cursor-pointer text-xs"
                  title="Close & Dismiss (Cancel)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Transcript / Explanation Text */}
            <p className="text-xs leading-relaxed text-slate-300 font-sans">
              {activeSpeech.text}
            </p>

            {/* Bottom Audio Helper Controls */}
            <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
              <button
                type="button"
                onClick={() => {
                  if (isSpeaking) {
                    cancelSpeech();
                  } else {
                    speak(activeSpeech.title, activeSpeech.text, { immediate: true, force: true });
                  }
                }}
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer"
              >
                <Volume2 className="w-3 h-3" />
                <span>{isSpeaking ? 'Stop Voice Note' : '🔊 Play Spoken Voice Note'}</span>
              </button>

              <span className="text-[9px] text-slate-500">
                Hover any card for tooltip
              </span>
            </div>
          </div>
        </div>
      )}
    </VoiceContext.Provider>
  );
}

/**
 * Reusable wrapper component for adding hover tooltips with on-demand click-to-speak voice notes.
 */
export function VoiceHoverCard({ title, voiceText, children, className = '', onMouseLeaveCustom }) {
  const { showTooltip, speak } = useVoiceAssistant();

  const handleMouseEnter = () => {
    if (voiceText) {
      showTooltip(title || 'Component Guide', voiceText);
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
