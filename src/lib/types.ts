// Define card template types
export enum CardTemplateType {
  MEME_STYLE = 'meme',
  SUBTITLE_STYLE = 'subtitle',
  STICKY_NOTE_STYLE = 'sticky-note'
}

// Define card data model
export interface Card {
  id: string;
  imageUrl: string;
  hanziText: string;
  pinyinText: string;
  translationText: string;
  templateType: CardTemplateType;
  isFlaggedForReview: boolean;
  createdAt: string;
  lastReviewedAt: string | null;
}

// Define user settings
export interface UserSettings {
  pushNotificationsOptIn: boolean;
  exportedCardIds: string[];
}

// Define view mode for dashboard
export enum ViewMode {
  LIST = 'list',
  GALLERY = 'gallery'
}

// Define filter types for dashboard
export enum FilterType {
  ALL = 'all',
  NEW = 'new',
  FLAGGED = 'flagged'
} 