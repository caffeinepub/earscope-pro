import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface PermissionGuidanceProps {
  error?: string;
  onRetry?: () => void;
  onUseDemoMode?: () => void;
}

export default function PermissionGuidance({ error, onRetry, onUseDemoMode }: PermissionGuidanceProps) {
  if (!error) return null;

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Connection Failed</AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p>{error}</p>
        <div className="flex gap-2">
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Retry Connection
            </Button>
          )}
          {onUseDemoMode && (
            <Button variant="default" size="sm" onClick={onUseDemoMode}>
              Use Demo Mode Instead
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
