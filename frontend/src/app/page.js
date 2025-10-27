'use client';

import { useState } from 'react';
import FontPreviewCard from '../components/FontPreviewCard';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [userText, setUserText] = useState('');
  const [aiOutput, setAiOutput] = useState('');
  const [fontPreviews, setFontPreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!prompt.trim() || !userText.trim()) {
      setError('Please fill in both the prompt and text fields.');
      return;
    }

    setIsLoading(true);
    setError('');
    setFontPreviews([]);

    try {
      // TODO: Replace with actual backend API endpoint
      const response = await fetch('/api/font-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          text: userText.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get font suggestions');
      }

      const data = await response.json();
      setAiOutput(data.aiResponse);
      setFontPreviews(data.fonts || []);
    } catch (err) {
      setError('Sorry, something went wrong. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Desktop: 2-column, Mobile: 1-column */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-screen lg:h-[calc(100vh-2rem)]">
          
          {/* Left Column - 3 sections (1/3 width on desktop) */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Section 1: Prompt Field */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex-shrink-0">
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Font Style Request
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., I need a futuristic font for a tech startup logo"
                className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                disabled={isLoading}
              />
            </div>

            {/* Section 2: User Text Field */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex-shrink-0">
              <label htmlFor="userText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preview Text
              </label>
              <textarea
                id="userText"
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
                placeholder="Enter the text you want to preview in different fonts"
                className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                disabled={isLoading}
              />
              
              {/* Submit Button */}
              <div className="mt-4">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !prompt.trim() || !userText.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                >
                  {isLoading ? 'Finding Fonts...' : 'Get Font Suggestions'}
                </button>
              </div>
            </div>

            {/* Section 3: AI Output */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex-1 overflow-y-auto">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">AI Assistant</h3>
              
              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Analyzing your request...</span>
                </div>
              )}
              
              {/* Error State */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                  <p className="text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}
              
              {/* Default State */}
              {!isLoading && !error && !aiOutput && (
                <div className="text-center py-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Font Assistant</h2>
                  <p className="text-gray-600 dark:text-gray-400">Enter your text and the font you're looking for to start</p>
                </div>
              )}
              
              {/* AI Response */}
              {aiOutput && !isLoading && (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{aiOutput}</div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Font Previews (2/3 width on desktop) */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 lg:overflow-y-auto">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Font Previews</h3>
            
            {/* Hardcoded Test Cards */}
            <div className="mb-6">
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">Test Preview</h4>
              <FontPreviewCard
                fontFamily="Papyrus"
                designer="Chris Costello"
                previewText={userText || "The quick brown fox jumps over the lazy dog"}
                cardStyle="elevated"
                className="mb-4"
              />
              <FontPreviewCard
                fontFamily="Comic Sans MS"
                designer="Vincent Connare"
                previewText={userText || "The quick brown fox jumps over the lazy dog"}
                cardStyle="elevated"
                className="mb-4"
              />
            </div>

            {fontPreviews.length === 0 && !isLoading && (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Dynamic font previews will appear here</p>
              </div>
            )}
            
            {/* Dynamic Font Preview Cards */}
            <div className="space-y-4">
              {fontPreviews.map((font, index) => (
                <FontPreviewCard
                  key={index}
                  fontFamily={font.family}
                  designer={font.designer}
                  previewText={userText}
                  cardStyle="default"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
