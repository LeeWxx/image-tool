const dropArea = document.getElementById('drop-area');
const results = document.getElementById('results');

async function handleFile(file) {
  try {
    const buffer = await file.arrayBuffer();
    
    // 다운로드 링크 추가
    const li = document.createElement('li');
    li.textContent = `${file.name} 처리 중...`;
    results.prepend(li);
    
    // 데이터 가져오기
    const response = await fetch('/optimize', {
      method: 'POST',
      headers: { 'Content-Type': file.type },
      body: buffer
    });
    
    if (!response.ok) {
      throw new Error('이미지 최적화 실패');
    }
    
    // 응답에서 filename 추출 
    let filename = 'image.webp';
    const disposition = response.headers.get('Content-Disposition');
    if (disposition && disposition.includes('filename=')) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(disposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }
    
    // 응답에서 blob 추출
    const blob = await response.blob();
    
    // Blob URL 생성
    const url = URL.createObjectURL(blob);
    
    // 다운로드 링크 생성
    li.innerHTML = `
      <span>${file.name}</span>
      <a href="${url}" download="${filename}">다운로드</a>
    `;
  } catch (error) {
    console.error('Error:', error);
    alert('이미지 처리 중 오류가 발생했습니다.');
  }
}

// Drop 이벤트 처리
['dragenter','dragover'].forEach(evt => {
  dropArea.addEventListener(evt, e => {
    e.preventDefault();
    dropArea.classList.add('drag-over');
  });
});

dropArea.addEventListener('dragleave', () => {
  dropArea.classList.remove('drag-over');
});

dropArea.addEventListener('drop', e => {
  e.preventDefault();
  dropArea.classList.remove('drag-over');
  [...e.dataTransfer.files].forEach(handleFile);
});

// Paste 이벤트 처리
window.addEventListener('paste', e => {
  const items = e.clipboardData.items;
  for (let item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      handleFile(file);
    }
  }
});
