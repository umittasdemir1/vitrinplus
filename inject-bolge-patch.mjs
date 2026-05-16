import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync('.secrets/firebase-service-account.json', 'utf8'));
initializeApp({ credential: cert(sa) });
const db = getFirestore();

// Firestore adı → { bolge, bolgeYoneticisi }
const patches = {
  'İstinye Park İstanbul':    { bolge: '2. Bölge', bolgeYoneticisi: 'Serkan Bakan' },
  'İstinye Park İzmir':       { bolge: '3. Bölge', bolgeYoneticisi: 'Senem Sönmez' },
  'Maxx Royal Kemer':         { bolge: 'Resort',   bolgeYoneticisi: 'Deniz Gündoğmuş' },
  'Meydan İstanbul':          { bolge: '2. Bölge', bolgeYoneticisi: 'Serkan Bakan' },
  'Swissotel Çeşme':          { bolge: 'Resort',   bolgeYoneticisi: 'Deniz Gündoğmuş' },
  'Vadi İstanbul':            { bolge: '2. Bölge', bolgeYoneticisi: 'Serkan Bakan' },
  'Yalıkavak Marina (Kiosk)': { bolge: '3. Bölge', bolgeYoneticisi: 'Senem Sönmez' },
};

const snap = await db.collection('stores').get();
const batch = db.batch();
let updated = 0;

for (const doc of snap.docs) {
  const name = doc.data().name || '';
  if (patches[name]) {
    batch.update(doc.ref, patches[name]);
    console.log(`✅ ${name}`);
    updated++;
  }
}

await batch.commit();
console.log(`\n${updated} mağaza daha güncellendi.`);
