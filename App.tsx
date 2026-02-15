
import React, { useState, useEffect, useCallback } from 'react';
import { WifiCodeRecord, AppState, StatusType, ViewType, Track } from './types';
import { 
  Wifi, ShieldCheck, AlertCircle, Key, Info, Copy, Check, 
  ChevronRight, Lock, Cpu, Volume2, VolumeX, 
  Music, Shuffle, Repeat, Play, X, ListMusic, SkipForward,
  Home, TicketPercent, Clock4, Music2, Trash2
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'kapten_lycel_used_codes';
const BACKGROUND_IMAGE_URL = "https://github.com/nasmusic-ai/RAW/blob/main/family.jpg?raw=true";
const LOGO_IMAGE_URL = "https://github.com/nasmusic-ai/RAW/blob/main/KAPTEN-LYCEL.png?raw=true";

const PLAYLIST: Track[] = [
  { id: '1', name: 'Dragon (Default)', url: "https://raw.githubusercontent.com/nasmusic-ai/RAW/main/DRAGON%20-%20VUP%20(%20Official%20Lyrics%20Video%20).mp3" },
  { id: '2', name: 'Alalay', url: "https://raw.githubusercontent.com/nasmusic-ai/RAW/main/Alalay.mp3" },
  { id: '3', name: 'Kosa', url: "https://raw.githubusercontent.com/nasmusic-ai/RAW/main/kosa.mp3" },
  { id: '4', name: 'Gangster', url: "https://raw.githubusercontent.com/nasmusic-ai/RAW/main/gangsta.mp3" },
  { id: '5', name: 'Pajamas', url: "https://raw.githubusercontent.com/nasmusic-ai/RAW/main/pajamas.mp3" }
];

const PROMOS = [
  { title: "P10.00", desc: "Get 5 hours plus 1 hour codes.", color: "from-orange-500 to-red-500" },
  { title: "P20.00", desc: "Get 1 day plus 1 hour codes.", color: "from-indigo-500 to-purple-600" },
  { title: "P50.00", desc: "Get 4 days plus 1 hour codes.", color: "from-emerald-500 to-teal-600" }
];

class TechAudio {
  bgMusic: HTMLAudioElement | null = null;
  isMuted = false;
  isLoop = false;
  isRandom = false;
  currentTrackId = '1';
  onTrackChange: (id: string) => void = () => {};

  async init(trackId: string = '1') {
    const track = PLAYLIST.find(t => t.id === trackId) || PLAYLIST[0];
    this.currentTrackId = track.id;

    if (this.bgMusic) {
      this.bgMusic.pause();
      this.bgMusic = null;
    }

    this.bgMusic = new Audio();
    this.bgMusic.src = track.url;
    this.bgMusic.loop = this.isLoop;
    this.bgMusic.volume = 0.2;
    this.bgMusic.muted = this.isMuted;
    this.bgMusic.crossOrigin = "anonymous";
    
    this.bgMusic.onended = () => {
      if (!this.isLoop) {
        this.nextTrack();
      }
    };

    try {
      await this.bgMusic.play();
    } catch (err) {
      console.warn("Audio playback blocked by browser policies.");
    }
  }

  nextTrack() {
    let nextId = this.currentTrackId;
    if (this.isRandom) {
      const otherTracks = PLAYLIST.filter(t => t.id !== this.currentTrackId);
      nextId = otherTracks[Math.floor(Math.random() * otherTracks.length)].id;
    } else {
      const currentIndex = PLAYLIST.findIndex(t => t.id === this.currentTrackId);
      nextId = PLAYLIST[(currentIndex + 1) % PLAYLIST.length].id;
    }
    this.init(nextId);
    this.onTrackChange(nextId);
  }

  setMute(mute: boolean) {
    this.isMuted = mute;
    if (this.bgMusic) this.bgMusic.muted = mute;
  }

  setLoop(loop: boolean) {
    this.isLoop = loop;
    if (this.bgMusic) this.bgMusic.loop = loop;
  }

  setRandom(random: boolean) {
    this.isRandom = random;
  }
}

const audioInstance = new TechAudio();

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    view: 'welcome',
    input: '',
    result: null,
    status: 'idle',
    loading: false,
    showMusicGallery: false,
    isRandom: false,
    isLoop: false,
    currentTrackId: '1'
  });
  
  const [usedCodes, setUsedCodes] = useState<string[]>([]);
  const [database, setDatabase] = useState<WifiCodeRecord[]>([]);
  const [showInstructions, setShowInstructions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('./codes.json');
        if (!response.ok) throw new Error('Failed to load database');
        const data = await response.json();
        setDatabase(data);
      } catch (err) {
        setDatabase([{ "inputCode": "123456", "outputCode": "SAMPLE" }]);
      }
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) setUsedCodes(JSON.parse(stored));
    };
    loadData();

    audioInstance.onTrackChange = (id) => {
      setState(prev => ({ ...prev, currentTrackId: id }));
    };
  }, []);

  const handleVerify = useCallback(() => {
    const rawInput = state.input.trim();
    if (!rawInput || state.loading) return;

    setState(prev => ({ ...prev, loading: true }));

    setTimeout(() => {
      const normalizedInput = rawInput.toUpperCase();
      if (usedCodes.includes(normalizedInput)) {
        setState(prev => ({ ...prev, status: 'already-used', result: null, loading: false }));
        return;
      }

      const found = database.find(item => item.inputCode.toUpperCase() === normalizedInput);
      if (found) {
        const newUsedCodes = [...usedCodes, normalizedInput];
        setUsedCodes(newUsedCodes);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newUsedCodes));
        setState(prev => ({ ...prev, status: 'success', result: found.outputCode, loading: false }));
      } else {
        setState(prev => ({ ...prev, status: 'invalid', result: null, loading: false }));
      }
    }, 1500);
  }, [state.input, state.loading, database, usedCodes]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearHistory = () => {
    if (confirm("Clear all burned codes from history?")) {
      setUsedCodes([]);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  const reset = () => {
    setState(prev => ({ ...prev, input: '', result: null, status: 'idle', loading: false }));
    setCopied(false);
  };

  const enterSystem = async () => {
    await audioInstance.init();
    setState(prev => ({ ...prev, view: 'home' }));
  };

  const setView = (view: ViewType) => {
    setState(prev => ({ ...prev, view }));
  };

  const toggleMute = () => {
    const newMute = !isMuted;
    setIsMuted(newMute);
    audioInstance.setMute(newMute);
  };

  const toggleRandom = () => {
    const newVal = !state.isRandom;
    setState(prev => ({ ...prev, isRandom: newVal }));
    audioInstance.setRandom(newVal);
  };

  const toggleLoop = () => {
    const newVal = !state.isLoop;
    setState(prev => ({ ...prev, isLoop: newVal }));
    audioInstance.setLoop(newVal);
  };

  const playTrack = async (id: string) => {
    setState(prev => ({ ...prev, currentTrackId: id }));
    await audioInstance.init(id);
  };

  // Shared Background Wrapper
  const PageWrapper = ({ children, hideFooter = false }: { children: React.ReactNode, hideFooter?: boolean }) => (
    <div className={`min-h-screen relative flex flex-col overflow-x-hidden ${!hideFooter ? 'pt-16 pb-24' : ''}`}>
      {/* Background Image with Overlay */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center transition-transform duration-[10s] ease-linear pointer-events-none"
        style={{ backgroundImage: `url(${BACKGROUND_IMAGE_URL})` }}
      />
      <div className="fixed inset-0 z-0 bg-slate-950/80 backdrop-blur-[2px] pointer-events-none" />
      
      {/* Animated Glowing Orbs */}
      <div className="fixed -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="fixed -bottom-24 -right-24 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );

  // Welcome Screen
  if (state.view === 'welcome') {
    return (
      <PageWrapper hideFooter>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500"></div>

          <div className="relative mb-12 animate-logo-float">
            <div className="absolute inset-0 bg-blue-500/30 blur-3xl rounded-full scale-150 animate-pulse"></div>
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 bg-slate-900/90 border-2 border-blue-500/40 rounded-[2.5rem] sm:rounded-[3rem] flex items-center justify-center shadow-2xl overflow-hidden group shimmer-effect p-4">
               <img 
                src={LOGO_IMAGE_URL} 
                alt="Kapten Lycel Logo" 
                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <Wifi className="text-blue-400 w-16 h-16 sm:w-20 sm:h-20 absolute group-hover:scale-110 transition-transform duration-500 pointer-events-none opacity-20" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-slate-900 p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-blue-500/30 shadow-2xl">
              <Lock className="text-emerald-400 w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tighter mb-4 leading-none">
            KAPTEN / <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">LYCEL</span>
          </h1>
          <p className="text-slate-300 font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase text-xs sm:text-sm mb-12 flex items-center gap-4">
            <span className="w-6 sm:w-8 h-px bg-slate-700"></span>
            Network Services
            <span className="w-6 sm:w-8 h-px bg-slate-700"></span>
          </p>

          <button
            onClick={enterSystem}
            className="group relative flex items-center gap-4 sm:gap-6 bg-white text-slate-950 px-10 py-5 sm:px-12 sm:py-6 rounded-[2rem] font-black text-xl sm:text-2xl hover:bg-blue-50 transition-all active:scale-95 shadow-2xl shadow-blue-500/30"
          >
            Enter System
            <div className="bg-slate-950 rounded-full p-2 group-hover:translate-x-2 transition-transform duration-300">
              <ChevronRight className="text-white w-6 h-6 sm:w-7 sm:h-7" />
            </div>
          </button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Header */}
      <header className="fixed top-0 w-full h-16 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 flex items-center px-6 justify-between z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 border border-white/10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden p-1.5">
            <img 
              src={LOGO_IMAGE_URL} 
              alt="Logo" 
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/wifi.svg';
              }}
            />
          </div>
          <span className="text-lg font-black text-white tracking-tighter uppercase">
            Kapten / <span className="text-blue-400">Lycel</span>
          </span>
        </div>
        <button 
          onClick={toggleMute}
          className="p-2.5 bg-slate-900/50 border border-white/10 rounded-xl text-slate-300 hover:text-white transition-all active:scale-90"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:py-10">
        
        {state.view === 'home' && (
          <div className="w-full max-w-md mx-auto space-y-8 animate-in slide-in-from-bottom-6 duration-500">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white tracking-tight">Access <span className="text-blue-400">Portal</span></h2>
              <p className="text-slate-400 text-sm mt-2 font-medium">Identify and unlock your network session</p>
            </div>

            <div className="glass-card rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden border border-white/10">
              {state.status !== 'success' ? (
                <div className="space-y-6">
                  <div className="relative">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 block ml-1">Redeem Voucher</label>
                    <div className="relative group overflow-hidden rounded-2xl">
                      {state.loading && <div className="scan-line"></div>}
                      <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors w-6 h-6 z-10" />
                      <input
                        type="text"
                        inputMode="numeric"
                        value={state.input}
                        disabled={state.loading}
                        autoFocus
                        onChange={(e) => setState(prev => ({ ...prev, input: e.target.value, status: 'idle' }))}
                        placeholder="000000"
                        className="w-full bg-slate-950/60 border border-slate-700 text-white pl-14 pr-6 py-5 rounded-2xl outline-none transition-all text-2xl font-mono tracking-widest focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                      />
                    </div>
                  </div>

                  {state.status === 'invalid' && (
                    <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 animate-in fade-in zoom-in-95">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-sm font-bold">Key not found in database</span>
                    </div>
                  )}

                  {state.status === 'already-used' && (
                    <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400 animate-in fade-in zoom-in-95">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-sm font-bold">This session is already active</span>
                    </div>
                  )}

                  <button
                    onClick={handleVerify}
                    disabled={state.loading || !state.input.trim()}
                    className={`w-full py-5 rounded-2xl font-black text-xl transition-all h-20 flex items-center justify-center gap-3 active:scale-95 ${
                      state.loading || !state.input.trim()
                        ? 'bg-slate-800/50 text-slate-600 border border-slate-700' 
                        : 'bg-blue-600 hover:bg-white hover:text-slate-950 text-white shadow-xl shadow-blue-600/20'
                    }`}
                  >
                    {state.loading ? (
                      <div className="flex items-center gap-3">
                        <Cpu className="w-6 h-6 animate-spin" />
                        <span className="text-sm uppercase tracking-widest">Validating...</span>
                      </div>
                    ) : 'Unlock Now'}
                  </button>
                </div>
              ) : (
                <div className="text-center py-4 animate-in zoom-in-95 duration-300">
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                    <ShieldCheck className="text-emerald-400 w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Verified</h2>
                  <p className="text-slate-400 mb-8 text-sm italic">"Voucher session initiated"</p>
                  
                  <div 
                    onClick={() => copyToClipboard(state.result || '')}
                    className="bg-slate-950/80 border border-white/10 p-8 rounded-3xl mb-8 group relative cursor-pointer hover:border-blue-500/50 transition-all active:scale-95"
                  >
                    <div className="absolute top-3 right-3">
                      {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-slate-600" />}
                    </div>
                    <span className="text-4xl font-mono font-black text-blue-400 tracking-widest drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                      {state.result}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-4 uppercase tracking-[0.3em] font-black">{copied ? 'Copied!' : 'Tap to Copy Code'}</p>
                  </div>

                  <button onClick={reset} className="text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em] border-b border-transparent hover:border-slate-500 pb-1">
                    Enter New Session
                  </button>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setShowInstructions(true)}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors text-[10px] font-black uppercase tracking-widest mx-auto px-4 py-2 bg-slate-900/40 rounded-full border border-white/5 active:scale-90"
            >
              <Info className="w-4 h-4" /> System Policy
            </button>
          </div>
        )}

        {state.view === 'promo' && (
          <div className="w-full max-w-md mx-auto space-y-6 animate-in slide-in-from-right-6 duration-500 pb-8">
            <h2 className="text-3xl font-bold text-white mb-8">Exclusive <span className="text-purple-400">Plans</span></h2>
            {PROMOS.map((promo, i) => (
              <div key={i} className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-6 relative overflow-hidden group hover:bg-slate-900/80 transition-all">
                <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${promo.color}`}></div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-2xl font-black text-white">{promo.title}</h4>
                    <p className="text-slate-400 text-sm mt-2 font-medium leading-relaxed">{promo.desc}</p>
                  </div>
                  <TicketPercent className="w-10 h-10 text-slate-700/50" />
                </div>
                <button className="mt-8 w-full py-4 bg-slate-800/80 hover:bg-white hover:text-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg">
                  Check Eligibility
                </button>
              </div>
            ))}
          </div>
        )}

        {state.view === 'history' && (
          <div className="w-full max-w-md mx-auto space-y-6 animate-in slide-in-from-left-6 duration-500 pb-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white">Validation <span className="text-emerald-400">History</span></h2>
              {usedCodes.length > 0 && (
                <button onClick={clearHistory} className="p-2.5 text-slate-500 hover:text-red-400 bg-slate-900/50 rounded-xl border border-white/5 transition-colors active:scale-90">
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {usedCodes.length === 0 ? (
              <div className="text-center py-24 bg-slate-900/40 rounded-[3rem] border border-dashed border-white/10">
                <Clock4 className="w-14 h-14 text-slate-800 mx-auto mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Zero Sessions Detected</p>
              </div>
            ) : (
              <div className="space-y-4">
                {usedCodes.slice().reverse().map((code, i) => (
                  <div key={i} className="bg-slate-950/60 backdrop-blur-sm border border-white/10 p-5 rounded-3xl flex items-center justify-between group hover:border-emerald-500/30 transition-all active:scale-[0.98]">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                        <Check className="text-emerald-500 w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-white font-mono font-bold tracking-wider text-lg">{code}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-0.5">Session Burned</p>
                      </div>
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40 animate-pulse"></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {state.view === 'gallery' && (
          <div className="w-full max-w-md mx-auto space-y-6 animate-in zoom-in-95 duration-500 pb-8">
            <h2 className="text-3xl font-bold text-white mb-8">Audio <span className="text-blue-400">Gallery</span></h2>
            
            <div className="grid grid-cols-1 gap-4">
              {PLAYLIST.map((track) => (
                <div 
                  key={track.id}
                  onClick={() => playTrack(track.id)}
                  className={`group flex items-center gap-4 p-5 rounded-[2.5rem] cursor-pointer transition-all border active:scale-[0.97] ${
                    state.currentTrackId === track.id 
                      ? 'bg-blue-600/15 border-blue-600/40' 
                      : 'bg-slate-950/50 border-white/5 hover:border-slate-700/50'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center transition-all ${
                    state.currentTrackId === track.id ? 'bg-blue-600 shadow-xl shadow-blue-600/30' : 'bg-slate-800/80'
                  }`}>
                    {state.currentTrackId === track.id ? (
                      <div className="flex gap-1 items-end h-5">
                        <div className="w-1 bg-white animate-[bounce_0.5s_infinite]"></div>
                        <div className="w-1 bg-white animate-[bounce_0.7s_infinite_0.1s]"></div>
                        <div className="w-1 bg-white animate-[bounce_0.4s_infinite_0.2s]"></div>
                      </div>
                    ) : (
                      <Play className="text-white w-6 h-6 fill-white opacity-60" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold truncate text-lg ${state.currentTrackId === track.id ? 'text-white' : 'text-slate-400'}`}>
                      {track.name}
                    </p>
                    <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mt-0.5">Atmospheric Stream</p>
                  </div>
                  {state.currentTrackId === track.id && (
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-slate-900/80 backdrop-blur-lg rounded-[3rem] p-8 border border-white/10 mt-8 shadow-2xl">
              <div className="flex items-center justify-around">
                <button 
                  onClick={toggleRandom}
                  className={`flex flex-col items-center gap-2 p-4 rounded-3xl transition-all active:scale-90 ${
                    state.isRandom ? 'text-blue-400 bg-blue-400/10' : 'text-slate-600'
                  }`}
                >
                  <Shuffle className="w-6 h-6" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">Random</span>
                </button>
                <button 
                  onClick={() => audioInstance.nextTrack()}
                  className="w-16 h-16 rounded-[1.5rem] bg-slate-800 text-white flex items-center justify-center hover:bg-white hover:text-slate-950 active:scale-90 transition-all shadow-xl"
                >
                  <SkipForward className="w-8 h-8" />
                </button>
                <button 
                  onClick={toggleLoop}
                  className={`flex flex-col items-center gap-2 p-4 rounded-3xl transition-all active:scale-90 ${
                    state.isLoop ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-600'
                  }`}
                >
                  <Repeat className="w-6 h-6" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">Loop</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 w-full h-20 bg-slate-950/90 backdrop-blur-2xl border-t border-white/10 flex items-center justify-around px-4 z-40 pb-safe">
        {[
          { id: 'home', icon: Home, label: 'Portal' },
          { id: 'promo', icon: TicketPercent, label: 'Plans' },
          { id: 'history', icon: Clock4, label: 'History' },
          { id: 'gallery', icon: Music2, label: 'Studio' }
        ].map((item) => (
          <button 
            key={item.id}
            onClick={() => setView(item.id as ViewType)}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all relative active:scale-110 ${
              state.view === item.id ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {state.view === item.id && (
              <div className="absolute top-0 w-10 h-1 bg-blue-500 rounded-b shadow-[0_0_15px_rgba(59,130,246,0.6)]"></div>
            )}
            <item.icon className={`w-6 h-6 ${state.view === item.id ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] mt-1">{item.label}</span>
          </button>
        ))}
      </footer>

      {/* System Guidelines Modal */}
      {showInstructions && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl transition-all animate-in fade-in duration-300">
          <div className="bg-slate-950 border border-white/15 max-w-md w-full rounded-[3rem] p-8 sm:p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-4">
              <div className="p-3 bg-blue-600/20 rounded-2xl">
                <ShieldCheck className="text-blue-400 w-8 h-8" />
              </div>
              Privacy Policy
            </h3>
            <div className="space-y-6 text-slate-400 text-sm leading-relaxed">
              <div className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2 shadow-[0_0_10px_rgba(59,130,246,1)]"></div>
                <p><strong className="text-slate-100">Consumption Protocol:</strong> Validated vouchers are permanently burned to this device profile.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2 shadow-[0_0_10px_rgba(59,130,246,1)]"></div>
                <p><strong className="text-slate-100">Offline Integrity:</strong> No external data transmission occurs during the validation sequence.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2 shadow-[0_0_10px_rgba(59,130,246,1)]"></div>
                <p><strong className="text-slate-100">Session Log:</strong> Burned keys are persistent and can be reviewed in the History tab.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowInstructions(false)}
              className="mt-12 w-full py-5 bg-white text-slate-950 hover:bg-blue-50 rounded-2xl font-black text-lg transition-all shadow-xl active:scale-95"
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default App;
