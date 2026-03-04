import { create } from 'zustand';

interface MementoState {
  sessionId: string | null;
  email: string | null;
  images: string[];
  transcript: string[];
  status: 'idle' | 'started' | 'processing' | 'completed' | 'failed';
  pdfUrl: string | null;

  // Actions
  setSession: (sessionId: string, email: string) => void;
  setImages: (images: string[]) => void;
  addTranscriptLine: (line: string) => void;
  setStatus: (status: MementoState['status']) => void;
  setPdfUrl: (url: string | null) => void;
  reset: () => void;
}

export const useStore = create<MementoState>((set) => ({
  sessionId: null,
  email: null,
  images: [],
  transcript: [],
  status: 'idle',
  pdfUrl: null,

  setSession: (sessionId, email) => set({ sessionId, email }),
  setImages: (images) => set({ images }),
  addTranscriptLine: (line) => set((state) => ({
    transcript: [...state.transcript, line]
  })),
  setStatus: (status) => set({ status }),
  setPdfUrl: (url) => set({ pdfUrl: url }),
  reset: () => set({
    sessionId: null,
    email: null,
    images: [],
    transcript: [],
    status: 'idle',
    pdfUrl: null
  }),
}));
