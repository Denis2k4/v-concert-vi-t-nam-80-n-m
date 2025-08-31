
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, ChangeEvent, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { generateCelebrationImage } from './services/geminiService';
import PolaroidCard from './components/PolaroidCard';
import Lightbox from './components/Lightbox';
import { createAlbumPage } from './lib/albumUtils';
import Footer from './components/Footer';

// New themes and prompts based on user request
const THEMES_CONFIG: Record<string, string> = {
    'Vũ Điệu Cờ Bay': "A photorealistic image. The person from the uploaded photo is the main subject. It is critically important to preserve the exact likeness of the person: their facial features, bone structure, skin tone, hair color and style, and body shape must be identical to the original photo. The final image must look like the same person. The person is in a flowing red dress, with the skirt swirling dynamically around them, looking up and smiling joyfully. They are standing outdoors on a street in Vietnam. The background is filled with numerous red flags of Vietnam with a yellow star and red flags of the Communist Party of Vietnam with a yellow hammer and sickle, hanging in lines above the street and from buildings. The scene is brightly lit by natural light, suggesting a festive and celebratory atmosphere, for the 80th anniversary of Vietnam's National Day. The photo is a full-body shot, captured in a vibrant and dynamic style. DO NOT generate any text, letters, or numbers in the image.",
    'Chào Người Lính': "A photorealistic image. The person from the uploaded photo is the main subject. It is critically important to preserve the exact likeness of the person: their facial features, bone structure, skin tone, hair color and style, and body shape must be identical to the original photo. The final image must look like the same person. The person is standing on a street in Hanoi during a parade, holding a large red flag with a yellow star. They are smiling joyfully as a soldier in a parade formation looks their way and salutes. The image is a close-up, focusing on the connection between the proud civilian and the disciplined military, set against a backdrop of patriotic celebration for the 80th anniversary of Vietnam's National Day. DO NOT generate any text, letters, or numbers in the image.",
    'Nụ Cười Rạng Rỡ': "A photorealistic image. The person from the uploaded photo is the main subject. It is critically important to preserve the exact likeness of the person: their facial features, bone structure, skin tone, hair color and style, and body shape must be identical to the original photo. The final image must look like the same person. The person has a joyful smile and is holding up a large red flag of Vietnam with a yellow star. The background is a bright, festive street scene with red flags and lanterns, for the 80th anniversary of Vietnam's National Day. The sunlight creates a beautiful, radiant glow behind them. The photo is a close-up, focusing on the person and the flag, capturing a feeling of national pride and happiness. DO NOT generate any text, letters, or numbers in the image.",
    'Dáng Hình Kiêu Hãnh': "A photorealistic image. The person from the uploaded photo is the main subject. It is critically important to preserve the exact likeness of the person: their facial features, bone structure, skin tone, hair color and style, and body shape must be identical to the original photo. The final image must look like the same person. The person is in a flowing red dress, with the skirt fanning out in a wide circle, posing while looking over their shoulder at the camera with a proud expression, and their hands are raised. They are standing in front of a building decorated with a grid of many red flags of Vietnam with a yellow star. The scene is brightly lit and dynamic for the 80th anniversary of Vietnam's National Day. The photo is a wide shot, showing the full spread of their dress against the impressive backdrop of the flags, conveying a sense of celebration and elegance. DO NOT generate any text, letters, or numbers in the image.",
    'Con Đường Rực Rỡ': "A photorealistic image. The person from the uploaded photo is the main subject. It is critically important to preserve the exact likeness of the person: their facial features, bone structure, skin tone, hair color and style, and body shape must be identical to the original photo. The final image must look like the same person. The person is in a flowing red dress, with the skirt swirling dynamically around them, looking up and smiling joyfully. They are standing outdoors on a street in Vietnam. The background is filled with numerous red flags of Vietnam with a yellow star and red flags of the Communist Party of Vietnam with a yellow hammer and sickle, hanging in lines above the street and from buildings. The scene is brightly lit by natural light, suggesting a festive and celebratory atmosphere, for the 80th anniversary of Vietnam's National Day. The photo is a full-body shot, captured in a vibrant and dynamic style. DO NOT generate any text, letters, or numbers in the image.",
    'Ánh Nắng Mùa Thu': "A photorealistic image. The person from the uploaded photo is the main subject. It is critically important to preserve the exact likeness of the person: their facial features, bone structure, skin tone, hair color and style, and body shape must be identical to the original photo. The final image must look like the same person. The person has a joyful smile and is holding up a large red flag of Vietnam with a yellow star. The background is a bright, festive street scene with red flags and lanterns, for the 80th anniversary of Vietnam's National Day. The sunlight creates a beautiful, radiant glow behind them. The photo is a close-up, focusing on the person and the flag, capturing a feeling of national pride and happiness. DO NOT generate any text, letters, or numbers in the image."
};

const ALL_THEMES = Object.keys(THEMES_CONFIG);


// Pre-defined positions for a scattered look on desktop
const POSITIONS = [
    { top: '5%', left: '10%', rotate: -8 },
    { top: '15%', left: '60%', rotate: 5 },
    { top: '45%', left: '5%', rotate: 3 },
    { top: '2%', left: '35%', rotate: 10 },
    { top: '40%', left: '70%', rotate: -12 },
    { top: '50%', left: '38%', rotate: -3 },
];

const GHOST_POLAROIDS_CONFIG = [
  { initial: { x: "-150%", y: "-100%", rotate: -30 }, transition: { delay: 0.2 } },
  { initial: { x: "150%", y: "-80%", rotate: 25 }, transition: { delay: 0.4 } },
  { initial: { x: "-120%", y: "120%", rotate: 45 }, transition: { delay: 0.6 } },
  { initial: { x: "180%", y: "90%", rotate: -20 }, transition: { delay: 0.8 } },
  { initial: { x: "0%", y: "-200%", rotate: 0 }, transition: { delay: 0.5 } },
  { initial: { x: "100%", y: "150%", rotate: 10 }, transition: { delay: 0.3 } },
];


type ImageStatus = 'pending' | 'done' | 'error';
interface GeneratedImage {
    status: ImageStatus;
    url?: string;
    error?: string;
}

const primaryButtonClasses = "font-sriracha text-xl text-center text-black bg-yellow-400 py-3 px-8 rounded-sm transform transition-transform duration-200 hover:scale-105 hover:-rotate-2 hover:bg-yellow-300 shadow-[2px_2px_0px_2px_rgba(0,0,0,0.2)]";
const secondaryButtonClasses = "font-sriracha text-xl text-center text-white bg-white/10 backdrop-blur-sm border-2 border-white/80 py-3 px-8 rounded-sm transform transition-transform duration-200 hover:scale-105 hover:rotate-2 hover:bg-white hover:text-black";

const useMediaQuery = (query: string) => {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        window.addEventListener('resize', listener);
        return () => window.removeEventListener('resize', listener);
    }, [matches, query]);
    return matches;
};

const getPromptForTheme = (theme: string): string => {
    return THEMES_CONFIG[theme] || `A photorealistic image of the person from the uploaded photo, celebrating the 80th anniversary of Vietnam's National Day. It is critically important to preserve the exact likeness of the person.`;
};


function App() {
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [generatedImages, setGeneratedImages] = useState<Record<string, GeneratedImage>>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    const [appState, setAppState] = useState<'idle' | 'image-uploaded' | 'generating' | 'results-shown'>('idle');
    const [selectedImage, setSelectedImage] = useState<{ url: string; caption: string } | null>(null);
    const [currentThemes, setCurrentThemes] = useState<string[]>([]);
    const dragAreaRef = useRef<HTMLDivElement>(null);
    const isMobile = useMediaQuery('(max-width: 768px)');

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result as string);
                setAppState('image-uploaded');
                setGeneratedImages({}); // Clear previous results
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerateClick = async () => {
        if (!uploadedImage) return;

        setIsLoading(true);
        setAppState('generating');
        
        // Randomly select 6 themes for this session
        const shuffled = [...ALL_THEMES].sort(() => 0.5 - Math.random());
        const selectedThemes = shuffled.slice(0, 6);
        setCurrentThemes(selectedThemes);

        const initialImages: Record<string, GeneratedImage> = {};
        selectedThemes.forEach(theme => {
            initialImages[theme] = { status: 'pending' };
        });
        setGeneratedImages(initialImages);

        // Process themes sequentially to avoid hitting API rate limits
        for (const theme of selectedThemes) {
            try {
                const prompt = getPromptForTheme(theme);
                const resultUrl = await generateCelebrationImage(uploadedImage, prompt, theme);
                setGeneratedImages(prev => ({
                    ...prev,
                    [theme]: { status: 'done', url: resultUrl },
                }));
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
                setGeneratedImages(prev => ({
                    ...prev,
                    [theme]: { status: 'error', error: errorMessage },
                }));
                console.error(`Failed to generate image for ${theme}:`, err);
            }
        }

        setIsLoading(false);
        setAppState('results-shown');
    };

    const handleRegenerateTheme = async (theme: string) => {
        if (!uploadedImage) return;

        if (generatedImages[theme]?.status === 'pending') {
            return;
        }
        
        console.log(`Regenerating image for ${theme}...`);

        setGeneratedImages(prev => ({
            ...prev,
            [theme]: { status: 'pending' },
        }));

        try {
            const prompt = getPromptForTheme(theme);
            const resultUrl = await generateCelebrationImage(uploadedImage, prompt, theme);
            setGeneratedImages(prev => ({
                ...prev,
                [theme]: { status: 'done', url: resultUrl },
            }));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setGeneratedImages(prev => ({
                ...prev,
                [theme]: { status: 'error', error: errorMessage },
            }));
            console.error(`Failed to regenerate image for ${theme}:`, err);
        }
    };
    
    const handleReset = () => {
        setUploadedImage(null);
        setGeneratedImages({});
        setCurrentThemes([]);
        setAppState('idle');
    };

    const handleDownloadIndividualImage = (theme: string) => {
        const image = generatedImages[theme];
        if (image?.status === 'done' && image.url) {
            const link = document.createElement('a');
            link.href = image.url;
            link.download = `quoc-khanh-viet-nam-${theme.toLowerCase().replace(/ /g, '-')}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleDownloadAlbum = async () => {
        setIsDownloading(true);
        try {
            const imageData = Object.entries(generatedImages)
                .filter(([, image]) => image.status === 'done' && image.url)
                .reduce((acc, [theme, image]) => {
                    acc[theme] = image!.url!;
                    return acc;
                }, {} as Record<string, string>);

            if (Object.keys(imageData).length < currentThemes.length) {
                alert("Vui lòng đợi tất cả các ảnh được tạo xong trước khi tải xuống album.");
                setIsDownloading(false);
                return;
            }

            const albumDataUrl = await createAlbumPage(imageData);

            const link = document.createElement('a');
            link.href = albumDataUrl;
            link.download = 'album-k-niem-80-nam-quoc-khanh.jpg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error("Failed to create or download album:", error);
            alert("Rất tiếc, đã có lỗi xảy ra khi tạo album của bạn. Vui lòng thử lại.");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleCardClick = (url: string, caption: string) => {
        setSelectedImage({ url, caption });
    };

    return (
        <main className="bg-red-900 text-neutral-200 min-h-screen w-full flex flex-col items-center justify-center p-4 pb-24 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-grid-yellow-300/[0.08]"></div>
            
            <div className="z-10 flex flex-col items-center justify-center w-full h-full flex-1 min-h-0">
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-6xl font-lobster font-bold text-yellow-300">V-Concert VIỆT NAM 80 Năm - By MDNguyen</h1>
                    <p className="font-sriracha text-neutral-100 mt-4 text-xl tracking-wide">2/9/1945 - 2/9/2025: Tự hào Việt Nam!</p>
                    <p className="font-sriracha text-cyan-300 mt-2 text-base tracking-wide">
                        Follow Facebook <a href="https://www.facebook.com/MD0942466866" target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-200">MDNguyen</a> để có thêm nhiều ứng dụng tạo ảnh mới nhất.
                    </p>
                </div>

                {appState === 'idle' && (
                     <div className="relative flex flex-col items-center justify-center w-full h-full">
                        {/* STAR BACKGROUND */}
                        <svg className="absolute inset-0 m-auto w-[60%] h-[60%] max-w-md max-h-md text-yellow-400 opacity-10" viewBox="0 0 51 48" aria-hidden="true">
                            <path fill="currentColor" d="m25,1 6,17h18l-14,11 5,17-15-10-15,10 5-17-14-11h18z"/>
                        </svg>

                        {/* Ghost polaroids for intro animation */}
                        {GHOST_POLAROIDS_CONFIG.map((config, index) => (
                             <motion.div
                                key={index}
                                className="absolute w-80 h-[26rem] rounded-md p-4 bg-neutral-100/10 blur-sm"
                                initial={config.initial}
                                animate={{
                                    x: "0%", y: "0%", rotate: (Math.random() - 0.5) * 20,
                                    scale: 0,
                                    opacity: 0,
                                }}
                                transition={{
                                    ...config.transition,
                                    ease: "circOut",
                                    duration: 2,
                                }}
                            />
                        ))}
                        <motion.div
                             initial={{ opacity: 0, scale: 0.8 }}
                             animate={{ opacity: 1, scale: 1 }}
                             transition={{ delay: 2, duration: 0.8, type: 'spring' }}
                             className="flex flex-col items-center"
                        >
                            <label htmlFor="file-upload" className="cursor-pointer group transform hover:scale-105 transition-transform duration-300">
                                 <PolaroidCard 
                                     caption="Bấm để bắt đầu"
                                     status="done"
                                 />
                            </label>
                            <input id="file-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} />
                            <p className="mt-8 font-sriracha text-neutral-300 text-center max-w-xs text-lg">
                                Bấm vào ảnh để tải lên và bắt đầu hành trình của bạn.
                            </p>
                        </motion.div>
                    </div>
                )}

                {appState === 'image-uploaded' && uploadedImage && (
                    <div className="flex flex-col items-center gap-6">
                         <PolaroidCard 
                            imageUrl={uploadedImage} 
                            caption="Ảnh của bạn" 
                            status="done"
                         />
                         <div className="flex items-center gap-4 mt-4">
                            <button onClick={handleReset} className={secondaryButtonClasses}>
                                Đổi ảnh khác
                            </button>
                            <button onClick={handleGenerateClick} className={primaryButtonClasses}>
                                Tạo ảnh
                            </button>
                         </div>
                    </div>
                )}

                {(appState === 'generating' || appState === 'results-shown') && (
                     <>
                        {isMobile ? (
                            <div className="w-full max-w-sm flex-1 overflow-y-auto mt-4 space-y-8 p-4">
                                {currentThemes.map((theme) => (
                                    <div key={theme} className="flex justify-center">
                                         <PolaroidCard
                                            caption={theme}
                                            status={generatedImages[theme]?.status || 'pending'}
                                            imageUrl={generatedImages[theme]?.url}
                                            error={generatedImages[theme]?.error}
                                            onShake={handleRegenerateTheme}
                                            onDownload={handleDownloadIndividualImage}
                                            onClick={handleCardClick}
                                            isMobile={isMobile}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div ref={dragAreaRef} className="relative w-full max-w-5xl h-[600px] mt-4">
                                {currentThemes.map((theme, index) => {
                                    const { top, left, rotate } = POSITIONS[index];
                                    return (
                                        <motion.div
                                            key={theme}
                                            className="absolute cursor-grab active:cursor-grabbing"
                                            style={{ top, left }}
                                            initial={{ opacity: 0, scale: 0.5, y: 100, rotate: 0 }}
                                            animate={{ 
                                                opacity: 1, 
                                                scale: 1, 
                                                y: 0,
                                                rotate: `${rotate}deg`,
                                            }}
                                            transition={{ type: 'spring', stiffness: 100, damping: 20, delay: index * 0.15 }}
                                        >
                                            <PolaroidCard 
                                                dragConstraintsRef={dragAreaRef}
                                                caption={theme}
                                                status={generatedImages[theme]?.status || 'pending'}
                                                imageUrl={generatedImages[theme]?.url}
                                                error={generatedImages[theme]?.error}
                                                onShake={handleRegenerateTheme}
                                                onDownload={handleDownloadIndividualImage}
                                                onClick={handleCardClick}
                                                isMobile={isMobile}
                                            />
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                         <div className="h-20 mt-4 flex items-center justify-center">
                            {appState === 'results-shown' && (
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <button 
                                        onClick={handleDownloadAlbum} 
                                        disabled={isDownloading} 
                                        className={`${primaryButtonClasses} disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {isDownloading ? 'Đang tạo Album...' : 'Tải Album'}
                                    </button>
                                    <button onClick={handleReset} className={secondaryButtonClasses}>
                                        Làm lại từ đầu
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
            <Lightbox 
                isOpen={!!selectedImage}
                onClose={() => setSelectedImage(null)}
                imageUrl={selectedImage?.url}
                caption={selectedImage?.caption}
            />
            <Footer />
        </main>
    );
}

export default App;
