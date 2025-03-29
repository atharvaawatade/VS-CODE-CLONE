# VS-CODE-CLONE

A fully functional browser-based code editor inspired by Visual Studio Code with AI assistance powered by Google Gemini.

![VS Code Clone Preview](screenshot.png)

## ✨ Features

### 📝 Code Editor
- **Monaco Editor Integration**: The same powerful editor that powers VS Code, with full syntax highlighting for over 50 languages
- **Multiple Tabs**: Open multiple files simultaneously and switch between them
- **Syntax Highlighting**: Automatic language detection based on file extensions
- **IntelliSense**: Code completion, parameter info, and error detection
- **Keyboard Shortcuts**: Familiar VS Code keyboard shortcuts for faster coding

### 🤖 AI Assistant
- **Gemini AI Integration**: Powered by Google's Gemini 2.0 Flash model
- **Context-Aware Suggestions**: The AI analyzes your current file to provide relevant suggestions
- **File-Type Specific Help**: Different suggestions based on file type (HTML, CSS, JavaScript, etc.)
- **Code Generation**: Ask for code snippets, explanations, or refactoring suggestions
- **Syntax Highlighting in Responses**: AI responses include properly formatted code blocks
- **Apply to Editor**: One-click application of AI-suggested code changes to your editor

### 💻 Terminal Emulation
- **Matrix Animation**: Eye-catching green Matrix-style animation on startup
- **Command History**: Navigate through previously entered commands
- **Basic Commands**: Support for commands like `clear`, `ls`, and `echo`
- **Directory Emulation**: Visual representation of a file system structure
- **Custom Prompt**: VS Code-style terminal prompt with emojis based on directory

### 🗂️ File Explorer
- **Hierarchical File Structure**: Familiar tree-view file browser
- **File Icons**: Different icons based on file types
- **Context Menu**: Right-click actions for files and folders
- **File Operations**: Create, rename, and delete files (simulated)
- **Search Files**: Quick filtering of files by name

### 🔍 Search Functionality
- **Global Search**: Search across all files in the workspace
- **Regular Expressions**: Advanced search using regex patterns
- **Case Sensitivity**: Toggle case-sensitive search
- **File Filtering**: Include or exclude files from search

### 📱 Responsive Design
- **Mobile-Friendly**: Adapts to any screen size
- **Touch Controls**: Optimized for touch interfaces
- **Panel Management**: Smart handling of panels on smaller screens
- **Collapsible Sidebar**: Toggle sidebar visibility for more workspace on mobile

### 🎨 VS Code Aesthetic
- **Dark Theme**: Authentic VS Code dark theme experience
- **Status Bar**: Real-time indicators showing file type, cursor position, and more
- **Activity Bar**: Navigation between different views (editor, search, etc.)
- **Customizable Layout**: Resize and toggle different panels

## 🚀 Live Demo

[View Live Demo](https://vs-code-clone.vercel.app)

## 🛠️ Technical Implementation

### Core Technologies
- **React**: Component-based UI development
- **TypeScript**: Type-safe code for better reliability
- **Zustand**: Lightweight state management
- **Monaco Editor**: The code editor that powers VS Code
- **xterm.js**: Terminal emulation
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Vite**: Fast development and optimized builds
- **Google Gemini API**: AI assistance capabilities

### Architecture
- **Store-based State Management**: Using Zustand for predictable state flows
- **Component Modularity**: Each major feature is housed in its own component
- **Responsive Design Patterns**: Mobile-first approach with adaptive layouts
- **Terminal Emulation**: Custom implementation using xterm.js with ANSI escape sequences
- **AI Integration**: RESTful communication with Gemini API using context-aware prompts

## 🏁 Getting Started

### Prerequisites
- Node.js 18+ and npm
- A Google Gemini API key (for AI features)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/atharvaawatade/VS-CODE-CLONE.git
   cd VS-CODE-CLONE
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory:
     ```
     VITE_GEMINI_API_KEY=your_gemini_api_key_here
     ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📖 How to Use

### Basic Editor Navigation
1. Use the file explorer on the left to navigate through files
2. Click on a file to open it in the editor
3. Edit code as you would in VS Code
4. Switch between open files using the tabs at the top

### Using the AI Assistant
1. Click the chat icon in the activity bar to open the AI assistant
2. Type your question or request
3. The AI will analyze your current file and provide context-aware assistance
4. Code snippets in responses can be copied or applied directly to the editor

### Terminal Interaction
1. Click the terminal icon in the status bar to open the terminal
2. Watch the Matrix-style animation on startup
3. Type commands like `clear`, `ls`, or `echo "Hello World"`
4. Use up/down arrow keys to navigate command history

### File Operations
1. Right-click on files or folders in the explorer for context menu options
2. Create new files or folders
3. Search for files using the search box in the explorer
4. Drag and drop files to reorganize (simulated)

### Search Functionality
1. Click the search icon in the activity bar
2. Enter your search query
3. Use regex patterns for advanced searches
4. Toggle case sensitivity as needed
5. Results will display with highlighted matches

## 🌐 Deployment on Vercel

This project is configured for easy deployment on Vercel:

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Add the `VITE_GEMINI_API_KEY` environment variable in the Vercel project settings
4. Deploy!

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_GEMINI_API_KEY` | Google Gemini API key for AI code analysis |

### Getting a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Navigate to "API Keys" in the left menu
4. Click "Create API Key" and copy your key

## 💡 Development Notes

### Monaco Editor Integration
The Monaco Editor is integrated via the `@monaco-editor/react` package, which provides a React wrapper around the editor used in VS Code. Our implementation includes:

- Custom theme matching VS Code's dark theme
- Language auto-detection based on file extensions
- Editor state preservation across tab switches
- Scroll synchronization and minimap

### Terminal Implementation
Our terminal is built using xterm.js with custom animations:

- ANSI escape sequences for colors and cursor positioning
- Custom Matrix-style animation using calculated character streams
- Command history implementation with state management
- Simulated file system interactions

### Gemini API Integration
The AI features leverage Google's Gemini 2.0 Flash model:

- Context-aware prompting by including the current file's content
- Consistent response formatting with proper markdown
- Code block extraction and syntax highlighting
- Direct application of suggested code to the editor

## 🔮 Future Enhancements

- **Extensions Support**: Create a marketplace for simple extensions
- **Git Integration**: Add basic git operations
- **Multiple Themes**: Support for light mode and custom themes
- **Split View Editing**: Edit multiple files side by side
- **Debugger Integration**: Basic debugging capabilities for JavaScript
- **Settings Customization**: User preferences with persistent storage

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by Microsoft's Visual Studio Code
- Icons by Lucide React
- Monaco Editor by Microsoft
- Google Gemini API for AI capabilities
- xterm.js for terminal emulation

---

For any questions or issues, please open a GitHub issue or contact the project maintainers. 
