import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Usb, Wifi, Cpu } from 'lucide-react';
import { WebSerialTransport } from '../mcu/transports/webSerialTransport';
import { WebUSBTransport } from '../mcu/transports/webUsbTransport';

interface TransportPickerProps {
  onSelect: (mode: 'webserial' | 'webusb' | 'demo') => void;
  disabled?: boolean;
}

export default function TransportPicker({ onSelect, disabled }: TransportPickerProps) {
  const webSerialSupported = WebSerialTransport.isSupported();
  const webUSBSupported = WebUSBTransport.isSupported();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Connection Method</CardTitle>
        <CardDescription>Choose how to connect to your endoscope device</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="outline"
          size="lg"
          className="w-full justify-start gap-3"
          onClick={() => onSelect('webserial')}
          disabled={disabled || !webSerialSupported}
        >
          <Usb className="h-5 w-5" />
          <div className="text-left">
            <div className="font-semibold">WebSerial (USB)</div>
            <div className="text-xs text-muted-foreground">
              {webSerialSupported ? 'Connect via USB serial port' : 'Not supported in this browser'}
            </div>
          </div>
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="w-full justify-start gap-3"
          onClick={() => onSelect('webusb')}
          disabled={disabled || !webUSBSupported}
        >
          <Usb className="h-5 w-5" />
          <div className="text-left">
            <div className="font-semibold">WebUSB</div>
            <div className="text-xs text-muted-foreground">
              {webUSBSupported ? 'Connect via USB device' : 'Not supported in this browser'}
            </div>
          </div>
        </Button>

        <Button
          variant="default"
          size="lg"
          className="w-full justify-start gap-3"
          onClick={() => onSelect('demo')}
          disabled={disabled}
        >
          <Cpu className="h-5 w-5" />
          <div className="text-left">
            <div className="font-semibold">Demo / Simulator Mode</div>
            <div className="text-xs text-muted-foreground">Test the app without hardware</div>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
}
