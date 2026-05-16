import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OCRDropzoneProps {
  onAnalysisComplete: (result: string) => void;
}

export const OCRDropzone: React.FC<OCRDropzoneProps> = ({ onAnalysisComplete }) => {
  const [isUploading, setUploading] = useState(false);
  const [isSuccess, setSuccess] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    
    setUploading(true);
    
    const reader = new FileReader();
    reader.onload = async () => {
      // Simulate OCR with Gemini or a mock
      const mockResult = `Analyzing luxury receipt...
Total: $4,200.50
Vendor: Elite Fleet Services
Category: Maintenance`;
      
      onAnalysisComplete(mockResult);
      setUploading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    };
    reader.readAsDataURL(file);
  }, [onAnalysisComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  return (
    <div {...getRootProps()} className="relative group cursor-pointer">
      <input {...getInputProps()} />
      <div className={`
        h-48 rounded-2xl border-2 border-dashed transition-all duration-500
        flex flex-col items-center justify-center p-6
        ${isDragActive ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}
      `}>
        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center"
            >
              <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
              <p className="text-emerald-400 font-medium">Processing receipt...</p>
            </motion.div>
          ) : isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center"
            >
              <CheckCircle className="w-10 h-10 text-emerald-400 mb-4" />
              <p className="text-emerald-400 font-medium">Analysis Complete</p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-white font-medium mb-1">Drop receipt here</p>
              <p className="text-white/40 text-sm">PDF, PNG, or JPG (Max 5MB)</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
