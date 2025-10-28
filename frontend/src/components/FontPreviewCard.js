import { useEffect, useState } from 'react';

export default function FontPreviewCard({
  fontFamily,
  previewText,
  className = "",
  textSize = "text-xl",
  cardStyle = "default",
  isGoogleFont = true
}) {
  const [fontLoaded, setFontLoaded] = useState(false);

  // Generate Google Fonts URLs
  const fontSpecimenUrl = `https://fonts.google.com/specimen/${fontFamily?.replace(/\s+/g, '+')}`;

  // Load Google Font dynamically
  useEffect(() => {
    if (!isGoogleFont) {
      setFontLoaded(true);
      return;
    }

    const loadGoogleFont = async () => {
      try {
        // Create the Google Fonts link
        const fontUrl = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}&display=swap`;
        
        // Check if the font is already loaded
        const existingLink = document.querySelector(`link[href="${fontUrl}"]`);
        if (existingLink) {
          setFontLoaded(true);
          return;
        }

        // Create and append the link element
        const link = document.createElement('link');
        link.href = fontUrl;
        link.rel = 'stylesheet';
        link.onload = () => setFontLoaded(true);
        link.onerror = () => {
          console.warn(`Failed to load font: ${fontFamily}`);
          setFontLoaded(true); // Still show the card, but with fallback font
        };
        
        document.head.appendChild(link);
      } catch (error) {
        console.warn(`Error loading font ${fontFamily}:`, error);
        setFontLoaded(true);
      }
    };

    loadGoogleFont();
  }, [fontFamily, isGoogleFont]);

  // Different card styles
  const cardStyles = {
    default: "border border-gray-200 dark:border-gray-600 rounded-lg p-4",
    elevated: "border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow duration-300",
    minimal: "border-l-4 border-blue-500 pl-4 py-2",
    compact: "border border-gray-200 dark:border-gray-600 rounded-md p-3"
  };

  const selectedStyle = cardStyles[cardStyle] || cardStyles.default;

  return (
    <div className={`${selectedStyle} ${className}`}>
      {/* Font Info */}
      <div className="mb-3">
        <a
          href={fontSpecimenUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
        >
          {fontFamily}
        </a>
      </div>
      
      {/* Subtle separator line */}
      <div className="mx-4 mb-4 h-px bg-gray-200 dark:bg-gray-600"></div>
      
      {/* Preview Text */}
      <div className="relative">
        {!fontLoaded && isGoogleFont && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Loading font...</span>
            </div>
          </div>
        )}
        <div
          className={`${textSize} text-gray-900 dark:text-white leading-relaxed transition-opacity duration-300 ${
            !fontLoaded && isGoogleFont ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ fontFamily: `"${fontFamily}", sans-serif` }}
        >
          {previewText}
        </div>
      </div>
    </div>
  );
}