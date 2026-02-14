import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Capture, Eye } from '../backend';

interface CaptureGridProps {
  captures: Capture[];
  onSelect: (capture: Capture) => void;
}

export default function CaptureGrid({ captures, onSelect }: CaptureGridProps) {
  if (captures.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No captures in this session yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {captures.map((capture) => (
        <button
          key={capture.id}
          onClick={() => onSelect(capture)}
          className="group relative overflow-hidden rounded-lg border border-border hover:border-primary"
        >
          <div className="aspect-square">
            <img
              src={capture.thumbnail.getDirectURL()}
              alt="Capture"
              className="h-full w-full object-cover transition-transform group-hover:scale-110"
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
            <div className="flex items-center justify-between text-xs text-white">
              <span>{new Date(Number(capture.timestamp) / 1000000).toLocaleTimeString()}</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
