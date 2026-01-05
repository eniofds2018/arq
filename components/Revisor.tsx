
import React, { useState } from 'react';
import { geminiService } from '../services/gemini';
import { ICONS } from '../constants';

const Revisor: React.FC = () => {
  const [originalText, setOriginalText] = useState('');
  const [revisedText, setRevisedText] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRevise = async () => {
    if (!originalText.trim()) return;
    setIsProcessing(true);
    try {
      const result = await geminiService.reviseContent(originalText, instructions || "Revise e formate profissionalmente.");
      setRevisedText(result || '');
    } catch (error) {
      console.error(error);
      alert("Erro ao processar o texto.");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(revisedText);
    alert("Texto copiado!");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="space-y-2">
        <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white leading-tight">Revisor e Formatador IA</h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">Eleve a qualidade do seu texto para um padrão editorial profissional.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl flex flex-col h-[600px]">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Texto Original</label>
            <textarea
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              placeholder="Cole seu rascunho aqui..."
              className="flex-1 w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-none outline-none resize-none text-slate-700 dark:text-slate-300 font-serif"
            />
          </div>
          
          <div className="bg-indigo-600 p-6 rounded-3xl shadow-xl space-y-4">
             <label className="text-xs font-bold text-white uppercase tracking-widest block">Instruções de Edição</label>
             <input 
               type="text"
               value={instructions}
               onChange={(e) => setInstructions(e.target.value)}
               placeholder="Ex: Torne mais formal, adicione tópicos, use tom acadêmico..."
               className="w-full p-4 rounded-xl bg-white/10 text-white placeholder:text-white/50 border border-white/20 outline-none focus:bg-white/20 transition-all"
             />
             <button
               onClick={handleRevise}
               disabled={isProcessing || !originalText}
               className="w-full py-4 bg-white text-indigo-600 rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-2xl disabled:opacity-50"
             >
               {isProcessing ? <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div> : <ICONS.Magic />}
               Processar com Gemini 3 Pro
             </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl flex flex-col h-[750px] relative overflow-hidden">
           {isProcessing && (
             <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-bold text-indigo-600 animate-pulse">Refinando narrativa...</p>
             </div>
           )}
           <div className="flex justify-between items-center mb-4">
             <label className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Resultado Revisado</label>
             {revisedText && (
               <button onClick={copyToClipboard} className="text-[10px] bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full font-bold hover:bg-indigo-100 transition-colors">COPIAR TEXTO</button>
             )}
           </div>
           <div className="flex-1 w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 overflow-y-auto text-slate-800 dark:text-slate-200 font-serif leading-relaxed whitespace-pre-wrap text-justify">
             {revisedText || <div className="h-full flex items-center justify-center text-slate-400 italic">O texto revisado aparecerá aqui...</div>}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Revisor;
