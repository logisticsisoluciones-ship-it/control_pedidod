export const formatDateTime = (isoString: string): string => {
  return new Date(isoString).toLocaleString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
  });
};

/**
 * Formats a duration from milliseconds into a human-readable string.
 * - If over an hour, shows hours and minutes (e.g., "1h 15m").
 * - If less than an hour, shows minutes and seconds (e.g., "15m 30s").
 * - If less than a minute, shows seconds (e.g., "30s").
 * @param diff The duration in milliseconds.
 * @returns A formatted string or 'N/A' if the input is invalid.
 */
export const formatDurationFromMillis = (diff: number): string => {
  if (isNaN(diff) || diff < 0) return 'N/A';

  let totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};


/**
 * Calculates the duration between two ISO date strings.
 * @param startIso The start date in ISO format.
 * @param endIso The end date in ISO format.
 * @returns A formatted duration string.
 */
export const calculateDuration = (startIso: string | null, endIso: string | null): string => {
  if (!startIso || !endIso) return 'N/A';
  
  const diff = new Date(endIso).getTime() - new Date(startIso).getTime();
  
  return formatDurationFromMillis(diff);
};