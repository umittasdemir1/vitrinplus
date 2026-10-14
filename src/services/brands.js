// Rakip marka adlarını karşılaştırmak için: büyük/küçük harf, boşluk, noktalama ve
// Türkçe karakter farkları yok sayılır ("Beymenclub", "BEYMEN CLUB" → "beymenclub").
export const normalizeBrand = (name) =>
  String(name || '')
    .replace(/İ/g, 'i').replace(/I/g, 'ı')
    .toLocaleLowerCase('tr')
    .replace(/[ıöüşçğ]/g, ch => ({ ı: 'i', ö: 'o', ü: 'u', ş: 's', ç: 'c', ğ: 'g' })[ch])
    .replace(/[^a-z0-9]/g, '');

const isAllCaps = (s) => s === s.toLocaleUpperCase('tr') && s !== s.toLocaleLowerCase('tr');
const isAllLower = (s) => s === s.toLocaleLowerCase('tr') && s !== s.toLocaleUpperCase('tr');
// Yazım "düzgünlüğü": tamamı büyük ya da tamamı küçük harf yazımlar geride kalır
const sloppiness = (s) => Number(isAllCaps(s)) + Number(isAllLower(s));

// Mağazalardaki tüm markalardan, her normalize anahtar için standart yazımı seçer:
// en çok kullanılan yazım; eşitlikte tamamı büyük/küçük harf olmayan tercih edilir.
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
      cb - ca || sloppiness(a) - sloppiness(b));
    canonical.set(key, best[0]);
  });
  const names = [...canonical.values()].sort((a, b) => a.localeCompare(b, 'tr'));
  return { canonical, names };
}

// Yazılan metinle başlayan ilk bilinen markayı (kayıtlı yazımıyla) döner; büyük/küçük harf duyarsız.
// Sadece kullanıcı öneriyi kabul ederse uygulanır, aksi halde yazdığı aynen kalır.
export function suggestBrand(typed, names) {
  const prefix = typed.toLocaleLowerCase('tr');
  if (!prefix.trim()) return null;
  const match = names.find(name => {
    const lower = name.toLocaleLowerCase('tr');
    return lower.length > prefix.length && lower.startsWith(prefix);
  });
  return match || null;
}
