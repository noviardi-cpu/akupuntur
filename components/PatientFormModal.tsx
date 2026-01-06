
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Save, Activity, User, Stethoscope, Search, UserCheck, 
  ChevronRight, Tag, Info, Clipboard, History, ShieldAlert, 
  Camera, Upload, Loader2, Zap, Sparkles 
} from 'lucide-react';
import { db } from '../services/db';
import { SavedPatient } from '../types';
import { performSmartOCR } from '../services/geminiService';

interface PatientData {
  patientName: string;
  age: string;
  sex: string;
  address: string;
  complaint: string;
  symptoms: string;
  selectedSymptoms: string[];
  isAcuteMode: boolean;
  medicalHistory: string;
  biomedicalDiagnosis: string;
  icd10: string;
  medications: string;
  followUpDate: string;
  notes: string;
  tongue: {
    body_color: string;
    coating_color: string;
    coating_quality: string;
    special_features: string[];
  };
  pulse: {
    qualities: string[];
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PatientData) => void;
}

const TONGUE_BODY_COLORS = ['Pale', 'Pink (Normal)', 'Red', 'Deep Red', 'Purple', 'Blue'];
const TONGUE_COAT_COLORS = ['White', 'Yellow', 'Grey', 'Black', 'None'];
const TONGUE_COAT_QUALITIES = ['Thin', 'Thick', 'Dry', 'Wet', 'Greasy/Sticky', 'Peeling/Map', 'None'];
const TONGUE_FEATURES = ['Teeth Marks', 'Cracks', 'Prickles/Spots', 'Swollen', 'Deviated', 'Short/Contracted', 'Quivering'];

const PULSE_QUALITIES = [
  'Floating', 'Deep', 'Slow', 'Rapid', 'Empty/Deficient', 'Full/Excess', 
  'Slippery', 'Wiry', 'Tight', 'Thready/Fine', 'Knotted', 'Intermittent', 'Choppy', 'Hasty'
];

const SYMPTOM_GROUPS = [
  { category: "General/Qi", items: ['Mudah Lelah', 'Kedinginan', 'Haus Berlebih', 'Berkeringat Malam', 'Keringat Spontan', 'Lemas'] },
  { category: "Head/Mind", items: ['Pusing/Dizziness', 'Nyeri Kepala', 'Insomnia', 'Mimpi Banyak', 'Mudah Marah', 'Pelupa'] },
  { category: "Chest/Heart", items: ['Palpitasi', 'Napas Pendek', 'Nyeri Dada', 'Sesak Napas', 'Batuk Kering'] },
  { category: "Digestive/Earth", items: ['Kembung', 'Mual/Muntah', 'Diare', 'Sembelit', 'Nafsu Makan Turun'] },
  { category: "Lower/Water", items: ['Nyeri Punggung', 'Nyeri Lutut', 'Urinitas Sering', 'Urinitas Sedikit'] }
];

const PatientFormModal: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
  const [storedPatients, setStoredPatients] = useState<SavedPatient[]>([]);
  const [showLookup, setShowLookup] = useState(false);
  const [lookupSearch, setLookupSearch] = useState('');
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<PatientData>({
    patientName: '', age: '', sex: 'male', address: '', complaint: '',
    symptoms: '', selectedSymptoms: [], isAcuteMode: false,
    medicalHistory: '', biomedicalDiagnosis: '', icd10: '', medications: '',
    followUpDate: '', notes: '',
    tongue: { body_color: '', coating_color: '', coating_quality: '', special_features: [] },
    pulse: { qualities: [] }
  });

  useEffect(() => {
    if (isOpen) setStoredPatients(db.patients.getAll());
  }, [isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const result = await performSmartOCR(base64);
        
        // Auto-fill form
        setFormData(prev => ({
          ...prev,
          patientName: result.patientName || prev.patientName,
          age: result.age || prev.age,
          sex: result.sex || prev.sex,
          complaint: result.complaint || prev.complaint,
          symptoms: result.symptoms || prev.symptoms,
          medicalHistory: result.medicalHistory || prev.medicalHistory,
          notes: `OCR Scan Result: ${result.tongueObservation || ''} ${result.pulseObservation || ''}`
        }));
        setIsOcrLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      alert("Gagal memproses gambar. Pastikan format didukung.");
      setIsOcrLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const toggleSymptom = (symptom: string) => {
    const current = formData.selectedSymptoms;
    const updated = current.includes(symptom) ? current.filter(s => s !== symptom) : [...current, symptom];
    setFormData({ ...formData, selectedSymptoms: updated });
  };

  const toggleTongueFeature = (feature: string) => {
    const current = formData.tongue.special_features;
    const updated = current.includes(feature) ? current.filter(f => f !== feature) : [...current, feature];
    setFormData({ ...formData, tongue: { ...formData.tongue, special_features: updated } });
  };

  const togglePulseQuality = (quality: string) => {
    const current = formData.pulse.qualities;
    const updated = current.includes(quality) ? current.filter(q => q !== quality) : [...current, quality];
    setFormData({ ...formData, pulse: { ...formData.pulse, qualities: updated } });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-[2.5rem] shadow-2xl max-h-[92vh] overflow-y-auto scrollbar-hide flex flex-col">
        
        {/* Header dengan OCR Button */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 sticky top-0 bg-slate-900/90 backdrop-blur-md z-30">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                <Activity className="w-6 h-6 text-tcm-primary" />
             </div>
             <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Pendaftaran Pasien</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Digital Health Record v3</p>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
            <button 
                type="button"
                disabled={isOcrLoading}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-900/40 disabled:opacity-50 active:scale-95"
            >
                {isOcrLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" /> Smart OCR Scan</>}
            </button>
            <button onClick={onClose} className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-2xl transition-all"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {isOcrLoading && (
            <div className="p-12 text-center animate-pulse flex flex-col items-center">
                <div className="w-24 h-24 mb-6 relative">
                    <div className="absolute inset-0 border-4 border-indigo-500 rounded-3xl animate-ping opacity-20"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Camera className="w-12 h-12 text-indigo-400" />
                    </div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 animate-[flow_2s_infinite] shadow-[0_0_15px_rgba(99,102,241,0.8)]"></div>
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Mengekstraksi Data Medis...</h3>
                <p className="text-sm text-slate-500 mt-2">Kecerdasan Vision sedang membaca dokumen Anda</p>
            </div>
        )}

        <form onSubmit={handleSubmit} className={`p-8 space-y-10 transition-opacity ${isOcrLoading ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
            {/* Identity */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <User className="w-5 h-5 text-indigo-400" />
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">I. Identitas Pasien</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Nama Lengkap</label>
                      <input 
                          type="text" 
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-slate-200 focus:border-indigo-500 outline-none transition-all font-bold"
                          value={formData.patientName}
                          onChange={e => setFormData({...formData, patientName: e.target.value})}
                          placeholder="Contoh: Budi Santoso"
                      />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Umur</label>
                        <input 
                            type="number" 
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-slate-200 focus:border-indigo-500 outline-none text-center font-bold"
                            value={formData.age}
                            onChange={e => setFormData({...formData, age: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Gender</label>
                        <select 
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-4 text-slate-200 focus:border-indigo-500 outline-none font-bold"
                            value={formData.sex}
                            onChange={e => setFormData({...formData, sex: e.target.value})}
                        >
                            <option value="male">Laki-laki</option>
                            <option value="female">Perempuan</option>
                        </select>
                    </div>
                  </div>
              </div>
            </div>

            {/* Riwayat & Keluhan */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <History className="w-5 h-5 text-amber-500" />
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">II. Riwayat & Keluhan</h3>
              </div>
              <div className="grid grid-cols-1 gap-6">
                  <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Keluhan Utama</label>
                      <input 
                          type="text" 
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-slate-200 focus:border-indigo-500 outline-none font-bold italic"
                          value={formData.complaint}
                          onChange={e => setFormData({...formData, complaint: e.target.value})}
                          placeholder="Apa yang paling dirasakan pasien saat ini?"
                      />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Riwayat Medis (Biomedis)</label>
                          <textarea 
                              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-slate-300 focus:border-indigo-500 outline-none h-24 resize-none"
                              value={formData.medicalHistory}
                              onChange={e => setFormData({...formData, medicalHistory: e.target.value})}
                              placeholder="Diabetes, Hipertensi, Alergi, dll..."
                          />
                      </div>
                      <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Manifestasi Klinis Tambahan</label>
                          <textarea 
                              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-slate-300 focus:border-indigo-500 outline-none h-24 resize-none"
                              value={formData.symptoms}
                              onChange={e => setFormData({...formData, symptoms: e.target.value})}
                              placeholder="Detail sensasi, waktu muncul gejala, dll..."
                          />
                      </div>
                  </div>
              </div>
            </div>

            {/* Quick Symptoms Check */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <Tag className="w-5 h-5 text-emerald-400" />
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">III. Checklist Gejala Cepat</h3>
              </div>
              <div className="space-y-6">
                {SYMPTOM_GROUPS.map((group) => (
                  <div key={group.category} className="bg-slate-950/40 p-5 rounded-3xl border border-slate-800/50">
                    <label className="block text-[9px] font-black text-slate-600 uppercase mb-3 tracking-widest">{group.category}</label>
                    <div className="flex flex-wrap gap-2">
                       {group.items.map(s => (
                         <button
                          key={s}
                          type="button"
                          onClick={() => toggleSymptom(s)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${
                            formData.selectedSymptoms.includes(s)
                            ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/40 scale-105'
                            : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'
                          }`}
                         >
                           {s}
                         </button>
                       ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tongue & Pulse */}
            <div className="space-y-6 pb-10">
              <div className="flex items-center gap-3">
                 <Stethoscope className="w-5 h-5 text-rose-400" />
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">IV. Observasi Lidah & Nadi</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Lidah */}
                <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-inner">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DIAGNOSA LIDAH</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[8px] font-black text-slate-600 uppercase mb-1">Warna Badan</label>
                        <select 
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-[10px] text-white outline-none font-bold"
                          value={formData.tongue.body_color} 
                          onChange={e => setFormData({...formData, tongue: {...formData.tongue, body_color: e.target.value}})}
                        >
                          <option value="">Warna...</option>
                          {TONGUE_BODY_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[8px] font-black text-slate-600 uppercase mb-1">Sabur/Coat</label>
                        <select 
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-[10px] text-white outline-none font-bold"
                          value={formData.tongue.coating_color} 
                          onChange={e => setFormData({...formData, tongue: {...formData.tongue, coating_color: e.target.value}})}
                        >
                          <option value="">Warna...</option>
                          {TONGUE_COAT_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-slate-600 uppercase mb-2">Fitur Khusus</label>
                      <div className="flex flex-wrap gap-1.5">
                        {TONGUE_FEATURES.map(f => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => toggleTongueFeature(f)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black border transition-all uppercase ${
                              formData.tongue.special_features.includes(f)
                              ? 'bg-rose-600 border-rose-500 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-600'
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nadi */}
                <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-inner">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DIAGNOSA NADI</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto scrollbar-hide p-1">
                    {PULSE_QUALITIES.map(q => (
                       <button 
                        key={q} 
                        type="button" 
                        onClick={() => togglePulseQuality(q)} 
                        className={`px-3 py-2.5 rounded-xl text-[9px] font-black border text-center transition-all uppercase ${
                          formData.pulse.qualities.includes(q) 
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' 
                          : 'bg-slate-900 border-slate-800 text-slate-600'
                        }`}
                       >
                         {q}
                       </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-8 flex justify-end gap-3 sticky bottom-0 bg-slate-900 py-6 border-t border-slate-800 z-10">
                <button type="button" onClick={onClose} className="px-8 py-4 rounded-2xl text-slate-500 hover:text-white text-xs font-black uppercase tracking-widest transition-all">Batal</button>
                <button type="submit" className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:brightness-110 text-white px-10 py-4 rounded-2xl font-black shadow-2xl shadow-emerald-900/40 text-xs uppercase tracking-[0.2em] transition-all active:scale-95">
                    <Save className="w-5 h-5" /> Mulai Diagnosis
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default PatientFormModal;
