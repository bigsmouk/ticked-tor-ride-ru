import { useState, useEffect, useCallback } from 'react';

// Import all card images
import locomotiveCard from '@/assets/cards/locomotive.png';
import redCard from '@/assets/cards/red.png';
import blueCard from '@/assets/cards/blue.png';
import greenCard from '@/assets/cards/green.png';
import yellowCard from '@/assets/cards/yellow.png';
import orangeCard from '@/assets/cards/orange.png';
import pinkCard from '@/assets/cards/pink.png';
import whiteCard from '@/assets/cards/white.png';
import blackCard from '@/assets/cards/black.png';
import cardBack from '@/assets/cards/card-back.png';

// Import map backgrounds
import europeMapImage from '@/assets/europe-map.jpg';
import testMapBg from '@/assets/test-map-bg.jpg';

// All assets to preload
const CARD_ASSETS = [
  locomotiveCard,
  redCard,
  blueCard,
  greenCard,
  yellowCard,
  orangeCard,
  pinkCard,
  whiteCard,
  blackCard,
  cardBack,
];

const MAP_ASSETS = [
  europeMapImage,
  testMapBg,
];

const ALL_ASSETS = [...CARD_ASSETS, ...MAP_ASSETS];

// Global cache to track loaded assets
const loadedAssets = new Set<string>();
let isFullyLoaded = false;

// Preload a single image
const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Already loaded
    if (loadedAssets.has(src)) {
      resolve();
      return;
    }

    const img = new Image();
    img.onload = () => {
      loadedAssets.add(src);
      resolve();
    };
    img.onerror = () => {
      console.warn(`[AssetPreloader] Failed to load: ${src}`);
      // Resolve anyway to not block
      resolve();
    };
    img.src = src;
  });
};

// Preload all assets
export const preloadAllAssets = async (
  onProgress?: (loaded: number, total: number) => void
): Promise<void> => {
  if (isFullyLoaded) {
    onProgress?.(ALL_ASSETS.length, ALL_ASSETS.length);
    return;
  }

  let loaded = 0;
  const total = ALL_ASSETS.length;

  await Promise.all(
    ALL_ASSETS.map(async (src) => {
      await preloadImage(src);
      loaded++;
      onProgress?.(loaded, total);
    })
  );

  isFullyLoaded = true;
};

// Hook for preloading assets with progress
export const useAssetPreloader = () => {
  const [isLoading, setIsLoading] = useState(!isFullyLoaded);
  const [progress, setProgress] = useState(isFullyLoaded ? 100 : 0);
  const [loadedCount, setLoadedCount] = useState(isFullyLoaded ? ALL_ASSETS.length : 0);
  const [totalCount] = useState(ALL_ASSETS.length);

  const startPreload = useCallback(async () => {
    if (isFullyLoaded) {
      setIsLoading(false);
      setProgress(100);
      return;
    }

    setIsLoading(true);
    
    await preloadAllAssets((loaded, total) => {
      setLoadedCount(loaded);
      setProgress(Math.round((loaded / total) * 100));
    });

    setIsLoading(false);
  }, []);

  useEffect(() => {
    startPreload();
  }, [startPreload]);

  return {
    isLoading,
    progress,
    loadedCount,
    totalCount,
    isReady: !isLoading && progress === 100,
  };
};

// Export assets for use in components (already imported, no re-fetch)
export const PRELOADED_CARDS = {
  locomotive: locomotiveCard,
  red: redCard,
  blue: blueCard,
  green: greenCard,
  yellow: yellowCard,
  orange: orangeCard,
  pink: pinkCard,
  white: whiteCard,
  black: blackCard,
  cardBack: cardBack,
};

export const PRELOADED_MAPS = {
  europe: europeMapImage,
  test: testMapBg,
};
