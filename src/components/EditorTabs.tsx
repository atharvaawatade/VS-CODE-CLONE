import React from 'react';
import { X, FileCode } from 'lucide-react';
import { useEditorStore } from '../store/editorStore';

const EditorTabs: React.FC = () => {
  const { tabs, activeTab, closeTab, setActiveTab } = useEditorStore();

  if (tabs.length === 0) {
    return (
      <div className="h-9 border-b border-gray-700 bg-[#252526] flex items-center px-4">
        <span className="text-gray-400 text-xs">No files open</span>
      </div>
    );
  }

  // Get file icon based on extension
  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    
    // Default color for file icons
    let iconColor = "text-gray-400";
    
    // Extension-specific colors
    if (ext === 'js' || ext === 'jsx') iconColor = "text-yellow-400";
    if (ext === 'ts' || ext === 'tsx') iconColor = "text-blue-400";
    if (ext === 'css') iconColor = "text-pink-400";
    if (ext === 'html') iconColor = "text-orange-400";
    if (ext === 'json') iconColor = "text-yellow-200";
    if (ext === 'md') iconColor = "text-gray-200";
    
    return <FileCode className={`w-4 h-4 mr-2 flex-shrink-0 ${iconColor}`} />;
  };

  return (
    <div className="border-b border-gray-800 bg-[#252526] overflow-x-auto">
      <div className="flex h-9">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const filename = tab.filename.split('/').pop();
          
          return (
            <div
              key={tab.id}
              className={`
                flex items-center px-3 min-w-fit max-w-xs group
                border-r border-gray-800 cursor-pointer
                ${isActive 
                  ? 'bg-[#1E1E1E] text-white border-t-2 border-t-[#007ACC]' 
                  : 'bg-[#2D2D2D] text-gray-400 hover:bg-[#313131]'}
                transition-colors duration-100
              `}
              onClick={() => setActiveTab(tab.id)}
            >
              {getFileIcon(tab.filename)}
              
              <span className="truncate text-xs">{filename}</span>
              
              <button
                className={`
                  ml-2 p-0.5 rounded-sm opacity-0 hover:opacity-100 focus:opacity-100
                  ${isActive ? 'group-hover:opacity-70' : 'group-hover:opacity-50'}
                  hover:bg-[#3C3C3C] focus:outline-none
                `}
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
      
      <style>
        {`
        .overflow-x-auto::-webkit-scrollbar {
          display: none;
        }
        .overflow-x-auto {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        `}
      </style>
    </div>
  );
};

export default EditorTabs; 