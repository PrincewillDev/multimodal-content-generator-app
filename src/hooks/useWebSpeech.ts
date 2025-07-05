// Web Speech API hook for tone-aware voice generation
import { useState, useEffect, useCallback } from 'react';

export type ToneType = 'playful' | 'serious' | 'bold';

interface VoiceSettings {
  pitch: number;
  rate: number;
  volume: number;
  voiceFilter: (voice: SpeechSynthesisVoice) => boolean;
  voicePreference: string[];
}

interface UseWebSpeechReturn {
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  isLoading: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  selectedVoice: SpeechSynthesisVoice | null;
  speak: (text: string, tone: ToneType) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setVoice: (voice: SpeechSynthesisVoice) => void;
}

export type { UseWebSpeechReturn };

export const useWebSpeech = (): UseWebSpeechReturn => {
  const [isSupported] = useState(() => 'speechSynthesis' in window);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  // Tone-specific voice settings
  const getToneSettings = useCallback((tone: ToneType): VoiceSettings => {
    switch (tone) {
      case 'playful':
        return {
          pitch: 1.3,
          rate: 1.2,
          volume: 1.0,
          voiceFilter: (voice) => 
            voice.name.toLowerCase().includes('female') || 
            voice.name.toLowerCase().includes('woman') ||
            voice.name.toLowerCase().includes('samantha') ||
            voice.name.toLowerCase().includes('zira') ||
            voice.name.toLowerCase().includes('hazel'),
          voicePreference: [
            'Google UK English Female',
            'Microsoft Zira Desktop',
            'Samantha',
            'Victoria',
            'Karen',
            'Moira'
          ]
        };
      
      case 'serious':
        return {
          pitch: 0.8,
          rate: 0.9,
          volume: 1.0,
          voiceFilter: (voice) => 
            voice.name.toLowerCase().includes('male') || 
            voice.name.toLowerCase().includes('man') ||
            voice.name.toLowerCase().includes('david') ||
            voice.name.toLowerCase().includes('mark') ||
            voice.name.toLowerCase().includes('daniel'),
          voicePreference: [
            'Google UK English Male',
            'Microsoft David Desktop',
            'Daniel',
            'Alex',
            'Fred',
            'Ralph'
          ]
        };
      
      case 'bold':
        return {
          pitch: 1.0,
          rate: 1.1,
          volume: 1.0,
          voiceFilter: (voice) => 
            voice.name.toLowerCase().includes('male') ||
            !voice.name.toLowerCase().includes('female'),
          voicePreference: [
            'Google US English',
            'Microsoft Mark Desktop',
            'Alex',
            'Daniel',
            'Tom',
            'Bruce'
          ]
        };
      
      default:
        return getToneSettings('playful');
    }
  }, []);

  // Load available voices
  const loadVoices = useCallback(() => {
    if (!isSupported) return;

    const availableVoices = speechSynthesis.getVoices();
    console.log('📢 Available voices:', availableVoices.map(v => `${v.name} (${v.lang})`));
    
    setVoices(availableVoices);
    setIsLoading(false);

    // Auto-select first available voice if none selected
    if (!selectedVoice && availableVoices.length > 0) {
      const englishVoices = availableVoices.filter(voice => 
        voice.lang.toLowerCase().includes('en')
      );
      setSelectedVoice(englishVoices[0] || availableVoices[0]);
    }
  }, [isSupported, selectedVoice]);

  // Load voices on component mount and when voices change
  useEffect(() => {
    if (!isSupported) return;

    loadVoices();

    // Some browsers load voices asynchronously
    const handleVoicesChanged = () => {
      console.log('🔄 Voices changed, reloading...');
      loadVoices();
    };

    speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    
    // Fallback for browsers that don't fire voiceschanged
    const fallbackTimer = setTimeout(loadVoices, 1000);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      clearTimeout(fallbackTimer);
    };
  }, [isSupported, loadVoices]);

  // Select best voice for tone
  const selectVoiceForTone = useCallback((tone: ToneType): SpeechSynthesisVoice | null => {
    if (voices.length === 0) return null;

    const settings = getToneSettings(tone);
    
    // First, try to find voices by preference
    for (const preferredName of settings.voicePreference) {
      const preferredVoice = voices.find(voice => 
        voice.name.toLowerCase().includes(preferredName.toLowerCase())
      );
      if (preferredVoice) {
        console.log(`🎯 Selected preferred voice for ${tone}:`, preferredVoice.name);
        return preferredVoice;
      }
    }

    // Then filter by voice characteristics
    const filteredVoices = voices.filter(settings.voiceFilter);
    const englishVoices = filteredVoices.filter(voice => 
      voice.lang.toLowerCase().includes('en')
    );

    const selectedVoice = englishVoices[0] || filteredVoices[0] || voices[0];
    console.log(`🎭 Selected voice for ${tone} tone:`, selectedVoice?.name);
    
    return selectedVoice;
  }, [voices, getToneSettings]);

  // Speak function
  const speak = useCallback((text: string, tone: ToneType) => {
    if (!isSupported) {
      console.warn('⚠️ Web Speech API not supported');
      return;
    }

    // Stop any current speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const settings = getToneSettings(tone);
    const voice = selectVoiceForTone(tone);

    // Apply tone settings
    utterance.pitch = settings.pitch;
    utterance.rate = settings.rate;
    utterance.volume = settings.volume;
    
    if (voice) {
      utterance.voice = voice;
    }

    // Event handlers
    utterance.onstart = () => {
      console.log(`🗣️ Started speaking in ${tone} tone:`, text.substring(0, 50) + '...');
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      console.log('✅ Finished speaking');
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = (event) => {
      console.error('❌ Speech synthesis error:', event.error);
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onpause = () => {
      console.log('⏸️ Speech paused');
      setIsPaused(true);
    };

    utterance.onresume = () => {
      console.log('▶️ Speech resumed');
      setIsPaused(false);
    };

    // Start speaking
    speechSynthesis.speak(utterance);
  }, [isSupported, getToneSettings, selectVoiceForTone]);

  // Control functions
  const pause = useCallback(() => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
    }
  }, []);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice);
  }, []);

  return {
    isSupported,
    voices,
    isLoading,
    isSpeaking,
    isPaused,
    selectedVoice,
    speak,
    pause,
    resume,
    stop,
    setVoice
  };
};
