// Time utility functions for the stopwatch and formatting

export const formatTimeDuration = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatDateTimeInput = (date: Date): string => {
  return date.toISOString().slice(0, 16); // Format for datetime-local input
};

export const getTimeSinceLastImpression = (
  lastImpressionDate: string
): number => {
  const timeDiff = Date.now() - new Date(lastImpressionDate).getTime();
  // Ensure we never return negative values (in case of clock skew or future dates)
  return Math.max(0, timeDiff);
};
