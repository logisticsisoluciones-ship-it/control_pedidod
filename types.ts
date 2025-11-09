
export interface Operator {
  id: string;
  name: string;
}

export interface Order {
  id: string;
  creationTime: string; // ISO string for first scan
  startTime: string | null; // ISO string when preparation starts
  endTime: string | null; // ISO string when completed
  operator: Operator | null;
  pendingStatus?: 'por_preparar' | 'pendiente';
}