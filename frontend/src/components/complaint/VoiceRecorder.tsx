import React, { useEffect } from "react";
import { Mic, MicOff, Pause, Play, RotateCcw, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { cn } from "@/lib/utils";

interface VoiceRecorderProps {
  /** Called whenever the transcript text changes (live or after edit) */
  onTranscriptChange: (text: string) => void;
  /** Initial transcript value (e.g. if pre-filled from typed description) */
  initialTranscript?: string;
  /** BCP 47 language tag (default: "en-US"); add more via language selector for i18n */
  language?: string;
}

/**
 * VoiceRecorder
 *
 * Provides a full voice recording UI with:
 *  - Start / Pause / Stop / Re-record controls
 *  - Animated waveform while recording
 *  - Live transcript display
 *  - Editable textarea so users can correct the transcript
 *
 * Uses the useSpeechRecognition hook internally.
 * Falls back gracefully if the browser doesn't support SpeechRecognition.
 */
const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscriptChange,
  initialTranscript = "",
  language = "en-US",
}) => {
  const {
    isSupported,
    status,
    transcript,
    isRecording,
    start,
    pause,
    stop,
    reset,
    setTranscript,
  } = useSpeechRecognition(language);

  // Sync transcript changes upward
  useEffect(() => {
    onTranscriptChange(transcript);
  }, [transcript, onTranscriptChange]);

  // Seed with initial transcript if provided
  useEffect(() => {
    if (initialTranscript && !transcript) {
      setTranscript(initialTranscript);
    }
  }, [initialTranscript]);

  const handleTextEdit = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTranscript(e.target.value);
    onTranscriptChange(e.target.value);
  };

  if (!isSupported) {
    return (
      <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 flex items-start gap-3">
        <MicOff className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-orange-800">Voice recording not supported</p>
          <p className="text-xs text-orange-600 mt-1">
            Your browser doesn't support voice input. Please type your complaint below instead. Chrome or Edge is recommended.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status indicator + Waveform */}
      <div
        className={cn(
          "relative rounded-xl border-2 p-5 flex items-center justify-between transition-all duration-300",
          isRecording
            ? "border-red-400 bg-red-50"
            : status === "paused"
            ? "border-yellow-400 bg-yellow-50"
            : status === "stopped"
            ? "border-green-400 bg-green-50"
            : "border-slate-200 bg-slate-50"
        )}
      >
        {/* Left: icon + status text */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "relative flex items-center justify-center w-12 h-12 rounded-full",
              isRecording
                ? "bg-red-100"
                : status === "paused"
                ? "bg-yellow-100"
                : "bg-slate-100"
            )}
          >
            <Mic
              className={cn(
                "h-6 w-6",
                isRecording
                  ? "text-red-600"
                  : status === "paused"
                  ? "text-yellow-600"
                  : "text-slate-400"
              )}
            />
            {/* Pulsing ring while recording */}
            {isRecording && (
              <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-60" />
            )}
          </div>
          <div>
            <p
              className={cn(
                "text-sm font-semibold",
                isRecording
                  ? "text-red-700"
                  : status === "paused"
                  ? "text-yellow-700"
                  : status === "stopped"
                  ? "text-green-700"
                  : "text-slate-500"
              )}
            >
              {isRecording
                ? "🔴 Listening… Speak your complaint"
                : status === "paused"
                ? "⏸ Paused – Click Resume to continue"
                : status === "stopped"
                ? "✅ Recording complete"
                : "🎤 Press Start to record your complaint"}
            </p>
            {isRecording && (
              <p className="text-xs text-red-500 mt-0.5">Speak clearly in English</p>
            )}
          </div>
        </div>

        {/* Right: waveform bars (animated when recording) */}
        <div className="flex items-end gap-0.5 h-8">
          {[3, 6, 4, 8, 5, 9, 4, 7, 3, 6].map((h, i) => (
            <div
              key={i}
              className={cn(
                "w-1 rounded-full transition-all",
                isRecording ? "bg-red-500" : "bg-slate-300"
              )}
              style={{
                height: isRecording ? `${h * 3}px` : "4px",
                animation: isRecording
                  ? `wave ${0.4 + i * 0.07}s ease-in-out infinite alternate`
                  : "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* Control buttons */}
      <div className="flex flex-wrap gap-2">
        {status === "idle" || status === "stopped" ? (
          <Button
            type="button"
            onClick={start}
            className="gap-2 bg-red-600 hover:bg-red-700 text-white"
          >
            <Mic className="h-4 w-4" />
            {status === "stopped" ? "Re-record" : "Start Recording"}
          </Button>
        ) : null}

        {status === "recording" && (
          <>
            <Button
              type="button"
              onClick={pause}
              variant="outline"
              className="gap-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50"
            >
              <Pause className="h-4 w-4" />
              Pause
            </Button>
            <Button
              type="button"
              onClick={stop}
              variant="outline"
              className="gap-2 border-green-400 text-green-700 hover:bg-green-50"
            >
              <Square className="h-4 w-4" />
              Stop
            </Button>
          </>
        )}

        {status === "paused" && (
          <>
            <Button
              type="button"
              onClick={start}
              className="gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <Play className="h-4 w-4" />
              Resume
            </Button>
            <Button
              type="button"
              onClick={stop}
              variant="outline"
              className="gap-2"
            >
              <Square className="h-4 w-4" />
              Stop
            </Button>
          </>
        )}

        {(status === "stopped" || transcript) && (
          <Button
            type="button"
            onClick={reset}
            variant="ghost"
            className="gap-2 text-slate-500"
          >
            <RotateCcw className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Live / editable transcript */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-slate-700">
            Complaint Description{" "}
            {isRecording && (
              <span className="text-xs text-red-500 font-normal">(live)</span>
            )}
          </label>
          <span className="text-xs text-slate-400">{transcript.length} / 1000 chars</span>
        </div>
        <Textarea
          value={transcript}
          onChange={handleTextEdit}
          placeholder={
            isRecording
              ? "Transcript will appear here as you speak…"
              : "Your complaint description will appear here. You can edit it."
          }
          rows={5}
          maxLength={1000}
          className={cn(
            "resize-none transition-all",
            isRecording && "border-red-300 ring-1 ring-red-200"
          )}
        />
        <p className="text-xs text-slate-400 mt-1">
          You can edit the transcript above before submitting.
        </p>
      </div>

      {/* CSS animation for waveform bars */}
      <style>{`
        @keyframes wave {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
};

export default VoiceRecorder;
