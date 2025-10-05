export type DriveFolder = {
  id: string;
  name: string;
  parents?: string[];
  modifiedTime?: string;
};

export type DriveItem = DriveFolder & {
  mimeType?: string;
  size?: string;
  iconLink?: string;
  thumbnailLink?: string;
  webViewLink?: string;
};

export const ROOT_ID = 'root';
export const ROOT_LABEL = 'My Drive';
