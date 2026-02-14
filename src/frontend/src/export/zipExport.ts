import { Capture, Patient, Session } from '../backend';
import { generateManifest } from './manifest';

// Browser-native ZIP export using Blob and download
export async function exportSessionAsZip(
  patient: Patient,
  session: Session,
  captures: Capture[]
): Promise<void> {
  // Since we can't use JSZip (package.json is read-only), we'll create a simple archive
  // by downloading files individually or creating a tar-like structure
  
  // For now, we'll download the manifest and provide links to images
  const manifest = generateManifest(patient, session, captures);
  
  // Create a text file with manifest and image URLs
  let archiveContent = '=== EarScope Pro Session Export ===\n\n';
  archiveContent += 'MANIFEST:\n';
  archiveContent += JSON.stringify(manifest, null, 2);
  archiveContent += '\n\n=== IMAGES ===\n\n';
  
  // Download manifest as JSON
  const manifestBlob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
  const manifestUrl = URL.createObjectURL(manifestBlob);
  const manifestLink = document.createElement('a');
  manifestLink.href = manifestUrl;
  manifestLink.download = `manifest_${patient.name}_${session.id}.json`;
  document.body.appendChild(manifestLink);
  manifestLink.click();
  document.body.removeChild(manifestLink);
  URL.revokeObjectURL(manifestUrl);

  // Download each image
  for (let i = 0; i < captures.length; i++) {
    const capture = captures[i];
    try {
      const imageBytes = await capture.image.getBytes();
      const imageBlob = new Blob([imageBytes], { type: 'image/jpeg' });
      const imageUrl = URL.createObjectURL(imageBlob);
      const imageLink = document.createElement('a');
      imageLink.href = imageUrl;
      imageLink.download = `capture_${i + 1}_${session.id}.jpg`;
      document.body.appendChild(imageLink);
      imageLink.click();
      document.body.removeChild(imageLink);
      URL.revokeObjectURL(imageUrl);
      
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Failed to download image ${i + 1}:`, error);
    }
  }
}
