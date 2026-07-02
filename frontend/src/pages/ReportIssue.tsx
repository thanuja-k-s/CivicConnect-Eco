import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { complaintService } from "@/services/complaintService";
import { ComplaintCategory, AiClassificationResult, CapturedLocation } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, MapPin, Camera, Mic, Sparkles, ClipboardCheck,
  Send, ChevronLeft, ChevronRight, CheckCircle2,
} from "lucide-react";
import GpsCapture from "@/components/complaint/GpsCapture";
import VoiceRecorder from "@/components/complaint/VoiceRecorder";
import CameraCapture from "@/components/complaint/CameraCapture";
import AiAnalysis from "@/components/complaint/AiAnalysis";
import EmergencyBanner from "@/components/complaint/EmergencyBanner";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Location",    Icon: MapPin,         description: "Capture your GPS location" },
  { id: 2, label: "Description", Icon: Mic,            description: "Voice or type your complaint" },
  { id: 3, label: "Photo",       Icon: Camera,         description: "Capture a photo of the issue" },
  { id: 4, label: "AI Analysis", Icon: Sparkles,       description: "Automatic categorisation" },
  { id: 5, label: "Review",      Icon: ClipboardCheck, description: "Review before submitting" },
  { id: 6, label: "Submit",      Icon: Send,           description: "Submit your complaint" },
];

const ALL_CATEGORIES: { value: ComplaintCategory; label: string }[] = [
  { value: "garbage",        label: "Garbage" },
  { value: "road",           label: "Road Damage" },
  { value: "water",          label: "Water Leakage" },
  { value: "drainage",       label: "Drainage Issue" },
  { value: "streetlight",    label: "Street Light Failure" },
  { value: "illegal-dumping",label: "Illegal Dumping" },
  { value: "fire-hazard",    label: "Fire Hazard" },
  { value: "electricity",    label: "Electricity Issue" },
  { value: "pollution",      label: "Pollution" },
  { value: "public-safety",  label: "Public Safety" },
  { value: "tree-fall",      label: "Tree Fall" },
  { value: "animal-issue",   label: "Animal Issue" },
  { value: "other",          label: "Other" },
];

// ─── Priority badge helper ────────────────────────────────────────────────────
const PriorityBadge = ({ level }: { level?: string }) => {
  if (!level) return null;
  const styles: Record<string, string> = {
    CRITICAL: "bg-red-100 text-red-700 border border-red-300",
    HIGH:     "bg-orange-100 text-orange-700 border border-orange-300",
    MEDIUM:   "bg-yellow-100 text-yellow-700 border border-yellow-300",
    LOW:      "bg-blue-100 text-blue-700 border border-blue-300",
  };
  return (
    <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full", styles[level] || "bg-slate-100 text-slate-600")}>
      {level}
    </span>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
const ReportIssue = () => {
  const [currentStep, setCurrentStep] = useState(1);

  // Core fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ComplaintCategory | "">("");

  // Step 1 – GPS
  const [capturedLocation, setCapturedLocation] = useState<CapturedLocation | null>(null);

  // Step 2 – Voice / Text
  const [description, setDescription] = useState("");
  const [usedVoice, setUsedVoice] = useState(false);
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice");

  // Step 3 – Camera
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [usedCamera, setUsedCamera] = useState(false);

  // Step 4 – AI
  const [aiResult, setAiResult] = useState<AiClassificationResult | null>(null);

  // Step 6 – Submit
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // ─── Navigation ─────────────────────────────────────────────────────────────
  const canGoNext = useCallback(() => {
    if (currentStep === 1) return true; // Location is optional (can be skipped)
    if (currentStep === 2) return description.trim().length >= 10;
    if (currentStep === 3) return true; // Photo is optional
    if (currentStep === 4) return true; // AI results always available after step 2
    if (currentStep === 5) return title.trim().length > 0 && (category || aiResult?.category);
    return true;
  }, [currentStep, description, title, category, aiResult]);

  const goNext = () => {
    if (!canGoNext()) {
      toast({
        title: "Step incomplete",
        description: currentStep === 2
          ? "Please add a description of at least 10 characters."
          : currentStep === 5
          ? "Please add a title before submitting."
          : "Please complete this step before continuing.",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep((s) => Math.min(s + 1, 6));
  };

  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 1));

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleLocationCapture = useCallback((loc: CapturedLocation) => {
    setCapturedLocation(loc);
  }, []);

  const handleTranscriptChange = useCallback((text: string) => {
    setDescription(text);
    if (text.length > 5) setUsedVoice(true);
  }, []);

  const handleCameraCapture = useCallback((dataUrl: string) => {
    setCapturedImage(dataUrl);
    setUsedCamera(true);
  }, []);

  const handleAiResult = useCallback((result: AiClassificationResult) => {
    setAiResult(result);
    // Auto-fill category if user hasn't chosen one yet
    if (!category && result.category) {
      setCategory(result.category);
    }
  }, [category]);

  // ─── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!user?.id) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    if (!title.trim()) {
      toast({ title: "Error", description: "Please add a title.", variant: "destructive" });
      return;
    }
    if (!description.trim()) {
      toast({ title: "Error", description: "Please add a description.", variant: "destructive" });
      return;
    }

    const effectiveCategory = (category || aiResult?.category || "other") as ComplaintCategory;

    setLoading(true);
    try {
      const created = await complaintService.createComplaint({
        title: title.trim(),
        description: description.trim(),
        category: effectiveCategory,
        location: {
          lat: capturedLocation?.lat ?? 28.6139,
          lng: capturedLocation?.lng ?? 77.209,
          address: capturedLocation?.address ?? "Location not captured",
        },
        citizenId: user.id,
        image: capturedImage || undefined,

        // Extended eco fields
        voiceTranscript: usedVoice ? description : undefined,
        locationAccuracy: capturedLocation?.accuracy,
        imageUrl: capturedImage || undefined,
        aiCategory: aiResult?.category,
        aiConfidence: aiResult?.confidence,
        priorityLevel: aiResult?.priority,
        priorityReason: aiResult?.priorityReason,
        imageAnalysisResult: aiResult ? JSON.stringify({
          detectedObjects: aiResult.detectedObjects,
          suggestedCategory: aiResult.suggestedCategory,
          suggestedPriority: aiResult.suggestedPriority,
        }) : undefined,
        createdFromVoice: usedVoice,
        createdFromCamera: usedCamera,
      });

      toast({
        title: "✅ Complaint Submitted!",
        description: `Complaint ID: ${created.complaintId || created.id}. Use this to track your issue.`,
      });

      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        title: "Submission failed",
        description: error.response?.data?.message || error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ─── Render step content ──────────────────────────────────────────────────────
  const renderStepContent = () => {
    switch (currentStep) {
      // ── Step 1: GPS ──────────────────────────────────────────────────────────
      case 1:
        return (
          <div className="space-y-4">
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700 flex gap-2">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Your location helps route this complaint to the correct authority. You can skip this step if needed.</span>
            </div>
            <GpsCapture onLocationCapture={handleLocationCapture} autoRequest={true} />
          </div>
        );

      // ── Step 2: Voice / Text ─────────────────────────────────────────────────
      case 2:
        return (
          <div className="space-y-4">
            {/* Mode Toggle */}
            <div className="flex rounded-lg overflow-hidden border border-slate-200">
              <button
                type="button"
                onClick={() => setInputMode("voice")}
                className={cn(
                  "flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors",
                  inputMode === "voice"
                    ? "bg-red-600 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                <Mic className="h-4 w-4" /> Record Voice
              </button>
              <button
                type="button"
                onClick={() => setInputMode("text")}
                className={cn(
                  "flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors",
                  inputMode === "text"
                    ? "bg-slate-700 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                ✏️ Type Text
              </button>
            </div>

            {inputMode === "voice" ? (
              <VoiceRecorder
                onTranscriptChange={handleTranscriptChange}
                initialTranscript={description}
              />
            ) : (
              <div className="space-y-2">
                <Label htmlFor="description">Complaint Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue in detail (minimum 10 characters)…"
                  rows={6}
                  maxLength={1000}
                />
                <p className="text-xs text-slate-400 text-right">{description.length}/1000</p>
              </div>
            )}
          </div>
        );

      // ── Step 3: Camera ────────────────────────────────────────────────────────
      case 3:
        return (
          <div className="space-y-4">
            <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-3 text-sm text-indigo-700 flex gap-2">
              <Camera className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Capture a photo of the issue directly with your camera. This step is optional but greatly helps officials assess the problem.</span>
            </div>
            <CameraCapture
              onCapture={handleCameraCapture}
              onClear={() => { setCapturedImage(null); setUsedCamera(false); }}
            />
          </div>
        );

      // ── Step 4: AI Analysis ───────────────────────────────────────────────────
      case 4:
        return (
          <div className="space-y-4">
            {aiResult?.priority === "CRITICAL" && (
              <EmergencyBanner
                priorityLevel={aiResult.priority}
                priorityReason={aiResult.priorityReason}
              />
            )}
            <AiAnalysis description={description} onResult={handleAiResult} />
          </div>
        );

      // ── Step 5: Review ────────────────────────────────────────────────────────
      case 5:
        return (
          <div className="space-y-5">
            {aiResult?.priority === "CRITICAL" && (
              <EmergencyBanner
                priorityLevel={aiResult.priority}
                priorityReason={aiResult.priorityReason}
              />
            )}

            {/* Title & Category inputs (required before submit) */}
            <div className="space-y-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                ✏️ Please add a title and confirm category before submitting
              </p>
              <div>
                <Label htmlFor="review-title">Complaint Title *</Label>
                <Input
                  id="review-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief issue title (e.g. 'Garbage dump near bus stand')"
                  maxLength={100}
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={category || aiResult?.category || ""}
                  onValueChange={(v) => setCategory(v as ComplaintCategory)}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select or confirm category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {ALL_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Location */}
              <div className="rounded-xl border border-slate-200 p-4 bg-white">
                <p className="text-xs text-slate-400 font-medium uppercase mb-2 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Location
                </p>
                {capturedLocation ? (
                  <>
                    <p className="text-sm font-medium text-slate-700 break-words">{capturedLocation.address}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {capturedLocation.lat.toFixed(5)}, {capturedLocation.lng.toFixed(5)}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-slate-400 italic">Location not captured</p>
                )}
              </div>

              {/* AI Classification */}
              <div className="rounded-xl border border-slate-200 p-4 bg-white">
                <p className="text-xs text-slate-400 font-medium uppercase mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> AI Classification
                </p>
                {aiResult ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Category:</span>
                      <span className="text-sm font-semibold text-slate-700 capitalize">
                        {ALL_CATEGORIES.find(c => c.value === (category || aiResult.category))?.label || aiResult.category}
                      </span>
                      <span className="text-xs text-indigo-500 ml-auto">{aiResult.confidence}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Priority:</span>
                      <PriorityBadge level={aiResult.priority} />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">Analysis not run</p>
                )}
              </div>

              {/* Voice */}
              <div className="rounded-xl border border-slate-200 p-4 bg-white">
                <p className="text-xs text-slate-400 font-medium uppercase mb-2 flex items-center gap-1.5">
                  <Mic className="h-3.5 w-3.5" /> Description
                </p>
                {usedVoice && (
                  <span className="inline-block text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium mb-1.5">
                    🎤 Voice recorded
                  </span>
                )}
                <p className="text-sm text-slate-700 line-clamp-3">{description || <span className="italic text-slate-400">No description</span>}</p>
              </div>

              {/* Photo */}
              <div className="rounded-xl border border-slate-200 p-4 bg-white">
                <p className="text-xs text-slate-400 font-medium uppercase mb-2 flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5" /> Photo
                </p>
                {capturedImage ? (
                  <>
                    <img
                      src={capturedImage}
                      alt="Complaint"
                      className="w-full h-28 object-cover rounded-lg"
                    />
                    {usedCamera && (
                      <span className="inline-block mt-1.5 text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-medium">
                        📷 Camera captured
                      </span>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-slate-400 italic">No photo attached</p>
                )}
              </div>
            </div>
          </div>
        );

      // ── Step 6: Submit ────────────────────────────────────────────────────────
      case 6:
        return (
          <div className="space-y-6 text-center py-4">
            {aiResult?.priority === "CRITICAL" && (
              <EmergencyBanner
                priorityLevel={aiResult.priority}
                priorityReason={aiResult.priorityReason}
              />
            )}

            <div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Ready to Submit!</h3>
              <p className="text-slate-500 text-sm max-w-sm">
                Your complaint with all captured data is ready. Click Submit to report it to the civic authorities.
              </p>
            </div>

            {/* Quick summary */}
            <div className="text-left rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Title</span>
                <span className="font-medium text-slate-700 max-w-[60%] text-right truncate">{title || "—"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Category</span>
                <span className="font-medium text-slate-700 capitalize">
                  {ALL_CATEGORIES.find(c => c.value === (category || aiResult?.category))?.label || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Priority</span>
                <PriorityBadge level={aiResult?.priority} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Location</span>
                <span className="text-slate-700">{capturedLocation ? "✅ Captured" : "❌ Not captured"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Photo</span>
                <span className="text-slate-700">{capturedImage ? "✅ Captured" : "❌ None"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Voice</span>
                <span className="text-slate-700">{usedVoice ? "✅ Recorded" : "❌ Typed"}</span>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-12 text-base font-bold bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              {loading ? "Submitting…" : "Submit Complaint"}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  const currentStepData = STEPS[currentStep - 1];

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="shadow-2xl border-0 overflow-hidden">
        {/* ── Progress Header ─────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 pt-6 pb-4">
          <h1 className="text-white text-xl font-bold mb-1">Report a Civic Issue</h1>
          <p className="text-slate-400 text-sm mb-5">Smart complaint reporting — Step {currentStep} of {STEPS.length}</p>

          {/* Step pills */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {STEPS.map((step) => {
              const isComplete = step.id < currentStep;
              const isCurrent = step.id === currentStep;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0",
                    isCurrent
                      ? "bg-white text-slate-800 shadow"
                      : isComplete
                      ? "bg-green-500/30 text-green-300 hover:bg-green-500/40 cursor-pointer"
                      : "bg-white/10 text-slate-500 cursor-default"
                  )}
                >
                  {isComplete ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                  ) : (
                    <step.Icon className="h-3.5 w-3.5" />
                  )}
                  {step.label}
                </button>
              );
            })}
          </div>

          {/* Overall progress bar */}
          <div className="mt-4 h-1 bg-white/20 rounded-full">
            <div
              className="h-1 bg-green-400 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* ── Step Content ─────────────────────────────────────────────────── */}
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <currentStepData.Icon className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{currentStepData.label}</CardTitle>
              <CardDescription className="text-sm">{currentStepData.description}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {renderStepContent()}

          {/* ── Navigation ─────────────────────────────────────────────────── */}
          {currentStep < 6 && (
            <div className="flex justify-between pt-4 border-t border-slate-100 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>

              <Button
                type="button"
                onClick={goNext}
                className="gap-2 bg-slate-800 hover:bg-slate-700 text-white"
              >
                {currentStep === 5 ? "Proceed to Submit" : "Next"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {currentStep === 6 && (
            <div className="pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="ghost"
                onClick={goBack}
                className="gap-2 text-slate-500 w-full"
              >
                <ChevronLeft className="h-4 w-4" /> Back to Review
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportIssue;
