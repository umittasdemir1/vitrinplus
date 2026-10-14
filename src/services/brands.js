// Rakip marka adlarını karşılaştırmak için: büyük/küçük harf, boşluk, noktalama ve
// Türkçe karakter farkları yok sayılır ("Beymenclub", "BEYMEN CLUB" → "beymenclub").
export const normalizeBrand = (name) =>
  String(name || '')
    .replace(/İ/g, 'i').replace(/I/g, 'ı')
    .toLocaleLowerCase('tr')
    .replace(/[ıöüşçğ]/g, ch => ({ ı: 'i', ö: 'o', ü: 'u', ş: 's', ç: 'c', ğ: 'g' })[ch])
    .replace(/[^a-z0-9]/g, '');

const isAllCaps = (s) => s === s.toLocaleUpperCase('tr') && s !== s.toLocaleLowerCase('tr');

// Mağazalardaki tüm markalardan, her normalize anahtar için standart yazımı seçer:
// en çok kullanılan yazım; eşitlikte tamamı büyük harf olmayan tercih edilir.
export function buildBrandIndex(stores) {
  const counts = new Map();
  stores.forEach(store => {
    (store.competitorBrands || []).forEach(raw => {
      const name = String(raw || '').trim();
      const key = normalizeBrand(name);
      if (!key) return;
      if (!counts.has(key)) counts.set(key, new Map());
      const spellings = counts.get(key);
      spellings.set(name, (spellings.get(name) || 0) + 1);
    });
  });
  const canonical = new Map();
  counts.forEach((spellings, key) => {
    const [best] = [...spellings.entries()].sort(([a, ca], [b, cb]) =>
      cb - ca || Number(isAllCaps(a)) - Number(isAllCaps(b)));
    canonical.set(key, best[0]);
  });
  const names = [...canonical.values()].sort((a, b) => a.localeCompare(b, 'tr'));
  return { canonical, names };
}

// Yazılan ad bilinen bir markayla eşleşiyorsa standart yazımını, yoksa kırpılmış halini döner
export const canonicalBrand = (name, index) =>
  index.canonical.get(normalizeBrand(name)) || String(name || '').trim();
