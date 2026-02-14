import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function RequirementsHelp() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Requirements</CardTitle>
        <CardDescription>What you need to use EarScope Pro</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Supported Browsers:</strong> Chrome, Edge, or Opera (version 89+) for WebSerial/WebUSB support.
          </AlertDescription>
        </Alert>

        <div className="space-y-2 text-sm">
          <h4 className="font-semibold">Hardware Connection:</h4>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>3.9mm endoscope camera with microcontroller</li>
            <li>USB cable or WiFi connection</li>
            <li>Browser permissions for USB/Serial access</li>
          </ul>
        </div>

        <div className="space-y-2 text-sm">
          <h4 className="font-semibold">Demo Mode:</h4>
          <p className="text-muted-foreground">
            If you don't have hardware available, use Demo/Simulator Mode to explore all features with simulated data.
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <h4 className="font-semibold">Permissions:</h4>
          <p className="text-muted-foreground">
            When connecting, your browser will prompt for permission to access the USB device. Click "Allow" to proceed.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
