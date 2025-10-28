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
  const [searchHistory, setSearchHistory] = useState([]);
  const [currentSearchId, setCurrentSearchId] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    subset: '',
    weight: '',
    containsItalic: false,
  });

  const saveToHistory = (prompt, message, aiResponse, fonts) => {
    const newSearch = {
      id: Date.now(),
      prompt: prompt.trim(),
      message: message.trim(),
      aiResponse,
      fonts,
      timestamp: new Date().toLocaleString(),
    };

    setSearchHistory(prev => [newSearch, ...prev.slice(0, 9)]);
    setCurrentSearchId(newSearch.id);
  };

  const loadFromHistory = (historyItem) => {
    setPrompt(historyItem.prompt);
    setUserText(historyItem.message);
    setAiOutput(historyItem.aiResponse);
    setFontPreviews(historyItem.fonts);
    setCurrentSearchId(historyItem.id);
    setError('');
  };

  const clearHistory = () => {
    setSearchHistory([]);
    setCurrentSearchId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!prompt.trim()) {
      setError('Please fill in the font style request field.');
      return;
    }

    setIsLoading(true);
    setError('');
    setFontPreviews([]);

    try {
      const response = await fetch('http://localhost:3000/api/fonts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          message: userText.trim() || 'The quick brown fox jumps over the lazy dog',
          filters, // ✅ envoi des filtres au backend
        }),
      });

      if (!response.ok) throw new Error('Failed to get font suggestions');

      const data = await response.json();
      setAiOutput(data.response);
      setFontPreviews(data.fonts || []);

      const messageToSave = userText.trim() || 'The quick brown fox jumps over the lazy dog';
      saveToHistory(prompt, messageToSave, data.response, data.fonts || []);
    } catch (err) {
      console.error('Error:', err);
      setError('Sorry, something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Prompt */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Font Style Request
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., I need a futuristic font for a tech startup logo"
              className="w-full h-24 p-2 border rounded-md dark:bg-gray-700 dark:text-white"
              disabled={isLoading}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Preview Text
            </label>
            <textarea
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              placeholder="Enter the text you want to preview"
              className="w-full h-24 p-2 border rounded-md dark:bg-gray-700 dark:text-white mb-4"
              disabled={isLoading}
            />

            <div className="grid grid-cols-2 gap-3 mb-4">
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="border p-2 rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="">Category</option>
                <option value="sans-serif">Sans-serif</option>
                <option value="serif">Serif</option>
                <option value="display">Display</option>
                <option value="handwriting">Handwriting</option>
                <option value="monospace">Monospace</option>
              </select>

              <select
                value={filters.subset}
                onChange={(e) => setFilters({ ...filters, subset: e.target.value })}
                className="border p-2 rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="">Subset</option>
                <option value="latin">Latin</option>
                <option value="latin-ext">Latin Extended</option>
                <option value="cyrillic">Cyrillic</option>
                <option value="arabic">Arabic</option>
              </select>

              <select
                value={filters.weight}
                onChange={(e) => setFilters({ ...filters, weight: e.target.value })}
                className="border p-2 rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="">Weight</option>
                <option value="100">100</option>
                <option value="300">300</option>
                <option value="400">400</option>
                <option value="500">500</option>
                <option value="700">700</option>
                <option value="900">900</option>
              </select>

              <label className="flex items-center gap-2 border p-2 rounded-md dark:bg-gray-700 dark:text-white">
                <input
                  type="checkbox"
                  checked={filters.containsItalic}
                  onChange={(e) => setFilters({ ...filters, containsItalic: e.target.checked })}
                />
                Italic
              </label>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading || !prompt.trim()}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isLoading ? 'Finding Fonts...' : 'Get Font Suggestions'}
            </button>
          </div>

          {/* AI Output */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 overflow-y-auto">
            <h3 className="text-sm font-medium mb-4 text-gray-700 dark:text-gray-300">
              AI Assistant
            </h3>
            {isLoading ? (
              <div className="text-gray-500">Analyzing your request...</div>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{aiOutput}</p>
            )}
          </div>

          {/* Search History */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 max-h-80 overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Recent Searches ({searchHistory.length})
              </h3>
              {searchHistory.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-xs text-gray-500 hover:text-red-500"
                >
                  Clear All
                </button>
              )}
            </div>

            {searchHistory.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent searches</p>
            ) : (
              searchHistory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => loadFromHistory(item)}
                  className={`p-3 mb-2 border rounded cursor-pointer ${
                    currentSearchId === item.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.prompt.slice(0, 40)}...
                  </p>
                  <p className="text-xs text-gray-500">{item.fonts.length} fonts</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 overflow-y-auto">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Font Previews
          </h3>
          {fontPreviews.length === 0 ? (
            <div className="text-center text-gray-500">Font previews will appear here</div>
          ) : (
            <div className="space-y-4">
              {fontPreviews.map((font, index) => (
                <FontPreviewCard
                  key={index}
                  fontFamily={font.family}
                  previewText={userText || 'The quick brown fox jumps over the lazy dog'}
                  cardStyl="default"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
