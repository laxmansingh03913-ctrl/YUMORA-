"use client";

import { useState, useEffect } from "react";
import { Contest } from "@/lib/types";
import { getContestCountdown, CountdownState } from "@/lib/utils/contest";

export function useContestCountdown(contest: Partial<Contest> | undefined): CountdownState {
  const [countdown, setCountdown] = useState<CountdownState>(() =>
    getContestCountdown(contest, Date.now())
  );

  useEffect(() => {
    // Initial evaluation
    setCountdown(getContestCountdown(contest, Date.now()));

    // Tick every 1 second
    const interval = setInterval(() => {
      setCountdown(getContestCountdown(contest, Date.now()));
    }, 1000);

    return () => clearInterval(interval);
  }, [contest?.startDate, contest?.endDate, contest?.status, contest?.isPublished]);

  return countdown;
}
