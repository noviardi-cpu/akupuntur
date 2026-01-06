
import React, { useState, useMemo } from 'react';
import { UKOM_QUESTIONS } from '../services/ukomData';
import { Search, GraduationCap, Eye, EyeOff, Filter, ChevronRight, BookOpen, AlertCircle } from 'lucide-react';

const UkomPracticePanel: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string>('All');
  const [visibleAnswers, setVisibleAnswers] = useState<Record<number, boolean>>({});

  const themes = useMemo(() => {
    const set = new Set<string>();
    UKOM_QUESTIONS.forEach(q => q.theme && set.add(q.theme));
    return ['All', ...Array.from(set)];
  }, []);

  const filteredQuestions = useMemo(() => {
    return UKOM_QUESTIONS.filter(q => {
      const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           q.discussion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           q.theme?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTheme = selectedTheme === 'All' || q.theme === selectedTheme;
      return matchesSearch && matchesTheme;
    });
  }, [searchTerm, selectedTheme]);

  const toggleAnswer = (id: number) => {
    setVisibleAnswers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-indigo-900/40 rounded-2xl border border-indigo-500/30">
            <GraduationCap className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">UKOM Akupunktur</h2>
            <p className="text-sm text-slate-400">Latihan Soal & Pembahasan Uji Kompetensi Nasional</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Cari kata kunci (gejala, titik, sindrom)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="w-full md:w-64 relative">
             <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
             <select 
               value={selectedTheme}
               onChange={(e) => setSelectedTheme(e.target.value)}
               className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 appearance-none cursor-pointer outline-none focus:border-indigo-500"
             >
                {themes.map(t => <option key={t} value={t}>{t}</option>)}
             </select>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((q) => (
            <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition-all hover:border-slate-700">
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                   <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-900/20 px-2 py-1 rounded">
                      SOAL #{q.id} {q.theme && `• ${q.theme}`}
                   </span>
                   <button 
                     onClick={() => toggleAnswer(q.id)}
                     className="text-slate-500 hover:text-white transition-colors"
                   >
                      {visibleAnswers[q.id] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                   </button>
                </div>
                
                <p className="text-slate-200 leading-relaxed font-medium mb-5">
                   {q.question}
                </p>

                {q.options && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                     {q.options.map((opt, i) => (
                       <div key={i} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-sm text-slate-400">
                          {opt}
                       </div>
                     ))}
                  </div>
                )}

                {visibleAnswers[q.id] && (
                  <div className="animate-fade-in space-y-4 pt-4 border-t border-slate-800">
                    <div className="bg-emerald-900/20 border border-emerald-500/30 p-4 rounded-xl">
                       <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase mb-2">
                          <ChevronRight className="w-4 h-4" /> Jawaban Benar
                       </div>
                       <p className="text-emerald-50 text-sm font-bold">{q.answer}</p>
                    </div>

                    <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                       <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase mb-2">
                          <BookOpen className="w-4 h-4" /> Pembahasan Klinik
                       </div>
                       <p className="text-slate-300 text-sm leading-relaxed italic">
                          {q.discussion}
                       </p>
                    </div>
                  </div>
                )}

                {!visibleAnswers[q.id] && (
                  <button 
                    onClick={() => toggleAnswer(q.id)}
                    className="w-full py-3 bg-slate-950 hover:bg-indigo-900/20 text-slate-500 hover:text-indigo-400 rounded-xl text-xs font-bold uppercase tracking-widest border border-slate-800 border-dashed transition-all"
                  >
                    Tampilkan Jawaban & Pembahasan
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-600">
             <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
             <p>Tidak ada soal yang ditemukan.</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-900 border-t border-slate-800 text-center">
         <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">
            Total Database: {UKOM_QUESTIONS.length} Cases Integrated
         </p>
      </div>
    </div>
  );
};

export default UkomPracticePanel;
