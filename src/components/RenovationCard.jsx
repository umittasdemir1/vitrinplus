import { useState } from 'react';
import { Trash } from './Icons';
import { TriangleAlert } from 'lucide-react';

export default function RenovationCard({ renovation, onEdit, onDelete }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showDescModal, setShowDescModal] = useState(false);

  const images = renovation.imageUrls?.length
    ? renovation.imageUrls
    : renovation.imageUrl
      ? [renovation.imageUrl]
      : [];

  const currentImage = images[activeIndex];

  const items = (Array.isArray(renovation.aciklama)
    ? renovation.aciklama
        .map(item => typeof item === 'string' ? { text: item, status: 'active', date: '', priority: false } : item)
        .filter(item => item.text)
    : renovation.aciklama
      ? [{ text: renovation.aciklama, status: 'active', date: '', priority: false }]
      : []
  ).sort((a, b) => (b.priority ? 1 : 0) - (a.priority ? 1 : 0));

  const statusBadge = (status) => {
    if (status === 'completed') return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex-shrink-0">Tamamlandı</span>;
    if (status === 'cancelled') return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full flex-shrink-0">İptal</span>;
    return null;
  };

  const MAX_VISIBLE = 2;
  const visibleItems = items.slice(0, MAX_VISIBLE);
  const hasOverflow = items.length > MAX_VISIBLE;

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md flex flex-col">
        {/* Fotoğraf alanı — rounded-lg gives bottom corners, parent rounded-xl+overflow-hidden gives top corners */}
        <div
          className="relative flex-shrink-0 h-[260px] w-full bg-gray-200 rounded-lg overflow-hidden group cursor-pointer"
          onClick={() => currentImage && setShowPhotoModal(true)}
        >
          {currentImage ? (
            <>
              <img
                src={currentImage}
                alt={`${renovation.storeName} tadilat`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all" />

              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveIndex(i => (i - 1 + images.length) % images.length); }}
                    className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 sm:p-1.5 rounded-full shadow-lg transition-all z-10"
                  >
                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="15,18 9,12 15,6" strokeWidth={2} /></svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveIndex(i => (i + 1) % images.length); }}
                    className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 sm:p-1.5 rounded-full shadow-lg transition-all z-10"
                  >
                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6" strokeWidth={2} /></svg>
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                    {images.map((_, i) => (
                      <button key={i} onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
                        className={`w-2 h-2 rounded-full transition-all ${i === activeIndex ? 'bg-blue-500' : 'bg-white bg-opacity-70'}`} />
                    ))}
                  </div>
                  <span className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-0.5 rounded-full">
                    {activeIndex + 1}/{images.length}
                  </span>
                </>
              )}

              {/* Büyüt butonu (hover) */}
              <button onClick={() => setShowPhotoModal(true)}
                className="absolute top-2 right-2 bg-white bg-opacity-80 hover:bg-opacity-100 p-1.5 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 z-10"
                title="Fotoğrafı büyüt">
                <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </button>
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

        {/* İçerik */}
        <div className="p-4 flex flex-col flex-1 justify-between">
          <div>
            {/* Başlık + konum */}
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-800 text-lg leading-tight">{renovation.storeName}</h3>
              <div className="flex flex-wrap gap-1 flex-shrink-0 ml-2 justify-end">
                {renovation.location && <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">{renovation.location}</span>}
                {renovation.bolgeYoneticisi && <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{renovation.bolgeYoneticisi}</span>}
              </div>
            </div>

            {/* Açıklama maddeleri */}
            {items.length > 0 && (
              <div className="mb-3">
                <ul className="space-y-1">
                  {visibleItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5 ${item.status === 'completed' ? 'bg-green-400' : item.status === 'cancelled' ? 'bg-red-400' : 'bg-blue-400'}`} />
                      <div className="flex-1 min-w-0 flex justify-between items-start gap-2">
                        <span className={`flex items-start gap-1 ${item.status === 'cancelled' ? 'line-through text-gray-400' : ''}`}>
                          {item.priority && <TriangleAlert size={13} strokeWidth={2} className="text-red-500 flex-shrink-0 mt-0.5" />}
                          {item.text}
                        </span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {statusBadge(item.status)}
                          {item.date && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">📅 {new Date(item.date).toLocaleDateString('tr-TR')}</span>}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                {hasOverflow && (
                  <button
                    onClick={() => setShowDescModal(true)}
                    className="mt-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Devamını gör
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Alt kısım */}
          <div className="mt-auto">
            <div className="flex gap-2 items-stretch">
              {/* İstatistik kutusu */}
              {items.length > 0 && (
                <div className="flex-1 flex items-center justify-around bg-gray-50 rounded-lg px-2 py-1.5 text-center border border-gray-100">
                  <div>
                    <div className="text-sm font-semibold text-gray-700">{items.length}</div>
                    <div className="text-[10px] text-gray-400 leading-tight">Toplam</div>
                  </div>
                  <div className="w-px h-6 bg-gray-200" />
                  <div>
                    <div className="text-sm font-semibold text-green-600">{items.filter(i => i.status === 'completed').length}</div>
                    <div className="text-[10px] text-gray-400 leading-tight">Tamam</div>
                  </div>
                  <div className="w-px h-6 bg-gray-200" />
                  <div>
                    <div className="text-sm font-semibold text-blue-500">{items.filter(i => i.status === 'active').length}</div>
                    <div className="text-[10px] text-gray-400 leading-tight">Bekliyor</div>
                  </div>
                  <div className="w-px h-6 bg-gray-200" />
                  <div>
                    <div className="text-sm font-semibold text-red-500">{items.filter(i => i.status === 'cancelled').length}</div>
                    <div className="text-[10px] text-gray-400 leading-tight">İptal</div>
                  </div>
                </div>
              )}
              {/* Butonlar */}
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => onEdit?.()}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Düzenle
                </button>
                {onDelete && (
                  <button
                    onClick={onDelete}
                    className="px-3 py-2 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white text-sm rounded-lg transition-colors"
                    title="Talebi Sil"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fotoğraf modal */}
      {showPhotoModal && currentImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={() => setShowPhotoModal(false)}
        >
          <div className="relative max-w-5xl max-h-full w-full">
            <img
              src={currentImage}
              alt={`${renovation.storeName} tadilat`}
              className="w-auto h-[500px] object-contain mx-auto rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            {images.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); setActiveIndex(i => (i - 1 + images.length) % images.length); }}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 p-3 rounded-full shadow-lg">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="15,18 9,12 15,6" strokeWidth={2} /></svg>
                </button>
                <button onClick={(e) => { e.stopPropagation(); setActiveIndex(i => (i + 1) % images.length); }}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 p-3 rounded-full shadow-lg">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6" strokeWidth={2} /></svg>
                </button>
                <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, i) => (
                    <button key={i} onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
                      className={`w-3 h-3 rounded-full transition-all ${i === activeIndex ? 'bg-blue-500 shadow-md' : 'bg-white bg-opacity-70'}`} />
                  ))}
                </div>
              </>
            )}
            <button
              onClick={() => setShowPhotoModal(false)}
              className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-white bg-opacity-90 hover:bg-opacity-100 p-3 sm:p-2 rounded-full shadow-lg"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Açıklama modal */}
      {showDescModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDescModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{renovation.storeName}</h3>
                {renovation.location && (
                  <span className="text-xs text-gray-400">{renovation.location}</span>
                )}
              </div>
              <button onClick={() => setShowDescModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ul className="space-y-2">
              {items.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className={`flex-shrink-0 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center mt-0.5 ${item.status === 'completed' ? 'bg-green-100 text-green-600' : item.status === 'cancelled' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-600'}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <span className={`flex items-start gap-1 text-sm leading-relaxed ${item.status === 'cancelled' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                      {item.priority && <TriangleAlert size={13} strokeWidth={2} className="text-red-500 flex-shrink-0 mt-0.5" />}
                      {item.text}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      {statusBadge(item.status)}
                      {item.date && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">📅 {new Date(item.date).toLocaleDateString('tr-TR')}</span>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
