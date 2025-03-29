import React, { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import { Smartphone, Monitor, Tablet, Maximize2, Minimize2, RefreshCw, ExternalLink } from 'lucide-react';

const Preview: React.FC = () => {
  const { tabs, activeTab } = useEditorStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [viewportWidth, setViewportWidth] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Get current tab content
  const currentTab = tabs.find(tab => tab.id === activeTab);

  // Find HTML, CSS and JS files for the project
  const projectFiles = tabs.reduce((files, tab) => {
    const ext = tab.filename.split('.').pop()?.toLowerCase();
    if (ext === 'html') files.html.push(tab);
    if (ext === 'css') files.css.push(tab);
    if (ext === 'js') files.js.push(tab);
    return files;
  }, { html: [], css: [], js: [] } as { html: typeof tabs, css: typeof tabs, js: typeof tabs });

  // Get active or first HTML file
  const htmlFile = currentTab && currentTab.filename.endsWith('.html') 
    ? currentTab 
    : projectFiles.html[0];

  // Set viewport width based on device selection
  const handleDeviceSelect = (width: number | null) => {
    setViewportWidth(width);
  };

  // Toggle fullscreen view
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Force reload the preview
  const reloadPreview = () => {
    setReloadTrigger(prev => prev + 1);
  };

  // Open in new tab
  const openInNewTab = () => {
    if (htmlFile) {
      const blob = new Blob([generatePreviewHTML()], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  };

  // Generate complete HTML with embedded CSS and JS
  const generatePreviewHTML = () => {
    if (!htmlFile) return '';
    
    const htmlContent = htmlFile.content;
    
    // Extract content between <head> tags to insert CSS
    const headMatch = htmlContent.match(/<head>([\s\S]*?)<\/head>/i);
    const headContent = headMatch ? headMatch[1] : '';
    
    // Extract content between <body> tags to append JS at the end
    const bodyMatch = htmlContent.match(/<body>([\s\S]*?)<\/body>/i);
    const bodyContent = bodyMatch ? bodyMatch[1] : '';
    
    // Inject all CSS files into head
    let cssStyles = '';
    projectFiles.css.forEach(cssFile => {
      cssStyles += `<style data-from="${cssFile.filename}">\n${cssFile.content}\n</style>\n`;
    });
    
    // Inject all JS files at the end of body
    let jsScripts = '';
    projectFiles.js.forEach(jsFile => {
      jsScripts += `<script data-from="${jsFile.filename}">\n${jsFile.content}\n</script>\n`;
    });
    
    // Add some custom preview styles
    const previewStyles = `
      <style data-preview="true">
        /* Preview styles for better visibility */
        body {
          animation: fadeIn 0.3s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      </style>
    `;
    
    // Check if HTML has head and body tags
    if (headMatch && bodyMatch) {
      // Replace head and body content
      return htmlContent
        .replace(/<head>([\s\S]*?)<\/head>/i, `<head>${headContent}${previewStyles}${cssStyles}</head>`)
        .replace(/<body>([\s\S]*?)<\/body>/i, `<body>${bodyContent}${jsScripts}</body>`);
    } else {
      // Simple HTML file - wrap everything
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Preview</title>
          ${previewStyles}
          ${cssStyles}
        </head>
        <body>
          ${htmlContent}
          ${jsScripts}
        </body>
        </html>
      `;
    }
  };

  // Update preview when files change or reload is triggered
  useEffect(() => {
    if (iframeRef.current && htmlFile) {
      try {
        const iframe = iframeRef.current;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        
        if (iframeDoc) {
          iframeDoc.open();
          iframeDoc.write(generatePreviewHTML());
          iframeDoc.close();
          
          // Add error handling for console logs
          if (iframe.contentWindow) {
            const win = iframe.contentWindow as Window & typeof globalThis;
            
            const originalConsoleError = win.console.error;
            const originalConsoleLog = win.console.log;
            const originalConsoleWarn = win.console.warn;
            
            win.console.error = function(...args: unknown[]) {
              if (originalConsoleError) originalConsoleError.apply(this, args);
              console.error('[Preview]', ...args);
            };
            
            win.console.log = function(...args: unknown[]) {
              if (originalConsoleLog) originalConsoleLog.apply(this, args);
              console.log('[Preview]', ...args);
            };
            
            win.console.warn = function(...args: unknown[]) {
              if (originalConsoleWarn) originalConsoleWarn.apply(this, args);
              console.warn('[Preview]', ...args);
            };
            
            // Handle runtime errors
            win.onerror = function(message, source, lineno, colno, error) {
              console.error('[Preview Error]', message, source, lineno, colno, error);
              return true;
            };
          }
        }
      } catch (err) {
        console.error('Failed to update preview:', err);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [htmlFile, projectFiles.css, projectFiles.js, reloadTrigger]);

  if (!htmlFile) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#1E1E1E] text-gray-400">
        <div className="text-center p-5 max-w-md">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-[#2D2D2D] flex items-center justify-center">
            <Monitor className="w-10 h-10 text-gray-500" />
          </div>
          <h2 className="text-lg font-semibold mb-2 text-gray-300">No HTML file to preview</h2>
          <p className="text-sm">
            Open an HTML file to preview or create a new one by clicking the + button in the file explorer.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-[#1E1E1E] ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="flex justify-between items-center p-2 bg-[#252526] border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => handleDeviceSelect(null)} 
            className={`p-1.5 rounded ${!viewportWidth ? 'bg-[#3C3C3C] text-white' : 'text-gray-400 hover:bg-[#3C3C3C] hover:text-white'} transition-colors`}
            title="Desktop view"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDeviceSelect(768)} 
            className={`p-1.5 rounded ${viewportWidth === 768 ? 'bg-[#3C3C3C] text-white' : 'text-gray-400 hover:bg-[#3C3C3C] hover:text-white'} transition-colors`}
            title="Tablet view (768px)"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDeviceSelect(375)} 
            className={`p-1.5 rounded ${viewportWidth === 375 ? 'bg-[#3C3C3C] text-white' : 'text-gray-400 hover:bg-[#3C3C3C] hover:text-white'} transition-colors`}
            title="Mobile view (375px)"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center">
          <div className="text-xs text-gray-400 mr-3">
            Preview: <span className="text-blue-400">{htmlFile.filename}</span>
            {projectFiles.css.length > 0 && <span className="ml-2 text-green-400">CSS: {projectFiles.css.length}</span>}
            {projectFiles.js.length > 0 && <span className="ml-2 text-yellow-400">JS: {projectFiles.js.length}</span>}
          </div>
          <button
            onClick={reloadPreview}
            className="p-1.5 mr-1 rounded text-gray-400 hover:bg-[#3C3C3C] hover:text-white transition-colors"
            title="Reload preview"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openInNewTab}
            className="p-1.5 mr-1 rounded text-gray-400 hover:bg-[#3C3C3C] hover:text-white transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded text-gray-400 hover:bg-[#3C3C3C] hover:text-white transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden bg-white relative">
        <div 
          className={`h-full overflow-auto ${viewportWidth ? 'flex justify-center bg-[#1E1E1E] p-4' : ''}`}
        >
          <div 
            className={`h-full ${viewportWidth ? `w-[${viewportWidth}px] border border-gray-700 rounded shadow-lg` : 'w-full'}`}
            style={{ width: viewportWidth ? `${viewportWidth}px` : '100%' }}
          >
            <iframe
              ref={iframeRef}
              title="Preview"
              className="w-full h-full bg-white"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
        
        {/* Device frame for mobile view */}
        {viewportWidth === 375 && (
          <div className="absolute pointer-events-none inset-0 flex items-center justify-center">
            <div className="absolute top-0 w-[430px] h-[60px] bg-black rounded-t-[40px]"></div>
            <div className="absolute bottom-0 w-[430px] h-[60px] bg-black rounded-b-[40px]"></div>
            <div className="absolute left-0 w-[30px] h-full bg-black"></div>
            <div className="absolute right-0 w-[30px] h-full bg-black"></div>
            <div className="absolute top-[25px] left-1/2 transform -translate-x-1/2 w-[120px] h-[30px] bg-black rounded-[20px] border-[3px] border-[#222]"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Preview; 