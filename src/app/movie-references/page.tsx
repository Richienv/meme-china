"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Types
type MovieCard = {
  id: string;
  movieTitle: string;
  year: number;
  imageUrl: string;
  chinesePhrase: string;
  pinyin: string;
  translation: string;
  difficulty: number;
  category: string;
  savedAt?: string;
  quote?: string;
};

// View modes
type ViewMode = 'selection' | 'browse' | 'saved';

// localStorage keys
const SAVED_MOVIE_CARDS_KEY = 'savedMovieCards';
const VIEWED_MOVIE_CARDS_KEY = 'viewedMovieCards';

// Sample data for movie cards
const SAMPLE_MOVIE_CARDS: MovieCard[] = [
  {
    id: '1',
    movieTitle: 'Crouching Tiger, Hidden Dragon',
    year: 2000,
    imageUrl: '/movie-card-1.jpg',
    chinesePhrase: '卧虎藏龙',
    pinyin: 'Wò hǔ cáng lóng',
    translation: 'Hidden talents',
    difficulty: 2,
    category: 'Action',
  },
  {
    id: '2',
    movieTitle: 'Kung Fu Panda',
    year: 2008,
    imageUrl: '/kungfu-panda.png',
    chinesePhrase: '没有秘密配方',
    pinyin: 'Méiyǒu mìmì pèifāng',
    translation: 'There is no secret ingredient',
    difficulty: 1,
    category: 'Animation',
    quote: "There is no secret ingredient. It's just you.",
  },
  {
    id: '3',
    movieTitle: 'IP Man',
    year: 2008,
    imageUrl: '/movie-card-3.jpg',
    chinesePhrase: '我要打十个',
    pinyin: 'Wǒ yào dǎ shí gè',
    translation: 'I want to fight ten men',
    difficulty: 2,
    category: 'Action',
  },
  {
    id: '4',
    movieTitle: 'Mulan',
    year: 1998,
    imageUrl: '/movie-bg.jpg',
    chinesePhrase: '逆境中开花的花',
    pinyin: 'Nìjìng zhōng kāihuā de huā',
    translation: 'The flower that blooms in adversity',
    difficulty: 1,
    category: 'Animation',
  },
  {
    id: '5',
    movieTitle: 'Hero',
    year: 2002,
    imageUrl: '/movie-bg.jpg',
    chinesePhrase: '我本来可以杀了你',
    pinyin: 'Wǒ běnlái kěyǐ shā le nǐ',
    translation: 'I could have killed you',
    difficulty: 3,
    category: 'Drama',
  }
];

// Types
type CardType = {
  id: string;
  pinyin: string;
  chinesePhrase: string;
  translation: string;
  quote: string | null;
  movieTitle: string;
  year: string;
  difficulty: number;
  imageUrl: string;
  saved: boolean;
};

// Sample data for movie reference cards
const movieReferenceCards = [
  {
    id: '1',
    pinyin: 'Méi yǒu mì jué',
    chinesePhrase: '没有秘诀',
    translation: 'There is no secret ingredient',
    quote: 'It is just you',
    movieTitle: 'Kung Fu Panda',
    year: '2008',
    difficulty: 1,
    imageUrl: '/kungfu-panda.png',
    saved: false
  },
  {
    id: '2',
    pinyin: 'Wǒ huì huílái de',
    chinesePhrase: '我会回来的',
    translation: "I'll be back",
    quote: null,
    movieTitle: 'The Terminator',
    year: '1984',
    difficulty: 1,
    imageUrl: '/terminator.png',
    saved: false
  },
  {
    id: '3',
    pinyin: 'Nǐ hǎo',
    chinesePhrase: '你好',
    translation: 'Hello',
    quote: 'Nice to meet you',
    movieTitle: 'Rush Hour',
    year: '1998',
    difficulty: 1,
    imageUrl: '/rush-hour.png',
    saved: true
  },
  {
    id: '4',
    pinyin: 'Wǒ shì Dà Xiá',
    chinesePhrase: '我是大侠',
    translation: 'I am a hero',
    quote: 'A legendary warrior',
    movieTitle: 'Hero',
    year: '2002',
    difficulty: 3,
    imageUrl: '/hero.png',
    saved: true
  },
  {
    id: '5',
    pinyin: 'Tā shì wǒ de mìngyùn',
    chinesePhrase: '她是我的命运',
    translation: 'She is my destiny',
    quote: 'We are connected by fate',
    movieTitle: 'Crouching Tiger, Hidden Dragon',
    year: '2000',
    difficulty: 5,
    imageUrl: '/crouching-tiger.png',
    saved: false
  }
];

// Helper functions for localStorage
const getSavedCards = (): MovieCard[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const saved = localStorage.getItem(SAVED_MOVIE_CARDS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading saved cards:', error);
    return [];
  }
};

const saveCardToStorage = (card: MovieCard): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const savedCards = getSavedCards();
    const cardWithTimestamp = { 
      ...card, 
      savedAt: new Date().toISOString() 
    };
    
    localStorage.setItem(
      SAVED_MOVIE_CARDS_KEY, 
      JSON.stringify([...savedCards, cardWithTimestamp])
    );
  } catch (error) {
    console.error('Error saving card:', error);
  }
};

const getViewedCardIds = (): string[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const viewed = localStorage.getItem(VIEWED_MOVIE_CARDS_KEY);
    return viewed ? JSON.parse(viewed) : [];
  } catch (error) {
    console.error('Error loading viewed cards:', error);
    return [];
  }
};

const markCardAsViewed = (cardId: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const viewedCards = getViewedCardIds();
    if (!viewedCards.includes(cardId)) {
      localStorage.setItem(
        VIEWED_MOVIE_CARDS_KEY, 
        JSON.stringify([...viewedCards, cardId])
      );
    }
  } catch (error) {
    console.error('Error marking card as viewed:', error);
  }
};

export default function MovieReferencesPage() {
  const router = useRouter();
  const [availableCards, setAvailableCards] = useState<MovieCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [savedCards, setSavedCards] = useState<MovieCard[]>([]);
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('selection');
  
  // Filter states
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedMovieTitle, setSelectedMovieTitle] = useState<string>('all');
  const [filteredSelectionCards, setFilteredSelectionCards] = useState<MovieCard[]>([]);
  
  // Refs for touch handling
  const cardRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  
  // Initialize cards from localStorage and sample data
  useEffect(() => {
    const savedFromStorage = getSavedCards();
    setSavedCards(savedFromStorage);
    
    const viewedIds = getViewedCardIds();
    
    // Filter out cards that have been saved
    const savedIds = savedFromStorage.map(card => card.id);
    const notViewedOrSaved = SAMPLE_MOVIE_CARDS.filter(
      card => !viewedIds.includes(card.id) && !savedIds.includes(card.id)
    );
    
    // If all cards have been viewed, reset and show all again
    const cardsToShow = notViewedOrSaved.length > 0 
      ? notViewedOrSaved 
      : SAMPLE_MOVIE_CARDS.filter(card => !savedIds.includes(card.id));
    
    setAvailableCards(cardsToShow);
    setFilteredSelectionCards(SAMPLE_MOVIE_CARDS);
  }, []);
  
  // Update filtered cards when filters change
  useEffect(() => {
    let filtered = [...SAMPLE_MOVIE_CARDS];
    
    // Apply difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(card => card.difficulty === parseInt(selectedDifficulty));
    }
    
    // Apply movie title filter
    if (selectedMovieTitle !== 'all') {
      filtered = filtered.filter(card => card.movieTitle === selectedMovieTitle);
    }
    
    setFilteredSelectionCards(filtered);
  }, [selectedDifficulty, selectedMovieTitle]);
  
  const goToHome = () => {
    router.push('/');
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = startXRef.current;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!cardRef.current) return;
    
    currentXRef.current = e.touches[0].clientX;
    const deltaX = currentXRef.current - startXRef.current;
    
    // Apply transform to card
    cardRef.current.style.transform = `translateX(${deltaX}px) rotate(${deltaX * 0.05}deg)`;
    
    // Visual indicator for swipe direction
    if (deltaX > 50) {
      setSwipeDirection('right');
    } else if (deltaX < -50) {
      setSwipeDirection('left');
    } else {
      setSwipeDirection(null);
    }
  };

  const handleTouchEnd = () => {
    if (!cardRef.current) return;
    
    const deltaX = currentXRef.current - startXRef.current;
    
    // Determine if swipe was significant enough
    if (deltaX > 100) {
      // Swipe right - save card
      handleSwipeRight();
    } else if (deltaX < -100) {
      // Swipe left - skip card
      handleSwipeLeft();
    } else {
      // Reset card position if swipe wasn't decisive
      cardRef.current.style.transform = 'translateX(0) rotate(0)';
      setSwipeDirection(null);
    }
  };
  
  // For mouse/desktop users
  const handleSwipeLeft = () => {
    // Skip current card
    setSwipeDirection('left');
    setShowFeedback(true);
    
    // Mark card as viewed
    if (availableCards.length > 0) {
      markCardAsViewed(availableCards[currentCardIndex].id);
    }
    
    // Animate card off screen
    if (cardRef.current) {
      cardRef.current.style.transform = 'translateX(-1000px) rotate(-30deg)';
    }
    
    // Move to next card after animation
    setTimeout(() => {
      moveToNextCard();
      setSwipeDirection(null);
      setShowFeedback(false);
    }, 300);
  };
  
  const handleSwipeRight = () => {
    // Save current card
    setSwipeDirection('right');
    setShowFeedback(true);
    
    if (availableCards.length > 0) {
      // Get current card and save it
      const currentCard = availableCards[currentCardIndex];
      
      // Save to state
      const newSavedCards = [...savedCards, currentCard];
      setSavedCards(newSavedCards);
      
      // Save to localStorage
      saveCardToStorage(currentCard);
      
      // Mark as viewed
      markCardAsViewed(currentCard.id);
    }
    
    // Animate card off screen
    if (cardRef.current) {
      cardRef.current.style.transform = 'translateX(1000px) rotate(30deg)';
    }
    
    // Move to next card after animation
    setTimeout(() => {
      moveToNextCard();
      setSwipeDirection(null);
      setShowFeedback(false);
    }, 300);
  };
  
  const moveToNextCard = () => {
    // Reset card position
    if (cardRef.current) {
      cardRef.current.style.transform = 'translateX(0) rotate(0)';
    }
    
    // Check if we've reached the end
    if (currentCardIndex < availableCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      // If we're out of cards, show a message or loop back
      if (availableCards.length > 0) {
        // For demo purposes, we'll loop back to the beginning
        setCurrentCardIndex(0);
      }
    }
  };
  
  const viewSavedCards = () => {
    setViewMode('saved');
  };
  
  const viewBrowseMode = () => {
    setViewMode('browse');
  };
  
  const viewSelectionMode = () => {
    setViewMode('selection');
  };
  
  const startBrowsing = (selectedCards: MovieCard[]) => {
    setAvailableCards(selectedCards);
    setCurrentCardIndex(0);
    setViewMode('browse');
  };
  
  const deleteSavedCard = (cardId: string) => {
    // Remove from state
    const updatedSavedCards = savedCards.filter(card => card.id !== cardId);
    setSavedCards(updatedSavedCards);
    
    // Remove from localStorage
    localStorage.setItem(SAVED_MOVIE_CARDS_KEY, JSON.stringify(updatedSavedCards));
  };

  const DifficultyBadge = ({ level }: { level: number }) => {
    const getColor = (level: number) => {
      switch(level) {
        case 1: return 'border-green-400 text-green-400';
        case 2: return 'border-blue-400 text-blue-400';
        case 3: return 'border-yellow-400 text-yellow-400';
        case 4: return 'border-orange-400 text-orange-400';
        case 5: return 'border-red-400 text-red-400';
        default: return 'border-gray-400 text-gray-400';
      }
    };

    return (
      <span className={`text-xs px-2.5 py-0.5 rounded-full border ${getColor(level)} bg-black/30 backdrop-blur-md`}>
        HSK {level}
      </span>
    );
  };

  // If no cards available at all
  if (availableCards.length === 0 && viewMode === 'browse') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-indigo-900 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">No more cards available!</h2>
          <p className="text-gray-400 mb-6">Check back later for more content.</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={goToHome}>Back to Home</Button>
            <Button onClick={viewSelectionMode} variant="outline">Back to Selection</Button>
            {savedCards.length > 0 && (
              <Button onClick={viewSavedCards} variant="outline">View Saved Cards</Button>
            )}
          </div>
        </div>
      </main>
    );
  }

  // Render selection screen
  if (viewMode === 'selection') {
    const uniqueMovies = Array.from(new Set(SAMPLE_MOVIE_CARDS.map(card => card.movieTitle)));
    
    return (
      <main className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-indigo-900 p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-4xl mb-8">
          <div className="flex justify-between items-center">
            <Button 
              variant="ghost" 
              onClick={goToHome}
              className="text-gray-400 hover:text-white"
            >
              Home
            </Button>
            
            <h1 className="text-2xl md:text-3xl font-bold text-white text-center">
              Movie <span className="text-indigo-400">References</span>
            </h1>
            
            <Button 
              variant="ghost" 
              onClick={viewSavedCards}
              className="text-gray-400 hover:text-white"
            >
              Saved ({savedCards.length})
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="w-full max-w-4xl bg-gray-900/70 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-medium text-white mb-4">Choose what to learn</h2>
          
          <div className="space-y-4">
            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Difficulty Level</label>
              <Tabs 
                value={selectedDifficulty} 
                onValueChange={setSelectedDifficulty}
                className="w-full"
              >
                <TabsList className="bg-gray-800 p-1 rounded-lg w-full grid grid-cols-4 gap-1">
                  <TabsTrigger 
                    value="all"
                    className="rounded-md text-gray-400 data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=active]:shadow-sm"
                  >
                    All Levels
                  </TabsTrigger>
                  <TabsTrigger 
                    value="1"
                    className="rounded-md text-gray-400 data-[state=active]:bg-green-800/70 data-[state=active]:text-white data-[state=active]:shadow-sm"
                  >
                    Beginner
                  </TabsTrigger>
                  <TabsTrigger 
                    value="2"
                    className="rounded-md text-gray-400 data-[state=active]:bg-yellow-800/70 data-[state=active]:text-white data-[state=active]:shadow-sm"
                  >
                    Intermediate
                  </TabsTrigger>
                  <TabsTrigger 
                    value="3"
                    className="rounded-md text-gray-400 data-[state=active]:bg-red-800/70 data-[state=active]:text-white data-[state=active]:shadow-sm"
                  >
                    Advanced
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {/* Movie Filter */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Movie</label>
              <Tabs 
                value={selectedMovieTitle} 
                onValueChange={setSelectedMovieTitle}
                className="w-full"
              >
                <TabsList className="bg-gray-800 p-1 rounded-lg w-full flex overflow-x-auto hide-scrollbar">
                  <TabsTrigger 
                    value="all"
                    className="rounded-md text-gray-400 data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=active]:shadow-sm whitespace-nowrap"
                  >
                    All Movies
                  </TabsTrigger>
                  
                  {uniqueMovies.map(movie => (
                    <TabsTrigger 
                      key={movie}
                      value={movie}
                      className="rounded-md text-gray-400 data-[state=active]:bg-indigo-800/70 data-[state=active]:text-white data-[state=active]:shadow-sm whitespace-nowrap"
                    >
                      {movie}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
        
        {/* Card List */}
        {filteredSelectionCards.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-white mb-4">No phrases match your filters</p>
            <Button onClick={() => {
              setSelectedDifficulty('all');
              setSelectedMovieTitle('all');
            }}>Reset Filters</Button>
          </div>
        ) : (
          <>
            <div className="w-full max-w-4xl mb-4 flex justify-between items-center">
              <p className="text-gray-400">
                {filteredSelectionCards.length} phrases available
              </p>
              
              <Button 
                onClick={() => startBrowsing(filteredSelectionCards)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Start Learning
              </Button>
            </div>
            
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {filteredSelectionCards.map(card => (
                <Card 
                  key={card.id} 
                  className="overflow-hidden border-gray-700 shadow-xl hover:shadow-indigo-900/20 hover:border-indigo-500/50 transition-all cursor-pointer p-0"
                  onClick={() => {
                    startBrowsing([card]);
                  }}
                >
                  <div className="relative h-32 overflow-hidden">
                    {/* Clean dark background */}
                    <div className="absolute inset-0 bg-gray-900 z-10"></div>
                    
                    {/* Card content overlay - Clean professional design */}
                    <div className="absolute inset-0 z-20 flex p-4">
                      <div className="w-1/4 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      
                      <div className="w-3/4 flex flex-col justify-center">
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="text-gray-400 text-xs">{card.movieTitle}</span>
                          <DifficultyBadge level={card.difficulty} />
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mb-1">{card.pinyin}</h3>
                        <div className="flex gap-1 text-gray-400 text-xs">
                          <span>{card.chinesePhrase}</span>
                          <span>•</span>
                          <span>{card.translation}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>
    );
  }

  // Render saved cards view
  if (viewMode === 'saved') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-indigo-900 p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-4xl mb-8">
          <div className="flex justify-between items-center">
            <Button 
              variant="ghost" 
              onClick={goToHome}
              className="text-gray-400 hover:text-white"
            >
              Home
            </Button>
            
            <h1 className="text-2xl md:text-3xl font-bold text-white text-center">
              Saved <span className="text-indigo-400">Phrases</span>
            </h1>
            
            <Button 
              variant="ghost" 
              onClick={viewSelectionMode}
              className="text-gray-400 hover:text-white"
            >
              Browse More
            </Button>
          </div>
        </div>
        
        {savedCards.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-white mb-4">You haven't saved any phrases yet</p>
            <Button onClick={viewSelectionMode}>Browse Phrases</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
            {savedCards.map((card, index) => (
              <div 
                key={index}
                className="relative overflow-hidden rounded-lg h-80 shadow-lg"
              >
                {/* Background image - improved to fill entire card */}
                <Image
                  src={card.imageUrl}
                  alt={card.movieTitle}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 400px"
                  style={{ objectFit: 'cover', objectPosition: 'center' }}
                  className="absolute inset-0"
                />
                
                {/* Enhanced gradient overlays for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/50"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-transparent"></div>
                
                {/* Content */}
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-between p-5">
                  {/* Top right difficulty badge */}
                  <div className="w-full px-5 pt-5 flex justify-end z-30">
                    <DifficultyBadge level={card.difficulty} />
                  </div>
                  
                  {/* Main content area - better centered vertical text */}
                  <div className="flex-1 flex flex-col items-center justify-center w-full px-6">
                    {/* Pinyin - primary focus, better centered */}
                    <p className="text-3xl md:text-4xl font-medium text-white tracking-wide mb-6 text-center">
                      {card.pinyin}.
                    </p>
                    
                    {/* Chinese characters */}
                    <p className="text-2xl md:text-3xl font-medium text-white mb-4 text-center">
                      {card.chinesePhrase}
                    </p>
                  </div>
                  
                  {/* Quote and attribution area - improved to show full content */}
                  <div className="w-full px-5 py-6 bg-gradient-to-t from-black/95 to-black/20 mt-auto">
                    {/* Quote content with elegant styling - improved for full display */}
                    <div className="relative mb-3">
                      {/* Left quote mark */}
                      <span className="absolute -left-1 -top-3 text-white/20 text-2xl">"</span>
                      
                      <p className="text-sm text-white/90 leading-relaxed pl-3 pr-3 break-words">
                        <span className="font-medium">
                          {card.movieTitle}:
                        </span> {card.translation}
                        {card.quote && (
                          <span className="block mt-1">{card.quote}</span>
                        )}
                      </p>
                      
                      {/* Right quote mark */}
                      <span className="absolute -right-1 bottom-0 text-white/20 text-2xl">"</span>
                    </div>
                    
                    {/* Movie details and card counter */}
                    <div className="flex items-center">
                      <div className="w-5 h-5 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-xs text-white/60 font-medium">
                        {card.year}
                      </span>
                      
                      {/* Swipe indicator - only visible during swipe */}
                      {swipeDirection ? (
                        <span className={`ml-4 text-xs font-medium ${swipeDirection === 'right' ? 'text-green-400' : 'text-red-400'}`}>
                          {swipeDirection === 'right' ? 'Saving...' : 'Skipping...'}
                        </span>
                      ) : null}
                      
                      {/* Card counter aligned right */}
                      <span className="ml-auto text-xs text-white/40">
                        {savedCards.indexOf(card) + 1}/{savedCards.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    );
  }

  // Browse mode (default view with swipe cards)
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-indigo-900 p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl mb-8">
        <div className="flex justify-between items-center">
          <Button 
            variant="ghost" 
            onClick={viewSelectionMode}
            className="text-gray-400 hover:text-white"
          >
            Back
          </Button>
          
          <h1 className="text-2xl md:text-3xl font-bold text-white text-center">
            Movie <span className="text-indigo-400">References</span>
          </h1>
          
          <Button 
            variant="ghost" 
            onClick={viewSavedCards}
            className="text-gray-400 hover:text-white"
          >
            Saved ({savedCards.length})
          </Button>
        </div>
      </div>
      
      {/* Card Stack */}
      <div className="relative w-full max-w-md h-[500px] mb-8">
        {/* Current Card */}
        {availableCards.length > 0 && (
          <div 
            ref={cardRef}
            className="absolute inset-0 transition-transform duration-300 ease-out"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Card className="w-full h-full overflow-hidden shadow-xl !p-0 !m-0 border-0 rounded-xl">
              {/* Card content - no padding, no borders */}
              <div className="relative h-[500px] w-full overflow-hidden">
                {/* Background image - changed to fill entire space */}
                <Image
                  src={availableCards[currentCardIndex].imageUrl}
                  alt={availableCards[currentCardIndex].movieTitle}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 500px"
                  style={{ objectFit: 'cover', objectPosition: 'center' }}
                  className="absolute inset-0"
                />
                
                {/* Enhanced gradient overlays for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/50"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-transparent"></div>

                {/* Content with improved layout */}
                <div className="absolute inset-0 z-20 flex flex-col items-center p-0">
                  {/* Top section with difficulty badge */}
                  <div className="w-full px-5 pt-5 flex justify-between items-center z-30">
                    <span className="text-xs text-white/60 font-medium">HSK Level</span>
                    <DifficultyBadge level={availableCards[currentCardIndex].difficulty} />
                  </div>
                  
                  {/* Main content area - better centered vertical text */}
                  <div className="flex-1 flex flex-col items-center justify-center w-full px-6">
                    {/* Pinyin - primary focus, better centered */}
                    <p className="text-3xl md:text-4xl font-medium text-white tracking-wide mb-6 text-center">
                      {availableCards[currentCardIndex].pinyin}.
                    </p>
                    
                    {/* Chinese characters */}
                    <p className="text-2xl md:text-3xl font-medium text-white mb-4 text-center">
                      {availableCards[currentCardIndex].chinesePhrase}
                    </p>
                  </div>
                  
                  {/* Quote and attribution area - improved to show full content */}
                  <div className="w-full px-5 py-6 bg-gradient-to-t from-black/95 to-black/20 mt-auto">
                    {/* Quote content with elegant styling - improved for full display */}
                    <div className="relative mb-3">
                      {/* Left quote mark */}
                      <span className="absolute -left-1 -top-3 text-white/20 text-2xl">"</span>
                      
                      <p className="text-sm text-white/90 leading-relaxed pl-3 pr-3 break-words">
                        <span className="font-medium">
                          {availableCards[currentCardIndex].movieTitle}:
                        </span> {availableCards[currentCardIndex].translation} 
                        {availableCards[currentCardIndex].quote && (
                          <span className="block mt-1">{availableCards[currentCardIndex].quote}</span>
                        )}
                      </p>
                      
                      {/* Right quote mark */}
                      <span className="absolute -right-1 bottom-0 text-white/20 text-2xl">"</span>
                    </div>
                    
                    {/* Movie details and card counter */}
                    <div className="flex items-center">
                      <div className="w-5 h-5 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-xs text-white/60 font-medium">
                        {availableCards[currentCardIndex].year}
                      </span>
                      
                      {/* Swipe indicator - only visible during swipe */}
                      {swipeDirection ? (
                        <span className={`ml-4 text-xs font-medium ${swipeDirection === 'right' ? 'text-green-400' : 'text-red-400'}`}>
                          {swipeDirection === 'right' ? 'Saving...' : 'Skipping...'}
                        </span>
                      ) : null}
                      
                      {/* Card counter aligned right */}
                      <span className="ml-auto text-xs text-white/40">
                        {currentCardIndex + 1}/{availableCards.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
      
      {/* Swipe Buttons (for desktop) */}
      <div className="flex gap-8">
        <Button 
          onClick={handleSwipeLeft}
          className="bg-gray-800 hover:bg-gray-700 text-white rounded-full h-16 w-16 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
        <Button 
          onClick={handleSwipeRight}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full h-16 w-16 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </Button>
      </div>
      
      {/* Instructions */}
      <div className="mt-8 text-center max-w-sm">
        <p className="text-gray-400 text-sm">
          <span className="text-white">Swipe right</span> to save phrases you want to learn.
          <br />
          <span className="text-white">Swipe left</span> to skip to the next one.
        </p>
      </div>
    </main>
  );
} 