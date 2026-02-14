import { Alert, AlertDescription } from '@/components/ui/alert';
import { Ruler } from 'lucide-react';

export default function DistanceGuide() {
  return (
    <Alert className="border-primary/50 bg-primary/10">
      <Ruler className="h-4 w-4" />
      <AlertDescription>
        <strong>Optimal Distance:</strong> 2–4 cm from the ear canal
      </AlertDescription>
    </Alert>
  );
}
