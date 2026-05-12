import { useRef, useState } from 'react';
import { Cloud, Upload } from './Icons';

export default function DragDropUpload({ onFilesUpload, maxFiles = 5, uploading = false }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const imageFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (imageFiles.length > 0) {
      onFilesUpload(imageFiles.slice(0, maxFiles));
    } else {
      alert('Lütfen sadece resim dosyaları seçin');
    }
  };

  const handleFileSelect = (e) => {
    onFilesUpload(Array.from(e.target.files).slice(0, maxFiles));
    e.target.value = '';
  };

  return (
    <div
      className={`drag-zone p-8 text-center rounded-xl cursor-pointer hover-lift ${isDragOver ? 'drag-over' : ''} ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !uploading && fileInputRef.current?.click()}
    >
      <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" disabled={uploading} />
      <div className="space-y-4">
        {uploading
          ? <Cloud className="w-12 h-12 mx-auto text-blue-500 animate-pulse" />
          : <Upload className="w-12 h-12 mx-auto text-gray-400" />
        }
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          {uploading ? 'Fotoğraflar Yükleniyor...' : 'Fotoğraf Yükle'}
        </h3>
      </div>
    </div>
  );
}
