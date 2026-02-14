import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wifi, WifiOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { ConnectionState } from '../mcu/protocol';

interface ConnectionStatusPanelProps {
  connectionState: ConnectionState;
  reconnectStatus?: string;
  lastError?: string;
}

export default function ConnectionStatusPanel({
  connectionState,
  reconnectStatus,
  lastError,
}: ConnectionStatusPanelProps) {
  const getStatusIcon = () => {
    switch (connectionState) {
      case 'disconnected':
        return <WifiOff className="h-6 w-6 text-muted-foreground" />;
      case 'scanning':
      case 'connecting':
      case 'handshaking':
        return <Loader2 className="h-6 w-6 animate-spin text-primary" />;
      case 'ready':
      case 'streaming':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-6 w-6 text-destructive" />;
      default:
        return <Wifi className="h-6 w-6" />;
    }
  };

  const getStatusText = () => {
    switch (connectionState) {
      case 'disconnected':
        return 'Disconnected';
      case 'scanning':
        return 'Scanning for devices...';
      case 'connecting':
        return 'Connecting...';
      case 'handshaking':
        return 'Handshaking...';
      case 'ready':
        return 'Ready';
      case 'streaming':
        return 'Streaming';
      case 'error':
        return 'Connection Error';
      default:
        return 'Unknown';
    }
  };

  const getStatusVariant = (): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (connectionState) {
      case 'ready':
      case 'streaming':
        return 'default';
      case 'scanning':
      case 'connecting':
      case 'handshaking':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Connection Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <Badge variant={getStatusVariant()}>{getStatusText()}</Badge>
        </div>

        {reconnectStatus && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>{reconnectStatus}</AlertDescription>
          </Alert>
        )}

        {lastError && connectionState === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{lastError}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
