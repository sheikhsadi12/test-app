import React, { useRef, useState } from 'react';
import { Upload, FileText, Image as ImageIcon, X, Plus } from 'lucide-react';
import { UploadedFile } from '../../types';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  uploadedFiles: UploadedFile[];
  onRemoveFile: (id: string) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ 
  onFilesSelected, 
  uploadedFiles, 
  onRemoveFile 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files).filter(isValidFile);
      if (filesArray.length > 0) {
        onFilesSelected(filesArray);
      } else {
        alert("Please upload valid images (PNG, JPG, WEBP) or PDFs.");
      }
    }
  };

  const isValidFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    return validTypes.includes(file.type);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files).filter(isValidFile);
      onFilesSelected(filesArray);
    }
    // Reset input so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Grid of uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 max-h-[300px] overflow-y-auto p-1">
          {uploadedFiles.map((fileObj) => {
            const isPdf = fileObj.file.type === 'application/pdf';
            return (
              <div key={fileObj.id} className="relative group bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden aspect-square">
                {isPdf ? (
                   <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-gray-50">
                      <FileText className="w-8 h-8 text-red-500 mb-2" />
                      <span className="text-xs text-center text-gray-600 truncate w-full px-1">{fileObj.file.name}</span>
                   </div>
                ) : (
                  <img 
                    src={fileObj.previewUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onRemoveFile(fileObj.id); }}
                    className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
          
          {/* Add more button inside grid if needed, or keep the main dropzone */}
          <button 
            onClick={handleBrowseClick}
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg aspect-square hover:bg-gray-50 hover:border-indigo-400 transition-colors text-gray-500 hover:text-indigo-600"
          >
            <Plus className="w-8 h-8 mb-1" />
            <span className="text-xs font-medium">Add Page</span>
          </button>
        </div>
      )}

      {/* Main Dropzone - Only show prominent instructions if no files, or as a smaller bar if files exist */}
      {uploadedFiles.length === 0 && (
        <div
          className={`relative w-full border-2 border-dashed rounded-xl p-8 transition-all duration-200 ease-in-out text-center cursor-pointer
            ${isDragging 
              ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]' 
              : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                Click to upload multiple pages
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Drag & drop up to 10 images or PDFs
              </p>
            </div>
          </div>
        </div>
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple // Enable multiple file selection
        accept="image/png, image/jpeg, image/webp, application/pdf"
        onChange={handleFileInputChange}
      />
    </div>
  );
};