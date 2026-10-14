// Mağaza kartındaki "Henüz düzenlenmemiş" etiketi ve ana sayfa durum filtresi aynı tanımı kullanır
export const hasStoreImages = (store) => !!store.images?.some(img => img?.trim());

export const hasStoreData = (store) =>
  !!(store.size || hasStoreImages(store) || store.competitorBrands?.some(b => b?.trim()));

export const STORE_STATUS_FILTERS = [
  { key: 'unedited', label: 'Henüz düzenlenmemiş', match: (s) => !hasStoreData(s) },
  { key: 'noPhoto', label: 'Fotoğraf yüklenmemiş', match: (s) => !hasStoreImages(s) },
];

// Mağazanın bulunduğu yer tipi (Firestore: stores/{id}.lokasyonTipi)
export const LOCATION_TYPES = ['AVM', 'Cadde', 'Marina', 'Resort', 'Outlet', 'Havalimanı'];
