import { useState, useEffect, useRef, useCallback } from "react";

// Extend the Window type to include both standard and webkit-prefixed SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export type SpeechStatus = "idle" | "recording" | "paused" | "stopped";

export interface UseSpeechRecognitionReturn {
  /** Whether the browser supports the Web Speech API */
  isSupported: boolean;
  /** Current status of the recorder */
  status: SpeechStatus;
  /** The accumulated transcript text */
  transcript: string;
  /** Whether a recording session is actively in progress */
  isRecording: boolean;
  /** Start or resume recording */
  start: () => void;
  /** Pause the recognition (stops listening but keeps transcript) */
  pause: () => void;
  /** Permanently stop and finalise the transcript */
  stop: () => void;
  /** Clear transcript and return to idle */
  reset: () => void;
  /** Manually set the transcript (e.g. after user edits) */
  setTranscript: (text: string) => void;
  /** Language code used for recognition (default: "en-US") */
  language: string;
}

/**
 * useSpeechRecognition
 *
 * A React hook that wraps the Web Speech API (SpeechRecognition) with a clean
 * state machine (idle → recording → paused → stopped) and returns the live
 * transcript plus control functions.
 *
 * Supports English by default; pass `language` prop to switch locale.
 * Gracefully degrades on browsers without SpeechRecognition support.
 */
export const useSpeechRecognition = (language = "en-US"): UseSpeechRecognitionReturn => {
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const accumulatedRef = useRef(""); // Stores finalised text across interim segments

  // Feature detection
  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  /** Initialise and configure a fresh SpeechRecognition instance */
  const createRecognition = useCallback(() => {
    if (!isSupported) return null;
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognitionAPI();
    rec.lang = language;
    rec.continuous = true;       // Keep listening until explicitly stopped
    rec.interimResults = true;   // Show partial results in real time

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      // Append any finalised text to our accumulator
      if (finalText) {
        accumulatedRef.current += finalText + " ";
      }
      // Show accumulated finals + current interim in the transcript
      setTranscript(accumulatedRef.current + interim);
    };

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("[useSpeechRecognition] Error:", event.error);
      if (event.error !== "aborted") {
        setStatus("stopped");
      }
    };

    rec.onend = () => {
      // If we're still supposed to be recording, restart (handles auto-stop timeout)
      setStatus((prev) => {
        if (prev === "recording") {
          try {
            rec.start();
          } catch {
            return "stopped";
          }
        }
        return prev;
      });
    };

    return rec;
  }, [isSupported, language]);

  /** Start or resume recording */
  const start = useCallback(() => {
    if (!isSupported) return;
    if (status === "recording") return;

    const rec = createRecognition();
    if (!rec) return;
    recognitionRef.current = rec;

    try {
      rec.start();
      setStatus("recording");
    } catch (err) {
      console.error("[useSpeechRecognition] Failed to start:", err);
    }
  }, [isSupported, status, createRecognition]);

  /** Pause — abort recognition but keep the accumulated transcript */
  const pause = useCallback(() => {
    if (status !== "recording") return;
    recognitionRef.current?.abort();
    setStatus("paused");
  }, [status]);

  /** Stop and finalise the session */
  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setStatus("stopped");
  }, []);

  /** Reset everything back to initial state */
  const reset = useCallback(() => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    accumulatedRef.current = "";
    setTranscript("");
    setStatus("idle");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  return {
    isSupported,
    status,
    transcript,
    isRecording: status === "recording",
    start,
    pause,
    stop,
    reset,
    setTranscript,
    language,
  };
};
