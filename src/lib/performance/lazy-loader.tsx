import React, { lazy, Suspense, useRef, useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/loading-skeleton";

/**
 * Lazy load a component with loading skeleton
 */
export function lazyLoad<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
): React.FC<React.ComponentProps<T>> {
  const LazyComponent = lazy(importFn);

  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback || <Skeleton />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

/**
 * Lazy load with specific skeleton
 */
export function lazyLoadWithSkeleton<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  SkeletonComponent: React.ComponentType
): React.FC<React.ComponentProps<T>> {
  const LazyComponent = lazy(importFn);

  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={<SkeletonComponent />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

/**
 * Preload a component
 */
export function preloadComponent(importFn: () => Promise<any>) {
  importFn();
}

/**
 * Intersection Observer hook for lazy loading images
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options?: IntersectionObserverInit
) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, options);

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [elementRef, options]);

  return isVisible;
}

/**
 * Lazy image component
 */
export function LazyImage({
  src,
  alt,
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  const imgRef = useRef<HTMLImageElement>(null);
  const isVisible = useIntersectionObserver(imgRef, {
    threshold: 0.1,
    rootMargin: "50px",
  });

  if (!isVisible) {
    return <div ref={imgRef} className={className} {...props} />;
  }

  return <img ref={imgRef} src={src} alt={alt} className={className} {...props} />;
}
