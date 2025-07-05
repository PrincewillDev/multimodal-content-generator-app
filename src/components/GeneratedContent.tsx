import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, StopCircle, RefreshCcw, Download } from "lucide-react";
import { UseWebSpeechReturn, ToneType } from "@/hooks/useWebSpeech";
import './GeneratedContent.css';

interface GeneratedContentProps {
  headline: string;
  caption: string;
  imageURL: string;
  audioURL: string;
  imageError?: string;
  isLoading?: {
    text: boolean;
    image: boolean;
    audio: boolean;
  };
  webSpeech?: UseWebSpeechReturn;
  selectedTone?: ToneType;
  onRegenerate?: (type: 'text' | 'image' | 'audio') => void;
}

const GeneratedContent: React.FC<GeneratedContentProps> = ({
  headline,
  caption,
  imageURL,
  audioURL,
  imageError,
  isLoading = { text: false, image: false, audio: false },
  webSpeech,
  selectedTone = 'playful',
  onRegenerate
}) => {
  // Web Speech API state (replaces traditional audio player state)
  const [isWebSpeechReady, setIsWebSpeechReady] = useState(false);
  
  // Legacy audio state for fallback compatibility
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  
  // Check if Web Speech API is ready
  useEffect(() => {
    setIsWebSpeechReady(audioURL === 'web-speech-ready' && webSpeech?.isSupported);
  }, [audioURL, webSpeech?.isSupported]);
  
  // Update Web Speech API state when it changes
  useEffect(() => {
    if (webSpeech) {
      setIsPlaying(webSpeech.isSpeaking);
    }
  }, [webSpeech?.isSpeaking, webSpeech]);
  
  // Calculate progress percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  useEffect(() => {
    // Update progress bar width using CSS custom property
    if (progressRef.current) {
      progressRef.current.style.setProperty('--progress-width', `${Math.min(100, Math.max(0, progress))}%`);
    }
  }, [progress]);
  
  useEffect(() => {
    // Reset audio state when audio URL changes
    setIsPlaying(false);
    setCurrentTime(0);
    setIsAudioLoaded(false);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [audioURL]);
  
  const togglePlayPause = () => {
    // Use Web Speech API if available and ready
    if (isWebSpeechReady && webSpeech && caption) {
      if (webSpeech.isSpeaking) {
        if (webSpeech.isPaused) {
          webSpeech.resume();
        } else {
          webSpeech.pause();
        }
      } else {
        // Start speaking the caption with the selected tone
        webSpeech.speak(caption, selectedTone);
      }
      return;
    }
    
    // Fallback to traditional audio player
    if (audioRef.current && audioURL && audioURL !== '/placeholder-audio.mp3' && audioURL !== 'web-speech-ready') {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // Web Speech API stop function
  const stopSpeech = () => {
    if (isWebSpeechReady && webSpeech) {
      webSpeech.stop();
    }
  };
  
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };
  
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsAudioLoaded(true);
    }
  };
  
  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };
  
  const handleDownload = () => {
    if (audioURL && audioURL !== '/placeholder-audio.mp3') {
      const link = document.createElement('a');
      link.href = audioURL;
      link.download = `${headline.substring(0, 20).replace(/[^a-z0-9]/gi, '-').toLowerCase()}-audio.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  // Image download function
  const downloadImage = async (imageUrl: string, filename: string = 'generated-image.jpg') => {
    try {
      // Handle base64 data URLs
      if (imageUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // Handle regular URLs
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
      // Fallback: open image in new tab
      window.open(imageUrl, '_blank');
    }
  };
  // Format time in MM:SS
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Headline Section */}
      <div className="text-center space-y-3">
        {isLoading.text ? (
          <div className="space-y-3">
            <div className="h-8 shimmer rounded-lg w-3/4 mx-auto"></div>
            <div className="h-6 shimmer rounded-lg w-1/2 mx-auto"></div>
          </div>
        ) : (
          <>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 leading-tight">
              {headline || "Your AI-Generated Headline Will Appear Here"}
            </h1>
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
              {caption || "Your engaging caption content will be generated and displayed here."}
            </p>
          </>
        )}
      </div>

      {/* Image Preview Section */}
      <div className="flex justify-center px-4">
        {isLoading.image ? (
          <div className="relative w-full max-w-2xl">
            <div className="aspect-video shimmer rounded-2xl"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-slate-600 font-medium">Generating Image...</p>
              </div>
            </div>
          </div>
        ) : imageURL ? (
          <div className="group relative w-full max-w-2xl image-container">
            <img 
              src={imageURL} 
              alt={headline || "Generated content"} 
              className="w-full h-auto rounded-2xl shadow-lg"
              onLoad={() => console.log('Image loaded successfully')}
              onError={(e) => {
                console.error('Image failed to load from:', imageURL);
              }}
            />
            {/* Download Image Button */}
            <div className="absolute bottom-4 right-4">
              <Button
                onClick={() => downloadImage(imageURL, `${headline}.jpg`)}
                variant="outline"
                className="flex items-center space-x-2 bg-white border border-slate-300 rounded-full shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span className="text-slate-600 font-medium">Download Image</span>
              </Button>
            </div>
          </div>
        ) : imageError ? (
          <div className="w-full max-w-2xl aspect-video bg-red-50 rounded-2xl border-2 border-dashed border-red-300 flex items-center justify-center">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-red-600 font-medium mb-2">Image Generation Failed</p>
              <p className="text-red-500 text-sm">{imageError}</p>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-2xl aspect-video bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-slate-500 font-medium">Generated image will appear here</p>
            </div>
          </div>
        )}
      </div>

      {/* Audio Player Section */}
      <div className="w-full max-w-lg mx-auto px-4">
        {isLoading.audio ? (
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-center text-slate-600">Preparing audio...</p>
              <div className="h-2 bg-slate-200 animate-pulse rounded-full"></div>
            </div>
          </div>
        ) : isWebSpeechReady ? (
          // Web Speech API Controls
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200 shadow-sm">
            {/* Web Speech Header */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">AI Voice Narration</h3>
                <p className="text-sm text-slate-600">
                  {selectedTone.charAt(0).toUpperCase() + selectedTone.slice(1)} tone • Web Speech API
                </p>
              </div>
            </div>
            
            {/* Voice Status */}
            {webSpeech && (
              <div className="mb-4 p-3 bg-white/50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Voice Status:</span>
                  <span className={`font-medium ${
                    webSpeech.isSpeaking 
                      ? webSpeech.isPaused 
                        ? 'text-orange-600' 
                        : 'text-green-600'
                      : 'text-slate-500'
                  }`}>
                    {webSpeech.isSpeaking 
                      ? webSpeech.isPaused 
                        ? 'Paused' 
                        : 'Speaking'
                      : 'Ready'
                    }
                  </span>
                </div>
                {webSpeech.selectedVoice && (
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-slate-600">Voice:</span>
                    <span className="text-slate-700 font-medium">{webSpeech.selectedVoice.name}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Web Speech Controls */}
            <div className="flex items-center justify-center space-x-3">
              <Button
                onClick={togglePlayPause}
                disabled={!caption || !webSpeech?.isSupported}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {webSpeech?.isSpeaking && !webSpeech?.isPaused ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
                <span>
                  {webSpeech?.isSpeaking && !webSpeech?.isPaused 
                    ? 'Pause' 
                    : webSpeech?.isPaused 
                      ? 'Resume' 
                      : 'Speak'
                  }
                </span>
              </Button>
              
              {webSpeech?.isSpeaking && (
                <Button
                  onClick={stopSpeech}
                  variant="outline"
                  className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200"
                >
                  <StopCircle className="w-4 h-4" />
                  <span>Stop</span>
                </Button>
              )}
              
              {onRegenerate && (
                <Button
                  onClick={() => onRegenerate('audio')}
                  variant="outline"
                  className="flex items-center space-x-2 hover:bg-slate-100 transition-all duration-200"
                >
                  <RefreshCcw className="w-4 h-4" />
                  <span>Regenerate</span>
                </Button>
              )}
            </div>
            
            {/* Browser Support Info */}
            {!webSpeech?.isSupported && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  🔊 Web Speech API is not supported in your browser. Please try Chrome, Edge, or Safari for voice features.
                </p>
              </div>
            )}
          </div>
        ) : audioURL && audioURL !== '/placeholder-audio.mp3' && audioURL !== 'web-speech-ready' ? (
          // Traditional Audio Player (fallback)
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 shadow-sm">
            <audio 
              ref={audioRef}
              src={audioURL} 
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleAudioEnded}
              className="hidden"
            />
            
            {/* Audio Header */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Generated Audio</h3>
                <p className="text-sm text-slate-500">
                  {isAudioLoaded ? `${formatTime(duration)}` : 'Loading...'}
                </p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden mb-4">
              <div 
                ref={progressRef}
                className="progress-bar absolute h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              ></div>
            </div>
            
            {/* Time Display */}
            <div className="flex justify-between text-sm text-slate-500 mb-4">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-between">
              <Button
                onClick={togglePlayPause}
                disabled={!isAudioLoaded}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </Button>
              
              <Button
                onClick={handleDownload}
                variant="outline"
                className="flex items-center space-x-2 hover:bg-slate-100 transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <Volume2 className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">Audio will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneratedContent;
