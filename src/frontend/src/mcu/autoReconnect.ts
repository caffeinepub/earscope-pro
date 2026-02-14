import { MicrocontrollerClient } from './MicrocontrollerClient';

export class AutoReconnect {
  private client: MicrocontrollerClient;
  private mode: 'webserial' | 'webusb' | 'demo' = 'demo';
  private reconnectAttempts = 0;
  private maxAttempts = 5;
  private reconnectDelay = 3000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private onStatusUpdate: ((status: string, countdown?: number) => void) | null = null;

  constructor(client: MicrocontrollerClient) {
    this.client = client;
  }

  setMode(mode: 'webserial' | 'webusb' | 'demo') {
    this.mode = mode;
  }

  setStatusUpdateHandler(handler: (status: string, countdown?: number) => void) {
    this.onStatusUpdate = handler;
  }

  async attemptReconnect(): Promise<boolean> {
    if (this.reconnectAttempts >= this.maxAttempts) {
      this.onStatusUpdate?.('Max reconnection attempts reached');
      return false;
    }

    this.reconnectAttempts++;
    this.onStatusUpdate?.(`Reconnecting (${this.reconnectAttempts}/${this.maxAttempts})...`);

    try {
      await this.client.connect(this.mode);
      this.reconnectAttempts = 0;
      this.onStatusUpdate?.('Reconnected successfully');
      return true;
    } catch (error) {
      console.error('Reconnection failed:', error);
      this.scheduleReconnect();
      return false;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    let countdown = this.reconnectDelay / 1000;
    const countdownInterval = setInterval(() => {
      countdown--;
      this.onStatusUpdate?.(`Retrying in ${countdown}s...`, countdown);
      if (countdown <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);

    this.reconnectTimer = setTimeout(() => {
      clearInterval(countdownInterval);
      this.attemptReconnect();
    }, this.reconnectDelay);
  }

  reset() {
    this.reconnectAttempts = 0;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  cancel() {
    this.reset();
    this.onStatusUpdate?.('Reconnection cancelled');
  }
}
