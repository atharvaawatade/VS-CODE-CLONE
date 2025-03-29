import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X, Filter, ArrowDown, ArrowUp, Save, Clock, FileCode, File, FolderOpen, Hash, MessageCircle, ChevronDown, ChevronRight, Layers, Code } from 'lucide-react';
import { useEditorStore } from '../store/editorStore';
import { useUIStore } from '../store/uiStore';

interface SearchResult {
  filename: string;
  line: number;
  column: number;
  content: string;
  matchLength: number;
  type: 'code' | 'comment' | 'string' | 'keyword';
}

interface SearchHistory {
  query: string;
  timestamp: number;
  filters?: SearchFilters;
}

interface SearchFilters {
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
  includeContent: boolean;
  fileTypes: string[];
  excludeComments: boolean;
}

const Search: React.FC = () => {
  const { currentRoute, searchQuery, setSearchQuery } = useUIStore();
  const { tabs, setActiveTab } = useEditorStore();
  
  // Search state
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [activeResultIndex, setActiveResultIndex] = useState(-1);
  const [showResultContext, setShowResultContext] = useState(false);
  
  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<{[key: string]: boolean}>({});
  const [selectedFileType, setSelectedFileType] = useState<string | null>(null);
  
  // Filters state
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [includeContent, setIncludeContent] = useState(true);
  const [fileTypes, setFileTypes] = useState<string[]>([]);
  const [excludeComments, setExcludeComments] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse search history:', e);
      }
    }
  }, []);
  
  // Save search history to localStorage
  useEffect(() => {
    if (searchHistory.length > 0) {
      localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }
  }, [searchHistory]);
  
  // Extract all file types from open tabs
  useEffect(() => {
    const types = tabs.reduce<string[]>((acc, tab) => {
      const ext = tab.filename.split('.').pop();
      if (ext && !acc.includes(ext)) {
        acc.push(ext);
      }
      return acc;
    }, []);
    setFileTypes(types);
  }, [tabs]);
  
  // Clear the results when route changes
  useEffect(() => {
    if (currentRoute !== 'search') {
      setResults([]);
    } else {
      // Auto focus on search input when search route is active
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [currentRoute]);
  
  // When a file type filter is clicked, toggle it
  const toggleFileTypeFilter = (type: string) => {
    setSelectedFileType(selectedFileType === type ? null : type);
  };
  
  // Toggle expanded state for a group
  const toggleGroupExpanded = (filename: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [filename]: !prev[filename]
    }));
  };
  
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setResults([]);
    setActiveResultIndex(-1);
    setExpandedGroups({});
    
    // Add to search history with current filters
    const newHistoryEntry = { 
      query: searchQuery, 
      timestamp: Date.now(),
      filters: {
        caseSensitive,
        wholeWord,
        useRegex,
        includeContent,
        fileTypes: selectedFileType ? [selectedFileType] : [],
        excludeComments
      }
    };
    
    setSearchHistory(prev => {
      // Remove duplicates
      const filtered = prev.filter(item => item.query !== searchQuery);
      // Limit to 10 items
      return [newHistoryEntry, ...filtered].slice(0, 10);
    });
    
    // Perform the search with a slight delay for UX
    setTimeout(() => {
      try {
        const searchResults: SearchResult[] = [];
        let matches = 0;
        
        // Prepare regex for the search
        let regex: RegExp;
        try {
          if (useRegex) {
            regex = new RegExp(searchQuery, caseSensitive ? 'g' : 'gi');
          } else if (wholeWord) {
            regex = new RegExp(`\\b${escapeRegExp(searchQuery)}\\b`, caseSensitive ? 'g' : 'gi');
          } else {
            regex = new RegExp(escapeRegExp(searchQuery), caseSensitive ? 'g' : 'gi');
          }
        } catch (error) {
          console.error('Invalid regex pattern:', error);
          // Fall back to simple string search
          regex = new RegExp(escapeRegExp(searchQuery), caseSensitive ? 'g' : 'gi');
        }
        
        tabs.forEach(tab => {
          // Apply file type filter if selected
          if (selectedFileType) {
            const fileExt = tab.filename.split('.').pop()?.toLowerCase();
            if (fileExt !== selectedFileType) {
              return;
            }
          }
          
          const lines = tab.content.split('\n');
          
          lines.forEach((line, lineIndex) => {
            // Skip empty lines
            if (!line.trim()) return;
            
            // Skip comments if exclude comments filter is on
            if (excludeComments && (
              line.trim().startsWith('//') || 
              line.trim().startsWith('/*') || 
              line.trim().startsWith('*') ||
              line.trim().startsWith('#')
            )) {
              return;
            }
            
            // Reset regex for each line
            regex.lastIndex = 0;
            
            let match: RegExpExecArray | null;
            while ((match = regex.exec(line)) !== null) {
              matches++;
              
              // Since we've already checked match is not null in the while condition,
              // we can safely use match without additional null checks
              const matchIndex = match.index;
              const matchLength = match[0].length;
              
              // Determine match type
              let type: 'code' | 'comment' | 'string' | 'keyword' = 'code';
              
              if (line.trim().startsWith('//') || line.includes('/*') || line.trim().startsWith('*') || line.trim().startsWith('#')) {
                type = 'comment';
              } else if ((line.includes('"') && line.indexOf('"') < matchIndex && line.indexOf('"', matchIndex) > matchIndex) || 
                         (line.includes("'") && line.indexOf("'") < matchIndex && line.indexOf("'", matchIndex) > matchIndex) || 
                         (line.includes('`') && line.indexOf('`') < matchIndex && line.indexOf('`', matchIndex) > matchIndex)) {
                type = 'string';
              } else if (['function', 'const', 'let', 'var', 'class', 'import', 'export', 'interface', 'type'].some(keyword => 
                new RegExp(`\\b${keyword}\\b`).test(line.substring(0, matchIndex + matchLength))
              )) {
                type = 'keyword';
              }
              
              searchResults.push({
                filename: tab.filename,
                line: lineIndex + 1,
                column: matchIndex + 1,
                content: includeContent ? line : '',
                matchLength: matchLength,
                type
              });
            }
          });
        });
        
        // Sort results by filename and then line number
        searchResults.sort((a, b) => {
          if (a.filename !== b.filename) {
            return a.filename.localeCompare(b.filename);
          }
          return a.line - b.line;
        });
        
        setResults(searchResults);
        setTotalMatches(matches);
        
        // Auto-expand the first result group if there are results
        if (searchResults.length > 0) {
          const firstFilename = searchResults[0].filename;
          setExpandedGroups({ [firstFilename]: true });
        }
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };
  
  const handleSelectResult = (result: SearchResult) => {
    // Find the tab
    const tab = tabs.find(tab => tab.filename === result.filename);
    if (!tab) return;
    
    // Activate the tab
    setActiveTab(tab.id);
    
    // Set current result as active
    const resultIndex = results.findIndex(
      r => r.filename === result.filename && r.line === result.line && r.column === result.column
    );
    
    if (resultIndex !== -1) {
      setActiveResultIndex(resultIndex);
    }
    
    // Navigate to editor route if not already there
    if (currentRoute !== 'editor') {
      // Import and use the navigateTo function from uiStore
      const { navigateTo } = useUIStore.getState();
      navigateTo('editor');
    }
    
    // Add a custom event to notify the editor to highlight the match
    // This would require a complementary listener in the App.tsx or editor component
    window.dispatchEvent(new CustomEvent('search:jumpToMatch', { 
      detail: {
        filename: result.filename,
        line: result.line,
        column: result.column,
        matchLength: result.matchLength
      }
    }));
  };
  
  // Group results by filename
  const groupedResults = results.reduce<{[key: string]: SearchResult[]}>((acc, result) => {
    if (!acc[result.filename]) {
      acc[result.filename] = [];
    }
    acc[result.filename].push(result);
    return acc;
  }, {});
  
  const navigateResults = (direction: 'next' | 'prev') => {
    if (results.length === 0) return;
    
    if (direction === 'next') {
      setActiveResultIndex(prev => 
        prev < results.length - 1 ? prev + 1 : 0
      );
    } else {
      setActiveResultIndex(prev => 
        prev > 0 ? prev - 1 : results.length - 1
      );
    }
    
    if (activeResultIndex >= 0 && activeResultIndex < results.length) {
      handleSelectResult(results[activeResultIndex]);
    }
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setActiveResultIndex(-1);
  };
  
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };
  
  const selectHistoryItem = (entry: SearchHistory) => {
    setSearchQuery(entry.query);
    
    // Restore filters if available
    if (entry.filters) {
      setCaseSensitive(entry.filters.caseSensitive);
      setWholeWord(entry.filters.wholeWord);
      setUseRegex(entry.filters.useRegex);
      setIncludeContent(entry.filters.includeContent);
      if (entry.filters.fileTypes.length > 0) {
        setSelectedFileType(entry.filters.fileTypes[0]);
      }
      setExcludeComments(entry.filters.excludeComments || false);
    }
    
    setShowHistory(false);
  };
  
  const saveSearchAsSnippet = () => {
    if (!searchQuery.trim()) return;
    
    // Save as a named search snippet for future use
    const name = prompt('Enter a name for this search:');
    if (!name) return;
    
    const snippets = JSON.parse(localStorage.getItem('searchSnippets') || '{}');
    snippets[name] = {
      query: searchQuery,
      caseSensitive,
      wholeWord,
      useRegex,
      includeContent,
      fileTypes: selectedFileType ? [selectedFileType] : [],
      excludeComments
    };
    
    localStorage.setItem('searchSnippets', JSON.stringify(snippets));
    alert(`Search saved as "${name}"`);
  };
  
  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'js':
        return <FileCode className="w-4 h-4 text-yellow-400" />;
      case 'ts':
      case 'tsx':
        return <FileCode className="w-4 h-4 text-blue-400" />;
      case 'css':
        return <FileCode className="w-4 h-4 text-purple-400" />;
      case 'html':
        return <FileCode className="w-4 h-4 text-orange-400" />;
      case 'json':
        return <Code className="w-4 h-4 text-yellow-200" />;
      default:
        return <File className="w-4 h-4 text-gray-400" />;
    }
  };
  
  const getMatchTypeIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <MessageCircle className="w-3 h-3 text-gray-400" />;
      case 'string':
        return <Hash className="w-3 h-3 text-green-400" />;
      case 'keyword':
        return <Layers className="w-3 h-3 text-purple-400" />;
      default:
        return <Code className="w-3 h-3 text-blue-400" />;
    }
  };
  
  // Add this event listener inside the component after existing useEffect blocks
  useEffect(() => {
    const handleQuickSearch = () => {
      if (searchQuery.trim()) {
        handleSearch();
      }
    };
    
    window.addEventListener('quicksearch:perform', handleQuickSearch);
    
    return () => {
      window.removeEventListener('quicksearch:perform', handleQuickSearch);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]); // Include searchQuery in dependencies
  
  if (currentRoute !== 'search') return null;
  
  return (
    <div className="h-full flex flex-col bg-[#252526] overflow-hidden">
      <div className="p-3 border-b border-gray-700 bg-[#1E1E1E]">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-white text-sm font-medium">Search</h2>
          <div className="flex items-center space-x-2">
            {selectedFileType && (
              <div className="px-2 py-1 text-xs bg-blue-600 text-white rounded-full flex items-center">
                {selectedFileType}
                <button 
                  onClick={() => setSelectedFileType(null)}
                  className="ml-1 hover:bg-blue-700 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <button 
              onClick={() => setShowResultContext(!showResultContext)}
              className={`p-1 rounded ${showResultContext ? 'bg-[#3C3C3C] text-white' : 'text-gray-400 hover:bg-[#3C3C3C] hover:text-white'} transition-colors duration-150`}
              title="Toggle context display"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="relative">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full bg-[#3C3C3C] text-white rounded-lg py-2 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150"
              placeholder="Search in open files..."
            />
            {searchQuery && (
              <button 
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-150"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="flex mt-2 items-center justify-between">
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-1 rounded hover:bg-[#3C3C3C] flex items-center space-x-1 transition-colors duration-150 ${showFilters ? 'text-white bg-[#3C3C3C]' : 'text-gray-400'}`}
              >
                <Filter className="w-3 h-3" />
                <span className="text-xs">Filters</span>
              </button>
              
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className={`p-1 rounded hover:bg-[#3C3C3C] flex items-center space-x-1 transition-colors duration-150 ${showHistory ? 'text-white bg-[#3C3C3C]' : 'text-gray-400'}`}
              >
                <Clock className="w-3 h-3" />
                <span className="text-xs">History</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => navigateResults('prev')}
                disabled={results.length === 0}
                className="p-1 rounded hover:bg-[#3C3C3C] text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                title="Previous match"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => navigateResults('next')}
                disabled={results.length === 0}
                className="p-1 rounded hover:bg-[#3C3C3C] text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                title="Next match"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              
              <button 
                onClick={handleSearch}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-150 text-xs font-medium flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="w-3 h-3 border-t-2 border-white border-r-2 rounded-full animate-spin mr-1"></div>
                    <span>Searching...</span>
                  </>
                ) : (
                  <span>Search</span>
                )}
              </button>
            </div>
          </div>
          
          {showFilters && (
            <div className="mt-2 p-2 bg-[#3C3C3C] rounded space-y-2 animate-fadeIn shadow-lg">
              <div className="flex flex-wrap gap-3 text-xs">
                <label className="flex items-center space-x-1 text-white">
                  <input
                    type="checkbox"
                    checked={caseSensitive}
                    onChange={(e) => setCaseSensitive(e.target.checked)}
                    className="rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 bg-gray-700"
                  />
                  <span>Case sensitive</span>
                </label>
                
                <label className="flex items-center space-x-1 text-white">
                  <input
                    type="checkbox"
                    checked={wholeWord}
                    onChange={(e) => setWholeWord(e.target.checked)}
                    className="rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 bg-gray-700"
                  />
                  <span>Whole word</span>
                </label>
                
                <label className="flex items-center space-x-1 text-white">
                  <input
                    type="checkbox"
                    checked={useRegex}
                    onChange={(e) => setUseRegex(e.target.checked)}
                    className="rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 bg-gray-700"
                  />
                  <span>Use regex</span>
                </label>
                
                <label className="flex items-center space-x-1 text-white">
                  <input
                    type="checkbox"
                    checked={excludeComments}
                    onChange={(e) => setExcludeComments(e.target.checked)}
                    className="rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 bg-gray-700"
                  />
                  <span>Exclude comments</span>
                </label>
              </div>
              
              {fileTypes.length > 0 && (
                <div>
                  <div className="text-xs text-white mb-1">Filter by file type:</div>
                  <div className="flex flex-wrap gap-1">
                    {fileTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => toggleFileTypeFilter(type)}
                        className={`px-2 py-1 text-xs rounded transition-colors duration-150 ${
                          selectedFileType === type ? 'bg-blue-600 text-white' : 'bg-[#252526] text-gray-300 hover:bg-[#3E3E3E]'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <button 
                  onClick={saveSearchAsSnippet}
                  className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 text-xs transition-colors duration-150"
                >
                  <Save className="w-3 h-3" />
                  <span>Save search</span>
                </button>
              </div>
            </div>
          )}
          
          {showHistory && searchHistory.length > 0 && (
            <div className="absolute w-full mt-1 bg-[#3C3C3C] rounded z-20 shadow-lg border border-gray-700 max-h-[200px] overflow-y-auto animate-fadeIn">
              {searchHistory.map((item, index) => (
                <div 
                  key={index}
                  onClick={() => selectHistoryItem(item)}
                  className="p-2 hover:bg-[#4C4C4C] text-white cursor-pointer flex items-center transition-colors duration-100"
                >
                  <Clock className="w-3 h-3 text-gray-400 mr-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{item.query}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-full">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
            <div className="text-sm text-gray-400">Searching {tabs.length} files...</div>
          </div>
        ) : (
          results.length > 0 ? (
            <div className="p-2">
              <div className="text-xs text-gray-400 mb-2 flex justify-between items-center">
                <span>{totalMatches} {totalMatches === 1 ? 'match' : 'matches'} across {Object.keys(groupedResults).length} {Object.keys(groupedResults).length === 1 ? 'file' : 'files'}</span>
                <button 
                  onClick={() => {
                    // Toggle all groups
                    const allExpanded = Object.keys(groupedResults).every(key => expandedGroups[key]);
                    const newState = !allExpanded;
                    
                    const newExpandedGroups: {[key: string]: boolean} = {};
                    Object.keys(groupedResults).forEach(key => {
                      newExpandedGroups[key] = newState;
                    });
                    
                    setExpandedGroups(newExpandedGroups);
                  }}
                  className="text-blue-400 hover:text-blue-300 transition-colors duration-150"
                >
                  {Object.keys(groupedResults).every(key => expandedGroups[key]) ? 'Collapse all' : 'Expand all'}
                </button>
              </div>
              
              {Object.entries(groupedResults).map(([filename, fileResults]) => (
                <div key={filename} className="mb-3 bg-[#1E1E1E] rounded overflow-hidden shadow-sm transition-all duration-200">
                  <div 
                    className="flex items-center px-2 py-1.5 hover:bg-[#2A2D2E] cursor-pointer transition-colors duration-150 border-l-2 border-transparent hover:border-blue-500"
                    onClick={() => toggleGroupExpanded(filename)}
                  >
                    {expandedGroups[filename] ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                    <div className="ml-1">{getFileIcon(filename)}</div>
                    <span className="ml-2 text-sm text-blue-400">{filename}</span>
                    <span className="ml-2 text-xs text-gray-400">({fileResults.length} {fileResults.length === 1 ? 'match' : 'matches'})</span>
                  </div>
                  
                  {expandedGroups[filename] && (
                    <div className="ml-6 border-l border-gray-700 pl-2 mt-1 pb-1 animate-fadeIn">
                      {fileResults.map((result, resultIndex) => (
                        <div 
                          key={`${result.filename}-${result.line}-${result.column}-${resultIndex}`}
                          onClick={() => handleSelectResult(result)}
                          className={`py-1 px-2 cursor-pointer rounded hover:bg-[#3C3C3C] transition-colors duration-150 ${
                            results.indexOf(result) === activeResultIndex ? 'bg-[#264F78]' : ''
                          }`}
                        >
                          <div className="flex items-center text-xs">
                            <span className="mr-2 text-gray-400">Line {result.line}</span>
                            <div className="ml-1">{getMatchTypeIcon(result.type)}</div>
                          </div>
                          
                          {includeContent && (
                            <pre className="text-xs text-white whitespace-pre-wrap font-mono mt-1 overflow-x-auto">
                              {showResultContext ? (
                                <code>
                                  {result.content.substring(0, result.column - 1)}
                                  <span className="bg-yellow-600 bg-opacity-40 rounded px-0.5">
                                    {result.content.substring(result.column - 1, result.column - 1 + result.matchLength)}
                                  </span>
                                  {result.content.substring(result.column - 1 + result.matchLength)}
                                </code>
                              ) : (
                                <code>
                                  {result.content}
                                </code>
                              )}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            searchQuery ? (
              <div className="text-center text-gray-400 py-10 flex flex-col items-center">
                <FolderOpen className="w-10 h-10 text-gray-600 mb-2" />
                <p>No results found for "{searchQuery}"</p>
                <p className="text-xs mt-1">Try adjusting your search terms or filters</p>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-10 flex flex-col items-center">
                <SearchIcon className="w-10 h-10 text-gray-600 mb-2" />
                <p>Enter a search term to find in open files</p>
                <p className="text-xs mt-1">Use filters for more precise results</p>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
};

export default Search; 