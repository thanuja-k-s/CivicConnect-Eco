import React from "react";
import { AlertTriangle, Phone } from "lucide-react";

interface EmergencyBannerProps {
  priorityLevel?: string;
  priorityReason?: string;
}

/**
 * EmergencyBanner
 *
 * Displays a pulsing red alert banner when the complaint is classified as CRITICAL.
 * Used in Feature 7: Emergency Alert Workflow.
 * Renders nothing when priority is not CRITICAL.
 */
const EmergencyBanner: React.FC<EmergencyBannerProps> = ({
  priorityLevel,
  priorityReason,
}) => {
  if (priorityLevel !== "CRITICAL") return null;

  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-red-500 bg-red-600 text-white p-4 shadow-lg">
      {/* Pulsing background animation */}
      <div className="absolute inset-0 bg-red-700 animate-pulse opacity-30 pointer-events-none" />

      <div className="relative flex items-start gap-4">
        {/* Siren icon */}
        <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-white/20 border-2 border-white/40">
          <AlertTriangle className="h-6 w-6 text-white animate-bounce" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold tracking-widest bg-white text-red-700 px-2 py-0.5 rounded-full">
              🚨 CRITICAL ALERT
            </span>
          </div>
          <h3 className="font-extrabold text-lg mt-1">
            Emergency Detected — Immediate Response Required
          </h3>
          {priorityReason && (
            <p className="text-sm text-red-100 mt-0.5">{priorityReason}</p>
          )}
          <div className="mt-3 flex items-center gap-2 text-xs text-red-200">
            <Phone className="h-3.5 w-3.5" />
            <span>
              If this is a life-threatening emergency, also call{" "}
              <strong className="text-white">112 (National Emergency)</strong> immediately.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyBanner;
