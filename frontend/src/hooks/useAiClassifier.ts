import { useCallback } from "react";
import { AiClassificationResult, ComplaintCategory, PriorityLevel } from "@/types";

// ─── Category Keywords ────────────────────────────────────────────────────────
/**
 * Maps complaint category values to arrays of trigger keywords.
 * Keyword matching is case-insensitive. The category with the most
 * keyword matches wins; ties are broken by keyword weight ordering.
 */
const CATEGORY_KEYWORDS: Record<ComplaintCategory, string[]> = {
  "garbage": [
    "garbage", "trash", "waste", "dump", "rubbish", "litter", "smell", "odor",
    "sewage", "filth", "decompose", "rotting", "bin", "dustbin", "compost",
  ],
  "road": [
    "road", "pothole", "crack", "pavement", "footpath", "tar", "asphalt",
    "highway", "street", "lane", "bump", "erosion", "broken road", "damaged road",
  ],
  "water": [
    "water", "pipe", "leak", "supply", "tap", "no water", "contaminated",
    "drinking water", "water shortage", "overflow", "burst pipe",
  ],
  "drainage": [
    "drain", "drainage", "clog", "blocked drain", "overflow", "flood",
    "waterlogging", "sewer", "gutter", "stagnant",
  ],
  "streetlight": [
    "light", "streetlight", "lamp", "dark", "darkness", "bulb", "broken light",
    "no light", "dim", "flickering", "pole",
  ],
  "illegal-dumping": [
    "illegal dump", "unauthorized dump", "chemical waste", "construction waste",
    "debris", "fly-tipping", "dumping waste", "hazardous",
  ],
  "fire-hazard": [
    "fire", "smoke", "flame", "burning", "blaze", "spark", "ignite",
    "flammable", "gas leak", "explosion", "risk of fire",
  ],
  "electricity": [
    "electricity", "electric", "wire", "cable", "shock", "transformer",
    "power cut", "outage", "exposed wire", "sparking", "short circuit",
  ],
  "pollution": [
    "pollution", "air pollution", "smog", "noise pollution", "toxic",
    "chemical", "fumes", "exhaust", "industrial", "contamination",
  ],
  "public-safety": [
    "safety", "danger", "accident", "crime", "theft", "assault", "violence",
    "unsafe", "hazard", "collapse", "falling", "risk",
  ],
  "tree-fall": [
    "tree", "fallen tree", "branch", "uprooted", "tree fall", "timber",
    "roots", "bark", "tree collapse", "vegetation",
  ],
  "animal-issue": [
    "animal", "dog", "stray", "cat", "snake", "bite", "rabies", "pest",
    "rat", "mosquito", "cockroach", "cattle", "cow",
  ],
  "other": [],
};

// ─── Priority Keywords ────────────────────────────────────────────────────────
/**
 * Each priority level has trigger phrases. Evaluated in order: CRITICAL first.
 */
const PRIORITY_RULES: Array<{
  level: PriorityLevel;
  keywords: string[];
  reason: string;
}> = [
  {
    level: "CRITICAL",
    keywords: [
      "fire", "smoke", "burning", "blaze", "gas leak", "explosion",
      "electric shock", "sparking wire", "exposed wire", "collapse",
      "building collapse", "wall collapse", "flood", "drowning",
      "severe accident", "life threatening",
    ],
    reason: "Life-threatening hazard detected — immediate response required",
  },
  {
    level: "HIGH",
    keywords: [
      "major accident", "road accident", "injury", "injured", "hospital",
      "ambulance", "broken main", "water main", "power outage", "no electricity",
      "large pothole", "dangerous road", "sewage overflow",
    ],
    reason: "High-impact issue affecting safety or essential services",
  },
  {
    level: "MEDIUM",
    keywords: [
      "garbage", "dump", "trash", "rubbish", "drain", "clog", "waterlogging",
      "damaged road", "pothole", "streetlight", "dark street", "stray animal",
      "illegal dumping", "pollution",
    ],
    reason: "Civic inconvenience requiring prompt attention",
  },
  {
    level: "LOW",
    keywords: [
      "broken sign", "faded paint", "graffiti", "noise", "minor", "small",
      "parking", "footpath crack", "tree pruning", "abandoned vehicle",
    ],
    reason: "Minor issue that can be addressed during routine maintenance",
  },
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseAiClassifierReturn {
  classifyCategory: (text: string) => { category: ComplaintCategory; confidence: number };
  classifyPriority: (text: string, category: ComplaintCategory) => { priority: PriorityLevel; reason: string };
  analyzeText: (text: string) => AiClassificationResult;
}

/**
 * useAiClassifier
 *
 * A lightweight, fully client-side "AI" classifier based on keyword matching.
 * No external API key required. Easily replaceable with a real ML endpoint
 * by swapping the implementation inside `classifyCategory` and `classifyPriority`.
 *
 * Provides:
 *  - Category detection across 13 civic complaint categories
 *  - Priority classification across CRITICAL / HIGH / MEDIUM / LOW
 *  - Combined analysis that returns a full AiClassificationResult
 */
export const useAiClassifier = (): UseAiClassifierReturn => {
  /**
   * Classifies the complaint text into one of the 13 categories.
   * Returns the best matching category and a pseudo-confidence score (0–100).
   */
  const classifyCategory = useCallback(
    (text: string): { category: ComplaintCategory; confidence: number } => {
      const lower = text.toLowerCase();
      let bestCategory: ComplaintCategory = "other";
      let bestScore = 0;

      for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS) as [ComplaintCategory, string[]][]) {
        if (cat === "other") continue;
        const score = keywords.reduce(
          (acc, kw) => acc + (lower.includes(kw) ? kw.split(" ").length : 0),
          0
        );
        if (score > bestScore) {
          bestScore = score;
          bestCategory = cat;
        }
      }

      // Convert raw keyword hit count to a 0–100 confidence percentage
      // Cap at 98 to avoid implying perfect certainty
      const confidence = bestScore === 0 ? 40 : Math.min(40 + bestScore * 12, 98);
      return { category: bestCategory, confidence };
    },
    []
  );

  /**
   * Classifies the complaint text into a priority level.
   * Priority rules are evaluated from CRITICAL → LOW; the first match wins.
   */
  const classifyPriority = useCallback(
    (text: string, category: ComplaintCategory): { priority: PriorityLevel; reason: string } => {
      const lower = text.toLowerCase();
      for (const rule of PRIORITY_RULES) {
        const matched = rule.keywords.some((kw) => lower.includes(kw));
        if (matched) {
          return { priority: rule.level, reason: rule.reason };
        }
      }
      // Category-based fallback priority when no explicit keywords matched
      const categoryPriority: Partial<Record<ComplaintCategory, PriorityLevel>> = {
        "fire-hazard": "CRITICAL",
        "electricity": "HIGH",
        "road": "HIGH",
        "water": "MEDIUM",
        "drainage": "MEDIUM",
        "garbage": "MEDIUM",
        "illegal-dumping": "MEDIUM",
        "streetlight": "LOW",
        "tree-fall": "MEDIUM",
        "animal-issue": "LOW",
        "pollution": "MEDIUM",
        "public-safety": "HIGH",
        "other": "LOW",
      };
      const priority = categoryPriority[category] || "LOW";
      return { priority, reason: "Priority assigned based on complaint category" };
    },
    []
  );

  /**
   * Full analysis: runs both category and priority classification on the text
   * and returns a combined AiClassificationResult object.
   */
  const analyzeText = useCallback(
    (text: string): AiClassificationResult => {
      const { category, confidence } = classifyCategory(text);
      const { priority, reason } = classifyPriority(text, category);

      // Build a list of "detected keywords" to show the user
      const lower = text.toLowerCase();
      const detectedObjects: string[] = [];
      for (const keywords of Object.values(CATEGORY_KEYWORDS)) {
        keywords.forEach((kw) => {
          if (lower.includes(kw) && !detectedObjects.includes(kw)) {
            detectedObjects.push(kw);
          }
        });
      }

      return {
        category,
        confidence,
        priority,
        priorityReason: reason,
        detectedObjects: detectedObjects.slice(0, 8), // Show max 8 objects
        suggestedCategory: category,
        suggestedPriority: priority,
      };
    },
    [classifyCategory, classifyPriority]
  );

  return { classifyCategory, classifyPriority, analyzeText };
};
