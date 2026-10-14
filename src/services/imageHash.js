// Görsel parmak izi: 256x256'ya küçült, 17x16 blok ortalaması, yatay dHash (256 bit, 64 hex karakter).
// Mevcut 317 mağaza fotoğrafıyla ölçüldü: aynı fotoğrafın kopyaları en fazla 6 bit
// (tarayıcı ile Python arasında en fazla 13 bit) farklı; farklı fotoğraflar, art arda
// çekilmiş benzer kareler dahil, en az 33 bit farklı. Eşik ikisinin arasında.
// scripts/backfill-image-hashes.py aynı algoritmayı kullanır; ikisi birlikte değişmeli.
const W = 17;
const H = 16;
const MID = 256;
export const DUPLICATE_THRESHOLD = 20;

const loadImage = (src) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = src;
});

export async function computeImageHash(src) {
  const img = await loadImage(src);
  // Önce sabit 256x256'ya çek (en-boy oranı bilerek yok sayılır; çok yatay/dikey
  // görsellerde blokların birkaç piksele düşüp tarayıcı/Python farkını büyütmesini önler)
  const mid = document.createElement('canvas');
  mid.width = MID;
  mid.height = MID;
  const midCtx = mid.getContext('2d');
  midCtx.imageSmoothingQuality = 'high';
  midCtx.drawImage(img, 0, 0, mid.width, mid.height);

  // 17x16 ızgaraya blok ortalamasıyla indir (Python tarafı aynı tamsayı sınırlarını kullanır)
  const { width: w, height: h } = mid;
  const px = midCtx.getImageData(0, 0, w, h).data;
  const grid = [];
  for (let gy = 0; gy < H; gy++) {
    const y0 = Math.floor(gy * h / H), y1 = Math.floor((gy + 1) * h / H);
    for (let gx = 0; gx < W; gx++) {
      const x0 = Math.floor(gx * w / W), x1 = Math.floor((gx + 1) * w / W);
      let sum = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = (y * w + x) * 4;
          sum += 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
        }
      }
      grid.push(sum / ((y1 - y0) * (x1 - x0)));
    }
  }
  const gray = (x, y) => grid[y * W + x];
  let hex = '';
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W - 1; x += 4) {
      let nibble = 0;
      for (let b = 0; b < 4; b++) nibble = (nibble << 1) | (gray(x + b, y) > gray(x + b + 1, y) ? 1 : 0);
      hex += nibble.toString(16);
    }
  }
  return hex;
}

const POPCOUNT = [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4];

export function hashDistance(a, b) {
  if (!a || !b || a.length !== b.length) return Infinity;
  let d = 0;
  for (let i = 0; i < a.length; i++) d += POPCOUNT[parseInt(a[i], 16) ^ parseInt(b[i], 16)];
  return d;
}

// entries: [{ url, hash }] — eşleşen ilk kaydı döner
export const findDuplicate = (hash, entries) =>
  entries.find(e => hashDistance(hash, e.hash) <= DUPLICATE_THRESHOLD) || null;
