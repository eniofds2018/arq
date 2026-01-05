
import React, { useState, useRef } from 'react';
import { geminiService } from '../services/gemini';
import { Ebook, Chapter, AppSettings, EbookSource } from '../types';
import { ICONS } from '../constants';
import { PDFDocument } from 'pdf-lib';

interface WriterProps {
  onComplete: (ebook: Ebook) => void;
  settings: AppSettings;
}

const MAX_PDF_PAGES = 1000;

const SourceIcon = ({ mimeType }: { mimeType: string }) => {
  if (mimeType.startsWith('image/')) return <span className="text-pink-500 text-lg">🖼️</span>;
  if (mimeType === 'application/pdf') return <span className="text-red-500 font-bold text-xs">PDF</span>;
  if (mimeType.includes('sheet') || mimeType === 'text/csv' || mimeType.includes('excel')) return <span className="text-emerald-500 text-lg">📊</span>;
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return <span className="text-orange-500 text-lg">📽️</span>;
  if (mimeType.includes('word') || mimeType.includes('officedocument')) return <span className="text-blue-500 text-lg">📝</span>;
  return <span className="text-blue-500 text-lg">📄</span>;
};

const Writer: React.FC<WriterProps> = ({ onComplete, settings }) => {
  const [topic, setTopic] = useState('');
  const [author, setAuthor] = useState('');
  const [volume, setVolume] = useState('');
  const [pagesGoal, setPagesGoal] = useState(20);
  const [style, setStyle] = useState('Narrativo');
  const [formatting, setFormatting] = useState('Clássica');
  const [type, setType] = useState<'ebook' | 'magazine' | 'book' | 'article'>('ebook');
  
  // Opções de capa
  const [showTitleOnCover, setShowTitleOnCover] = useState(true);
  const [showAuthorOnCover, setShowAuthorOnCover] = useState(true);
  const [showVolumeOnCover, setShowVolumeOnCover] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<'idle' | 'outlining' | 'writing' | 'finishing'>('idle');
  const [currentProcess, setCurrentProcess] = useState('');
  const [progress, setProgress] = useState(0);
  const [sources, setSources] = useState<EbookSource[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      const isBinary = !['text/plain', 'text/markdown', 'text/csv'].includes(file.type);
      
      reader.onload = async (event) => {
        let content = event.target?.result as string;
        let pageCount: number | undefined;
        let error: string | undefined;

        if (file.type === 'application/pdf') {
          try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            pageCount = pdfDoc.getPageCount();
            if (pageCount > MAX_PDF_PAGES) error = `Excede 1000 pág.`;
          } catch (e) {
            error = "Erro no PDF";
          }
        }

        setSources(prev => [...prev, { 
          name: file.name, 
          content, 
          mimeType: file.type || 'application/octet-stream',
          isBinary,
          pageCount,
          error
        }]);
      };

      if (isBinary) reader.readAsDataURL(file);
      else reader.readAsText(file);
    });
  };

  const removeSource = (index: number) => {
    setSources(prev => prev.filter((_, i) => i !== index));
  };

  const startGeneration = async () => {
    if (!topic.trim() || sources.some(s => s.error)) return;

    setIsGenerating(true);
    setStep('outlining');
    setCurrentProcess('Analisando fontes e criando estrutura...');
    setProgress(5);

    try {
      // Passamos os novos parâmetros para o serviço Gemini
      const structure = await geminiService.generateStructure(topic, type, sources, style, formatting);
      const chapters: Chapter[] = structure.chapters.map((ch: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        title: ch.title,
        content: '',
        status: 'pending' as const
      }));

      setCurrentProcess('Criando arte de capa profissional...');
      // Geramos a capa baseada no estilo também
      const coverUrl = await geminiService.generateCover(topic, structure.title, style);
      setProgress(15);

      setStep('writing');
      const totalChapters = chapters.length;
      for (let i = 0; i < chapters.length; i++) {
        setCurrentProcess(`Escrevendo Capítulo ${i + 1}...`);
        chapters[i].status = 'writing';
        chapters[i].content = (await geminiService.generateChapterContent(topic, chapters[i].title, sources, style, formatting, author)) || '';
        setProgress(15 + Math.floor(((i + 0.5) / totalChapters) * 60));

        setCurrentProcess(`Gerando ilustração do Capítulo ${i + 1}...`);
        chapters[i].image = (await geminiService.generateChapterImage(chapters[i].title, topic)) || undefined;
        chapters[i].status = 'completed';
        setProgress(15 + Math.floor(((i + 1) / totalChapters) * 60));
      }

      setStep('finishing');
      setCurrentProcess('Compilando referências bibliográficas...');
      const references = await geminiService.generateReferences(topic, sources);
      setProgress(95);

      setCurrentProcess('Finalizando obra...');
      setProgress(100);

      const newEbook: Ebook = {
        id: Date.now().toString(),
        title: structure.title,
        author,
        volume,
        type,
        theme: topic,
        style,
        formatting,
        pagesGoal,
        showTitleOnCover,
        showAuthorOnCover,
        showVolumeOnCover,
        coverImage: coverUrl || `https://picsum.photos/seed/${Date.now()}/600/800`,
        chapters,
        references,
        createdAt: Date.now(),
        progress: 100,
        status: 'completed',
        sources
      };

      setTimeout(() => {
        onComplete(newEbook);
        setIsGenerating(false);
        setStep('idle');
        setTopic('');
        setAuthor('');
        setVolume('');
        setSources([]);
        alert('Obra gerada com sucesso e adicionada à sua Livraria!');
      }, 500);

    } catch (error: any) {
      console.error(error);
      setIsGenerating(false);
      setStep('idle');
      alert('Erro na geração. Verifique sua conexão e tente novamente.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="space-y-2 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white leading-tight">Arquiteto de Obras IA</h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">Defina os parâmetros técnicos e deixe a inteligência criar sua obra-prima.</p>
      </header>

      {!isGenerating ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Coluna Principal */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-2xl space-y-8">
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">O que vamos criar hoje?</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Descreva o tema principal da sua obra..."
                className="w-full h-32 p-6 rounded-3xl border-2 border-slate-50 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-indigo-500 transition-all outline-none text-xl font-medium placeholder:text-slate-300"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Metadados do Autor</label>
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Nome do Autor" 
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-none outline-none focus:ring-2 ring-indigo-500 text-slate-900 dark:text-white font-medium" 
                    />
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        placeholder="Volume (Ex: 1)" 
                        value={volume}
                        onChange={(e) => setVolume(e.target.value)}
                        className="w-1/3 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-none outline-none focus:ring-2 ring-indigo-500 text-slate-900 dark:text-white font-medium" 
                      />
                      <input 
                        type="number" 
                        placeholder="Páginas" 
                        value={pagesGoal}
                        onChange={(e) => setPagesGoal(parseInt(e.target.value) || 0)}
                        className="w-2/3 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-none outline-none focus:ring-2 ring-indigo-500 text-slate-900 dark:text-white font-medium" 
                      />
                    </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Estilo e Técnica</label>
                  <div className="grid grid-cols-2 gap-3">
                     <select 
                      value={style} 
                      onChange={(e) => setStyle(e.target.value)}
                      className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-none outline-none focus:ring-2 ring-indigo-500 text-slate-900 dark:text-white font-medium"
                     >
                        <option>Narrativo</option>
                        <option>Acadêmico</option>
                        <option>Poético</option>
                        <option>Técnico</option>
                        <option>Jornalístico</option>
                        <option>Suspense</option>
                     </select>
                     <select 
                      value={formatting} 
                      onChange={(e) => setFormatting(e.target.value)}
                      className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-none outline-none focus:ring-2 ring-indigo-500 text-slate-900 dark:text-white font-medium"
                     >
                        <option>Clássica</option>
                        <option>ABNT</option>
                        <option>Minimalista</option>
                        <option>Moderna</option>
                     </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(['ebook', 'magazine', 'book', 'article'] as const).map((t) => (
                      <button key={t} onClick={() => setType(t)} className={`py-3 px-2 rounded-xl border-2 transition-all text-[10px] font-black uppercase tracking-widest ${type === t ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-50 dark:border-slate-700 text-slate-400 bg-white dark:bg-slate-800'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Configuração da Capa</label>
               <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                     <input type="checkbox" checked={showTitleOnCover} onChange={() => setShowTitleOnCover(!showTitleOnCover)} className="w-5 h-5 accent-indigo-600" />
                     <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-tighter">Título</span>
                  </label>
                  <label className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                     <input type="checkbox" checked={showAuthorOnCover} onChange={() => setShowAuthorOnCover(!showAuthorOnCover)} className="w-5 h-5 accent-indigo-600" />
                     <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-tighter">Nome Autor</span>
                  </label>
                  <label className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                     <input type="checkbox" checked={showVolumeOnCover} onChange={() => setShowVolumeOnCover(!showVolumeOnCover)} className="w-5 h-5 accent-indigo-600" />
                     <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-tighter">Volume</span>
                  </label>
               </div>
            </div>

            <button onClick={startGeneration} disabled={!topic.trim() || isGenerating} className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 text-white rounded-[2rem] font-black shadow-2xl shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-4 text-xl uppercase tracking-widest">
              <ICONS.Magic />
              Materializar Obra
            </button>
          </div>

          {/* Coluna Lateral - Fontes */}
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl space-y-6">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block">Fontes de Pesquisa</label>
                <div onClick={() => fileInputRef.current?.click()} className="border-4 border-dotted border-slate-100 dark:border-slate-700 rounded-3xl p-8 text-center cursor-pointer hover:border-indigo-400 bg-slate-50 dark:bg-slate-900/50 group transition-all">
                  <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform">📂</span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed">PDF, Excel, Word ou Imagens para Alimentar a IA</p>
                  <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileUpload} />
                </div>
                {sources.length > 0 && (
                  <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {sources.map((s, idx) => (
                      <div key={idx} className={`p-4 rounded-2xl text-[10px] flex items-center justify-between font-bold border ${s.error ? 'bg-red-50 border-red-100 text-red-500' : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}>
                        <div className="flex items-center gap-3 truncate">
                          <SourceIcon mimeType={s.mimeType} />
                          <span className="truncate">{s.name}</span>
                        </div>
                        <button onClick={() => removeSource(idx)} className="text-red-500 hover:scale-125 transition-transform">×</button>
                      </div>
                    ))}
                  </div>
                )}
             </div>

             <div className="bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/50">
                <h3 className="font-bold text-indigo-900 dark:text-indigo-300 text-sm mb-4 uppercase tracking-tighter">Dica Profissional</h3>
                <p className="text-xs text-indigo-700 dark:text-indigo-400 leading-relaxed font-medium">Anexar documentos técnicos garante que a IA utilize terminologias precisas e evite alucinações sobre o tema.</p>
             </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-[4rem] p-20 border border-slate-100 dark:border-slate-700 shadow-2xl flex flex-col items-center space-y-12">
           <div className="relative w-40 h-40">
              <div className="absolute inset-0 border-[12px] border-indigo-50 dark:border-slate-700 rounded-full"></div>
              <div className="absolute inset-0 border-[12px] border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-4xl animate-bounce">✍️</div>
           </div>
           <div className="text-center space-y-4 max-w-xl">
              <h2 className="text-4xl font-serif font-bold dark:text-white leading-tight">{currentProcess}</h2>
              <p className="text-slate-400 font-medium">Isso pode levar alguns instantes. Estamos esculpindo cada palavra conforme seu estilo.</p>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-4 rounded-full overflow-hidden mt-10">
                <div className="bg-indigo-600 h-full transition-all duration-1000 shadow-[0_0_20px_rgba(79,70,229,0.5)]" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="text-xl text-indigo-600 font-black mt-4">{progress}%</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default Writer;
