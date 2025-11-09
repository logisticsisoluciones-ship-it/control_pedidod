
export const formatDateTime = (isoString: string): string => {
  return new Date(isoString).toLocaleString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
  });
};

export const calculateDuration = (startIso: string | null, endIso: string | null): string => {
  if (!startIso || !endIso) return 'N/A';
  
  const diff = new Date(endIso).getTime() - new Date(startIso).getTime();
  
  if (diff < 0) return 'N/A';

  let seconds = Math.floor(diff / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);

  seconds = seconds % 60;
  minutes = minutes % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds >= 0 && parts.length === 0) parts.push(`${seconds}s`);


  return parts.join(' ');
};