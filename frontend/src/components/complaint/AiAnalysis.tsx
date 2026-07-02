import React, { useEffect, useState } from "react";
import {
  Sparkles,
  Tag,
  AlertTriangle,
  ChevronDown,
  Loader2,
  Shield,
  Flame,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAiClassifier } from "@/hooks/useAiClassifier";
import { AiClassificationResult, ComplaintCategory, PriorityLevel } from "@/types";
import { cn } from "@/lib/utils";

// ─── Helper data ─────────────────────────────────────────────────────────────
const ALL_CATEGORIES: { value: ComplaintCategory; label: string }[] = [
  { value: "garbage", label: "Garbage" },
  { value: "road", label: "Road Damage" },
  { value: "water", label: "Water Leakage" },
  { value: "drainage", label: "Drainage Issue" },
  { value: "streetlight", label: "Street Light Failure" },
  { value: "illegal-dumping", label: "Illegal Dumping" },
  { value: "fire-hazard", label: "Fire Hazard" },
  { value: "electricity", label: "Electricity Issue" },
  { value: "pollution", label: "Pollution" },
  { value: "public-safety", label: "Public Safety" },
  { value: "tree-fall", label: "Tree Fall" },
  { value: "animal-issue", label: "Animal Issue" },
  { value: "other", label: "Other" },
];

const PRIORITY_CONFIG: Record<
  PriorityLevel,
  { label: string; color: string; bg: string; border: string; Icon: React.ElementType }
> = {
  CRITICAL: {
    label: "CRITICAL",
    color: "text-red-700",
    bg: "bg-red-100",
    border: "border-red-400",
    Icon: Flame,
  },
  HIGH: {
    label: "HIGH",
    color: "text-orange-700",
    bg: "bg-orange-100",
    border: "border-orange-400",
    Icon: AlertTriangle,
  },
  MEDIUM: {
    label: "MEDIUM",
    color: "text-yellow-700",
    bg: "bg-yellow-100",
    border: "border-yellow-400",
    Icon: Shield,
  },
  LOW: {
    label: "LOW",
    color: "text-blue-700",
    bg: "bg-blue-100",
    border: "border-blue-400",
    Icon: Zap,
  },
};

interface AiAnalysisProps {
  /** Complaint description text to analyse */
  description: string;
  /** Callback with the final AI result (including any manual overrides) */
  onResult: (result: AiClassificationResult) => void;
}

/**
 * AiAnalysis
 *
 * Runs the client-side AI classifier on the complaint description and
 * displays:
 *  - Detected category with confidence progress bar
 *  - Priority badge with colour coding
 *  - List of detected keywords
 *  - Override dropdowns so users can correct AI decisions
 *
 * Propagates the final result (original or overridden) upward via onResult.
 */
const AiAnalysis: React.FC<AiAnalysisProps> = ({ description, onResult }) => {
  const { analyzeText } = useAiClassifier();
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [result, setResult] = useState<AiClassificationResult | null>(null);
  const [overrideCategory, setOverrideCategory] = useState<ComplaintCategory | "">("");
  const [overridePriority, setOverridePriority] = useState<PriorityLevel | "">("");
  const [showOverride, setShowOverride] = useState(false);

  // Re-run analysis whenever description changes
  useEffect(() => {
    if (!description.trim()) return;

    setIsAnalysing(true);
    // Simulate a brief "processing" delay for UX effect
    const timer = setTimeout(() => {
      const analysisResult = analyzeText(description);
      setResult(analysisResult);
      setOverrideCategory("");
      setOverridePriority("");
      setIsAnalysing(false);
    }, 900);

    return () => clearTimeout(timer);
  }, [description, analyzeText]);

  // Propagate effective result (with overrides) upward
  useEffect(() => {
    if (!result) return;
    const effective: AiClassificationResult = {
      ...result,
      category: (overrideCategory as ComplaintCategory) || result.category,
      priority: (overridePriority as PriorityLevel) || result.priority,
    };
    onResult(effective);
  }, [result, overrideCategory, overridePriority, onResult]);

  const effectiveCategory = (overrideCategory as ComplaintCategory) || result?.category;
  const effectivePriority = (overridePriority as PriorityLevel) || result?.priority;
  const priorityCfg = effectivePriority ? PRIORITY_CONFIG[effectivePriority] : null;

  if (!description.trim()) {
    return (
      <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center text-slate-400">
        <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">AI analysis will run once you add a complaint description.</p>
      </div>
    );
  }

  if (isAnalysing) {
    return (
      <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-8 flex flex-col items-center gap-4">
        <div className="relative">
          <Sparkles className="h-12 w-12 text-indigo-400" />
          <Loader2 className="absolute -top-1 -right-1 h-5 w-5 text-indigo-600 animate-spin" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-indigo-700">Analysing your complaint…</p>
          <p className="text-sm text-indigo-500 mt-1">
            Detecting category, severity, and keywords
          </p>
        </div>
        {/* Loading progress bar */}
        <div className="w-full bg-indigo-100 rounded-full h-1.5">
          <div className="bg-indigo-500 h-1.5 rounded-full animate-pulse" style={{ width: "70%" }} />
        </div>
      </div>
    );
  }

  if (!result) return null;

  const categoryLabel = ALL_CATEGORIES.find((c) => c.value === effectiveCategory)?.label || effectiveCategory;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-indigo-500" />
        <h3 className="font-semibold text-slate-700">AI Analysis Results</h3>
        <span className="ml-auto text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
          Auto-classified
        </span>
      </div>

      {/* Category result card */}
      <div className="rounded-xl border border-slate-200 p-4 bg-white space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">
              Detected Category
            </p>
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-indigo-500" />
              <span className="font-bold text-slate-800 text-lg">{categoryLabel}</span>
              {overrideCategory && (
                <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                  Overridden
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">
              Confidence
            </p>
            <span className="text-2xl font-extrabold text-indigo-600">
              {result.confidence}%
            </span>
          </div>
        </div>

        {/* Confidence bar */}
        <div className="space-y-1">
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-700",
                result.confidence >= 80
                  ? "bg-green-500"
                  : result.confidence >= 60
                  ? "bg-yellow-500"
                  : "bg-orange-500"
              )}
              style={{ width: `${result.confidence}%` }}
            />
          </div>
          <p className="text-xs text-slate-400">
            {result.confidence >= 80
              ? "High confidence prediction"
              : result.confidence >= 60
              ? "Moderate confidence – please verify"
              : "Low confidence – manual selection recommended"}
          </p>
        </div>
      </div>

      {/* Priority result card */}
      {priorityCfg && effectivePriority && (
        <div
          className={cn(
            "rounded-xl border-2 p-4",
            priorityCfg.bg,
            priorityCfg.border
          )}
        >
          <p className="text-xs font-medium uppercase tracking-wide mb-2 opacity-70">
            AI Priority Classification
          </p>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm"
              )}
            >
              <priorityCfg.Icon className={cn("h-5 w-5", priorityCfg.color)} />
            </div>
            <div>
              <p className={cn("font-extrabold text-xl tracking-wide", priorityCfg.color)}>
                {effectivePriority}
                {overridePriority && (
                  <span className="text-xs bg-white/60 ml-2 px-1.5 py-0.5 rounded font-medium">
                    Overridden
                  </span>
                )}
              </p>
              <p className={cn("text-xs mt-0.5 opacity-80", priorityCfg.color)}>
                {result.priorityReason}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Detected keywords */}
      {result.detectedObjects.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 font-medium mb-2 uppercase tracking-wide">
            Detected Keywords
          </p>
          <div className="flex flex-wrap gap-1.5">
            {result.detectedObjects.map((obj, i) => (
              <span
                key={i}
                className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium capitalize"
              >
                {obj}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Override section */}
      <div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-2 text-slate-500 w-full justify-start"
          onClick={() => setShowOverride((v) => !v)}
        >
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", showOverride && "rotate-180")}
          />
          {showOverride ? "Hide" : "Override AI Decision"}
        </Button>

        {showOverride && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">
                Override Category
              </label>
              <Select
                value={overrideCategory}
                onValueChange={(v) => setOverrideCategory(v as ComplaintCategory)}
              >
                <SelectTrigger className="bg-white text-sm">
                  <SelectValue placeholder="AI decision" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {ALL_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">
                Override Priority
              </label>
              <Select
                value={overridePriority}
                onValueChange={(v) => setOverridePriority(v as PriorityLevel)}
              >
                <SelectTrigger className="bg-white text-sm">
                  <SelectValue placeholder="AI decision" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as PriorityLevel[]).map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(overrideCategory || overridePriority) && (
              <button
                type="button"
                className="sm:col-span-2 text-xs text-slate-400 hover:text-slate-600 text-left underline"
                onClick={() => { setOverrideCategory(""); setOverridePriority(""); }}
              >
                Reset to AI decision
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AiAnalysis;
