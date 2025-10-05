function isItemArray(items: DataTransferItemList | DataTransferItem[]): items is DataTransferItem[] {
  return Array.isArray(items);
}

function toItemsArray(items: DataTransferItemList | DataTransferItem[]) {
  if (isItemArray(items)) {
    return items;
  }

  const nativeList = items as DataTransferItemList;
  const list: DataTransferItem[] = [];
  for (let i = 0; i < nativeList.length; i += 1) {
    const item = nativeList[i];
    if (item) {
      list.push(item);
    }
  }
  return list;
}

export function isImageFile(file: File) {
  return file.type.startsWith('image/');
}

export function getImageFromClipboard(items: DataTransferItemList | DataTransferItem[]) {
  const entries = toItemsArray(items);
  for (const item of entries) {
    if (item.type.startsWith('image/')) {
      return item.getAsFile();
    }
  }
  return null;
}
