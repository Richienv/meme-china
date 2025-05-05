"use client";

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="max-w-6xl w-full mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
          Chinese Learning <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500">Hub</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Your one-stop platform for mastering Mandarin through interactive and creative learning experiences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl w-full">
        {/* Memory Cards Feature */}
        <div 
          onClick={() => navigateTo('/card-maker')}
          className="group cursor-pointer transition-all duration-300 hover:translate-y-[-8px]"
        >
          <Card className="overflow-hidden h-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-red-500/50 transition-colors shadow-xl group-hover:shadow-red-900/20">
            <div className="relative h-48 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-red-600/20 to-red-900/60 z-10"></div>
              <div className="absolute inset-0 bg-[url('/card-bg.jpg')] bg-cover bg-center opacity-50"></div>
              <div className="relative z-20 h-full flex items-center justify-center p-6">
                <div className="w-32 h-32 bg-red-900/70 rounded-xl flex items-center justify-center shadow-lg transform rotate-3 group-hover:rotate-0 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="p-6 text-center">
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors">Memory Cards</h2>
              <p className="text-gray-400 mb-6">
                Create customized Chinese flashcards with images, pinyin, and translations to master vocabulary and phrases.
              </p>
              <div className="inline-flex py-2 px-4 rounded-full bg-gradient-to-r from-red-600/20 to-orange-600/20 text-red-400 text-sm font-medium border border-red-800/30">
                Most Popular
              </div>
              <div className="mt-6 text-center">
                <span className="inline-flex items-center text-sm text-red-400 font-medium">
                  Create Cards 
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Movie References Feature */}
        <div 
          onClick={() => navigateTo('/movie-references')}
          className="group cursor-pointer transition-all duration-300 hover:translate-y-[-8px]"
        >
          <Card className="overflow-hidden h-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-indigo-500/50 transition-colors shadow-xl group-hover:shadow-indigo-900/20">
            <div className="relative h-48 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/20 to-indigo-900/60 z-10"></div>
              <div className="absolute inset-0 bg-[url('/movie-bg.jpg')] bg-cover bg-center opacity-50"></div>
              <div className="relative z-20 h-full flex items-center justify-center p-6">
                <div className="w-32 h-32 bg-indigo-900/70 rounded-xl flex items-center justify-center shadow-lg transform -rotate-3 group-hover:rotate-0 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="p-6 text-center">
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">Movie References</h2>
              <p className="text-gray-400 mb-6">
                Learn Chinese through famous movie scenes and quotes. Practice with authentic dialogue and cultural context.
              </p>
              <div className="inline-flex py-2 px-4 rounded-full bg-gradient-to-r from-indigo-600/20 to-purple-600/20 text-indigo-400 text-sm font-medium border border-indigo-800/30">
                New!
              </div>
              <div className="mt-6 text-center">
                <span className="inline-flex items-center text-sm text-indigo-400 font-medium">
                  Explore 
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* My Cards Quick Access */}
      <div className="mt-12 text-center">
        <button 
          onClick={() => navigateTo('/my-cards')}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <span>View My Saved Cards</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </main>
  );
}
