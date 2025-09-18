export function isImageFile(file) {
  return file.type.startsWith('image/');
}

export function getImageFromClipboard(clipboardItems) {
  for (let item of clipboardItems) {
    if (item.type.startsWith('image/')) {
      return item.getAsFile();
    }
  }
  return null;
}