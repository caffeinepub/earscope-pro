import { ConnectionState, InboundMessage } from '../protocol';

export class DemoSimulator {
  private onMessage: ((msg: InboundMessage) => void) | null = null;
  private onStateChange: ((state: ConnectionState) => void) | null = null;
  private streamInterval: NodeJS.Timeout | null = null;
  private telemetryInterval: NodeJS.Timeout | null = null;
  private isStreaming = false;

  setMessageHandler(handler: (msg: InboundMessage) => void) {
    this.onMessage = handler;
  }

  setStateChangeHandler(handler: (state: ConnectionState) => void) {
    this.onStateChange = handler;
  }

  async connect(): Promise<void> {
    this.onStateChange?.('connecting');
    await this.delay(300);
    this.onStateChange?.('handshaking');
    await this.delay(500);

    // Send handshake ack
    this.onMessage?.({
      type: 'HANDSHAKE_ACK',
      timestamp: Date.now(),
    });

    this.onStateChange?.('ready');

    // Start telemetry
    this.startTelemetry();
  }

  private startTelemetry() {
    this.telemetryInterval = setInterval(() => {
      this.onMessage?.({
        type: 'TELEMETRY',
        fps: this.isStreaming ? 30 : 0,
        battery: 85 + Math.random() * 10,
        connectionStatus: 'connected',
        timestamp: Date.now(),
      });
    }, 1000);
  }

  async send(data: string): Promise<void> {
    try {
      const cmd = JSON.parse(data);

      if (cmd.cmd === 'STREAM_START') {
        this.startStreaming();
      } else if (cmd.cmd === 'STREAM_STOP') {
        this.stopStreaming();
      } else if (cmd.cmd === 'CAPTURE_PHOTO') {
        await this.capturePhoto();
      }
    } catch (error) {
      console.error('Simulator command error:', error);
    }
  }

  private startStreaming() {
    if (this.isStreaming) return;
    this.isStreaming = true;
    this.onStateChange?.('streaming');

    this.streamInterval = setInterval(() => {
      const frame = this.generateFrame();
      this.onMessage?.({
        type: 'VIDEO_FRAME',
        data: frame,
        timestamp: Date.now(),
      });
    }, 33); // ~30fps
  }

  private stopStreaming() {
    this.isStreaming = false;
    if (this.streamInterval) {
      clearInterval(this.streamInterval);
      this.streamInterval = null;
    }
    this.onStateChange?.('ready');
  }

  private async capturePhoto() {
    await this.delay(100);
    const photo = this.generatePhoto();
    this.onMessage?.({
      type: 'PHOTO',
      data: photo,
      size: photo.length,
      timestamp: Date.now(),
    });
  }

  private generateFrame(): string {
    // Generate a simple gradient image as base64 JPEG
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Create a medical-looking gradient
    const gradient = ctx.createRadialGradient(320, 240, 50, 320, 240, 300);
    gradient.addColorStop(0, '#ffcccc');
    gradient.addColorStop(0.5, '#ff9999');
    gradient.addColorStop(1, '#cc6666');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 640, 480);

    // Add some noise for realism
    for (let i = 0; i < 1000; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.1)`;
      ctx.fillRect(Math.random() * 640, Math.random() * 480, 2, 2);
    }

    return canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
  }

  private generatePhoto(): string {
    // Generate a higher quality image for photos
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const gradient = ctx.createRadialGradient(640, 360, 100, 640, 360, 500);
    gradient.addColorStop(0, '#ffdddd');
    gradient.addColorStop(0.5, '#ffaaaa');
    gradient.addColorStop(1, '#dd7777');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1280, 720);

    // Add timestamp
    ctx.fillStyle = 'white';
    ctx.font = '24px sans-serif';
    ctx.fillText(new Date().toLocaleString(), 20, 40);

    return canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
  }

  async disconnect(): Promise<void> {
    this.stopStreaming();
    if (this.telemetryInterval) {
      clearInterval(this.telemetryInterval);
      this.telemetryInterval = null;
    }
    this.onStateChange?.('disconnected');
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
