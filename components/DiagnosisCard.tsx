
import React, { useState, useRef } from 'react';
import { TcmDiagnosisResult } from '../types';
import { db } from '../services/db';
import { 
  BrainCircuit, FileText, FileDown, ShieldCheck, MapPin, 
  Heart, Leaf, Save, Check, Loader2, Anchor, Zap, Activity
} from 'lucide-react';
import DoctorNoteModal from './DoctorNoteModal';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface Props {
  diagnosis?: TcmDiagnosisResult | null;
  isPregnant: boolean;
  onShowVisualizer: (element?: string) => void;
  patientContext?: any;
}

const DiagnosisCard: React.FC<Props> = ({ diagnosis, isPregnant, onShowVisualizer, patientContext }) => {
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!diagnosis) return null;

  const handleSave = () => {
    try {
      db.patients.add({
        id: Date.now().toString(),
        patientName: patientContext?.patientName || "Pasien Anonim",
        age: patientContext?.age || "-",
        sex: patientContext?.sex || "-",
        address: patientContext?.address || "",
        complaint: patientContext?.complaint || "Konsultasi Chat",
        symptoms: patientContext?.symptoms || "",
        selectedSymptoms: patientContext?.selectedSymptoms || [],
        tongue: patientContext?.tongue || { body_color: 'Normal', coating_color: 'Normal' },
        pulse: patientContext?.pulse || { qualities: [] },
        diagnosis: diagnosis,
        timestamp: Date.now()
      });
      setIsSaved(true);
      // Reset state setelah 3 detik agar bisa simpan ulang jika ada perubahan
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error("Gagal menyimpan ke arsip:", err);
      alert("Gagal menyimpan data ke database lokal.");
    }
  };

  const handleExportPDF = async () => {
    if (!cardRef.current || isExporting) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#020617',
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`TCM_Resep_${diagnosis.patternId.replace(/\s+/g, '_')}.pdf`);
    } catch (e) { 
      alert("Ekspor Gagal. Pastikan browser mendukung Canvas."); 
    } finally { 
      setIsExporting(false); 
    }
  };

  return (
    <div className="mt-6 space-y-4 animate-fade-in print:text-black">
      <DoctorNoteModal 
        isOpen={showNoteModal} 
        onClose={() => setShowNoteModal(false)} 
        diagnosis={diagnosis}
        initialPatientData={{ name: patientContext?.patientName, age: patientContext?.age }}
      />

      <div ref={cardRef} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden print:bg-white print:border-slate-300">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
           <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-tcm-primary/10 border border-tcm-primary/30 rounded-2xl flex items-center justify-center">
                 <BrainCircuit className="text-tcm-primary w-8 h-8" />
              </div>
              <div>
                 <h3 className="text-2xl font-black text-white uppercase tracking-tight print:text-black">{diagnosis.patternId}</h3>
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Giovanni Maciocia Protocol</span>
                    <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">CDSS v3.2</span>
                 </div>
              </div>
           </div>
           <div className="flex gap-2 print:hidden">
              <button 
                onClick={handleSave} 
                title="Simpan ke Arsip Pasien"
                className={`p-3 rounded-xl border transition-all flex items-center gap-2 group ${
                  isSaved 
                  ? 'text-white border-emerald-500 bg-emerald-600 shadow-lg shadow-emerald-900/40' 
                  : 'text-slate-500 border-slate-800 hover:text-white hover:border-slate-500 bg-slate-950'
                }`}
              >
                {isSaved ? <><Check className="w-5 h-5" /><span className="text-[10px] font-black uppercase">Tersimpan!</span></> : <Save className="w-5 h-5 group-hover:scale-110" />}
              </button>
              <button onClick={() => setShowNoteModal(true)} className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-lg shadow-indigo-900/20 transition-all active:scale-95">
                <FileText className="w-4 h-4" /> Rx Note
              </button>
              <button onClick={handleExportPDF} className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 border border-slate-700 transition-all">
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />} PDF
              </button>
           </div>
        </div>

        {/* TABEL BEN & BIAO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
           {/* BEN (ROOT) TABLE */}
           <div className="bg-slate-950/50 rounded-2xl border border-indigo-500/20 overflow-hidden">
              <div className="bg-indigo-600/10 px-4 py-2 border-b border-indigo-500/20 flex items-center gap-2">
                 <Anchor className="w-4 h-4 text-indigo-400" />
                 <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">BEN (Root / Akar)</span>
              </div>
              <div className="p-0">
                 <table className="w-full text-xs text-left">
                    <tbody className="divide-y divide-slate-800">
                       {diagnosis.differentiation?.ben?.map((item, i) => (
                          <tr key={i} className="hover:bg-slate-900/50 transition-colors">
                             <td className="px-4 py-3 font-bold text-slate-500 uppercase tracking-tighter w-1/3 border-r border-slate-800 bg-slate-900/30">{item.label}</td>
                             <td className="px-4 py-3 text-slate-200 italic">{item.value}</td>
                          </tr>
                       )) || (
                         <tr><td className="px-4 py-3 text-slate-500 italic">Menganalisis akar masalah...</td></tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* BIAO (BRANCH) TABLE */}
           <div className="bg-slate-950/50 rounded-2xl border border-amber-500/20 overflow-hidden">
              <div className="bg-amber-600/10 px-4 py-2 border-b border-amber-500/20 flex items-center gap-2">
                 <Zap className="w-4 h-4 text-amber-400" />
                 <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em]">BIAO (Branch / Cabang)</span>
              </div>
              <div className="p-0">
                 <table className="w-full text-xs text-left">
                    <tbody className="divide-y divide-slate-800">
                       {diagnosis.differentiation?.biao?.map((item, i) => (
                          <tr key={i} className="hover:bg-slate-900/50 transition-colors">
                             <td className="px-4 py-3 font-bold text-slate-500 uppercase tracking-tighter w-1/3 border-r border-slate-800 bg-slate-900/30">{item.label}</td>
                             <td className="px-4 py-3 text-slate-200 italic">{item.value}</td>
                          </tr>
                       )) || (
                         <tr><td className="px-4 py-3 text-slate-500 italic">Menganalisis manifestasi cabang...</td></tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
           <div className="lg:col-span-12">
              <div className="flex items-center gap-3 mb-4">
                 <MapPin className="w-5 h-5 text-tcm-primary" />
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Resep Akupunktur ({diagnosis.recommendedPoints?.length} Titik)</h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                 {diagnosis.recommendedPoints?.map((pt, i) => (
                    <div key={i} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl hover:border-tcm-primary/40 transition-all group shadow-inner">
                       <div className="flex items-center justify-between mb-2">
                          <span className="font-black text-tcm-primary text-sm tracking-tighter group-hover:scale-110 transition-transform">{pt.code}</span>
                          <Activity className="w-3 h-3 text-slate-700" />
                       </div>
                       <p className="text-[10px] text-slate-400 leading-tight font-medium group-hover:text-slate-200 transition-colors">{pt.description}</p>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {diagnosis.herbal_recommendation && (
              <div className="bg-emerald-950/20 border border-emerald-500/20 p-5 rounded-2xl flex items-center justify-between group">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                       <Leaf className="text-emerald-400 w-6 h-6" />
                    </div>
                    <div>
                       <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest block mb-0.5">Strategi Herbal Jun-Chen</span>
                       <p className="text-lg font-black text-white print:text-black leading-none uppercase tracking-tighter">{diagnosis.herbal_recommendation.formula_name}</p>
                    </div>
                 </div>
                 <div className="flex gap-1.5">
                    {diagnosis.herbal_recommendation.chief.map(h => (
                       <span key={h} className="text-[9px] px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 font-bold uppercase">{h}</span>
                    ))}
                 </div>
              </div>
           )}
           <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center border border-rose-500/20">
                 <Heart className="text-rose-400 w-6 h-6" />
              </div>
              <div>
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Edukasi Gaya Hidup</span>
                 <p className="text-[11px] text-slate-300 italic leading-snug">{diagnosis.lifestyleAdvice}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosisCard;
