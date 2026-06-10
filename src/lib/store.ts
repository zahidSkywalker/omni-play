import { create } from 'zustand';

export type Module = 'chat' | 'cowriter' | 'books' | 'knowledge' | 'space' | 'learn';
export type ChatMode = 'chat' | 'solve' | 'quiz' | 'research' | 'visualize';
export type LearnView = 'home' | 'examinations' | 'exam-detail';

interface AppState {
  activeModule: Module;
  sidebarOpen: boolean;
  chatMode: ChatMode;
  activeConversationId: string | null;
  activeDocumentId: string | null;
  activeBookId: string | null;
  activeChapterIndex: number;
  learnView: LearnView;
  selectedExamId: string | null;

  setActiveModule: (module: Module) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setChatMode: (mode: ChatMode) => void;
  setActiveConversationId: (id: string | null) => void;
  setActiveDocumentId: (id: string | null) => void;
  setActiveBookId: (id: string | null) => void;
  setActiveChapterIndex: (index: number) => void;
  setLearnView: (view: LearnView) => void;
  setSelectedExamId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeModule: 'learn',
  sidebarOpen: false,
  chatMode: 'chat',
  activeConversationId: null,
  activeDocumentId: null,
  activeBookId: null,
  activeChapterIndex: 0,
  learnView: 'home',
  selectedExamId: null,

  setActiveModule: (module) => set({ activeModule: module, sidebarOpen: false }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setChatMode: (mode) => set({ chatMode: mode }),
  setActiveConversationId: (id) => set({ activeConversationId: id }),
  setActiveDocumentId: (id) => set({ activeDocumentId: id }),
  setActiveBookId: (id) => set({ activeBookId: id }),
  setActiveChapterIndex: (index) => set({ activeChapterIndex: index }),
  setLearnView: (view) => set({ learnView: view }),
  setSelectedExamId: (id) => set({ selectedExamId: id }),
}));
