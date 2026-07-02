import React, { useRef, useState, useCallback, useEffect } from "react";
import { Camera, RefreshCw, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CameraCaptureProps {
  /** Called with a Base64 JPEG data URL when the user captures a photo */
  onCapture: (dataUrl: string) => void;
  /** Called when the user removes the captured image */
  onClear?: () => void;
}

type CameraState = "idle" | "requesting" | "active" | "captured" | "error";

/**
 * CameraCapture
 *
 * Opens the device camera (front or back) using MediaDevices API.
 * Allows the user to:
 *  - Open camera
 *  - See live preview
 *  - Capture a frame as a Base64 JPEG
 *  - Preview the captured image
 *  - Retake
 *
 * Works on mobile browsers (back camera preferred) and desktop webcams.
 * No file picker required.
 */
const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClear }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  /** Stop all camera tracks and release the stream */
  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => () => stopStream(), [stopStream]);

  /** Open the device camera and start the live preview */
  const openCamera = async () => {
    setErrorMessage("");
    setCameraState("requesting");
    try {
      // Prefer the rear camera on mobile; fall back to any camera
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraState("active");
    } catch (err: any) {
      console.error("[CameraCapture] Error:", err);
      let msg = "Could not access camera.";
      if (err.name === "NotAllowedError") msg = "Camera permission was denied. Please allow camera access and try again.";
      else if (err.name === "NotFoundError") msg = "No camera found on this device.";
      else if (err.name === "NotReadableError") msg = "Camera is already in use by another application.";
      setErrorMessage(msg);
      setCameraState("error");
    }
  };

  /** Capture the current video frame as a JPEG Base64 data URL */
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Match canvas dimensions to the actual video stream
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImage(dataUrl);
    setCameraState("captured");
    stopStream(); // Release camera after capture
    onCapture(dataUrl);
  };

  /** Discard the captured image and re-open the camera */
  const retake = () => {
    setCapturedImage(null);
    onClear?.();
    openCamera();
  };

  /** Discard the captured image and return to idle */
  const clearCapture = () => {
    setCapturedImage(null);
    stopStream();
    setCameraState("idle");
    onClear?.();
  };

  return (
    <div className="space-y-4">
      {/* Camera viewport or captured image */}
      <div
        className={cn(
          "relative rounded-xl overflow-hidden border-2 bg-slate-900",
          cameraState === "captured" ? "border-green-400" : "border-slate-300",
          "aspect-video w-full"
        )}
        style={{ minHeight: "220px" }}
      >
        {/* Live video stream */}
        <video
          ref={videoRef}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity",
            cameraState === "active" ? "opacity-100" : "opacity-0"
          )}
          muted
          playsInline
          autoPlay
        />

        {/* Hidden canvas for frame capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Captured image preview */}
        {capturedImage && cameraState === "captured" && (
          <img
            src={capturedImage}
            alt="Captured complaint photo"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Idle state */}
        {cameraState === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Camera className="h-16 w-16 opacity-40" />
            <p className="text-sm">Camera preview will appear here</p>
          </div>
        )}

        {/* Requesting state */}
        {cameraState === "requesting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-blue-400">
            <Loader2 className="h-12 w-12 animate-spin" />
            <p className="text-sm text-blue-300">Accessing camera…</p>
          </div>
        )}

        {/* Error state */}
        {cameraState === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
            <AlertCircle className="h-10 w-10 text-red-400" />
            <p className="text-sm text-red-300 text-center">{errorMessage}</p>
          </div>
        )}

        {/* Captured badge */}
        {cameraState === "captured" && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Photo Captured
          </div>
        )}

        {/* Capture shutter button (shown when camera is active) */}
        {cameraState === "active" && (
          <button
            type="button"
            onClick={capturePhoto}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white border-4 border-slate-300 shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            aria-label="Capture photo"
          >
            <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-400" />
          </button>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {(cameraState === "idle" || cameraState === "error") && (
          <Button
            type="button"
            onClick={openCamera}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Camera className="h-4 w-4" />
            Open Camera
          </Button>
        )}

        {cameraState === "captured" && (
          <>
            <Button
              type="button"
              onClick={retake}
              variant="outline"
              className="gap-2 border-indigo-400 text-indigo-700 hover:bg-indigo-50"
            >
              <RefreshCw className="h-4 w-4" />
              Retake Photo
            </Button>
            <Button
              type="button"
              onClick={clearCapture}
              variant="ghost"
              className="gap-2 text-slate-500"
            >
              <X className="h-4 w-4" />
              Remove
            </Button>
          </>
        )}
      </div>

      <p className="text-xs text-slate-400">
        {cameraState === "active"
          ? "Press the white button to capture the photo."
          : cameraState === "captured"
          ? "Photo saved. Use Retake if you need a better shot."
          : "Opens your device camera directly. No file picker needed."}
      </p>
    </div>
  );
};

export default CameraCapture;
