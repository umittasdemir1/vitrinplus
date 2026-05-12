import { useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, db, storage } from './services/firebase';
import { ChevronLeft, ChevronRight, Save, Search, Trash } from './components/Icons';
import DragDropUpload from './components/DragDropUpload';
import ProgressBar from './components/ProgressBar';
import StoreCard from './components/StoreCard';
import RenovationCard from './components/RenovationCard';

export default function StoreManagementApp() {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedStoreName, setSelectedStoreName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('all');
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [newStore, setNewStore] = useState({ name: '', address: '', location: '' });
  const [addingSaving, setAddingSaving] = useState(false);
  const [renovations, setRenovations] = useState([]);
  const [renovationForm, setRenovationForm] = useState({ storeId: '', talepTarihi: '', aciklama: '', imageUrls: [] });
  const [renovationSaving, setRenovationSaving] = useState(false);
  const [uploadingRenovationImage, setUploadingRenovationImage] = useState(false);
  const [renovationSearch, setRenovationSearch] = useState('');
  const [renovationFilterLocation, setRenovationFilterLocation] = useState('all');

  useEffect(() => {
    let unsubStores, unsubRenovations;

    const init = async () => {
      try {
        await auth.authStateReady();
        if (!auth.currentUser) await signInAnonymously(auth);

        unsubStores = onSnapshot(collection(db, 'stores'), (snap) => {
          setStores(snap.docs.map(d => ({ ...d.data(), id: d.id })));
        }, (err) => console.error('Stores snapshot hatası:', err));

        const q = query(collection(db, 'renovations'), orderBy('createdAt', 'desc'));
        unsubRenovations = onSnapshot(q, (snap) => {
          setRenovations(snap.docs.map(d => ({ ...d.data(), id: d.id })));
        }, (err) => console.error('Renovations snapshot hatası:', err));
      } catch (err) {
        console.error('Firebase init hatası:', err);
      }
    };

    init();
    return () => { unsubStores?.(); unsubRenovations?.(); };
  }, []);

  const handleRenovationImageSelect = async (files) => {
    if (!files?.length) return;
    setUploadingRenovationImage(true);
    try {
      const uploaded = [];
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        const compressed = await compressImage(file);
        const isWebP = compressed.startsWith('data:image/webp');
        const blob = await (await fetch(compressed)).blob();
        const ext = isWebP ? 'webp' : 'jpg';
        const fileName = `renovation_${Date.now()}_${Math.random().toString(36).substring(2)}.${ext}`;
        const storageRef = ref(storage, `renovation-images/${fileName}`);
        await uploadBytes(storageRef, blob);
        uploaded.push(await getDownloadURL(storageRef));
      }
      setRenovationForm(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ...uploaded] }));
    } catch (e) {
      console.error('Fotoğraf yükleme hatası:', e);
    } finally {
      setUploadingRenovationImage(false);
    }
  };

  const handleSaveRenovation = async () => {
    if (!renovationForm.storeId || !renovationForm.talepTarihi || !renovationForm.aciklama.trim()) return;
    setRenovationSaving(true);
    try {
      const store = stores.find(s => s.id === renovationForm.storeId);
      const data = {
        storeId: renovationForm.storeId,
        storeName: store?.name || renovationForm.storeId,
        location: store?.location || '',
        talepTarihi: renovationForm.talepTarihi,
        aciklama: renovationForm.aciklama.trim(),
        imageUrls: renovationForm.imageUrls,
        createdAt: new Date().toISOString(),
      };
      await addDoc(collection(db, 'renovations'), data);
      setRenovationForm({ storeId: '', talepTarihi: '', aciklama: '', imageUrls: [] });
      setCurrentView('renovations-list');
    } catch (err) {
      console.error('Tadilat kaydetme hatası:', err);
    } finally {
      setRenovationSaving(false);
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1400;
        const ratio = Math.min(1, maxWidth / img.width, maxWidth / img.height);
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const supportsWebP = canvas.toDataURL('image/webp').startsWith('data:image/webp');
        if (supportsWebP) {
          resolve(canvas.toDataURL('image/webp', 0.82));
        } else {
          let quality = 0.85;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);
          while (dataUrl.length > 750 * 1024 * 1.37 && quality > 0.3) {
            quality -= 0.1;
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
          resolve(dataUrl);
        }
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadToFirebaseStorage = async (file, storeId, imageIndex) => {
    if (!file.type.startsWith('image/')) throw new Error('Sadece resim dosyası yükleyebilirsiniz');

    const compressedDataUrl = await compressImage(file);
    const isWebP = compressedDataUrl.startsWith('data:image/webp');
    const blob = await (await fetch(compressedDataUrl)).blob();

    const ext = isWebP ? 'webp' : 'jpg';
    const fileName = `${storeId}_${imageIndex}_${Date.now()}_${Math.random().toString(36).substring(2)}.${ext}`;
    const storageRef = ref(storage, `store-images/${fileName}`);

    const progressKey = `${storeId}_${imageIndex}`;
    let progress = 0;
    const interval = setInterval(() => {
      progress = Math.min(progress + Math.random() * 15, 85);
      setUploadProgress(prev => ({ ...prev, [progressKey]: { progress, fileName: file.name } }));
    }, 200);

    try {
      await uploadBytes(storageRef, blob);
      clearInterval(interval);
      setUploadProgress(prev => ({ ...prev, [progressKey]: { progress: 100, fileName: file.name } }));
      const downloadURL = await getDownloadURL(storageRef);
      setTimeout(() => setUploadProgress(prev => { const next = { ...prev }; delete next[progressKey]; return next; }), 2000);
      return downloadURL;
    } catch (err) {
      clearInterval(interval);
      throw err;
    }
  };

  const deleteStorageFile = async (url) => {
    if (!url.includes('firebasestorage.googleapis.com')) return;
    try {
      const decodedPath = decodeURIComponent(url.split('/o/')[1].split('?')[0]);
      await deleteObject(ref(storage, decodedPath));
    } catch (e) {
      console.warn('Storage silme hatası:', e);
    }
  };

  const handleMultipleImageUpload = async (files) => {
    if (!selectedStore || !files.length) return;
    setUploading(true);
    try {
      const updatedImages = [...(selectedStore.images || [])];
      let uploadCount = 0;
      for (const file of files) {
        const nextIndex = updatedImages.length;
        try {
          updatedImages.push(await uploadToFirebaseStorage(file, selectedStore.id, nextIndex));
          uploadCount++;
        } catch (e) {
          console.error(`Fotoğraf yükleme hatası (${file.name}):`, e);
          alert(`${file.name} yüklenemedi: ${e.message}`);
        }
      }
      if (uploadCount > 0) {
        const updatedStore = { ...selectedStore, images: updatedImages };
        setSelectedStore(updatedStore);
        const result = await saveToFirebase(updatedStore);
        if (result.success) { setLastSaved(new Date()); setTimeout(() => setLastSaved(null), 3000); }
      }
    } catch (e) {
      console.error('Multi-upload error:', e);
      alert('Fotoğraf yükleme sırasında hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (event, imageIndex) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('Fotoğraf çok büyük! Maksimum 10MB.'); return; }
    if (!file.type.startsWith('image/')) { alert('Lütfen sadece fotoğraf dosyası seçin.'); return; }
    setUploading(true);
    try {
      await deleteStorageFile(selectedStore?.images?.[imageIndex] || '');
      const downloadURL = await uploadToFirebaseStorage(file, selectedStore.id, imageIndex);
      const newImages = [...(selectedStore?.images || ['', '', '', '', ''])];
      newImages[imageIndex] = downloadURL;
      updateStore('images', newImages);
    } catch (e) {
      console.error('Image upload error:', e);
      alert(`Fotoğraf yüklenemedi: ${e.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleImageDelete = async (imageIndex) => {
    if (!selectedStore?.images?.[imageIndex]) return;
    try {
      await deleteStorageFile(selectedStore.images[imageIndex]);
      const newImages = [...(selectedStore?.images || ['', '', '', '', ''])];
      newImages[imageIndex] = '';
      updateStore('images', newImages);
      if (currentImageIndex === imageIndex) {
        const next = newImages.findIndex(img => img?.trim());
        setCurrentImageIndex(next >= 0 ? next : 0);
      }
    } catch (e) {
      console.error('Image delete error:', e);
    }
  };

  const saveToFirebase = async (storeData) => {
    setSaving(true);
    try {
      if (!auth.currentUser) await signInAnonymously(auth);
      const cleanData = {
        name: String(storeData.name || '').trim(),
        address: String(storeData.address || '').trim(),
        location: String(storeData.location || '').trim(),
        size: String(storeData.size || '').trim(),
        images: (storeData.images || []).map(img => {
          if (!img || typeof img !== 'string') return '';
          return (img.includes('firebasestorage.googleapis.com') || img.startsWith('data:image/')) ? img : '';
        }).filter((img, i, arr) => img || i < arr.findLastIndex(x => x) + 1),
        competitorBrands: (storeData.competitorBrands || []).filter(b => b?.trim()).map(b => String(b).trim()).slice(0, 10),
        notes: String(storeData.notes || '').trim().slice(0, 1000),
        lastUpdated: new Date().toISOString(),
        savedAt: new Date().toLocaleString('tr-TR'),
        version: '2.0',
      };
      await setDoc(doc(db, 'stores', storeData.id), cleanData);
      return { success: true };
    } catch (e) {
      console.error('Firebase kaydetme hatası:', e);
      return { success: false, error: 'Kaydetme hatası' };
    } finally {
      setSaving(false);
    }
  };

  const handleStoreSelection = (storeId) => {
    if (!storeId) return;
    setSelectedStoreName(storeId);
    const store = stores.find(s => s.id === storeId);
    if (!store) return;
    setSelectedStore({
      ...store,
      images: store.images || ['', '', '', '', ''],
      competitorBrands: store.competitorBrands || ['', '', '', '', '', '', '', '', '', ''],
      notes: store.notes || '',
      size: store.size || '',
    });
    setCurrentImageIndex(0);
    setSidebarOpen(false);
    setCurrentView('management');
  };

  const updateStore = (field, value) => setSelectedStore(prev => ({ ...prev, [field]: value }));

  const updateCompetitorBrand = (index, value) => {
    const brands = [...(selectedStore?.competitorBrands || ['', '', '', '', '', '', '', '', '', ''])];
    brands[index] = value;
    updateStore('competitorBrands', brands);
  };

  const getValidImageIndexes = (images) =>
    (images || []).map((img, i) => (img?.trim() ? i : null)).filter(i => i !== null);

  const nextImage = () => {
    const valid = getValidImageIndexes(selectedStore?.images);
    if (valid.length <= 1) return;
    const cur = valid.indexOf(currentImageIndex);
    setCurrentImageIndex(valid[(cur + 1) % valid.length]);
  };

  const prevImage = () => {
    const valid = getValidImageIndexes(selectedStore?.images);
    if (valid.length <= 1) return;
    const cur = valid.indexOf(currentImageIndex);
    setCurrentImageIndex(valid[(cur - 1 + valid.length) % valid.length]);
  };

  const handleSaveStore = async () => {
    if (!selectedStore) return;
    const result = await saveToFirebase(selectedStore);
    if (result.success) { setLastSaved(new Date()); setTimeout(() => setLastSaved(null), 2000); }
  };

  const handleDeleteStore = async (storeId) => {
    if (!window.confirm('Bu mağazayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) return;
    const store = stores.find(s => s.id === storeId);
    try {
      for (const imgUrl of (store?.images || [])) {
        if (imgUrl?.includes('firebasestorage.googleapis.com')) {
          try {
            const decodedPath = decodeURIComponent(imgUrl.split('/o/')[1].split('?')[0]);
            await deleteObject(ref(storage, decodedPath));
          } catch { /* ignore */ }
        }
      }
      await deleteDoc(doc(db, 'stores', storeId));
      if (selectedStore?.id === storeId) { setSelectedStore(null); setCurrentView('dashboard'); }
    } catch (e) {
      console.error('Mağaza silinemedi:', e);
      alert('Mağaza silinirken hata oluştu.');
    }
  };

  const handleDeleteRenovation = async (renovationId) => {
    if (!window.confirm('Bu tadilat talebini silmek istediğinizden emin misiniz?')) return;
    const renovation = renovations.find(r => r.id === renovationId);
    try {
      for (const url of (renovation?.imageUrls || (renovation?.imageUrl ? [renovation.imageUrl] : []))) {
        if (url?.includes('firebasestorage.googleapis.com')) {
          try {
            const decodedPath = decodeURIComponent(url.split('/o/')[1].split('?')[0]);
            await deleteObject(ref(storage, decodedPath));
          } catch { /* ignore */ }
        }
      }
      await deleteDoc(doc(db, 'renovations', renovationId));
    } catch (e) {
      console.error('Tadilat silinemedi:', e);
      alert('Tadilat silinirken hata oluştu.');
    }
  };

  const getFilteredStores = () =>
    stores.filter(s => {
      const matchSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || s.address?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch && (filterLocation === 'all' || s.location === filterLocation);
    });

  const getUniqueLocations = () => [...new Set(stores.map(s => s.location).filter(Boolean))];

  const getFilteredRenovations = () => {
    const storeById = Object.fromEntries(stores.map(s => [s.id, s]));
    return renovations.filter(r => {
      const store = storeById[r.storeId];
      const matchSearch = r.storeName?.toLowerCase().includes(renovationSearch.toLowerCase()) ||
        r.aciklama?.toLowerCase().includes(renovationSearch.toLowerCase());
      const matchLocation = renovationFilterLocation === 'all' || store?.location === renovationFilterLocation;
      return matchSearch && matchLocation;
    });
  };

  const handleAddStore = async () => {
    if (!newStore.name.trim()) return;
    setAddingSaving(true);
    try {
      const id = newStore.name.trim().replace(/\s+/g, '').replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ]/g, '');
      const storeDoc = {
        name: newStore.name.trim(),
        address: newStore.address.trim(),
        location: newStore.location.trim(),
        images: ['', '', '', '', ''],
        competitorBrands: ['', '', '', '', '', '', '', '', '', ''],
        notes: '',
        size: '',
      };
      await setDoc(doc(db, 'stores', id), storeDoc);
      setNewStore({ name: '', address: '', location: '' });
      setCurrentView('dashboard');
    } catch (e) {
      console.error('Mağaza eklenemedi:', e);
    } finally {
      setAddingSaving(false);
    }
  };

  const getAllCompetitors = () => {
    const map = {};
    stores.forEach(store => {
      (store.competitorBrands || []).filter(b => b.trim()).forEach(brand => {
        const key = brand.toLowerCase();
        if (!map[key]) map[key] = { name: brand, count: 0, stores: [] };
        map[key].count++;
        map[key].stores.push(store.name);
      });
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md bg-white rounded-xl shadow-lg p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Firebase Bağlantı Hatası</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out min-h-screen`}>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">🏪 Vitrin+</h1>
          <p className="text-sm text-gray-600 mt-1">Mağaza Yönetim Sistemi</p>
        </div>
        <div className="p-4 border-b border-gray-200">
          <nav className="space-y-1">
            {[
              { key: 'dashboard', label: '📊 Dashboard' },
              { key: 'management', label: '🏪 Mağaza Bilgileri' },
              { key: 'brands', label: '📊 Rakip İstatistikleri' },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => { setCurrentView(key); setSidebarOpen(false); }}
                className={`w-full text-left p-3 rounded-lg transition-colors ${currentView === key ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
                {label}
              </button>
            ))}

            {/* Hiyerarşik: Tadilatlar */}
            <div>
              <button
                onClick={() => { setCurrentView('renovations-list'); setSidebarOpen(false); }}
                className={`w-full text-left p-3 rounded-lg transition-colors ${currentView.startsWith('renovations') ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                🔨 Mağaza Tadilatları
              </button>
              {currentView.startsWith('renovations') && (
                <div className="ml-3 mt-1 space-y-1 border-l-2 border-blue-200 pl-3">
                  <button
                    onClick={() => { setCurrentView('renovations-list'); setSidebarOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${currentView === 'renovations-list' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    📋 Talepler
                  </button>
                  <button
                    onClick={() => { setCurrentView('renovations-new'); setSidebarOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${currentView === 'renovations-new' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    ➕ Yeni Talep
                  </button>
                </div>
              )}
            </div>

            <button onClick={() => { setCurrentView('add-store'); setSidebarOpen(false); }}
              className={`w-full text-left p-3 rounded-lg transition-colors ${currentView === 'add-store' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
              ➕ Yeni Mağaza Ekle
            </button>
          </nav>
        </div>
      </div>

      <div className="flex-1 lg:ml-0">
        <div className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex-1 flex justify-center items-center gap-3">
              <div className="text-3xl font-bold text-blue-600">🏪</div>
            </div>
            <div className="lg:hidden w-10" />
          </div>
        </div>

        <div className="p-6 max-w-6xl mx-auto pb-20">
          {currentView === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Dashboard</h2>
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mağaza Ara</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input type="text" placeholder="Mağaza adı veya adres ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Şehir Filtresi</label>
                    <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="all">Tüm Şehirler</option>
                      {getUniqueLocations().map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
                {[
                  { color: 'blue', icon: '🏪', label: 'Toplam Mağaza', value: stores.length },
                  { color: 'green', icon: '📝', label: 'Düzenlenen', value: stores.filter(s => s.images?.some(img => img?.trim())).length },
                  { color: 'orange', icon: '🏙️', label: 'Şehir Sayısı', value: getUniqueLocations().length },
                  { color: 'purple', icon: '🎯', label: 'Rakip Markalar', value: stores.reduce((t, s) => t + (s.competitorBrands?.filter(b => b.trim()).length || 0), 0) },
                ].map(({ color, icon, label, value }) => (
                  <div key={label} className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center">
                      <div className={`p-3 bg-${color}-100 rounded-lg`}><span className="text-2xl">{icon}</span></div>
                      <div className="ml-4"><p className="text-sm text-gray-600">{label}</p><p className="text-2xl font-bold text-gray-800">{value}</p></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredStores().map((store) => (
                  <StoreCard
                    key={store.id}
                    store={store}
                    onEdit={() => handleStoreSelection(store.id)}
                    onDelete={() => handleDeleteStore(store.id)}
                    setStores={setStores}
                    saveStore={saveToFirebase}
                  />
                ))}
              </div>
              {getFilteredStores().length === 0 && (
                <div className="text-center py-12"><p className="text-gray-500 text-lg">Arama kriterlerinize uygun mağaza bulunamadı.</p></div>
              )}
            </div>
          )}

          {currentView === 'brands' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Rakip İstatistikleri</h2>
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {[
                    { from: 'red-500', to: 'red-600', textColor: 'red-100', icon: '🎯', label: 'Toplam Rakip Marka', value: getAllCompetitors().length },
                    { from: 'orange-500', to: 'orange-600', textColor: 'orange-100', icon: '📍', label: 'En Yaygın Rakip', value: getAllCompetitors()[0]?.name || 'Henüz Yok' },
                    { from: 'purple-500', to: 'purple-600', textColor: 'purple-100', icon: '🏪', label: 'Maks. Lokasyon', value: getAllCompetitors()[0]?.count || 0 },
                  ].map(({ from, to, textColor, icon, label, value }) => (
                    <div key={label} className={`bg-gradient-to-r from-${from} to-${to} rounded-xl p-6 text-white`}>
                      <div className="flex items-center">
                        <div className="p-3 bg-white bg-opacity-20 rounded-lg"><span className="text-2xl">{icon}</span></div>
                        <div className="ml-4"><p className={`text-${textColor}`}>{label}</p><p className="text-3xl font-bold">{value}</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {getAllCompetitors().length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800">Rakip Marka Listesi</h3>
                    <p className="text-sm text-gray-600 mt-1">Lokasyon sayısına göre sıralanmıştır</p>
                  </div>
                  <div className="block sm:hidden divide-y divide-gray-200">
                    {getAllCompetitors().map((competitor, index) => (
                      <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : index === 2 ? 'bg-yellow-500' : 'bg-gray-400'}`}>{index + 1}</span>
                            <div className="font-medium text-gray-900 text-sm">{competitor.name}</div>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${competitor.count >= 5 ? 'bg-red-100 text-red-800' : competitor.count >= 3 ? 'bg-orange-100 text-orange-800' : competitor.count >= 2 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                            {competitor.count} lokasyon
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {competitor.stores.slice(0, 2).map((store, idx) => (
                              <span key={idx} className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">{store.length > 15 ? store.substring(0, 15) + '...' : store}</span>
                            ))}
                            {competitor.stores.length > 2 && <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">+{competitor.stores.length - 2} daha</span>}
                          </div>
                          {competitor.stores.length > 2 && (
                            <details className="mt-1 relative z-20">
                              <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800 py-1">Tümünü göster</summary>
                              <div className="mt-1 flex flex-wrap gap-1 bg-white p-2 rounded border shadow-lg">
                                {competitor.stores.map((store, idx) => <span key={idx} className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">{store}</span>)}
                              </div>
                            </details>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          {['#', 'Marka Adı', 'Kaç Lokasyon?', 'Mağazalar'].map(h => (
                            <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getAllCompetitors().map((competitor, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : index === 2 ? 'bg-yellow-500' : 'bg-gray-400'}`}>{index + 1}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{competitor.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${competitor.count >= 5 ? 'bg-red-100 text-red-800' : competitor.count >= 3 ? 'bg-orange-100 text-orange-800' : competitor.count >= 2 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                                {competitor.count} lokasyon
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="max-w-xs flex flex-wrap gap-1">
                                {competitor.stores.slice(0, 3).map((store, idx) => <span key={idx} className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">{store}</span>)}
                                {competitor.stores.length > 3 && <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">+{competitor.stores.length - 3} daha</span>}
                              </div>
                              {competitor.stores.length > 3 && (
                                <details className="mt-2 text-xs text-gray-500 cursor-pointer">
                                  <summary className="hover:text-gray-700">Tümünü göster</summary>
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {competitor.stores.map((store, idx) => <span key={idx} className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">{store}</span>)}
                                  </div>
                                </details>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Henüz Rakip Marka Verisi Yok</h3>
                  <p className="text-gray-600 mb-4">Mağaza bilgileri bölümünden rakip marka ekleyerek bu raporu doldurun.</p>
                  <button onClick={() => setCurrentView('management')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Mağaza Bilgilerine Git
                  </button>
                </div>
              )}
            </div>
          )}

          {currentView === 'renovations-list' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">📋 Tadilat Talepleri</h2>

              {/* Arama ve filtre */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Talep Ara</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        placeholder="Mağaza adı veya açıklama ara..."
                        value={renovationSearch}
                        onChange={(e) => setRenovationSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Şehir Filtresi</label>
                    <select
                      value={renovationFilterLocation}
                      onChange={(e) => setRenovationFilterLocation(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Tüm Şehirler</option>
                      {getUniqueLocations().map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* İstatistik kartları */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
                {[
                  { color: 'blue', icon: '🔨', label: 'Toplam Talep', value: renovations.length },
                  { color: 'orange', icon: '📅', label: 'Bu Ay', value: renovations.filter(r => { const d = new Date(r.talepTarihi); const now = new Date(); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length },
                  { color: 'green', icon: '📸', label: 'Fotoğraflı', value: renovations.filter(r => r.imageUrl).length },
                  { color: 'purple', icon: '🏙️', label: 'Şehir Sayısı', value: new Set(renovations.map(r => stores.find(s => s.id === r.storeId)?.location).filter(Boolean)).size },
                ].map(({ color, icon, label, value }) => (
                  <div key={label} className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center">
                      <div className={`p-3 bg-${color}-100 rounded-lg`}><span className="text-2xl">{icon}</span></div>
                      <div className="ml-4"><p className="text-sm text-gray-600">{label}</p><p className="text-2xl font-bold text-gray-800">{value}</p></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Kart grid */}
              {renovations.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <div className="text-5xl mb-4">🔨</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Henüz Tadilat Talebi Yok</h3>
                  <p className="text-gray-500 mb-4">İlk tadilat talebini oluşturmak için aşağıdaki butona tıklayın.</p>
                  <button
                    onClick={() => setCurrentView('renovations-new')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Yeni Talep Oluştur
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getFilteredRenovations().map((r) => (
                      <RenovationCard key={r.id} renovation={r} onDelete={() => handleDeleteRenovation(r.id)} />
                    ))}
                  </div>
                  {getFilteredRenovations().length === 0 && (
                    <div className="text-center py-12"><p className="text-gray-500 text-lg">Arama kriterlerinize uygun talep bulunamadı.</p></div>
                  )}
                </>
              )}
            </div>
          )}

          {currentView === 'renovations-new' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">➕ Yeni Tadilat Talebi</h2>
              <div className="bg-white rounded-xl shadow-sm p-6 max-w-3xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mağaza Seç *</label>
                    <select
                      value={renovationForm.storeId}
                      onChange={(e) => setRenovationForm(prev => ({ ...prev, storeId: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Mağaza seçiniz</option>
                      {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Talep Tarihi *</label>
                    <input
                      type="date"
                      value={renovationForm.talepTarihi}
                      onChange={(e) => setRenovationForm(prev => ({ ...prev, talepTarihi: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tadilat Talep Açıklaması *</label>
                    <textarea
                      value={renovationForm.aciklama}
                      onChange={(e) => setRenovationForm(prev => ({ ...prev, aciklama: e.target.value }))}
                      placeholder="Tadilat talebini detaylı açıklayınız..."
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Fotoğraf upload */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fotoğraf (İsteğe Bağlı)</label>
                    <label className={`drag-zone flex flex-col items-center justify-center h-36 rounded-xl cursor-pointer ${uploadingRenovationImage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        disabled={uploadingRenovationImage}
                        onChange={(e) => { if (e.target.files?.length) handleRenovationImageSelect(Array.from(e.target.files)); e.target.value = ''; }}
                      />
                      {uploadingRenovationImage ? (
                        <>
                          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
                          <span className="text-sm text-gray-500">Yükleniyor...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                          </svg>
                          <span className="text-sm text-gray-500">Fotoğraf seç veya sürükle bırak</span>
                          <span className="text-xs text-gray-400 mt-1">Ctrl ile çoklu seçim yapabilirsiniz</span>
                        </>
                      )}
                    </label>
                    {renovationForm.imageUrls.length > 0 && (
                      <div className="mt-3 grid grid-cols-4 gap-2">
                        {renovationForm.imageUrls.map((url, i) => (
                          <div key={i} className="relative group">
                            <img src={url} className="w-full h-16 object-cover rounded-lg" alt={`Önizleme ${i + 1}`} />
                            <button
                              type="button"
                              onClick={() => setRenovationForm(prev => ({ ...prev, imageUrls: prev.imageUrls.filter((_, idx) => idx !== i) }))}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            >×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleSaveRenovation}
                    disabled={renovationSaving || !renovationForm.storeId || !renovationForm.talepTarihi || !renovationForm.aciklama.trim()}
                    className="w-full h-[60px] flex cursor-pointer shadow-lg transition-all duration-200 hover:shadow-xl disabled:cursor-not-allowed rounded-lg overflow-hidden"
                  >
                    <div className={`w-[60px] h-full flex items-center justify-center ${renovationSaving ? 'bg-gray-600' : 'bg-gray-800'}`}>
                      {renovationSaving
                        ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <Save size={20} className="text-white" />
                      }
                    </div>
                    <div className={`flex-1 h-full flex items-center justify-center font-semibold text-sm ${renovationSaving ? 'bg-gray-300 text-gray-600' : 'bg-gray-100 text-gray-800'}`}>
                      {renovationSaving ? 'KAYDEDİLİYOR' : 'TALEP GÖNDER'}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentView === 'add-store' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">➕ Yeni Mağaza Ekle</h2>
              <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mağaza Adı *</label>
                    <input
                      type="text"
                      value={newStore.name}
                      onChange={(e) => setNewStore(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="örn. Nişantaşı"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Şehir</label>
                    <input
                      type="text"
                      value={newStore.location}
                      onChange={(e) => setNewStore(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="örn. İstanbul"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Adres</label>
                    <textarea
                      value={newStore.address}
                      onChange={(e) => setNewStore(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Tam adres"
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                  <button
                    onClick={handleAddStore}
                    disabled={addingSaving || !newStore.name.trim()}
                    className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingSaving ? 'Kaydediliyor...' : 'Mağaza Ekle'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentView === 'management' && (
            <div>
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mağaza Seç</label>
                    <select value={selectedStoreName} onChange={(e) => handleStoreSelection(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">Lütfen Güncelleme Yapılacak Mağazayı Seçiniz</option>
                      {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alan (m²)</label>
                    <input type="number" value={selectedStore?.size || ''} onChange={(e) => updateStore('size', parseInt(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Mağaza Fotoğrafları</h3>
                  {selectedStore && (
                    <div className="mb-6">
                      <DragDropUpload onFilesUpload={handleMultipleImageUpload}
                        maxFiles={20}
                        uploading={uploading} />
                    </div>
                  )}
                  {Object.keys(uploadProgress).length > 0 && (
                    <div className="mb-6 space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">📤 Yükleme Durumu:</h4>
                      {Object.entries(uploadProgress).map(([key, { progress, fileName }]) => (
                        <ProgressBar key={key} progress={progress} fileName={fileName} />
                      ))}
                    </div>
                  )}
                  <div className="relative mb-4">
                    <div className="relative flex-shrink-0 h-[260px] w-full bg-gray-100 rounded-lg overflow-hidden group">
                      {selectedStore?.images?.[currentImageIndex]?.trim() ? (
                        <>
                          <img src={selectedStore.images[currentImageIndex]} alt={`${selectedStore?.name} - ${currentImageIndex + 1}`}
                            className="w-full h-full object-cover cursor-pointer" onClick={() => setShowModal(true)} />
                          {(selectedStore.images || []).filter(img => img?.trim()).length > 1 && (
                            <>
                              <button onClick={prevImage} className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 sm:p-1.5 rounded-full shadow-lg transition-all z-10">
                                <ChevronLeft size={20} className="sm:w-4 sm:h-4" />
                              </button>
                              <button onClick={nextImage} className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 sm:p-1.5 rounded-full shadow-lg transition-all z-10">
                                <ChevronRight size={20} className="sm:w-4 sm:h-4" />
                              </button>
                              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                                {getValidImageIndexes(selectedStore.images).map(index => (
                                  <button key={index} onClick={() => setCurrentImageIndex(index)}
                                    className={`w-2 h-2 rounded-full transition-all ${currentImageIndex === index ? 'bg-blue-500' : 'bg-white bg-opacity-70 hover:bg-opacity-100'}`} />
                                ))}
                              </div>
                            </>
                          )}
                          <button onClick={() => setShowModal(true)} className="absolute top-2 right-2 bg-white bg-opacity-80 hover:bg-opacity-100 p-1.5 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 z-10" title="Fotoğrafı büyüt">
                            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </button>
                          <button onClick={() => handleImageDelete(currentImageIndex)} className="absolute top-2 left-2 bg-white bg-opacity-80 hover:bg-opacity-100 p-1.5 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 z-10" title="Fotoğrafı sil">
                            <Trash className="w-4 h-4 text-red-500" />
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <div className="text-center text-gray-500">
                            <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21,15 16,10 5,21" />
                            </svg>
                            <span className="text-lg">Henüz Fotoğraf Yüklenmedi</span>
                            <p className="text-sm mt-2">Yukarıdaki alana sürükle bırak</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setShowModal(false)}>
                      <div className="relative max-w-5xl max-h-full w-full">
                        {selectedStore?.images?.[currentImageIndex]?.trim()
                          ? <img src={selectedStore.images[currentImageIndex]} alt={`${selectedStore?.name} - Büyük Görünüm`} className="w-auto h-[500px] object-contain mx-auto rounded-lg" onClick={(e) => e.stopPropagation()} />
                          : <div className="bg-white rounded-lg p-8 sm:p-12 max-w-md mx-auto text-center text-gray-500">Fotoğraf Bulunamadı</div>
                        }
                        <button onClick={() => setShowModal(false)} className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-white bg-opacity-90 hover:bg-opacity-100 p-3 sm:p-2 rounded-full shadow-lg transition-all">
                          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        {getValidImageIndexes(selectedStore?.images).length > 1 && selectedStore?.images?.[currentImageIndex]?.trim() && (
                          <>
                            <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 p-3 rounded-full shadow-lg transition-all">
                              <ChevronLeft size={24} className="text-gray-700" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 p-3 rounded-full shadow-lg transition-all">
                              <ChevronRight size={24} className="text-gray-700" />
                            </button>
                            <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3">
                              {getValidImageIndexes(selectedStore.images).map(index => (
                                <button key={index} onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                                  className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all ${currentImageIndex === index ? 'bg-blue-500 shadow-md' : 'bg-white bg-opacity-70 hover:bg-opacity-90'}`} />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mağaza Adresi</label>
                    <textarea value={selectedStore?.address || ''} readOnly rows={3} className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 text-sm" />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Marka Yönetimi</h3>
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-700 mb-3">Rakip Markalar</h4>
                    <div className="space-y-3">
                      {Array.from({ length: 10 }, (_, index) => (
                        <div key={index} className="flex items-center gap-2 sm:gap-3">
                          <span className="text-sm text-gray-600 w-6 sm:w-8 flex-shrink-0">{index + 1}.</span>
                          <input type="text" value={selectedStore?.competitorBrands?.[index] || ''} onChange={(e) => updateCompetitorBrand(index, e.target.value)}
                            className={`flex-1 p-2 sm:p-3 border rounded-lg focus:ring-2 focus:border-transparent text-sm sm:text-base transition-all ${index === 0 ? 'border-blue-300 focus:ring-blue-500' : 'border-gray-300 focus:ring-red-500'}`} />
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-red-50 rounded-lg">
                      <h5 className="font-medium text-red-800 mb-2">Rakip Markalar:</h5>
                      <div className="flex flex-wrap gap-2">
                        {(selectedStore?.competitorBrands || []).filter(b => b.trim()).length > 0
                          ? (selectedStore?.competitorBrands || []).filter(b => b.trim()).map((brand, i) => (
                              <span key={i} className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full">{brand}</span>
                            ))
                          : <span className="text-sm text-gray-500">Henüz Rakip Marka Eklenmemiş</span>
                        }
                      </div>
                    </div>
                  </div>
                  <div className="border-t pt-6">
                    <h4 className="text-md font-medium text-gray-700 mb-3">Notlar</h4>
                    <textarea value={selectedStore?.notes || ''} onChange={(e) => updateStore('notes', e.target.value)}
                      placeholder="Lokasyonunuzda mağaza satışlarınıza olumlu veya olumsuz etkisi olduğunu düşündüğünüz notlarınızı yazınız."
                      rows={6} className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all" />
                    <p className="text-xs text-gray-500 mt-2">*Bu Alana Yazılan Bilgiler Herkese Açık Şekilde Görüntülenmektedir.</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
                {selectedStore ? (
                  <div className="flex gap-3">
                    <button onClick={handleSaveStore} disabled={saving}
                      className="flex-1 h-15 flex cursor-pointer shadow-lg transition-all duration-200 hover:shadow-xl disabled:cursor-not-allowed"
                      style={{ height: '60px' }}
                      onMouseEnter={(e) => { if (!saving) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                      <div className={`h-full flex items-center justify-center rounded-l-lg ${saving ? 'bg-gray-600' : lastSaved ? 'bg-green-700' : 'bg-gray-800'}`} style={{ width: '60px' }}>
                        {saving
                          ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          : lastSaved
                            ? <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            : <Save size={20} className="text-white" />
                        }
                      </div>
                      <div className={`flex-1 h-full flex items-center justify-center rounded-r-lg font-semibold text-sm ${saving ? 'bg-gray-300 text-gray-600' : lastSaved ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {saving ? 'KAYDEDİLİYOR' : lastSaved ? 'KAYDEDİLDİ' : 'KAYDET'}
                      </div>
                    </button>
                    <button
                      onClick={() => handleDeleteStore(selectedStore.id)}
                      className="flex items-center gap-2 px-5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition-colors shadow-lg"
                      style={{ height: '60px' }}
                    >
                      <Trash size={18} />
                      SİL
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4"><p className="text-gray-500">Düzenlemek İçin Bir Mağaza Seçiniz</p></div>
                )}
                {lastSaved && <p className="text-xs text-gray-500 text-center mt-3">Son kayıt: {lastSaved.toLocaleTimeString('tr-TR')}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
