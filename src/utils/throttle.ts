// Utility functions for throttling and debouncing rapid UI interactions

/**
 * Throttle function - limits how often a function can be called
 * Useful for preventing spam of expensive operations
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  
  return (...args: Parameters<T>) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      // Execute immediately if enough time has passed
      func(...args);
      lastExecTime = currentTime;
    } else {
      // Schedule execution for later
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}

/**
 * Debounce function - delays execution until after calls have stopped
 * Useful for search inputs or rapid selections
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

/**
 * Combined throttle + immediate update for UI responsiveness
 * Updates UI immediately but throttles expensive operations like socket calls
 */
export function throttleWithImmediate<T extends (...args: any[]) => any>(
  immediateFunc: T,
  throttledFunc: T,
  delay: number
): (...args: Parameters<T>) => void {
  const throttledFn = throttle(throttledFunc, delay);
  
  return (...args: Parameters<T>) => {
    // Update UI immediately for responsiveness
    immediateFunc(...args);
    
    // Throttle the expensive operation (like socket calls)
    throttledFn(...args);
  };
}
