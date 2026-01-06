
import React, { useMemo, useState, useEffect } from "react";
import {
  Activity, Search, Thermometer, SunMedium, Snowflake, Droplets, Flame, Wind,
  BrainCircuit, ArrowRightCircle, Leaf, Filter, AlertCircle, Layers, Grid
} from "lucide-react";
import { TCM_DB } from "../constants";

type QuadrantId = "DEF_COLD" | "DEF_HEAT" | "EXCESS_COLD" | "EXCESS_HEAT" | "OTHER";

interface Props {
  onSelectSyndrome?: (id: string) => void;
}

const elementColors: Record<string, string> = {
  Wood: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  Fire: "text-rose-400 border-rose-500/30 bg-rose-500/10",
  Earth: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  Metal: "text-slate-100 border-slate-400/30 bg-slate-400/10",
  Water: "text-blue-400 border-blue-500/30 bg-blue-500/10",
};

function classifyQuadrant(patternType: string): QuadrantId {
  const t = (patternType || "").toLowerCase();
  const isDef = t.includes("def") || t.includes("empty");
  const isExcess = t.includes("full") || t.includes("excess") || t.includes("invasion") || t.includes("stagnation");
  const isHeat = t.includes("heat") || t.includes("fire");
  const isCold = t.includes("cold");

  if (isDef && isCold) return "DEF_COLD";
  if (isDef && isHeat) return "DEF_HEAT";
  if (isExcess && isCold) return "EXCESS_COLD";
  if (isExcess && isHeat) return "EXCESS_HEAT";
  return "OTHER";
}

export const SyndromeAtlasWindow: React.FC<Props> = ({ onSelectSyndrome }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeElement, setActiveElement] = useState<string>("ALL");
  const [activeQuadrant, setActiveQuadrant] = useState<QuadrantId | "ALL">("ALL");

  const allSyndromes = useMemo(() => {
    return [
      ...TCM_DB.syndromes.FILLED_FROM_PDF,
      ...TCM_DB.syndromes.TODO_FROM_PDF
    ].map(s => ({
      ...s,
      quadrant: classifyQuadrant(s.pattern_type)
    }));
  }, []);

  const filtered = useMemo(() => {
    return allSyndromes.filter(s => {
      const matchSearch = s.name_id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (s.name_en || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (s.name_zh || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (s.name_pinyin || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchElement = activeElement === "ALL" || s.wuxing_element?.includes(activeElement);
      const matchQuadrant = activeQuadrant === "ALL" || s.quadrant === activeQuadrant;
      return matchSearch && matchElement && matchQuadrant;
    });
  }, [allSyndromes, searchTerm, activeElement, activeQuadrant]);

  const selected = filtered.find(s => s.id === selectedId) || filtered[0];

  const QuadrantHeader = ({ id, label, icon: Icon, color }: { id: QuadrantId, label: string, icon: any, color: string }) => (
    <button 
      onClick={() => setActiveQuadrant(activeQuadrant === id ? "ALL" : id)}
      className={`flex-1 p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
        activeQuadrant === id ? `${color} border-current ring-1 ring-current` : "bg-slate-900 border-slate-800 text-slate-500 grayscale opacity-60"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );

  return (
    <div className="flex h-full bg-black text-white overflow-hidden animate-fade-in">
      
      {/* LEFT: MASTER LIST & DASHBOARD */}
      <aside className="w-full md:w-[400px] flex flex-col border-r border-slate-800 bg-slate-900/20">
         <div className="p-6 border-b border-slate-800">
            <h2 className="text-xl font-black text-emerald-400 flex items-center gap-3 mb-4">
              <Layers className="w-6 h-6" /> Syndrome Atlas
            </h2>
            
            <div className="relative mb-6">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
               <input 
                  type="text"
                  placeholder="Cari pola (Ind/Eng/Zh/Pinyin)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 transition-all"
               />
            </div>

            <div className="flex gap-2 mb-6">
               <QuadrantHeader id="EXCESS_HEAT" label="Excess Heat" icon={Flame} color="text-rose-400 bg-rose-500/10" />
               <QuadrantHeader id="DEF_HEAT" label="Yin Def" icon={SunMedium} color="text-amber-400 bg-amber-500/10" />
               <QuadrantHeader id="EXCESS_COLD" label="Excess Cold" icon={Snowflake} color="text-blue-400 bg-blue-500/10" />
               <QuadrantHeader id="DEF_COLD" label="Yang Def" icon={Droplets} color="text-sky-300 bg-sky-500/10" />
            </div>

            <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
               {["ALL", "Wood", "Fire", "Earth", "Metal", "Water"].map(el => (
                 <button 
                  key={el}
                  onClick={() => setActiveElement(el)}
                  className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase transition-all border ${
                    activeElement === el ? "bg-emerald-500 border-emerald-400 text-black" : "bg-slate-800 border-slate-700 text-slate-400"
                  }`}
                 >
                   {el}
                 </button>
               ))}
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
            {filtered.map(s => (
               <button 
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={`w-full text-left p-4 rounded-2xl transition-all border group ${
                  selected?.id === s.id ? "bg-slate-800 border-emerald-500/50 shadow-lg" : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
                }`}
               >
                 <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">{s.name_id}</span>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${elementColors[s.wuxing_element || ''] || 'text-slate-500'}`}>
                       {s.wuxing_element}
                    </span>
                 </div>
                 <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] text-slate-500 italic truncate flex-1">{s.name_en}</p>
                    {s.name_zh && <span className="text-[11px] font-serif text-emerald-500/80 font-bold ml-2">{s.name_zh}</span>}
                 </div>
                 <div className="flex gap-1">
                    {s.primary_organs?.map(org => (
                      <span key={org} className="text-[8px] px-1.5 py-0.5 bg-slate-950 text-slate-400 rounded-md border border-slate-800">{org}</span>
                    ))}
                 </div>
               </button>
            ))}
            {filtered.length === 0 && (
               <div className="text-center py-20 text-slate-600">
                  <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-xs font-bold uppercase tracking-widest">No patterns found</p>
               </div>
            )}
         </div>
      </aside>

      {/* RIGHT: DETAILED ANALYSIS VIEW */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12 scroll-smooth scrollbar-hide">
        {selected ? (
          <div className="max-w-4xl mx-auto space-y-12 animate-slide-in-right">
             <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-900 pb-8">
                <div className="flex-1">
                   <div className="flex items-center gap-4 mb-2">
                      <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">{selected.name_id}</h1>
                      {selected.name_zh && (
                        <span className="text-3xl md:text-4xl font-serif text-emerald-500/40 font-black">{selected.name_zh}</span>
                      )}
                   </div>
                   <div className="flex items-center gap-3">
                      <span className="text-lg text-slate-500 font-medium italic">{selected.name_en}</span>
                      {selected.name_pinyin && (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-800"></span>
                          <span className="text-sm text-emerald-400/60 font-medium tracking-wide">{selected.name_pinyin}</span>
                        </>
                      )}
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-800"></span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{selected.pattern_type.replace(/_/g, ' ')}</span>
                   </div>
                </div>
                {onSelectSyndrome && (
                  <button 
                    onClick={() => onSelectSyndrome(selected.id)}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-emerald-900/20 transition-all active:scale-95"
                  >
                    <ArrowRightCircle className="w-5 h-5" /> Analyze Now
                  </button>
                )}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="bg-slate-900/30 p-8 rounded-3xl border border-slate-800 shadow-xl">
                   <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                     <Thermometer className="w-4 h-4" /> Clinical Signs
                   </h3>
                   <ul className="space-y-3">
                      {selected.clinical_manifestations?.map((m, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                           <div className="w-1 h-4 bg-emerald-500/50 rounded-full shrink-0 mt-0.5" />
                           {m}
                        </li>
                      ))}
                   </ul>
                   <div className="mt-8 grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                         <span className="text-[9px] font-black text-slate-600 uppercase block mb-1">Tongue</span>
                         <p className="text-xs text-slate-300 font-bold">{selected.tongue?.join(' • ') || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                         <span className="text-[9px] font-black text-slate-600 uppercase block mb-1">Pulse</span>
                         <p className="text-xs text-slate-300 font-bold">{selected.pulse?.join(' • ') || 'N/A'}</p>
                      </div>
                   </div>
                </section>

                <div className="space-y-8">
                   <section className="bg-slate-900/30 p-8 rounded-3xl border border-slate-800 shadow-xl">
                      <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4" /> Treatment Logic
                      </h3>
                      <div className="space-y-4">
                         {selected.treatment_principle?.map((p, i) => (
                           <div key={i} className="text-lg font-bold text-white leading-tight">
                              {p}
                           </div>
                         ))}
                      </div>
                      <div className="mt-8 border-t border-slate-800 pt-6">
                         <span className="text-[10px] font-black text-slate-600 uppercase mb-4 block">Key Points</span>
                         <div className="flex flex-wrap gap-2">
                            {Array.isArray(selected.acupuncture_points) ? selected.acupuncture_points.map((pt: any) => (
                               <span key={pt} className="px-3 py-1.5 bg-slate-950 text-emerald-400 rounded-xl border border-emerald-500/30 text-xs font-black">{pt}</span>
                            )) : null}
                         </div>
                      </div>
                   </section>

                   <section className="bg-emerald-950/10 p-8 rounded-3xl border border-emerald-500/20 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none -mr-8 -mt-8">
                         <Leaf className="w-full h-full" />
                      </div>
                      <h3 className="text-xs font-black text-emerald-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                        <Leaf className="w-4 h-4" /> Herbal Strategy
                      </h3>
                      <p className="text-sm text-slate-400 leading-relaxed italic mb-4">
                         Auto-generated protocol based on clinical guidelines.
                      </p>
                      <button className="text-[10px] font-bold text-white bg-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors shadow-lg">
                         View Formula Details
                      </button>
                   </section>
                </div>
             </div>
             
             <div className="pt-20 border-t border-slate-900 text-center">
                <p className="text-[10px] text-slate-700 uppercase tracking-[0.5em] font-mono">
                   Syndrome Atlas Database v3.2 • Powered by TCM WuXing Engine
                </p>
             </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-800">
             <Grid className="w-20 h-20 opacity-5" />
          </div>
        )}
      </main>
    </div>
  );
};

export default SyndromeAtlasWindow;
