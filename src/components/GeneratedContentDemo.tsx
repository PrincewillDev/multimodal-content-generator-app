import React from 'react';
import GeneratedContent from './GeneratedContent';

const GeneratedContentDemo = () => {
  // Demo data to showcase the component
  const demoContent = {
    headline: "🎉 Revolutionary Smart Fitness Tracker!",
    caption: "Experience the ultimate in health monitoring with our AI-powered device that adapts to your lifestyle and provides personalized insights for optimal wellness.",
    imageURL: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
    audioURL: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
  };

  const loadingStates = {
    text: false,
    image: false,
    audio: false
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Demo Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">
              Generated Content Display Demo
            </h1>
            <p className="text-lg text-slate-600">
              Showcase of the responsive React component with Tailwind CSS
            </p>
          </div>

          {/* Demo Component */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <GeneratedContent
              headline={demoContent.headline}
              caption={demoContent.caption}
              imageURL={demoContent.imageURL}
              audioURL={demoContent.audioURL}
              isLoading={loadingStates}
            />
          </div>

          {/* Features Overview */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/60 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Dynamic Headlines</h3>
              <p className="text-sm text-slate-600">Large, bold text with responsive typography</p>
            </div>

            <div className="bg-white/60 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🖼️</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Image Preview</h3>
              <p className="text-sm text-slate-600">Rounded, centered with hover effects</p>
            </div>

            <div className="bg-white/60 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🎵</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Audio Player</h3>
              <p className="text-sm text-slate-600">Custom controls with progress tracking</p>
            </div>

            <div className="bg-white/60 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Responsive</h3>
              <p className="text-sm text-slate-600">Mobile-first design approach</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratedContentDemo;
