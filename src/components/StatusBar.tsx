import React from 'react';
import { GitBranch, Bell, CheckCircle, AlertTriangle, Code, Server } from 'lucide-react';
import { useEditorStore } from '../store/editorStore';
import { useUIStore } from '../store/uiStore';

const StatusBar: React.FC = () => {
  const { tabs, activeTab } = useEditorStore();
  const { isMobileView, workspaceName } = useUIStore();
  const currentTab = tabs.find(tab => tab.id === activeTab);
  const displayLanguage = currentTab?.language
    ? currentTab.language.charAt(0).toUpperCase() + currentTab.language.slice(1)
    : 'Plain Text';

  return (
    <div className="h-6 bg-[#007ACC] text-white flex items-center justify-between px-2 text-xs shadow-md">
      <div className="flex items-center space-x-3 overflow-x-auto hide-scrollbar">
        <div className="flex items-center bg-[#0066B0] px-2 py-0.5 rounded-sm">
          <GitBranch className="w-3 h-3 mr-1" />
          <span>main</span>
        </div>
        <div className="hidden md:flex items-center">
          <CheckCircle className="w-3 h-3 mr-1 text-green-300" />
          <span>0 errors</span>
        </div>
        <div className="hidden md:flex items-center">
          <AlertTriangle className="w-3 h-3 mr-1 text-yellow-300" />
          <span>0 warnings</span>
        </div>
        {!isMobileView && (
          <div className="flex items-center">
            <Code className="w-3 h-3 mr-1" />
            <span>{workspaceName}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-3">
        <span className="flex items-center px-2 py-0.5 bg-[#0066B0] rounded-sm">
          {displayLanguage}
        </span>
        {!isMobileView && (
          <>
            <span>Ln 1, Col 1</span>
            <div className="flex items-center">
              <Server className="w-3 h-3 mr-1" />
              <span>Vercel</span>
            </div>
          </>
        )}
        <div className="flex items-center">
          <Bell className="w-3 h-3" />
        </div>
      </div>
      
      <style>
        {`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        `}
      </style>
    </div>
  );
};

export default StatusBar;