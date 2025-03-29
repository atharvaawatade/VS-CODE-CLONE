import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, User, Minimize2, Maximize2, FileSearch, ChevronDown, ChevronUp, Zap, AlertCircle, CheckCircle2, BrainCircuit, Code, Star, Smile, FileCode } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { useEditorStore } from '../store/editorStore';
import { useUIStore } from '../store/uiStore';
import { analyzeFile, generateCodeSuggestion } from '../services/gemini';

// Enhanced ChatInterface with better animations
const ChatInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);
  const [thinkingDots, setThinkingDots] = useState('.');
  const [isMaximized, setIsMaximized] = useState(false);
  const [buttonScale, setButtonScale] = useState(1);
  const [showRipple, setShowRipple] = useState(false);
  const { messages, addMessage, clearMessages } = useChatStore();
  const { activeTab, tabs, updateTabContent } = useEditorStore();
  const { isChatOpen, toggleChat, siriAnimationActive, setSiriAnimationActive } = useUIStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const siriButtonRef = useRef<HTMLDivElement>(null);

  // Thinking animation
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLoading) {
      interval = setInterval(() => {
        setThinkingDots((prev) => {
          if (prev.length >= 3) return '.';
          return prev + '.';
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, expandedMessageId]);

  // Add event listeners for code block buttons
  useEffect(() => {
    const copyButtons = document.querySelectorAll('.copy-code-btn');
    const applyButtons = document.querySelectorAll('.apply-code-btn');
    
    copyButtons.forEach(button => {
      button.addEventListener('click', (e: Event) => {
        e.stopPropagation();
        const codeBlock = (button as HTMLElement).closest('div.bg-[#1E1E1E]')?.querySelector('code');
        if (codeBlock) {
          navigator.clipboard.writeText(codeBlock.textContent || '');
          
          // Show temporary "Copied!" tooltip
          const notification = document.createElement('div');
          notification.textContent = 'Copied!';
          notification.className = 'absolute right-0 -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded';
          (button as HTMLElement).parentElement?.appendChild(notification);
          
          setTimeout(() => {
            notification.remove();
          }, 2000);
        }
      });
    });
    
    applyButtons.forEach(button => {
      button.addEventListener('click', (e: Event) => {
        e.stopPropagation();
        const codeBlock = (button as HTMLElement).closest('div.bg-[#1E1E1E]')?.querySelector('code');
        if (codeBlock && activeTab) {
          const currentTab = tabs.find(tab => tab.id === activeTab);
          if (currentTab) {
            // Apply code to current tab
            const newContent = codeBlock.textContent || '';
            const userConfirmed = confirm('Replace current file content with this code?');
            
            if (userConfirmed) {
              // Update tab content
              updateTabContent(currentTab.id, newContent);
              
              // Show temporary "Applied!" tooltip
              const notification = document.createElement('div');
              notification.textContent = 'Applied!';
              notification.className = 'absolute right-0 -top-8 bg-green-700 text-white text-xs px-2 py-1 rounded';
              (button as HTMLElement).parentElement?.appendChild(notification);
              
              setTimeout(() => {
                notification.remove();
              }, 2000);
            }
          }
        }
      });
    });
    
    return () => {
      // Clean up event listeners
      copyButtons.forEach(button => {
        button.removeEventListener('click', () => {});
      });
      
      applyButtons.forEach(button => {
        button.removeEventListener('click', () => {});
      });
    };
  }, [messages, expandedMessageId, activeTab, tabs, updateTabContent]);

  // Generate smart suggestions based on context
  useEffect(() => {
    const currentTab = tabs.find(tab => tab.id === activeTab);
    if (currentTab) {
      const filename = currentTab.filename;
      const fileExt = filename.split('.').pop()?.toLowerCase();
      
      // Generate context-aware suggestions
      const contextSuggestions: string[] = [];
      
      // Base suggestions for any file
      contextSuggestions.push(`Analyze this ${fileExt} code`);
      contextSuggestions.push(`Explain how this code works`);
      contextSuggestions.push(`Find bugs in this code`);
      contextSuggestions.push(`Optimize this code`);
      
      // File type specific suggestions
      if (fileExt === 'html') {
        contextSuggestions.push('Improve HTML accessibility');
        contextSuggestions.push('Optimize page structure');
        contextSuggestions.push('Add responsive design');
        contextSuggestions.push('Validate HTML semantics');
      } else if (fileExt === 'css') {
        contextSuggestions.push('Make this responsive');
        contextSuggestions.push('Add animations');
        contextSuggestions.push('Optimize CSS selectors');
        contextSuggestions.push('Convert to Flexbox/Grid');
      } else if (fileExt === 'js' || fileExt === 'jsx' || fileExt === 'ts' || fileExt === 'tsx') {
        contextSuggestions.push('Find performance issues');
        contextSuggestions.push('Add error handling');
        contextSuggestions.push('Refactor this code');
        
        if (fileExt === 'tsx' || fileExt === 'jsx') {
          contextSuggestions.push('Convert to functional component');
          contextSuggestions.push('Add prop validation');
          contextSuggestions.push('Fix React hooks issues');
          contextSuggestions.push('Implement memo/useCallback');
        }
        
        if (fileExt === 'ts' || fileExt === 'tsx') {
          contextSuggestions.push('Improve type safety');
          contextSuggestions.push('Add type generics');
          contextSuggestions.push('Fix type errors');
        }
      } else if (fileExt === 'json') {
        contextSuggestions.push('Validate JSON structure');
        contextSuggestions.push('Format JSON properly');
        contextSuggestions.push('Add missing fields');
      } else if (fileExt === 'md') {
        contextSuggestions.push('Improve documentation');
        contextSuggestions.push('Add code examples');
        contextSuggestions.push('Fix markdown syntax');
      }
      
      setSuggestions(contextSuggestions);
    }
  }, [activeTab, tabs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = async (action: string) => {
    if (!activeTab || isLoading) return;

    const currentTab = tabs.find(tab => tab.id === activeTab);
    if (!currentTab) return;
    
    setIsLoading(true);

    try {
      if (action === 'analyze') {
        addMessage(`Analyze current file: ${currentTab.filename}`, 'user');
        const response = await analyzeFile(currentTab.filename, currentTab.content);
        addMessage(response, 'assistant');
      } else if (action === 'bugs') {
        addMessage(`Identify potential bugs in ${currentTab.filename}`, 'user');
        const bugResponse = await analyzeFile(
          currentTab.filename, 
          currentTab.content,
          "Focus on identifying potential bugs, edge cases, and security vulnerabilities in this code."
        );
        addMessage(bugResponse, 'assistant');
      } else if (action === 'performance') {
        addMessage(`Analyze performance of ${currentTab.filename}`, 'user');
        const perfResponse = await analyzeFile(
          currentTab.filename,
          currentTab.content,
          "Focus on performance optimization opportunities in this code. Identify bottlenecks and suggest improvements."
        );
        addMessage(perfResponse, 'assistant');
      } else if (action === 'practices') {
        addMessage(`Review best practices in ${currentTab.filename}`, 'user');
        const practicesResponse = await analyzeFile(
          currentTab.filename,
          currentTab.content,
          "Evaluate this code against industry best practices. Suggest improvements for code quality, maintainability, and readability."
        );
        addMessage(practicesResponse, 'assistant');
      }
    } catch (error: unknown) {
      console.error('Error during quick action:', error);
      addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    textareaRef.current?.focus();
  };

  const toggleMessageExpand = (id: string) => {
    if (expandedMessageId === id) {
      setExpandedMessageId(null);
    } else {
      setExpandedMessageId(id);
    }
  };

  const toggleMaximize = () => {
    // Create animation effect when maximizing/minimizing
    const chatElement = document.querySelector('.chat-container') as HTMLElement;
    if (chatElement) {
      chatElement.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
      
      if (!isMaximized) {
        // Save current dimensions before maximizing
        chatElement.dataset.width = chatElement.offsetWidth + 'px';
        chatElement.dataset.height = chatElement.offsetHeight + 'px';
        
        // Expand animation
        chatElement.style.transform = 'scale(0.95)';
        chatElement.style.opacity = '0.9';
        
        setTimeout(() => {
          chatElement.style.transform = 'scale(1)';
          chatElement.style.opacity = '1';
        }, 50);
      } else {
        // Shrink animation
        chatElement.style.transform = 'scale(1.02)';
        chatElement.style.opacity = '0.9';
        
        setTimeout(() => {
          chatElement.style.transform = 'scale(1)';
          chatElement.style.opacity = '1';
        }, 50);
      }
    }
    
    setIsMaximized(!isMaximized);
  };

  // Enhanced Siri animation for chat
  const handleSiriButtonClick = () => {
    if (siriAnimationActive) return;
    
    setSiriAnimationActive(true);
    setButtonScale(1.2);
    setShowRipple(true);
    
    // Button press animation
    setTimeout(() => {
      setButtonScale(0.9);
    }, 150);
    
    // Create blob animation
    const button = siriButtonRef.current;
    if (button) {
      const rect = button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Create blob element
      const blob = document.createElement('div');
      blob.className = 'fixed z-[999] rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 pointer-events-none';
      blob.style.left = `${centerX}px`;
      blob.style.top = `${centerY}px`;
      blob.style.transform = 'translate(-50%, -50%)';
      blob.style.width = '60px';
      blob.style.height = '60px';
      blob.style.opacity = '0.9';
      blob.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
      document.body.appendChild(blob);
      
      // Start animation
      setTimeout(() => {
        if (isChatOpen) {
          // Shrink to corner animation for closing
          blob.style.transform = 'translate(-50%, -50%) scale(0.1)';
          blob.style.opacity = '0';
        } else {
          // Expand animation for opening
          blob.style.transform = 'translate(-50%, -50%) scale(15)';
          blob.style.opacity = '0';
        }
        
        // Remove blob and reset button animation
        setTimeout(() => {
          document.body.removeChild(blob);
          setButtonScale(1);
          setShowRipple(false);
          toggleChat();
          setSiriAnimationActive(false);
        }, 500);
      }, 200);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput('');
    
    // Get context from current file
    const currentTab = tabs.find(tab => tab.id === activeTab);
    const codeContext = currentTab 
      ? `Currently open file: ${currentTab.filename}\n\n${currentTab.content}`
      : "No file is currently open";
    
    // Add user message to chat
    addMessage(userMessage, 'user');
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Call Gemini API to get a response using our configured service with code context
      const response = await generateCodeSuggestion(userMessage, codeContext);
      
      // Add AI response to chat
      addMessage(response, 'assistant');
    } catch (error) {
      console.error("Error getting AI response:", error);
      addMessage("Sorry, I encountered an error processing your request. Please check the console for details.", 'assistant');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to format message with code highlighting
  const formatMessageWithCodeBlocks = (message: string) => {
    // Replace code blocks with formatted versions
    return message.replace(/```(\w+)?\n([\s\S]*?)```/g, (_match, language, code) => {
      const lang = language || 'plaintext';
      return (
        `<div class="bg-[#1E1E1E] rounded-md overflow-hidden my-2">
          <div class="flex items-center justify-between px-4 py-1 bg-[#2D2D2D] text-xs text-gray-400">
            <span>${lang}</span>
            <div class="flex space-x-2">
              <button class="copy-code-btn hover:text-white" title="Copy code">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
              <button class="apply-code-btn hover:text-white" title="Apply to editor">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </button>
            </div>
          </div>
          <pre class="p-4 overflow-x-auto text-gray-300 text-sm"><code>${code}</code></pre>
        </div>`
      );
    });
  };

  // If chat is closed, only show the enhanced Siri-like button
  if (!isChatOpen) {
    return (
      <div 
        ref={siriButtonRef}
        className="fixed bottom-6 right-6 z-50 cursor-pointer group"
        onClick={handleSiriButtonClick}
        style={{ 
          transform: `scale(${buttonScale})`,
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          filter: 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.5))'
        }}
      >
        <div className="relative">
          {/* Multiple layers for enhanced visual effect */}
          <div className="absolute -inset-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-30 blur-md animate-pulse"></div>
          <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-20 blur-sm"></div>
          <div className={`w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center transition-all duration-300`}>
            {/* Enhanced multi-layer animation */}
            {showRipple && (
              <div className="absolute inset-0 rounded-full bg-white opacity-30 scale-150 animate-ping"></div>
            )}
            <div className="absolute inset-0 rounded-full bg-blue-400 opacity-30 animate-ping"></div>
            <div className="absolute inset-0 rounded-full bg-purple-300 opacity-20 animate-ping animation-delay-300"></div>
            
            {/* 3D globe effect */}
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full bg-blue-900 opacity-80"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-900 via-transparent to-blue-400 animate-spin" style={{ animationDuration: '8s' }}></div>
              <div className="absolute inset-[2px] rounded-full bg-gradient-to-br from-blue-500 via-blue-700 to-blue-900 overflow-hidden">
                {/* Continents */}
                <div className="absolute w-3 h-2 bg-green-400 opacity-80 rounded-full top-1 left-2 transform rotate-45"></div>
                <div className="absolute w-4 h-1.5 bg-green-400 opacity-80 rounded-full top-3 left-5"></div>
                <div className="absolute w-2 h-2 bg-green-400 opacity-80 rounded-full top-5 left-1"></div>
                <div className="absolute w-3 h-1.5 bg-green-400 opacity-80 rounded-full bottom-2 right-3"></div>
                <div className="absolute w-2 h-2 bg-green-400 opacity-80 rounded-full right-1 top-2"></div>
                
                {/* Glowing effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-400/20 to-blue-200/30 animate-pulse"></div>
              </div>
              
              {/* Orbit rings */}
              <div className="absolute inset-[-4px] border-2 border-blue-300/20 rounded-full animate-spin" style={{ animationDuration: '12s' }}></div>
              <div className="absolute inset-[-1px] border border-blue-300/30 rounded-full"></div>
              
              {/* Small orbiting dots */}
              <div className="absolute w-1.5 h-1.5 bg-blue-300 rounded-full top-[-2px] left-1/2 transform -translate-x-1/2 animate-orbitTop"></div>
              <div className="absolute w-1.5 h-1.5 bg-purple-300 rounded-full bottom-[-2px] left-1/2 transform -translate-x-1/2 animate-orbitBottom"></div>
            </div>
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#1E1E1E] shadow-lg animate-pulse"></div>
          
          {/* Text hint on hover */}
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-lg transition-all duration-300 scale-0 group-hover:scale-100">
            AI Assistant
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`chat-container flex flex-col bg-[#1E1E1E] border-l border-gray-700 relative ${isMaximized ? 'fixed inset-0 z-50' : 'h-full w-[350px]'}`}>
      {/* Enhanced header with modern design and effects */}
      <div className="p-3 bg-gradient-to-r from-[#0078D4] via-[#0a6fbe] to-[#2b5797] border-b border-gray-700 flex justify-between items-center relative overflow-hidden">
        <div className="absolute -left-10 -top-10 w-24 h-24 bg-white rounded-full opacity-10 blur-lg"></div>
        <div className="absolute -right-10 -bottom-10 w-20 h-20 bg-blue-300 rounded-full opacity-10 blur-lg"></div>
        
        <h2 className="text-white text-sm font-medium flex items-center">
          <div className="relative mr-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-blue-400 opacity-20 animate-pulse"></div>
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 animate-pulse"></div>
            </div>
          </div>
          <span className="text-shadow">VS Code AI Assistant</span>
        </h2>
        <div className="flex space-x-1">
          <button
            onClick={() => handleQuickAction('analyze')}
            title="Analyze current file"
            className="p-1.5 hover:bg-white/10 rounded text-white/90 hover:text-white transition-colors"
          >
            <FileSearch className="w-4 h-4" />
          </button>
          <button
            onClick={clearMessages}
            title="Clear conversation"
            className="p-1.5 hover:bg-white/10 rounded text-white/90 hover:text-white transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={toggleMaximize}
            title={isMaximized ? "Restore" : "Maximize"}
            className="p-1.5 hover:bg-white/10 rounded text-white/90 hover:text-white transition-colors"
          >
            {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={handleSiriButtonClick}
            title="Close chat"
            className="p-1.5 hover:bg-white/10 rounded text-white/90 hover:text-white transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#1E1E1E] bg-opacity-80 backdrop-blur">
        {messages.length === 0 ? (
          <div className="text-center text-gray-300 py-6">
            {/* Enhanced welcome screen with visual effects */}
            <div className="relative mx-auto w-24 h-24 mb-4">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 blur-lg opacity-30 animate-pulse"></div>
              <div className="relative w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <div className="absolute inset-0 rounded-full bg-white opacity-20 animate-pulse"></div>
                <BrainCircuit className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="font-medium text-xl text-white mb-2">VS Code AI Assistant</h3>
            <p className="text-sm text-gray-400 max-w-xs mx-auto mb-6">I can analyze your code, identify issues, and suggest improvements to help you build better software.</p>
            
            {/* Show current file info if available */}
            {activeTab && (
              <div className="mb-6 p-3 bg-[#252526] rounded-lg border border-gray-700 mx-auto max-w-sm">
                <h4 className="text-sm font-medium text-blue-400 mb-2 flex items-center">
                  <FileCode className="w-4 h-4 mr-1.5" />
                  Current File:
                </h4>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-white font-mono bg-[#1E1E1E] px-2 py-1 rounded truncate">
                    {tabs.find(tab => tab.id === activeTab)?.filename}
                  </p>
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => handleQuickAction('analyze')}
                      className="p-1 hover:bg-[#3C3C3C] rounded text-gray-400 hover:text-white transition-colors"
                      title="Analyze this file"
                    >
                      <Zap className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Ask me about this file or click one of the options below
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              <button 
                onClick={() => handleQuickAction('analyze')}
                className="text-left p-3 bg-[#252526] hover:bg-[#2c2c2c] rounded-lg text-sm hover:scale-[1.02] transition-all duration-200 border border-gray-700 hover:border-blue-800 hover:shadow-xl hover:shadow-blue-900/10 group"
              >
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full w-10 h-10 flex items-center justify-center mb-2 group-hover:shadow-md transition-all duration-200">
                  <FileSearch className="w-5 h-5 text-white" />
                </div>
                <p className="font-medium text-blue-400 group-hover:text-blue-300">Analyze Code</p>
                <p className="text-xs text-gray-500 mt-1">Get insights about your code</p>
              </button>
              <button 
                onClick={() => handleQuickAction('bugs')}
                className="text-left p-3 bg-[#252526] hover:bg-[#2c2c2c] rounded-lg text-sm hover:scale-[1.02] transition-all duration-200 border border-gray-700 hover:border-red-900 hover:shadow-xl hover:shadow-red-900/10 group"
              >
                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-full w-10 h-10 flex items-center justify-center mb-2 group-hover:shadow-md transition-all duration-200">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <p className="font-medium text-red-400 group-hover:text-red-300">Find Bugs</p>
                <p className="text-xs text-gray-500 mt-1">Identify issues and bugs</p>
              </button>
              <button 
                onClick={() => handleQuickAction('practices')}
                className="text-left p-3 bg-[#252526] hover:bg-[#2c2c2c] rounded-lg text-sm hover:scale-[1.02] transition-all duration-200 border border-gray-700 hover:border-green-900 hover:shadow-xl hover:shadow-green-900/10 group"
              >
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-full w-10 h-10 flex items-center justify-center mb-2 group-hover:shadow-md transition-all duration-200">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <p className="font-medium text-green-400 group-hover:text-green-300">Best Practices</p>
                <p className="text-xs text-gray-500 mt-1">Review code quality</p>
              </button>
              <button 
                onClick={() => handleQuickAction('performance')}
                className="text-left p-3 bg-[#252526] hover:bg-[#2c2c2c] rounded-lg text-sm hover:scale-[1.02] transition-all duration-200 border border-gray-700 hover:border-yellow-900 hover:shadow-xl hover:shadow-yellow-900/10 group"
              >
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full w-10 h-10 flex items-center justify-center mb-2 group-hover:shadow-md transition-all duration-200">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <p className="font-medium text-yellow-400 group-hover:text-yellow-300">Performance</p>
                <p className="text-xs text-gray-500 mt-1">Optimize for speed</p>
              </button>
            </div>
            
            <div className="mt-6 flex justify-center space-x-6 text-xs text-gray-500">
              <div className="flex items-center">
                <Code className="w-3 h-3 mr-1 text-gray-400" />
                <span>Code Analysis</span>
              </div>
              <div className="flex items-center">
                <Star className="w-3 h-3 mr-1 text-gray-400" />
                <span>Best Practices</span>
              </div>
              <div className="flex items-center">
                <Smile className="w-3 h-3 mr-1 text-gray-400" />
                <span>Helpful Tips</span>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
          <div
            key={message.id}
              className={`flex items-start space-x-3 ${
              message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div
                className={`shrink-0 w-8 h-8 rounded-full shadow-md flex items-center justify-center ${
                  message.role === 'assistant' 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                    : 'bg-gradient-to-br from-gray-600 to-gray-700'
              }`}
            >
              {message.role === 'assistant' ? (
                  <BrainCircuit className="w-4 h-4 text-white" />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
              
            <div
                className={`relative group flex-1 p-3 rounded-lg shadow-sm ${
                message.role === 'assistant'
                    ? 'bg-[#2C2C2C] text-white border border-gray-700'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                } ${expandedMessageId === message.id ? 'animate-fadeIn' : ''}`}
              >
                {/* Message length toggle for long messages */}
                {message.content.length > 300 && (
                  <button
                    onClick={() => toggleMessageExpand(message.id)}
                    className={`absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                      message.role === 'assistant' ? 'hover:bg-[#3C3C3C]' : 'hover:bg-[#106EBE]'
                    }`}
                  >
                    {expandedMessageId === message.id ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                )}
                
                {/* Message content with code block formatting */}
                <div 
                  className={`${
                    message.content.length > 300 && expandedMessageId !== message.id
                      ? 'line-clamp-6'
                      : ''
                  } whitespace-pre-wrap text-sm message-content`}
                  dangerouslySetInnerHTML={{ 
                    __html: formatMessageWithCodeBlocks(message.content) 
                  }}
                ></div>
                
                {/* Timestamp */}
                <div className="mt-2 text-[10px] opacity-60 text-right">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-md flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 p-3 rounded-lg shadow-sm bg-[#2C2C2C] text-white border border-gray-700">
              <div className="flex items-center">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150"></div>
                </div>
                <span className="ml-2 text-sm opacity-75">Analyzing{thinkingDots}</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Content-aware suggestions */}
      {suggestions.length > 0 && !isLoading && (
        <div className="px-4 py-2 border-t border-gray-800 bg-[#252526]">
          <p className="text-xs text-gray-400 mb-2">Suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-2.5 py-1.5 text-xs font-medium bg-[#323233] text-blue-400 rounded-full hover:bg-[#3E3E40] transition-colors border border-gray-700 hover:border-blue-800 hover:text-blue-300 truncate max-w-[150px] flex items-center"
              >
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5"></span>
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced input with better design */}
      <form onSubmit={handleSubmit} className="border-t border-gray-700 p-3 bg-[#1E1E1E]">
        <div className="relative">
          <textarea
            placeholder="Ask about your code..."
            className="w-full bg-[#2D2D2D] text-sm text-gray-200 p-3 pr-12 rounded-lg border border-gray-700 resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-150 min-h-[50px] max-h-[150px]"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            ref={textareaRef}
          />
          <button
            className={`absolute right-2 bottom-2 p-2 rounded-full ${
              input.trim() 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md' 
                : 'bg-gray-700 cursor-not-allowed'
            } transition-all duration-150`}
            disabled={!input.trim() || isLoading}
            type="submit"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      </form>
      
      {/* Add global styles for animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        
        @keyframes orbitTop {
          0% { transform: translateX(-50%) rotate(0deg) translateY(-5px); }
          100% { transform: translateX(-50%) rotate(360deg) translateY(-5px); }
        }
        
        @keyframes orbitBottom {
          0% { transform: translateX(-50%) rotate(0deg) translateY(5px); }
          100% { transform: translateX(-50%) rotate(-360deg) translateY(5px); }
        }
        
        .animation-delay-300 {
          animation-delay: 300ms;
        }
        
        .text-shadow {
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}} />
    </div>
  );
};

export default ChatInterface;