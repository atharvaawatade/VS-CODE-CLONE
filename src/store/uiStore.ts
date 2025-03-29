import { create } from 'zustand';

// Define the available routes within the application
export type AppRoute = 'editor' | 'settings' | 'extensions' | 'search';

export interface UIStore {
  // Screen state
  isFileExplorerOpen: boolean;
  isChatOpen: boolean;
  isTerminalOpen: boolean;
  isPreviewOpen: boolean;
  isMobileView: boolean;
  
  // Routing state
  currentRoute: AppRoute;
  searchQuery: string;
  
  // Workspace state
  workspaceName: string;
  
  // Chat animation state
  siriAnimationActive: boolean;
  
  // Toggle functions
  toggleFileExplorer: () => void;
  toggleChat: () => void;
  toggleTerminal: () => void;
  togglePreview: () => void;
  
  // Navigation functions
  navigateTo: (route: AppRoute) => void;
  setSearchQuery: (query: string) => void;
  
  // Responsive functions
  setMobileView: (isMobile: boolean) => void;
  
  // Workspace functions
  setWorkspaceName: (name: string) => void;
  
  // Animation functions
  setSiriAnimationActive: (active: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // Initial screen state
  isFileExplorerOpen: true,
  isChatOpen: false,
  isTerminalOpen: false,
  isPreviewOpen: false,
  isMobileView: false,
  
  // Initial routing state
  currentRoute: 'editor',
  searchQuery: '',
  
  // Initial workspace state
  workspaceName: 'My Workspace',
  
  // Initial animation state
  siriAnimationActive: false,
  
  // Toggle functions
  toggleFileExplorer: () => set((state) => ({ isFileExplorerOpen: !state.isFileExplorerOpen })),
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  toggleTerminal: () => set((state) => ({ isTerminalOpen: !state.isTerminalOpen })),
  togglePreview: () => set((state) => ({ isPreviewOpen: !state.isPreviewOpen })),
  
  // Navigation functions
  navigateTo: (route) => set({ currentRoute: route }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  // Responsive functions
  setMobileView: (isMobile) => set({ isMobileView: isMobile }),
  
  // Workspace functions
  setWorkspaceName: (name) => set({ workspaceName: name }),
  
  // Animation functions
  setSiriAnimationActive: (active) => set({ siriAnimationActive: active }),
}));