import { ConnectionState, InboundMessage, decodeMessage } from '../protocol';

export class WebUSBTransport {
  private device: any | null = null;
  private buffer = '';
  private onMessage: ((msg: InboundMessage) => void) | null = null;
  private onStateChange: ((state: ConnectionState) => void) | null = null;
  private reading = false;

  static isSupported(): boolean {
    return 'usb' in navigator;
  }

  setMessageHandler(handler: (msg: InboundMessage) => void) {
    this.onMessage = handler;
  }

  setStateChangeHandler(handler: (state: ConnectionState) => void) {
    this.onStateChange = handler;
  }

  async connect(): Promise<void> {
    if (!WebUSBTransport.isSupported()) {
      throw new Error('WebUSB not supported');
    }

    this.onStateChange?.('connecting');

    try {
      this.device = await (navigator as any).usb.requestDevice({ filters: [] });
      await this.device.open();
      await this.device.selectConfiguration(1);
      await this.device.claimInterface(0);

      this.onStateChange?.('handshaking');

      this.startReading();

      // Send handshake
      await this.send('{"cmd":"HANDSHAKE"}\n');

      setTimeout(() => {
        this.onStateChange?.('ready');
      }, 500);
    } catch (error) {
      this.onStateChange?.('error');
      throw error;
    }
  }

  private async startReading() {
    if (!this.device || this.reading) return;
    this.reading = true;

    try {
      while (this.reading && this.device) {
        const result = await this.device.transferIn(1, 64);
        if (result.data) {
          const decoder = new TextDecoder();
          const text = decoder.decode(result.data);
          this.buffer += text;

          const lines = this.buffer.split('\n');
          this.buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim()) {
              const msg = decodeMessage(line);
              if (msg && this.onMessage) {
                this.onMessage(msg);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Read error:', error);
      this.onStateChange?.('error');
    }
  }

  async send(data: string): Promise<void> {
    if (!this.device) throw new Error('Not connected');
    const encoder = new TextEncoder();
    const encoded = encoder.encode(data);
    await this.device.transferOut(1, encoded);
  }

  async disconnect(): Promise<void> {
    this.reading = false;
    if (this.device) {
      await this.device.close();
      this.device = null;
    }
    this.onStateChange?.('disconnected');
  }
}
