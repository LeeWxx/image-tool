import { uploadImage } from './api.ts';
import {
  addProcessingResult,
  markResultCompleted,
  markResultError
} from '../state/uploadResults.svelte.ts';

export async function uploadFiles(files: File[], targetFolderId: string) {
  let successCount = 0;
  for (const file of files) {
    const tempId = Date.now() + Math.random();
    addProcessingResult({
      id: tempId,
      originalName: file.name,
      originalSize: file.size
    });

    try {
      const { blob, url, info } = await uploadImage(file, targetFolderId);
      markResultCompleted(tempId, {
        optimizedUrl: url,
        optimizedSize: info.size ?? blob.size,
        filename: info.filename,
        driveLink: info.drive?.webViewLink
      });
      successCount += 1;
    } catch (error) {
      markResultError(tempId);
      console.error('Error uploading file:', error);
    }
  }

  return { successCount };
}
