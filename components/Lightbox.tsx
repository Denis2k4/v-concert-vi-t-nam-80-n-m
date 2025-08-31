/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// SVG Icons for social media
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const FacebookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
);

const TwitterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);

const PinterestIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 12c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.198-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6c2.165 2.165 5.251 2.165 5.251-2.901 0-3.21-2.298-5.72-5.46-5.72-3.755 0-6.101 2.805-6.101 5.864 0 .991.372 2.051.82 2.623.167.22.191.333.129.521-.051.15-.171.649-.22.86-.063.257-.215.346-.417.245-1.569-.47-2.56-1.916-2.56-3.844 0-2.813 2.064-5.251 5.922-5.251 3.101 0 5.484 2.212 5.484 5.029 0 3.692-2.095 6.46-5.119 6.46-.992 0-1.922-.519-2.228-1.148 0 0-.502 1.912-.622 2.376-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 6.623 0 11.983-5.377 11.983-12.017C23.97 5.377 18.64 0 12.017 0z"/></svg>
);

interface LightboxProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl?: string;
    caption?: string;
}

const Lightbox: React.FC<LightboxProps> = ({ isOpen, onClose, imageUrl, caption }) => {
    const appUrl = window.location.href;
    const shareText = `Cùng tôi kỷ niệm 80 năm Quốc Khánh Việt Nam với bức ảnh này! Được tạo bởi ứng dụng Mừng Quốc Khánh trên AI Studio.`;
    const hashtags = "QuocKhanhVietNam,80namQuocKhanh,TuHaoVietNam,AI,Gemini";

    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}&quote=${encodeURIComponent(shareText)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(appUrl)}&hashtags=${encodeURIComponent(hashtags)}`,
        // Pinterest works best with publicly accessible image URLs, but we pass the data URL as a fallback.
        pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(appUrl)}&media=${encodeURIComponent(imageUrl || '')}&description=${encodeURIComponent(shareText)}`,
    };

    const handleShareClick = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
    };

    return (
        <AnimatePresence>
            {isOpen && imageUrl && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative bg-neutral-900 rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col items-center p-6 border border-white/10"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors z-10"
                            aria-label="Close image viewer"
                        >
                            <CloseIcon />
                        </button>
                        <div className="w-full h-auto overflow-hidden rounded-md">
                            <img src={imageUrl} alt={caption} className="w-full h-full object-contain max-h-[65vh]" />
                        </div>
                        <div className="w-full mt-4 text-center">
                            <h3 className="font-sriracha text-2xl text-neutral-100">{caption}</h3>
                            <div className="mt-4 flex justify-center items-center gap-4">
                                <span className="text-neutral-400 text-sm font-sriracha">Chia sẻ:</span>
                                <button onClick={() => handleShareClick(shareLinks.facebook)} aria-label="Share on Facebook" className="text-neutral-400 hover:text-white transition-colors"><FacebookIcon /></button>
                                <button onClick={() => handleShareClick(shareLinks.twitter)} aria-label="Share on Twitter" className="text-neutral-400 hover:text-white transition-colors"><TwitterIcon /></button>
                                <button onClick={() => handleShareClick(shareLinks.pinterest)} aria-label="Share on Pinterest" className="text-neutral-400 hover:text-white transition-colors"><PinterestIcon /></button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Lightbox;