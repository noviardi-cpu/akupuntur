
import React, { useState, useEffect, useRef } from 'react';
import { TCM_DB } from '../constants';
import { 
  ArrowRight, Loader2, Info, ChevronDown, Target, Filter, 
  LayoutGrid, Map as MapIcon, X, Search, Activity, 
  BookOpen, Heart, Brain, Zap, Waves, Wind, Mountain, 
  Smile, Frown, AlertCircle, Clock
} from 'lucide-react';
import { WuXingInteractiveDiagram } from './WuXingInteractiveDiagram';

interface Props {
  onSelectSyndrome?: (id: string) => void;
  onGenerateImage?: (prompt: string) => void;
  onShowMap?: () => void;
  isLoading?: boolean;
}

const elements = [
  { 
    name: 'wood', display: 'Wood (Kayu)', 
    color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/50', shadowColor: 'shadow-emerald-900/50',
    keywords: ['Liver', 'Gall', 'Wood', 'Hati', 'Empedu'],
    organs: ['Liver', 'Gall Bladder'],
    tagline: 'Aliran Qi & Fleksibilitas'
  },
  { 
    name: 'fire', display: 'Fire (Api)', 
    color: 'text-rose-400', bgColor: 'bg-rose-500/10', borderColor: 'border-rose-500/50', shadowColor: 'shadow-rose-900/50',
    keywords: ['Heart', 'Small Intestine', 'Pericardium', 'San Jiao', 'Fire', 'Jantung'],
    organs: ['Heart', 'Small Intestine', 'Pericardium', 'San Jiao'],
    tagline: 'Vitalitas & Kesadaran'
  },
  { 
    name: 'earth', display: 'Earth (Tanah)', 
    color: 'text-amber-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-amber-500/50', shadowColor: 'shadow-amber-900/50',
    keywords: ['Spleen', 'Stomach', 'Earth', 'Limpa', 'Lambung'],
    organs: ['Spleen', 'Stomach'],
    tagline: 'Transformasi & Nutrisi'
  },
  { 
    name: 'metal', display: 'Metal (Logam)', 
    color: 'text-slate-100', bgColor: 'bg-slate-400/10', borderColor: 'border-slate-300/50', shadowColor: 'shadow-slate-500/50',
    keywords: ['Lung', 'Large Intestine', 'Metal', 'Paru', 'Usus Besar'],
    organs: ['Lung', 'Large Intestine'],
    tagline: 'Respirasi & Pertahanan'
  },
  { 
    name: 'water', display: 'Water (Air)', 
    color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/50', shadowColor: 'shadow-blue-900/50',
    keywords: ['Kidney', 'Bladder', 'Water', 'Ginjal', 'Kandung Kemih'],
    organs: ['Kidney', 'Bladder'],
    tagline: 'Esensi & Akar Kehidupan'
  },
];

const WuXingMasterPanel: React.FC<Props> = ({ onSelectSyndrome, isLoading = false }) => {
  const [diagramSelection, setDiagramSelection] = useState<string | null>(null);
  const [organFilter, setOrganFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEncyclopedia, setShowEncyclopedia] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const allSyndromes = [
    ...(TCM_DB.syndromes.FILLED_FROM_PDF || []),
    ...(TCM_DB.syndromes.TODO_FROM_PDF || [])
  ];

  const handleElementSelect = (el: string | null) => {
    setOrganFilter(null);
    setDiagramSelection(el);
    if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOrganFilter = (org: string) => {
    setOrganFilter(org);
    const foundEl = elements.find(e => e.organs.includes(org));
    if (foundEl) setDiagramSelection(foundEl.name);
  };

  const clearAllFilters = () => {
    setDiagramSelection(null);
    setOrganFilter(null);
    setSearchQuery('');
  };

  const getFilteredSyndromes = (elName: string) => {
    const el = elements.find(e => e.name === elName);
    if (!el) return [];
    
    return allSyndromes.filter(s => {
      if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match = (s.name_id || "").toLowerCase().includes(q) || 
                        (s.name_en || "").toLowerCase().includes(q);
          if (!match) return false;
      }
      if (organFilter) {
          return (s.primary_organs || []).some(o => o.toLowerCase() === organFilter.toLowerCase());
      }
      if (s.wuxing_element && s.wuxing_element.toLowerCase().startsWith(elName.toLowerCase())) return true;
      const text = (s.name_en || "") + " " + (s.name_id || "") + " " + (s.primary_organs || []).join(" ");
      return el.keywords.some(k => text.toLowerCase().includes(k.toLowerCase()));
    });
  };

  const OrganEncyclopedia = () => (
    <div className="mt-16 space-y-12 animate-fade-in">
      <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
        <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
          <BookOpen className="w-8 h-8 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Zang-Fu Encyclopedia</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">Clinical Organ Reference & Manifestations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {['Liver', 'Spleen', 'Kidney', 'Heart', 'Lung'].map((orgName) => {
          const org = TCM_DB.organ_details[orgName];
          if (!org) return null;
          const el = elements.find(e => e.name.toLowerCase() === org.element.toLowerCase());

          return (
            <div key={orgName} className={`bg-slate-900/40 border-t-4 ${el?.borderColor} rounded-3xl p-8 shadow-2xl transition-all hover:-translate-y-2 group relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-24 h-24 opacity-5 pointer-events-none -mr-4 -mt-4">
                <Activity className="w-full h-full" />
              </div>
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{org.name}</h3>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${el?.color}`}>
                    {org.type} • {org.element}
                  </span>
                </div>
                <div className={`p-4 rounded-2xl ${el?.bgColor} border ${el?.borderColor} shadow-lg`}>
                   {org.name === 'Liver' && <Wind className="w-6 h-6 text-emerald-400" />}
                   {org.name === 'Spleen' && <Mountain className="w-6 h-6 text-amber-400" />}
                   {org.name === 'Kidney' && <Waves className="w-6 h-6 text-blue-400" />}
                   {org.name === 'Heart' && <Heart className="w-6 h-6 text-rose-400" />}
                   {org.name === 'Lung' && <Wind className="w-6 h-6 text-slate-200" />}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 flex items-center gap-2">
                    <Target className="w-3 h-3 text-tcm-primary" /> Main Functions
                  </span>
                  <ul className="space-y-2">
                    {(org.main_functions || []).map((fn, idx) => (
                      <li key={idx} className="text-sm text-slate-300 leading-relaxed flex items-start gap-2">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-700 shrink-0"></span>
                        {fn}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800">
                      <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">Emotion</span>
                      <div className="flex items-center gap-2">
                         <Smile className="w-3 h-3 text-amber-400" />
                         <span className="text-xs font-bold text-slate-200">{org.emotion}</span>
                      </div>
                   </div>
                   <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800">
                      <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">Spirit (Shen)</span>
                      <span className="text-xs font-bold text-slate-200">
                        {org.name === 'Liver' ? 'Hun' : org.name === 'Heart' ? 'Shen' : org.name === 'Spleen' ? 'Yi' : org.name === 'Lung' ? 'Po' : 'Zhi'}
                      </span>
                   </div>
                </div>

                <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-y-3">
                   <div>
                      <span className="text-[8px] font-black text-slate-600 uppercase block">Sense Organ</span>
                      <span className="text-xs font-bold text-slate-400">{org.sense_organ}</span>
                   </div>
                   <div>
                      <span className="text-[8px] font-black text-slate-600 uppercase block">Tissues</span>
                      <span className="text-xs font-bold text-slate-400">{org.tissues}</span>
                   </div>
                   <div>
                      <span className="text-[8px] font-black text-slate-600 uppercase block">Flavor</span>
                      <span className="text-xs font-bold text-slate-400">{org.flavor}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-slate-600" />
                      <span className="text-xs font-bold text-slate-400">{org.time_of_day}</span>
                   </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-black text-white p-6 animate-fade-in">
        <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mb-6" />
        <h3 className="text-2xl font-bold text-emerald-400 tracking-wider">TCM Wu Xing Master</h3>
        <p className="text-slate-500 text-sm mt-2 font-mono uppercase tracking-widest">Architecting Elemental Dynamics...</p>
      </div>
    );
  }

  const activeElementData = diagramSelection 
    ? elements.find(e => e.name.toLowerCase() === diagramSelection.toLowerCase()) 
    : null;

  return (
    <div className="h-full bg-black text-white flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* MAP SECTION */}
      <div className="w-full md:w-[45%] lg:w-[420px] border-r border-slate-800 bg-slate-900/40 flex flex-col h-[450px] md:h-full shrink-0">
         <div className="p-4 md:p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/90 backdrop-blur-md z-10">
            <div>
               <h3 className="text-xl font-black text-emerald-400 flex items-center gap-2">
                 <MapIcon className="w-5 h-5" /> Elemental Map
               </h3>
               <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em]">Five Elements Cycle</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowEncyclopedia(!showEncyclopedia)} 
                className={`p-2 rounded-xl border transition-all ${showEncyclopedia ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                title="Toggle Encyclopedia"
              >
                <BookOpen className="w-4 h-4" />
              </button>
              {(diagramSelection || organFilter || searchQuery) && (
                <button onClick={clearAllFilters} className="text-[10px] font-bold text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 transition-all">
                    <X className="w-3 h-3" /> Reset
                </button>
              )}
            </div>
         </div>
         
         <div className="flex-1 min-h-0">
            <WuXingInteractiveDiagram 
                embedded={true} 
                className="h-full w-full" 
                onElementSelect={handleElementSelect}
                initialHighlight={diagramSelection}
            />
         </div>

         {/* Organ Fast-Switch */}
         <div className="p-4 border-t border-slate-800 bg-slate-900/50 overflow-x-auto scrollbar-hide shrink-0">
            <div className="flex gap-2 min-w-max">
               {['Liver', 'Heart', 'Spleen', 'Lung', 'Kidney'].map(org => (
                 <button 
                    key={org}
                    onClick={() => handleOrganFilter(org)}
                    className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                        organFilter === org 
                        ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-900/40' 
                        : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500'
                    }`}
                 >
                    {org}
                 </button>
               ))}
            </div>
         </div>
      </div>

      {/* SYNDROMES CONTENT */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-black scroll-smooth scrollbar-hide">
         
         {/* Search & Header */}
         <div className="sticky top-0 z-20 bg-black/90 backdrop-blur-md border-b border-slate-900 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
                            {showEncyclopedia ? (
                              <><span className="text-indigo-400">Knowledge</span> Base</>
                            ) : diagramSelection ? (
                                <>
                                    <span className={activeElementData?.color}>{diagramSelection}</span> 
                                    <span className="text-slate-600"> Patterns</span>
                                </>
                            ) : (
                                <>Syndrome <span className="text-emerald-500">Master</span></>
                            )}
                        </h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                            <Activity className="w-3 h-3" />
                            {showEncyclopedia ? 'Theoretical Reference Library' : organFilter ? `Focusing on ${organFilter} Pathology` : 'Integrated Elemental Differentiation'}
                        </p>
                    </div>
                    
                    {!showEncyclopedia && (
                      <div className="relative w-full md:w-72">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input 
                              type="text"
                              placeholder="Search syndrome..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 focus:border-emerald-500 outline-none transition-all"
                          />
                      </div>
                    )}
                </div>
            </div>
         </div>

         <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
            {showEncyclopedia ? (
              <OrganEncyclopedia />
            ) : (
              <div className="space-y-16">
                  {(diagramSelection ? [activeElementData!] : elements).map((el) => {
                  const syndromes = getFilteredSyndromes(el.name);
                  
                  return (
                      <div key={el.name} className="animate-fade-in">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-slate-900 pb-4 gap-4">
                          <div>
                              <h3 className={`text-2xl font-black uppercase tracking-[0.2em] ${el.color}`}>{el.display}</h3>
                              <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">{el.tagline}</p>
                          </div>
                          <div className="flex items-center gap-2">
                              <span className="text-[10px] bg-slate-900 text-slate-400 px-3 py-1 rounded-full border border-slate-800 font-black uppercase tracking-widest flex items-center gap-2">
                                  <BookOpen className="w-3 h-3" /> {syndromes.length} pola klinis
                              </span>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                          {syndromes.map(s => (
                          <div 
                              key={s.id}
                              onClick={() => onSelectSyndrome?.(s.id)}
                              className={`bg-slate-900/30 hover:bg-slate-800/60 p-6 rounded-3xl border border-slate-800/60 hover:border-white/20 cursor-pointer transition-all group flex flex-col gap-4 shadow-xl active:scale-[0.98] ${el.borderColor}`}
                          >
                              <div className="flex items-start justify-between">
                                  <div className={`p-4 rounded-2xl bg-black border border-slate-800 shadow-inner group-hover:scale-105 transition-transform ${el.color}`}>
                                      <Target className="w-6 h-6" />
                                  </div>
                                  <div className="flex gap-1">
                                      {(s.primary_organs || []).slice(0, 2).map(org => (
                                          <span key={org} className="px-2 py-0.5 rounded-lg bg-slate-800/80 text-[8px] text-slate-500 font-black uppercase tracking-widest">{org}</span>
                                      ))}
                                  </div>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-white text-lg leading-tight group-hover:text-tcm-primary transition-colors mb-1">{s.name_id}</h4>
                                  <p className="text-slate-500 text-xs italic mb-4 truncate">{s.name_en}</p>
                                  
                                  {s.key_symptoms && s.key_symptoms.length > 0 && (
                                      <div className="flex flex-wrap gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                          {(s.key_symptoms || []).slice(0, 3).map(ks => (
                                              <span key={ks} className="px-2 py-0.5 bg-slate-950 text-[9px] text-slate-400 rounded-md border border-slate-800 uppercase font-bold tracking-tighter">{ks}</span>
                                          ))}
                                      </div>
                                  )}
                              </div>
                              
                              <div className="pt-4 border-t border-slate-800/50 flex items-center justify-between text-slate-600 group-hover:text-white transition-colors">
                                  <span className="text-[10px] font-bold uppercase tracking-widest">Detail Diferensiasi</span>
                                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                              </div>
                          </div>
                          ))}

                          {syndromes.length === 0 && (
                          <div className="col-span-full py-20 px-6 border-2 border-dashed border-slate-900 rounded-3xl flex flex-col items-center justify-center text-slate-700">
                              <Info className="w-12 h-12 mb-4 opacity-10" />
                              <p className="text-sm font-bold uppercase tracking-widest">No matching patterns found</p>
                              <p className="text-[10px] mt-1 text-slate-800">Try clearing filters or search query.</p>
                          </div>
                          )}
                      </div>
                      </div>
                  );
                  })}
              </div>
            )}

            <div className="mt-32 py-20 border-t border-slate-900 text-center">
                <p className="text-[10px] text-slate-800 uppercase tracking-[0.5em] font-black font-mono">
                    TCM Wu Xing Master Pro v{TCM_DB.metadata.version}
                </p>
                <p className="text-[9px] text-slate-900 mt-2 uppercase font-bold">Comprehensive Elemental Theory & Syndrome Mapping</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default WuXingMasterPanel;
