import React, { useState } from 'react';
import { 
  FolderOpen, 
  Terminal as TerminalIcon, 
  Search as SearchIcon, 
  Settings, 
  Sidebar, 
  Layers,
  Monitor,
  Home,
  X
} from 'lucide-react';
import { useUIStore, AppRoute } from '../store/uiStore';
import { useEditorStore } from '../store/editorStore';

const Toolbar: React.FC = () => {
  const { 
    toggleFileExplorer, 
    toggleTerminal, 
    togglePreview, 
    isTerminalOpen, 
    isFileExplorerOpen,
    isPreviewOpen,
    currentRoute,
    navigateTo,
    searchQuery,
    setSearchQuery,
    workspaceName,
    setWorkspaceName
  } = useUIStore();
  
  const { activeTab, tabs } = useEditorStore();
  const currentTab = tabs.find(tab => tab.id === activeTab);
  const isHtmlFile = currentTab?.filename.endsWith('.html');
  
  const [showQuickSearch, setShowQuickSearch] = useState(false);
  
  // Set VS Code as the workspace name
  React.useEffect(() => {
    setWorkspaceName('VS Code');
  }, [setWorkspaceName]);

  const handleRouteClick = (route: AppRoute) => {
    // If already on this route, go back to editor
    if (currentRoute === route && route !== 'editor') {
      navigateTo('editor');
    } else {
      navigateTo(route);
    }
  };
  
  const handleSearchClick = () => {
    // Toggle quick search if on editor route, otherwise navigate to search route
    if (currentRoute === 'editor') {
      setShowQuickSearch(!showQuickSearch);
    } else if (currentRoute === 'search') {
      navigateTo('editor');
    } else {
      navigateTo('search');
    }
  };
  
  const handleQuickSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      navigateTo('search');
      setTimeout(() => {
        // This will trigger the search in the Search component
        const searchEvent = new CustomEvent('quicksearch:perform');
        window.dispatchEvent(searchEvent);
      }, 100);
    } else if (e.key === 'Escape') {
      setShowQuickSearch(false);
    }
  };

  return (
    <div className="bg-[#252526] border-b border-gray-700 p-1 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        {/* VS Code Logo */}
        <div className="flex items-center mr-2">
          <div className="w-6 h-6 flex items-center justify-center mr-1">
            <svg width="16" height="16" viewBox="0 0 276 276" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
              <path d="M246.32 27.6062L194.51 5.83683C186.604 2.59692 177.6 3.12235 170.289 7.2586L33.2151 91.181C26.0834 95.2397 22.0066 103.218 22.963 111.503C23.9193 119.788 29.6569 126.815 37.6885 129.495L54.2291 136.287L37.6885 143.078C29.6569 145.759 23.9193 152.786 22.963 161.07C22.0066 169.355 26.0834 177.333 33.2151 181.392L170.289 265.314C173.861 267.564 177.868 268.65 181.829 268.65C186.086 268.65 190.29 267.43 194.076 265.052L246.32 242.967C254.424 239.57 259.631 231.713 259.631 223.192V47.3806C259.631 38.8598 254.424 31.0021 246.32 27.6062Z" fill="#0065A9"/>
              <path d="M238.815 33.7562L186.932 11.9417C179.018 8.69847 169.987 9.22467 162.667 13.3672L25.5046 97.4322C18.3585 101.497 14.2731 109.49 15.2321 117.79C16.1912 126.089 21.941 133.127 29.9867 135.812L46.5545 142.614L29.9867 149.415C21.941 152.1 16.1912 159.138 15.2321 167.438C14.2731 175.738 18.3585 183.731 25.5046 187.796L162.667 271.861C166.247 274.115 170.262 275.204 174.23 275.204C178.494 275.204 182.705 273.981 186.498 271.599L238.815 249.471C246.933 246.067 252.149 238.195 252.149 229.656V53.5717C252.149 45.0328 246.933 37.1608 238.815 33.7562Z" fill="#007ACC"/>
              <path d="M194.017 27.6938L43.3544 141.713L43.3544 141.713L194.017 255.733C198.496 258.88 204.493 257.616 207.64 253.137C208.607 251.752 209.114 250.135 209.114 248.494L209.114 34.9334C209.114 30.8143 205.771 27.4709 201.652 27.4709C199.016 27.4709 196.52 28.9178 194.997 31.2139" fill="#1F9CF0"/>
              <path d="M127.89 141.713L43.3544 63.7177L43.3544 219.709L127.89 141.713Z" fill="url(#paint0_linear_1015_179)"/>
              <defs>
                <linearGradient id="paint0_linear_1015_179" x1="85.6222" y1="63.7177" x2="85.6222" y2="219.709" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="white"/>
                  <stop offset="1" stopColor="white" stopOpacity="0"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="text-white text-sm font-medium hidden md:block">VS Code</span>
        </div>
        
        <button 
          onClick={() => handleRouteClick('editor')}
          className={`p-2 rounded hover:bg-[#3C3C3C] transition-colors duration-150 ${currentRoute === 'editor' ? 'text-white bg-[#3C3C3C]' : 'text-gray-400'}`}
          title="Editor"
        >
          <Home className="w-5 h-5" />
        </button>
        <button 
          onClick={toggleFileExplorer}
          className={`p-2 rounded hover:bg-[#3C3C3C] transition-colors duration-150 ${isFileExplorerOpen ? 'text-white' : 'text-gray-400'}`}
          title="Explorer"
        >
          <Sidebar className="w-5 h-5" />
        </button>
        
        {/* Enhanced Search Button */}
        <div className="relative">
          <button 
            onClick={handleSearchClick}
            className={`p-2 rounded hover:bg-[#3C3C3C] transition-colors duration-150 
              ${currentRoute === 'search' || showQuickSearch ? 'text-white bg-[#3C3C3C]' : 'text-gray-400'}`}
            title="Search"
          >
            <SearchIcon className="w-5 h-5" />
          </button>
          
          {/* Quick Search Input */}
          {showQuickSearch && (
            <div className="absolute left-full ml-2 bg-[#3C3C3C] rounded shadow-lg border border-gray-700 animate-fadeIn z-10">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleQuickSearch}
                  placeholder="Search in files..."
                  className="bg-[#1E1E1E] text-white text-sm p-2 pl-8 pr-8 w-64 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
                <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-150"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="p-1 text-xs text-gray-400 border-t border-gray-700">
                Press Enter to search or Esc to close
              </div>
            </div>
          )}
        </div>
        
        <button 
          onClick={() => handleRouteClick('extensions')}
          className={`p-2 rounded hover:bg-[#3C3C3C] transition-colors duration-150 ${currentRoute === 'extensions' ? 'text-white bg-[#3C3C3C]' : 'text-gray-400'}`}
          title="Extensions"
        >
          <Layers className="w-5 h-5" />
        </button>
        
        <div className="h-6 border-r border-gray-600 mx-1"></div>
        
        {/* HTML Preview button - always visible but disabled if not HTML */}
        <button 
          onClick={isHtmlFile ? togglePreview : undefined}
          className={`p-2 rounded transition-colors duration-150
            ${isHtmlFile 
              ? `hover:bg-[#3C3C3C] ${isPreviewOpen ? 'text-white bg-[#3C3C3C]' : 'text-gray-400'}` 
              : 'text-gray-600 cursor-not-allowed'}`}
          title={isHtmlFile ? "Preview HTML" : "Preview (only for HTML files)"}
          disabled={!isHtmlFile}
        >
          <Monitor className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex items-center space-x-2">
        <span className="text-gray-400 text-xs hidden md:block">
          {currentTab ? currentTab.filename : workspaceName}
        </span>
        <button 
          onClick={toggleTerminal}
          className={`p-2 rounded hover:bg-[#3C3C3C] transition-colors duration-150 ${isTerminalOpen ? 'text-white' : 'text-gray-400'}`}
          title="Terminal"
        >
          <TerminalIcon className="w-5 h-5" />
        </button>
        <button 
          className="p-2 rounded hover:bg-[#3C3C3C] text-gray-400 hover:text-white transition-colors duration-150"
          title="Open Folder"
        >
          <FolderOpen className="w-5 h-5" />
        </button>
        <button 
          onClick={() => handleRouteClick('settings')}
          className={`p-2 rounded hover:bg-[#3C3C3C] transition-colors duration-150 ${currentRoute === 'settings' ? 'text-white bg-[#3C3C3C]' : 'text-gray-400'}`}
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Toolbar; 