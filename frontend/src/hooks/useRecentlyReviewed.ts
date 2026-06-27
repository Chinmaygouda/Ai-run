/**
 * useRecentlyReviewed
 * Persists the last 20 candidate views in localStorage.
 * Call `addReview(candidate)` whenever a candidate detail is opened.
 */

import { useState, useEffect, useCallback } from "react";

export interface ReviewedCandidate {
  candidate_id: string;
  rank: number | string;
  final_score: number;
  final_rule_score?: number;
  skill_score: number;
  experience_score: number;
  product_company_score?: number;
  behavior_score?: number;
  location_score?: number;
  keyword_stuffer_flag: boolean;
  honeypot_flag: boolean;
  duplicate_flag: boolean;
  reasoning?: string;
  reviewedAt: string; // ISO string timestamp
}

const STORAGE_KEY = "neuralsight_recently_reviewed";
const MAX_ITEMS = 20;

function loadFromStorage(): ReviewedCandidate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ReviewedCandidate[];
  } catch {
    return [];
  }
}

function saveToStorage(items: ReviewedCandidate[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage quota exceeded — silently ignore
  }
}

export function useRecentlyReviewed() {
  const [reviewed, setReviewed] = useState<ReviewedCandidate[]>(() => loadFromStorage());

  // Keep state in sync with localStorage across tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setReviewed(loadFromStorage());
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const addReview = useCallback((candidate: Omit<ReviewedCandidate, "reviewedAt">) => {
    setReviewed((prev) => {
      // Remove duplicate (same id) then prepend fresh entry
      const filtered = prev.filter((c) => c.candidate_id !== candidate.candidate_id);
      const next = [
        { ...candidate, reviewedAt: new Date().toISOString() },
        ...filtered,
      ].slice(0, MAX_ITEMS);
      saveToStorage(next);
      return next;
    });
  }, []);

  const removeReview = useCallback((id: string) => {
    setReviewed((prev) => {
      const next = prev.filter((c) => c.candidate_id !== id);
      saveToStorage(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setReviewed([]);
  }, []);

  return { reviewed, addReview, removeReview, clearHistory };
}

