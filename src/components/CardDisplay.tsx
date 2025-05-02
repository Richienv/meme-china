import React from 'react';
import { Card as CardType, CardTemplateType } from '@/lib/types';
import MemeStyleCard from './card-templates/MemeStyleCard';
import SubtitleStyleCard from './card-templates/SubtitleStyleCard';
import StickyNoteStyleCard from './card-templates/StickyNoteStyleCard';

interface CardDisplayProps {
  card: CardType;
  showPinyin?: boolean;
  showTranslation?: boolean;
  className?: string;
}

export default function CardDisplay({ 
  card, 
  showPinyin = true, 
  showTranslation = true,
  className = '' 
}: CardDisplayProps) {
  // Render the appropriate card template based on the card's template type
  switch (card.templateType) {
    case CardTemplateType.MEME_STYLE:
      return (
        <MemeStyleCard 
          card={card} 
          showPinyin={showPinyin} 
          showTranslation={showTranslation} 
          className={className} 
        />
      );
      
    case CardTemplateType.SUBTITLE_STYLE:
      return (
        <SubtitleStyleCard 
          card={card} 
          showPinyin={showPinyin} 
          showTranslation={showTranslation} 
          className={className} 
        />
      );
      
    case CardTemplateType.STICKY_NOTE_STYLE:
      return (
        <StickyNoteStyleCard 
          card={card} 
          showPinyin={showPinyin} 
          showTranslation={showTranslation} 
          className={className} 
        />
      );
      
    default:
      // Fallback to meme style if the template type is not recognized
      return (
        <MemeStyleCard 
          card={card} 
          showPinyin={showPinyin} 
          showTranslation={showTranslation} 
          className={className} 
        />
      );
  }
} 