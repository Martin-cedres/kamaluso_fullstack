import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface TopBarSettings {
  enabled: boolean;
  text: string;
  link: string;
  couponCode: string;
  backgroundColor: string;
  textColor: string;
}

const TopBar = () => {
  const [settings, setSettings] = useState<TopBarSettings | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.topBar) {
          setSettings(data.topBar);
          setTimeout(() => setIsAnimated(true), 100);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching settings:', err);
        setIsLoading(false);
      });
  }, []);

  const topBarRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateHeight = () => {
      if (topBarRef.current && isVisible) {
        const height = topBarRef.current.offsetHeight;
        document.documentElement.style.setProperty('--topbar-height', `${height}px`);
      } else {
        document.documentElement.style.setProperty('--topbar-height', '0px');
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [isVisible, settings]);

  const handleClose = () => {
    setIsAnimated(false);
    setTimeout(() => setIsVisible(false), 300);
  };

  if (isLoading || !settings || !settings.enabled || !isVisible) {
    return null;
  }

  return (
    <div
      ref={topBarRef}
      className={`fixed top-0 left-0 right-0 z-[100] overflow-hidden transition-all duration-500 ease-out ${isAnimated ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      style={{
        backgroundColor: settings.backgroundColor || '#000000',
        color: settings.textColor || '#ffffff'
      }}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/10 animate-gradient-x"></div>

      {/* Sparkle effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-ping"></div>
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-white/40 rounded-full animate-bounce"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-center gap-3">

          {/* Animated icon */}
          <div className="hidden sm:flex items-center animate-bounce">
            <div className="bg-gradient-to-br from-yellow-300 to-pink-500 rounded-full p-2 shadow-lg shadow-pink-500/50">
              <SparklesIcon className="h-5 w-5 text-white animate-pulse" />
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <p className="text-base sm:text-lg font-bold text-center animate-pulse">
              <span className="inline-block hover:scale-110 transition-transform">
                {settings.text}
              </span>
            </p>

            <div className="flex items-center gap-2">
              {settings.couponCode && (
                <span className="relative inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-3 py-1.5 rounded-full text-sm font-black tracking-wider shadow-lg transform hover:scale-110 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/50 animate-pulse">
                  <span className="absolute inset-0 bg-white/30 rounded-full animate-ping opacity-75"></span>
                  <span className="relative flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                    {settings.couponCode}
                  </span>
                </span>
              )}

              {settings.link && (
                <Link
                  href={settings.link}
                  className="group relative inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-300 hover:scale-110 hover:shadow-lg border-2 border-white/40 hover:border-white/60">
                  <span>Ver más</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/10 transition-all"></span>
                </Link>
              )}
            </div>
          </div>

          {/* Close button with animation */}
          <button
            type="button"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/20 rounded-full transition-all duration-300 hover:rotate-90 hover:scale-110 group"
            onClick={handleClose}
            aria-label="Cerrar anuncio"
          >
            <XMarkIcon className="h-5 w-5 group-hover:text-red-300 transition-colors" />
          </button>
        </div>
      </div>

      {/* Animated bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 animate-gradient-x"></div>

      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default TopBar;
