import React from 'react';
import { WuXingInteractiveDiagram } from './WuXingInteractiveDiagram';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialHighlight?: string | null;
}

const WuXingVisualizerModal: React.FC<Props> = ({ isOpen, onClose, initialHighlight }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col h-[90vh] md:h-[85vh] overflow-hidden">
        <WuXingInteractiveDiagram 
            initialHighlight={initialHighlight} 
            onClose={onClose} 
        />
      </div>
    </div>
  );
};

export default WuXingVisualizerModal;