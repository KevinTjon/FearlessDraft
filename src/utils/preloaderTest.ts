// Simple test utility to verify preloader functionality
import { imagePreloader } from './imagePreloader';

export const testPreloader = () => {
  console.log('🧪 Testing Image Preloader...');
  
  const stats = imagePreloader.getStats();
  console.log('📊 Preloader Stats:', stats);
  
  // Test a few random champions
  const testChampions = [266, 103, 84]; // Aatrox, Ahri, Akali
  testChampions.forEach(numericId => {
    const isPreloaded = imagePreloader.isSplashArtPreloaded(numericId);
    console.log(`🖼️ Champion ${numericId} preloaded:`, isPreloaded);
  });
};

// Export for console testing
(window as any).testPreloader = testPreloader;
