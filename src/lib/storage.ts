import { Card, UserSettings } from './types';
import { compressImage, calculateBase64Size } from './imageUtils';

// Constants for localStorage keys
const CARDS_STORAGE_KEY = 'chinese-memory-app-cards';
const SETTINGS_STORAGE_KEY = 'chinese-memory-app-settings';

// Compression settings for storage optimization
const STORAGE_COMPRESSION = {
  NORMAL: { maxWidth: 800, maxHeight: 800, quality: 0.7 },
  AGGRESSIVE: { maxWidth: 600, maxHeight: 600, quality: 0.5 }
};

// Estimate of localStorage limit in bytes (5MB)
const ESTIMATED_STORAGE_LIMIT = 5 * 1024 * 1024;
// Threshold at which to trigger aggressive optimization (80% of limit)
const OPTIMIZATION_THRESHOLD = 0.8 * ESTIMATED_STORAGE_LIMIT;

// Function to check if localStorage is available
const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = '__test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (_) {
    return false;
  }
};

// Calculate approximate size of a string in bytes
const calculateStringSizeInBytes = (str: string): number => {
  // Each character in a string is 2 bytes in JavaScript
  return str.length * 2;
};

// Log storage usage and return the total size in bytes
const logStorageUsage = (): number => {
  try {
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        const size = calculateStringSizeInBytes(value);
        totalSize += size;
        console.log(`Storage key: ${key}, size: ${(size / 1024).toFixed(2)} KB`);
      }
    }
    console.log(`Total localStorage usage: ${(totalSize / 1024).toFixed(2)} KB`);
    return totalSize;
  } catch (e) {
    console.error('Error calculating storage size:', e);
    return 0;
  }
};

// Helper to safely parse JSON from localStorage
const safeJSONParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (e) {
    return fallback;
  }
};

// Get all cards from localStorage
export const getCards = (): Card[] => {
  if (!isLocalStorageAvailable()) return [];
  
  const cardsJson = localStorage.getItem(CARDS_STORAGE_KEY);
  return safeJSONParse<Card[]>(cardsJson, []);
};

// Save a card to localStorage with quota handling
export const saveCard = async (card: Card): Promise<boolean> => {
  if (!isLocalStorageAvailable()) return false;
  
  try {
    const cards = getCards();
    const existingIndex = cards.findIndex(c => c.id === card.id);
    
    if (existingIndex >= 0) {
      cards[existingIndex] = card;
    } else {
      cards.push(card);
    }
    
    // Check current storage usage
    const currentUsage = logStorageUsage();
    const optimizationLevel: 'NORMAL' | 'AGGRESSIVE' = currentUsage > OPTIMIZATION_THRESHOLD ? 'AGGRESSIVE' : 'NORMAL';
    
    // Optimize image storage if needed
    const optimizedCards = await optimizeCardsForStorage(cards, optimizationLevel);
    
    // Try to save with optimized cards
    try {
      const cardsJson = JSON.stringify(optimizedCards);
      console.log(`Attempting to save cards. Size: ${(calculateStringSizeInBytes(cardsJson) / 1024).toFixed(2)} KB`);
      localStorage.setItem(CARDS_STORAGE_KEY, cardsJson);
      logStorageUsage();
      return true;
    } catch (storageError) {
      console.error('Storage quota exceeded. Trying fallback methods:', storageError);
      
      // Fallback 1: Try with more aggressive optimization
      if (optimizationLevel !== 'AGGRESSIVE') {
        try {
          const aggressivelyOptimizedCards = await optimizeCardsForStorage(cards, 'AGGRESSIVE');
          localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(aggressivelyOptimizedCards));
          console.log('Saved with aggressive optimization');
          return true;
        } catch (e) {
          console.error('Failed even with aggressive optimization:', e);
        }
      }
      
      // Fallback 2: Try to save without the newest card's image data
      if (!existingIndex && optimizedCards.length > 1) {
        const lastCard = optimizedCards[optimizedCards.length - 1];
        const imageDataSize = lastCard.imageUrl.length * 2;
        console.log(`Last image size: ${(imageDataSize / 1024).toFixed(2)} KB`);
        
        // Replace with placeholder to indicate image needs to be re-uploaded
        lastCard.imageUrl = 'TOO_LARGE_FOR_STORAGE';
        
        try {
          localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(optimizedCards));
          alert('Your card was saved but the image was too large for browser storage. You may need to re-upload it later.');
          return true;
        } catch (finalError) {
          console.error('Still could not save even with image removed:', finalError);
        }
      }
      
      // Fallback 3: Try to save only the most recent cards
      const numCardsToKeep = Math.max(1, Math.floor(optimizedCards.length / 2));
      const reducedCards = optimizedCards.slice(-numCardsToKeep);
      
      try {
        localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(reducedCards));
        alert(`Storage limit reached. Only your ${numCardsToKeep} most recent cards have been kept. Please export your cards regularly.`);
        return true;
      } catch (lastResortError) {
        console.error('All storage attempts failed:', lastResortError);
        alert('Could not save your card. Please export and clear some existing cards first.');
        return false;
      }
    }
  } catch (e) {
    console.error('Error in saveCard:', e);
    return false;
  }
};

// Function to optimize cards for storage
const optimizeCardsForStorage = async (cards: Card[], level: 'NORMAL' | 'AGGRESSIVE' = 'NORMAL'): Promise<Card[]> => {
  // Create deep copy to avoid modifying the original cards
  const optimizedCards = JSON.parse(JSON.stringify(cards)) as Card[];
  
  // Set compression settings based on level
  const settings = STORAGE_COMPRESSION[level];
  
  // Check and compress large images
  const compressPromises = optimizedCards.map(async (card, index) => {
    // Check if the image URL is a base64 string and if it's too large
    if (card.imageUrl.startsWith('data:image')) {
      const sizeInBytes = calculateBase64Size(card.imageUrl);
      const sizeInMB = sizeInBytes / (1024 * 1024);
      
      // Only compress if the image is large
      if (sizeInMB > 0.3) { // Compress images larger than 300KB
        console.log(`Card ${card.id} has a large image: ${sizeInMB.toFixed(2)} MB - applying ${level} compression`);
        
        try {
          // Compress the image
          const compressedImage = await compressImage(
            card.imageUrl,
            settings.maxWidth,
            settings.maxHeight,
            settings.quality
          );
          
          // Update the card with the compressed image
          optimizedCards[index].imageUrl = compressedImage;
        } catch (error) {
          console.error(`Failed to compress image for card ${card.id}:`, error);
        }
      }
    }
  });
  
  // Wait for all compression operations to complete
  await Promise.all(compressPromises);
  
  return optimizedCards;
};

// Delete a card from localStorage
export const deleteCard = (cardId: string): void => {
  if (!isLocalStorageAvailable()) return;
  
  const cards = getCards();
  const updatedCards = cards.filter(card => card.id !== cardId);
  
  try {
    localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(updatedCards));
    logStorageUsage();
  } catch (e) {
    console.error('Error deleting card:', e);
  }
};

// Toggle the review flag for a card
export const toggleCardReviewFlag = (cardId: string): void => {
  if (!isLocalStorageAvailable()) return;
  
  const cards = getCards();
  const cardIndex = cards.findIndex(card => card.id === cardId);
  
  if (cardIndex >= 0) {
    cards[cardIndex].isFlaggedForReview = !cards[cardIndex].isFlaggedForReview;
    cards[cardIndex].lastReviewedAt = new Date().toISOString();
    
    try {
      localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(cards));
    } catch (e) {
      console.error('Error toggling review flag:', e);
      alert('Storage limit reached. Please export and clear some cards.');
    }
  }
};

// Get a specific card by ID
export const getCardById = (cardId: string): Card | undefined => {
  if (!isLocalStorageAvailable()) return undefined;
  
  const cards = getCards();
  return cards.find(card => card.id === cardId);
};

// Get user settings
export const getUserSettings = (): UserSettings => {
  if (!isLocalStorageAvailable()) {
    return { pushNotificationsOptIn: false, exportedCardIds: [] };
  }
  
  const settingsJson = localStorage.getItem(SETTINGS_STORAGE_KEY);
  return safeJSONParse<UserSettings>(
    settingsJson, 
    { pushNotificationsOptIn: false, exportedCardIds: [] }
  );
};

// Save user settings
export const saveUserSettings = (settings: UserSettings): void => {
  if (!isLocalStorageAvailable()) return;
  
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings:', e);
  }
};

// Export all cards as JSON
export const exportCardsAsJSON = (): string => {
  const cards = getCards();
  return JSON.stringify(cards, null, 2);
};

// Clear all cards from storage
export const clearAllCards = (): void => {
  if (!isLocalStorageAvailable()) return;
  
  try {
    localStorage.removeItem(CARDS_STORAGE_KEY);
    console.log('All cards have been cleared from storage');
  } catch (e) {
    console.error('Error clearing cards:', e);
  }
};

// Mark a card as exported
export const markCardAsExported = (cardId: string): void => {
  if (!isLocalStorageAvailable()) return;
  
  const settings = getUserSettings();
  if (!settings.exportedCardIds.includes(cardId)) {
    settings.exportedCardIds.push(cardId);
    saveUserSettings(settings);
  }
}; 