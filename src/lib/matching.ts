export type ShortageStatus = 'covered' | 'partial' | 'critical';

export interface ShortageResult {
  needed: number;
  hired: number;
  shortage: number;
  status: ShortageStatus;
  labelKey: string;
  color: string;
}

export function computeShortage(needed: number, hired: number): ShortageResult {
  const shortage = Math.max(0, needed - hired);
  let status: ShortageStatus = 'covered';
  let labelKey = 'covered';
  let color = 'green';

  if (shortage === 0) {
    status = 'covered';
    labelKey = 'covered';
    color = 'green';
  } else if (shortage <= Math.ceil(needed * 0.3)) {
    status = 'partial';
    labelKey = 'partial_shortage';
    color = 'amber';
  } else {
    status = 'critical';
    labelKey = 'critical_shortage';
    color = 'red';
  }

  return { needed, hired, shortage, status, labelKey, color };
}

export function formatDistance(km: number | null): string {
  if (km === null || km === undefined) return '';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
