import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { Minimize2, Maximize2, X, Copy, Plus, Trash2, Download, ChevronDown } from 'lucide-react';
import { useUIStore } from '../store/uiStore';

interface CommandHistory {
  commands: string[];
  currentIndex: number;
}



interface StreamInfo {
  col: number;
  row: number;
  speed: number;
  length: number;
}

const Terminal: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const { toggleTerminal, isMobileView, workspaceName } = useUIStore();
  const [terminal, setTerminal] = useState<XTerm | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [, setCommandHistory] = useState<CommandHistory>({ commands: [], currentIndex: -1 });
  const [showOptions, setShowOptions] = useState(false);
  const tabs = ['Terminal', 'Output', 'Problems', 'Debug Console'];
  
  // Mock file system structure for simulation
  
  // Current directory in the simulated file system
  const [currentDir] = useState('/src');

  // Initialize terminal immediately
  useEffect(() => {
    if (!terminalRef.current) return;

    const initializeTerminal = () => {
      try {
        // Basic terminal setup
        const term = new XTerm({
      theme: {
            background: '#111111',
            foreground: '#55FF55',
            cursor: '#FFFFFF',
      },
          fontSize: isMobileView ? 14 : 16,
          fontFamily: 'monospace, "Courier New", Courier',
      cursorBlink: true,
          cursorStyle: 'block',
          rows: isMobileView ? 8 : 12,
          scrollback: 1000,
          allowTransparency: true,
          convertEol: true
    });

        // Add fit addon
    const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        
        // Open terminal
        if (terminalRef.current) {
          term.open(terminalRef.current);
    fitAddon.fit();
        }
        
        // Save terminal reference
        setTerminal(term);
        
        // Clear terminal to start fresh
        term.clear();
        
        // Start matrix animation immediately
        const startMatrixAnimation = () => {
          const cols = term.cols;
          const rows = term.rows;
          const chars = "10";
          const streams: StreamInfo[] = [];
          
          // Create matrix streams
          for (let i = 0; i < cols; i++) {
            if (Math.random() < 0.5) {
              streams.push({
                col: i,
                row: Math.floor(Math.random() * rows * 2) - rows,
                speed: 0.2 + Math.random() * 0.3,
                length: 3 + Math.floor(Math.random() * 10)
              });
            }
          }
          
          let frameCount = 0;
          const interval = setInterval(() => {
            // Clear screen
            term.write('\x1b[2J\x1b[H');
            
            // Draw matrix streams
            for (const stream of streams) {
              stream.row += stream.speed;
              
              // Draw stream characters
              for (let i = 0; i < stream.length; i++) {
                const row = Math.floor(stream.row) - i;
                if (row >= 0 && row < rows) {
                  const char = chars[Math.floor(Math.random() * chars.length)];
                  const color = i === 0 ? '\x1b[1;97m' : i < 2 ? '\x1b[1;92m' : '\x1b[0;32m';
                  term.write(`\x1b[${row + 1};${stream.col + 1}H${color}${char}\x1b[0m`);
                }
              }
              
              // Reset stream if it's off-screen
              if (stream.row - stream.length > rows) {
                stream.row = -stream.length;
              }
            }
            
            frameCount++;
            // Transition to logo after animation
            if (frameCount > 60) {
              clearInterval(interval);
              showVSCodeLogo();
            }
          }, 50);
        };
        
        // Show VS Code logo animation
        const showVSCodeLogo = () => {
          term.clear();
          
          // Calculate center position
          const centerRow = Math.floor(term.rows / 2) - 4;
          const centerCol = Math.floor(term.cols / 2) - 20;
          
          // VS Code logo
          const logo = [
            "   __     ______    ____      _       ",
            "   \\ \\   / / ___|  / ___|___ | | ___  ",
            "    \\ \\ / /\\___  \\| |   / _ \\| |/ _ \\ ",
            "     \\ V /  ___) || |__| (_) | |  __/ ",
            "      \\_/  |____/  \\____\\___/|_|\\___| "
          ];
          
          // Rainbow colors for welcome message
          const rainbowColors = ['\x1b[38;5;34m', '\x1b[38;5;40m', '\x1b[38;5;46m', '\x1b[38;5;47m', '\x1b[38;5;48m', '\x1b[38;5;42m'];
          
          // Show logo with animation
          let logoRow = 0;
          const logoInterval = setInterval(() => {
            if (logoRow < logo.length) {
              // Draw logo line with a blue color
              term.write(`\x1b[${centerRow + logoRow};${centerCol}H\x1b[1;94m${logo[logoRow]}\x1b[0m`);
              logoRow++;
            } else {
              clearInterval(logoInterval);
              
              // Show welcome message with green effect
              const welcomeMsg = "Welcome to VS Code Terminal";
              const welcomeRow = centerRow + logo.length + 2;
              const welcomeCol = Math.max(0, centerCol + 5);
              
              let charIndex = 0;
              const welcomeInterval = setInterval(() => {
                if (charIndex < welcomeMsg.length) {
                  const colorIndex = charIndex % rainbowColors.length;
                  term.write(`\x1b[${welcomeRow};${welcomeCol + charIndex}H${rainbowColors[colorIndex]}${welcomeMsg[charIndex]}\x1b[0m`);
                  charIndex++;
                } else {
                  clearInterval(welcomeInterval);
                  
                  // Type out info message
                  setTimeout(() => {
                    term.write(`\r\n\r\n\x1b[${welcomeRow + 3};${centerCol}H\x1b[92m✓\x1b[0m Terminal initialized successfully!`);
                    
                    // Show prompt after animation
                    setTimeout(() => {
                      term.write(`\r\n\r\n\x1b[${welcomeRow + 5};${Math.max(5, centerCol - 10)}H`);
                      const dirEmoji = currentDir.includes('src') ? '📦' : 
                                    currentDir.includes('components') ? '🧩' : 
                                    currentDir.includes('public') ? '🌐' : '💻';
                      term.write(`\x1b[1;92m${workspaceName}@vscode\x1b[0m \x1b[90m${dirEmoji}\x1b[0m \x1b[1;94m${currentDir}\x1b[0m $ `);
                      
                      // Set up key handling for user interaction
                      setupKeyHandlers(term);
                    }, 500);
                  }, 400);
                }
              }, 40);
            }
          }, 100);
        };
        
        // Start the animation sequence
        startMatrixAnimation();
        
        // Handle window resize
        const handleResize = () => {
          if (fitAddon) {
            try {
              fitAddon.fit();
            } catch (err) {
              console.error('Error fitting terminal:', err);
            }
          }
        };
        
        window.addEventListener('resize', handleResize);
        
        // Set timeout to ensure proper terminal sizing
        setTimeout(handleResize, 200);
        
        return () => {
          window.removeEventListener('resize', handleResize);
          if (term) term.dispose();
        };
      } catch (error) {
        console.error('Terminal initialization error:', error);
        
        // Provide fallback terminal UI in case of error
        if (terminalRef.current) {
          terminalRef.current.innerHTML = `
            <div class="p-6 text-green-400 bg-[#111111] h-full flex flex-col">
              <div class="font-mono overflow-y-auto flex-1">
                <div class="mb-2">Welcome to VS Code Terminal</div>
                <div class="mb-4 text-yellow-400">⚠️ Enhanced terminal couldn't be loaded</div>
                <div class="mb-2">${workspaceName}@vscode:/src$ <span class="animate-pulse">_</span></div>
              </div>
              <div class="mt-2 text-xs text-gray-500">
                Try refreshing the page or check console for errors
              </div>
            </div>
          `;
        }
      }
    };
    
    // Set up key handlers for terminal input
    const setupKeyHandlers = (term: XTerm) => {
      let currentLineBuffer = '';
      let cursorPosition = 0;
      
      term.onKey(({ key, domEvent }) => {
        const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;
        
        // Handle Enter key
        if (domEvent.keyCode === 13) { // Enter
          // Execute command
          term.write('\r\n');
          if (currentLineBuffer.trim()) {
            executeCommand(currentLineBuffer.trim(), term);
            currentLineBuffer = '';
            cursorPosition = 0;
          } else {
            // Just print a new prompt if empty
            const dirEmoji = currentDir.includes('src') ? '📦' : 
                          currentDir.includes('components') ? '🧩' : 
                          currentDir.includes('public') ? '🌐' : '💻';
                          
            term.write(`\x1b[1;92m${workspaceName}@vscode\x1b[0m \x1b[90m${dirEmoji}\x1b[0m \x1b[1;94m${currentDir}\x1b[0m $ `);
          }
        } 
        // Handle Backspace
        else if (domEvent.keyCode === 8) { // Backspace
          if (cursorPosition > 0) {
            term.write('\b \b');
            currentLineBuffer = currentLineBuffer.substring(0, currentLineBuffer.length - 1);
            cursorPosition--;
          }
        }
        // Handle other printable characters
        else if (printable) {
          term.write(key);
          currentLineBuffer += key;
          cursorPosition++;
        }
      });
    };
    
    // Initialize terminal immediately when component mounts
    initializeTerminal();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobileView, workspaceName, currentDir]);

  // Execute terminal commands
  const executeCommand = (command: string, term: XTerm) => {
    // Add to command history if not empty
    if (command.trim() !== '') {
      setCommandHistory(prev => ({
        commands: [...prev.commands, command.trim()],
        currentIndex: prev.commands.length + 1
      }));
    }

    // Handle command execution
    const args = command.trim().split(/\s+/);
    const cmd = args[0].toLowerCase();
    
    // Process different commands
    switch (cmd) {
      case 'clear':
      case 'cls':
        term.clear();
        break;
      case 'echo':
        term.write(args.slice(1).join(' ') + '\r\n');
        break;
      case 'ls':
      case 'dir': 
        // Display mock directory contents
        term.write('\r\n');
        term.write('\x1b[1;34mcomponents/\x1b[0m    \x1b[1;33mmain.tsx\x1b[0m    \x1b[1;35mindex.css\x1b[0m\r\n');
        term.write('\x1b[1;34mutils/\x1b[0m         \x1b[1;34mservices/\x1b[0m   \x1b[1;34mstore/\x1b[0m\r\n');
        break;
      default:
        term.write(`Command not found: \x1b[1;31m${cmd}\x1b[0m\r\n`);
    }
    
    // Show prompt after command execution
    const dirEmoji = currentDir.includes('src') ? '📦' : 
                  currentDir.includes('components') ? '🧩' : 
                  currentDir.includes('public') ? '🌐' : '💻';
    term.write(`\x1b[1;92m${workspaceName}@vscode\x1b[0m \x1b[90m${dirEmoji}\x1b[0m \x1b[1;94m${currentDir}\x1b[0m $ `);
  };

  // UI actions
  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
    // Resize terminal after state update
    setTimeout(() => {
      if (terminal) {
        const fitAddon = new FitAddon();
        terminal.loadAddon(fitAddon);
        fitAddon.fit();
      }
    }, 100);
  };

  const handleCopyText = () => {
    if (terminal && terminal.hasSelection()) {
      const selectedText = terminal.getSelection();
      navigator.clipboard.writeText(selectedText);
    }
  };

  const clearTerminal = () => {
    if (terminal) {
      terminal.clear();
      
      // Show VS Code mini-logo after clearing
      terminal.write('\x1b[1;34m   __     ______    ____      _       \r\n');
      terminal.write('\x1b[1;34m   \\ \\   / / ___|  / ___|___ | | ___  \r\n');
      terminal.write('\x1b[1;34m    \\_/  |____/  \\____\\___/|_|\\___| \r\n');
      terminal.write('\x1b[0m\r\n');
      
      const dirEmoji = currentDir.includes('src') ? '📦' : 
                     currentDir.includes('components') ? '🧩' : 
                     currentDir.includes('public') ? '🌐' : '💻';
                     
      terminal.write(`\x1b[32mTerminal cleared successfully.\x1b[0m\r\n\r\n`);
      terminal.write(`\x1b[1;92m${workspaceName}@vscode\x1b[0m \x1b[90m${dirEmoji}\x1b[0m \x1b[1;94m${currentDir}\x1b[0m $ `);
    }
  };

  return (
    <div className={`bg-[#111111] border-t border-gray-700 flex flex-col ${isMaximized ? 'fixed inset-0 z-50' : 'h-full'}`}>
      <div className="flex justify-between items-center p-2 bg-gradient-to-r from-[#1A1A1A] to-[#2D2D30] border-b border-gray-700">
        <div className="flex overflow-x-auto hide-scrollbar">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTabIndex(index)}
              className={`px-3 py-1 text-xs mr-1 whitespace-nowrap rounded-t-md transition-colors duration-150 ${
                activeTabIndex === index 
                  ? 'bg-[#1E1E1E] text-white border-t-2 border-t-blue-500 shadow-sm' 
                  : 'bg-[#2D2D2D] text-gray-400 hover:bg-[#3C3C3C] hover:text-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
          <button
            className="px-3 py-1 text-xs mr-1 bg-[#2D2D2D] text-gray-400 hover:bg-[#3C3C3C] hover:text-gray-200 rounded-md transition-colors duration-150 flex items-center"
            title="New Terminal"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
        <div className="flex space-x-2 relative">
          <button
            onClick={handleCopyText}
            className="p-1 hover:bg-[#3C3C3C] rounded text-gray-400 hover:text-white transition-colors duration-150 relative group"
            title="Copy Selected Text"
          >
            <Copy className="w-4 h-4" />
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-gray-200 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">Copy</span>
          </button>
          <button
            onClick={clearTerminal}
            className="p-1 hover:bg-[#3C3C3C] rounded text-gray-400 hover:text-white transition-colors duration-150 relative group"
            title="Clear Terminal"
          >
            <Trash2 className="w-4 h-4" />
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-gray-200 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">Clear</span>
          </button>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="p-1 hover:bg-[#3C3C3C] rounded text-gray-400 hover:text-white transition-colors duration-150 relative group"
            title="More Actions"
          >
            <ChevronDown className="w-4 h-4" />
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-gray-200 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">Options</span>
          </button>
          <button
            onClick={toggleMaximize}
            className="p-1 hover:bg-[#3C3C3C] rounded text-gray-400 hover:text-white transition-colors duration-150 relative group"
            title={isMaximized ? "Restore" : "Maximize"}
          >
            {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-gray-200 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">{isMaximized ? "Restore" : "Maximize"}</span>
          </button>
          <button
            onClick={toggleTerminal}
            className="p-1 hover:bg-[#3C3C3C] rounded text-gray-400 hover:text-white transition-colors duration-150 relative group"
            title="Close Terminal"
          >
            <X className="w-4 h-4" />
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-gray-200 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">Close</span>
          </button>
          
          {showOptions && (
            <div className="absolute right-0 top-8 bg-[#252526] border border-gray-700 rounded shadow-lg z-10 py-1 w-48">
              <button 
                className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#3C3C3C] transition-colors duration-150 flex items-center"
                onClick={() => { setShowOptions(false); }}
              >
                <span className="w-4 h-4 inline-block mr-2"></span>
                Select All
              </button>
              <button 
                className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#3C3C3C] transition-colors duration-150 flex items-center"
                onClick={() => { 
                  if (terminal) terminal.scrollToBottom();
                  setShowOptions(false);
                }}
              >
                <span className="w-4 h-4 inline-block mr-2"></span>
                Scroll to Bottom
              </button>
              <button 
                className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#3C3C3C] transition-colors duration-150 flex items-center"
                onClick={() => { 
                  if (terminal) terminal.scrollToTop();
                  setShowOptions(false);
                }}
              >
                <span className="w-4 h-4 inline-block mr-2"></span>
                Scroll to Top
              </button>
              <hr className="border-gray-700 my-1" />
              <button 
                className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#3C3C3C] transition-colors duration-150 flex items-center"
                onClick={() => { setShowOptions(false); }}
              >
                <Download className="w-3 h-3 mr-2" />
                Save Terminal Output
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="relative h-[calc(100%-2.5rem)] overflow-hidden">
        <div ref={terminalRef} className="h-full overflow-hidden p-1 backdrop-blur-sm terminal-enhanced" />
        
        {/* Visual effects */}
        <div className="absolute inset-0 pointer-events-none z-10 scanlines opacity-20"></div>
        <div className="absolute top-0 left-0 w-24 h-24 pointer-events-none z-10 vhs-corner-tl opacity-20"></div>
        <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none z-10 vhs-corner-tr opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 pointer-events-none z-10 vhs-corner-bl opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 pointer-events-none z-10 vhs-corner-br opacity-20"></div>
        <div className="absolute inset-0 pointer-events-none terminal-noise opacity-5"></div>
        <div className="absolute inset-0 pointer-events-none terminal-vignette"></div>
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
        .terminal-enhanced {
          box-shadow: 
            inset 0 0 25px rgba(51, 255, 51, 0.2),
            0 0 15px rgba(0, 0, 0, 0.5);
          background-color: rgba(17, 17, 17, 0.99);
          background-image: 
            linear-gradient(rgba(0, 110, 0, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 110, 0, 0.05) 1px, transparent 1px);
          background-size: 20px 20px;
          position: relative;
          font-smoothing: never;
          -webkit-font-smoothing: none;
        }
        
        .terminal-enhanced::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          background: linear-gradient(
            135deg,
            rgba(0, 255, 0, 0.05) 0%,
            rgba(0, 0, 0, 0) 50%,
            rgba(0, 255, 0, 0.05) 100%
          );
        }
        
        .terminal-enhanced .xterm-cursor-layer {
          z-index: 2;
        }
        
        .xterm-cursor-block {
          box-shadow: 0 0 8px #fff, 0 0 15px rgba(51, 255, 51, 0.8);
          opacity: 0.8;
        }
        
        .xterm-screen {
          z-index: 1;
        }
        
        /* Improved scanline effect */
        .scanlines {
          background: linear-gradient(
            to bottom,
            transparent 50%,
            rgba(0, 0, 0, 0.3) 51%
          );
          background-size: 100% 4px;
          animation: scanline-scroll 8s linear infinite;
        }
        
        @keyframes scanline-scroll {
          0% { background-position: 0 0; }
          100% { background-position: 0 100px; }
        }
        
        /* Enhanced VHS corner effects */
        .vhs-corner-tl {
          background: radial-gradient(
            circle at top left,
            rgba(51, 255, 51, 0.3) 0%,
            transparent 70%
          );
          animation: glow 3s ease-in-out infinite alternate;
        }
        
        .vhs-corner-tr {
          background: radial-gradient(
            circle at top right,
            rgba(51, 255, 51, 0.3) 0%,
            transparent 70%
          );
          animation: glow 3s ease-in-out infinite alternate-reverse;
        }
        
        .vhs-corner-bl {
          background: radial-gradient(
            circle at bottom left,
            rgba(51, 255, 51, 0.3) 0%,
            transparent 70%
          );
          animation: glow 3s ease-in-out infinite alternate-reverse;
        }
        
        .vhs-corner-br {
          background: radial-gradient(
            circle at bottom right,
            rgba(51, 255, 51, 0.3) 0%,
            transparent 70%
          );
          animation: glow 3s ease-in-out infinite alternate;
        }
        
        @keyframes glow {
          0% { opacity: 0.1; }
          100% { opacity: 0.3; }
        }
        
        /* Static noise effect */
        .terminal-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.05;
        }
        
        /* Vignette effect */
        .terminal-vignette {
          background: radial-gradient(
            ellipse at center,
            transparent 60%,
            rgba(0, 0, 0, 0.6) 100%
          );
        }
        
        /* Button hover effects */
        .hover\\:bg-\\[\\#3C3C3C\\]:hover {
          background-color: #3C3C3C !important;
          box-shadow: 0 0 5px rgba(255, 255, 255, 0.2);
        }
        `}
      </style>
    </div>
  );
};

export default Terminal;
