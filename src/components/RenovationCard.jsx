import { useState } from 'react';

export default function RenovationCard({ renovation, onDelete }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md flex flex-col hover-lift">
        {/* Fotoğraf alanı */}
        <div
          className="relative h-[200px] w-full bg-gray-100 overflow-hidden group cursor-pointer flex-shrink-0"
          onClick={() => renovation.imageUrl && setShowModal(true)}
        >
          {renovation.imageUrl ? (
            <>
              <img
                src={renovation.imageUrl}
                alt={`${renovation.storeName} tadilat`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all" />
              <button
                onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
                className="absolute top-2 right-2 bg-white bg-opacity-80 hover:bg-opacity-100 p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
              >
                <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </button>
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
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-gray-800 text-base leading-tight">{renovation.storeName}</h3>
            {renovation.location && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex-shrink-0 ml-2">
                {renovation.location}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
              📅 {new Date(renovation.talepTarihi).toLocaleDateString('tr-TR')}
            </span>
          </div>

          <p className="text-sm text-gray-600 line-clamp-3 flex-1">{renovation.aciklama}</p>

          <div className="flex items-center justify-between mt-3 border-t pt-2">
            <p className="text-xs text-gray-400">
              Oluşturulma: {new Date(renovation.createdAt).toLocaleDateString('tr-TR')}
            </p>
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

      {/* Fotoğraf modal */}
      {showModal && renovation.imageUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div className="relative max-w-4xl max-h-full w-full">
            <img
              src={renovation.imageUrl}
              alt={`${renovation.storeName} tadilat`}
              className="w-auto max-h-[80vh] object-contain mx-auto rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full shadow-lg transition-all"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white text-sm px-4 py-2 rounded-full">
              {renovation.storeName} — {new Date(renovation.talepTarihi).toLocaleDateString('tr-TR')}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
