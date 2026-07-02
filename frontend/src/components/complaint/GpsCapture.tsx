import React, { useEffect, useRef } from "react";
import { MapPin, Navigation, AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { CapturedLocation } from "@/types";
import { cn } from "@/lib/utils";

interface GpsCaptureProps {
  onLocationCapture: (location: CapturedLocation) => void;
  /** Auto-request location on mount without waiting for button click */
  autoRequest?: boolean;
}

/**
 * GpsCapture
 *
 * Requests the user's GPS location using the browser Geolocation API.
 * Displays:
 *  - Permission request prompt
 *  - Live loading state
 *  - Location details (lat/lng, accuracy, timestamp, address)
 *  - OpenStreetMap tile preview
 *  - Re-request button
 */
const GpsCapture: React.FC<GpsCaptureProps> = ({
  onLocationCapture,
  autoRequest = true,
}) => {
  const { location, status, error, permissionState, requestLocation } = useGeoLocation();
  const autoRequestedRef = useRef(false);
  const deniedPermission = permissionState === "denied" || error === "Location permission was denied." || error === "Location permission is blocked in this browser.";
  const locationHelpText = deniedPermission
    ? "This usually means your browser has already blocked location access for this site. Open the padlock icon in the address bar, allow Location, then try again."
    : null;

  // Auto-request on mount if enabled
  useEffect(() => {
    if (autoRequest && !autoRequestedRef.current && permissionState !== "denied") {
      autoRequestedRef.current = true;
      requestLocation();
    }
  }, [autoRequest, permissionState, requestLocation]);

  // Propagate captured location upward
  useEffect(() => {
    if (location) {
      onLocationCapture(location);
    }
  }, [location, onLocationCapture]);

  const formattedAccuracy =
    location?.accuracy != null
      ? location.accuracy < 10
        ? "High (< 10 m)"
        : location.accuracy < 50
        ? `Medium (~${Math.round(location.accuracy)} m)`
        : `Low (~${Math.round(location.accuracy)} m)`
      : "—";

  return (
    <div className="space-y-4">
      {/* Status card */}
      <div
        className={cn(
          "rounded-xl border-2 p-5 transition-all",
          status === "success"
            ? "border-green-400 bg-green-50"
            : status === "error"
            ? "border-red-300 bg-red-50"
            : status === "requesting"
            ? "border-blue-300 bg-blue-50"
            : "border-slate-200 bg-slate-50"
        )}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-full shrink-0",
              status === "success"
                ? "bg-green-100"
                : status === "error"
                ? "bg-red-100"
                : status === "requesting"
                ? "bg-blue-100"
                : "bg-slate-100"
            )}
          >
            {status === "requesting" ? (
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            ) : status === "success" ? (
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            ) : status === "error" ? (
              <AlertCircle className="h-6 w-6 text-red-500" />
            ) : (
              <MapPin className="h-6 w-6 text-slate-400" />
            )}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            {status === "idle" && (
              <>
                <p className="font-semibold text-slate-700">Location not captured yet</p>
                <p className="text-sm text-slate-500 mt-0.5">
                  Your location helps route this complaint to the correct local authority.
                </p>
              </>
            )}
            {status === "requesting" && (
              <>
                <p className="font-semibold text-blue-700">Requesting your location…</p>
                <p className="text-sm text-blue-600 mt-0.5">
                  Please allow location access when prompted by your browser.
                </p>
              </>
            )}
            {status === "success" && location && (
              <>
                <p className="font-semibold text-green-700">📍 Location captured!</p>
                <p className="text-sm text-green-800 mt-0.5 break-words font-medium">
                  {location.address}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-green-700">
                  <span>
                    <strong>Lat:</strong> {location.lat.toFixed(6)}
                  </span>
                  <span>
                    <strong>Lng:</strong> {location.lng.toFixed(6)}
                  </span>
                  <span>
                    <strong>Accuracy:</strong> {formattedAccuracy}
                  </span>
                  <span>
                    <strong>Time:</strong>{" "}
                    {new Date(location.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </>
            )}
            {status === "error" && (
              <>
                <p className="font-semibold text-red-700">Location unavailable</p>
                <p className="text-sm text-red-600 mt-0.5">{error}</p>
                {locationHelpText && (
                  <p className="text-sm text-red-500 mt-2">
                    {locationHelpText} If the browser still does not prompt, refresh the page and try once more.
                  </p>
                )}
                {deniedPermission && (
                  <div className="mt-3 rounded-lg border border-red-200 bg-white/70 p-3 text-sm text-red-700">
                    <p className="font-medium">How to enable it</p>
                    <p className="mt-1">Chrome / Edge: click the lock icon next to the address bar, set Location to Allow, then reload the page.</p>
                    <p className="mt-1">Windows: go to Settings → Privacy & security → Location and make sure Location services are on.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Map preview (only shown when location is captured) */}
      {status === "success" && location && (
        <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
          <div className="bg-slate-100 px-3 py-2 flex items-center gap-2 border-b border-slate-200">
            <Navigation className="h-4 w-4 text-slate-500" />
            <span className="text-xs font-medium text-slate-600">Location Preview</span>
          </div>
          <iframe
            title="Location map preview"
            className="w-full"
            height="220"
            frameBorder="0"
            scrolling="no"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.01}%2C${location.lat - 0.01}%2C${location.lng + 0.01}%2C${location.lat + 0.01}&layer=mapnik&marker=${location.lat}%2C${location.lng}`}
          />
          <div className="bg-slate-50 px-3 py-1.5 flex items-center justify-between border-t border-slate-200">
            <span className="text-xs text-slate-400">Powered by OpenStreetMap</span>
            <a
              href={`https://www.openstreetmap.org/?mlat=${location.lat}&mlon=${location.lng}#map=17/${location.lat}/${location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline"
            >
              Open full map ↗
            </a>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {status !== "success" && (
          <Button
            type="button"
            onClick={requestLocation}
            disabled={status === "requesting"}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {status === "requesting" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            {status === "requesting" ? "Getting Location…" : deniedPermission ? "Enable Location Access" : "Get My Location"}
          </Button>
        )}
        {status === "success" && (
          <Button
            type="button"
            onClick={requestLocation}
            variant="outline"
            className="gap-2 text-slate-600"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Location
          </Button>
        )}
      </div>
    </div>
  );
};

export default GpsCapture;
