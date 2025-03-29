import React, { useEffect, useRef } from 'react';
import { useEditorStore } from '../store/editorStore';
import { useUIStore } from '../store/uiStore';
import EditorTabs from './EditorTabs';
import { getLanguageFromFilename } from '../utils/fileUtils';
import * as monaco from 'monaco-editor';

const Editor: React.FC = () => {
  const { tabs, activeTab, updateTabContent } = useEditorStore();
  const { isMobileView } = useUIStore();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!monacoRef.current) return;

    // Define VS Code theme
    monaco.editor.defineTheme('vs-code-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'operator', foreground: 'D4D4D4' },
        { token: 'function', foreground: 'DCDCAA' },
        { token: 'variable', foreground: '9CDCFE' },
        { token: 'type', foreground: '4EC9B0' },
      ],
      colors: {
        'editor.background': '#1E1E1E',
        'editor.foreground': '#D4D4D4',
        'editorCursor.foreground': '#AEAFAD',
        'editor.lineHighlightBackground': '#2D2D30',
        'editorLineNumber.foreground': '#858585',
        'editor.selectionBackground': '#264F78',
        'editor.inactiveSelectionBackground': '#3A3D41',
        'editorIndentGuide.background': '#404040',
      }
    });

    // Set up editor
    const editor = monaco.editor.create(monacoRef.current, {
      automaticLayout: true,
      theme: 'vs-code-dark',
      minimap: { enabled: !isMobileView },
      scrollBeyondLastLine: false,
      fontSize: 14,
      fontFamily: 'Consolas, "Courier New", monospace',
      renderLineHighlight: 'line',
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      matchBrackets: 'always',
      lineNumbers: 'on',
      scrollbar: {
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10,
        useShadows: false
      },
      padding: {
        top: 10,
        bottom: 10
      }
    });

    editorRef.current = editor;

    // Load editor content if there's an active tab
    const activeTabContent = activeTab ? tabs.find(tab => tab.id === activeTab) : null;
    if (activeTabContent) {
      const language = getLanguageFromFilename(activeTabContent.filename);
      const model = monaco.editor.createModel(
        activeTabContent.content,
        language
      );
      editor.setModel(model);
    }

    // Cleanup
    return () => {
      editor.dispose();
    };
  }, [monacoRef, activeTab, isMobileView, tabs]);

  // Update editor content when active tab changes
  useEffect(() => {
    if (!editorRef.current) return;

    const activeTabContent = activeTab ? tabs.find(tab => tab.id === activeTab) : null;
    if (activeTabContent) {
      const language = getLanguageFromFilename(activeTabContent.filename);
      const model = monaco.editor.createModel(
        activeTabContent.content,
        language
      );
      editorRef.current.setModel(model);

      // Listen for content changes
      model.onDidChangeContent(() => {
        if (activeTab) {
          updateTabContent(activeTab, model.getValue());
        }
      });
    } else {
      editorRef.current.setModel(null);
    }
  }, [activeTab, tabs, updateTabContent]);

  return (
    <div className="flex flex-col h-full bg-[#1E1E1E]">
      <EditorTabs />
      <div ref={monacoRef} className="w-full flex-grow" />
    </div>
  );
};

export default Editor; 