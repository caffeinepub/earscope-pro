export type ConnectionState =
  | 'disconnected'
  | 'scanning'
  | 'connecting'
  | 'handshaking'
  | 'ready'
  | 'streaming'
  | 'error';

export type CommandType =
  | 'STREAM_START'
  | 'STREAM_STOP'
  | 'CAPTURE_PHOTO'
  | 'SET_BRIGHTNESS'
  | 'SET_FOCUS';

export type MessageType = 'VIDEO_FRAME' | 'PHOTO' | 'TELEMETRY' | 'HANDSHAKE_ACK' | 'ERROR';

export interface Command {
  cmd: CommandType;
  params?: Record<string, any>;
}

export interface InboundMessage {
  type: MessageType;
  data?: string;
  timestamp?: number;
  size?: number;
  fps?: number;
  battery?: number;
  connectionStatus?: string;
  error?: string;
}

export interface Telemetry {
  fps: number;
  battery: number;
  connectionStatus: string;
  lastUpdate: number;
}

export function encodeCommand(command: Command): string {
  return JSON.stringify(command) + '\n';
}

export function decodeMessage(line: string): InboundMessage | null {
  try {
    const msg = JSON.parse(line.trim());
    return msg as InboundMessage;
  } catch {
    return null;
  }
}
