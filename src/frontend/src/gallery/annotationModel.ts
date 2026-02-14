export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

export interface TextLabel {
  text: string;
  position: Point;
  color: string;
  fontSize: number;
}

export interface Annotation {
  strokes: Stroke[];
  labels: TextLabel[];
}

export interface MeasurementCalibration {
  pixelsPerMm: number;
  referenceLength: number;
}

export interface CaptureAnnotationData {
  captureId: string;
  annotation: Annotation;
  calibration?: MeasurementCalibration;
}
