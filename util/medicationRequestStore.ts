import type { MedicationConfirmItem } from '../types';

const STORAGE_KEY = 'medication-confirm-request';

export interface AddMedicationConfirmRequestParams {
  contactId: string;
  contactName: string;
  summary: string;
  imageDataUrl?: string | null;
  medications: MedicationConfirmItem[];
}

/** 将药品确认请求写入 sessionStorage，供看护人确认页读取 */
export function addMedicationConfirmRequest(params: AddMedicationConfirmRequestParams): void {
  const payload = {
    contactId: params.contactId,
    contactName: params.contactName,
    senderName: 'Family member',
    summary: params.summary,
    imageDataUrl: params.imageDataUrl ?? undefined,
    medications: params.medications,
    sentAt: new Date().toISOString(),
  };
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota / private mode
  }
}
