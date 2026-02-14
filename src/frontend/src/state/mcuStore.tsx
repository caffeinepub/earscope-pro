import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MicrocontrollerClient } from '../mcu/MicrocontrollerClient';
import { ConnectionState, Telemetry } from '../mcu/protocol';
import { AutoReconnect } from '../mcu/autoReconnect';

interface MicrocontrollerContextType {
  client: MicrocontrollerClient;
  connectionState: ConnectionState;
  telemetry: Telemetry;
  latestFrame: string | null;
  autoReconnect: AutoReconnect;
  reconnectStatus: string;
}

const MicrocontrollerContext = createContext<MicrocontrollerContextType | null>(null);

export function MicrocontrollerProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => new MicrocontrollerClient());
  const [autoReconnect] = useState(() => new AutoReconnect(client));
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [telemetry, setTelemetry] = useState<Telemetry>({
    fps: 0,
    battery: 0,
    connectionStatus: 'disconnected',
    lastUpdate: 0,
  });
  const [latestFrame, setLatestFrame] = useState<string | null>(null);
  const [reconnectStatus, setReconnectStatus] = useState('');

  useEffect(() => {
    client.setStateChangeHandler((state) => {
      setConnectionState(state);
      if (state === 'error' || state === 'disconnected') {
        // Trigger auto-reconnect on unexpected disconnect
        if (state === 'error') {
          autoReconnect.attemptReconnect();
        }
      }
    });

    client.setTelemetryUpdateHandler(setTelemetry);
    client.setFrameUpdateHandler(setLatestFrame);

    autoReconnect.setStatusUpdateHandler((status) => {
      setReconnectStatus(status);
    });

    return () => {
      client.disconnect();
    };
  }, [client, autoReconnect]);

  return (
    <MicrocontrollerContext.Provider
      value={{
        client,
        connectionState,
        telemetry,
        latestFrame,
        autoReconnect,
        reconnectStatus,
      }}
    >
      {children}
    </MicrocontrollerContext.Provider>
  );
}

export function useMicrocontroller() {
  const context = useContext(MicrocontrollerContext);
  if (!context) {
    throw new Error('useMicrocontroller must be used within MicrocontrollerProvider');
  }
  return context;
}
