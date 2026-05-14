import { useState } from 'react';

export default function RenovationCard({ renovation, onDelete }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showDescModal, setShowDescModal] = useState(false);

  const images = renovation.imageUrls?.length
    ? renovation.imageUrls
    : renovation.imageUrl
      ? [renovation.imageUrl]
      : [];

  const currentImage = images[activeIndex];

  const items = Array.isArray(renovation.aciklama)
    ? renovation.aciklama.filter(Boolean)
    : renovation.aciklama
      ? [renovation.aciklama]
      : [];

  const MAX_VISIBLE = 2;
  const hasMore = items.length > MAX_VISIBLE;

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col" style={{ minHeight: 0 }}>
        {/* Fotoğraf alanı — sabit yükseklik */}
        <div
          className="relative h-[200px] w-full bg-gray-100 overflow-hidden group cursor-pointer flex-shrink-0"
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
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-1 rounded-full shadow transition-all"
                  >
                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="15,18 9,12 15,6" strokeWidth={2} /></svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveIndex(i => (i + 1) % images.length); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-1 rounded-full shadow transition-all"
                  >
                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6" strokeWidth={2} /></svg>
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
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
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-center text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 12V6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v10.5A2.25 2.25 0 0118.75 19.5H5.25A2.25 2.25 0 013 17.25V12z" />
                </svg>
                <span className="text-xs">Fotoğraf Yok</span>
              </div>
            </div>
          )}
        </div>

        {/* İçerik */}
        <div className="p-4 flex flex-col flex-1">
          {/* Başlık + konum */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-800 text-base leading-tight">{renovation.storeName}</h3>
            {renovation.location && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full flex-shrink-0 ml-2">
                {renovation.location}
              </span>
            )}
          </div>

          {/* Tarih */}
          <div className="mb-3">
            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
              📅 {new Date(renovation.talepTarihi).toLocaleDateString('tr-TR')}
            </span>
          </div>

          {/* Açıklama maddeleri */}
          {items.length > 0 && (
            <div className="flex-1 mb-3">
              <ul className="space-y-1">
                {items.slice(0, MAX_VISIBLE).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {hasMore && (
                <button
                  onClick={() => setShowDescModal(true)}
                  className="mt-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  +{items.length - MAX_VISIBLE} madde daha göster
                </button>
              )}
            </div>
          )}

          {/* Alt kısım */}
          <div className="flex items-center justify-between mt-auto pt-2 border-t">
            <p className="text-xs text-gray-400">
              {new Date(renovation.createdAt).toLocaleDateString('tr-TR')}
            </p>
            <div className="flex items-center gap-1">
              {items.length > 0 && (
                <button
                  onClick={() => setShowDescModal(true)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Açıklamayı Gör"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Talebi Sil"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fotoğraf modal */}
      {showPhotoModal && currentImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPhotoModal(false)}
        >
          <div className="relative max-w-4xl max-h-full w-full">
            <img
              src={currentImage}
              alt={`${renovation.storeName} tadilat`}
              className="w-auto max-h-[80vh] object-contain mx-auto rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            {images.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); setActiveIndex(i => (i - 1 + images.length) % images.length); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 p-2 rounded-full shadow-lg">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="15,18 9,12 15,6" strokeWidth={2} /></svg>
                </button>
                <button onClick={(e) => { e.stopPropagation(); setActiveIndex(i => (i + 1) % images.length); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 p-2 rounded-full shadow-lg">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6" strokeWidth={2} /></svg>
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white text-sm px-4 py-1 rounded-full">
                  {activeIndex + 1} / {images.length}
                </div>
              </>
            )}
            <button
              onClick={() => setShowPhotoModal(false)}
              className="absolute top-2 right-2 bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full shadow-lg"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <span className="text-xs text-gray-400">
                  {new Date(renovation.talepTarihi).toLocaleDateString('tr-TR')}
                  {renovation.location && ` · ${renovation.location}`}
                </span>
              </div>
              <button
                onClick={() => setShowDescModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ul className="space-y-2">
              {items.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
