
import React, { useState, useEffect, useRef } from 'react';
import { ScoredSyndrome, RxPoint, TcmDiagnosisResult } from '../types';
import { TCM_DB } from '../constants';
import { getHerbalRecommendation } from '../services/tcmLogic';
import { Activity, CheckCircle, MapPin, ArrowRight, BrainCircuit, Printer, Leaf, Loader2, ArrowLeft, Plus, Trash2, Syringe, X, FileText, Camera, Stethoscope, Download } from 'lucide-react';
import BodyMapSekarangJadi from './BodyMapSekarangJadi'; 
import DoctorNoteModal from './DoctorNoteModal';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface Props {
  analysis: ScoredSyndrome[];
  onAnalyzeRequest: () => void;
  initialSyndromeId?: string;
  isAnalyzing?: boolean;
  onBack?: () => void;
  patientContext?: any;
}

const ScoringAndPointsHub: React.FC<Props> = ({ analysis, onAnalyzeRequest, initialSyndromeId, isAnalyzing = false, onBack, patientContext }) => {
  const [selectedSyndrome, setSelectedSyndrome] = useState<ScoredSyndrome | null>(null);
  const [manualPoints, setManualPoints] = useState<RxPoint[]>([]);
  const [manualInput, setManualInput] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialSyndromeId) {
        const allSyndromes = [...TCM_DB.syndromes.FILLED_FROM_PDF, ...TCM_DB.syndromes.TODO_FROM_PDF];
        const found = allSyndromes.find(s => s.id === initialSyndromeId);
        if (found) {
            const existingInAnalysis = (analysis || []).find(a => a.syndrome.id === initialSyndromeId);
            if (existingInAnalysis) {
                setSelectedSyndrome(existingInAnalysis);
            } else {
                let mockPoints: RxPoint[] = Array.isArray(found.acupuncture_points) 
                    ? found.acupuncture_points.map(code => ({ code, role: 'kausal', source: 'manual', note: 'Titik Basis Data' }))
                    : [];

                setSelectedSyndrome({
                    syndrome: found,
                    score: 0, 
                    points: mockPoints,
                    warnings: [],
                    rationale: ["Pilihan Manual dari Atlas"],
                    herbal_recommendation: getHerbalRecommendation(found),
                });
            }
        }
    }
  }, [initialSyndromeId, analysis]);

  useEffect(() => {
    if (!selectedSyndrome && analysis?.length > 0) {
        setSelectedSyndrome(analysis[0]);
    }
  }, [analysis, selectedSyndrome]);

  const handleAddManualPoint = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!manualInput.trim()) return;
    const code = manualInput.toUpperCase().trim();
    if (!manualPoints.some(p => p.code === code)) {
        setManualPoints([...manualPoints, { code, role: 'manual', source: 'user_add', note: 'Input Manual User' }]);
    }
    setManualInput('');
  };

  const activePoints = selectedSyndrome ? [...(selectedSyndrome.points || []), ...manualPoints] : [];

  const diagnosisForModal: TcmDiagnosisResult | null = selectedSyndrome ? {
      patternId: selectedSyndrome.syndrome.name_id,
      confidence: selectedSyndrome.score / 100,
      explanation: selectedSyndrome.rationale?.join('\n') || "Analisis CDSS",
      recommendedPoints: activePoints.map(p => ({ code: p.code, description: p.note || p.role })),
      lifestyleAdvice: "Ikuti protokol diet dan istirahat sesuai pola sindrom yang ditemukan.",
      herbal_recommendation: selectedSyndrome.herbal_recommendation,
      wuxingElement: selectedSyndrome.syndrome.wuxing_element
  } : null;

  return (
    <div className="flex h-full p-4 gap-4 print:p-0">
      {diagnosisForModal && showNoteModal && (
          <DoctorNoteModal 
            isOpen={showNoteModal} 
            onClose={() => setShowNoteModal(false)} 
            diagnosis={diagnosisForModal}
            initialPatientData={{ name: patientContext?.patientName, age: patientContext?.age }}
          />
      )}

      {/* List Analysis */}
      <div className="w-1/3 min-h-full bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col">
        <h2 className="text-lg font-black text-white uppercase tracking-tighter mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-tcm-primary" /> Analisis CDSS
        </h2>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
            {analysis.length > 0 ? analysis.map((res) => (
              <div 
                key={res.syndrome.id}
                onClick={() => { setSelectedSyndrome(res); setManualPoints([]); }}
                className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                  selectedSyndrome?.syndrome.id === res.syndrome.id 
                    ? 'bg-tcm-primary/20 border-tcm-primary shadow-lg' 
                    : 'bg-slate-950 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white text-sm">{res.syndrome.name_id}</span>
                    <span className="text-xs font-black text-tcm-primary">{Math.round(res.score)}%</span>
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{res.syndrome.primary_organs?.join(' & ')}</p>
              </div>
            )) : <p className="text-slate-600 text-xs italic text-center py-10">Data pasien diperlukan.</p>}
        </div>
        <button onClick={onAnalyzeRequest} className="mt-4 w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95">
            Diagnosa Baru
        </button>
      </div>

      {/* Detail & Map */}
      <div ref={contentRef} className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col relative overflow-hidden">
        {selectedSyndrome ? (
          <>
            <div className="flex justify-between items-start mb-6">
                <div>
                   <h3 className="text-2xl font-black text-white tracking-tighter">{selectedSyndrome.syndrome.name_id}</h3>
                   <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{selectedSyndrome.syndrome.name_en}</p>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => setShowNoteModal(true)} className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all active:scale-95">
                      <FileText className="w-4 h-4" /> Nota / Resep
                   </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
               <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden relative shadow-inner">
                  <BodyMapSekarangJadi points={activePoints} />
               </div>
               
               <div className="flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-hide">
                  <div className="bg-slate-950/50 border border-slate-800 p-5 rounded-2xl">
                     <span className="text-[10px] font-black text-tcm-primary uppercase tracking-widest mb-4 block flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Daftar Titik Aktif
                     </span>
                     <div className="flex flex-wrap gap-2">
                        {activePoints.map((p, i) => (
                          <div key={i} className={`px-2 py-1 rounded-lg border text-[10px] font-black flex items-center gap-2 ${p.role === 'manual' ? 'bg-indigo-950 border-indigo-500 text-indigo-300' : 'bg-slate-900 border-slate-700 text-slate-300'}`}>
                             {p.code}
                             {p.role === 'manual' && <X className="w-3 h-3 cursor-pointer" onClick={() => setManualPoints(manualPoints.filter(mp => mp.code !== p.code))} />}
                          </div>
                        ))}
                     </div>
                     <form onSubmit={handleAddManualPoint} className="mt-4 flex gap-2">
                        <input value={manualInput} onChange={e => setManualInput(e.target.value)} placeholder="Add point..." className="flex-1 bg-black border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500 uppercase" />
                        <button type="submit" className="p-2 bg-slate-800 rounded-xl border border-slate-700 text-white"><Plus className="w-4 h-4"/></button>
                     </form>
                  </div>
                  
                  {selectedSyndrome.herbal_recommendation && (
                    <div className="bg-emerald-950/10 border border-emerald-500/20 p-5 rounded-2xl">
                       <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3 block">Rekomendasi Herbal</span>
                       <p className="text-sm font-bold text-white mb-2">{selectedSyndrome.herbal_recommendation.formula_name}</p>
                       <p className="text-[10px] text-slate-400 leading-relaxed italic">{selectedSyndrome.herbal_recommendation.chief.join(', ')}</p>
                    </div>
                  )}
               </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4">
             <Stethoscope className="w-12 h-12 opacity-10" />
             <p className="text-sm font-bold uppercase tracking-widest">Silakan pilih sindrom dari daftar kiri</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoringAndPointsHub;
