
import React, { useState, useEffect } from 'react';
import { AppView, Ebook, AppSettings } from './types';
import { ICONS, COLORS } from './constants';
import Sidebar from './components/Sidebar';
import Writer from './components/Writer';
import Projects from './components/Projects';
import Library from './components/Library';
import Settings from './components/Settings';
import Progress from './components/Progress';
import Revisor from './components/Revisor';
import Editor from './components/Editor';
import { storageService } from './services/storage';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.WRITER);
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('ebookgenie_settings');
      return saved ? JSON.parse(saved) : { language: 'Português', theme: 'light', accentColor: 'indigo-600' };
    } catch (error) {
      return { language: 'Português', theme: 'light', accentColor: 'indigo-600' };
    }
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedEbooks = await storageService.getAllEbooks();
        setEbooks(savedEbooks.sort((a, b) => b.createdAt - a.createdAt));
      } catch (error) {
        console.error("Erro ao carregar projetos do banco de dados:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      storageService.saveEbooks(ebooks).catch(err => {
        console.error("Erro ao persistir mudanças no banco de dados:", err);
      });
    }
  }, [ebooks, isLoading]);

  useEffect(() => {
    localStorage.setItem('ebookgenie_settings', JSON.stringify(settings));
    if (settings.theme === 'dark') {
      document.body.classList.add('bg-slate-900', 'text-white');
      document.body.classList.remove('bg-gray-50', 'text-gray-900');
    } else {
      document.body.classList.remove('bg-slate-900', 'text-white');
      document.body.classList.add('bg-gray-50', 'text-gray-900');
    }
  }, [settings]);

  const addEbook = (newEbook: Ebook) => {
    setEbooks(prev => [newEbook, ...prev]);
  };

  const updateEbook = (updatedEbook: Ebook) => {
    setEbooks(prev => prev.map(e => e.id === updatedEbook.id ? updatedEbook : e));
  };

  const deleteEbook = (id: string) => {
    setEbooks(prev => prev.filter(e => e.id !== id));
    storageService.deleteEbook(id).catch(console.error);
  };

  const renderView = () => {
    if (isLoading) return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );

    switch (currentView) {
      case AppView.WRITER:
        return <Writer onComplete={addEbook} settings={settings} />;
      case AppView.PROJECTS:
        return <Projects ebooks={ebooks} onDelete={deleteEbook} onView={(id) => setCurrentView(AppView.EDITOR)} />;
      case AppView.EDITOR:
        return <Editor ebooks={ebooks} onUpdate={updateEbook} onAdd={addEbook} />;
      case AppView.REVISOR:
        return <Revisor />;
      case AppView.PROGRESS:
        return <Progress ebooks={ebooks} />;
      case AppView.LIBRARY:
        return <Library ebooks={ebooks.filter(e => e.status === 'completed')} />;
      case AppView.SETTINGS:
        return <Settings settings={settings} setSettings={setSettings} ebooksCount={ebooks.length} />;
      default:
        return <Writer onComplete={addEbook} settings={settings} />;
    }
  };

  return (
    <div className={`flex min-h-screen ${settings.theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-gray-50 text-slate-900'}`}>
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        accentColor={settings.accentColor}
        theme={settings.theme}
      />
      <main className="flex-1 overflow-y-auto h-screen relative">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
