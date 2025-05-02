"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Toggle } from '@/components/ui/toggle';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CardDisplay from '@/components/CardDisplay';
import { Card as CardType, ViewMode, FilterType } from '@/lib/types';
import { getCards, toggleCardReviewFlag, deleteCard, exportCardsAsJSON, clearAllCards } from '@/lib/storage';
import { downloadCardAsPNG, cardElementRefs } from '@/lib/imageUtils';

// Constants for pagination
const PAGE_SIZE_OPTIONS = [8, 16, 32, 64];
const DEFAULT_PAGE_SIZE = 16;

export default function MyCardsPage() {
  const router = useRouter();
  const [cards, setCards] = useState<CardType[]>([]);
  const [filteredCards, setFilteredCards] = useState<CardType[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.GALLERY);
  const [activeFilter, setActiveFilter] = useState<FilterType>(FilterType.ALL);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [paginatedCards, setPaginatedCards] = useState<CardType[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  
  // Load cards from local storage
  useEffect(() => {
    const loadedCards = getCards();
    setCards(loadedCards);
    setFilteredCards(loadedCards);
  }, []);

  // Apply filter when cards or active filter changes
  useEffect(() => {
    let result = [...cards];
    
    switch (activeFilter) {
      case FilterType.NEW:
        // Cards created in the last 24 hours
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        result = cards.filter(card => new Date(card.createdAt) > oneDayAgo);
        break;
        
      case FilterType.FLAGGED:
        result = cards.filter(card => card.isFlaggedForReview);
        break;
        
      case FilterType.ALL:
      default:
        // All cards (no filtering)
        break;
    }
    
    setFilteredCards(result);
    // Reset to page 1 when filter changes
    setCurrentPage(1);
  }, [cards, activeFilter]);
  
  // Update paginated cards whenever filteredCards, currentPage or pageSize changes
  useEffect(() => {
    const totalItems = filteredCards.length;
    const calculatedTotalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    
    setTotalPages(calculatedTotalPages);
    
    // Ensure current page is within valid range
    const validCurrentPage = Math.min(currentPage, calculatedTotalPages);
    if (validCurrentPage !== currentPage) {
      setCurrentPage(validCurrentPage);
    }
    
    // Calculate start and end indices for the current page
    const startIndex = (validCurrentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    
    // Get current page of cards
    const currentPageCards = filteredCards.slice(startIndex, endIndex);
    setPaginatedCards(currentPageCards);
  }, [filteredCards, currentPage, pageSize]);

  const handleCreateNewCard = () => {
    router.push('/create');
  };

  const handleToggleReview = (cardId: string) => {
    toggleCardReviewFlag(cardId);
    
    // Update the cards state to reflect the change
    setCards(prevCards => 
      prevCards.map(card => 
        card.id === cardId 
          ? { ...card, isFlaggedForReview: !card.isFlaggedForReview, lastReviewedAt: new Date().toISOString() } 
          : card
      )
    );
  };

  const handleDeleteCard = (cardId: string) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      deleteCard(cardId);
      setCards(prevCards => prevCards.filter(card => card.id !== cardId));
    }
  };

  const handleDownloadCard = (cardId: string) => {
    const cardElement = cardElementRefs.current[cardId];
    if (cardElement) {
      const card = cards.find(c => c.id === cardId);
      if (card) {
        downloadCardAsPNG(cardElement, `chinese-card-${card.id.slice(0, 5)}`);
      }
    }
  };

  const handleExportAllCards = () => {
    const jsonData = exportCardsAsJSON();
    const dataBlob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `chinese-memory-cards-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const handleClearAllCards = () => {
    if (window.confirm('Are you sure you want to delete ALL cards? This action cannot be undone! Please make sure you have exported your cards first.')) {
      clearAllCards();
      setCards([]);
      setFilteredCards([]);
    }
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handlePageSizeChange = (value: string) => {
    const newSize = parseInt(value, 10);
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };
  
  // Generate pagination items
  const renderPaginationItems = () => {
    if (totalPages <= 1) return null;
    
    const items = [];
    const maxVisiblePages = 5; // Maximum number of page numbers to show
    
    // Always show first page
    items.push(
      <PaginationItem key="page-1">
        <PaginationLink 
          isActive={currentPage === 1} 
          onClick={() => handlePageChange(1)}
          className={`bg-gray-800 border-gray-700 ${currentPage === 1 ? 'text-white bg-gray-700' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );
    
    // Calculate range of visible pages
    let startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);
    
    // Adjust start if end is too close to total
    if (endPage <= startPage) {
      endPage = Math.min(totalPages - 1, startPage + 1);
    }
    
    // Show ellipsis if needed before middle pages
    if (startPage > 2) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis className="text-gray-400" />
        </PaginationItem>
      );
    }
    
    // Middle pages
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={`page-${i}`}>
          <PaginationLink 
            isActive={currentPage === i} 
            onClick={() => handlePageChange(i)}
            className={`bg-gray-800 border-gray-700 ${currentPage === i ? 'text-white bg-gray-700' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Show ellipsis if needed after middle pages
    if (endPage < totalPages - 1) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis className="text-gray-400" />
        </PaginationItem>
      );
    }
    
    // Always show last page if there's more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={`page-${totalPages}`}>
          <PaginationLink 
            isActive={currentPage === totalPages} 
            onClick={() => handlePageChange(totalPages)}
            className={`bg-gray-800 border-gray-700 ${currentPage === totalPages ? 'text-white bg-gray-700' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-red-950 to-orange-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">My Cards</h1>
            <p className="text-gray-300 opacity-80">{cards.length > 0 ? `You have ${cards.length} memory ${cards.length === 1 ? 'card' : 'cards'}` : 'No cards yet'}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
            <Button 
              onClick={handleCreateNewCard} 
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white border-0"
            >
              Create New Card
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleExportAllCards}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Export All Cards
            </Button>
            
            <Button 
              variant="outline" 
              className="border-red-800 text-red-400 hover:bg-red-950/50 hover:text-red-300"
              onClick={handleClearAllCards}
            >
              Clear All Cards
            </Button>
          </div>
        </div>
        
        <Card className="mb-8 border-gray-800 bg-gray-900 shadow-xl rounded-xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-gray-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Filter Tabs */}
              <Tabs 
                defaultValue={FilterType.ALL} 
                value={activeFilter}
                onValueChange={(value) => setActiveFilter(value as FilterType)}
                className="w-full sm:w-auto"
              >
                <TabsList className="bg-gray-800 p-1 rounded-lg w-full sm:w-auto grid grid-cols-3 sm:flex">
                  <TabsTrigger 
                    value={FilterType.ALL}
                    className="rounded-md text-gray-400 data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=active]:shadow-sm"
                  >
                    All Cards
                  </TabsTrigger>
                  <TabsTrigger 
                    value={FilterType.NEW}
                    className="rounded-md text-gray-400 data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=active]:shadow-sm"
                  >
                    New
                  </TabsTrigger>
                  <TabsTrigger 
                    value={FilterType.FLAGGED}
                    className="rounded-md text-gray-400 data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=active]:shadow-sm"
                  >
                    Flagged
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-300">View Mode:</span>
                <Tabs 
                  defaultValue={ViewMode.GALLERY} 
                  value={viewMode}
                  onValueChange={(value) => setViewMode(value as ViewMode)}
                >
                  <TabsList className="bg-gray-800 p-1 rounded-lg">
                    <TabsTrigger 
                      value={ViewMode.LIST}
                      className="rounded-md text-gray-400 data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=active]:shadow-sm"
                    >
                      List
                    </TabsTrigger>
                    <TabsTrigger 
                      value={ViewMode.GALLERY}
                      className="rounded-md text-gray-400 data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=active]:shadow-sm"
                    >
                      Gallery
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="bg-gray-900 p-4 md:p-6">
            {filteredCards.length === 0 ? (
              <div className="text-center py-12 px-4">
                <p className="text-gray-400 mb-4">No cards found. Let&apos;s create your first card!</p>
                <Button 
                  onClick={handleCreateNewCard}
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
                >
                  Create Your First Card
                </Button>
              </div>
            ) : (
              <>
                {/* Cards Display */}
                <div className={viewMode === ViewMode.GALLERY ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "space-y-3"}>
                  {paginatedCards.map(card => (
                    viewMode === ViewMode.GALLERY ? (
                      // Gallery View
                      <div key={card.id} className="relative group rounded-lg overflow-hidden shadow-md bg-gray-800 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
                        <div ref={(el) => { cardElementRefs.current[card.id] = el; }}>
                          <CardDisplay card={card} showPinyin={false} showTranslation={false} />
                        </div>
                        
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 rounded-full bg-gray-900/80 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                            onClick={() => handleToggleReview(card.id)}
                          >
                            {card.isFlaggedForReview ? '✓' : '○'}
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 rounded-full bg-gray-900/80 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                            onClick={() => handleDownloadCard(card.id)}
                          >
                            ↓
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 rounded-full bg-gray-900/80 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                            onClick={() => handleDeleteCard(card.id)}
                          >
                            ×
                          </Button>
                        </div>
                        
                        {/* Flag indicator */}
                        {card.isFlaggedForReview && (
                          <div className="absolute top-0 left-0 bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs font-medium px-2 py-1 rounded-br">
                            Review
                          </div>
                        )}

                        {/* Dialog for expanded view */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="absolute inset-0 w-full h-full cursor-pointer z-10 opacity-0"></button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800 text-white">
                            <DialogHeader>
                              <DialogTitle>{card.hanziText}</DialogTitle>
                            </DialogHeader>
                            <div className="max-w-sm mx-auto my-4">
                              <CardDisplay card={card} />
                            </div>
                            <div className="flex justify-between mt-4">
                              <Button 
                                variant="outline" 
                                onClick={() => handleToggleReview(card.id)}
                                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                              >
                                {card.isFlaggedForReview ? 'Remove Flag' : 'Flag for Review'}
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => handleDownloadCard(card.id)}
                                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                              >
                                Download PNG
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    ) : (
                      // List View
                      <div key={card.id} 
                        className="flex justify-between items-center border border-gray-800 rounded-lg p-4 bg-gray-800/50 hover:bg-gray-800 transition-colors"
                      >
                        <div className="hidden" ref={(el) => { cardElementRefs.current[card.id] = el; }}>
                          <CardDisplay card={card} />
                        </div>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <div className="cursor-pointer flex-grow">
                              <div className="flex flex-col">
                                <p className="font-bold text-lg text-white">{card.hanziText}</p>
                                {card.pinyinText && <p className="text-sm text-gray-300">{card.pinyinText}</p>}
                                {card.translationText && <p className="text-sm text-gray-400 italic">{card.translationText}</p>}
                              </div>
                            </div>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800 text-white">
                            <DialogHeader>
                              <DialogTitle>{card.hanziText}</DialogTitle>
                            </DialogHeader>
                            <div className="max-w-sm mx-auto my-4">
                              <CardDisplay card={card} />
                            </div>
                            <div className="flex justify-between mt-4">
                              <Button 
                                variant="outline" 
                                onClick={() => handleToggleReview(card.id)}
                                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                              >
                                {card.isFlaggedForReview ? 'Remove Flag' : 'Flag for Review'}
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => handleDownloadCard(card.id)}
                                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                              >
                                Download PNG
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <div className="flex items-center gap-2">
                          {card.isFlaggedForReview && (
                            <div className="px-2 py-1 bg-gradient-to-r from-orange-600/20 to-red-600/20 text-orange-300 rounded text-xs border border-orange-800/30">
                              Review
                            </div>
                          )}
                          <Toggle 
                            aria-label="Toggle review flag"
                            pressed={card.isFlaggedForReview}
                            onPressedChange={() => handleToggleReview(card.id)}
                            className="text-gray-400 data-[state=on]:text-orange-400 data-[state=on]:bg-orange-950/30 hover:bg-gray-700/50"
                          >
                            ⭐
                          </Toggle>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDownloadCard(card.id)}
                            className="text-gray-400 hover:text-white hover:bg-gray-700/50"
                          >
                            ↓
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteCard(card.id)}
                            className="text-gray-400 hover:text-red-400 hover:bg-red-950/30"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    )
                  ))}
                </div>
                
                {/* Pagination Controls */}
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Cards per page:</span>
                    <Select 
                      value={pageSize.toString()} 
                      onValueChange={handlePageSizeChange}
                    >
                      <SelectTrigger className="w-20 bg-gray-800 border-gray-700 text-gray-300">
                        <SelectValue placeholder={pageSize.toString()} />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-gray-300">
                        {PAGE_SIZE_OPTIONS.map(size => (
                          <SelectItem key={size} value={size.toString()}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-gray-400">
                      Showing {Math.min((currentPage - 1) * pageSize + 1, filteredCards.length)} to {Math.min(currentPage * pageSize, filteredCards.length)} of {filteredCards.length}
                    </span>
                  </div>
                  
                  {totalPages > 1 && (
                    <Pagination>
                      <PaginationContent>
                        {currentPage > 1 && (
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => handlePageChange(currentPage - 1)} 
                              className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                            />
                          </PaginationItem>
                        )}
                        
                        {renderPaginationItems()}
                        
                        {currentPage < totalPages && (
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => handlePageChange(currentPage + 1)} 
                              className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                            />
                          </PaginationItem>
                        )}
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
} 