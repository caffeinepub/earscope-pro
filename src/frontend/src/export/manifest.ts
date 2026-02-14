import { Capture, Patient, Session } from '../backend';
import { getQualityScore, getAnnotation } from '../gallery/localPersistence';

export interface ExportManifest {
  exportDate: string;
  patient: Patient;
  session: Session;
  captures: Array<{
    id: string;
    filename: string;
    timestamp: number;
    qualityScore?: number;
    hasAnnotations: boolean;
  }>;
}

export function generateManifest(patient: Patient, session: Session, captures: Capture[]): ExportManifest {
  return {
    exportDate: new Date().toISOString(),
    patient,
    session,
    captures: captures.map((capture, index) => ({
      id: capture.id,
      filename: `capture_${index + 1}.jpg`,
      timestamp: Number(capture.timestamp),
      qualityScore: getQualityScore(capture.id) || undefined,
      hasAnnotations: !!getAnnotation(capture.id),
    })),
  };
}
