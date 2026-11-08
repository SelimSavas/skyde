// Her dosyayı ayrı ayrı yazıya döker (kesilen satırları doğrulamak için).
// node video/araclar/dokum.mjs <asr-klasoru> <cikti.json> <dosya...>
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
const [asrDir, out, ...files] = process.argv.slice(2);
const req = createRequire(path.join(asrDir, 'package.json'));
const tf = await import(pathToFileURL(req.resolve('@huggingface/transformers')).href);
tf.env.allowRemoteModels = false;
tf.env.localModelPath = path.join(asrDir, 'node_modules/sts-whisper-small/models') + '/';
const asr = await tf.pipeline('automatic-speech-recognition', 'Xenova/whisper-small', { dtype: 'q8' });
const res = {};
for (const f of files) {
  const raw = execFileSync('ffmpeg', ['-loglevel', 'error', '-i', f, '-ar', '16000', '-ac', '1', '-f', 'f32le', '-'], { maxBuffer: 1 << 28 });
  const audio = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
  const r = await asr(audio, { language: 'turkish', task: 'transcribe', chunk_length_s: 30 });
  res[path.basename(f, path.extname(f))] = r.text.trim();
  fs.writeFileSync(out, JSON.stringify(res, null, 1));
}
console.log('bitti', Object.keys(res).length);
