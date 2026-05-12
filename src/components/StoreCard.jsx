import { useState } from 'react';
import { deleteObject, ref } from 'firebase/storage';
import { storage } from '../services/firebase';
import { ChevronLeft, ChevronRight, Trash } from './Icons';

export default function StoreCard({ store, onEdit, onDelete, setStores, saveStore }) {
  const images = store.images || ['', '', '', '', ''];
  const competitorCount = store.competitorBrands?.filter(b => b.trim()).length || 0;
  const hasData = !!(store.size || store.images?.some(img => img?.trim()) || store.competitorBrands?.some(b => b?.trim()));
  const [cardImageIndex, setCardImageIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const validIndexes = images.map((img, i) => (img && img.trim() ? i : null)).filter(i => i !== null);

  const prevCardImage = () => {
    if (validIndexes.length <= 1) return;
    const cur = validIndexes.indexOf(cardImageIndex);
    setCardImageIndex(validIndexes[(cur - 1 + validIndexes.length) % validIndexes.length]);
  };

  const nextCardImage = () => {
    if (validIndexes.length <= 1) return;
    const cur = validIndexes.indexOf(cardImageIndex);
    setCardImageIndex(validIndexes[(cur + 1) % validIndexes.length]);
  };

  const handleQuickImageDelete = async () => {
    if (!store.images?.[cardImageIndex]?.trim()) return;
    setDeleting(true);
    try {
      const updatedStore = { ...store, images: [...store.images] };
      if (updatedStore.images[cardImageIndex].includes('firebasestorage.googleapis.com')) {
        try {
          const url = updatedStore.images[cardImageIndex];
          const decodedPath = decodeURIComponent(url.split('/o/')[1].split('?')[0]);
          await deleteObject(ref(storage, decodedPath));
        } catch (e) {
          console.warn('Storage silme hatası:', e);
        }
      }
      updatedStore.images[cardImageIndex] = '';
      const result = await saveStore(updatedStore);
      if (result.success) {
        setStores(prev => {
          const next = [...prev];
          const idx = next.findIndex(s => s.id === store.id);
          if (idx >= 0) next[idx] = updatedStore;
          return next;
        });
        const nextValid = updatedStore.images.map((img, i) => (img?.trim() ? i : null)).filter(i => i !== null);
        setCardImageIndex(nextValid[0] ?? 0);
      }
    } catch (e) {
      console.error('Quick image delete error:', e);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md min-h-[620px] flex flex-col">
        <div className="relative flex-shrink-0 h-[260px] w-full bg-gray-100 rounded-lg overflow-hidden group">
          {images[cardImageIndex]?.trim() ? (
            <>
              <img
                src={images[cardImageIndex]}
                alt={`${store.name} Fotoğrafı ${cardImageIndex + 1}`}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setShowModal(true)}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gray-200"><div class="text-center text-gray-500"><svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" /></svg><span class="text-sm">Fotoğraf Hatası</span></div></div>`;
                }}
              />
              {validIndexes.length > 1 && (
                <>
                  <button onClick={prevCardImage} className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 sm:p-1.5 rounded-full shadow-lg transition-all z-10">
                    <ChevronLeft size={20} className="sm:w-4 sm:h-4" />
                  </button>
                  <button onClick={nextCardImage} className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 sm:p-1.5 rounded-full shadow-lg transition-all z-10">
                    <ChevronRight size={20} className="sm:w-4 sm:h-4" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                    {validIndexes.map(index => (
                      <button key={index} onClick={() => setCardImageIndex(index)} className={`w-2 h-2 rounded-full transition-all ${cardImageIndex === index ? 'bg-blue-500' : 'bg-white bg-opacity-70 hover:bg-opacity-100'}`} />
                    ))}
                  </div>
                </>
              )}
              <button onClick={() => setShowModal(true)} className="absolute top-2 right-2 bg-white bg-opacity-80 hover:bg-opacity-100 p-1.5 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 z-10" title="Fotoğrafı büyüt">
                <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </button>
              {store.images?.[cardImageIndex]?.trim() && (
                <button onClick={(e) => { e.stopPropagation(); handleQuickImageDelete(); }} disabled={deleting} className="absolute top-2 left-2 bg-white bg-opacity-80 hover:bg-opacity-100 p-1.5 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 z-10" title="Fotoğrafı sil">
                  {deleting
                    ? <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    : <Trash className="w-4 h-4 text-red-500" />
                  }
                </button>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <div className="text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21,15 16,10 5,21" />
                </svg>
                <span className="text-sm">Henüz Fotoğraf Yüklenmedi</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-1 justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-800 text-lg">{store.name}</h3>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">{store.location}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div><p className="text-xs text-gray-500">Alan</p><p className="font-medium">{store.size || '-'} m²</p></div>
              <div><p className="text-xs text-gray-500">Rakip Markalar</p><p className="font-medium">{competitorCount || 0} marka</p></div>
            </div>
            {competitorCount > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">Rakip Markalar:</p>
                <div className="flex flex-wrap gap-1 overflow-visible">
                  {store.competitorBrands?.filter(b => b.trim()).map((brand, i) => (
                    <span key={i} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded flex-shrink-0">
                      {brand.length > 12 ? brand.substring(0, 12) + '...' : brand}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-auto">
            {store.notes?.trim() && (
              <div className="mb-2">
                <button onClick={() => setShowNotesModal(true)} className="w-full text-left hover:opacity-70 transition-opacity">
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-xs text-yellow-800">📝 Notu Görüntüle</span>
                    <svg className="w-3 h-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </div>
            )}
            <div className="flex justify-between items-center text-xs text-gray-500 border-t pt-2 mb-2">
              {hasData ? 'Son güncelleme' : 'Henüz düzenlenmemiş'}
              {hasData && <span>{store.lastUpdated ? new Date(store.lastUpdated).toLocaleDateString('tr-TR') : ''}</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => onEdit(store.id)} className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                Düzenle
              </button>
              {onDelete && (
                <button onClick={onDelete} className="px-3 py-2 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white text-sm rounded-lg transition-colors" title="Mağazayı Sil">
                  <Trash className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setShowModal(false)}>
          <div className="relative max-w-5xl max-h-full w-full">
            {images[cardImageIndex]?.trim()
              ? <img src={images[cardImageIndex]} alt={`${store.name} - Büyük Görünüm`} className="w-auto h-[500px] object-contain mx-auto rounded-lg" onClick={(e) => e.stopPropagation()} />
              : <div className="bg-white rounded-lg p-8 sm:p-12 max-w-md mx-auto"><div className="text-center text-gray-500"><svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21,15 16,10 5,21" /></svg><span className="text-base sm:text-lg">Fotoğraf Bulunamadı</span></div></div>
            }
            <button onClick={() => setShowModal(false)} className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-white bg-opacity-90 hover:bg-opacity-100 p-3 sm:p-2 rounded-full shadow-lg transition-all">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            {validIndexes.length > 1 && images[cardImageIndex]?.trim() && (
              <>
                <button onClick={(e) => { e.stopPropagation(); prevCardImage(); }} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 p-3 rounded-full shadow-lg transition-all">
                  <ChevronLeft size={24} className="text-gray-700" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); nextCardImage(); }} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 p-3 rounded-full shadow-lg transition-all">
                  <ChevronRight size={24} className="text-gray-700" />
                </button>
                <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3">
                  {validIndexes.map(index => (
                    <button key={index} onClick={(e) => { e.stopPropagation(); setCardImageIndex(index); }} className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all ${cardImageIndex === index ? 'bg-blue-500 shadow-md' : 'bg-white bg-opacity-70 hover:bg-opacity-90'}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={() => setShowNotesModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-yellow-50 border-b border-yellow-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{store.name} - Notlar</h3>
                  <p className="text-sm text-gray-600">{store.location}</p>
                </div>
              </div>
              <button onClick={() => setShowNotesModal(false)} className="p-2 hover:bg-yellow-100 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">{store.notes || 'Not bulunamadı.'}</div>
            </div>
            <div className="bg-gray-50 border-t p-4 flex justify-between items-center">
              <div className="text-xs text-gray-500">
                Son güncelleme: {store.lastUpdated ? new Date(store.lastUpdated).toLocaleString('tr-TR') : 'Bilinmiyor'}
              </div>
              <button onClick={() => setShowNotesModal(false)} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">Kapat</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
