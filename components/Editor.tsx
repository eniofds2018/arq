import React, { useState, useEffect, useRef } from 'react';
import { Ebook, Chapter } from '../types';

interface EditorProps {
  ebooks: Ebook[];
  onUpdate: (ebook: Ebook) => void;
  onAdd: (ebook: Ebook) => void;
}

const Editor: React.FC<EditorProps> = ({ ebooks, onUpdate, onAdd }) => {
  const [selectedBook, setSelectedBook] = useState<Ebook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  
  // Estados para novo projeto
  const [newTitle, setNewTitle] = useState('');
  const [newTheme, setNewTheme] = useState('');
  const [newType, setNewType] = useState<'ebook' | 'magazine' | 'book' | 'article'>('book');
  const [newCover, setNewCover] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedChapter) {
      setEditedContent(selectedChapter.content);
    }
  }, [selectedChapter]);

  const handleSave = () => {
    if (!selectedBook || !selectedChapter) return;
    setIsSaving(true);

    const updatedChapters = selectedBook.chapters.map(ch => 
      ch.id === selectedChapter.id ? { ...ch, content: editedContent } : ch
    );

    const updatedBook = { ...selectedBook, chapters: updatedChapters };
    onUpdate(updatedBook);
    
    setSelectedBook(updatedBook);
    setSelectedChapter(updatedChapters.find(c => c.id === selectedChapter.id) || null);
    
    setTimeout(() => {
      setIsSaving(false);
    }, 300);
  };

  const handleCreateManual = () => {
    if (!newTitle.trim()) {
      alert("Por favor, insira um título.");
      return;
    }

    // Fix: Adding missing mandatory properties from Ebook interface
    const newEbook: Ebook = {
      id: Date.now().toString(),
      title: newTitle,
      theme: newTheme,
      type: newType,
      coverImage: newCover || `https://picsum.photos/seed/${Date.now()}/600/800`,
      showTitleOnCover: true,
      showAuthorOnCover: true,
      showVolumeOnCover: true,
      chapters: [
        { id: Math.random().toString(36).substr(2, 9), title: 'Capítulo 1', content: '', status: 'completed' }
      ],
      createdAt: Date.now(),
      progress: 0,
      status: 'completed'
    };

    onAdd(newEbook);
    setSelectedBook(newEbook);
    setSelectedChapter(newEbook.chapters[0]);
    setIsCreatingNew(false);
    setNewTitle('');
    setNewTheme('');
    setNewCover(null);
  };

  const handleAddChapter = () => {
    if (!selectedBook) return;
    const newId = Math.random().toString(36).substr(2, 9);
    const newChapter: Chapter = {
      id: newId,
      title: `Novo Capítulo ${selectedBook.chapters.length + 1}`,
      content: '',
      status: 'completed'
    };

    const updatedBook = {
      ...selectedBook,
      chapters: [...selectedBook.chapters, newChapter]
    };

    onUpdate(updatedBook);
    setSelectedBook(updatedBook);
    setSelectedChapter(newChapter);
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setNewCover(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (isCreatingNew) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in zoom-in-95 duration-300">
        <header className="flex items-center gap-4">
           <button onClick={() => setIsCreatingNew(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
           </button>
           <h1 className="text-3xl font-serif font-bold dark:text-white">Novo Trabalho Manual</h1>
        </header>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 space-y-4">
               <label className="text-xs font-bold uppercase text-slate-400">Capa da Obra</label>
               <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-[3/4] bg-slate-100 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-all overflow-hidden"
               >
                 {newCover ? (
                   <img src={newCover} className="w-full h-full object-cover" />
                 ) : (
                   <div className="text-center p-4">
                     <span className="text-3xl mb-2 block">🖼️</span>
                     <p className="text-[10px] font-bold text-slate-500 uppercase">Upload Imagem</p>
                   </div>
                 )}
               </div>
               <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleCoverUpload} />
            </div>

            <div className="flex-1 space-y-4">
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase text-slate-400">Título</label>
                 <input 
                  type="text" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: O Código das Sombras"
                  className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border-none outline-none focus:ring-2 ring-indigo-500 dark:text-white"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase text-slate-400">Tema/Gênero</label>
                 <input 
                  type="text" 
                  value={newTheme} 
                  onChange={(e) => setNewTheme(e.target.value)}
                  placeholder="Ex: Fantasia Épica"
                  className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border-none outline-none focus:ring-2 ring-indigo-500 dark:text-white"
                 />
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-400">Tipo</label>
                  <select 
                    value={newType} 
                    onChange={(e: any) => setNewType(e.target.value)}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border-none outline-none focus:ring-2 ring-indigo-500 dark:text-white"
                  >
                    <option value="book">Livro</option>
                    <option value="ebook">Ebook</option>
                    <option value="magazine">Revista</option>
                    <option value="article">Artigo</option>
                  </select>
               </div>
            </div>
          </div>

          <button 
            onClick={handleCreateManual}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
          >
            Começar a Escrever
          </button>
        </div>
      </div>
    );
  }

  if (!selectedBook) {
    return (
      <div className="space-y-8 animate-in fade-in">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
             <h1 className="text-3xl font-serif font-bold dark:text-white">Editor de Projetos</h1>
             <p className="text-slate-500">Gerencie seus capítulos ou inicie um trabalho manual.</p>
           </div>
           <button 
            onClick={() => setIsCreatingNew(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-md"
           >
              <span className="text-xl">+</span> Novo Trabalho Manual
           </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ebooks.map(book => (
            <div 
              key={book.id} 
              onClick={() => setSelectedBook(book)}
              className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-indigo-500 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex gap-4">
                <div className="w-16 h-20 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                  {book.coverImage && <img src={book.coverImage} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-bold text-sm dark:text-white truncate">{book.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{book.chapters.length} Capítulos</p>
                  <span className="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded mt-2 inline-block font-bold">ABRIR EDITOR</span>
                </div>
              </div>
            </div>
          ))}
          {ebooks.length === 0 && (
             <div className="col-span-3 text-center py-20 bg-white/50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
               <p className="text-slate-400 font-medium italic">Nenhum projeto disponível para edição.</p>
               <button onClick={() => setIsCreatingNew(true)} className="mt-4 text-indigo-600 font-bold hover:underline">Criar primeiro projeto</button>
             </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col animate-in fade-in">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
           <button onClick={() => { setSelectedBook(null); setSelectedChapter(null); }} className="text-slate-400 hover:text-indigo-600 font-bold text-sm uppercase">← Voltar</button>
           <div className="h-6 w-px bg-slate-300"></div>
           <h2 className="text-xl font-bold dark:text-white truncate max-w-md">{selectedBook.title}</h2>
        </div>
        {selectedChapter && (
          <div className="flex items-center gap-3">
             <span className={`text-xs font-bold transition-opacity ${isSaving ? 'opacity-100' : 'opacity-0'} text-indigo-500`}>Salvando...</span>
             <button 
              onClick={handleSave} 
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg"
            >
              Salvar Obra
            </button>
          </div>
        )}
      </header>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Sidebar de Capítulos */}
        <div className="w-1/4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden shadow-sm">
           <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
             <h3 className="font-bold text-xs uppercase text-slate-400">Sumário</h3>
             <button onClick={handleAddChapter} className="w-8 h-8 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors">+</button>
           </div>
           <div className="flex-1 overflow-y-auto custom-scrollbar">
             {selectedBook.chapters.map((ch, idx) => (
               <div 
                 key={ch.id}
                 onClick={() => {
                   if (selectedChapter) handleSave();
                   setSelectedChapter(ch);
                 }}
                 className={`p-4 border-b border-slate-50 dark:border-slate-700/50 cursor-pointer transition-colors text-sm
                   ${selectedChapter?.id === ch.id 
                     ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold border-l-4 border-l-indigo-600' 
                     : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
               >
                 <div className="flex items-center justify-between">
                   <span className="truncate flex-1"><span className="opacity-50 mr-2">{idx + 1}.</span> {ch.title}</span>
                 </div>
               </div>
             ))}
           </div>
        </div>

        {/* Área de Edição */}
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden relative shadow-sm">
           {selectedChapter ? (
             <>
               <div className="px-8 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                 <input 
                   type="text" 
                   value={selectedChapter.title}
                   onChange={(e) => {
                     const updated = selectedBook.chapters.map(c => c.id === selectedChapter.id ? {...c, title: e.target.value} : c);
                     const updatedBook = {...selectedBook, chapters: updated};
                     setSelectedBook(updatedBook);
                     onUpdate(updatedBook);
                   }}
                   className="w-full bg-transparent font-serif font-bold text-2xl outline-none text-slate-800 dark:text-white"
                   placeholder="Título do Capítulo"
                 />
               </div>
               <textarea 
                 value={editedContent}
                 onChange={(e) => {
                   setEditedContent(e.target.value);
                   // Auto-save debounced or similar could go here, but we use handleSave manually for now
                 }}
                 onBlur={handleSave}
                 placeholder="Comece a escrever aqui sua história..."
                 className="flex-1 w-full p-10 resize-none outline-none text-xl leading-relaxed font-serif text-slate-800 dark:text-slate-200 bg-transparent custom-scrollbar text-justify"
               />
               <div className="px-10 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-bold">{editedContent.length} caracteres | {editedContent.split(/\s+/).filter(w => w.length > 0).length} palavras</span>
                  <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">Edição Livre Ativa</p>
               </div>
             </>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 text-center">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6">
                   <svg className="w-10 h-10 opacity-30" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Editor de Texto Enriquecido</h3>
                <p className="max-w-xs text-sm">Selecione um capítulo à esquerda para começar a editar o conteúdo or adicione um novo capítulo no botão (+).</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Editor;