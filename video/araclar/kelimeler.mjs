// Whisper (transformers.js, whisper-small q8, çevrimdışı) ile sözcük zamanlı döküm.
// node video/araclar/kelimeler.mjs <asr-klasoru> <kayit16k.f32> <kelimeler.json>
// Dikkat: 30 sn'lik parçaların bindiği yerde aynı sözcükleri iki kez yazabilir; kaydın son satırını kaçırabilir
// (son birkaç saniyeyi dokum.mjs ile ayrıca dökün, sözcükleri kelimeler.json'a elle ekleyin).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
const [asrDir, f32, out] = process.argv.slice(2);
const req = createRequire(path.join(asrDir, 'package.json'));
const tf = await import(pathToFileURL(req.resolve('@huggingface/transformers')).href);
tf.env.allowRemoteModels = false;
tf.env.localModelPath = path.join(asrDir, 'node_modules/sts-whisper-small/models') + '/';
const asr = await tf.pipeline('automatic-speech-recognition', 'Xenova/whisper-small', { dtype: 'q8' });
const buf = fs.readFileSync(f32);
const audio = new Float32Array(buf.buffer, buf.byteOffset, buf.length / 4);
const r = await asr(audio, { language: 'turkish', task: 'transcribe', return_timestamps: 'word', chunk_length_s: 30, stride_length_s: 5 });
fs.writeFileSync(out, JSON.stringify(r.chunks));
console.log(r.chunks.length, r.text.slice(0, 300));
