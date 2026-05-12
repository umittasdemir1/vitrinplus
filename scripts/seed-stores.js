import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// Bu script tek seferlik çalıştırıldı (2025-05-12). Artık mağaza listesi Firebase'de.
// Yeni mağaza eklemek için uygulama içindeki "Yeni Mağaza Ekle" formunu kullan.
const storeDatabase = [];

const serviceAccount = JSON.parse(
  readFileSync('.secrets/vitrinplus-91045-firebase-adminsdk-fbsvc-bbf86cbc42.json', 'utf8')
);

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function seed() {
  const batch = db.batch();

  for (const store of storeDatabase) {
    const ref = db.collection('stores').doc(store.id);
    // merge: true → mevcut fotoğraf/rakip/not verilerini silmez
    batch.set(ref, {
      name: store.name,
      address: store.address,
      location: store.location,
    }, { merge: true });
  }

  await batch.commit();
  console.log(`✅ ${storeDatabase.length} mağaza Firebase'e aktarıldı.`);
}

seed().catch(console.error);
