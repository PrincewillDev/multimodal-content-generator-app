import React, { useState } from 'react';
import GeneratedContent from './GeneratedContent';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ComponentTester = () => {
  const [testData, setTestData] = useState({
    headline: "🎉 Revolutionary Smart Fitness Tracker!",
    caption: "Experience the ultimate in health monitoring with our AI-powered device that adapts to your lifestyle and provides personalized insights for optimal wellness.",
    imageURL: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
    audioURL: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
  });

  const [loadingStates, setLoadingStates] = useState({
    text: false,
    image: false,
    audio: false
  });

  const [customInput, setCustomInput] = useState({
    headline: "",
    caption: "",
    imageURL: "",
    audioURL: ""
  });

  const simulateLoading = (type: 'text' | 'image' | 'audio') => {
    setLoadingStates(prev => ({ ...prev, [type]: true }));
    
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, [type]: false }));
    }, 3000);
  };

  const updateTestData = () => {
    setTestData({
      headline: customInput.headline || testData.headline,
      caption: customInput.caption || testData.caption,
      imageURL: customInput.imageURL || testData.imageURL,
      audioURL: customInput.audioURL || testData.audioURL
    });
  };

  const presetTests = [
    {
      name: "Tech Product",
      data: {
        headline: "⚡ Next-Gen Smart Watch with AI Assistant",
        caption: "Revolutionary wearable technology that learns your habits and optimizes your daily routine with intelligent suggestions.",
        imageURL: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
        audioURL: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
      }
    },
    {
      name: "Eco Product",
      data: {
        headline: "🌱 Sustainable Bamboo Water Bottle",
        caption: "Stay hydrated while protecting the planet with our eco-friendly, BPA-free bamboo water bottle designed for active lifestyles.",
        imageURL: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
        audioURL: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
      }
    },
    {
      name: "Food Product",
      data: {
        headline: "🍫 Artisan Dark Chocolate Collection",
        caption: "Indulge in premium, ethically-sourced dark chocolate crafted by master chocolatiers using traditional techniques.",
        imageURL: "https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=800&q=80",
        audioURL: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">
              Generated Content Component Tester
            </h1>
            <p className="text-lg text-slate-600">
              Test all features of the responsive display component
            </p>
          </div>

          {/* Test Controls */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">Test Controls</h2>
            
            {/* Preset Tests */}
            <div className="mb-6">
              <Label className="text-lg font-semibold text-slate-700 block mb-3">
                Preset Test Cases
              </Label>
              <div className="flex flex-wrap gap-3">
                {presetTests.map((preset, index) => (
                  <Button
                    key={index}
                    onClick={() => setTestData(preset.data)}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <span>{preset.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Loading State Tests */}
            <div className="mb-6">
              <Label className="text-lg font-semibold text-slate-700 block mb-3">
                Test Loading States
              </Label>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => simulateLoading('text')}
                  disabled={loadingStates.text}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {loadingStates.text ? 'Loading...' : 'Test Text Loading'}
                </Button>
                <Button
                  onClick={() => simulateLoading('image')}
                  disabled={loadingStates.image}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  {loadingStates.image ? 'Loading...' : 'Test Image Loading'}
                </Button>
                <Button
                  onClick={() => simulateLoading('audio')}
                  disabled={loadingStates.audio}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {loadingStates.audio ? 'Loading...' : 'Test Audio Loading'}
                </Button>
              </div>
            </div>

            {/* Custom Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="custom-headline">Custom Headline</Label>
                <Input
                  id="custom-headline"
                  placeholder="Enter custom headline"
                  value={customInput.headline}
                  onChange={(e) => setCustomInput(prev => ({ ...prev, headline: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="custom-caption">Custom Caption</Label>
                <Input
                  id="custom-caption"
                  placeholder="Enter custom caption"
                  value={customInput.caption}
                  onChange={(e) => setCustomInput(prev => ({ ...prev, caption: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="custom-image">Custom Image URL</Label>
                <Input
                  id="custom-image"
                  placeholder="Enter image URL"
                  value={customInput.imageURL}
                  onChange={(e) => setCustomInput(prev => ({ ...prev, imageURL: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="custom-audio">Custom Audio URL</Label>
                <Input
                  id="custom-audio"
                  placeholder="Enter audio URL"
                  value={customInput.audioURL}
                  onChange={(e) => setCustomInput(prev => ({ ...prev, audioURL: e.target.value }))}
                />
              </div>
            </div>
            
            <Button 
              onClick={updateTestData}
              className="mt-4 w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              Update Test Data
            </Button>
          </div>

          {/* Component Display */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6 text-center">
              Component Preview
            </h2>
            <GeneratedContent
              headline={testData.headline}
              caption={testData.caption}
              imageURL={testData.imageURL}
              audioURL={testData.audioURL}
              isLoading={loadingStates}
            />
          </div>

          {/* Feature Checklist */}
          <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">Feature Checklist</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-700">Visual Features</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>Responsive typography</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>Rounded image corners</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>Centered layout</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>Loading animations</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-700">Interactive Features</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>Audio play/pause controls</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>Progress bar tracking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>Download functionality</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>Error handling</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentTester;
