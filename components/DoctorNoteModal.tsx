
import React, { useState, useRef, useEffect } from 'react';
import { X, Download, Upload, FileSignature, Printer, Calendar, User, MapPin, Clipboard, FileText, FileDown, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { TcmDiagnosisResult } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  diagnosis: TcmDiagnosisResult;
  initialPatientData?: {
    name?: string;
    age?: string;
    address?: string;
  };
}

const DoctorNoteModal: React.FC<Props> = ({ isOpen, onClose, diagnosis, initialPatientData }) => {
  const [clinicName, setClinicName] = useState('Klinik Utama TCM WuXing');
  const [doctorName, setDoctorName] = useState('Pakar Akupunktur Berlisensi');
  const [patientName, setPatientName] = useState(initialPatientData?.name || '');
  const [age, setAge] = useState(initialPatientData?.age || '');
  const [address, setAddress] = useState(initialPatientData?.address || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [signature, setSignature] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const pointCodes = (diagnosis.recommendedPoints || []).map(p => p.code).join(', ');
  const detailedPoints = (diagnosis.recommendedPoints || []).map(p => `- ${p.code}: ${p.description}`).join('\n');

  const defaultNotes = `DIAGNOSIS TCM: ${diagnosis.patternId.toUpperCase()}

DAFTAR TITIK AKUPUNKTUR:
${detailedPoints || '-'}

FORMULA HERBAL:
${diagnosis.herbal_recommendation ? `${diagnosis.herbal_recommendation.formula_name || 'Individual'}
Bahan Utama: ${(diagnosis.herbal_recommendation.chief || []).join(', ')}` : '-'}

SARAN & INSTRUKSI:
${diagnosis.lifestyleAdvice}`;

  const [notes, setNotes] = useState(defaultNotes);
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSignature(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const generatePDF = async () => {
    if (!receiptRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(receiptRef.current, { scale: 3, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a5');
      pdf.addImage(imgData, 'PNG', 0, 0, 148, 210);
      pdf.save(`Resep_TCM_${patientName || 'Pasien'}.pdf`);
    } catch (err) { alert("Gagal PDF"); } finally { setIsGenerating(false); }
  };

  const generateTextFile = () => {
    const content = `
RESEP KLINIS TCM WUXING
======================
Klinik: ${clinicName}
Dokter: ${doctorName}
Tanggal: ${date}

DATA PASIEN
-----------
Nama: ${patientName || '-'}
Umur: ${age}
Alamat: ${address || '-'}

CATATAN RESEP
-------------
${notes}

Dihasilkan secara otomatis oleh TCM WuXing Pro CDSS.
    `.trim();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Resep_${patientName || 'Pasien'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-6xl h-[95vh] rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border-indigo-500/20">
        
        {/* Editor */}
        <div className="w-full md:w-[400px] bg-slate-800 p-8 overflow-y-auto border-r border-slate-700 flex flex-col gap-6 scrollbar-hide">
           <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                 <FileSignature className="w-6 h-6 text-indigo-400" /> Rx Generator
              </h2>
              <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1"><X className="w-7 h-7"/></button>
           </div>

           <div className="space-y-5">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Klinik & Praktisi</label>
                 <input className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-3 text-sm text-white focus:border-indigo-500 outline-none transition-all" value={clinicName} onChange={e => setClinicName(e.target.value)} placeholder="Nama Klinik" />
                 <input className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-3 text-sm text-white focus:border-indigo-500 outline-none transition-all" value={doctorName} onChange={e => setDoctorName(e.target.value)} placeholder="Nama Dokter" />
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Detail Pasien</label>
                 <div className="flex gap-2">
                    <input className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl px-5 py-3 text-sm text-white focus:border-indigo-500 outline-none" value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Nama Pasien" />
                    <input className="w-20 bg-slate-950 border border-slate-700 rounded-2xl px-5 py-3 text-sm text-white focus:border-indigo-500 outline-none" value={age} onChange={e => setAge(e.target.value)} placeholder="Age" />
                 </div>
                 <input className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-3 text-sm text-white focus:border-indigo-500 outline-none" value={address} onChange={e => setAddress(e.target.value)} placeholder="Alamat" />
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Resep / Instruksi Klinis</label>
                 <textarea className="w-full h-56 bg-slate-950 border border-slate-700 rounded-2xl px-5 py-4 text-xs text-slate-300 font-mono leading-relaxed focus:border-indigo-500 outline-none resize-none scrollbar-hide" value={notes} onChange={e => setNotes(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                  <button onClick={generatePDF} disabled={isGenerating} className="py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-lg shadow-indigo-900/40 flex items-center justify-center gap-2 text-xs uppercase tracking-widest transition-all">
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><FileDown className="w-4 h-4" /> Download PDF</>}
                  </button>
                  <button onClick={generateTextFile} className="py-4 bg-slate-700 hover:bg-slate-600 text-white font-black rounded-2xl shadow-lg flex items-center justify-center gap-2 text-xs uppercase tracking-widest transition-all">
                    <Download className="w-4 h-4" /> Download Txt
                  </button>
              </div>
           </div>
        </div>

        {/* Live Preview */}
        <div className="flex-1 bg-slate-950 p-6 md:p-12 flex items-center justify-center overflow-auto scrollbar-hide">
            <div 
               ref={receiptRef}
               className="bg-white text-slate-900 shadow-2xl relative flex flex-col transform"
               style={{ width: '148mm', height: '210mm', minWidth: '148mm', minHeight: '210mm', padding: '15mm', fontFamily: 'serif' }}
            >
               <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center">
                  <h1 className="text-xl font-black uppercase tracking-widest mb-1">{clinicName}</h1>
                  <p className="text-xs font-bold text-slate-700">{doctorName}</p>
                  <p className="text-[8px] text-slate-500 mt-2 uppercase tracking-[0.2em] font-sans">Traditional Chinese Medicine Specialist</p>
               </div>

               <div className="flex justify-between text-[10px] mb-8 font-sans border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                     <p><span className="font-bold text-slate-400 uppercase tracking-tighter mr-2">Pasien:</span> <span className="font-black">{patientName || '-'}</span></p>
                     <p><span className="font-bold text-slate-400 uppercase tracking-tighter mr-2">Alamat:</span> <span className="font-black">{address || '-'}</span></p>
                  </div>
                  <div className="text-right space-y-1">
                     <p><span className="font-bold text-slate-400 uppercase tracking-tighter mr-2">Tanggal:</span> <span className="font-black">{date}</span></p>
                     <p><span className="font-bold text-slate-400 uppercase tracking-tighter mr-2">ID:</span> <span className="font-black">#{Date.now().toString().slice(-6)}</span></p>
                  </div>
               </div>

               <div className="flex-1 font-mono text-[11px] whitespace-pre-wrap leading-relaxed text-slate-800">
                  <div className="text-3xl font-black font-serif italic text-slate-300 mb-2">R/</div>
                  <div className="pl-2">{notes}</div>
               </div>

               <div className="mt-8 flex flex-col items-end">
                  <p className="text-[9px] text-slate-500 mb-10 font-sans uppercase tracking-widest">{clinicName.split(' ')[2] || 'Pusat'}, {date}</p>
                  <div className="w-32 h-16 border border-slate-100 border-dashed rounded flex items-center justify-center text-[8px] text-slate-300 uppercase font-sans mb-1">
                     {signature ? <img src={signature} alt="Sign" className="max-h-full mix-blend-multiply" /> : 'Tanda Tangan'}
                  </div>
                  <p className="text-xs font-black border-t-2 border-slate-900 pt-2 min-w-[150px] text-center uppercase tracking-tighter">{doctorName}</p>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorNoteModal;
