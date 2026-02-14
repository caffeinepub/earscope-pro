import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ConnectionStatusPanel from '../components/ConnectionStatusPanel';
import TransportPicker from '../components/TransportPicker';
import RequirementsHelp from '../components/RequirementsHelp';
import PermissionGuidance from '../components/PermissionGuidance';
import { useMicrocontroller } from '../state/mcuStore';
import { toast } from 'sonner';

export default function ConnectionPage() {
  const navigate = useNavigate();
  const { client, connectionState, autoReconnect, reconnectStatus } = useMicrocontroller();
  const [lastError, setLastError] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<'webserial' | 'webusb' | 'demo' | null>(null);

  const handleConnect = async (mode: 'webserial' | 'webusb' | 'demo') => {
    setSelectedMode(mode);
    setLastError('');
    autoReconnect.setMode(mode);

    try {
      await client.connect(mode);
      toast.success('Connected successfully');
      setTimeout(() => {
        navigate({ to: '/live' });
      }, 500);
    } catch (error: any) {
      const errorMsg = error.message || 'Connection failed';
      setLastError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleDisconnect = async () => {
    autoReconnect.cancel();
    await client.disconnect();
    setSelectedMode(null);
    toast.info('Disconnected');
  };

  const handleRetry = () => {
    if (selectedMode) {
      handleConnect(selectedMode);
    }
  };

  const isConnected = connectionState === 'ready' || connectionState === 'streaming';
  const isConnecting = connectionState === 'connecting' || connectionState === 'handshaking';

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Device Connection</CardTitle>
          <CardDescription>Connect your EarScope endoscope to begin imaging</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ConnectionStatusPanel
            connectionState={connectionState}
            reconnectStatus={reconnectStatus}
            lastError={lastError}
          />

          {!isConnected && !isConnecting && (
            <>
              <TransportPicker onSelect={handleConnect} disabled={isConnecting} />
              <PermissionGuidance
                error={lastError}
                onRetry={handleRetry}
                onUseDemoMode={() => handleConnect('demo')}
              />
            </>
          )}

          {isConnected && (
            <div className="space-y-3">
              <Button variant="default" size="lg" onClick={() => navigate({ to: '/live' })} className="w-full">
                Go to Live Camera
              </Button>
              <Button variant="outline" size="lg" onClick={handleDisconnect} className="w-full">
                Disconnect
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <RequirementsHelp />
    </div>
  );
}
