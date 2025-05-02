import { Card } from '@/lib/types';
import { getCards } from '@/lib/storage';

// Store card element references to find card data
export const cardElementRefs = { current: {} as Record<string, HTMLElement | null> };

// Function to convert uploaded file to base64 string for storage
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Function to compress an image and return a smaller base64 string
export const compressImage = (
  base64Image: string, 
  maxWidth = 800, 
  maxHeight = 800, 
  quality = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Create a temporary image to load the data
    const img = new Image();
    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round(height * (maxWidth / width));
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round(width * (maxHeight / height));
          height = maxHeight;
        }
      }
      
      // Create a canvas to draw the resized image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress the image
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to base64 with reduced quality
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      
      // Log compression stats
      const originalSize = calculateBase64Size(base64Image);
      const compressedSize = calculateBase64Size(compressedBase64);
      console.log(`Image compressed: ${(originalSize / (1024 * 1024)).toFixed(2)}MB → ${(compressedSize / (1024 * 1024)).toFixed(2)}MB (${Math.round((1 - compressedSize / originalSize) * 100)}% reduction)`);
      
      resolve(compressedBase64);
    };
    
    img.onerror = (error) => {
      reject(error);
    };
    
    // Start loading the image
    img.src = base64Image;
  });
};

// Helper function to calculate base64 string size in bytes
export const calculateBase64Size = (base64String: string): number => {
  // Remove the data URL declaration to get just the base64 string
  const base64 = base64String.split(',')[1];
  // Base64 represents 3 bytes with 4 characters, plus potential padding
  return Math.floor((base64.length * 3) / 4);
};

// Helper function to apply a class to all child elements
export const applyClassToAllElements = (element: HTMLElement, className: string): void => {
  element.classList.add(className);
  const children = element.querySelectorAll('*');
  children.forEach(child => {
    if (child instanceof HTMLElement) {
      child.classList.add(className);
    }
  });
};

// Helper function to explicitly convert any OKLCH colors to RGB
export const convertOklchToRGB = (element: HTMLElement): void => {
  // Function to extract and log computed styles
  const logComputedStyles = (el: HTMLElement, prefix = '') => {
    const styles = window.getComputedStyle(el);
    const oklchProps = [];
    
    // Check if any computed style contains 'oklch'
    for (let i = 0; i < styles.length; i++) {
      const prop = styles[i];
      const value = styles.getPropertyValue(prop);
      if (value.includes('oklch')) {
        oklchProps.push(`${prop}: ${value}`);
      }
    }
    
    if (oklchProps.length > 0) {
      console.log(`${prefix}Element has oklch styles:`, el.tagName, oklchProps);
    }
  };

  // Log computed styles for our element
  logComputedStyles(element, 'Root ');
  
  // Convert any inline oklch styles to RGB for this element
  if (element.style.cssText.includes('oklch')) {
    console.log('Found inline oklch style, attempting to convert', element.style.cssText);
    
    // Override with inline RGB colors to force a standard color format
    element.style.color = 'rgb(0, 0, 0)';
    element.style.backgroundColor = 'rgb(255, 255, 255)';
    element.style.borderColor = 'rgb(200, 200, 200)';
  }
  
  // Process all child elements
  element.querySelectorAll('*').forEach(child => {
    if (child instanceof HTMLElement) {
      logComputedStyles(child);
      
      // Override any inline oklch styles
      if (child.style.cssText.includes('oklch')) {
        console.log('Found inline oklch style in child, converting', child.style.cssText);
        
        // Force RGB colors on this element
        child.style.color = 'rgb(0, 0, 0)';
        child.style.backgroundColor = 'rgb(255, 255, 255)'; 
        child.style.borderColor = 'rgb(200, 200, 200)';
      }
      
      // Add explicit RGB style overrides to handle CSS variables
      child.setAttribute('style', `${child.getAttribute('style') || ''}; 
        --background: rgb(255, 255, 255) !important;
        --foreground: rgb(0, 0, 0) !important;
        --card: rgb(255, 255, 255) !important;
        --card-foreground: rgb(0, 0, 0) !important;
        --primary: rgb(0, 0, 0) !important;
        --primary-foreground: rgb(255, 255, 255) !important;
        --border: rgb(229, 231, 235) !important;
        color: rgb(0, 0, 0) !important;
      `);
    }
  });
};

// Function to create a simplified export-friendly version of a card component
export const createExportFriendlyCard = (card: Card): HTMLElement => {
  // Create a container for the card
  const container = document.createElement('div');
  container.style.position = 'relative';
  container.style.width = '400px';
  container.style.height = '400px';
  container.style.overflow = 'hidden';
  container.style.backgroundColor = 'white';
  container.style.borderRadius = '8px';
  container.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
  
  // Create the image part
  const imageContainer = document.createElement('div');
  imageContainer.style.position = 'absolute';
  imageContainer.style.top = '0';
  imageContainer.style.left = '0';
  imageContainer.style.width = '100%';
  imageContainer.style.height = '100%';
  
  const img = document.createElement('img');
  img.src = card.imageUrl;
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.objectFit = 'cover';
  imageContainer.appendChild(img);
  container.appendChild(imageContainer);
  
  // Render text based on template type
  if (card.templateType === 'meme') {
    // Meme style - text with outline
    const textContainer = document.createElement('div');
    textContainer.style.position = 'absolute';
    textContainer.style.top = '50%';
    textContainer.style.left = '50%';
    textContainer.style.transform = 'translate(-50%, -50%)';
    textContainer.style.width = '90%';
    textContainer.style.textAlign = 'center';
    
    const hanziText = document.createElement('p');
    hanziText.textContent = card.hanziText;
    hanziText.style.fontFamily = 'Impact, sans-serif';
    hanziText.style.fontSize = '32px';
    hanziText.style.fontWeight = 'bold';
    hanziText.style.color = 'white';
    hanziText.style.textShadow = '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000';
    hanziText.style.marginBottom = '10px';
    textContainer.appendChild(hanziText);
    
    if (card.pinyinText) {
      const pinyinText = document.createElement('p');
      pinyinText.textContent = card.pinyinText;
      pinyinText.style.fontFamily = 'Arial, sans-serif';
      pinyinText.style.fontSize = '18px';
      pinyinText.style.color = 'white';
      pinyinText.style.textShadow = '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000';
      pinyinText.style.marginBottom = '8px';
      textContainer.appendChild(pinyinText);
    }
    
    if (card.translationText) {
      const translationText = document.createElement('p');
      translationText.textContent = card.translationText;
      translationText.style.fontFamily = 'Arial, sans-serif';
      translationText.style.fontSize = '16px';
      translationText.style.fontStyle = 'italic';
      translationText.style.color = 'white';
      translationText.style.textShadow = '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000';
      textContainer.appendChild(translationText);
    }
    
    container.appendChild(textContainer);
  } else if (card.templateType === 'subtitle') {
    // Subtitle style - bar at bottom
    const textContainer = document.createElement('div');
    textContainer.style.position = 'absolute';
    textContainer.style.bottom = '0';
    textContainer.style.left = '0';
    textContainer.style.width = '100%';
    textContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    textContainer.style.padding = '12px';
    textContainer.style.textAlign = 'center';
    
    const hanziText = document.createElement('p');
    hanziText.textContent = card.hanziText;
    hanziText.style.fontFamily = 'Arial, sans-serif';
    hanziText.style.fontSize = '24px';
    hanziText.style.fontWeight = 'medium';
    hanziText.style.color = 'white';
    hanziText.style.margin = '0 0 8px 0';
    textContainer.appendChild(hanziText);
    
    if (card.pinyinText) {
      const pinyinText = document.createElement('p');
      pinyinText.textContent = card.pinyinText;
      pinyinText.style.fontFamily = 'Arial, sans-serif';
      pinyinText.style.fontSize = '16px';
      pinyinText.style.color = 'rgba(255, 255, 255, 0.9)';
      pinyinText.style.margin = '0 0 6px 0';
      textContainer.appendChild(pinyinText);
    }
    
    if (card.translationText) {
      const translationText = document.createElement('p');
      translationText.textContent = card.translationText;
      translationText.style.fontFamily = 'Arial, sans-serif';
      translationText.style.fontSize = '14px';
      translationText.style.fontStyle = 'italic';
      translationText.style.color = 'rgba(255, 255, 255, 0.8)';
      translationText.style.margin = '0';
      textContainer.appendChild(translationText);
    }
    
    container.appendChild(textContainer);
  } else if (card.templateType === 'sticky-note') {
    // Sticky note style
    const noteContainer = document.createElement('div');
    noteContainer.style.position = 'absolute';
    noteContainer.style.top = '50%';
    noteContainer.style.left = '50%';
    noteContainer.style.transform = 'translate(-50%, -50%) rotate(1deg)';
    noteContainer.style.backgroundColor = '#fff9c4';
    noteContainer.style.padding = '20px';
    noteContainer.style.boxShadow = '3px 3px 7px rgba(0, 0, 0, 0.3)';
    noteContainer.style.border = '1px solid #e0e0e0';
    noteContainer.style.maxWidth = '85%';
    noteContainer.style.textAlign = 'center';
    
    // Add decorative tape element
    const tapeElement = document.createElement('div');
    tapeElement.style.position = 'absolute';
    tapeElement.style.top = '-8px';
    tapeElement.style.left = '50%';
    tapeElement.style.transform = 'translateX(-50%)';
    tapeElement.style.width = '40px';
    tapeElement.style.height = '12px';
    tapeElement.style.backgroundColor = '#90caf9';
    tapeElement.style.opacity = '0.8';
    tapeElement.style.borderRadius = '2px';
    noteContainer.appendChild(tapeElement);
    
    const hanziText = document.createElement('p');
    hanziText.textContent = card.hanziText;
    hanziText.style.fontFamily = 'cursive, Arial, sans-serif';
    hanziText.style.fontSize = '26px';
    hanziText.style.fontWeight = 'medium';
    hanziText.style.color = '#333';
    hanziText.style.margin = '0 0 12px 0';
    noteContainer.appendChild(hanziText);
    
    if (card.pinyinText) {
      const pinyinText = document.createElement('p');
      pinyinText.textContent = card.pinyinText;
      pinyinText.style.fontFamily = 'cursive, Arial, sans-serif';
      pinyinText.style.fontSize = '18px';
      pinyinText.style.color = '#555';
      pinyinText.style.margin = '0 0 10px 0';
      noteContainer.appendChild(pinyinText);
    }
    
    if (card.translationText) {
      const translationText = document.createElement('p');
      translationText.textContent = card.translationText;
      translationText.style.fontFamily = 'Arial, sans-serif';
      translationText.style.fontSize = '14px';
      translationText.style.fontStyle = 'italic';
      translationText.style.color = '#666';
      translationText.style.margin = '0';
      noteContainer.appendChild(translationText);
    }
    
    container.appendChild(noteContainer);
  }
  
  return container;
};

// Function to directly render card to canvas bypassing html2canvas completely
export const downloadCardAsPNG = (cardElement: HTMLElement, filename: string): void => {
  console.log('Starting PNG download using direct canvas rendering method');
  
  // Find the card data from the element
  const cardId = Object.keys(cardElementRefs.current).find(
    id => cardElementRefs.current[id] === cardElement
  );
  
  if (!cardId) {
    console.error('Could not find card ID for element', cardElement);
    alert('Could not identify the card. Please try again.');
    return;
  }
  
  // Try to get the card data
  const card = getCards().find(card => card.id === cardId);
  
  if (!card) {
    console.error('Could not find card data for ID', cardId);
    alert('Could not load card data. Please try again.');
    return;
  }
  
  console.log('Found card data for rendering:', card);
  
  // Create a canvas element
  const canvas = document.createElement('canvas');
  const width = 800;
  const height = 800;
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Could not get canvas context');
    alert('Your browser does not support canvas operations. Please try a different browser.');
    return;
  }
  
  // Set white background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);
  
  // Load the image
  const img = new Image();
  img.crossOrigin = 'anonymous';
  
  img.onload = () => {
    // Draw image - maintain aspect ratio within the canvas
    const imgRatio = img.width / img.height;
    let drawWidth = width;
    let drawHeight = height;
    let offsetX = 0;
    let offsetY = 0;
    
    if (imgRatio > 1) {
      // Image is wider than tall
      drawHeight = width / imgRatio;
      offsetY = (height - drawHeight) / 2;
    } else {
      // Image is taller than wide
      drawWidth = height * imgRatio;
      offsetX = (width - drawWidth) / 2;
    }
    
    // Draw the image
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    
    // Draw text based on template type
    if (card.templateType === 'meme') {
      // Meme style - text with outline
      drawMemeText(ctx, card, width, height);
    } else if (card.templateType === 'subtitle') {
      // Subtitle style - bar at bottom
      drawSubtitleText(ctx, card, width, height);
    } else if (card.templateType === 'sticky-note') {
      // Sticky note style
      drawStickyNoteText(ctx, card, width, height);
    }
    
    // Convert to PNG and trigger download
    try {
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = pngUrl;
      link.click();
      console.log('PNG created and download triggered successfully');
    } catch (error) {
      console.error('Error converting canvas to PNG:', error);
      alert('Failed to create PNG. This may be due to CORS restrictions on the image.');
    }
  };
  
  img.onerror = (error) => {
    console.error('Error loading image for card:', error);
    alert('Failed to load the image. This may be due to CORS restrictions.');
    
    // Try to continue with just the text on a colored background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);
    
    if (card.templateType === 'meme') {
      drawMemeText(ctx, card, width, height);
    } else if (card.templateType === 'subtitle') {
      drawSubtitleText(ctx, card, width, height);
    } else if (card.templateType === 'sticky-note') {
      drawStickyNoteText(ctx, card, width, height);
    }
    
    try {
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = pngUrl;
      link.click();
      console.log('Text-only PNG created and download triggered successfully');
    } catch (secondError) {
      console.error('Error creating text-only PNG:', secondError);
      alert('Could not create PNG. Please try again later.');
    }
  };
  
  // Load the image - handle base64 or URL
  if (card.imageUrl.startsWith('data:')) {
    img.src = card.imageUrl;
  } else {
    // For URLs, we'll need to be careful about CORS
    img.src = card.imageUrl;
  }
};

// Helper function to draw meme-style text
function drawMemeText(ctx: CanvasRenderingContext2D, card: Card, width: number, height: number): void {
  ctx.textAlign = 'center';
  
  // Draw Hanzi text
  const fontSize = Math.floor(width / 12); // Responsive font size
  ctx.font = `bold ${fontSize}px Impact, sans-serif`;
  
  // Function to draw outlined text
  const drawOutlinedText = (text: string, x: number, y: number, lineWidth: number) => {
    ctx.strokeStyle = 'black';
    ctx.lineWidth = lineWidth;
    ctx.strokeText(text, x, y);
    ctx.fillStyle = 'white';
    ctx.fillText(text, x, y);
  };
  
  // Draw main Hanzi text
  const centerY = height / 2;
  drawOutlinedText(card.hanziText, width / 2, centerY, fontSize / 8);
  
  // Draw Pinyin if available
  if (card.pinyinText) {
    ctx.font = `${fontSize * 0.6}px Arial, sans-serif`;
    drawOutlinedText(card.pinyinText, width / 2, centerY + fontSize, fontSize / 12);
  }
  
  // Draw translation if available
  if (card.translationText) {
    ctx.font = `italic ${fontSize * 0.45}px Arial, sans-serif`;
    drawOutlinedText(card.translationText, width / 2, centerY + fontSize * 1.8, fontSize / 16);
  }
}

// Helper function to draw subtitle-style text
function drawSubtitleText(ctx: CanvasRenderingContext2D, card: Card, width: number, height: number): void {
  // Draw semi-transparent bar at bottom
  const barHeight = height * 0.25;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, height - barHeight, width, barHeight);
  
  // Text settings
  ctx.textAlign = 'center';
  const fontSize = Math.floor(width / 16);
  
  // Draw Hanzi text
  ctx.font = `${fontSize * 1.2}px Arial, sans-serif`;
  ctx.fillStyle = 'white';
  ctx.fillText(card.hanziText, width / 2, height - barHeight + fontSize * 1.5);
  
  // Draw Pinyin if available
  if (card.pinyinText) {
    ctx.font = `${fontSize * 0.8}px Arial, sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText(card.pinyinText, width / 2, height - barHeight + fontSize * 2.8);
  }
  
  // Draw translation if available
  if (card.translationText) {
    ctx.font = `italic ${fontSize * 0.7}px Arial, sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText(card.translationText, width / 2, height - barHeight + fontSize * 4);
  }
}

// Helper function to draw sticky-note style text
function drawStickyNoteText(ctx: CanvasRenderingContext2D, card: Card, width: number, height: number): void {
  // Draw sticky note
  const noteWidth = width * 0.7;
  const noteHeight = height * 0.6;
  const noteX = (width - noteWidth) / 2;
  const noteY = (height - noteHeight) / 2;
  
  // Add slight rotation
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate(Math.PI / 180); // 1 degree rotation
  ctx.translate(-width / 2, -height / 2);
  
  // Draw note background
  ctx.fillStyle = '#fff9c4'; // Light yellow
  ctx.fillRect(noteX, noteY, noteWidth, noteHeight);
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;
  ctx.strokeRect(noteX, noteY, noteWidth, noteHeight);
  
  // Draw tape element
  ctx.fillStyle = 'rgba(144, 202, 249, 0.8)'; // Light blue
  const tapeWidth = noteWidth * 0.2;
  const tapeHeight = noteHeight * 0.06;
  ctx.fillRect(noteX + (noteWidth - tapeWidth) / 2, noteY - tapeHeight / 2, tapeWidth, tapeHeight);
  
  // Drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;
  
  // Text settings
  ctx.textAlign = 'center';
  const fontSize = Math.floor(noteWidth / 16);
  
  // Draw Hanzi text - no shadow for text
  ctx.shadowColor = 'transparent';
  ctx.font = `${fontSize * 1.4}px 'Comic Sans MS', cursive, Arial, sans-serif`;
  ctx.fillStyle = '#333';
  ctx.fillText(card.hanziText, noteX + noteWidth / 2, noteY + fontSize * 2);
  
  // Draw Pinyin if available
  if (card.pinyinText) {
    ctx.font = `${fontSize}px 'Comic Sans MS', cursive, Arial, sans-serif`;
    ctx.fillStyle = '#555';
    ctx.fillText(card.pinyinText, noteX + noteWidth / 2, noteY + fontSize * 3.5);
  }
  
  // Draw translation if available
  if (card.translationText) {
    ctx.font = `italic ${fontSize * 0.8}px Arial, sans-serif`;
    ctx.fillStyle = '#666';
    ctx.fillText(card.translationText, noteX + noteWidth / 2, noteY + fontSize * 5);
  }
  
  // Restore canvas state
  ctx.restore();
}

// Function to generate a unique ID for cards
export const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

// Function to create an object URL from a base64 string
export const base64ToObjectUrl = (base64: string): string => {
  try {
    const byteString = atob(base64.split(',')[1]);
    const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
    
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    const blob = new Blob([ab], { type: mimeString });
    return URL.createObjectURL(blob);
  } catch (e) {
    console.error('Error converting base64 to object URL:', e);
    return '';
  }
}; 