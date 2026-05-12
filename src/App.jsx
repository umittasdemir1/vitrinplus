import { useEffect, useRef, useState } from 'react';


        // Lucide React Icons (Simplified)
        const ChevronLeft = ({ size = 24, ...props }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
                <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
        );

        const ChevronRight = ({ size = 24, ...props }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
                <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
        );

        const Upload = ({ size = 24, ...props }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7,10 12,15 17,10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
        );

        const Save = ({ size = 24, ...props }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
                <path d="M5 5v14l7-5 7 5V5z"/>
            </svg>
        );

        const Cloud = ({ size = 24, ...props }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
            </svg>
        );

        const Search = ({ size = 24, ...props }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
            </svg>
        );

        const Trash = ({ size = 24, ...props }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
                <polyline points="3,6 5,6 21,6"></polyline>
                <path d="m19,6v14a2 2 0 0 1-2,2H7a2 2 0 0 1-2-2V6m3,0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2,2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
        );

        // Enhanced Drag & Drop Upload Component
        const DragDropUpload = ({ onFilesUpload, maxFiles = 5, uploading = false }) => {
            const [isDragOver, setIsDragOver] = useState(false);
            const fileInputRef = useRef(null);

            const handleDragEnter = (e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragOver(true);
            };

            const handleDragOver = (e) => {
                e.preventDefault();
                e.stopPropagation();
            };

            const handleDragLeave = (e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragOver(false);
            };

            const handleDrop = (e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragOver(false);

                const files = Array.from(e.dataTransfer.files);
                const imageFiles = files.filter(file => file.type.startsWith('image/'));
                
                console.log('📁 Dropped files:', imageFiles.length);
                
                if (imageFiles.length > 0) {
                    onFilesUpload(imageFiles.slice(0, maxFiles));
                } else {
                    alert('❌ Lütfen sadece resim dosyaları seçin');
                }
            };

            const handleFileSelect = (e) => {
                const files = Array.from(e.target.files);
                console.log('📁 Selected files:', files.length);
                onFilesUpload(files.slice(0, maxFiles));
                e.target.value = '';
            };

            return (
                <div
                    className={`drag-zone p-8 text-center rounded-xl cursor-pointer hover-lift ${
                        isDragOver ? 'drag-over' : ''
                    } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={uploading}
                    />
                    
                    <div className="space-y-4">
                        {uploading ? (
                            <Cloud className="w-12 h-12 mx-auto text-blue-500 animate-pulse" />
                        ) : (
                            <Upload className="w-12 h-12 mx-auto text-gray-400" />
                        )}
                        
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                {uploading ? 'Fotoğraflar Yükleniyor...' : 'Fotoğraf Yükle'}
                            </h3>
                        </div>
                    </div>
                </div>
            );
        };

        // Progress Bar Component
        const ProgressBar = ({ progress, fileName }) => (
            <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 truncate">
                        {fileName}
                    </span>
                    <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                        className="progress-bar h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        );

        // Store Card Component - Enhanced with notes modal
        const StoreCard = ({ dbStore, userStore, competitorCount, hasData, images, onEdit, stores, setStores, saveStore }) => {
            const [cardImageIndex, setCardImageIndex] = useState(0);
            const [showModal, setShowModal] = useState(false);
            const [showNotesModal, setShowNotesModal] = useState(false);
            const [deleting, setDeleting] = useState(false);
            
            const nextCardImage = () => {
                const validImageIndexes = [];
                for (let i = 0; i < 5; i++) {
                    if (images[i] && images[i].trim()) {
                        validImageIndexes.push(i);
                    }
                }
                
                if (validImageIndexes.length <= 1) return;
                
                const currentValidIndex = validImageIndexes.indexOf(cardImageIndex);
                const nextValidIndex = (currentValidIndex + 1) % validImageIndexes.length;
                setCardImageIndex(validImageIndexes[nextValidIndex]);
            };

            const prevCardImage = () => {
                const validImageIndexes = [];
                for (let i = 0; i < 5; i++) {
                    if (images[i] && images[i].trim()) {
                        validImageIndexes.push(i);
                    }
                }
                
                if (validImageIndexes.length <= 1) return;
                
                const currentValidIndex = validImageIndexes.indexOf(cardImageIndex);
                const prevValidIndex = (currentValidIndex - 1 + validImageIndexes.length) % validImageIndexes.length;
                setCardImageIndex(validImageIndexes[prevValidIndex]);
            };

            const handleQuickImageDelete = async () => {
                if (!userStore?.images?.[cardImageIndex] || !userStore.images[cardImageIndex].trim()) {
                    return;
                }

                setDeleting(true);
                try {
                    const updatedStore = { ...userStore };
                    updatedStore.images = [...updatedStore.images];
                    
                    // Firebase Storage'dan sil
                    if (updatedStore.images[cardImageIndex].includes('firebasestorage.googleapis.com')) {
                        try {
                            const url = updatedStore.images[cardImageIndex];
                            const path = url.split('/o/')[1].split('?')[0];
                            const decodedPath = decodeURIComponent(path);
                            const fileRef = window.firebase.ref(window.firebase.storage, decodedPath);
                            await window.firebase.deleteObject(fileRef);
                            console.log('🗑️ Firebase Storage\'dan silindi');
                        } catch (error) {
                            console.warn('Storage silme hatası:', error);
                        }
                    }
                    
                    updatedStore.images[cardImageIndex] = '';

                    const result = await saveStore(updatedStore);
                    
                    if (result.success) {
                        setStores(prevStores => {
                            const newStores = [...prevStores];
                            const storeIndex = newStores.findIndex(s => s.id === dbStore.id);
                            if (storeIndex >= 0) {
                                newStores[storeIndex] = updatedStore;
                            }
                            return newStores;
                        });

                        const nextValidImages = updatedStore.images.map((img, idx) => img && img.trim() ? idx : null).filter(idx => idx !== null);
                        if (nextValidImages.length > 0) {
                            setCardImageIndex(nextValidImages[0]);
                        } else {
                            setCardImageIndex(0);
                        }
                    }
                } catch (error) {
                    console.error('Quick image delete error:', error);
                } finally {
                    setDeleting(false);
                }
            };
            
            return (
                <>
                    <div className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md min-h-[620px] flex flex-col hover-lift`}>
                        <div className="relative flex-shrink-0 h-[260px] w-full bg-gray-100 rounded-lg overflow-hidden group">
                            {images[cardImageIndex] && images[cardImageIndex].trim() ? (
                                <>
                                    <img
                                        src={images[cardImageIndex]}
                                        alt={`${dbStore.name} Fotoğrafı ${cardImageIndex + 1}`}
                                        className="w-full h-full object-cover cursor-pointer"
                                        onClick={() => setShowModal(true)}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML = `
                                                <div class="w-full h-full flex items-center justify-center bg-gray-200">
                                                    <div class="text-center text-gray-500">
                                                        <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <span class="text-sm">Fotoğraf Hatası</span>
                                                    </div>
                                                </div>
                                            `;
                                        }}
                                    />
                                    
                                    {images.filter(img => img && img.trim()).length > 1 && (
                                        <>
                                            <button
                                                onClick={prevCardImage}
                                                className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 sm:p-1.5 rounded-full shadow-lg transition-all z-10"
                                            >
                                                <ChevronLeft size={20} className="sm:w-4 sm:h-4" />
                                            </button>
                                            
                                            <button
                                                onClick={nextCardImage}
                                                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 sm:p-1.5 rounded-full shadow-lg transition-all z-10"
                                            >
                                                <ChevronRight size={20} className="sm:w-4 sm:h-4" />
                                            </button>
                                            
                                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                                                {Array.from({length: 5}, (_, index) => {
                                                    const hasImage = images[index] && images[index].trim();
                                                    if (!hasImage) return null;
                                                    return (
                                                        <button
                                                            key={index}
                                                            onClick={() => setCardImageIndex(index)}
                                                            className={`w-2 h-2 rounded-full transition-all ${
                                                                cardImageIndex === index 
                                                                    ? 'bg-blue-500' 
                                                                    : 'bg-white bg-opacity-70 hover:bg-opacity-100'
                                                            }`}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </>
                                    )}
                                    
                                    <button
                                        onClick={() => setShowModal(true)}
                                        className="absolute top-2 right-2 bg-white bg-opacity-80 hover:bg-opacity-100 p-1.5 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 z-10"
                                        title="Fotoğrafı büyüt"
                                    >
                                        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                        </svg>
                                    </button>
                                    
                                    {userStore?.images?.[cardImageIndex] && userStore.images[cardImageIndex].trim() && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleQuickImageDelete(); }}
                                            disabled={deleting}
                                            className="absolute top-2 left-2 bg-white bg-opacity-80 hover:bg-opacity-100 p-1.5 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 z-10"
                                            title="Fotoğrafı sil"
                                        >
                                            {deleting ? (
                                                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <Trash className="w-4 h-4 text-red-500" />
                                            )}
                                        </button>
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                    <div className="text-center text-gray-500">
                                        <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                            <circle cx="8.5" cy="8.5" r="1.5"/>
                                            <polyline points="21,15 16,10 5,21"/>
                                        </svg>
                                        <span className="text-sm">Henüz Fotoğraf Yüklenmedi</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 flex flex-col flex-1 justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-gray-800 text-lg">{dbStore.name}</h3>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                        {dbStore.location}
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <p className="text-xs text-gray-500">Alan</p>
                                        <p className="font-medium">{userStore?.size || '-'} m²</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Rakip Markalar</p>
                                        <p className="font-medium">{competitorCount || 0} marka</p>
                                    </div>
                                </div>
                                
                                {competitorCount > 0 && (
                                    <div className="mb-3">
                                        <p className="text-xs text-gray-500 mb-2">Rakip Markalar:</p>
                                        <div className="flex flex-wrap gap-1 overflow-visible">
                                            {userStore.competitorBrands?.filter(brand => brand.trim()).map((brand, index) => (
                                                <span key={index} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded flex-shrink-0">
                                                    {brand.length > 12 ? brand.substring(0, 12) + '...' : brand}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-auto">
                                {userStore?.notes && userStore.notes.trim() && (
                                    <div className="mb-2">
                                        <button
                                            onClick={() => setShowNotesModal(true)}
                                            className="w-full text-left hover:opacity-70 transition-opacity"
                                        >
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
                                    {hasData ? "Son güncelleme" : "Henüz düzenlenmemiş"}
                                    {hasData && (
                                        <span>{userStore.lastUpdated ? new Date(userStore.lastUpdated).toLocaleDateString("tr-TR") : ""}</span>
                                    )}
                                </div>
                                <button
                                    onClick={() => onEdit(dbStore.id)}
                                    className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors hover-lift"
                                >
                                    Düzenle
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Image Modal */}
                    {showModal && (
                        <div 
                            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-2 sm:p-4"
                            onClick={() => setShowModal(false)}
                        >
                            <div className="relative max-w-5xl max-h-full w-full">
                                {images[cardImageIndex] && images[cardImageIndex].trim() ? (
                                    <img
                                        src={images[cardImageIndex]}
                                        alt={`${dbStore.name} - Büyük Görünüm`}
                                        className="w-auto h-[500px] object-contain mx-auto rounded-lg"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                ) : (
                                    <div className="bg-white rounded-lg p-8 sm:p-12 max-w-md mx-auto">
                                        <div className="text-center text-gray-500">
                                            <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                                <polyline points="21,15 16,10 5,21"/>
                                            </svg>
                                            <span className="text-base sm:text-lg">Fotoğraf Bulunamadı</span>
                                        </div>
                                    </div>
                                )}
                                
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-white bg-opacity-90 hover:bg-opacity-100 p-3 sm:p-2 rounded-full shadow-lg transition-all"
                                >
                                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                
                                {images.length > 1 && images[cardImageIndex] && images[cardImageIndex].trim() && (
                                    <>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); prevCardImage(); }}
                                            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 p-3 sm:p-3 rounded-full shadow-lg transition-all"
                                        >
                                            <ChevronLeft size={24} className="text-gray-700" />
                                        </button>
                                        
                                        <button
                                            onClick={(e) => { e.stopPropagation(); nextCardImage(); }}
                                            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 p-3 sm:p-3 rounded-full shadow-lg transition-all"
                                        >
                                            <ChevronRight size={24} className="text-gray-700" />
                                        </button>
                                        
                                        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3">
                                            {Array.from({length: 5}, (_, index) => {
                                                const hasImage = images[index] && images[index].trim();
                                                if (!hasImage) return null;
                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={(e) => { e.stopPropagation(); setCardImageIndex(index); }}
                                                        className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all ${
                                                            cardImageIndex === index 
                                                                ? 'bg-blue-500 shadow-md' 
                                                                : 'bg-white bg-opacity-70 hover:bg-opacity-90'
                                                        }`}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Notes Modal */}
                    {showNotesModal && (
                        <div 
                            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
                            onClick={() => setShowNotesModal(false)}
                        >
                            <div 
                                className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Header */}
                                <div className="bg-yellow-50 border-b border-yellow-200 p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-yellow-100 rounded-lg">
                                            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{dbStore.name} - Notlar</h3>
                                            <p className="text-sm text-gray-600">{dbStore.location}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowNotesModal(false)}
                                        className="p-2 hover:bg-yellow-100 rounded-lg transition-colors"
                                    >
                                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                
                                {/* Content */}
                                <div className="p-6 max-h-[60vh] overflow-y-auto">
                                    <div className="prose max-w-none">
                                        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                                            {userStore?.notes || 'Not bulunamadı.'}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Footer */}
                                <div className="bg-gray-50 border-t p-4 flex justify-between items-center">
                                    <div className="text-xs text-gray-500">
                                        Son güncelleme: {userStore?.lastUpdated ? new Date(userStore.lastUpdated).toLocaleString('tr-TR') : 'Bilinmiyor'}
                                    </div>
                                    <button
                                        onClick={() => setShowNotesModal(false)}
                                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Kapat
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            );
        };

        function StoreManagementApp() {
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
            const [firebaseReady, setFirebaseReady] = useState(false);
            const [loading, setLoading] = useState(false);
            const [error, setError] = useState(null);
            const [uploadProgress, setUploadProgress] = useState({});
            const [showModal, setShowModal] = useState(false);

            // Firebase hazır olup olmadığını kontrol et
            useEffect(() => {
                const checkFirebase = () => {
                    if (window.firebase?.ready) {
                        setFirebaseReady(true);
                        console.log('🔥 Firebase hazır');
                        loadStoresFromFirebase();
                    } else {
                        setTimeout(checkFirebase, 500);
                    }
                };
                checkFirebase();
            }, []);

            // Firebase'den mağaza verilerini yükle
            const loadStoresFromFirebase = async () => {
                try {
                    if (!window.firebase?.ready) return;
                    
                    await window.firebase.signInAnonymously(window.firebase.auth);
                    
                    const storesRef = window.firebase.collection(window.firebase.db, 'stores');
                    const snapshot = await window.firebase.getDocs(storesRef);
                    
                    const firebaseStores = [];
                    snapshot.forEach((doc) => {
                        firebaseStores.push({ ...doc.data(), id: doc.id });
                    });
                    
                    setStores(firebaseStores);
                    console.log('📦 Firebase\'den yüklenen mağaza sayısı:', firebaseStores.length);
                } catch (error) {
                    console.error('Firebase yükleme hatası:', error);
                    setStores([]);
                }
            };

            // Image sıkıştırma fonksiyonu
            const compressImage = (file, maxSizeKB = 750) => {
                return new Promise((resolve) => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const img = new Image();
                    
                    img.onload = () => {
                        // Max genişlik 1200px
                        const maxWidth = 1200;
                        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
                        
                        canvas.width = img.width * ratio;
                        canvas.height = img.height * ratio;
                        
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        
                        // Kalite ayarı ile sıkıştır
                        let quality = 0.85;
                        let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                        
                        // Boyut kontrolü - 750KB altına düşür
                        while (compressedDataUrl.length > maxSizeKB * 1024 * 1.37 && quality > 0.3) {
                            quality -= 0.1;
                            compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                        }
                        
                        resolve(compressedDataUrl);
                    };
                    
                    img.src = URL.createObjectURL(file);
                });
            };

            // Enhanced Firebase Storage Upload Function
            const uploadToFirebaseStorage = async (file, storeId, imageIndex) => {
                try {
                    if (!window.firebase?.ready) throw new Error('Firebase hazır değil');

                    // Dosya doğrulama
                    if (!file.type.startsWith('image/')) {
                        throw new Error('Sadece resim dosyası yükleyebilirsiniz');
                    }

                    if (file.size > 10 * 1024 * 1024) { // 10MB limit
                        throw new Error('Dosya boyutu 10MB\'dan büyük olamaz');
                    }

                    console.log(`📤 Sıkıştırılıyor: ${file.name} (${Math.round(file.size/1024)}KB)`);
                    
                    // Fotoğrafı sıkıştır
                    const compressedDataUrl = await compressImage(file);
                    
                    // Base64'ü blob'a çevir
                    const response = await fetch(compressedDataUrl);
                    const blob = await response.blob();
                    
                    console.log(`📦 Sıkıştırıldı: ${Math.round(file.size/1024)}KB → ${Math.round(blob.size/1024)}KB`);

                    // Unique filename
                    const timestamp = Date.now();
                    const randomId = Math.random().toString(36).substring(2);
                    const fileName = `${storeId}_${imageIndex}_${timestamp}_${randomId}.jpg`;
                    const filePath = `store-images/${fileName}`;

                    // Firebase Storage referansı
                    const storageRef = window.firebase.ref(window.firebase.storage, filePath);

                    // Upload with progress tracking
                    const progressKey = `${storeId}_${imageIndex}`;
                    let progress = 0;
                    const progressInterval = setInterval(() => {
                        progress += Math.random() * 15;
                        if (progress > 85) progress = 85;
                        setUploadProgress(prev => ({
                            ...prev,
                            [progressKey]: { progress, fileName: file.name }
                        }));
                    }, 200);

                    try {
                        const uploadTask = window.firebase.uploadBytes(storageRef, blob);
                        await uploadTask;
                        clearInterval(progressInterval);
                        
                        // Complete progress
                        setUploadProgress(prev => ({
                            ...prev,
                            [progressKey]: { progress: 100, fileName: file.name }
                        }));

                        // Get download URL
                        const downloadURL = await window.firebase.getDownloadURL(storageRef);
                        
                        console.log(`✅ Upload başarılı: ${downloadURL}`);
                        
                        // Clear progress after delay
                        setTimeout(() => {
                            setUploadProgress(prev => {
                                const newProgress = { ...prev };
                                delete newProgress[progressKey];
                                return newProgress;
                            });
                        }, 2000);

                        return downloadURL;
                    } catch (uploadError) {
                        clearInterval(progressInterval);
                        throw uploadError;
                    }
                } catch (error) {
                    console.error('Firebase Storage upload error:', error);
                    throw error;
                }
            };

            // Enhanced Multi-file Upload Handler
            const handleMultipleImageUpload = async (files) => {
                if (!selectedStore || !files.length) return;

                console.log('📥 Çoklu yükleme başlıyor:', files.length, 'dosya');
                setUploading(true);
                
                try {
                    const updatedImages = [...(selectedStore.images || ['', '', '', '', ''])];
                    let uploadCount = 0;

                    for (let i = 0; i < files.length && i < 5; i++) {
                        const file = files[i];
                        
                        // Find first empty slot
                        const emptyIndex = updatedImages.findIndex(img => !img || !img.trim());
                        if (emptyIndex === -1) {
                            console.warn('⚠️ Tüm slotlar dolu, fazla fotoğraflar atlanıyor');
                            break;
                        }

                        try {
                            console.log(`📤 Yükleniyor ${i+1}/${files.length}: ${file.name}`);
                            
                            // Delete old image if exists
                            if (updatedImages[emptyIndex] && updatedImages[emptyIndex].includes('firebasestorage.googleapis.com')) {
                                try {
                                    const oldUrl = updatedImages[emptyIndex];
                                    const oldPath = oldUrl.split('/o/')[1].split('?')[0];
                                    const decodedOldPath = decodeURIComponent(oldPath);
                                    const oldFileRef = window.firebase.ref(window.firebase.storage, decodedOldPath);
                                    await window.firebase.deleteObject(oldFileRef);
                                    console.log('🗑️ Eski fotoğraf silindi');
                                } catch (deleteError) {
                                    console.warn('Eski fotoğraf silinirken hata:', deleteError);
                                }
                            }

                            // Upload new image
                            const downloadURL = await uploadToFirebaseStorage(file, selectedStore.id, emptyIndex);
                            updatedImages[emptyIndex] = downloadURL;
                            uploadCount++;
                            
                            console.log(`✅ Başarılı: ${file.name}`);

                        } catch (uploadError) {
                            console.error(`❌ Fotoğraf yükleme hatası (${file.name}):`, uploadError);
                            alert(`❌ ${file.name} yüklenemedi: ${uploadError.message}`);
                        }
                    }

                    if (uploadCount > 0) {
                        // Update store with new images
                        const updatedStore = { ...selectedStore, images: updatedImages };
                        setSelectedStore(updatedStore);

                        // Auto-save to Firebase
                        const saveResult = await saveToFirebase(updatedStore);
                        if (saveResult.success) {
                            console.log(`✅ ${uploadCount} fotoğraf başarıyla yüklendi ve kaydedildi`);
                            setLastSaved(new Date());
                            setTimeout(() => setLastSaved(null), 3000);
                        }
                    }

                } catch (error) {
                    console.error('Multi-upload error:', error);
                    alert('❌ Fotoğraf yükleme sırasında hata oluştu');
                } finally {
                    setUploading(false);
                }
            };

            // Enhanced single image upload
            const handleImageUpload = async (event, imageIndex) => {
                const file = event.target.files[0];
                if (!file) return;

                // Validation
                if (file.size > 10 * 1024 * 1024) {
                    alert('❌ Fotoğraf çok büyük! Maksimum 10MB boyutunda fotoğraf yükleyebilirsiniz.');
                    return;
                }

                if (!file.type.startsWith('image/')) {
                    alert('❌ Lütfen sadece fotoğraf dosyası seçin (JPG, PNG, etc.)');
                    return;
                }

                setUploading(true);
                
                try {
                    // Delete old image if exists
                    if (selectedStore?.images?.[imageIndex] && selectedStore.images[imageIndex].includes('firebasestorage.googleapis.com')) {
                        try {
                            const oldUrl = selectedStore.images[imageIndex];
                            const oldPath = oldUrl.split('/o/')[1].split('?')[0];
                            const decodedOldPath = decodeURIComponent(oldPath);
                            const oldFileRef = window.firebase.ref(window.firebase.storage, decodedOldPath);
                            await window.firebase.deleteObject(oldFileRef);
                            console.log('🗑️ Eski fotoğraf silindi');
                        } catch (deleteError) {
                            console.warn('Eski fotoğraf silinirken hata:', deleteError);
                        }
                    }

                    // Upload new image
                    const downloadURL = await uploadToFirebaseStorage(file, selectedStore.id, imageIndex);
                    
                    // Update state
                    const newImages = [...(selectedStore?.images || ['', '', '', '', ''])];
                    newImages[imageIndex] = downloadURL;
                    updateStore('images', newImages);
                    
                } catch (error) {
                    console.error('Image upload error:', error);
                    alert(`❌ Fotoğraf yüklenemedi: ${error.message}`);
                } finally {
                    setUploading(false);
                }
            };

            // Enhanced image delete with Firebase Storage cleanup
            const handleImageDelete = async (imageIndex) => {
                if (!selectedStore?.images?.[imageIndex]) return;

                try {
                    // Delete from Firebase Storage if it's a storage URL
                    if (selectedStore.images[imageIndex].includes('firebasestorage.googleapis.com')) {
                        try {
                            const url = selectedStore.images[imageIndex];
                            const path = url.split('/o/')[1].split('?')[0];
                            const decodedPath = decodeURIComponent(path);
                            const fileRef = window.firebase.ref(window.firebase.storage, decodedPath);
                            await window.firebase.deleteObject(fileRef);
                            console.log('🗑️ Firebase Storage\'dan silindi');
                        } catch (deleteError) {
                            console.warn('Storage silme hatası:', deleteError);
                        }
                    }

                    // Update state
                    const newImages = [...(selectedStore?.images || ['', '', '', '', ''])];
                    newImages[imageIndex] = '';
                    updateStore('images', newImages);

                    // Auto-navigate to next available image
                    if (currentImageIndex === imageIndex) {
                        const nextValidIndex = newImages.findIndex(img => img && img.trim());
                        setCurrentImageIndex(nextValidIndex >= 0 ? nextValidIndex : 0);
                    }

                } catch (error) {
                    console.error('Image delete error:', error);
                }
            };

            // Firebase'e kaydet - Enhanced with validation
            const saveToFirebase = async (storeData) => {
                if (!firebaseReady) {
                    return { success: false, error: 'Firebase hazır değil' };
                }

                setSaving(true);
                try {
                    if (!window.firebase.auth.currentUser) {
                        await window.firebase.signInAnonymously(window.firebase.auth);
                        console.log('🔐 Anonymous login başarılı');
                    }

                    // Enhanced data cleaning and validation
                    const cleanData = {
                        name: String(storeData.name || '').trim(),
                        address: String(storeData.address || '').trim(),
                        location: String(storeData.location || '').trim(),
                        size: String(storeData.size || '').trim(),
                        
                        // Images - validate Firebase Storage URLs
                        images: (() => {
                            const imageArray = storeData.images || ['', '', '', '', ''];
                            while (imageArray.length < 5) imageArray.push('');
                            return imageArray.slice(0, 5).map(img => {
                                if (!img || typeof img !== 'string') return '';
                                // Validate URL format
                                if (img.includes('firebasestorage.googleapis.com') || img.startsWith('data:image/')) {
                                    return img;
                                }
                                return '';
                            });
                        })(),
                        
                        competitorBrands: (storeData.competitorBrands || [])
                            .filter(brand => brand && typeof brand === 'string' && brand.trim())
                            .map(brand => String(brand).trim())
                            .slice(0, 10),
                        
                        notes: String(storeData.notes || '').trim().slice(0, 1000),
                        
                        lastUpdated: new Date().toISOString(),
                        savedAt: new Date().toLocaleString('tr-TR'),
                        version: '2.0' // Updated version for Firebase Storage
                    };

                    console.log('💾 Kaydedilecek veri:', {
                        ...cleanData,
                        images: cleanData.images.map(img => img ? `${img.substring(0, 50)}...` : 'boş')
                    });

                    // Save to Firebase
                    const storeRef = window.firebase.doc(window.firebase.db, 'stores', storeData.id);
                    await window.firebase.setDoc(storeRef, cleanData);

                    console.log('✅ Firebase kaydetme başarılı');

                    // Update local state
                    setStores(prevStores => {
                        const existingIndex = prevStores.findIndex(s => s.id === storeData.id);
                        const newStoreData = { ...storeData, ...cleanData };
                        
                        if (existingIndex >= 0) {
                            const newStores = [...prevStores];
                            newStores[existingIndex] = newStoreData;
                            return newStores;
                        } else {
                            return [...prevStores, newStoreData];
                        }
                    });

                    return { success: true };
                } catch (error) {
                    console.error('Firebase kaydetme hatası:', error);
                    return { success: false, error: 'Kaydetme hatası' };
                } finally {
                    setSaving(false);
                }
            };

            // Store veritabanı
            const storeDatabase = [
                { id: "AkasyaMen", name: "Akasya Men", address: "Akasya AVM Acıbadem Mah. Çeçen Sok, Akasya Avm Blok No: 25, D:No: 389, 34660 Üsküdar/İstanbul", location: "İstanbul" },
                { id: "AkasyaWomen", name: "Akasya Women", address: "Akasya AVM Acıbadem Mah. Çeçen Sok. 2. Kat No: 25, 34660 ÜsküdarIstanbul - Turkey", location: "İstanbul" },
                { id: "Akbati", name: "Akbatı", address: "Koza Mahallesi, 1655. Sokak Esenkent No:634538 Esenyurt/İstanbul", location: "İstanbul" },
                { id: "AkmerkezMen", name: "Akmerkez Men", address: "Kültür Mahallesi, Nispetiye Cd, 34340 Etiler/BeşiktaşIstanbul - Turkey", location: "İstanbul" },
                { id: "AkmerkezWoman", name: "Akmerkez Woman", address: "Kültür Mahallesi, Nispetiye Cd, 34340 Etiler/BeşiktaşIstanbul - Turkey", location: "İstanbul" },
                { id: "Alacati", name: "Alaçatı", address: "Alaçatı Kemalpaşa Cad. No:A/63, 35930 Çeşme/İzmir - Turkey", location: "İzmir" },
                { id: "AquaFlorya", name: "Aqua Florya", address: "Şenlikköy Mah., Yeşilköy Halkalı Cad., Kat 2, No. 2/10, 34153 Bakırköy/İstanbul, Türkiye", location: "İstanbul" },
                { id: "Armada", name: "Armada", address: "Beştepe, Dumlupınar Blv. No:606560 Yenimahalle/Ankara", location: "Ankara" },
                { id: "Bebek", name: "Bebek", address: "Cevdet Paşa Cd. 61/B, Bebek/BeşiktaşIstanbul - Turkey", location: "İstanbul" },
                { id: "BodrumMarina", name: "Bodrum Marina", address: "Neyzen Tevfik Caddesi No:5c-34Bodrum - Turkey", location: "Muğla" },
                { id: "CityIstanbul", name: "City's İstanbul", address: "Kozyatağı City's İstanbul Şubesi / İçerenköy Mah.Çayır Cad.No:1 Ataşehir/İstanbul", location: "İstanbul" },
                { id: "CityNisantasi", name: "City's Nişantaşı", address: "Teşvikiye Mah. Teşvikiye Cad. AVM N0: 12 KA S1 34365Şişli - İstanbul", location: "İstanbul" },
                { id: "CesmeMarina", name: "Çeşme Marina", address: "Çeşme Marina Musalla Mah. 1016 Sok. No:2/5EÇeşme/İzmir - Turkey", location: "İzmir" },
                { id: "Downtown", name: "Downtown", address: "İstiklal Mahallesi Yunuseli Bulvarı O Blok No:13/1 16200Osmangazi/BURSA", location: "Bursa" },
                { id: "GocekMarina", name: "Göcek Marina", address: "Skopea Marina Göcek Mah. Turgut Özal Cad. No:3A Fehtiye - Muğla", location: "Muğla" },
                { id: "Gokturk", name: "Göktürk", address: "Göktürk Merkez, İstanbul Cd. 14-18, 34077 Eyüpsultan/İstanbul, Türkiye", location: "İstanbul" },
                { id: "HilltownKarsiyaka", name: "Hilltown Karşıyaka", address: "Yalı Mah. 6522 Sok.Karşıyaka - İzmir", location: "İzmir" },
                { id: "HilltownKucukyali", name: "Hilltown Küçükyalı", address: "Aydınevler, Siteler Yolu No:28, 34854, 34840 Maltepe/İstanbul", location: "İstanbul" },
                { id: "IstanbulAirport", name: "İstanbul Airport", address: "Tayakadın Mahallesi Terminal CaddesiInternational Departure TerminalNo: 1/640347 Arnavutköy - İstanbul - Turkey", location: "İstanbul" },
                { id: "IstinyeParkIstanbul", name: "İstinye Park İstanbul", address: "Katar Cd No:11, 34460Sarıyer/İstanbul", location: "İstanbul" },
                { id: "IstinyeParkIzmir", name: "İstinye Park İzmir", address: "İstinyePark İzmir AVM Bahçelerarası Mah., Şehit Bnb. Ali Resmi Tufan Cad. No: 3/Z18,Balçova/İzmir - Turkey", location: "İzmir" },
                { id: "Kanyon", name: "Kanyon", address: "Esentepe Mah. Büyükdere Cad. No.185/141 Kanyon AVMŞİŞLİ / İSTANBUL", location: "İstanbul" },
                { id: "Kentpark", name: "Kentpark", address: "KENTPARK Ankara Şubesi Mustafa Kemal MahallesiDumlupınar Bulvarı No.164/1/Z95 ÇANKAYA / ANKARA", location: "Ankara" },
                { id: "Korupark", name: "Korupark", address: "Adnan Menderes Mah. Mudanya Cad. No 2 Mağaza No: 152 Kat:2 Osmangazi/Bursa", location: "Bursa" },
                { id: "LandofLegends", name: "Land of Legends", address: "Kadriye Mah. Atatürk Cad. Rixos Dükkanlar No:104-5, 07525Serik - Antalya", location: "Antalya" },
                { id: "MallofIstanbul", name: "Mall of İstanbul", address: "Ziya Gökalp, Süleyman Demirel Blv No:7, 34490 İkitelli Osb/Başakşehir/İstanbul", location: "İstanbul" },
                { id: "MandarinOriental", name: "Mandarin Oriental", address: "Gölköy Mahallesi, 314 Sokak No.10, 48483 Muğla", location: "Muğla" },
                { id: "MaxxRoyalKemer", name: "Maxx Royal Kemer", address: "Kiriş Mah. Kiriş Cad. Maxx Royal Hotel No:88/1, 07980Kemer - Antalya", location: "Antalya" },
                { id: "MersinMarina", name: "Mersin Marina", address: "Eğriçam, Adnan Menderes Blv. No:33, 33160, 33110 Yenişehir/Mersin", location: "Mersin" },
                { id: "MeydanIstanbul", name: "Meydan İstanbul", address: "Fatih Sultan Mehmet, Balkan Cd. No:62, 34771 Ümraniye/İstanbul", location: "İstanbul" },
                { id: "Midtown", name: "Midtown", address: "Midtown Müskebi Mah. Kongre Sk. No: 11 Bodrum / Muğla", location: "Muğla" },
                { id: "MomoBeach", name: "Momo Beach", address: "Üniversite mah, 4417 sokak, 3011. Sk. no:2 Çeşme/İzmir/Türkiye - 35930", location: "İzmir" },
                { id: "Panora", name: "Panora", address: "Oran, Kudüs Cd. No:3, 06450 ÇANKAYA / ANKARA", location: "Ankara" },
                { id: "Suadiye", name: "Suadiye", address: "Bağdat Caddesi, Suadiye Mahallesi No:449/B Kadıköy Istanbul - Turkey", location: "İstanbul" },
                { id: "SwissotelCesme", name: "Swissotel Çeşme", address: "Şifne Caddesi Celalbayar Mahallesi 5152 Sokak No:43 35930Çeşme/İzmir - Turkey", location: "İzmir" },
                { id: "TemaWorld", name: "Tema World", address: "Atakent Mah. 243. Sok. 14. Blok No:14/B 34307 Küçükçekmece/İstanbul", location: "İstanbul" },
                { id: "Terracity", name: "Terracity", address: "Fener Mahallesi, Tekelioglu Caddesi No: 55 Mağaza No: Z-052MURATPAŞA / ANTALYA", location: "Antalya" },
                { id: "Tersane", name: "Tersane", address: "Coming Soon", location: "İstanbul" },
                { id: "Vadistanbul", name: "Vadi İstanbul", address: "Ayazağa Mah, Azerbaycan Cad, Vadi İstanbul Blok No:3c İç No:96, 34453 Sarıyer/İstanbul", location: "İstanbul" },
                { id: "Viaport", name: "Viaport", address: "Yenişehir Mah. Dedepaşa Cad. Vıaport No: 19 / 205-Türkiye", location: "İstanbul" },
                { id: "Vogue", name: "Vogue", address: "Vogue Hotel Supreme Bodrum Resort Store Torba Mah. Usuluk Sk. No: 10ABodrum / Muğla", location: "Muğla" },
                { id: "YalikavakMarina", name: "Yalıkavak Marina", address: "Çökertme Cad. Marina Sitesi No: 6 CD/5 48400Yalıkavak - Bodrum - Turkey", location: "Muğla" },
                { id: "YalikavakKiosk", name: "Yalıkavak Marina (Kiosk)", address: "Çökertme Cad. 48400Yalıkavak - Bodrum - Turkey", location: "Muğla" },
                { id: "ZorluCenter", name: "Zorlu Center", address: "Coming Soon", location: "İstanbul" }
            ];

            const handleStoreSelection = (storeName) => {
                if (!storeName) return;
                
                setSelectedStoreName(storeName);
                const storeInfo = storeDatabase.find(s => s.id === storeName);
                
                let userStore = stores.find(s => s.id === storeName);
                
                if (!userStore && storeInfo) {
                    userStore = {
                        id: storeName,
                        name: storeInfo.name,
                        address: storeInfo.address,
                        location: storeInfo.location,
                        size: '',
                        images: ['', '', '', '', ''],
                        competitorBrands: ['', '', '', '', '', '', '', '', '', ''],
                        notes: ''
                    };
                }
                
                setSelectedStore(userStore);
                setCurrentImageIndex(0);
                setSidebarOpen(false);
                setCurrentView('management');
            };

            const updateStore = (field, value) => {
                const updatedStore = { ...selectedStore, [field]: value };
                setSelectedStore(updatedStore);
            };

            const updateCompetitorBrand = (index, value) => {
                const newCompetitorBrands = [...(selectedStore?.competitorBrands || ['', '', '', '', '', '', '', '', '', ''])];
                newCompetitorBrands[index] = value;
                updateStore('competitorBrands', newCompetitorBrands);
            };

            const nextImage = () => {
                if (!selectedStore?.images) return;
                
                const validImageIndexes = [];
                for (let i = 0; i < 5; i++) {
                    if (selectedStore.images[i] && selectedStore.images[i].trim()) {
                        validImageIndexes.push(i);
                    }
                }
                
                if (validImageIndexes.length <= 1) return;
                
                const currentValidIndex = validImageIndexes.indexOf(currentImageIndex);
                const nextValidIndex = (currentValidIndex + 1) % validImageIndexes.length;
                setCurrentImageIndex(validImageIndexes[nextValidIndex]);
            };

            const prevImage = () => {
                if (!selectedStore?.images) return;
                
                const validImageIndexes = [];
                for (let i = 0; i < 5; i++) {
                    if (selectedStore.images[i] && selectedStore.images[i].trim()) {
                        validImageIndexes.push(i);
                    }
                }
                
                if (validImageIndexes.length <= 1) return;
                
                const currentValidIndex = validImageIndexes.indexOf(currentImageIndex);
                const prevValidIndex = (currentValidIndex - 1 + validImageIndexes.length) % validImageIndexes.length;
                setCurrentImageIndex(validImageIndexes[prevValidIndex]);
            };

            const handleSaveStore = async () => {
                if (!selectedStore) return;
                
                const result = await saveToFirebase(selectedStore);
                
                if (result.success) {
                    setLastSaved(new Date());
                    setTimeout(() => {
                        setLastSaved(null);
                    }, 2000);
                }
            };

            const handleDeleteAllData = async () => {
                if (!selectedStore) return;
                
                // Clean all data
                const cleanedStore = {
                    id: selectedStore.id,
                    name: selectedStore.name,
                    address: selectedStore.address,
                    location: selectedStore.location,
                    size: '',
                    images: ['', '', '', '', ''],
                    competitorBrands: ['', '', '', '', '', '', '', '', '', ''],
                    notes: ''
                };

                // Delete from Firebase
                const result = await saveToFirebase(cleanedStore);
                
                if (result.success) {
                    setSelectedStore(cleanedStore);
                    setCurrentImageIndex(0);
                    
                    setStores(prevStores => {
                        return prevStores.filter(s => s.id !== selectedStore.id);
                    });
                }
            };

            // Loading screen
            if (loading) {
                return (
                    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                        <div className="text-center">
                            <div className="loading-spinner mx-auto mb-4"></div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">Vitrin+ Yükleniyor</h2>
                            <p className="text-gray-600">Firebase bağlantısı kuruluyor...</p>
                            <p className="text-sm text-gray-500 mt-2">Bu işlem 10-15 saniye sürebilir</p>
                        </div>
                    </div>
                );
            }

            // Error screen
            if (error) {
                return (
                    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                        <div className="text-center max-w-md bg-white rounded-xl shadow-lg p-8">
                            <div className="text-6xl mb-4">⚠️</div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">Firebase Bağlantı Hatası</h2>
                            <p className="text-gray-600 mb-4">{error}</p>
                            
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-left">
                                <h3 className="font-semibold text-yellow-800 mb-2">Olası Çözümler:</h3>
                                <ul className="text-sm text-yellow-700 space-y-1">
                                    <li>• Internet bağlantınızı kontrol edin</li>
                                    <li>• Sayfayı yenileyin (F5)</li>
                                    <li>• Tarayıcı önbelleğini temizleyin</li>
                                    <li>• VPN kullanıyorsanız kapatmayı deneyin</li>
                                    <li>• Farklı bir tarayıcı deneyin</li>
                                </ul>
                            </div>
                            
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => window.location.reload()}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    🔄 Tekrar Dene
                                </button>
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                    }}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    📋 Link Kopyala
                                </button>
                            </div>
                        </div>
                    </div>
                );
            }

            const getFilteredStores = () => {
                return storeDatabase.filter(dbStore => {
                    const matchesSearch = dbStore.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        dbStore.address.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesLocation = filterLocation === 'all' || dbStore.location === filterLocation;
                    
                    return matchesSearch && matchesLocation;
                });
            };

            const getUniqueLocations = () => {
                const locations = storeDatabase.map(store => store.location);
                return [...new Set(locations)];
            };

            const getAllCompetitors = () => {
                const allCompetitors = [];
                stores.forEach(store => {
                    if (store.competitorBrands) {
                        store.competitorBrands.forEach(brand => {
                            if (brand.trim()) {
                                const existingCompetitor = allCompetitors.find(comp => comp.name.toLowerCase() === brand.toLowerCase());
                                if (existingCompetitor) {
                                    existingCompetitor.count++;
                                    existingCompetitor.stores.push(store.name);
                                } else {
                                    allCompetitors.push({
                                        name: brand,
                                        count: 1,
                                        stores: [store.name]
                                    });
                                }
                            }
                        });
                    }
                });
                return allCompetitors.sort((a, b) => b.count - a.count);
            };

            return (
                <div className="min-h-screen bg-gray-50 flex">
                    {/* Sidebar ve Navigation */}
                    {sidebarOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
                    )}

                    <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out min-h-screen`}>
                        <div className="p-6">
                            <h1 className="text-2xl font-bold text-gray-800">🏪 Vitrin+</h1>
                            <p className="text-sm text-gray-600 mt-1">Mağaza Yönetim Sistemi</p>
                        </div>
                        
                        <div className="p-4 border-b border-gray-200">
                            <nav className="space-y-2">
                                <button
                                    onClick={() => { setCurrentView('dashboard'); setSidebarOpen(false); }}
                                    className={`w-full text-left p-3 rounded-lg transition-colors hover-lift ${
                                        currentView === 'dashboard' 
                                            ? 'bg-blue-100 text-blue-700 font-medium' 
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    📊 Dashboard
                                </button>
                                <button
                                    onClick={() => { setCurrentView('management'); setSidebarOpen(false); }}
                                    className={`w-full text-left p-3 rounded-lg transition-colors hover-lift ${
                                        currentView === 'management' 
                                            ? 'bg-blue-100 text-blue-700 font-medium' 
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    🏪 Mağaza Bilgileri
                                </button>
                                <button
                                    onClick={() => { setCurrentView('brands'); setSidebarOpen(false); }}
                                    className={`w-full text-left p-3 rounded-lg transition-colors hover-lift ${
                                        currentView === 'brands' 
                                            ? 'bg-blue-100 text-blue-700 font-medium' 
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    📊 Rakip İstatistikleri
                                </button>
                            </nav>
                        </div>
                    </div>

                    <div className="flex-1 lg:ml-0">
                        {/* Header */}
                        <div className="bg-white border-b border-gray-200">
                            <div className="flex items-center justify-between px-6 py-4">
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>

                                <div className="flex-1 flex justify-center items-center gap-3">
                                    <img 
                                        src="https://www.bluemint.com/Themes/BluemintTheme/Content/images/logo.svg" 
                                        alt="BlueMint Logo" 
                                        className="h-10"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextElementSibling.style.display = 'block';
                                        }}
                                    />
                                    <div className="text-3xl font-bold text-blue-600" style={{display: 'none'}}>🏪</div>
                                </div>

                                <div className="lg:hidden w-10"></div>
                            </div>
                        </div>

                        <div className="p-6 max-w-6xl mx-auto pb-20">
                            {/* Dashboard View */}
                            {currentView === 'dashboard' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Dashboard</h2>
                                    
                                    {/* Search ve Filter */}
                                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6 hover-lift">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Mağaza Ara</label>
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                                    <input
                                                        type="text"
                                                        placeholder="Mağaza adı veya adres ara..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Şehir Filtresi</label>
                                                <select
                                                    value={filterLocation}
                                                    onChange={(e) => setFilterLocation(e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="all">Tüm Şehirler</option>
                                                    {getUniqueLocations().map(location => (
                                                        <option key={location} value={location}>{location}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* İstatistik Kartları */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
                                        <div className="bg-white rounded-xl shadow-sm p-6 hover-lift">
                                            <div className="flex items-center">
                                                <div className="p-3 bg-blue-100 rounded-lg">
                                                    <span className="text-2xl">🏪</span>
                                                </div>
                                                <div className="ml-4">
                                                    <p className="text-sm text-gray-600">Toplam Mağaza</p>
                                                    <p className="text-2xl font-bold text-gray-800">{storeDatabase.length}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-white rounded-xl shadow-sm p-6 hover-lift">
                                            <div className="flex items-center">
                                                <div className="p-3 bg-green-100 rounded-lg">
                                                    <span className="text-2xl">📝</span>
                                                </div>
                                                <div className="ml-4">
                                                    <p className="text-sm text-gray-600">Düzenlenen</p>
                                                    <p className="text-2xl font-bold text-gray-800">{stores.filter(store => store.images && store.images.some(img => img && img.trim())).length}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-white rounded-xl shadow-sm p-6 hover-lift">
                                            <div className="flex items-center">
                                                <div className="p-3 bg-orange-100 rounded-lg">
                                                    <span className="text-2xl">🏙️</span>
                                                </div>
                                                <div className="ml-4">
                                                    <p className="text-sm text-gray-600">Şehir Sayısı</p>
                                                    <p className="text-2xl font-bold text-gray-800">{getUniqueLocations().length}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-white rounded-xl shadow-sm p-6 hover-lift">
                                            <div className="flex items-center">
                                                <div className="p-3 bg-purple-100 rounded-lg">
                                                    <span className="text-2xl">🎯</span>
                                                </div>
                                                <div className="ml-4">
                                                    <p className="text-sm text-gray-600">Rakip Markalar</p>
                                                    <p className="text-2xl font-bold text-gray-800">
                                                        {stores.reduce((total, store) => 
                                                            total + (store.competitorBrands?.filter(brand => brand.trim()).length || 0), 0
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mağaza Kartları */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {getFilteredStores().map((dbStore) => {
                                            const userStore = stores.find(s => s.id === dbStore.id);
                                            const competitorCount = userStore?.competitorBrands?.filter(brand => brand.trim()).length || 0;
                                            const hasData = !!userStore;
                                            const images = userStore?.images || ['', '', '', '', ''];
                                            
                                            return (
                                                <StoreCard
                                                    key={dbStore.id}
                                                    dbStore={dbStore}
                                                    userStore={userStore}
                                                    competitorCount={competitorCount}
                                                    hasData={hasData}
                                                    images={images}
                                                    onEdit={() => handleStoreSelection(dbStore.id)}
                                                    stores={stores}
                                                    setStores={setStores}
                                                    saveStore={saveToFirebase}
                                                />
                                            );
                                        })}
                                    </div>
                                    
                                    {getFilteredStores().length === 0 && (
                                        <div className="text-center py-12">
                                            <p className="text-gray-500 text-lg">Arama kriterlerinize uygun mağaza bulunamadı.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Brands View */}
                            {currentView === 'brands' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Rakip İstatistikleri</h2>
                                    
                                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6 hover-lift">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white hover-lift">
                                                <div className="flex items-center">
                                                    <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                                                        <span className="text-2xl">🎯</span>
                                                    </div>
                                                    <div className="ml-4">
                                                        <p className="text-red-100">Toplam Rakip Marka</p>
                                                        <p className="text-3xl font-bold">{getAllCompetitors().length}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white hover-lift">
                                                <div className="flex items-center">
                                                    <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                                                        <span className="text-2xl">📍</span>
                                                    </div>
                                                    <div className="ml-4">
                                                        <p className="text-orange-100">En Yaygın Rakip</p>
                                                        <p className="text-lg font-bold">
                                                            {getAllCompetitors().length > 0 ? getAllCompetitors()[0].name : 'Henüz Yok'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white hover-lift">
                                                <div className="flex items-center">
                                                    <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                                                        <span className="text-2xl">🏪</span>
                                                    </div>
                                                    <div className="ml-4">
                                                        <p className="text-purple-100">Maks. Lokasyon</p>
                                                        <p className="text-3xl font-bold">
                                                            {getAllCompetitors().length > 0 ? getAllCompetitors()[0].count : 0}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {getAllCompetitors().length > 0 ? (
                                        <div className="bg-white rounded-xl shadow-sm overflow-hidden hover-lift">
                                            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
                                                <h3 className="text-lg font-semibold text-gray-800">Rakip Marka Listesi</h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Lokasyon sayısına göre sıralanmıştır
                                                </p>
                                            </div>
                                            
                                            {/* Mobile Card Layout, Desktop Table */}
                                            <div className="block sm:hidden">
                                                <div className="divide-y divide-gray-200">
                                                    {getAllCompetitors().map((competitor, index) => (
                                                        <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                                                            <div className="flex items-start justify-between mb-2">
                                                                <div className="flex items-center gap-3">
                                                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                                                        index === 0 ? 'bg-red-500' : 
                                                                        index === 1 ? 'bg-orange-500' : 
                                                                        index === 2 ? 'bg-yellow-500' : 'bg-gray-400'
                                                                    }`}>
                                                                        {index + 1}
                                                                    </span>
                                                                    <div className="font-medium text-gray-900 text-sm">
                                                                        {competitor.name}
                                                                    </div>
                                                                </div>
                                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                    competitor.count >= 5 ? 'bg-red-100 text-red-800' :
                                                                    competitor.count >= 3 ? 'bg-orange-100 text-orange-800' :
                                                                    competitor.count >= 2 ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                    {competitor.count} lokasyon
                                                                </span>
                                                            </div>
                                                            <div className="mt-2">
                                                                <p className="text-xs text-gray-500 mb-1">Mağazalar:</p>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {competitor.stores.slice(0, 2).map((store, idx) => (
                                                                        <span key={idx} className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                                                            {store.length > 15 ? store.substring(0, 15) + '...' : store}
                                                                        </span>
                                                                    ))}
                                                                    {competitor.stores.length > 2 && (
                                                                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                                                            +{competitor.stores.length - 2} daha
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {competitor.stores.length > 2 && (
                                                                    <details className="mt-1 relative z-20">
                                                                        <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800 py-1">Tümünü göster</summary>
                                                                        <div className="mt-1 flex flex-wrap gap-1 bg-white p-2 rounded border shadow-lg">
                                                                            {competitor.stores.map((store, idx) => (
                                                                                <span key={idx} className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                                                                    {store}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </details>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Desktop Table View */}
                                            <div className="hidden sm:block overflow-x-auto">
                                                <table className="w-full">
                                                    <thead className="bg-gray-50 border-b border-gray-200">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marka Adı</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kaç Lokasyon?</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mağazalar</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {getAllCompetitors().map((competitor, index) => (
                                                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="flex items-center">
                                                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                                                                            index === 0 ? 'bg-red-500' : 
                                                                            index === 1 ? 'bg-orange-500' : 
                                                                            index === 2 ? 'bg-yellow-500' : 'bg-gray-400'
                                                                        }`}>
                                                                            {index + 1}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-sm font-medium text-gray-900">{competitor.name}</div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                                                        competitor.count >= 5 ? 'bg-red-100 text-red-800' :
                                                                        competitor.count >= 3 ? 'bg-orange-100 text-orange-800' :
                                                                        competitor.count >= 2 ? 'bg-yellow-100 text-yellow-800' :
                                                                        'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                        {competitor.count} lokasyon
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="max-w-xs">
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {competitor.stores.slice(0, 3).map((store, idx) => (
                                                                                <span key={idx} className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                                                                    {store}
                                                                                </span>
                                                                            ))}
                                                                            {competitor.stores.length > 3 && (
                                                                                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                                                                    +{competitor.stores.length - 3} daha
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        {competitor.stores.length > 3 && (
                                                                            <div className="mt-2 text-xs text-gray-500">
                                                                                <details className="cursor-pointer">
                                                                                    <summary className="hover:text-gray-700">Tümünü göster</summary>
                                                                                    <div className="mt-1 flex flex-wrap gap-1">
                                                                                        {competitor.stores.map((store, idx) => (
                                                                                            <span key={idx} className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                                                                                {store}
                                                                                            </span>
                                                                                        ))}
                                                                                    </div>
                                                                                </details>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-xl shadow-sm p-12 text-center hover-lift">
                                            <div className="text-6xl mb-4">🎯</div>
                                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Henüz Rakip Marka Verisi Yok</h3>
                                            <p className="text-gray-600 mb-4">Mağaza bilgileri bölümünden rakip marka ekleyerek bu raporu doldurun.</p>
                                            <button
                                                onClick={() => { setCurrentView('management'); setSidebarOpen(false); }}
                                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors hover-lift"
                                            >
                                                Mağaza Bilgilerine Git
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Management View - Enhanced with new upload features */}
                            {currentView === 'management' && (
                                <div>
                                    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 hover-lift">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Mağaza Seç</label>
                                                <select
                                                    value={selectedStoreName}
                                                    onChange={(e) => handleStoreSelection(e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="">Lütfen Güncelleme Yapılacak Mağazayı Seçiniz</option>
                                                    {storeDatabase.map((store) => (
                                                        <option key={store.id} value={store.id}>
                                                            {store.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Alan (m²)</label>
                                                <input
                                                    type="number"
                                                    value={selectedStore?.size || ''}
                                                    onChange={(e) => updateStore('size', parseInt(e.target.value))}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="bg-white rounded-xl shadow-sm p-6 hover-lift">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Mağaza Fotoğrafları</h3>
                                            
                                            {/* Enhanced Drag & Drop Upload Area - Sadece boş slot varsa göster */}
                                            {selectedStore && selectedStore.images && selectedStore.images.filter(img => img && img.trim()).length < 5 && (
                                                <div className="mb-6">
                                                    <DragDropUpload
                                                        onFilesUpload={handleMultipleImageUpload}
                                                        maxFiles={5 - selectedStore.images.filter(img => img && img.trim()).length}
                                                        uploading={uploading}
                                                    />
                                                </div>
                                            )}

                                            {/* Upload Progress Display */}
                                            {Object.keys(uploadProgress).length > 0 && (
                                                <div className="mb-6 space-y-3">
                                                    <h4 className="text-sm font-medium text-gray-700">📤 Yükleme Durumu:</h4>
                                                    {Object.entries(uploadProgress).map(([key, { progress, fileName }]) => (
                                                        <ProgressBar key={key} progress={progress} fileName={fileName} />
                                                    ))}
                                                </div>
                                            )}
                                            
                                            {/* Image Preview Area */}
                                            <div className="relative mb-4">
                                                <div className="relative flex-shrink-0 h-[260px] w-full bg-gray-100 rounded-lg overflow-hidden group">
                                                    {selectedStore?.images?.[currentImageIndex] && selectedStore.images[currentImageIndex].trim() ? (
                                                        <>
                                                            <img
                                                                src={selectedStore.images[currentImageIndex]}
                                                                alt={`${selectedStore?.name || 'Mağaza'} - ${currentImageIndex + 1}`}
                                                                className="w-full h-full object-cover cursor-pointer"
                                                                onClick={() => setShowModal(true)}
                                                            />
                                                            
                                                            {/* Navigation Arrows */}
                                                            {selectedStore.images.filter(img => img && img.trim()).length > 1 && (
                                                                <>
                                                                    <button
                                                                        onClick={prevImage}
                                                                        className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 sm:p-1.5 rounded-full shadow-lg transition-all z-10"
                                                                    >
                                                                        <ChevronLeft size={20} className="sm:w-4 sm:h-4" />
                                                                    </button>
                                                                    
                                                                    <button
                                                                        onClick={nextImage}
                                                                        className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 sm:p-1.5 rounded-full shadow-lg transition-all z-10"
                                                                    >
                                                                        <ChevronRight size={20} className="sm:w-4 sm:h-4" />
                                                                    </button>
                                                                    
                                                                    {/* Navigation Dots */}
                                                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                                                                        {Array.from({length: 5}, (_, index) => {
                                                                            const hasImage = selectedStore.images[index] && selectedStore.images[index].trim();
                                                                            if (!hasImage) return null;
                                                                            return (
                                                                                <button
                                                                                    key={index}
                                                                                    onClick={() => setCurrentImageIndex(index)}
                                                                                    className={`w-2 h-2 rounded-full transition-all ${
                                                                                        currentImageIndex === index 
                                                                                            ? 'bg-blue-500' 
                                                                                            : 'bg-white bg-opacity-70 hover:bg-opacity-100'
                                                                                    }`}
                                                                                />
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </>
                                                            )}
                                                            
                                                            {/* Enlarge Button */}
                                                            <button
                                                                onClick={() => setShowModal(true)}
                                                                className="absolute top-2 right-2 bg-white bg-opacity-80 hover:bg-opacity-100 p-1.5 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 z-10"
                                                                title="Fotoğrafı büyüt"
                                                            >
                                                                <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                                </svg>
                                                            </button>
                                                            
                                                            {/* Delete Button */}
                                                            <button
                                                                onClick={() => handleImageDelete(currentImageIndex)}
                                                                className="absolute top-2 left-2 bg-white bg-opacity-80 hover:bg-opacity-100 p-1.5 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 z-10"
                                                                title="Fotoğrafı sil"
                                                            >
                                                                <Trash className="w-4 h-4 text-red-500" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                                            <div className="text-center text-gray-500">
                                                                <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                                                    <circle cx="8.5" cy="8.5" r="1.5"/>
                                                                    <polyline points="21,15 16,10 5,21"/>
                                                                </svg>
                                                                <span className="text-lg">Henüz Fotoğraf Yüklenmedi</span>
                                                                <p className="text-sm mt-2">Yukarıdaki alana sürükle bırak</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Modal for enlarged image */}
                                            {showModal && (
                                                <div 
                                                    className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-2 sm:p-4"
                                                    onClick={() => setShowModal(false)}
                                                >
                                                    <div className="relative max-w-5xl max-h-full w-full">
                                                        {selectedStore?.images?.[currentImageIndex] && selectedStore.images[currentImageIndex].trim() ? (
                                                            <img
                                                                src={selectedStore.images[currentImageIndex]}
                                                                alt={`${selectedStore?.name} - Büyük Görünüm`}
                                                                className="w-auto h-[500px] object-contain mx-auto rounded-lg"
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        ) : (
                                                            <div className="bg-white rounded-lg p-8 sm:p-12 max-w-md mx-auto">
                                                                <div className="text-center text-gray-500">
                                                                    <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                                                        <circle cx="8.5" cy="8.5" r="1.5"/>
                                                                        <polyline points="21,15 16,10 5,21"/>
                                                                    </svg>
                                                                    <span className="text-base sm:text-lg">Fotoğraf Bulunamadı</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        <button
                                                            onClick={() => setShowModal(false)}
                                                            className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-white bg-opacity-90 hover:bg-opacity-100 p-3 sm:p-2 rounded-full shadow-lg transition-all"
                                                        >
                                                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                        
                                                        {selectedStore?.images && selectedStore.images.length > 1 && selectedStore.images[currentImageIndex] && selectedStore.images[currentImageIndex].trim() && (
                                                            <>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                                                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 p-3 sm:p-3 rounded-full shadow-lg transition-all"
                                                                >
                                                                    <ChevronLeft size={24} className="text-gray-700" />
                                                                </button>
                                                                
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                                                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 p-3 sm:p-3 rounded-full shadow-lg transition-all"
                                                                >
                                                                    <ChevronRight size={24} className="text-gray-700" />
                                                                </button>
                                                                
                                                                <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3">
                                                                    {Array.from({length: 5}, (_, index) => {
                                                                        const hasImage = selectedStore.images[index] && selectedStore.images[index].trim();
                                                                        if (!hasImage) return null;
                                                                        return (
                                                                            <button
                                                                                key={index}
                                                                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                                                                                className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all ${
                                                                                    currentImageIndex === index 
                                                                                        ? 'bg-blue-500 shadow-md' 
                                                                                        : 'bg-white bg-opacity-70 hover:bg-opacity-90'
                                                                                }`}
                                                                            />
                                                                        );
                                                                    })}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Address Display */}
                                            <div className="border-t pt-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Mağaza Adresi</label>
                                                <textarea
                                                    value={selectedStore?.address || ''}
                                                    readOnly
                                                    rows={3}
                                                    className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-xl shadow-sm p-6 hover-lift">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Marka Yönetimi</h3>
                                            
                                            <div className="mb-6">
                                                <h4 className="text-md font-medium text-gray-700 mb-3">Rakip Markalar</h4>
                                                <div className="space-y-3">
                                                    {Array.from({length: 10}, (_, index) => {
                                                        const brand = selectedStore?.competitorBrands?.[index] || '';
                                                        return (
                                                            <div key={index} className="flex items-center gap-2 sm:gap-3">
                                                                <span className="text-sm text-gray-600 w-6 sm:w-8 flex-shrink-0">
                                                                    {index + 1}.
                                                                </span>
                                                                <input
                                                                    type="text"
                                                                    value={brand}
                                                                    onChange={(e) => updateCompetitorBrand(index, e.target.value)}
                                                                    className={`flex-1 p-2 sm:p-3 border rounded-lg focus:ring-2 focus:border-transparent text-sm sm:text-base transition-all hover-lift ${
                                                                        index === 0 
                                                                            ? 'border-blue-300 focus:ring-blue-500' 
                                                                            : 'border-gray-300 focus:ring-red-500'
                                                                    }`}
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                
                                                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                                                    <h5 className="font-medium text-red-800 mb-2">Rakip Markalar:</h5>
                                                    <div className="flex flex-wrap gap-2">
                                                        {(selectedStore?.competitorBrands || []).filter(brand => brand.trim()).length > 0 ? (
                                                            (selectedStore?.competitorBrands || []).filter(brand => brand.trim()).map((brand, index) => (
                                                                <span key={index} className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full hover-lift">
                                                                    {brand}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-sm text-gray-500">Henüz Rakip Marka Eklenmemiş</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="border-t pt-6">
                                                <h4 className="text-md font-medium text-gray-700 mb-3">Notlar</h4>
                                                <textarea
                                                    value={selectedStore?.notes || ''}
                                                    onChange={(e) => updateStore('notes', e.target.value)}
                                                    placeholder="Lokasyonunuzda mağaza satışlarınıza olumlu veya olumsuz etkisi olduğunu düşüntüğünüz notlarınızı yazınız."
                                                    rows={6}
                                                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all hover-lift"
                                                />
                                                <p className="text-xs text-gray-500 mt-2">
                                                    *Bu Alana Yazılan Bilgiler Herkese Açık Şekilde Görüntülenmektedir.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Enhanced Save Button */}
                                    <div className="mt-6 bg-white rounded-xl shadow-sm p-6 hover-lift">
                                        {selectedStore ? (
                                            <button
                                                onClick={handleSaveStore}
                                                disabled={saving}
                                                className="w-full h-15 flex cursor-pointer shadow-lg transition-all duration-200 hover:shadow-xl disabled:cursor-not-allowed hover-lift"
                                                style={{
                                                    transform: saving ? 'none' : 'translateY(0)',
                                                    width: '100%',
                                                    height: '60px'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!saving) {
                                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                }}
                                            >
                                                <div className={`w-15 h-full flex items-center justify-center rounded-l-lg ${
                                                    saving 
                                                        ? 'bg-gray-600' 
                                                        : lastSaved 
                                                            ? 'bg-green-700' 
                                                            : 'bg-gray-800'
                                                }`} style={{ width: '60px' }}>
                                                    {saving ? (
                                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    ) : lastSaved ? (
                                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : (
                                                        <Save size={20} className="text-white" />
                                                    )}
                                                </div>
                                                <div className={`flex-1 h-full flex items-center justify-center rounded-r-lg font-semibold text-sm ${
                                                    saving 
                                                        ? 'bg-gray-300 text-gray-600' 
                                                        : lastSaved 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {saving ? 'KAYDEDİLİYOR' : lastSaved ? 'KAYDEDİLDİ' : 'KAYDET'}
                                                </div>
                                            </button>
                                        ) : (
                                            <div className="text-center py-4">
                                                <p className="text-gray-500">Düzenlemek İçin Bir Mağaza Seçiniz</p>
                                            </div>
                                        )}
                                        
                                        {lastSaved && (
                                            <p className="text-xs text-gray-500 text-center mt-3">
                                                Son kayıt: {lastSaved.toLocaleTimeString('tr-TR')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }
export default StoreManagementApp;
