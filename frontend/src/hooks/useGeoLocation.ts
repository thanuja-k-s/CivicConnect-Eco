import { useState, useCallback, useEffect } from "react";
import { CapturedLocation } from "@/types";

export type GeoStatus = "idle" | "requesting" | "success" | "error";

export type GeoPermissionState = "unknown" | "granted" | "denied" | "prompt";

export interface UseGeoLocationReturn {
  location: CapturedLocation | null;
  status: GeoStatus;
  error: string | null;
  permissionState: GeoPermissionState;
  requestLocation: () => void;
}

/**
 * useGeoLocation
 *
 * Wraps the browser Geolocation API and performs reverse geocoding via the
 * free OpenStreetMap Nominatim API (no API key required).
 *
 * Returns: { lat, lng, accuracy, timestamp, address }
 */
export const useGeoLocation = (): UseGeoLocationReturn => {
  const [location, setLocation] = useState<CapturedLocation | null>(null);
  const [status, setStatus] = useState<GeoStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<GeoPermissionState>("unknown");

  useEffect(() => {
    if (!navigator.permissions?.query) return;

    navigator.permissions
      .query({ name: "geolocation" })
      .then((result) => {
        setPermissionState(result.state as GeoPermissionState);
        result.onchange = () => {
          setPermissionState(result.state as GeoPermissionState);
        };
      })
      .catch(() => {
        setPermissionState("unknown");
      });
  }, []);

  /**
   * Reverse geocodes lat/lng to a human-readable address using
   * the Nominatim API (free, no key required).
   */
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        {
          headers: {
            // Nominatim requires a User-Agent to identify the application
            "Accept-Language": "en",
          },
        }
      );
      if (!resp.ok) throw new Error("Nominatim request failed");
      const data = await resp.json();
      // Build a short readable address from the most relevant parts
      const parts = [
        data.address?.road,
        data.address?.suburb || data.address?.neighbourhood,
        data.address?.city || data.address?.town || data.address?.village,
        data.address?.state,
        data.address?.country,
      ].filter(Boolean);
      return parts.length > 0 ? parts.join(", ") : data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch {
      // Fall back to coordinate string if reverse geocoding fails
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
  };

  /** Trigger a geolocation request. Browser will show the permission prompt. */
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setStatus("error");
      return;
    }

    if (permissionState === "denied") {
      setError("Location permission is blocked in this browser.");
      setStatus("error");
      return;
    }

    setStatus("requesting");
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const address = await reverseGeocode(latitude, longitude);
        setLocation({
          lat: latitude,
          lng: longitude,
          accuracy,
          timestamp: position.timestamp,
          address,
        });
        setStatus("success");
      },
      (err) => {
        console.error("[useGeoLocation] Error:", err);
        let msg = "Unable to retrieve your location.";
        if (err.code === err.PERMISSION_DENIED) msg = "Location permission was denied.";
        else if (err.code === err.POSITION_UNAVAILABLE) msg = "Location information is unavailable.";
        else if (err.code === err.TIMEOUT) msg = "Location request timed out.";
        setError(msg);
        setStatus("error");
      },
      {
        enableHighAccuracy: true,  // Use GPS on mobile if available
        timeout: 15000,            // 15 second timeout
        maximumAge: 30000,         // Accept cached positions up to 30s old
      }
    );
  }, [permissionState]);

  return { location, status, error, permissionState, requestLocation };
};
