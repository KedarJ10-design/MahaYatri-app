import React, { useState, useEffect, useRef } from 'react';

// Helper function to generate responsive image sources
const generateSrcSet = (baseSrc: string) => {
  // If it's a mock image from picsum or a placeholder, don't generate a srcset.
  if (baseSrc.includes('picsum.photos') || !baseSrc) {
    return { src: baseSrc, srcSet: undefined };
  }

  const lastDot = baseSrc.lastIndexOf('.');
  if (lastDot === -1) {
    return { src: baseSrc, srcSet: undefined }; // Not a file with an extension
  }

  const base = baseSrc.substring(0, lastDot);
  const ext = baseSrc.substring(lastDot);
  
  // Define the sizes you configured in the Firebase Resize Images extension
  const sizes = [200, 400, 800, 1200]; 
  const imageSizes = {
    '200': '200x200',
    '400': '600x400', // Common card size
    '800': '800x600',
    '1200': '1200x500', // Common hero size
  }

  const srcSet = sizes.map(size => {
    // This naming convention `_WIDTHxHEIGHT` is the default for the Firebase Extension
    const dimension = imageSizes[size.toString()] || `${size}x${size}`;
    const url = `${base}_${dimension}${ext}`;
    return `${url} ${size}w`;
  }).join(', ');
  
  // Return the smallest size as the default src to load initially
  const defaultSrc = `${base}_${imageSizes['200']}${ext}`;

  return { src: defaultSrc, srcSet };
};


interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholderClassName?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className, placeholderClassName, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const placeholderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '100px' } // Start loading 100px before it enters the viewport
    );

    if (placeholderRef.current) {
      observer.observe(placeholderRef.current);
    }

    return () => {
      if (placeholderRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(placeholderRef.current);
      }
    };
  }, []);

  const { src: optimizedSrc, srcSet } = generateSrcSet(src);
  const lowQualitySrc = src.includes('picsum.photos') ? src.replace(/\d+\/\d+$/, '20/15') : undefined;

  return (
    <div ref={placeholderRef} className={`relative overflow-hidden ${className}`}>
      {lowQualitySrc && (
        <img
          src={lowQualitySrc}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover lazy-image-placeholder ${placeholderClassName}`}
          style={{ opacity: isLoaded ? 0 : 1 }}
          aria-hidden="true"
        />
      )}
      
      {isInView && (
        <img
          src={optimizedSrc}
          srcSet={srcSet}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover lazy-image ${placeholderClassName}`}
          style={{ opacity: isLoaded ? 1 : 0 }}
          loading="lazy" // Native browser lazy loading as a fallback
          {...props}
        />
      )}
    </div>
  );
};

export default LazyImage;
