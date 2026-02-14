import { CaptureWorkflow, CaptureMetadata } from './captureWorkflow';
import { Eye } from '../backend';

export class BatchCaptureController {
  private workflow: CaptureWorkflow;
  private onProgress: ((current: number, total: number) => void) | null = null;
  private onComplete: ((captures: Array<{ photo: string; thumbnail: string; metadata: CaptureMetadata }>) => void) | null = null;
  private onError: ((error: Error) => void) | null = null;
  private isCancelled = false;

  constructor(workflow: CaptureWorkflow) {
    this.workflow = workflow;
  }

  setProgressHandler(handler: (current: number, total: number) => void) {
    this.onProgress = handler;
  }

  setCompleteHandler(
    handler: (captures: Array<{ photo: string; thumbnail: string; metadata: CaptureMetadata }>) => void
  ) {
    this.onComplete = handler;
  }

  setErrorHandler(handler: (error: Error) => void) {
    this.onError = handler;
  }

  async start(sessionId: string, patientId: string, eye: Eye, count = 5): Promise<void> {
    this.isCancelled = false;
    const captures: Array<{ photo: string; thumbnail: string; metadata: CaptureMetadata }> = [];

    const captureHandler = (photo: string, thumbnail: string, metadata: CaptureMetadata) => {
      captures.push({ photo, thumbnail, metadata });
    };

    this.workflow.setCaptureCompleteHandler(captureHandler);

    try {
      for (let i = 0; i < count; i++) {
        if (this.isCancelled) {
          throw new Error('Batch capture cancelled');
        }

        this.onProgress?.(i + 1, count);
        await this.workflow.capture(sessionId, patientId, eye);

        if (i < count - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500)); // 2 per second
        }
      }

      this.onComplete?.(captures);
    } catch (error) {
      this.onError?.(error as Error);
    } finally {
      this.workflow.setCaptureCompleteHandler(null);
    }
  }

  cancel() {
    this.isCancelled = true;
  }
}
