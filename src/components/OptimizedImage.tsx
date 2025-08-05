import { useState, useRef, useEffect } from 'react';
import { FileImage } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
  sizes?: string;
}

const OptimizedImage = ({ 
  src, 
  alt, 
  className = "", 
  fallbackIcon,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const generateSrcSet = (originalSrc: string) => {
    // If it's a Supabase storage URL, generate different sizes
    if (originalSrc.includes('supabase.co/storage')) {
      const baseUrl = originalSrc.split('?')[0];
      return `
        ${baseUrl}?width=300&quality=75 300w,
        ${baseUrl}?width=600&quality=75 600w,
        ${baseUrl}?width=1200&quality=75 1200w
      `.trim();
    }
    return originalSrc;
  };

  const getOptimizedSrc = (originalSrc: string) => {
    // For Supabase storage, add optimization parameters
    if (originalSrc.includes('supabase.co/storage')) {
      return `${originalSrc.split('?')[0]}?width=600&quality=80&format=webp`;
    }
    return originalSrc;
  };

  if (!src || hasError) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 ${className}`}>
        {fallbackIcon || <FileImage className="h-4 w-4 text-slate-400" />}
      </div>
    );
  }

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 bg-slate-200 rounded"></div>
        </div>
      )}
      
      {isInView && (
        <img
          src={getOptimizedSrc(src)}
          srcSet={generateSrcSet(src)}
          sizes={sizes}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
        />
      )}
    </div>
  );
};

export default OptimizedImage;