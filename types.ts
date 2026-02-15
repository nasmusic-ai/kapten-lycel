
export interface WifiCodeRecord {
  inputCode: string;
  outputCode: string;
}

export interface Track {
  id: string;
  name: string;
  url: string;
}

export type StatusType = 'idle' | 'success' | 'error' | 'already-used' | 'invalid';
export type ViewType = 'welcome' | 'home' | 'promo' | 'history' | 'gallery';

export interface AppState {
  view: ViewType;
  input: string;
  result: string | null;
  status: StatusType;
  loading: boolean;
  showMusicGallery: boolean; // Retained for backwards compatibility/internal state if needed
  isRandom: boolean;
  isLoop: boolean;
  currentTrackId: string;
}
