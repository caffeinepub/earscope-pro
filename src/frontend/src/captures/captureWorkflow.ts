import { MicrocontrollerClient } from '../mcu/MicrocontrollerClient';
import { generateThumbnail, base64ToUint8Array } from './thumbnail';
import { ExternalBlob, Eye } from '../backend';

export interface CaptureMetadata {
  id: string;
  sessionId: string;
  patientId: string;
  eye: Eye;
  timestamp: number;
}

export class CaptureWorkflow {
  private client: MicrocontrollerClient;
  private onCaptureComplete: ((photo: string, thumbnail: string, metadata: CaptureMetadata) => void) | null = null;

  constructor(client: MicrocontrollerClient) {
    this.client = client;
  }

  setCaptureCompleteHandler(handler: ((photo: string, thumbnail: string, metadata: CaptureMetadata) => void) | null) {
    this.onCaptureComplete = handler;
  }

  async capture(sessionId: string, patientId: string, eye: Eye): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.client.setPhotoReceivedHandler(undefined);
        reject(new Error('Capture timeout'));
      }, 10000);

      this.client.setPhotoReceivedHandler(async (photoBase64) => {
        clearTimeout(timeout);
        this.client.setPhotoReceivedHandler(undefined);

        try {
          const thumbnail = await generateThumbnail(photoBase64);
          const metadata: CaptureMetadata = {
            id: `capture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            sessionId,
            patientId,
            eye,
            timestamp: Date.now(),
          };

          this.onCaptureComplete?.(photoBase64, thumbnail, metadata);
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      this.client.capturePhoto().catch(reject);
    });
  }

  async captureWithTimer(sessionId: string, patientId: string, eye: Eye, seconds: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
    return this.capture(sessionId, patientId, eye);
  }
}

export async function saveCapture(
  photoBase64: string,
  thumbnailBase64: string,
  metadata: CaptureMetadata,
  addCaptureFn: (capture: {
    id: string;
    sessionId: string;
    image: ExternalBlob;
    thumbnail: ExternalBlob;
  }) => Promise<void>
): Promise<void> {
  const imageBytes = base64ToUint8Array(photoBase64);
  const thumbnailBytes = base64ToUint8Array(thumbnailBase64);

  const imageBlob = ExternalBlob.fromBytes(imageBytes as Uint8Array<ArrayBuffer>);
  const thumbnailBlob = ExternalBlob.fromBytes(thumbnailBytes as Uint8Array<ArrayBuffer>);

  await addCaptureFn({
    id: metadata.id,
    sessionId: metadata.sessionId,
    image: imageBlob,
    thumbnail: thumbnailBlob,
  });
}
