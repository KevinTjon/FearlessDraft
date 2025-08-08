// Global image preloader for champion splash arts
import { allChampions } from '../data/staticChampions';

interface PreloadProgress {
  loaded: number;
  total: number;
  percentage: number;
  isComplete: boolean;
}

type ProgressCallback = (progress: PreloadProgress) => void;

class ImagePreloader {
  private preloadedUrls = new Set<string>();
  private isPreloading = false;
  private progressCallbacks = new Set<ProgressCallback>();

  /**
   * Preload all champion splash arts with progress tracking
   */
  async preloadChampionSplashArts(onProgress?: ProgressCallback): Promise<void> {
    if (this.isPreloading) {
      console.log('🖼️ Preloading already in progress, skipping duplicate request');
      return;
    }

    this.isPreloading = true;
    console.log('🖼️ Starting champion splash art preloading...');

    if (onProgress) {
      this.progressCallbacks.add(onProgress);
    }

    const championsWithIds = allChampions.filter(champion => champion.numericId);
    const total = championsWithIds.length;
    let loaded = 0;

    const updateProgress = () => {
      const progress: PreloadProgress = {
        loaded,
        total,
        percentage: Math.round((loaded / total) * 100),
        isComplete: loaded === total
      };

      this.progressCallbacks.forEach(callback => callback(progress));
    };

    const loadPromises = championsWithIds.map(champion => {
      const splashUrl = `https://cdn.communitydragon.org/latest/champion/${champion.numericId}/splash-art/centered/skin/0`;
      
      return new Promise<void>((resolve) => {
        const img = new Image();
        
        img.onload = () => {
          this.preloadedUrls.add(splashUrl);
          loaded++;
          updateProgress();
          resolve();
        };
        
        img.onerror = () => {
          console.warn(`⚠️ Failed to preload splash art for ${champion.name}:`, splashUrl);
          loaded++;
          updateProgress();
          resolve(); // Still resolve to not block other images
        };
        
        img.src = splashUrl;
      });
    });

    // Load images in batches to avoid overwhelming the browser/CDN
    const batchSize = 15; // Slightly larger batches since we're doing it once
    for (let i = 0; i < loadPromises.length; i += batchSize) {
      const batch = loadPromises.slice(i, i + batchSize);
      await Promise.all(batch);
      
      // Small delay between batches to be nice to the CDN
      if (i + batchSize < loadPromises.length) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    this.isPreloading = false;
    console.log(`✅ Champion splash art preloading complete! ${loaded}/${total} images loaded`);

    // Clean up progress callbacks
    if (onProgress) {
      this.progressCallbacks.delete(onProgress);
    }
  }

  /**
   * Check if a specific splash art URL is preloaded
   */
  isSplashArtPreloaded(championNumericId: number): boolean {
    const splashUrl = `https://cdn.communitydragon.org/latest/champion/${championNumericId}/splash-art/centered/skin/0`;
    return this.preloadedUrls.has(splashUrl);
  }

  /**
   * Get preloading statistics
   */
  getStats() {
    return {
      preloadedCount: this.preloadedUrls.size,
      isPreloading: this.isPreloading,
      totalChampions: allChampions.filter(c => c.numericId).length
    };
  }

  /**
   * Subscribe to progress updates
   */
  onProgress(callback: ProgressCallback): () => void {
    this.progressCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.progressCallbacks.delete(callback);
    };
  }
}

// Export singleton instance
export const imagePreloader = new ImagePreloader();

// Convenience function for easy import
export const preloadChampionSplashArts = (onProgress?: ProgressCallback) => 
  imagePreloader.preloadChampionSplashArts(onProgress);
