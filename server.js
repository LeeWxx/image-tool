import express from 'express';
import sharp from 'sharp';
import crypto from 'crypto';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3000;

app.use(bodyParser.raw({ type: ['image/*'], limit: '10mb' }));

app.post('/optimize', async (req, res) => {
  try {
    const buffer = req.body;
    // 해시 생성 (SHA-256, 앞 16자)
    const hash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 16);
    const filename = `${hash}.webp`;

    // Sharp로 이미지 최적화
    const optimizedBuffer = await sharp(buffer)
      .resize({ width: 1024, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    // 다운로드 응답 헤더 설정
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'image/webp');
    
    // 이미지 버퍼 전송
    res.send(optimizedBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Processing failed' });
  }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
