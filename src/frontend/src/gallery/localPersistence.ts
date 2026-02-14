import { CaptureAnnotationData } from './annotationModel';

const STORAGE_KEY_PREFIX = 'earscope_';

export function saveQualityScore(captureId: string, score: number): void {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}quality_${captureId}`, score.toString());
  } catch (error) {
    console.error('Failed to save quality score:', error);
  }
}

export function getQualityScore(captureId: string): number | null {
  try {
    const score = localStorage.getItem(`${STORAGE_KEY_PREFIX}quality_${captureId}`);
    return score ? parseInt(score, 10) : null;
  } catch (error) {
    console.error('Failed to get quality score:', error);
    return null;
  }
}

export function saveAnnotation(data: CaptureAnnotationData): void {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}annotation_${data.captureId}`, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save annotation:', error);
  }
}

export function getAnnotation(captureId: string): CaptureAnnotationData | null {
  try {
    const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}annotation_${captureId}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to get annotation:', error);
    return null;
  }
}

export function saveCalibration(sessionId: string, pixelsPerMm: number, referenceLength: number): void {
  try {
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}calibration_${sessionId}`,
      JSON.stringify({ pixelsPerMm, referenceLength })
    );
  } catch (error) {
    console.error('Failed to save calibration:', error);
  }
}

export function getCalibration(sessionId: string): { pixelsPerMm: number; referenceLength: number } | null {
  try {
    const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}calibration_${sessionId}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to get calibration:', error);
    return null;
  }
}
