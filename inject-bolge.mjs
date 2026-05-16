import XLSX from 'xlsx';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync('.secrets/firebase-service-account.json', 'utf8'));
initializeApp({ credential: cert(sa) });
const db = getFirestore();

// Excel'den oku
const wb = XLSX.readFile('Mağazalar Güncel.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }).slice(1); // header satırını atla

const norm = (s) => (s || '').trim().toLowerCase()
  .replace(/İ/g, 'i').replace(/Ğ/g, 'g').replace(/Ü/g, 'u')
  .replace(/Ş/g, 's').replace(/Ö/g, 'o').replace(/Ç/g, 'c')
  .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
  .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c');

// Excel map: normalized name → { bolge, bolgeYoneticisi }
const excelMap = {};
for (const [name, bolge, yonetici] of rows) {
  if (name) excelMap[norm(name)] = { bolge: (bolge || '').trim(), bolgeYoneticisi: (yonetici || '').trim() };
}

// Firestore'dan tüm mağazaları çek
const snap = await db.collection('stores').get();
let matched = 0, unmatched = [];

const batch = db.batch();
for (const doc of snap.docs) {
  const storeName = doc.data().name || '';
  const key = norm(storeName);
  if (excelMap[key]) {
    batch.update(doc.ref, excelMap[key]);
    matched++;
  } else {
    unmatched.push(storeName);
  }
}

await batch.commit();
console.log(`✅ ${matched} mağaza güncellendi.`);
if (unmatched.length) {
  console.log(`⚠️  Eşleşmeyen (${unmatched.length}):`);
  unmatched.forEach(n => console.log('  -', n));
}
