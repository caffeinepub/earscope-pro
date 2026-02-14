import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye } from '../backend';
import { useNavigate } from '@tanstack/react-router';

interface CapturePreview {
  id: string;
  thumbnailUrl: string;
  timestamp: number;
  eye: Eye;
}

interface LastCapturesTrayProps {
  captures: CapturePreview[];
}

export default function LastCapturesTray({ captures }: LastCapturesTrayProps) {
  const navigate = useNavigate();

  if (captures.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Captures</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No captures yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Captures ({captures.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2">
          {captures.slice(0, 5).map((capture) => (
            <button
              key={capture.id}
              onClick={() => navigate({ to: '/gallery' })}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border hover:border-primary"
            >
              <img
                src={capture.thumbnailUrl}
                alt="Capture"
                className="h-full w-full object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1">
                <Badge variant="secondary" className="text-xs">
                  {capture.eye === Eye.left ? 'L' : 'R'}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
