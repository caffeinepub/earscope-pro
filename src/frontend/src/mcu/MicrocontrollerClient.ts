import { ConnectionState, Command, InboundMessage, Telemetry, encodeCommand } from './protocol';
import { WebSerialTransport } from './transports/webSerialTransport';
import { WebUSBTransport } from './transports/webUsbTransport';
import { DemoSimulator } from './simulator/demoSimulator';

type Transport = WebSerialTransport | WebUSBTransport | DemoSimulator;

export class MicrocontrollerClient {
  private transport: Transport | null = null;
  private connectionState: ConnectionState = 'disconnected';
  private telemetry: Telemetry = {
    fps: 0,
    battery: 0,
    connectionStatus: 'disconnected',
    lastUpdate: 0,
  };
  private latestFrame: string | null = null;
  private onStateChange: ((state: ConnectionState) => void) | null = null;
  private onTelemetryUpdate: ((telemetry: Telemetry) => void) | null = null;
  private onFrameUpdate: ((frame: string) => void) | null = null;
  private onPhotoReceived: ((photo: string) => void) | undefined = undefined;

  setStateChangeHandler(handler: (state: ConnectionState) => void) {
    this.onStateChange = handler;
  }

  setTelemetryUpdateHandler(handler: (telemetry: Telemetry) => void) {
    this.onTelemetryUpdate = handler;
  }

  setFrameUpdateHandler(handler: (frame: string) => void) {
    this.onFrameUpdate = handler;
  }

  setPhotoReceivedHandler(handler: ((photo: string) => void) | undefined) {
    this.onPhotoReceived = handler;
  }

  async connect(mode: 'webserial' | 'webusb' | 'demo'): Promise<void> {
    if (this.transport) {
      await this.disconnect();
    }

    let transport: Transport;

    if (mode === 'demo') {
      transport = new DemoSimulator();
    } else if (mode === 'webserial') {
      if (!WebSerialTransport.isSupported()) {
        throw new Error('WebSerial not supported in this browser');
      }
      transport = new WebSerialTransport();
    } else {
      if (!WebUSBTransport.isSupported()) {
        throw new Error('WebUSB not supported in this browser');
      }
      transport = new WebUSBTransport();
    }

    transport.setStateChangeHandler((state) => {
      this.connectionState = state;
      this.onStateChange?.(state);
    });

    transport.setMessageHandler((msg) => this.handleMessage(msg));

    this.transport = transport;
    await transport.connect();
  }

  private handleMessage(msg: InboundMessage) {
    if (msg.type === 'VIDEO_FRAME' && msg.data) {
      this.latestFrame = msg.data;
      this.onFrameUpdate?.(msg.data);
    } else if (msg.type === 'PHOTO' && msg.data) {
      this.onPhotoReceived?.(msg.data);
    } else if (msg.type === 'TELEMETRY') {
      this.telemetry = {
        fps: msg.fps || 0,
        battery: msg.battery || 0,
        connectionStatus: msg.connectionStatus || 'unknown',
        lastUpdate: Date.now(),
      };
      this.onTelemetryUpdate?.(this.telemetry);
    }
  }

  async sendCommand(command: Command): Promise<void> {
    if (!this.transport) {
      throw new Error('Not connected');
    }
    const encoded = encodeCommand(command);
    await this.transport.send(encoded);
  }

  async startStream(): Promise<void> {
    await this.sendCommand({
      cmd: 'STREAM_START',
      params: { fps: 30, res: '720p' },
    });
  }

  async stopStream(): Promise<void> {
    await this.sendCommand({ cmd: 'STREAM_STOP' });
  }

  async capturePhoto(): Promise<void> {
    await this.sendCommand({ cmd: 'CAPTURE_PHOTO' });
  }

  async setBrightness(level: number): Promise<void> {
    await this.sendCommand({
      cmd: 'SET_BRIGHTNESS',
      params: { level },
    });
  }

  async setFocus(value: number): Promise<void> {
    await this.sendCommand({
      cmd: 'SET_FOCUS',
      params: { value },
    });
  }

  async disconnect(): Promise<void> {
    if (this.transport) {
      await this.transport.disconnect();
      this.transport = null;
    }
    this.connectionState = 'disconnected';
    this.latestFrame = null;
  }

  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  getTelemetry(): Telemetry {
    return this.telemetry;
  }

  getLatestFrame(): string | null {
    return this.latestFrame;
  }
}
