
import React from 'react';

interface ImageGalleryProps {
  images: string[];
  onEdit: (prompt: string) => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, onEdit }) => {
  const handleDownload = (dataUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `ethereal-wedding-concept-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (images.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-300 mb-4">
          <i className="fa-solid fa-image text-2xl"></i>
        </div>
        <p className="text-stone-400 text-sm font-medium">Your dream wedding visualizations will appear here</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
      {images.map((img, idx) => (
        <div key={idx} className="relative group rounded-2xl overflow-hidden shadow-lg border border-stone-200 bg-white">
          <img src={img} alt={`Visualization ${idx}`} className="w-full aspect-[3/4] object-cover" />
          
          {/* Action Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
             <div className="flex gap-2">
                <button 
                  onClick={() => onEdit("Apply a vintage film grain and a warmer, sepia-toned filter to this image.")}
                  className="flex-1 py-2 px-3 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-white/40 transition-colors border border-white/30"
                >
                  <i className="fa-solid fa-wand-magic-sparkles mr-1"></i> Vintage
                </button>
                <button 
                  onClick={() => onEdit("Convert this to a high-contrast black and white editorial photograph.")}
                  className="flex-1 py-2 px-3 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-white/40 transition-colors border border-white/30"
                >
                  <i className="fa-solid fa-moon mr-1"></i> B&W
                </button>
             </div>
             <button 
               onClick={() => handleDownload(img, idx)}
               className="mt-2 w-full py-2 px-3 bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-rose-600 transition-colors shadow-lg"
             >
               <i className="fa-solid fa-download mr-1"></i> Download Image
             </button>
             <div className="mt-3 text-[10px] text-white/70 text-center font-medium italic">
               "Refine details via chat"
             </div>
          </div>
          
          {/* Status Badge */}
          {idx === 0 ? (
            <div className="absolute top-3 left-3 px-3 py-1 bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              Latest Concept
            </div>
          ) : (
             <div className="absolute top-3 left-3 px-3 py-1 bg-stone-900/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg">
               Archived
             </div>
          )}

          {/* Quick Download Toggle for Mobile (Always visible icon) */}
          <button 
            onClick={() => handleDownload(img, idx)}
            className="md:hidden absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm text-stone-800 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
          >
            <i className="fa-solid fa-download text-xs"></i>
          </button>
        </div>
      ))}
    </div>
  );
};
