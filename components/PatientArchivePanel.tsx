
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../services/db';
import { SavedPatient } from '../types';
import { 
  Search, Trash2, User, Calendar, FileText, ChevronRight, Activity, X, RotateCcw, 
  BrainCircuit, MapPin, Stethoscope, Pill, Clipboard, TrendingUp, CheckCircle2, 
  PlusCircle, MinusCircle, AlertCircle, Clock, History, BarChart3, ShieldAlert, RefreshCw
} from 'lucide-react';

interface Props {
  onLoadPatient: (patient: SavedPatient) => void;
}

const PatientArchivePanel: React.FC<Props> = ({ onLoadPatient }) => {
  const [patients, setPatients] = useState<SavedPatient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<SavedPatient | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadPatients = () => {
    setIsRefreshing(true);
    const data = db.patients.getAll();
    setPatients(data);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Hapus data pasien ini secara permanen dari database lokal?')) {
      db.patients.delete(id);
      loadPatients();
      if (selectedPatient?.id === id) setSelectedPatient(null);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.complaint.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.biomedicalDiagnosis && p.biomedicalDiagnosis.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // --- HISTORICAL ANALYSIS LOGIC ---
  const allVisits = useMemo(() => {
    if (!selectedPatient) return [];
    return patients
        .filter(p => p.patientName.toLowerCase() === selectedPatient.patientName.toLowerCase())
        .sort((a, b) => b.timestamp - a.timestamp);
  }, [selectedPatient, patients]);

  const getSymptomEvolution = () => {
    if (!selectedPatient || allVisits.length < 2) return null;
    
    const currentIndex = allVisits.findIndex(v => v.id === selectedPatient.id);
    const previousVisit = allVisits[currentIndex + 1];
    
    if (!previousVisit) return null;

    const currentSymptoms = selectedPatient.selectedSymptoms || [];
    const previousSymptoms = previousVisit.selectedSymptoms || [];

    const persistent = currentSymptoms.filter(s => previousSymptoms.includes(s));
    const newSymptoms = currentSymptoms.filter(s => !previousSymptoms.includes(s));
    const resolved = previousSymptoms.filter(s => !currentSymptoms.includes(s));

    return { persistent, newSymptoms, resolved, previousDate: new Date(previousVisit.timestamp).toLocaleDateString() };
  };

  const evolution = getSymptomEvolution();

  // Calculate symptom frequency across all visits
  const symptomFrequency = useMemo(() => {
    const freq: Record<string, number> = {};
    allVisits.forEach(v => {
      (v.selectedSymptoms || []).forEach(s => {
        freq[s] = (freq[s] || 0) + 1;
      });
    });
    return Object.entries(freq).sort((a, b) => b[1] - a[1]);
  }, [allVisits]);

  return (
    <div className="h-full flex flex-col md:flex-row bg-slate-950 text-slate-100 overflow-hidden animate-fade-in">
      {/* Sidebar Daftar Pasien */}
      <div className="w-full md:w-80 border-r border-slate-800 bg-slate-900 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
           <h2 className="text-xl font-bold text-tcm-primary">Arsip Pasien</h2>
           <button 
             onClick={loadPatients}
             className={`p-2 hover:bg-slate-800 rounded-lg transition-all ${isRefreshing ? 'animate-spin text-tcm-primary' : 'text-slate-500'}`}
           >
             <RefreshCw className="w-4 h-4" />
           </button>
        </div>
        <div className="p-4 border-b border-slate-800">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Cari nama / penyakit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-sm focus:border-tcm-primary outline-none"
              />
           </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
           {filteredPatients.map(p => (
             <button 
               key={p.id}
               onClick={() => setSelectedPatient(p)}
               className={`w-full text-left p-3 rounded-xl transition-all border ${
                 selectedPatient?.id === p.id 
                 ? 'bg-tcm-primary/20 border-tcm-primary shadow-lg' 
                 : 'bg-slate-800/40 border-transparent hover:bg-slate-800'
               }`}
             >
                <div className="flex justify-between items-start">
                   <span className="font-bold text-slate-200">{p.patientName || 'Anonim'}</span>
                   <span className="text-[10px] text-slate-500">{new Date(p.timestamp).toLocaleDateString()}</span>
                </div>
                {p.biomedicalDiagnosis && (
                   <p className="text-[10px] text-indigo-400 font-bold uppercase truncate">{p.biomedicalDiagnosis}</p>
                )}
                <p className="text-xs text-slate-400 mt-1 line-clamp-1 italic">"{p.complaint}"</p>
                <div className="flex justify-between items-center mt-2">
                   <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-tcm-primary uppercase font-bold tracking-tighter">
                      {p.diagnosis.patternId.replace(/_/g, ' ')}
                   </span>
                   <Trash2 
                    className="w-3.5 h-3.5 text-slate-600 hover:text-rose-500 cursor-pointer transition-colors" 
                    onClick={(e) => handleDelete(e, p.id)}
                   />
                </div>
             </button>
           ))}
           {filteredPatients.length === 0 && (
             <div className="text-center py-20 px-6">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 opacity-20">
                   <Activity className="w-8 h-8" />
                </div>
                <p className="text-slate-600 text-sm italic">Belum ada pasien tersimpan.</p>
                <p className="text-[10px] text-slate-700 mt-2 uppercase">Gunakan tombol Disket pada hasil diagnosa untuk menyimpan.</p>
             </div>
           )}
        </div>
      </div>

      {/* Detail Pasien */}
      <div className="flex-1 overflow-y-auto bg-slate-950 p-6 md:p-10 relative scrollbar-hide">
         {!selectedPatient ? (
           <div className="h-full flex flex-col items-center justify-center text-slate-600">
              <User className="w-16 h-16 mb-4 opacity-10" />
              <p className="font-bold uppercase tracking-widest text-xs">Pilih pasien untuk melihat rekam medis</p>
           </div>
         ) : (
           <div className="max-w-4xl mx-auto space-y-8 animate-slide-in-right">
              {/* Patient Profile Header */}
              <div className="flex flex-col md:flex-row justify-between items-start border-b border-slate-800 pb-6 gap-4">
                 <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h1 className="text-3xl font-black text-white">{selectedPatient.patientName || 'Anonim'}</h1>
                      <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                         {allVisits.length} Visits
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-400">
                       <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(selectedPatient.timestamp).toLocaleString()}</span>
                       <span>Umur: {selectedPatient.age} th</span>
                       <span className="uppercase font-semibold text-tcm-primary">{selectedPatient.sex}</span>
                       {selectedPatient.address && (
                          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {selectedPatient.address}</span>
                       )}
                    </div>
                 </div>
                 <div className="flex items-center gap-3 w-full md:w-auto">
                    <button 
                        onClick={() => onLoadPatient(selectedPatient)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-900/20 transition-all border border-indigo-400/30"
                    >
                        <BrainCircuit className="w-4 h-4" /> Muat ke CDSS
                    </button>
                    <button onClick={() => setSelectedPatient(null)} className="md:hidden p-2 bg-slate-800 rounded-full"><X className="w-6 h-6"/></button>
                 </div>
              </div>

              {/* Medical Context Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <History className="w-4 h-4" /> Past Medical History
                    </h3>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 min-h-[80px]">
                       <p className="text-xs text-slate-300 leading-relaxed">
                          {selectedPatient.medicalHistory || "Tidak ada catatan riwayat medis."}
                       </p>
                    </div>
                 </div>
                 <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <h3 className="text-sm font-black text-rose-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <ShieldAlert className="w-4 h-4" /> Allergies / Notes
                    </h3>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 min-h-[80px]">
                       <p className="text-xs text-slate-300 leading-relaxed">
                          {selectedPatient.notes || "Tidak ada catatan alergi atau kontraindikasi."}
                       </p>
                    </div>
                 </div>
              </div>

              {/* Visit Timeline Navigator */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl overflow-x-auto scrollbar-hide">
                <div className="flex gap-4 min-w-max">
                  {allVisits.map((visit, idx) => (
                    <button 
                      key={visit.id}
                      onClick={() => setSelectedPatient(visit)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                        selectedPatient.id === visit.id 
                        ? 'bg-tcm-primary border-tcm-primary shadow-lg shadow-emerald-900/40' 
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className={`text-[9px] font-black uppercase ${selectedPatient.id === visit.id ? 'text-white' : 'text-slate-500'}`}>
                        {idx === 0 ? 'Current' : idx === 1 ? 'Last' : `Visit ${allVisits.length - idx}`}
                      </span>
                      <span className={`text-xs font-bold ${selectedPatient.id === visit.id ? 'text-white' : 'text-slate-200'}`}>
                        {new Date(visit.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Symptom Frequency & Persistence Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                   <h3 className="text-sm font-black text-amber-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
                      <BarChart3 className="w-4 h-4" /> Chronic Symptom Profile
                   </h3>
                   <div className="space-y-4">
                      {symptomFrequency.slice(0, 5).map(([symptom, count]) => (
                        <div key={symptom}>
                           <div className="flex justify-between items-center mb-1.5">
                              <span className="text-xs font-bold text-slate-200">{symptom}</span>
                              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                                 {Math.round((count / allVisits.length) * 100)}% Persistence
                              </span>
                           </div>
                           <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                              <div 
                                className="h-full bg-amber-500 transition-all duration-1000" 
                                style={{ width: `${(count / allVisits.length) * 100}%` }}
                              />
                           </div>
                        </div>
                      ))}
                      {symptomFrequency.length === 0 && <p className="text-xs text-slate-600 italic">No persistent symptoms recorded.</p>}
                   </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-center items-center text-center">
                   <div className="p-4 bg-indigo-500/10 rounded-full border border-indigo-500/20 mb-4">
                      <Clock className="w-8 h-8 text-indigo-400" />
                   </div>
                   <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Observation Period</h4>
                   <p className="text-xl font-black text-white">
                      {allVisits.length > 1 ? (
                        Math.round((allVisits[0].timestamp - allVisits[allVisits.length-1].timestamp) / (1000 * 60 * 60 * 24))
                      ) : 0} Days
                   </p>
                   <p className="text-[10px] text-slate-600 mt-1 uppercase font-bold">Total care history duration</p>
                </div>
              </div>

              {/* Detailed Symptom Evolution (vs Previous) */}
              {evolution && (
                 <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                       <History className="w-20 h-20" />
                    </div>
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-sm font-black text-tcm-primary uppercase tracking-widest flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" /> Comparison: Current vs {evolution.previousDate}
                       </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 transition-all hover:border-emerald-500/30">
                          <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase mb-4">
                             <CheckCircle2 className="w-4 h-4" /> Stable (Persistent)
                          </div>
                          <div className="flex flex-wrap gap-2">
                             {evolution.persistent.length > 0 ? evolution.persistent.map(s => (
                               <span key={s} className="px-3 py-1 rounded-xl bg-emerald-950/30 text-emerald-400 text-[10px] font-black border border-emerald-900/40">{s}</span>
                             )) : <span className="text-[10px] text-slate-600 italic">No stable symptoms.</span>}
                          </div>
                       </div>
                       
                       <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 transition-all hover:border-rose-500/30">
                          <div className="flex items-center gap-2 text-rose-400 font-black text-[10px] uppercase mb-4">
                             <PlusCircle className="w-4 h-4" /> New Manifestations
                          </div>
                          <div className="flex flex-wrap gap-2">
                             {evolution.newSymptoms.length > 0 ? evolution.newSymptoms.map(s => (
                               <span key={s} className="px-3 py-1 rounded-xl bg-rose-950/30 text-rose-400 text-[10px] font-black border border-rose-900/40">{s}</span>
                             )) : <span className="text-[10px] text-slate-600 italic">No new symptoms.</span>}
                          </div>
                       </div>

                       <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 transition-all hover:border-indigo-500/30">
                          <div className="flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase mb-4">
                             <MinusCircle className="w-4 h-4" /> Resolved (Success)
                          </div>
                          <div className="flex flex-wrap gap-2">
                             {evolution.resolved.length > 0 ? evolution.resolved.map(s => (
                               <span key={s} className="px-3 py-1 rounded-xl bg-indigo-950/30 text-indigo-400 text-[10px] font-black border border-indigo-900/40">{s}</span>
                             )) : <span className="text-[10px] text-slate-600 italic">No resolution observed.</span>}
                          </div>
                       </div>
                    </div>
                 </div>
              )}

              {/* Diagnostic Snapshot */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-slate-900 border border-indigo-500/30 p-6 rounded-2xl shadow-xl">
                    <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <Stethoscope className="w-4 h-4" /> Diagnosis Snapshot
                    </h3>
                    <div className="space-y-3">
                       <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                          <span className="text-[9px] text-slate-500 uppercase font-black block mb-1">Western Biomedical</span>
                          <span className="text-lg font-black text-white">{selectedPatient.biomedicalDiagnosis || 'General Wellness'}</span>
                          {selectedPatient.icd10 && (
                             <span className="ml-2 text-[10px] bg-indigo-900/50 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800 font-black">ICD: {selectedPatient.icd10}</span>
                          )}
                       </div>
                       <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                          <span className="text-[9px] text-slate-500 uppercase font-black block mb-1">Primary Complaint</span>
                          <p className="text-xs text-slate-300 italic leading-relaxed">"{selectedPatient.complaint}"</p>
                       </div>
                    </div>
                 </div>

                 <div className="bg-emerald-950/20 border border-emerald-500/30 p-6 rounded-2xl shadow-xl">
                    <h3 className="text-sm font-black text-tcm-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                       <Activity className="w-4 h-4" /> TCM Pattern Analysis
                    </h3>
                    <div className="space-y-3">
                       <h4 className="text-xl font-black text-white border-b border-emerald-900/30 pb-3 uppercase tracking-tighter">
                         {selectedPatient.diagnosis.patternId.replace(/_/g, ' ')}
                       </h4>
                       <div className="flex items-center justify-between mb-4">
                          <div className="bg-emerald-900/40 text-emerald-300 px-3 py-1 rounded-lg border border-emerald-800 font-black text-[10px] uppercase tracking-widest">
                             Confidence: {Math.round(selectedPatient.diagnosis.confidence * 100)}%
                          </div>
                       </div>
                       <p className="text-sm text-slate-300 leading-relaxed font-medium">
                          {selectedPatient.diagnosis.explanation}
                       </p>
                    </div>
                 </div>
              </div>

              {/* Physical Markers Section */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                 <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Clipboard className="w-4 h-4" /> Physical Exam Markers
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                    <div className="space-y-4">
                       <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                          <span className="block text-[9px] text-slate-500 font-black uppercase mb-2">Subjective Sensation</span>
                          <p className="text-slate-200 font-medium">Lidah: {selectedPatient.tongue.body_color} Body, {selectedPatient.tongue.coating_quality} {selectedPatient.tongue.coating_color} coat</p>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                             {selectedPatient.tongue.special_features?.map(f => (
                               <span key={f} className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[9px] font-bold rounded border border-slate-700">{f}</span>
                             ))}
                          </div>
                       </div>
                    </div>
                    <div>
                       <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 h-full flex flex-col justify-center">
                          <span className="block text-[9px] text-slate-500 font-black uppercase mb-2">Pulse Palpation</span>
                          <div className="flex flex-wrap gap-2">
                            {selectedPatient.pulse.qualities?.map(q => (
                              <span key={q} className="px-3 py-1 bg-slate-800 text-slate-200 text-[10px] font-black rounded-lg border border-slate-700 uppercase tracking-tighter">
                                {q}
                              </span>
                            )) || <span className="text-slate-600">N/A</span>}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Interactive Footer */}
              <div className="flex justify-center py-10 border-t border-slate-900">
                 <button 
                    onClick={() => {
                        if (window.confirm("Restore this diagnostic session to the active CDSS interface?")) {
                            onLoadPatient(selectedPatient);
                        }
                    }}
                    className="flex items-center gap-3 text-slate-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.3em] group"
                 >
                    <RotateCcw className="w-5 h-5 group-hover:rotate-[-90deg] transition-transform" /> Restore Session Data
                 </button>
              </div>
           </div>
         )}
      </div>
    </div>
  );
};

export default PatientArchivePanel;
