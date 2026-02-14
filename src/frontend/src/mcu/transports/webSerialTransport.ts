import { ConnectionState, InboundMessage, decodeMessage } from '../protocol';

export class WebSerialTransport {
  private port: any | null = null;
  private reader: ReadableStreamDefaultReader<string> | null = null;
  private writer: WritableStreamDefaultWriter<string> | null = null;
  private buffer = '';
  private onMessage: ((msg: InboundMessage) => void) | null = null;
  private onStateChange: ((state: ConnectionState) => void) | null = null;

  static isSupported(): boolean {
    return 'serial' in navigator;
  }

  setMessageHandler(handler: (msg: InboundMessage) => void) {
    this.onMessage = handler;
  }

  setStateChangeHandler(handler: (state: ConnectionState) => void) {
    this.onStateChange = handler;
  }

  async connect(): Promise<void> {
    if (!WebSerialTransport.isSupported()) {
      throw new Error('WebSerial not supported');
    }

    this.onStateChange?.('connecting');

    try {
      this.port = await (navigator as any).serial.requestPort();
      await this.port.open({ baudRate: 115200 });

      this.onStateChange?.('handshaking');

      const textEncoder = new TextEncoderStream();
      const writableStreamClosed = textEncoder.readable.pipeTo(this.port.writable);
      this.writer = textEncoder.writable.getWriter();

      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
      this.reader = textDecoder.readable.getReader();

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
    if (!this.reader) return;

    try {
      while (true) {
        const { value, done } = await this.reader.read();
        if (done) break;

        this.buffer += value;
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
    } catch (error) {
      console.error('Read error:', error);
      this.onStateChange?.('error');
    }
  }

  async send(data: string): Promise<void> {
    if (!this.writer) throw new Error('Not connected');
    await this.writer.write(data);
  }

  async disconnect(): Promise<void> {
    if (this.reader) {
      await this.reader.cancel();
      this.reader = null;
    }
    if (this.writer) {
      await this.writer.close();
      this.writer = null;
    }
    if (this.port) {
      await this.port.close();
      this.port = null;
    }
    this.onStateChange?.('disconnected');
  }
}
