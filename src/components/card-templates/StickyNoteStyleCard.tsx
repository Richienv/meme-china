import React from 'react';
import Image from 'next/image';
import { Card as CardType } from '@/lib/types';

interface StickyNoteStyleCardProps {
  card: CardType;
  showPinyin?: boolean;
  showTranslation?: boolean;
  className?: string;
}

export default function StickyNoteStyleCard({ 
  card, 
  showPinyin = true, 
  showTranslation = true,
  className = ''
}: StickyNoteStyleCardProps) {
  return (
    <div className={`relative rounded-lg overflow-hidden shadow-md ${className}`} style={{ aspectRatio: '1/1' }}>
      <div className="relative w-full h-full">
        <Image
          src={card.imageUrl}
          alt={card.translationText || "Memory card image"}
          fill
          style={{ objectFit: 'cover' }}
        />
        
        {/* Sticky note overlay */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-100 p-4 rotate-1 shadow-lg max-w-[85%]" 
          style={{ 
            border: '1px solid #e0e0e0',
            boxShadow: '3px 3px 8px rgba(0,0,0,0.2)'
          }}
        >
          {/* Hanzi Text */}
          <p className="text-xl md:text-2xl font-medium text-center text-gray-800" style={{ fontFamily: 'cursive' }}>
            {card.hanziText}
          </p>
          
          {/* Pinyin Text (if enabled) */}
          {showPinyin && card.pinyinText && (
            <p className="text-sm md:text-base text-center mt-2 text-gray-700" style={{ fontFamily: 'cursive' }}>
              {card.pinyinText}
            </p>
          )}
          
          {/* Translation Text (if enabled) */}
          {showTranslation && card.translationText && (
            <p className="text-xs md:text-sm italic text-center mt-2 text-gray-600">
              {card.translationText}
            </p>
          )}
          
          {/* Decorative tape element at top */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-10 h-3 bg-blue-200 opacity-80 rounded-sm"></div>
        </div>
      </div>
    </div>
  );
} 