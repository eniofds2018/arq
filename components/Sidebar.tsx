
import React from 'react';
import { AppView } from '../types';
import { ICONS } from '../constants';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  accentColor: string;
  theme: 'light' | 'dark';
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, accentColor, theme }) => {
  const menuItems = [
    { id: AppView.WRITER, label: 'Escritor Virtual IA', icon: ICONS.Writer },
    { id: AppView.PROJECTS, label: 'Meus Projetos', icon: ICONS.Projects },
    { id: AppView.EDITOR, label: 'Editor', icon: ICONS.Editor },
    { id: AppView.REVISOR, label: 'Revisor & Formatador', icon: ICONS.Revisor },
    { id: AppView.PROGRESS, label: 'Progresso', icon: ICONS.Progress },
    { id: AppView.LIBRARY, label: 'Livraria Virtual', icon: ICONS.Library },
    { id: AppView.SETTINGS, label: 'Configurações', icon: ICONS.Settings },
  ];

  const bgColor = theme === 'dark' ? 'bg-slate-800' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-slate-700' : 'border-gray-200';

  return (
    <aside className={`w-20 md:w-64 h-screen flex flex-col border-r ${bgColor} ${borderColor} transition-all duration-300`}>
      <div className="p-6 flex items-center gap-3">
        <div className={`p-2 rounded-xl bg-${accentColor} text-white shadow-lg shadow-indigo-200`}>
          <ICONS.Magic />
        </div>
        <span className="hidden md:block font-serif text-xl font-bold tracking-tight">EbookGenie</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group
              ${currentView === item.id 
                ? `bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600` 
                : theme === 'dark' ? 'text-slate-400 hover:bg-slate-700' : 'text-gray-500 hover:bg-gray-100'
              }`}
          >
            <item.icon />
            <span className="hidden md:block font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className={`hidden md:block p-4 rounded-2xl ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-indigo-50'} text-indigo-600`}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1">Modo Escritor</p>
          <p className="text-sm">Gemini 3 Pro Ativo</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
