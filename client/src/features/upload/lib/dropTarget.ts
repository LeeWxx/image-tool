type DropTargetOptions = {
  onFiles?: (files: File[]) => void;
  onDragChange?: (active: boolean) => void;
  onPaste?: (event: ClipboardEvent) => void;
};

const noop = () => {};

export function dropTarget(node: HTMLElement, options: DropTargetOptions = {}) {
  const {
    onFiles = noop,
    onDragChange = noop,
    onPaste = noop
  } = options;

  let dragDepth = 0;

  const preventDefaults = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragEnter = (event: DragEvent) => {
    preventDefaults(event);
    dragDepth += 1;
    onDragChange(true);
  };

  const handleDragOver = (event: DragEvent) => {
    preventDefaults(event);
  };

  const handleDragLeave = (event: DragEvent) => {
    preventDefaults(event);
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0) {
      onDragChange(false);
    }
  };

  const handleDrop = (event: DragEvent) => {
    preventDefaults(event);
    dragDepth = 0;
    onDragChange(false);

    const files = Array.from(event.dataTransfer?.files || []);
    if (files.length > 0) {
      onFiles(files);
    }
  };

  const handlePaste = (event: ClipboardEvent) => {
    onPaste(event);
  };

  const bodyHandler = (event: Event) => preventDefaults(event);

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    node.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, bodyHandler, false);
  });

  node.addEventListener('dragenter', handleDragEnter);
  node.addEventListener('dragover', handleDragOver);
  node.addEventListener('dragleave', handleDragLeave);
  node.addEventListener('drop', handleDrop);

  document.addEventListener('paste', handlePaste);

  return {
    destroy() {
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        node.removeEventListener(eventName, preventDefaults, false);
        document.body.removeEventListener(eventName, bodyHandler, false);
      });

      node.removeEventListener('dragenter', handleDragEnter);
      node.removeEventListener('dragover', handleDragOver);
      node.removeEventListener('dragleave', handleDragLeave);
      node.removeEventListener('drop', handleDrop);

      document.removeEventListener('paste', handlePaste);
    }
  };
}
