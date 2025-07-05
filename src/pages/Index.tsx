import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Play, Download, RefreshCcw } from "lucide-react";
import { API_CONFIG, getApiUrl } from "@/config/api";
import GeneratedContent from "@/components/GeneratedContent";
import { useWebSpeech } from "@/hooks/useWebSpeech";

// Type definitions for better type safety
type ToneType = 'playful' | 'serious' | 'bold';

interface GeneratedContent {
  headline: string;
  caption: string;
  imageURL: string;
  audioURL: string;
  imageError?: string;
}

const Index = () => {
  // Core input state
  const [textPrompt, setTextPrompt] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<ToneType>('playful');
  
  // Generated content state
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent>({
    headline: '',
    caption: '',
    imageURL: '',
    audioURL: '',
    imageError: undefined
  });
  
  // UI state
  const [showResults, setShowResults] = useState<boolean>(false);
  const [loadingStates, setLoadingStates] = useState({
    text: false,
    image: false,
    audio: false
  });

  // Web Speech API hook for voice generation
  const webSpeech = useWebSpeech();

  // Input handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextPrompt(e.target.value);
  };

  const handleToneSelect = (tone: ToneType) => {
    setSelectedTone(tone);
  };

  const handleGenerate = async () => {
    if (!textPrompt.trim()) return;

    try {
      // Reset previous content and show loading states
      setGeneratedContent({
        headline: '',
        caption: '',
        imageURL: '',
        audioURL: '',
        imageError: undefined
      });
      setShowResults(true);
      setLoadingStates({ text: true, image: true, audio: true });

      // Create tone-specific prompts
      const toneModifiers = {
        playful: 'fun, engaging, and energetic',
        serious: 'professional, authoritative, and trustworthy', 
        bold: 'powerful, confident, and impactful'
      };

      const toneModifier = toneModifiers[selectedTone];
      
      // Parallel API calls for better performance
      const [textResponse, imageResponse, audioResponse] = await Promise.allSettled([
        // Text Generation API Call
        generateText(textPrompt, toneModifier),
        // Image Generation API Call  
        generateImage(textPrompt, selectedTone),
        // Audio Generation API Call (we'll generate this after we get the caption)
        Promise.resolve(null) // Placeholder for now, we'll generate audio after text
      ]);

      // Handle text generation results
      if (textResponse.status === 'fulfilled' && textResponse.value) {
        const { headline, caption } = textResponse.value;
        setGeneratedContent(prev => ({ ...prev, headline, caption }));
        setLoadingStates(prev => ({ ...prev, text: false }));

        // Generate audio from the caption using Web Speech API
        try {
          // Web Speech API generates audio instantly, no async needed
          setGeneratedContent(prev => ({ ...prev, audioURL: 'web-speech-ready' }));
          setLoadingStates(prev => ({ ...prev, audio: false }));
        } catch (audioError) {
          console.error('Audio preparation failed:', audioError);
          setLoadingStates(prev => ({ ...prev, audio: false }));
        }
      } else {
        console.error('Text generation failed:', textResponse);
        setLoadingStates(prev => ({ ...prev, text: false, audio: false }));
      }

      // Handle image generation results
      if (imageResponse.status === 'fulfilled' && imageResponse.value) {
        setGeneratedContent(prev => ({ ...prev, imageURL: imageResponse.value as string }));
        setLoadingStates(prev => ({ ...prev, image: false }));
      } else {
        console.error('Image generation failed:', imageResponse);
        setLoadingStates(prev => ({ ...prev, image: false }));
        
        // Set error message for image generation
        if (imageResponse.status === 'rejected') {
          const errorMessage = imageResponse.reason?.message || 'Image generation failed';
          setGeneratedContent(prev => ({ 
            ...prev, 
            imageError: errorMessage 
          }));
        }
      }

    } catch (error) {
      console.error('Content generation failed:', error);
      setLoadingStates({ text: false, image: false, audio: false });
    }
  };

  // Text Generation API Function - Updated for Hugging Face Llama 3.1 8B
  const generateText = async (prompt: string, tone: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeouts.text);

    try {
      const response = await fetch('/api/generate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          tone: selectedTone, // Pass the actual tone value
          temperature: 0.7,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Text API request failed: ${response.statusText}. ${errorData.error || ''}`);
      }

      const data = await response.json();
      
      // Validate response structure
      if (!data.headline || !data.caption) {
        throw new Error('Invalid response format from text API');
      }

      return {
        headline: data.headline,
        caption: data.caption
      };
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Text generation error:', error);
      
      // Enhanced fallback content with tone-specific messaging
      const toneSpecificFallbacks = {
        playful: {
          headline: `🎉 Amazing ${prompt} Experience!`,
          caption: `Get ready for the most fun and exciting ${prompt} adventure! This is going to be absolutely incredible! 🚀✨`
        },
        serious: {
          headline: `Professional ${prompt} Solution`,
          caption: `Discover the industry-leading ${prompt} that delivers reliable, proven results for your business needs.`
        },
        bold: {
          headline: `Revolutionary ${prompt} Changes Everything`,
          caption: `The most powerful ${prompt} solution available. Don't settle for ordinary—demand excellence and transformation.`
        }
      };
      
      const fallback = toneSpecificFallbacks[selectedTone as keyof typeof toneSpecificFallbacks] || toneSpecificFallbacks.playful;
      
      return fallback;
    }
  };

  // Image Generation API Function
  const generateImage = async (prompt: string, tone: ToneType) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeouts.image);

    try {
      const toneStyles = {
        playful: 'colorful, fun, vibrant, cartoon-like style, cheerful, bright colors',
        serious: 'professional, clean, minimalist, corporate style, neutral colors, sleek design',
        bold: 'dramatic, high-contrast, powerful, dynamic style, striking colors, impactful composition'
      };

      const response = await fetch(getApiUrl('generateImage'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `${prompt}, ${toneStyles[tone]}, high quality, detailed, product photography`,
          tone: tone, // Pass the tone to the API
          model: API_CONFIG.defaults.image.model,
          size: API_CONFIG.defaults.image.size,
          quality: API_CONFIG.defaults.image.quality,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle specific error types
        if (response.status === 503 && errorData.modelLoading) {
          throw new Error(`AI model is loading. Please try again in ${errorData.retryAfter || 60} seconds.`);
        } else if (response.status === 408 && errorData.timeout) {
          throw new Error(`Request timed out. Please try again.`);
        } else if (response.status === 400) {
          throw new Error(`Configuration error: ${errorData.message || 'API key not configured'}`);
        } else {
          throw new Error(`Image generation failed: ${errorData.message || response.statusText}`);
        }
      }

      const data = await response.json();
      
      if (!data.imageURL) {
        throw new Error('No image URL received from API');
      }
      
      return data.imageURL;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Image generation error:', error);
      throw error; // Re-throw to be handled by the caller
    }
  };

  // Audio Generation Function - Now using Web Speech API
  const generateAudio = async (text: string, tone: ToneType) => {
    try {
      // Web Speech API is available instantly, no need for async calls
      if (webSpeech.isSupported) {
        console.log(`🎤 Web Speech API ready for ${tone} tone audio generation`);
        return 'web-speech-ready'; // Special marker indicating Web Speech API is ready
      } else {
        console.warn('⚠️ Web Speech API not supported in this browser');
        return 'web-speech-not-supported';
      }
    } catch (error) {
      console.error('Audio preparation error:', error);
      return 'web-speech-error';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGenerate();
  };

  const handleRegenerate = async (type: 'text' | 'image' | 'audio') => {
    if (!textPrompt.trim()) return;

    setLoadingStates(prev => ({ ...prev, [type]: true }));

    try {
      const toneModifier = {
        playful: 'fun, engaging, and energetic',
        serious: 'professional, authoritative, and trustworthy', 
        bold: 'powerful, confident, and impactful'
      }[selectedTone];

      switch (type) {
        case 'text': {
          const textResult = await generateText(textPrompt, toneModifier);
          setGeneratedContent(prev => ({ 
            ...prev, 
            headline: textResult.headline, 
            caption: textResult.caption 
          }));
          break;
        }

        case 'image': {
          const imageResult = await generateImage(textPrompt, selectedTone);
          setGeneratedContent(prev => ({ ...prev, imageURL: imageResult }));
          break;
        }

        case 'audio': {
          const currentCaption = generatedContent.caption || `Experience ${textPrompt} with our ${selectedTone} approach.`;
          const audioResult = await generateAudio(currentCaption, selectedTone);
          setGeneratedContent(prev => ({ ...prev, audioURL: audioResult }));
          break;
        }
      }
    } catch (error) {
      console.error(`${type} regeneration failed:`, error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [type]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 leading-tight">
              Multimodal AI Content Generator
            </h1>
            <p className="text-lg text-slate-600 max-w-lg mx-auto">
              Transform your ideas into compelling content with AI-powered creativity
            </p>
          </div>

          {/* Main Form Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 md:p-10 mb-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Product/Idea Input */}
              <div className="space-y-3">
                <Label 
                  htmlFor="product-idea" 
                  className="text-lg font-semibold text-slate-700 block"
                >
                  Enter your product or idea
                </Label>
                <Input
                  id="product-idea"
                  type="text"
                  placeholder="e.g., Eco-friendly water bottle for athletes"
                  value={textPrompt}
                  onChange={handleInputChange}
                  className="w-full h-14 text-lg rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 bg-white/70 backdrop-blur-sm shadow-sm transition-all duration-200"
                  required
                />
              </div>

              {/* Tone Selector */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-slate-700 block">
                  Choose your tone
                </Label>
                <RadioGroup
                  value={selectedTone}
                  onValueChange={handleToneSelect}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <div className="relative">
                    <RadioGroupItem
                      value="playful"
                      id="playful"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="playful"
                      className="flex items-center justify-center h-16 px-6 rounded-xl border-2 border-slate-200 bg-white/70 backdrop-blur-sm cursor-pointer transition-all duration-200 hover:border-pink-300 hover:shadow-md peer-checked:border-pink-400 peer-checked:bg-pink-50/80 peer-checked:shadow-lg"
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-1">🎉</div>
                        <div className="font-semibold text-slate-700">Playful</div>
                      </div>
                    </Label>
                  </div>

                  <div className="relative">
                    <RadioGroupItem
                      value="serious"
                      id="serious"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="serious"
                      className="flex items-center justify-center h-16 px-6 rounded-xl border-2 border-slate-200 bg-white/70 backdrop-blur-sm cursor-pointer transition-all duration-200 hover:border-blue-300 hover:shadow-md peer-checked:border-blue-400 peer-checked:bg-blue-50/80 peer-checked:shadow-lg"
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-1">💼</div>
                        <div className="font-semibold text-slate-700">Serious</div>
                      </div>
                    </Label>
                  </div>

                  <div className="relative">
                    <RadioGroupItem
                      value="bold"
                      id="bold"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="bold"
                      className="flex items-center justify-center h-16 px-6 rounded-xl border-2 border-slate-200 bg-white/70 backdrop-blur-sm cursor-pointer transition-all duration-200 hover:border-orange-300 hover:shadow-md peer-checked:border-orange-400 peer-checked:bg-orange-50/80 peer-checked:shadow-lg"
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-1">⚡</div>
                        <div className="font-semibold text-slate-700">Bold</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={!textPrompt.trim() || loadingStates.text || loadingStates.image || loadingStates.audio}
                >
                  {(loadingStates.text || loadingStates.image || loadingStates.audio) ? (
                    <>
                      <RefreshCcw className="h-5 w-5 mr-2 animate-spin" />
                      Generating Content...
                    </>
                  ) : (
                    'Generate Content'
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Results Display Section */}
          {showResults && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 md:p-10 animate-fade-in">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Generated Content</h2>
              
              {/* Progress Indicator */}
              {(loadingStates.text || loadingStates.image || loadingStates.audio) && (
                <div className="mb-8 bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-blue-800">Generating Your Content</h3>
                    <span className="text-sm text-blue-600">
                      {Object.values(loadingStates).filter(Boolean).length} of 3 in progress
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className={`flex items-center text-sm ${loadingStates.text ? 'text-blue-600' : 'text-green-600'}`}>
                      {loadingStates.text ? (
                        <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <div className="h-4 w-4 mr-2 rounded-full bg-green-500 flex items-center justify-center">
                          <div className="h-2 w-2 bg-white rounded-full"></div>
                        </div>
                      )}
                      Text Content {loadingStates.text ? '(Generating...)' : '(Complete)'}
                    </div>
                    <div className={`flex items-center text-sm ${loadingStates.image ? 'text-blue-600' : 'text-green-600'}`}>
                      {loadingStates.image ? (
                        <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <div className="h-4 w-4 mr-2 rounded-full bg-green-500 flex items-center justify-center">
                          <div className="h-2 w-2 bg-white rounded-full"></div>
                        </div>
                      )}
                      Image Content {loadingStates.image ? '(Generating...)' : '(Complete)'}
                    </div>
                    <div className={`flex items-center text-sm ${loadingStates.audio ? 'text-blue-600' : 'text-green-600'}`}>
                      {loadingStates.audio ? (
                        <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <div className="h-4 w-4 mr-2 rounded-full bg-green-500 flex items-center justify-center">
                          <div className="h-2 w-2 bg-white rounded-full"></div>
                        </div>
                      )}
                      Audio Content {loadingStates.audio ? '(Generating...)' : '(Complete)'}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Generated Content Component */}
              <GeneratedContent
                headline={generatedContent.headline}
                caption={generatedContent.caption}
                imageURL={generatedContent.imageURL}
                audioURL={generatedContent.audioURL}
                imageError={generatedContent.imageError}
                isLoading={loadingStates}
                webSpeech={webSpeech}
                selectedTone={selectedTone}
                onRegenerate={handleRegenerate}
              />
              
              {/* Regenerate Controls */}
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button
                  onClick={() => handleRegenerate('text')}
                  disabled={loadingStates.text}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  {loadingStates.text ? (
                    <RefreshCcw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCcw className="h-4 w-4" />
                  )}
                  <span>Regenerate Text</span>
                </Button>
                
                <Button
                  onClick={() => handleRegenerate('image')}
                  disabled={loadingStates.image}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  {loadingStates.image ? (
                    <RefreshCcw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCcw className="h-4 w-4" />
                  )}
                  <span>Regenerate Image</span>
                </Button>
                
                <Button
                  onClick={() => handleRegenerate('audio')}
                  disabled={loadingStates.audio}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  {loadingStates.audio ? (
                    <RefreshCcw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCcw className="h-4 w-4" />
                  )}
                  <span>Regenerate Audio</span>
                </Button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-slate-500 text-sm">
              Powered by advanced AI to bring your ideas to life
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
