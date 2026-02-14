import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Camera } from 'lucide-react';

interface BatchCaptureButtonProps {
  onStart: () => Promise<void>;
  disabled?: boolean;
}

export default function BatchCaptureButton({ onStart, disabled }: BatchCaptureButtonProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleStart = async () => {
    setIsRunning(true);
    setProgress(0);

    try {
      await onStart();
      setProgress(100);
    } catch (error) {
      console.error('Batch capture error:', error);
    } finally {
      setTimeout(() => {
        setIsRunning(false);
        setProgress(0);
      }, 1000);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        variant="secondary"
        size="lg"
        onClick={handleStart}
        disabled={disabled || isRunning}
        className="w-full"
      >
        <Camera className="mr-2 h-4 w-4" />
        {isRunning ? 'Capturing...' : 'Batch Mode (5 shots)'}
      </Button>
      {isRunning && <Progress value={progress} className="h-2" />}
    </div>
  );
}
