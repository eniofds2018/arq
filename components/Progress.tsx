
import React from 'react';
import { Ebook } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ProgressProps {
  ebooks: Ebook[];
}

const Progress: React.FC<ProgressProps> = ({ ebooks }) => {
  const chartData = ebooks.slice(0, 5).map(e => ({
    name: e.title.length > 15 ? e.title.substring(0, 15) + '...' : e.title,
    progress: e.progress,
    color: e.progress === 100 ? '#10b981' : '#6366f1'
  }));

  const totalWords = ebooks.reduce((acc, curr) => acc + curr.chapters.reduce((cAcc, cCurr) => cAcc + cCurr.content.split(' ').length, 0), 0);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-serif font-bold dark:text-white">Análise de Escrita</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Total de Publicações</p>
          <p className="text-3xl font-bold dark:text-white">{ebooks.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Palavras Escritas</p>
          <p className="text-3xl font-bold dark:text-white">{totalWords.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Taxa de Conclusão</p>
          <p className="text-3xl font-bold dark:text-white">
            {ebooks.length > 0 ? Math.round((ebooks.filter(e => e.status === 'completed').length / ebooks.length) * 100) : 0}%
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <h3 className="text-lg font-bold mb-8 dark:text-white">Progresso dos Projetos Recentes</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="progress" radius={[10, 10, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Progress;
