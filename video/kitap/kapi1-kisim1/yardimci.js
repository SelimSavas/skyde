/*
 * Ders kitabı için Word (docx) yapı taşları: başlıklar, kutular, tablolar, görseller, yazma satırları.
 * Metinlerde küçük bir işaretleme kullanılır: **kalın**, *italik*, `eşaralıklı`.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const docx = require('/opt/node22/lib/node_modules/docx');
const {
  Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  AlignmentType, HeadingLevel, PageBreak, LevelFormat, VerticalAlign, TabStopType, LeaderType, Tab,
} = docx;

const GORSEL = path.join(__dirname, 'gorseller');
const CONTENT_W = 9524; // A4 − 2 × 2,1 cm (DXA)
const PX_PER_CM = 96 / 2.54;

const RENK = {
  navy: '1B2338', ink: '1F2937', muted: '6B7280', orange: 'E8541A', amber: 'FFA547', blue: '2E6DB4',
  green: '2F9E62', red: 'C0392B', line: 'C9CED8',
};

// **kalın**, *italik*, `kod` işaretlemesini TextRun dizisine çevirir
function runs(str, base = {}) {
  const out = [];
  const parts = String(str).split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).filter((s) => s !== '');
  for (const p of parts) {
    if (p.startsWith('**')) out.push(new TextRun({ ...base, text: p.slice(2, -2), bold: true }));
    else if (p.startsWith('`')) out.push(new TextRun({ ...base, text: p.slice(1, -1), font: 'Consolas', color: base.color ?? RENK.navy }));
    else if (p.startsWith('*')) out.push(new TextRun({ ...base, text: p.slice(1, -1), italics: true }));
    else out.push(new TextRun({ ...base, text: p }));
  }
  return out;
}

function P(str, o = {}) {
  return new Paragraph({
    children: Array.isArray(str) ? str : runs(str, o.run ?? {}),
    alignment: o.align ?? AlignmentType.JUSTIFIED,
    spacing: { after: o.after ?? 140, before: o.before ?? 0, line: o.line ?? 300 },
    indent: o.indent,
    keepNext: o.keepNext,
    style: o.style,
  });
}

const bullet = (str, level = 0) => new Paragraph({ children: runs(str), numbering: { reference: 'madde', level }, spacing: { after: 80, line: 290 } });
const numbered = (str, instance = 1) => new Paragraph({ children: runs(str), numbering: { reference: 'sayi', level: 0, instance }, spacing: { after: 80, line: 290 } });

function H1(label, title) {
  return [
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({ children: [new TextRun({ text: label, bold: true, color: RENK.orange, size: 22, characterSpacing: 60 })], spacing: { after: 40 } }),
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: title })], spacing: { after: 160 } }),
  ];
}
const H2 = (title) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: title })], spacing: { before: 220, after: 100 }, keepNext: true });
const H3 = (title) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: title })], spacing: { before: 160, after: 80 }, keepNext: true });

function videoTag(range, what) {
  return new Paragraph({
    children: [
      new TextRun({ text: '  ▶  VİDEODA  ', bold: true, color: 'FFFFFF', size: 18, characterSpacing: 30 }),
      new TextRun({ text: range, bold: true, color: 'FFD27A', size: 20 }),
      new TextRun({ text: `   ${what}  `, color: 'E5E7EB', size: 18 }),
    ],
    shading: { type: ShadingType.CLEAR, fill: RENK.navy, color: 'auto' },
    spacing: { after: 200 },
  });
}

function imgSize(file) {
  const b = fs.readFileSync(file);
  if (b[0] === 0x89) return { w: b.readUInt32BE(16), h: b.readUInt32BE(20), data: b, type: 'png' };
  // JPEG: SOF işaretçisini bul
  let i = 2;
  while (i < b.length) {
    const marker = b[i + 1];
    const len = b.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xc3) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7), data: b, type: 'jpg' };
    i += 2 + len;
  }
  throw new Error(`boyut okunamadı: ${file}`);
}

// Görsel (genişlik cm) + isteğe bağlı açıklama
function fig(name, widthCm, caption) {
  const { w, h, data, type } = imgSize(path.join(GORSEL, name));
  const width = Math.round(widthCm * PX_PER_CM);
  const out = [new Paragraph({
    children: [new ImageRun({ type, data, transformation: { width, height: Math.round((width * h) / w) }, altText: { title: caption ?? name, description: caption ?? name, name } })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: caption ? 40 : 160 },
    keepNext: !!caption,
  })];
  if (caption) out.push(new Paragraph({ children: runs(caption, { italics: true, color: RENK.muted, size: 18 }), alignment: AlignmentType.CENTER, spacing: { after: 200 } }));
  return out;
}

const NONE = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };

const KUTU = {
  etkinlik: { fill: 'FFF4EB', color: RENK.orange, label: 'ETKİNLİK' },
  kavram: { fill: 'EEF2F8', color: RENK.navy, label: 'ANAHTAR KAVRAM' },
  biliyor: { fill: 'EAF4FC', color: RENK.blue, label: 'BİLİYOR MUYDUNUZ?' },
  yanilgi: { fill: 'FDECEE', color: RENK.red, label: 'DİKKAT: YAYGIN YANILGI' },
  tartis: { fill: 'EEF8F1', color: RENK.green, label: 'DÜŞÜN VE TARTIŞ' },
  ozet: { fill: 'F3F4F6', color: RENK.navy, label: 'ÜNİTENİN ÖZÜ' },
};

// Renkli kenarlı bilgi / etkinlik kutusu. children: Paragraph ya da Table dizisi (string → paragraf)
function box(kind, title, children) {
  const k = KUTU[kind];
  const head = new Paragraph({
    children: [
      new TextRun({ text: k.label, bold: true, color: k.color, size: 19, characterSpacing: 40 }),
      ...(title ? [new TextRun({ text: `  ·  ${title}`, bold: true, color: RENK.navy, size: 21 })] : []),
    ],
    spacing: { after: 100 },
    keepNext: true,
  });
  const body = children.map((c) => (typeof c === 'string' ? P(c, { after: 100 }) : c));
  return [
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: [CONTENT_W],
      rows: [new TableRow({
        cantSplit: body.length < 5,
        children: [new TableCell({
          width: { size: CONTENT_W, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: k.fill, color: 'auto' },
          borders: { left: { style: BorderStyle.SINGLE, size: 36, color: k.color }, top: NONE, bottom: NONE, right: NONE },
          margins: { top: 140, bottom: 120, left: 220, right: 200 },
          children: [head, ...body],
        })],
      })],
    }),
    new Paragraph({ children: [], spacing: { after: 160 } }),
  ];
}

// Basit tablo: headers dizisi, rows dizi dizisi (string), widths DXA dizisi (toplam = tablo genişliği)
function table(headers, rows, widths, o = {}) {
  const total = widths.reduce((a, b) => a + b, 0);
  const border = { style: BorderStyle.SINGLE, size: 4, color: 'B8BFCC' };
  const borders = { top: border, bottom: border, left: border, right: border };
  const cell = (txt, i, head, rIdx) => new TableCell({
    width: { size: widths[i], type: WidthType.DXA },
    borders,
    shading: head ? { type: ShadingType.CLEAR, fill: o.headFill ?? '1B2338', color: 'auto' } : (o.zebra && rIdx % 2 ? { type: ShadingType.CLEAR, fill: 'F6F7F9', color: 'auto' } : undefined),
    margins: { top: o.pad ?? 70, bottom: o.pad ?? 70, left: 100, right: 100 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      children: runs(txt ?? '', head ? { bold: true, color: 'FFFFFF', size: o.headSize ?? 19 } : { size: o.size ?? 20, color: RENK.ink }),
      alignment: (o.align && o.align[i]) ?? AlignmentType.LEFT,
      spacing: { after: 0, line: 260 },
    })],
  });
  const trs = [];
  if (headers) trs.push(new TableRow({ tableHeader: true, children: headers.map((h, i) => cell(h, i, true, 0)) }));
  rows.forEach((r, rIdx) => trs.push(new TableRow({ height: o.rowHeight ? { value: o.rowHeight, rule: 'atLeast' } : undefined, cantSplit: true, children: r.map((c, i) => cell(c, i, false, rIdx)) })));
  return new Table({ width: { size: total, type: WidthType.DXA }, columnWidths: widths, rows: trs, alignment: o.center ? AlignmentType.CENTER : undefined });
}

// Öğrencinin yazacağı noktalı satırlar
function lines(n, label) {
  const out = [];
  if (label) out.push(P(label, { after: 40 }));
  for (let i = 0; i < n; i++) {
    // noktalı sekme: her satır ayrı çizilir (kenarlıklar gibi birleşmez)
    out.push(new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: 9000, leader: LeaderType.DOT }],
      children: [new TextRun({ children: [new Tab()], color: 'A0A7B5' })],
      spacing: { before: 120, after: 60, line: 360 },
    }));
  }
  return out;
}

// Alıntı: ortalanmış, üstü ve altı çizgili
function quote(str, who) {
  const b = { style: BorderStyle.SINGLE, size: 8, color: RENK.amber, space: 8 };
  const out = [new Paragraph({
    children: runs(`“${str}”`, { italics: true, size: 27, color: RENK.navy, font: 'Cambria' }),
    alignment: AlignmentType.CENTER,
    border: { top: b, bottom: who ? undefined : b },
    spacing: { before: 200, after: who ? 60 : 240, line: 340 },
    indent: { left: 600, right: 600 },
  })];
  if (who) out.push(new Paragraph({ children: runs(who, { size: 18, color: RENK.muted }), alignment: AlignmentType.CENTER, border: { bottom: b }, spacing: { after: 240 }, indent: { left: 600, right: 600 } }));
  return out;
}

const spacer = (after = 120) => new Paragraph({ children: [], spacing: { after } });
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

const numbering = {
  config: [
    { reference: 'madde', levels: [
      { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 300 } }, run: { color: RENK.orange } } },
      { level: 1, format: LevelFormat.BULLET, text: '–', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1000, hanging: 300 } } } },
    ] },
    { reference: 'sayi', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 360 } }, run: { bold: true, color: RENK.orange } } }] },
  ],
};

module.exports = { docx, P, runs, bullet, numbered, H1, H2, H3, videoTag, fig, box, table, lines, quote, spacer, pageBreak, numbering, RENK, CONTENT_W };
