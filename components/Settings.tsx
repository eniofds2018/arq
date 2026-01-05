
import React from 'react';
import { AppSettings } from '../types';

interface SettingsProps {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  ebooksCount: number;
}

const Settings: React.FC<SettingsProps> = ({ settings, setSettings, ebooksCount }) => {
  const languages = ['Português', 'Inglês', 'Espanhol', 'Francês', 'Alemão'];
  const colors = [
    { name: 'Índigo', class: 'indigo-600' },
    { name: 'Rosa', class: 'rose-500' },
    { name: 'Esmeralda', class: 'emerald-500' },
    { name: 'Âmbar', class: 'amber-500' }
  ];

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-3xl font-serif font-bold dark:text-white">Configurações</h1>

      <section className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Idioma do App</label>
          <select 
            value={settings.language}
            onChange={(e) => setSettings({ ...settings, language: e.target.value })}
            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none"
          >
            {languages.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tema do Aplicativo</label>
          <div className="flex gap-4">
            <button 
              onClick={() => setSettings({ ...settings, theme: 'light' })}
              className={`flex-1 py-4 rounded-xl border-2 transition-all font-medium
                ${settings.theme === 'light' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-500'}`}
            >
              Modo Claro
            </button>
            <button 
              onClick={() => setSettings({ ...settings, theme: 'dark' })}
              className={`flex-1 py-4 rounded-xl border-2 transition-all font-medium
                ${settings.theme === 'dark' ? 'border-indigo-600 bg-indigo-900/30 text-indigo-400' : 'border-slate-700 text-slate-500'}`}
            >
              Modo Escuro
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Cor de Destaque</label>
          <div className="flex gap-4">
            {colors.map(c => (
              <button
                key={c.class}
                onClick={() => setSettings({ ...settings, accentColor: c.class })}
                className={`w-10 h-10 rounded-full bg-${c.class} border-4 transition-all
                  ${settings.accentColor === c.class ? 'border-white dark:border-slate-900 ring-2 ring-slate-400' : 'border-transparent opacity-60'}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="font-bold dark:text-white">Status de Armazenamento</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Armazenamento Persistente</span>
            <span className="font-medium dark:text-white">{(ebooksCount * 1.2).toFixed(1)} MB / Ilimitado*</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full" style={{ width: `${Math.min((ebooksCount / 50) * 100, 100)}%` }}></div>
          </div>
          <p className="text-[10px] text-slate-400 italic">Os projetos são salvos no banco de dados local do seu navegador (IndexedDB), permitindo múltiplos ebooks com imagens em alta resolução.</p>
        </div>
      </section>
      
      <div className="flex justify-between items-center text-slate-400 text-xs px-4">
        <span>Versão 1.1.0-stable</span>
        <span>Desenvolvido com Gemini 3 Pro & IndexedDB</span>
      </div>
    </div>
  );
};

export default Settings;
