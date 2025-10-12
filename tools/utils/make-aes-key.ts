import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

try {
  let aes256KeyBase64 = crypto.randomBytes(32).toString('base64');

  let now = new Date();

  let timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;

  let dirName = `secrets/aes_${timestamp}.env`;

  let outputDir = path.dirname(dirName);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(dirName, `BACKEND_AES_KEY="${aes256KeyBase64}"`);

  console.log(`Key written to ${dirName}`);
} catch (e) {
  console.error('Unexpected error:', e);
  process.exit(1);
}
