import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Timer, ZoomIn, Lightbulb } from 'lucide-react';
import { Eye } from '../backend';

interface LiveControlsBarProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  ledMode: string;
  onLedChange: (mode: string) => void;
  onCapture: () => void;
  onTimerCapture: () => void;
  currentEye: Eye;
  onEyeToggle: () => void;
  isCapturing: boolean;
  timerActive: boolean;
}

export default function LiveControlsBar({
  zoom,
  onZoomChange,
  ledMode,
  onLedChange,
  onCapture,
  onTimerCapture,
  currentEye,
  onEyeToggle,
  isCapturing,
  timerActive,
}: LiveControlsBarProps) {
  const zoomLevels = [1, 2, 4, 8];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Zoom</label>
          <div className="flex gap-1">
            {zoomLevels.map((level) => (
              <Button
                key={level}
                variant={zoom === level ? 'default' : 'outline'}
                size="sm"
                onClick={() => onZoomChange(level)}
                className="flex-1"
              >
                {level}x
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Lightbulb className="h-4 w-4" />
            LED
          </label>
          <Select value={ledMode} onValueChange={onLedChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="50">50%</SelectItem>
              <SelectItem value="100">100%</SelectItem>
              <SelectItem value="off">OFF</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Ear Side</label>
          <Button variant="outline" size="lg" onClick={onEyeToggle} className="w-full">
            <Badge variant={currentEye === Eye.left ? 'default' : 'secondary'}>
              {currentEye === Eye.left ? 'LEFT' : 'RIGHT'}
            </Badge>
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Actions</label>
          <div className="flex gap-2">
            <Button
              variant="default"
              size="lg"
              onClick={onCapture}
              disabled={isCapturing}
              className="flex-1"
            >
              <Camera className="mr-2 h-4 w-4" />
              Capture
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onTimerCapture}
              disabled={isCapturing || timerActive}
              className="flex-1"
            >
              <Timer className="mr-2 h-4 w-4" />
              3s
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
