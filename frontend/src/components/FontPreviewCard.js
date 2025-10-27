export default function FontPreviewCard({
  fontFamily,
  designer = null,
  previewText,
  className = "",
  textSize = "text-xl",
  cardStyle = "default"
}) {
  // Generate Google Fonts URLs
  const fontSpecimenUrl = `https://fonts.google.com/specimen/${fontFamily?.replace(/\s+/g, '+')}`;
  const designerSearchUrl = `https://fonts.google.com/?query=${encodeURIComponent(designer)}`;

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
        {designer && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            by{' '}
            <a
              href={designerSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
            >
              {designer}
            </a>
          </p>
        )}
      </div>
      
      {/* Subtle separator line */}
      <div className="mx-4 mb-4 h-px bg-gray-200 dark:bg-gray-600"></div>
      
      {/* Preview Text */}
      <div
        className={`${textSize} text-gray-900 dark:text-white leading-relaxed`}
        style={{ fontFamily: `"${fontFamily}", sans-serif` }}
      >
        {previewText}
      </div>
    </div>
  );
}