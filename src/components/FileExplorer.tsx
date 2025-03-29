import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FileCode, 
  FileJson, 
  FileText, 
  MoreVertical, 
  Search,
  FolderPlus,
  FilePlus,
  RefreshCw,
  Upload,
  Trash2,
  Copy,
  Clipboard,
  Edit,
  ArrowDownToLine,
  FileType,
  ChevronUp
} from 'lucide-react';
import { useEditorStore, getLanguageFromFilename, getMockContent } from '../store/editorStore';
import { useUIStore } from '../store/uiStore';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

interface ContextMenuState {
  show: boolean;
  x: number;
  y: number;
  node?: FileNode;
  nodePath?: string;
}

const initialFiles: FileNode = {
  name: 'project',
  type: 'folder',
  children: [
    {
      name: 'src',
      type: 'folder',
      children: [
        { name: 'main.js', type: 'file' },
        { name: 'styles.css', type: 'file' },
        { name: 'index.html', type: 'file' },
        { 
          name: 'components', 
          type: 'folder',
          children: [
            { name: 'App.tsx', type: 'file' },
            { name: 'Button.tsx', type: 'file' },
            { name: 'Header.tsx', type: 'file' }
          ]
        },
        { 
          name: 'utils', 
          type: 'folder',
          children: [
            { name: 'helpers.ts', type: 'file' },
            { name: 'constants.ts', type: 'file' }
          ]
        }
      ]
    },
    {
      name: 'public',
      type: 'folder',
      children: [
        { name: 'index.html', type: 'file' },
        { name: 'favicon.ico', type: 'file' },
        { name: 'robots.txt', type: 'file' }
      ]
    },
    {
      name: 'data',
      type: 'folder',
      children: [
        { name: 'config.json', type: 'file' },
        { name: 'users.json', type: 'file' },
        { name: 'schema.json', type: 'file' }
      ]
    },
    { name: 'package.json', type: 'file' },
    { name: 'README.md', type: 'file' },
    { name: 'tsconfig.json', type: 'file' }
  ]
};

interface FolderProps {
  node: FileNode;
  level: number;
  searchTerm: string;
  path: string;
  onContextMenu: (e: React.MouseEvent, node: FileNode, path: string) => void;
  draggedNode: { node: FileNode | null, path: string | null };
  setDraggedNode: (data: { node: FileNode | null, path: string | null }) => void;
}

const FileTreeNode: React.FC<FolderProps> = ({ 
  node, 
  level, 
  searchTerm, 
  path,
  onContextMenu,
  draggedNode,
  setDraggedNode
}) => {
  const [isOpen, setIsOpen] = useState(searchTerm ? true : level < 3);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const { tabs, addTab, setActiveTab } = useEditorStore();
  const { isMobileView, toggleFileExplorer } = useUIStore();
  const nodePath = path + '/' + node.name;
  const isSelected = tabs.some(tab => tab.filename === nodePath && tab.id === tabs.find(t => t.id === tabs.find(t => t.filename === nodePath)?.id)?.id);

  const handleFileClick = (filename: string) => {
    const fullPath = path + '/' + filename;
    const existingTab = tabs.find(tab => tab.filename === fullPath);
    if (existingTab) {
      setActiveTab(existingTab.id);
    } else {
      addTab({
        id: `${Date.now()}`,
        filename: fullPath,
        content: getMockContent(filename),
        language: getLanguageFromFilename(filename)
      });
    }
    
    // On mobile, auto-close the file explorer after selection
    if (isMobileView) {
      toggleFileExplorer();
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    // Map file extensions to icons and colors
    if (ext === 'js') return <FileCode className="w-4 h-4 text-yellow-400" />;
    if (ext === 'jsx') return <FileCode className="w-4 h-4 text-yellow-500" />;
    if (ext === 'ts') return <FileCode className="w-4 h-4 text-blue-400" />;
    if (ext === 'tsx') return <FileCode className="w-4 h-4 text-blue-500" />;
    if (ext === 'css') return <FileCode className="w-4 h-4 text-pink-400" />;
    if (ext === 'scss' || ext === 'sass') return <FileCode className="w-4 h-4 text-pink-500" />;
    if (ext === 'html') return <FileCode className="w-4 h-4 text-orange-400" />;
    if (ext === 'json') return <FileJson className="w-4 h-4 text-yellow-200" />;
    if (ext === 'md') return <FileText className="w-4 h-4 text-blue-200" />;
    if (ext === 'svg') return <FileType className="w-4 h-4 text-green-300" />;
    if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'gif') 
      return <FileType className="w-4 h-4 text-purple-400" />;
    return <FileText className="w-4 h-4 text-gray-400" />;
  };

  // Check if this node or its children match the search term
  const doesMatchSearch = () => {
    if (!searchTerm) return true;
    
    const nodeMatches = node.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (nodeMatches) return true;
    
    if (node.type === 'folder' && node.children) {
      return node.children.some(child => {
        if (child.type === 'file') {
          return child.name.toLowerCase().includes(searchTerm.toLowerCase());
        } else if (child.children) {
          // Recursive check for nested folders
          return child.children.some(grandchild => 
            grandchild.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        return false;
      });
    }
    
    return false;
  };

  // If there's a search term and this node doesn't match, don't render
  if (searchTerm && !doesMatchSearch()) {
    return null;
  }

  // Handle drag and drop events
  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    setDraggedNode({ node, path: nodePath });
    e.dataTransfer.setData('text/plain', nodePath);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (node.type === 'folder' && draggedNode.node && draggedNode.path !== nodePath) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (node.type === 'folder' && draggedNode.node) {
      console.log(`Moving ${draggedNode.path} to ${nodePath}`);
      // In a real app, this would update the file system
      // For this demo, we'll just log the action
    }
    
    setDraggedNode({ node: null, path: null });
  };

  return (
    <div className={`${searchTerm ? 'animate-fadeIn' : ''}`}>
      <div
        className={`flex items-center px-2 py-1 hover:bg-[#2A2D2E] cursor-pointer relative transition-colors duration-150
          ${isSelected ? 'bg-[#37373D]' : isDragOver ? 'bg-[#3C3C3C] border border-dashed border-[#007ACC]' : ''}
          ${node.type === 'folder' ? 'text-[#CCCCCC]' : 'text-[#9CDCFE]'}`}
        style={{ paddingLeft: `${level * 12}px` }}
        onClick={() => {
          if (node.type === 'folder') {
            setIsOpen(!isOpen);
          } else {
            handleFileClick(node.name);
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onContextMenu(e, node, nodePath);
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {node.type === 'folder' ? (
          <>
            <div className="w-4 h-4 flex items-center justify-center transition-transform duration-150">
              {isOpen ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <Folder className={`w-4 h-4 ${isOpen ? 'text-[#E8AB53]' : 'text-[#C09553]'} ml-1`} />
          </>
        ) : (
          <span className="ml-5">{getFileIcon(node.name)}</span>
        )}
        <span className="ml-2 text-sm truncate">{node.name}</span>
        
        {/* Quick action buttons on hover */}
        {isHovered && node.type === 'file' && (
          <div className="absolute right-2 flex space-x-1 bg-[#2A2D2E] p-0.5 rounded shadow-sm z-10 animate-fadeIn">
            <button
              className="text-gray-400 hover:text-white p-0.5 rounded transition-colors duration-150"
              title="Copy"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(node.name);
              }}
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
      {node.type === 'folder' && isOpen && node.children?.map((child, index) => (
        <div key={`${nodePath}-${index}`} className="transition-all duration-200 overflow-hidden animate-slideDown">
          <FileTreeNode
            node={child}
            level={level + 1}
            searchTerm={searchTerm}
            path={nodePath}
            onContextMenu={onContextMenu}
            draggedNode={draggedNode}
            setDraggedNode={setDraggedNode}
          />
        </div>
      ))}
    </div>
  );
};

const FileExplorer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    show: false,
    x: 0,
    y: 0
  });
  const [showOptions, setShowOptions] = useState(false);
  const [draggedNode, setDraggedNode] = useState<{ node: FileNode | null, path: string | null }>({
    node: null,
    path: null
  });
  const fileExplorerRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  
  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenu.show && fileExplorerRef.current && !fileExplorerRef.current.contains(event.target as Node)) {
        setContextMenu({ ...contextMenu, show: false });
      }
      
      if (showOptions && optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenu, showOptions]);

  const handleContextMenu = (e: React.MouseEvent, node: FileNode, path: string) => {
    e.preventDefault();
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      node,
      nodePath: path
    });
  };

  const handleCreateNewFile = () => {
    const newFileName = prompt('Enter name for new file:');
    if (!newFileName) return;
    console.log('Creating new file:', newFileName);
  };
  
  const handleCreateNewFolder = () => {
    const newFolderName = prompt('Enter name for new folder:');
    if (!newFolderName) return;
    console.log('Creating new folder:', newFolderName);
  };
  
  const handleContextMenuAction = (action: string) => {
    if (!contextMenu.node) return;

    let newName: string | null = null;
    
    switch (action) {
      case 'newFile':
        newName = prompt('Enter new file name:', '');
        if (newName) {
          console.log('Create new file:', newName);
        }
        break;
      case 'newFolder':
        newName = prompt('Enter new folder name:', '');
        if (newName) {
          console.log('Create new folder:', newName);
        }
        break;
      case 'rename':
        newName = prompt('Enter new name:', contextMenu.node.name);
        if (newName) {
          console.log('Rename', contextMenu.nodePath, 'to', newName);
        }
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this item?')) {
          console.log('Delete', contextMenu.nodePath);
        }
        break;
      case 'copyPath':
        navigator.clipboard.writeText(contextMenu.nodePath || '');
        break;
    }

    setContextMenu({ show: false, x: 0, y: 0 });
  };

  return (
    <div className="h-full bg-[#252526] text-white flex flex-col" ref={fileExplorerRef}>
      <div className="p-2 text-sm font-medium text-[#BBBBBB] border-b border-[#3C3C3C] flex justify-between items-center bg-gradient-to-r from-[#252526] to-[#2D2D30]">
        <span className="uppercase tracking-wide text-xs font-semibold">Explorer</span>
        <div className="flex space-x-1 relative">
          <button 
            className="p-1 rounded hover:bg-[#3C3C3C] text-gray-400 hover:text-white transition-colors duration-150"
            onClick={handleCreateNewFile}
            title="New File"
          >
            <FilePlus className="w-4 h-4" />
          </button>
          <button 
            className="p-1 rounded hover:bg-[#3C3C3C] text-gray-400 hover:text-white transition-colors duration-150"
            onClick={handleCreateNewFolder}
            title="New Folder"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
          <button 
            className="p-1 rounded hover:bg-[#3C3C3C] text-gray-400 hover:text-white transition-colors duration-150"
            onClick={() => setShowOptions(!showOptions)}
            title="More Actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {showOptions && (
            <div 
              className="absolute right-0 top-8 bg-[#252526] border border-gray-700 rounded shadow-lg z-10 w-48"
              ref={optionsRef}
            >
              <button 
                className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#3C3C3C] transition-colors duration-150 flex items-center"
                onClick={() => {
                  setShowOptions(false);
                  console.log('Refreshing explorer');
                }}
              >
                <RefreshCw className="w-3 h-3 mr-2" />
                Refresh Explorer
              </button>
              <button 
                className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#3C3C3C] transition-colors duration-150 flex items-center"
                onClick={() => {
                  setShowOptions(false);
                  console.log('Collapsing folders');
                }}
              >
                <ChevronUp className="w-3 h-3 mr-2" />
                Collapse Folders
              </button>
              <hr className="border-gray-700 my-1" />
              <button 
                className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#3C3C3C] transition-colors duration-150 flex items-center"
                onClick={() => {
                  setShowOptions(false);
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.multiple = true;
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files) {
                      console.log('Uploading files:', files);
                    }
                  };
                  input.click();
                }}
              >
                <Upload className="w-3 h-3 mr-2" />
                Upload Files
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="px-2 py-1 border-b border-[#3C3C3C]">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search files"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#3C3C3C] py-1.5 pl-8 pr-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-150"
          />
        </div>
      </div>
      
      <div className="overflow-y-auto flex-1 py-1">
        <FileTreeNode 
          node={initialFiles} 
          level={1} 
          searchTerm={searchTerm}
          path=""
          onContextMenu={handleContextMenu}
          draggedNode={draggedNode}
          setDraggedNode={setDraggedNode}
        />
      </div>
      
      {/* Context Menu */}
      {contextMenu.show && (
        <div 
          className="fixed bg-[#252526] border border-gray-700 rounded shadow-lg z-50 py-1 w-48"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {contextMenu.node?.type === 'folder' && (
            <>
              <button 
                className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#3C3C3C] transition-colors duration-150 flex items-center"
                onClick={() => handleContextMenuAction('newFile')}
              >
                <FilePlus className="w-3 h-3 mr-2" />
                New File
              </button>
              <button 
                className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#3C3C3C] transition-colors duration-150 flex items-center"
                onClick={() => handleContextMenuAction('newFolder')}
              >
                <FolderPlus className="w-3 h-3 mr-2" />
                New Folder
              </button>
              <hr className="border-gray-700 my-1" />
            </>
          )}
          
          <button 
            className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#3C3C3C] transition-colors duration-150 flex items-center"
            onClick={() => handleContextMenuAction('rename')}
          >
            <Edit className="w-3 h-3 mr-2" />
            Rename
          </button>
          <button 
            className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#3C3C3C] transition-colors duration-150 flex items-center"
            onClick={() => handleContextMenuAction('delete')}
          >
            <Trash2 className="w-3 h-3 mr-2" />
            Delete
          </button>
          <button 
            className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#3C3C3C] transition-colors duration-150 flex items-center"
            onClick={() => handleContextMenuAction('copyPath')}
          >
            <Clipboard className="w-3 h-3 mr-2" />
            Copy Path
          </button>
          
          {contextMenu.node?.type === 'file' && (
            <button 
              className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#3C3C3C] transition-colors duration-150 flex items-center"
              onClick={() => handleContextMenuAction('download')}
            >
              <ArrowDownToLine className="w-3 h-3 mr-2" />
              Download
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FileExplorer;