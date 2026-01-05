
import React from 'react';
import { Ebook } from '../types';

interface ProjectsProps {
  ebooks: Ebook[];
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

const Projects: React.FC<ProjectsProps> = ({ ebooks, onDelete, onView }) => {
  if (ebooks.length === 0) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" /></svg>
        </div>
        <h2 className="text-xl font-bold dark:text-white">Nenhum projeto ainda</h2>
        <p className="text-slate-500 max-w-xs">Comece sua primeira publicação na seção Escritor Virtual IA.</p>
      </div>
    );
  }

  const typeMap: Record<string, string> = {
    'ebook': 'Ebook',
    'magazine': 'Revista',
    'book': 'Livro',
    'article': 'Artigo'
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-bold dark:text-white">Meus Projetos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ebooks.map((ebook) => (
          <div key={ebook.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-all group">
            <div className="h-48 bg-slate-200 dark:bg-slate-700 relative overflow-hidden">
               {ebook.coverImage ? (
                 <img src={ebook.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={ebook.title} />
               ) : (
                 <div className="flex items-center justify-center h-full text-slate-400 italic">Sem Capa</div>
               )}
               <div className="absolute top-4 right-4 bg-white/90 backdrop-blur dark:bg-slate-900/90 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  {typeMap[ebook.type] || ebook.type}
               </div>
            </div>
            <div className="p-5 space-y-3">
              <h3 className="font-bold text-lg line-clamp-1 dark:text-white">{ebook.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{ebook.theme}</p>
              
              <div className="flex items-center justify-between pt-2">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${ebook.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 'bg-amber-100 text-amber-700'}`}>
                  {ebook.status === 'completed' ? 'Concluído' : 'Rascunho'}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => onView(ebook.id)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">Ver</button>
                  <button onClick={() => onDelete(ebook.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">Excluir</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
