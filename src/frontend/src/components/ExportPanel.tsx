import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileArchive, FileText, Loader2 } from 'lucide-react';
import { Patient, Session, Capture } from '../backend';
import { exportSessionAsZip } from '../export/zipExport';
import { generatePDFReport } from '../export/pdfReport';
import { toast } from 'sonner';

interface ExportPanelProps {
  patient: Patient | null;
  session: Session | null;
  captures: Capture[];
}

export default function ExportPanel({ patient, session, captures }: ExportPanelProps) {
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleZipExport = async () => {
    if (!patient || !session) {
      toast.error('Please select a patient and session');
      return;
    }

    setIsExportingZip(true);
    try {
      await exportSessionAsZip(patient, session, captures);
      toast.success('Export completed - files downloaded');
    } catch (error) {
      toast.error('Failed to export files');
      console.error(error);
    } finally {
      setIsExportingZip(false);
    }
  };

  const handlePdfExport = async () => {
    if (!patient || !session) {
      toast.error('Please select a patient and session');
      return;
    }

    setIsExportingPdf(true);
    try {
      await generatePDFReport(patient, session, captures);
      toast.success('Report opened - use browser Print to save as PDF');
    } catch (error) {
      toast.error('Failed to generate report');
      console.error(error);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Options</CardTitle>
        <CardDescription>
          {patient && session
            ? `Export data for ${patient.name} - Session ${session.id}`
            : 'Select a patient and session to export'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="outline"
          size="lg"
          onClick={handleZipExport}
          disabled={!patient || !session || isExportingZip || captures.length === 0}
          className="w-full justify-start gap-3"
        >
          {isExportingZip ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <FileArchive className="h-5 w-5" />
          )}
          <div className="text-left">
            <div className="font-semibold">Export Files</div>
            <div className="text-xs text-muted-foreground">
              Download manifest + images ({captures.length} captures)
            </div>
          </div>
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={handlePdfExport}
          disabled={!patient || !session || isExportingPdf || captures.length === 0}
          className="w-full justify-start gap-3"
        >
          {isExportingPdf ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <FileText className="h-5 w-5" />
          )}
          <div className="text-left">
            <div className="font-semibold">Generate Report</div>
            <div className="text-xs text-muted-foreground">
              Open printable report (save as PDF via browser)
            </div>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
}
