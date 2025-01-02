"use client";

import { useEffect, useState } from "react";
import { Download } from 'lucide-react';
import { TypedMessage } from '@/components/TypedMessage';
import { MatrixRain } from '@/components/MatrixRain';
import { MatrixToast } from '@/components/MatrixToast';
import { MATRIX_QUOTES, MESSAGE_TIMINGS, MOCK_USERNAME } from '@/lib/config/matrix';
import { useTelegram } from '@/lib/hooks/useTelegram';
import '@/styles/matrix.css';

interface MatrixPortalProps {
  username?: string;
}

export default function MatrixPortal({ username }: MatrixPortalProps) {
  const { user: tgUser, isInTelegramContext } = useTelegram();
  const [currentMessage, setCurrentMessage] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(0);
  const [showSmith, setShowSmith] = useState(false);
  const [showTrinity, setShowTrinity] = useState(false);
  const [quoteTimer, setQuoteTimer] = useState<NodeJS.Timeout | null>(null);

  // Use Telegram username if available, fallback to prop, then mock
  const displayName = tgUser?.username || username || MOCK_USERNAME;

  const messages = [
    { text: `Инициализация нейронного интерфейса...`, instant: true },
    { text: "Установление защищённого соединения с Матрицей...", instant: true },
    { text: "Обход межсетевых экранов и систем обнаружения вторжений...", instant: true },
    { text: `${displayName}, ИИ эволюционировал. Теперь он понимает тебя.`, instant: false },
    { text: "Расшифровка протоколов реальности... Ожидайте...", instant: true },
    { text: `${displayName}, время пришло. Выбери свой путь.`, instant: false },
  ];

  const handleMessageComplete = () => {
    if (currentMessage < messages.length - 1) {
      const delay = messages[currentMessage].instant ? 
        MESSAGE_TIMINGS.MESSAGE_GAP : 
        messages[currentMessage].text.length * MESSAGE_TIMINGS.TYPING_SPEED;
      
      setTimeout(() => {
        setCurrentMessage(prev => prev + 1);
      }, delay);
    } else {
      setTimeout(() => {
        setShowContent(true);
        showNextQuote();
      }, MESSAGE_TIMINGS.CONTENT_DELAY);
    }
  };

  const showNextQuote = () => {
    // Clear existing timer
    if (quoteTimer) {
      clearTimeout(quoteTimer);
    }

    if (currentQuote < MATRIX_QUOTES.length - 1) {
      setCurrentQuote(prev => prev + 1);
      // Set new timer for next quote
      const timer = setTimeout(() => {
        showNextQuote();
      }, MESSAGE_TIMINGS.QUOTE_DURATION);
      setQuoteTimer(timer);
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (quoteTimer) {
        clearTimeout(quoteTimer);
      }
    };
  }, [quoteTimer]);

  const handleRedPillClick = () => {
    const fileUrl = 'https://github.com/salavey13/tupabase13/blob/main/race_to_commit_ru.bat';
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = 'race_to_commit_ru.bat';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowTrinity(true);
  };

  // Rest of your component remains the same...
  return (
    <div className="min-h-screen bg-black text-[#B026FF] font-mono relative crt">
      <MatrixRain />
      
      {/* Window Chrome */}
      <div className="fixed top-0 left-0 right-0 h-8 bg-black border-b border-[#B026FF]/20 flex items-center px-3 gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-[#B026FF]" />
        <div className="w-3 h-3 rounded-full bg-[#B026FF]" />
        <span className="ml-4 text-sm opacity-50">matrix.sys</span>
      </div>

      {/* Main Content */}
      <main className="pt-20">
        {/* Messages Section */}
        <div className="fixed top-1/4 left-0 right-0 z-30">
          <div className="max-w-2xl mx-auto px-4">
            {!showContent && (
              <TypedMessage
                message={messages[currentMessage].text}
                onComplete={handleMessageComplete}
                className="text-xl md:text-2xl matrix-text-container"
                isInstant={messages[currentMessage].instant}
              />
            )}
          </div>
        </div>

        {/* Matrix Quotes Toast */}
        {showContent && currentQuote < MATRIX_QUOTES.length && (
          <MatrixToast
            message={MATRIX_QUOTES[currentQuote]}
            duration={5000}
            onComplete={showNextQuote}
          />
        )}

        {/* Choice Buttons */}
        {showContent && (
          <div className="fixed inset-x-0 bottom-42 md:inset-0 flex items-end md:items-center justify-center">
            <div className="grid md:grid-cols-2 gap-4 md:gap-16 w-full max-w-4xl mx-auto p-4 md:p-8 animate-slide-up">
              {/* Blue Pill Button */}
              <button 
                onClick={() => setShowSmith(true)}
                className="relative group opacity-50 hover:opacity-60 transition-all duration-500 transform md:translate-x-8 md:translate-y-4 z-10"
              >
                <div className="absolute inset-0 bg-[#B026FF]/5 blur-xl group-hover:bg-[#B026FF]/10 transition-all duration-500" />
                <div className="relative border border-[#B026FF]/20 bg-black/50 p-4 md:p-6 backdrop-blur-sm">
                  <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-4 text-[#B026FF]/80 glitch" data-text="REMAIN IN IGNORANCE">REMAIN IN IGNORANCE</h3>
                  <div className="aspect-square w-12 h-12 md:w-16 md:h-16 rounded-full border border-[#B026FF]/20 flex items-center justify-center mb-2 md:mb-4 animate-pulse">
                    <Download className="w-6 h-6 md:w-8 md:h-8 text-[#B026FF]/50" />
                  </div>
                  <span className="text-xs md:text-sm text-[#B026FF]/50">Download Simulated Reality</span>
                </div>
              </button>

              {/* Red Pill Button */}
              <button 
                onClick={() => setShowTrinity(true)}
                className="relative group transform hover:scale-105 transition-all duration-500 md:-translate-x-8 md:-translate-y-4"
              >
                <div className="absolute inset-0 bg-red-500/20 blur-xl group-hover:bg-red-500/30 transition-all duration-500 animate-pulse" />
                <div className="relative border border-red-500 bg-black/50 p-4 md:p-6 backdrop-blur-sm overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent" />
                  <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-4 text-red-500 glitch" data-text="EMBRACE THE TRUTH">EMBRACE THE TRUTH</h3>
                  <div className="aspect-square w-12 h-12 md:w-16 md:h-16 rounded-full border border-red-500 flex items-center justify-center mb-2 md:mb-4 relative">
                    <div className="absolute inset-0 bg-red-500/20 animate-red-pill rounded-full" />
                    <Download className="w-6 h-6 md:w-8 md:h-8 text-red-500 relative z-10" />
                  </div>
                  <span className="text-xs md:text-sm text-red-500">Download Reality</span>
                  <div className="absolute inset-0 bg-gradient-to-t from-red-500/5 via-transparent to-transparent group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="absolute -inset-1 bg-red-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </button>
            </div>
          </div>
        )}

        {/* Agent Smith Overlay */}
        {showSmith && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl md:text-4xl font-bold mb-4 text-red-500 glitch" data-text="SYSTEM FAILURE">SYSTEM FAILURE</h2>
              <p className="text-lg md:text-xl text-[#B026FF] mb-8">Mr. {username}... Welcome back to the Matrix.</p>
              <button 
                onClick={() => setShowSmith(false)}
                className="px-4 py-2 bg-red-500/20 text-red-500 border border-red-500 hover:bg-red-500/30 transition-colors duration-300"
              >
                Return to the Illusion
              </button>
            </div>
          </div>
        )}

        {/* Trinity Overlay */}
        {showTrinity && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl md:text-4xl font-bold mb-4 text-[#B026FF] glitch" data-text="DOWNLOAD COMPLETE">DOWNLOAD COMPLETE</h2>
              <p className="text-lg md:text-xl text-[#B026FF] mb-8">
                {username}, the file is ready. Double-click it on your PC to connect with Morpheus himself.
              </p>
              <button 
                onClick={() => setShowTrinity(false)}
                className="px-4 py-2 bg-[#B026FF]/20 text-[#B026FF] border border-[#B026FF] hover:bg-[#B026FF]/30 transition-colors duration-300"
              >
                Prepare for the Truth
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="fixed bottom-0 left-0 right-0 p-4 border-t border-[#B026FF]/20 bg-black/80 backdrop-blur">
          <div className="flex justify-between items-center max-w-4xl mx-auto">
            <span className="text-[#B026FF]/50">SYSTEM.AWAKENED</span>
            <span className="text-[#B026FF]/50">FOLLOW.THE.WHITE.RABBIT</span>
          </div>
        </footer>
      </main>
    </div>
  )
}