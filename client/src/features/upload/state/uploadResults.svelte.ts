export type UploadStatus = 'processing' | 'completed' | 'error';

export type UploadResult = {
  id: number;
  originalName: string;
  status: UploadStatus;
  originalSize: number;
  optimizedSize?: number;
  optimizedUrl?: string;
  filename?: string;
  driveLink?: string;
};

let results = $state<UploadResult[]>([]);

export function useUploadResults() {
  return {
    get items() {
      return results;
    }
  };
}

export function resetResults() {
  results = [];
}

export function addProcessingResult(data: { id: number; originalName: string; originalSize: number }) {
  results = [...results, {
    id: data.id,
    originalName: data.originalName,
    originalSize: data.originalSize,
    status: 'processing'
  }];
}

export function markResultCompleted(id: number, payload: { optimizedSize?: number; optimizedUrl?: string; filename?: string; driveLink?: string; }) {
  results = results.map(result =>
    result.id === id
      ? {
          ...result,
          status: 'completed',
          optimizedSize: payload.optimizedSize ?? result.optimizedSize,
          optimizedUrl: payload.optimizedUrl ?? result.optimizedUrl,
          filename: payload.filename ?? result.filename,
          driveLink: payload.driveLink ?? result.driveLink
        }
      : result
  );
}

export function markResultError(id: number) {
  results = results.map(result =>
    result.id === id
      ? { ...result, status: 'error' }
      : result
  );
}
