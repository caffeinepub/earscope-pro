import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LiveStreamViewerProps {
  frame: string | null;
  zoom: number;
  isStreaming: boolean;
}

export default function LiveStreamViewer({ frame, zoom, isStreaming }: LiveStreamViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1280, height: 720 });

  useEffect(() => {
    if (!frame || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      setDimensions({ width: img.width, height: img.height });
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (zoom > 1) {
        const scaledWidth = img.width * zoom;
        const scaledHeight = img.height * zoom;
        const offsetX = (canvas.width - scaledWidth) / 2;
        const offsetY = (canvas.height - scaledHeight) / 2;
        ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
      } else {
        ctx.drawImage(img, 0, 0);
      }
    };
    img.src = `data:image/jpeg;base64,${frame}`;
  }, [frame, zoom]);

  return (
    <Card className="relative overflow-hidden bg-black">
      <div className="absolute left-4 top-4 z-10 flex gap-2">
        <Badge variant={isStreaming ? 'default' : 'secondary'}>
          {isStreaming ? '● LIVE' : 'PAUSED'}
        </Badge>
        {zoom > 1 && <Badge variant="outline">{zoom}x</Badge>}
      </div>

      <div className="flex aspect-video items-center justify-center">
        {frame ? (
          <canvas ref={canvasRef} className="max-h-full max-w-full" />
        ) : (
          <div className="text-center text-muted-foreground">
            <p>No video feed</p>
            <p className="text-sm">Start streaming to see live video</p>
          </div>
        )}
      </div>
    </Card>
  );
}
