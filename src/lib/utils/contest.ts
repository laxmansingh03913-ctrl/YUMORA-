/**
 * Unified Timezone-Aware Contest Scheduling & Status Utility for Yomika
 */

import { Contest } from "../types";

export type ContestComputedStatus = "DRAFT" | "SCHEDULED" | "LIVE" | "ENDED";

export interface CountdownState {
  status: ContestComputedStatus;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isZero: boolean;
  label: string;
  badgeText: string;
  formattedRemaining: string;
}

export const DEFAULT_TIMEZONE = "Asia/Kolkata";

export const SUPPORTED_TIMEZONES = [
  { value: "Asia/Kolkata", label: "India Standard Time (IST) — UTC+5:30" },
  { value: "UTC", label: "Coordinated Universal Time (UTC) — UTC+0:00" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (JST) — UTC+9:00" },
  { value: "America/New_York", label: "Eastern Time (US) — UTC-5:00 / -4:00" },
  { value: "America/Los_Angeles", label: "Pacific Time (US) — UTC-8:00 / -7:00" },
  { value: "Europe/London", label: "Greenwich Mean / British Time — UTC+0:00 / +1:00" },
  { value: "Asia/Seoul", label: "Korea Standard Time (KST) — UTC+9:00" },
  { value: "Asia/Singapore", label: "Singapore Standard Time (SGT) — UTC+8:00" },
];

/**
 * Parses date string ensuring timezone sensitivity
 */
export function parseDateTimestamp(dateString: string | undefined): number {
  if (!dateString) return 0;
  const parsed = new Date(dateString).getTime();
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Centralized Contest Status Determination
 * Rules:
 *  - isPublished === false or status === 'DRAFT' => DRAFT
 *  - now < start => SCHEDULED
 *  - start <= now < end => LIVE
 *  - now >= end => ENDED
 */
export function getContestStatus(contest: Partial<Contest> | undefined, currentTime = Date.now()): ContestComputedStatus {
  if (!contest) return "DRAFT";

  // Explicit Draft override
  if (contest.isPublished === false || contest.status === "DRAFT") {
    return "DRAFT";
  }

  const startTime = parseDateTimestamp(contest.startDate);
  const endTime = parseDateTimestamp(contest.endDate);

  // If no valid dates, treat as draft
  if (!startTime || !endTime) {
    return "DRAFT";
  }

  if (currentTime < startTime) {
    return "SCHEDULED";
  }

  if (currentTime >= startTime && currentTime < endTime) {
    return "LIVE";
  }

  return "ENDED";
}

/**
 * Calculates live real-time countdown values for a contest
 */
export function getContestCountdown(contest: Partial<Contest> | undefined, currentTime = Date.now()): CountdownState {
  const status = getContestStatus(contest, currentTime);
  const startTime = parseDateTimestamp(contest?.startDate);
  const endTime = parseDateTimestamp(contest?.endDate);

  if (status === "DRAFT" || !startTime || !endTime) {
    return {
      status: "DRAFT",
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      isZero: true,
      label: "DRAFT",
      badgeText: "DRAFT MODE",
      formattedRemaining: "UNPUBLISHED DRAFT",
    };
  }

  if (status === "SCHEDULED") {
    const diffMs = Math.max(0, startTime - currentTime);
    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      status: "SCHEDULED",
      days,
      hours,
      minutes,
      seconds,
      totalSeconds,
      isZero: totalSeconds <= 0,
      label: "STARTS IN",
      badgeText: days > 0 ? `STARTS IN ${days}D ${hours}H` : `STARTS IN ${hours}H ${minutes}M`,
      formattedRemaining: `${days} DAYS ${hours} HRS ${minutes} MIN ${seconds} SEC`,
    };
  }

  if (status === "LIVE") {
    const diffMs = Math.max(0, endTime - currentTime);
    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      status: "LIVE",
      days,
      hours,
      minutes,
      seconds,
      totalSeconds,
      isZero: totalSeconds <= 0,
      label: "TIME REMAINING",
      badgeText: days > 0 ? `${days} DAYS ${hours} HRS REMAINING` : `${hours}H ${minutes}M ${seconds}S REMAINING`,
      formattedRemaining: `${days} DAYS ${hours} HRS ${minutes} MIN ${seconds} SEC`,
    };
  }

  // ENDED
  return {
    status: "ENDED",
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
    isZero: true,
    label: "CONTEST ENDED",
    badgeText: "CONTEST ENDED",
    formattedRemaining: "SUBMISSIONS CLOSED",
  };
}

/**
 * Formats full deadline string according to configured timezone
 */
export function formatContestDeadline(
  dateString: string | undefined,
  timeZone = DEFAULT_TIMEZONE
): string {
  if (!dateString) return "TBD";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "TBD";

    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: timeZone || DEFAULT_TIMEZONE,
      timeZoneName: "short",
    }).format(d);
  } catch {
    return dateString;
  }
}

/**
 * Calculates human duration string between start and end dates
 */
export function calculateContestDuration(startDate: string, endDate: string): string {
  const start = parseDateTimestamp(startDate);
  const end = parseDateTimestamp(endDate);
  if (!start || !end || end <= start) return "Invalid duration";

  const diffSeconds = Math.floor((end - start) / 1000);
  const days = Math.floor(diffSeconds / 86400);
  const hours = Math.floor((diffSeconds % 86400) / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days} Day${days > 1 ? "s" : ""}`);
  if (hours > 0) parts.push(`${hours} Hour${hours > 1 ? "s" : ""}`);
  if (minutes > 0 && days === 0) parts.push(`${minutes} Min${minutes > 1 ? "s" : ""}`);

  return parts.join(", ") || "Less than a minute";
}

/**
 * Validates start and end dates for Admin validation
 */
export function validateContestSchedule(
  startDate: string,
  endDate: string
): { valid: boolean; error?: string } {
  if (!startDate) return { valid: false, error: "Start date and time is required." };
  if (!endDate) return { valid: false, error: "End date and time is required." };

  const start = parseDateTimestamp(startDate);
  const end = parseDateTimestamp(endDate);

  if (!start) return { valid: false, error: "Invalid start date format." };
  if (!end) return { valid: false, error: "Invalid end date format." };

  if (end <= start) {
    return { valid: false, error: "End date/time must be strictly after Start date/time." };
  }

  return { valid: true };
}
