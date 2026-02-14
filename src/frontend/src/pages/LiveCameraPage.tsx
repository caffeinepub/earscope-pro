import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Play, Square } from 'lucide-react';
import LiveStreamViewer from '../components/LiveStreamViewer';
import DistanceGuide from '../components/DistanceGuide';
import LiveControlsBar from '../components/LiveControlsBar';
import LastCapturesTray from '../components/LastCapturesTray';
import BatchCaptureButton from '../components/BatchCaptureButton';
import { useMicrocontroller } from '../state/mcuStore';
import { useActiveSession } from '../state/activeSessionStore';
import { useGetAllCaptures, useAddCapture } from '../hooks/useQueries';
import { CaptureWorkflow, saveCapture } from '../captures/captureWorkflow';
import { BatchCaptureController } from '../captures/batchCapture';
import { Eye } from '../backend';
import { toast } from 'sonner';

export default function LiveCameraPage() {
  const { client, connectionState, telemetry, latestFrame } = useMicrocontroller();
  const { patientId, sessionId, sessionNumber, currentEye, setCurrentEye } = useActiveSession();
  const { data: allCaptures = [], refetch: refetchCaptures } = useGetAllCaptures();
  const addCapture = useAddCapture();

  const [isStreaming, setIsStreaming] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [ledMode, setLedMode] = useState('auto');
  const [isCapturing, setIsCapturing] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [workflow] = useState(() => new CaptureWorkflow(client));
  const [batchController] = useState(() => new BatchCaptureController(workflow));

  const sessionCaptures = allCaptures.filter((c) => c.sessionId === sessionId);
  const recentCaptures = sessionCaptures.slice(-5).reverse().map((c) => ({
    id: c.id,
    thumbnailUrl: c.thumbnail.getDirectURL(),
    timestamp: Number(c.timestamp),
    eye: currentEye,
  }));

  useEffect(() => {
    workflow.setCaptureCompleteHandler(async (photo, thumbnail, metadata) => {
      try {
        await saveCapture(photo, thumbnail, metadata, addCapture.mutateAsync);
        await refetchCaptures();
        toast.success('Capture saved');
      } catch (error) {
        toast.error('Failed to save capture');
        console.error(error);
      }
    });
  }, [workflow, addCapture, refetchCaptures]);

  const handleStartStream = async () => {
    try {
      await client.startStream();
      setIsStreaming(true);
      toast.success('Streaming started');
    } catch (error) {
      toast.error('Failed to start stream');
    }
  };

  const handleStopStream = async () => {
    try {
      await client.stopStream();
      setIsStreaming(false);
      toast.success('Streaming stopped');
    } catch (error) {
      toast.error('Failed to stop stream');
    }
  };

  const handleCapture = async () => {
    if (!sessionId || !patientId) {
      toast.error('Please select a patient and session first');
      return;
    }

    setIsCapturing(true);
    try {
      await workflow.capture(sessionId, patientId, currentEye);
    } catch (error) {
      toast.error('Capture failed');
      console.error(error);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleTimerCapture = async () => {
    if (!sessionId || !patientId) {
      toast.error('Please select a patient and session first');
      return;
    }

    setTimerActive(true);
    toast.info('Capture in 3 seconds...');

    setTimeout(async () => {
      setIsCapturing(true);
      try {
        await workflow.capture(sessionId, patientId, currentEye);
      } catch (error) {
        toast.error('Capture failed');
        console.error(error);
      } finally {
        setIsCapturing(false);
        setTimerActive(false);
      }
    }, 3000);
  };

  const handleBatchCapture = async () => {
    if (!sessionId || !patientId) {
      toast.error('Please select a patient and session first');
      return;
    }

    batchController.setProgressHandler((current, total) => {
      toast.info(`Batch capture: ${current}/${total}`);
    });

    batchController.setCompleteHandler(async (captures) => {
      for (const { photo, thumbnail, metadata } of captures) {
        try {
          await saveCapture(photo, thumbnail, metadata, addCapture.mutateAsync);
        } catch (error) {
          console.error('Failed to save batch capture:', error);
        }
      }
      await refetchCaptures();
      toast.success(`Batch complete: ${captures.length} captures saved`);
    });

    batchController.setErrorHandler((error) => {
      toast.error(`Batch capture error: ${error.message}`);
    });

    await batchController.start(sessionId, patientId, currentEye);
  };

  const handleLedChange = async (mode: string) => {
    setLedMode(mode);
    const level = mode === 'auto' ? 0 : mode === '50' ? 50 : mode === '100' ? 100 : -1;
    try {
      await client.setBrightness(level);
    } catch (error) {
      console.error('Failed to set LED:', error);
    }
  };

  const isConnected = connectionState === 'ready' || connectionState === 'streaming';

  if (!isConnected) {
    return (
      <div className="container mx-auto max-w-4xl space-y-6 p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Not connected to device. Please go to the Connection page to connect.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Live Camera View</CardTitle>
              <CardDescription>
                {patientId && sessionId
                  ? `Patient: ${patientId} | Session #${sessionNumber}`
                  : 'No active session - select patient and session first'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right text-sm">
                <div className="text-muted-foreground">FPS: {telemetry.fps}</div>
                <div className="text-muted-foreground">Battery: {Math.round(telemetry.battery)}%</div>
              </div>
              {!isStreaming ? (
                <Button onClick={handleStartStream} size="lg">
                  <Play className="mr-2 h-4 w-4" />
                  Start Stream
                </Button>
              ) : (
                <Button onClick={handleStopStream} variant="secondary" size="lg">
                  <Square className="mr-2 h-4 w-4" />
                  Stop Stream
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <DistanceGuide />
          <LiveStreamViewer frame={latestFrame} zoom={zoom} isStreaming={isStreaming} />
          <LiveControlsBar
            zoom={zoom}
            onZoomChange={setZoom}
            ledMode={ledMode}
            onLedChange={handleLedChange}
            onCapture={handleCapture}
            onTimerCapture={handleTimerCapture}
            currentEye={currentEye}
            onEyeToggle={() => setCurrentEye(currentEye === Eye.left ? Eye.right : Eye.left)}
            isCapturing={isCapturing}
            timerActive={timerActive}
          />
          <BatchCaptureButton onStart={handleBatchCapture} disabled={isCapturing || !sessionId} />
        </CardContent>
      </Card>

      <LastCapturesTray captures={recentCaptures} />
    </div>
  );
}
