"use client";

import { useState, useEffect, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CardTemplateType, Card as CardType } from '@/lib/types';
import { fileToBase64, generateUniqueId, compressImage, calculateBase64Size } from '@/lib/imageUtils';
import { getCards, saveCard } from '@/lib/storage';

// Constants for image size limits
const MAX_IMAGE_WIDTH = 1200;
const MAX_IMAGE_HEIGHT = 1200;
const MAX_IMAGE_SIZE_MB = 5; // Maximum file size in MB
const COMPRESSION_QUALITY = 0.7; // JPEG compression quality (0.0 - 1.0)

export default function CardMakerPage() {
  const router = useRouter();
  const [hasCards, setHasCards] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageStats, setImageStats] = useState<{original: string, compressed: string} | null>(null);
  const [formValues, setFormValues] = useState({
    hanziText: '',
    pinyinText: '',
    translationText: '',
    templateType: CardTemplateType.MEME_STYLE
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Check if the user has any cards already
  useEffect(() => {
    const cards = getCards();
    setHasCards(cards.length > 0);
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLoading(true);
      try {
        const file = e.target.files[0];
        
        // Check file size before processing
        if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
          alert(`Image is too large. Maximum size is ${MAX_IMAGE_SIZE_MB}MB. Please choose a smaller image or resize it first.`);
          setLoading(false);
          return;
        }
        
        // Convert to base64
        const base64 = await fileToBase64(file);
        
        // Compress the image
        const compressedImage = await compressImage(
          base64,
          MAX_IMAGE_WIDTH,
          MAX_IMAGE_HEIGHT,
          COMPRESSION_QUALITY
        );
        
        // Calculate sizes for display
        const originalSize = calculateBase64Size(base64);
        const compressedSize = calculateBase64Size(compressedImage);
        
        setImageStats({
          original: `${(originalSize / (1024 * 1024)).toFixed(2)}MB`,
          compressed: `${(compressedSize / (1024 * 1024)).toFixed(2)}MB`
        });
        
        // Use the compressed image
        setUploadedImage(compressedImage);
      } catch (error) {
        console.error('Error processing image:', error);
        alert('There was an error processing your image. Please try again with a different image.');
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTemplateChange = (value: string) => {
    setFormValues(prev => ({ 
      ...prev, 
      templateType: value as CardTemplateType 
    }));
  };
  
  const handleSaveCard = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!uploadedImage || !formValues.hanziText) {
      alert('Please upload an image and enter Chinese text');
      return;
    }
    
    const newCard: CardType = {
      id: generateUniqueId(),
      imageUrl: uploadedImage,
      hanziText: formValues.hanziText,
      pinyinText: formValues.pinyinText,
      translationText: formValues.translationText,
      templateType: formValues.templateType,
      isFlaggedForReview: false,
      createdAt: new Date().toISOString(),
      lastReviewedAt: null
    };
    
    // Check the image size and warn if it's still large after compression
    const imageSize = calculateBase64Size(uploadedImage) / (1024 * 1024); // Size in MB
    if (imageSize > 0.5) {
      console.warn(`Large image detected: ${imageSize.toFixed(2)} MB. This may cause storage issues.`);
      const shouldProceed = confirm(`The uploaded image is quite large (${imageSize.toFixed(2)} MB). This may fill up your browser storage quickly. Would you like to proceed anyway?`);
      if (!shouldProceed) {
        return;
      }
    }
    
    setLoading(true);
    try {
      const saveSuccess = await saveCard(newCard);
      if (saveSuccess) {
        router.push('/my-cards');
      } else {
        alert('Failed to save card. Please try again with a smaller image or export and delete some existing cards first.');
      }
    } catch (error) {
      console.error('Error saving card:', error);
      alert('An error occurred while saving the card. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const goToMyCards = () => {
    router.push('/my-cards');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-red-950 to-orange-900 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <Card className="border border-gray-800 shadow-lg rounded-xl overflow-hidden bg-gray-900">
          <div className="p-6 md:p-8">
            <div className="mb-8">
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Chinese Memory Cards</h1>
              <p className="text-gray-400">
                Create memorable image-based cards to master Mandarin sentences
              </p>
            </div>

            <form onSubmit={handleSaveCard} className="space-y-8">
              {/* Upload Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-white">Upload an image</h2>
                  {imageStats && (
                    <span className="text-xs text-gray-400">
                      {imageStats.compressed} (compressed from {imageStats.original})
                    </span>
                  )}
                </div>
                
                <div 
                  onClick={triggerFileInput}
                  className={`relative border-2 border-dashed rounded-lg transition-all ${
                    uploadedImage ? 'border-red-500/50 bg-red-950/20' : 'border-gray-700 hover:border-red-500/30'
                  } cursor-pointer`}
                >
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="hidden" 
                  />
                  
                  {loading ? (
                    <div className="py-16 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                    </div>
                  ) : uploadedImage ? (
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md">
                      <Image 
                        src={uploadedImage} 
                        alt="Preview" 
                        fill
                        style={{ objectFit: 'contain' }}
                        className="p-2"
                      />
                    </div>
                  ) : (
                    <div className="py-12 px-4 flex flex-col items-center justify-center">
                      <div className="mb-3 p-3 bg-red-950/30 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-300 mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to {MAX_IMAGE_SIZE_MB}MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Text Input Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-white">Add your text</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="hanziText" className="block text-sm font-medium text-gray-300 mb-1">
                      Chinese Characters (Hanzi)
                    </label>
                    <Input
                      id="hanziText"
                      name="hanziText"
                      value={formValues.hanziText}
                      onChange={handleInputChange}
                      placeholder="我喜欢学习中文"
                      required
                      className="rounded-md bg-gray-800 border-gray-700 text-white focus:border-red-500 focus:ring focus:ring-red-500/20 focus:ring-opacity-50"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="pinyinText" className="block text-sm font-medium text-gray-300 mb-1">
                      Pinyin
                    </label>
                    <Input
                      id="pinyinText"
                      name="pinyinText"
                      value={formValues.pinyinText}
                      onChange={handleInputChange}
                      placeholder="Wǒ xǐhuān xuéxí zhōngwén"
                      className="rounded-md bg-gray-800 border-gray-700 text-white focus:border-red-500 focus:ring focus:ring-red-500/20 focus:ring-opacity-50"
                    />
                  </div>
                </div>
              </div>
              
              {/* Template Selection */}
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-white">Choose a template style</h2>
                
                <Tabs 
                  defaultValue={CardTemplateType.MEME_STYLE} 
                  value={formValues.templateType} 
                  onValueChange={handleTemplateChange}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-3 mb-4 p-1 bg-gray-800 rounded-lg">
                    <TabsTrigger 
                      value={CardTemplateType.MEME_STYLE} 
                      className="rounded-md text-gray-400 data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=active]:shadow-sm"
                    >
                      Meme Style
                    </TabsTrigger>
                    <TabsTrigger 
                      value={CardTemplateType.SUBTITLE_STYLE}
                      className="rounded-md text-gray-400 data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=active]:shadow-sm"
                    >
                      Subtitle
                    </TabsTrigger>
                    <TabsTrigger 
                      value={CardTemplateType.STICKY_NOTE_STYLE}
                      className="rounded-md text-gray-400 data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=active]:shadow-sm"
                    >
                      Sticky Note
                    </TabsTrigger>
                  </TabsList>
                  
                  <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <TabsContent value={CardTemplateType.MEME_STYLE}>
                      <p className="text-sm text-center text-gray-400 mb-2">Impact font with black outline</p>
                      <div className="bg-gray-700 aspect-[4/5] rounded-md flex items-center justify-center">
                        <p className="text-xl font-bold" style={{ 
                          fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
                          textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
                          color: 'white'
                        }}>
                          {formValues.hanziText || "样本文本 / Sample Text"}
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value={CardTemplateType.SUBTITLE_STYLE}>
                      <p className="text-sm text-center text-gray-400 mb-2">Semi-transparent bar at bottom</p>
                      <div className="bg-gray-700 aspect-[4/5] rounded-md relative">
                        <div className="absolute bottom-0 w-full bg-black/70 text-white p-2">
                          <p className="text-center">
                            {formValues.hanziText || "样本文本 / Sample Text"}
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value={CardTemplateType.STICKY_NOTE_STYLE}>
                      <p className="text-sm text-center text-gray-400 mb-2">Hand-drawn style frame</p>
                      <div className="bg-gray-700 aspect-[4/5] rounded-md flex items-center justify-center">
                        <div className="bg-yellow-100 p-3 rotate-1 shadow-md" style={{ 
                          border: '1px solid #e0e0e0',
                          boxShadow: '2px 2px 5px rgba(0,0,0,0.3)'
                        }}>
                          <p className="text-center text-gray-800" style={{ fontFamily: 'cursive' }}>
                            {formValues.hanziText || "样本文本 / Sample Text"}
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
              
              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
                {hasCards && (
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={goToMyCards}
                    className="w-full sm:w-auto border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    Go to My Cards
                  </Button>
                )}
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
                >
                  Create Card
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </main>
  );
} 