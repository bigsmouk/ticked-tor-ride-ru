import React from 'react';
import { useAssetPreloader } from '@/hooks/useAssetPreloader';

interface AssetPreloaderProps {
  children: React.ReactNode;
}

// Loading overlay component (rendered separately to avoid hook issues)
const LoadingOverlay: React.FC<{
  progress: number;
  loadedCount: number;
  totalCount: number;
}> = ({ progress, loadedCount, totalCount }) => (
  <div className="fixed inset-0 z-[9999] min-h-screen parchment flex items-center justify-center">
    <div className="text-center max-w-md">
      {/* Animated train */}
      <div className="relative h-16 mb-6 overflow-hidden">
        <div 
          className="absolute text-5xl transition-transform duration-300"
          style={{ 
            left: `${Math.min(progress, 90)}%`,
            transform: 'translateX(-50%)',
          }}
        >
          🚂
        </div>
        {/* Track */}
        <div className="absolute bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-700 to-transparent rounded-full" />
      </div>
      
      {/* Progress bar */}
      <div className="relative h-4 bg-amber-900/30 rounded-full overflow-hidden border-2 border-amber-700/50 mb-4">
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-200 rounded-full"
          style={{ width: `${progress}%` }}
        />
        <div 
          className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"
        />
      </div>
      
      <p className="font-display text-lg text-foreground mb-2">
        Загрузка ассетов игры...
      </p>
      <p className="text-sm text-muted-foreground">
        {loadedCount} / {totalCount} ({progress}%)
      </p>
    </div>
  </div>
);

export const AssetPreloader: React.FC<AssetPreloaderProps> = ({ children }) => {
  const { isLoading, progress, loadedCount, totalCount } = useAssetPreloader();

  // Always render children to maintain consistent hook calls
  // Show loading overlay on top when loading
  return (
    <>
      {isLoading && (
        <LoadingOverlay 
          progress={progress} 
          loadedCount={loadedCount} 
          totalCount={totalCount} 
        />
      )}
      {/* Always render children but hide visually during loading */}
      <div style={{ visibility: isLoading ? 'hidden' : 'visible', height: isLoading ? 0 : 'auto', overflow: isLoading ? 'hidden' : 'visible' }}>
        {children}
      </div>
    </>
  );
};
