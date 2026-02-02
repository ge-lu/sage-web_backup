import type { Bill } from '../types';

/** Current vs history average must exceed this multiple to mark as abnormal (e.g. 2.5 = 2.5x) */
export const ABNORMAL_USAGE_MULTIPLIER = 2.5;

export interface AbnormalResult {
  usageStatus: 'abnormal';
  abnormalReason: string;
  multiplier: number;
}

/**
 * Returns abnormal result if utility bill amount (or totalUsageKwh) is significantly
 * higher than history average; otherwise returns null (normal).
 */
/** Only treat as electric bill (and run anomaly check) when period or totalUsageKwh is present */
export function detectUtilityAbnormal(bill: Bill): AbnormalResult | null {
  if (bill.category !== 'utility' || bill.status === 'paid') return null;
  if (bill.period == null && bill.totalUsageKwh == null) return null;
  const history = bill.history ?? [];
  if (history.length === 0) return null;

  const historyAvgAmount = history.reduce((s, r) => s + r.amount, 0) / history.length;
  if (historyAvgAmount <= 0) return null;

  const multiplier = bill.amount / historyAvgAmount;
  if (multiplier < ABNORMAL_USAGE_MULTIPLIER) return null;

  const rounded = Math.round(multiplier * 10) / 10;
  const abnormalReason =
    rounded >= 1
      ? `This month's bill is ${rounded}x higher than usual. Heater or AC may have been left on.`
      : `Usage is significantly higher than usual. Heater or AC may have been left on.`;

  return {
    usageStatus: 'abnormal',
    abnormalReason,
    multiplier: rounded,
  };
}
