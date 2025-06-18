
import { useState } from "react";

interface BoxWidgetProps {
  widgetCode?: string | null;
  slabName?: string;
}

const BoxWidget = ({ widgetCode, slabName }: BoxWidgetProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  if (!widgetCode) {
    return (
      <div className="w-full h-48 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
        No Box widget available
      </div>
    );
  }

  // Check if it's a full iframe HTML code
  if (widgetCode.includes('<iframe') && widgetCode.includes('</iframe>')) {
    return (
      <div className="w-full h-48 bg-slate-100 rounded-lg overflow-hidden relative">
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500">
            Loading Box content...
          </div>
        )}
        <div
          dangerouslySetInnerHTML={{ __html: widgetCode }}
          className={`w-full h-full transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
        />
      </div>
    );
  }

  // Extract the embed URL from Box widget code if it's an iframe src
  const extractBoxUrl = (code: string) => {
    const iframeMatch = code.match(/src="([^"]+)"/);
    return iframeMatch ? iframeMatch[1] : code;
  };

  const embedUrl = extractBoxUrl(widgetCode);

  return (
    <div className="w-full h-48 bg-slate-100 rounded-lg overflow-hidden relative">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-500">
          Loading Box content...
        </div>
      )}
      <iframe
        src={embedUrl}
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
        title={`Box content for ${slabName}`}
        onLoad={() => setIsLoaded(true)}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
};

export default BoxWidget;
