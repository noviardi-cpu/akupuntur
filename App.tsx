
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Activity, MessageSquare, Stethoscope, Archive, Compass, 
  LogOut, ClipboardList, Loader2, Menu, 
  X, Paperclip, Sparkles, Trash2, Eye, Accessibility, ZoomIn, ZoomOut, Contrast, Type, Check
} from 'lucide-react';
import { Language, ChatMessage, ScoredSyndrome, UserAccount, TcmDiagnosisResult } from './types';
import { sendMessageToGeminiStream, performVisionOCR } from './services/geminiService';
import { analyzePatient } from './services/tcmLogic';
import { db, DEFAULT_ADMIN } from './services/db';
import DiagnosisCard from './components/DiagnosisCard';
import PatientFormModal from './components/PatientFormModal';
import WuXingVisualizerModal from './components/WuXingVisualizerModal';
import ScoringAndPointsHub from './components/ScoringAndPointsHub';
import WuXingMasterPanel from './components/WuXingMasterPanel';
import LoginScreen from './components/LoginScreen';
import PatientArchivePanel from './components/PatientArchivePanel';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('tcm_active_session');
    return saved ? JSON.parse(saved) : DEFAULT_ADMIN;
  });

  // Accessibility States - ENHANCED for Elderly
  const [uiScale, setUiScale] = useState(1); // Scale from 1 to 2.5 (250%)
  const [highContrast, setHighContrast] = useState(false);
  const [boldText, setBoldText] = useState(false);
  const [showA11yMenu, setShowA11yMenu] = useState(false);

  const [activePanel, setActivePanel] = useState<'chat' | 'diagnosis' | 'wuxing' | 'ukom' | 'archive'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'model', text: 'Sistem Siap. Masukkan keluhan pasien atau lampirkan foto rekam medis untuk dipindai.', timestamp: new Date() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isVisualizerOpen, setIsVisualizerOpen] = useState(false);
  const [cdssResults, setCdssResults] = useState<ScoredSyndrome[]>([]);
  const [lastPatientForm, setLastPatientForm] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setSelectedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (textOverride?: string, analysis?: ScoredSyndrome[]) => {
    let textToSend = textOverride || inputText;
    if (selectedImage && !isScanning) {
      setIsScanning(true);
      try {
        const extractedText = await performVisionOCR(selectedImage);
        textToSend = textToSend ? `${textToSend}\n\nHasil Scan:\n${extractedText}` : extractedText;
        setInputText(textToSend);
        setSelectedImage(null);
        setIsScanning(false);
      } catch (err) {
        setIsScanning(false);
        alert("Gagal memindai gambar.");
        return;
      }
    }

    if (!textToSend.trim() || isLoading) return;

    setIsLoading(true);
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: textToSend, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    const botMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: "Menganalisis pola meridian dan sindrom...", timestamp: new Date() }]);

    try {
      const response = await sendMessageToGeminiStream(textToSend, undefined, messages, Language.INDONESIAN, false, analysis || cdssResults);
      setMessages(prev => prev.map(m => m.id === botMsgId ? { 
        ...m, 
        text: response.conversationalResponse || "Analisis Berhasil Selesai.", 
        tcmResult: response.diagnosis 
      } : m));
    } catch (error) {
      setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: "Gagal memproses data.", isError: true } : m));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (data: any) => {
    setLastPatientForm(data);
    const results = analyzePatient({ symptoms: data.symptoms, tongue: data.tongue, pulse: data.pulse });
    setCdssResults(results);
    setActivePanel('chat');
    const msg = `PASIEN: ${data.patientName}, USIA: ${data.age}. KELUHAN: ${data.complaint}.`;
    handleSendMessage(msg, results);
  };

  if (!currentUser) return <LoginScreen onLoginSuccess={setCurrentUser} />;

  // Global styling injected via JS object to affect everything
  const globalStyle = {
    fontSize: `${uiScale * 100}%`,
    fontWeight: boldText ? '700' : 'normal',
  };

  return (
    <div 
      style={globalStyle}
      className={`flex h-screen overflow-hidden font-sans transition-all duration-300 ${highContrast ? 'bg-black text-yellow-400' : 'bg-slate-950 text-slate-100'}`}
    >
      <PatientFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSubmit={handleFormSubmit} />
      <WuXingVisualizerModal isOpen={isVisualizerOpen} onClose={() => setIsVisualizerOpen(false)} />

      {/* Accessibility Floating Menu - ENHANCED */}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3 print:hidden">
        {showA11yMenu && (
          <div className="bg-slate-900 border-2 border-slate-700 p-8 rounded-[3rem] shadow-2xl animate-slide-in-up w-80 space-y-8 mb-4">
             <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h4 className="text-sm font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                    <Accessibility className="w-5 h-5" /> Menu Penglihatan
                </h4>
                <button onClick={() => setShowA11yMenu(false)} className="text-slate-500 hover:text-white"><X className="w-6 h-6"/></button>
             </div>
             
             {/* Extended Zoom Control */}
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-slate-400">Ukuran Layar</span>
                    <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-black">{Math.round(uiScale * 100)}%</span>
                </div>
                
                {/* Fast Presets for Elderly */}
                <div className="grid grid-cols-3 gap-2">
                   <button 
                      onClick={() => setUiScale(1)}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase border transition-all ${uiScale === 1 ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                   >
                     Kecil
                   </button>
                   <button 
                      onClick={() => setUiScale(1.5)}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase border transition-all ${uiScale === 1.5 ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                   >
                     Besar
                   </button>
                   <button 
                      onClick={() => setUiScale(2.2)}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase border transition-all ${uiScale >= 2 ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                   >
                     Super
                   </button>
                </div>

                <div className="flex items-center gap-4">
                   <button 
                    onClick={() => setUiScale(Math.max(1, uiScale - 0.2))} 
                    className="w-12 h-12 flex items-center justify-center bg-slate-800 rounded-2xl hover:bg-slate-700 transition-all border border-slate-700"
                   >
                     <ZoomOut className="w-6 h-6 text-white"/>
                   </button>
                   <input 
                    type="range" min="1" max="2.5" step="0.1" 
                    value={uiScale} 
                    onChange={(e) => setUiScale(parseFloat(e.target.value))} 
                    className="flex-1 h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-500" 
                   />
                   <button 
                    onClick={() => setUiScale(Math.min(2.5, uiScale + 0.2))} 
                    className="w-12 h-12 flex items-center justify-center bg-slate-800 rounded-2xl hover:bg-slate-700 transition-all border border-slate-700"
                   >
                     <ZoomIn className="w-6 h-6 text-white"/>
                   </button>
                </div>
             </div>

             {/* Toggles */}
             <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setHighContrast(!highContrast)}
                  className={`flex flex-col items-center gap-3 p-5 rounded-3xl border-2 transition-all ${highContrast ? 'bg-yellow-400 border-yellow-500 text-black' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                >
                   <Contrast className="w-6 h-6" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Kontras</span>
                </button>
                <button 
                  onClick={() => setBoldText(!boldText)}
                  className={`flex flex-col items-center gap-3 p-5 rounded-3xl border-2 transition-all ${boldText ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                >
                   <Type className="w-6 h-6" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Tebal</span>
                </button>
             </div>

             <button 
              onClick={() => {setUiScale(1); setHighContrast(false); setBoldText(false);}}
              className="w-full py-4 bg-slate-950 text-slate-500 text-xs font-black uppercase tracking-widest rounded-2xl border border-slate-800 hover:text-white transition-colors"
             >
                Kembalikan Normal
             </button>
          </div>
        )}
        <button 
          onClick={() => setShowA11yMenu(!showA11yMenu)}
          className={`w-20 h-20 rounded-full shadow-2xl flex items-center justify-center transition-all active:scale-90 border-4 ${showA11yMenu ? 'bg-emerald-600 border-emerald-400 animate-none' : 'bg-indigo-600 border-indigo-400 animate-bounce'}`}
        >
          {showA11yMenu ? <X className="text-white w-10 h-10" /> : <Accessibility className="text-white w-10 h-10" />}
        </button>
      </div>

      {/* Sidebar - Scales with globalStyle */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 border-r transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col ${highContrast ? 'bg-black border-yellow-400/30' : 'bg-slate-900 border-slate-800'}`}>
        <div className="p-6 flex justify-between items-center border-b border-slate-800">
           <h1 className={`text-xl font-black flex items-center gap-2 tracking-tighter ${highContrast ? 'text-yellow-400' : 'text-tcm-primary'}`}><Activity className="w-6 h-6" /> TCM PRO</h1>
           <button onClick={() => setIsSidebarOpen(false)} className="md:hidden"><X className="w-6 h-6"/></button>
        </div>
        <nav className="flex-1 p-4 space-y-3 overflow-y-auto scrollbar-hide">
           <button onClick={() => {setActivePanel('chat'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-4 p-4 rounded-2xl text-sm font-black transition-colors ${activePanel === 'chat' ? (highContrast ? 'bg-yellow-400 text-black' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40') : 'text-slate-400 hover:bg-slate-800'}`}><MessageSquare className="w-5 h-5" /> Chat Diagnosa</button>
           <button onClick={() => {setActivePanel('diagnosis'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-4 p-4 rounded-2xl text-sm font-black transition-colors ${activePanel === 'diagnosis' ? (highContrast ? 'bg-yellow-400 text-black' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40') : 'text-slate-400 hover:bg-slate-800'}`}><Stethoscope className="w-5 h-5" /> CDSS Auto-Rx</button>
           <button onClick={() => {setActivePanel('wuxing'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-4 p-4 rounded-2xl text-sm font-black transition-colors ${activePanel === 'wuxing' ? (highContrast ? 'bg-yellow-400 text-black' : 'bg-pink-600 text-white shadow-lg shadow-pink-900/40') : 'text-slate-400 hover:bg-slate-800'}`}><Compass className="w-5 h-5" /> Wu Xing Master</button>
           <button onClick={() => {setActivePanel('archive'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-4 p-4 rounded-2xl text-sm font-black transition-colors ${activePanel === 'archive' ? (highContrast ? 'bg-yellow-400 text-black' : 'bg-slate-700 text-white') : 'text-slate-400 hover:bg-slate-800'}`}><Archive className="w-5 h-5" /> Arsip Pasien</button>
        </nav>
        <div className="p-4 border-t border-slate-800">
           <button onClick={() => setIsFormOpen(true)} className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 ${highContrast ? 'bg-yellow-400 text-black' : 'bg-gradient-to-r from-tcm-primary to-tcm-secondary text-white'}`}>Input Pasien Baru</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="md:hidden p-4 border-b flex justify-between items-center bg-slate-900">
           <button onClick={() => setIsSidebarOpen(true)} className="p-3 bg-slate-800 rounded-xl text-white"><Menu className="w-6 h-6" /></button>
           <h1 className="font-black text-tcm-primary tracking-tighter text-xl">TCM PRO</h1>
           <div className="w-10 h-10 bg-slate-800 rounded-full"></div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-10 scrollbar-hide">
          {activePanel === 'chat' && (
            <div className="max-w-4xl mx-auto space-y-8 pb-32">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  <div className="max-w-[95%] md:max-w-[85%]">
                    <div className={`p-6 md:p-8 rounded-[2.5rem] text-sm leading-relaxed shadow-xl whitespace-pre-wrap ${msg.role === 'user' ? (highContrast ? 'bg-yellow-400 text-black' : 'bg-indigo-600 text-white rounded-tr-none') : (highContrast ? 'bg-black border-4 border-yellow-400 text-yellow-400 rounded-tl-none' : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none')}`}>
                      {msg.text}
                    </div>
                    {msg.tcmResult && (
                      <DiagnosisCard 
                        diagnosis={msg.tcmResult} 
                        isPregnant={false} 
                        onShowVisualizer={() => setIsVisualizerOpen(true)} 
                        patientContext={lastPatientForm} 
                      />
                    )}
                  </div>
                </div>
              ))}
              {(isLoading || isScanning) && (
                <div className="flex justify-start animate-pulse">
                  <div className={`p-6 rounded-[2rem] flex items-center gap-4 ${highContrast ? 'border-4 border-yellow-400' : 'bg-slate-900 border border-slate-800'}`}>
                    <Loader2 className={`w-6 h-6 animate-spin ${highContrast ? 'text-yellow-400' : 'text-tcm-primary'}`} />
                    <span className={`text-xs font-black uppercase tracking-widest ${highContrast ? 'text-yellow-400' : 'text-slate-500'}`}>
                      {isScanning ? 'Membaca Gambar...' : 'Sistem Berpikir...'}
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
          {activePanel === 'diagnosis' && <ScoringAndPointsHub analysis={cdssResults} onAnalyzeRequest={() => setIsFormOpen(true)} patientContext={lastPatientForm} />}
          {activePanel === 'wuxing' && <WuXingMasterPanel />}
          {activePanel === 'archive' && (
            <PatientArchivePanel 
              onLoadPatient={(p) => { 
                setLastPatientForm(p);
                setCdssResults([{syndrome: p.diagnosis as any, score: 100, points: [], warnings: [], rationale: [p.diagnosis.explanation]}]); 
                setActivePanel('chat'); 
              }} 
            />
          )}
        </main>

        {activePanel === 'chat' && (
          <div className={`p-6 md:p-10 border-t sticky bottom-0 z-40 transition-all ${highContrast ? 'bg-black border-yellow-400' : 'bg-slate-900/90 backdrop-blur-2xl border-slate-800'}`}>
            <div className="max-w-4xl mx-auto space-y-6">
              {selectedImage && (
                <div className="flex items-end gap-4 animate-fade-in">
                  <div className="relative group">
                    <img src={selectedImage} className={`w-32 h-32 object-cover rounded-[2rem] border-4 ${highContrast ? 'border-yellow-400' : 'border-indigo-500'} ${isScanning ? 'opacity-50 grayscale' : ''}`} />
                    {!isScanning && (
                      <button 
                        onClick={() => setSelectedImage(null)} 
                        className="absolute -top-3 -right-3 bg-rose-600 text-white p-2 rounded-full shadow-2xl hover:scale-110 transition-transform"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${highContrast ? 'bg-yellow-400 text-black' : 'bg-indigo-500/20 text-indigo-400'}`}>
                    <Sparkles className="w-4 h-4 animate-pulse" /> Siap Scan
                  </div>
                </div>
              )}

              <div className="flex gap-4 items-center">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-5 rounded-2xl transition-all border-2 ${highContrast ? 'border-yellow-400 text-yellow-400 bg-black' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'}`}
                  title="Lampirkan foto rekam medis"
                >
                  <Paperclip className="w-6 h-6" />
                </button>
                <input 
                  value={inputText} 
                  onChange={e => setInputText(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()} 
                  placeholder={selectedImage ? "Tekan tombol kirim untuk memindai..." : "Ketik keluhan pasien di sini..."} 
                  className={`flex-1 rounded-[2rem] px-8 py-5 outline-none transition-all text-sm shadow-inner ${highContrast ? 'bg-black border-4 border-yellow-400 text-yellow-400 placeholder:text-yellow-900' : 'bg-slate-950 border border-slate-800 text-white focus:border-tcm-primary'}`} 
                />
                <button 
                  onClick={() => handleSendMessage()} 
                  disabled={isLoading || isScanning || (!inputText.trim() && !selectedImage)}
                  className={`p-6 rounded-[2rem] transition-all shadow-2xl flex items-center gap-3 active:scale-95 ${highContrast ? 'bg-yellow-400 text-black font-black' : 'bg-tcm-primary text-white hover:brightness-110 disabled:opacity-50 disabled:grayscale'}`}
                >
                  {isScanning ? <Loader2 className="w-7 h-7 animate-spin" /> : <Send className="w-7 h-7" />}
                  {uiScale > 1.2 && <span className="font-black uppercase tracking-widest text-xs">Kirim</span>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
