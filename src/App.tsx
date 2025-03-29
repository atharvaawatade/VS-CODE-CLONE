import { useEffect, useState } from 'react';
import FileExplorer from './components/FileExplorer';
import StatusBar from './components/StatusBar';
import ChatInterface from './components/ChatInterface';
import Terminal from './components/Terminal';
import Preview from './components/Preview';
import Toolbar from './components/Toolbar';
import Search from './components/Search';
import Editor from './components/Editor';
import LoadingScreen from './components/LoadingScreen';
import { useUIStore } from './store/uiStore';
import { Menu, X } from 'lucide-react';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    isFileExplorerOpen, 
    isChatOpen, 
    isTerminalOpen, 
    isPreviewOpen,
    isMobileView,
    currentRoute,
    setMobileView,
    toggleFileExplorer,
    setWorkspaceName
  } = useUIStore();
  
  // Set workspace name to VS Code on app start
  useEffect(() => {
    setWorkspaceName('VS Code');
  }, [setWorkspaceName]);
  
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setMobileView(isMobile);
      
      // Auto-close panels on mobile if they're all open
      if (isMobile && isFileExplorerOpen && isChatOpen) {
        toggleFileExplorer();
      }
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, [setMobileView, isFileExplorerOpen, isChatOpen, toggleFileExplorer]);

  // Mobile menu button
  const MobileMenuButton = () => (
    <button
      onClick={toggleFileExplorer}
      className="md:hidden absolute left-2 top-3 z-10 bg-[#252526] p-2 rounded hover:bg-[#3C3C3C] text-gray-400 hover:text-white transition-colors duration-150"
    >
      {isFileExplorerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
    </button>
  );

  // Determine which content to show based on the current route
  const renderMainContent = () => {
    switch (currentRoute) {
      case 'search':
        return <Search />;
      case 'settings':
      case 'extensions':
        // These would be implemented as separate components
        return (
          <div className="h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-xl mb-4">{currentRoute.charAt(0).toUpperCase() + currentRoute.slice(1)}</p>
              <p className="text-sm">This feature is coming soon</p>
            </div>
          </div>
        );
      case 'editor':
      default:
        return (
          <>
            {/* Editor */}
            {!isPreviewOpen && (
              <Editor />
            )}
            
            {/* Preview */}
            {isPreviewOpen && <Preview />}
          </>
        );
    }
  };

  // Render loading screen
  if (isLoading) {
    return <LoadingScreen onFinished={() => setIsLoading(false)} />;
  }

  return (
    <div className="h-screen flex flex-col bg-[#1E1E1E] animate-fadeInScale">
      <Toolbar />
      
      <div className="flex-1 flex relative overflow-hidden">
        <MobileMenuButton />
        
        {/* File Explorer - hidden by default on mobile unless toggled */}
        {isFileExplorerOpen && (
          <div className={`${isMobileView ? 'absolute inset-y-0 left-0 z-10 w-64' : 'w-64'} border-r border-gray-700 animate-slideDown`}>
            <FileExplorer />
          </div>
        )}

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 relative">
            {renderMainContent()}
          </div>
          
          {/* Terminal */}
          {isTerminalOpen && (
            <div className={`${isMobileView ? 'h-1/3' : 'h-64'} animate-slideUp`}>
              <Terminal />
            </div>
          )}
        </div>

        {/* Chat Interface */}
        <ChatInterface />
      </div>
      
      <StatusBar />
    </div>
  );
}

export default App;