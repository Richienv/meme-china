import React from 'react';
import Image from 'next/image';
import { Card as CardType } from '@/lib/types';

interface SubtitleStyleCardProps {
  card: CardType;
  showPinyin?: boolean;
  showTranslation?: boolean;
  className?: string;
}

export default function SubtitleStyleCard({ 
  card, 
  showPinyin = true, 
  showTranslation = true,
  className = ''
}: SubtitleStyleCardProps) {
  return (
    <div className={`relative rounded-lg overflow-hidden shadow-md ${className}`} style={{ aspectRatio: '1/1' }}>
      <div className="relative w-full h-full">
        <Image
          src={card.imageUrl}
          alt={card.translationText || "Memory card image"}
          fill
          style={{ objectFit: 'cover' }}
        />
        
        {/* Semi-transparent bar at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-3 text-white">
          {/* Hanzi Text */}
          <p className="text-lg md:text-xl font-medium text-center">
            {card.hanziText}
          </p>
          
          {/* Pinyin Text (if enabled) */}
          {showPinyin && card.pinyinText && (
            <p className="text-xs md:text-sm text-center mt-1 text-white/90">
              {card.pinyinText}
            </p>
          )}
          
          {/* Translation Text (if enabled) */}
          {showTranslation && card.translationText && (
            <p className="text-xs italic text-center mt-1 text-white/80">
              {card.translationText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 