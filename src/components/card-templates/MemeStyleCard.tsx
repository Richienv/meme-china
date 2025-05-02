import React from 'react';
import Image from 'next/image';
import { Card as CardType } from '@/lib/types';

interface MemeStyleCardProps {
  card: CardType;
  showPinyin?: boolean;
  showTranslation?: boolean;
  className?: string;
}

export default function MemeStyleCard({ 
  card, 
  showPinyin = true, 
  showTranslation = true,
  className = ''
}: MemeStyleCardProps) {
  return (
    <div className={`relative rounded-lg overflow-hidden shadow-md ${className}`} style={{ aspectRatio: '1/1' }}>
      <div className="relative w-full h-full">
        <Image
          src={card.imageUrl}
          alt={card.translationText || "Memory card image"}
          fill
          style={{ objectFit: 'cover' }}
        />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          {/* Hanzi Text - using meme-style Impact font with text-shadow for outline */}
          <p 
            className="text-white text-2xl md:text-3xl font-bold px-2"
            style={{ 
              fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
              textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000'
            }}
          >
            {card.hanziText}
          </p>
          
          {/* Pinyin Text (if enabled) */}
          {showPinyin && card.pinyinText && (
            <p 
              className="text-white text-sm md:text-base mt-2 font-medium px-2"
              style={{ 
                fontFamily: 'sans-serif',
                textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
              }}
            >
              {card.pinyinText}
            </p>
          )}
          
          {/* Translation Text (if enabled) */}
          {showTranslation && card.translationText && (
            <p 
              className="text-white text-xs md:text-sm mt-2 italic px-2"
              style={{ 
                fontFamily: 'sans-serif',
                textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
              }}
            >
              {card.translationText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 