import React from 'react';
import { X } from 'lucide-react';
import { useEditorStore } from '../store/editorStore';

const Tabs: React.FC = () => {
  const { tabs, activeTab, closeTab, setActiveTab } = useEditorStore();

  return (
    <div className="flex bg-[#252526] border-b border-[#3C3C3C] overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`flex items-center px-3 py-2 text-sm cursor-pointer border-r border-[#3C3C3C] min-w-[120px] max-w-[200px] group ${
            activeTab === tab.id
              ? 'bg-[#1E1E1E] text-white border-t-2 border-t-blue-500'
              : 'bg-[#2D2D2D] text-[#969696] hover:bg-[#2D2D2D]'
          }`}
          onClick={() => setActiveTab(tab.id)}
        >
          <span className="truncate flex-1">{tab.filename}</span>
          <button
            className="ml-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-[#3C3C3C] rounded"
            onClick={(e) => {
              e.stopPropagation();
              closeTab(tab.id);
            }}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Tabs;