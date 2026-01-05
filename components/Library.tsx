
import React, { useState } from 'react';
import { Ebook } from '../types';
import { ICONS } from '../constants';
import * as docx from 'docx';
import PptxGenJS from 'pptxgenjs';
import saveAs from 'file-saver';

declare var html2pdf: any;

interface LibraryProps {
  ebooks: Ebook[];
}

interface PdfConfig {
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  fontSize: number;
  lineHeight: number;
}

type ExportFormat = 'pdf' | 'docx' | 'pptx';

const BookCover: React.FC<{ ebook: Ebook; size?: 'sm' | 'lg' }> = ({ ebook, size = 'sm' }) => {
  return (
    <div className={`relative rounded-2xl overflow-hidden shadow-2xl transition-all ${size === 'lg' ? 'w-full' : 'w-full aspect-[3/4] group-hover:scale-105 duration-500'}`}>
      <img src={ebook.coverImage} className="w-full h-full object-cover" alt="" />
      
      {/* Overlay de Textos Baseado em Configuração */}
      <div className={`absolute inset-0 bg-black/30 flex flex-col p-6 text-white text-center transition-opacity ${size === 'sm' ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
        <div className="flex-1 flex flex-col justify-center gap-4">
           {ebook.showTitleOnCover && (
             <h3 className={`font-serif font-bold leading-tight drop-shadow-lg ${size === 'lg' ? 'text-4xl' : 'text-lg'}`}>
               {ebook.title}
             </h3>
           )}
           {ebook.showVolumeOnCover && ebook.volume && (
             <span className="text-[10px] font-black uppercase tracking-[0.3em] bg-indigo-600/80 self-center px-3 py-1 rounded-full">
               Volume {ebook.volume}
             </span>
           )}
        </div>
        {ebook.showAuthorOnCover && ebook.author && (
          <p className={`font-bold tracking-widest uppercase border-t border-white/30 pt-4 ${size === 'lg' ? 'text-sm' : 'text-[10px]'}`}>
            {ebook.author}
          </p>
        )}
      </div>
    </div>
  );
};

const Library: React.FC<LibraryProps> = ({ ebooks }) => {
  const [selectedBook, setSelectedBook] = useState<Ebook | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [bookToExport, setBookToExport] = useState<Ebook | null>(null);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');
  
  const [pdfConfig, setPdfConfig] = useState<PdfConfig>({
    marginTop: 15,
    marginBottom: 15,
    marginLeft: 20,
    marginRight: 20,
    fontSize: 12,
    lineHeight: 1.6
  });

  const cleanText = (text: string) => {
    return text
      .replace(/\*\*/g, '') 
      .replace(/\_\_/g, '') 
      .replace(/###/g, '')  
      .replace(/##/g, '')
      .replace(/#/g, '')
      .replace(/^- /gm, '• ') 
      .trim();
  };

  const base64ToArrayBuffer = async (base64: string): Promise<ArrayBuffer> => {
    const res = await fetch(base64);
    return await res.arrayBuffer();
  };

  const generateWord = async (book: Ebook) => {
    try {
      const children = [];

      if (book.coverImage) {
        const coverBuffer = await base64ToArrayBuffer(book.coverImage);
        children.push(new docx.Paragraph({
          children: [new docx.ImageRun({ data: coverBuffer, transformation: { width: 600, height: 800 } })],
          alignment: docx.AlignmentType.CENTER,
        }));
      }

      children.push(new docx.Paragraph({
        children: [new docx.TextRun({ text: book.title, bold: true, size: 64 })],
        alignment: docx.AlignmentType.CENTER,
        spacing: { before: 400, after: 200 },
      }));

      // Capítulos
      for (const ch of book.chapters) {
        children.push(new docx.Paragraph({ children: [], pageBreakBefore: true }));
        children.push(new docx.Paragraph({
          children: [new docx.TextRun({ text: ch.title, bold: true, size: 48 })],
          spacing: { before: 400, after: 400 },
        }));
        if (ch.image) {
          const imgBuffer = await base64ToArrayBuffer(ch.image);
          children.push(new docx.Paragraph({
            children: [new docx.ImageRun({ data: imgBuffer, transformation: { width: 550, height: 310 } })],
            alignment: docx.AlignmentType.CENTER,
          }));
        }
        cleanText(ch.content).split('\n').forEach(p => {
          if (p.trim()) children.push(new docx.Paragraph({ children: [new docx.TextRun({ text: p.trim(), size: 24 })], spacing: { after: 200 } }));
        });
      }

      const doc = new docx.Document({ sections: [{ properties: {}, children }] });
      const blob = await docx.Packer.toBlob(doc);
      saveAs(blob, `${book.title}.docx`);
    } catch (e) { alert("Erro no Word"); }
  };

  const generatePdf = async () => {
    if (!bookToExport) return;
    const book = bookToExport;
    const chaptersHtml = book.chapters.map((ch, idx) => `
      <section class="chapter">
        <h3 class="chapter-title">${ch.title}</h3>
        ${ch.image ? `<img src="${ch.image}" style="width:100%; border-radius:8px; margin-bottom:15px">` : ''}
        <div class="chapter-content">${cleanText(ch.content).replace(/\n/g, '<br>')}</div>
      </section>
    `).join('');

    const htmlContent = `
      <div id="pdf-content" style="font-family: serif; padding: 20px; line-height: ${pdfConfig.lineHeight}; font-size: ${pdfConfig.fontSize}pt;">
        <div style="text-align:center; page-break-after: always;">
          <img src="${book.coverImage}" style="width:100%; max-width:500px; margin-bottom:20px">
          <h1 style="font-size: 3em;">${book.title}</h1>
          <p style="color: #6366f1; font-weight:bold">${book.type.toUpperCase()}</p>
        </div>
        ${chaptersHtml}
      </div>
    `;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    document.body.appendChild(tempDiv);
    const options = { margin: pdfConfig.marginTop, filename: `${book.title}.pdf`, jsPDF: { unit: 'mm', format: 'a4' } };
    try { await html2pdf().from(tempDiv).set(options).save(); } finally { document.body.removeChild(tempDiv); }
  };

  const handleExport = async () => {
    if (!bookToExport) return;
    setIsExporting(true);
    if (exportFormat === 'pdf') await generatePdf();
    else if (exportFormat === 'docx') await generateWord(bookToExport);
    setIsExporting(false);
    setShowExportModal(false);
  };

  if (ebooks.length === 0) return <div className="h-96 flex flex-col items-center justify-center text-slate-500">Livraria Vazia</div>;

  return (
    <div className="space-y-8 pb-12">
      <h1 className="text-3xl font-serif font-bold dark:text-white">Livraria Virtual</h1>
      
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <h3 className="text-2xl font-bold mb-6">Exportar Obra Profissional</h3>
            <div className="flex gap-2 mb-8">
              {(['pdf', 'docx', 'pptx'] as const).map(f => (
                <button key={f} onClick={() => setExportFormat(f)} className={`flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${exportFormat === f ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{f}</button>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowExportModal(false)} className="px-6 py-3 text-slate-400 font-bold uppercase text-[10px]">Cancelar</button>
              <button onClick={handleExport} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-lg">Baixar Arquivo</button>
            </div>
          </div>
        </div>
      )}

      {!selectedBook ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {ebooks.map(book => (
            <div key={book.id} className="group">
              <div className="cursor-pointer" onClick={() => setSelectedBook(book)}>
                <BookCover ebook={book} size="sm" />
              </div>
              <div className="mt-6 space-y-2">
                <h3 className="font-bold text-sm truncate dark:text-white">{book.title}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{book.author || 'Anônimo'} • {book.type}</p>
                <button onClick={() => { setBookToExport(book); setShowExportModal(true); }} className="w-full py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest mt-4 hover:bg-indigo-600 transition-colors">Exportar</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-700 min-h-[80vh] animate-in slide-in-from-bottom-10">
          <div className="md:flex h-full">
            <div className="md:w-1/3 p-12 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-100 dark:border-slate-700">
              <BookCover ebook={selectedBook} size="lg" />
              <button onClick={() => setSelectedBook(null)} className="mt-12 text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] hover:text-indigo-600 transition-colors flex items-center gap-2">
                 <span>←</span> Retornar à Estante
              </button>
              
              <div className="mt-12 space-y-6">
                <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Autor</p>
                   <p className="font-bold dark:text-white">{selectedBook.author || 'Não informado'}</p>
                </div>
                <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Estilo</p>
                   <p className="font-bold dark:text-white">{selectedBook.style || 'Narrativo'}</p>
                </div>
              </div>
            </div>
            <div className="md:w-2/3 p-8 md:p-16 overflow-y-auto max-h-[90vh] custom-scrollbar">
              <h2 className="text-5xl font-serif font-bold mb-12 dark:text-white leading-tight">{selectedBook.title}</h2>
              <div className="space-y-20">
                {selectedBook.chapters.map((ch, i) => (
                  <div key={i} className="max-w-none">
                    <div className="flex items-center gap-4 mb-6">
                       <span className="h-px flex-1 bg-slate-100 dark:bg-slate-700"></span>
                       <h4 className="text-indigo-500 font-black uppercase text-[10px] tracking-[0.3em]">Capítulo {i+1}</h4>
                       <span className="h-px flex-1 bg-slate-100 dark:bg-slate-700"></span>
                    </div>
                    <h3 className="text-3xl font-bold mb-10 dark:text-white font-serif">{ch.title}</h3>
                    {ch.image && <img src={ch.image} className="rounded-[2rem] mb-12 shadow-xl w-full" />}
                    <div className="text-xl leading-relaxed whitespace-pre-wrap dark:text-slate-300 font-serif text-justify">{cleanText(ch.content)}</div>
                  </div>
                ))}
                
                {selectedBook.references && (
                  <div className="pt-20 border-t border-slate-100 dark:border-slate-700 mt-20">
                    <h3 className="text-2xl font-serif font-bold text-indigo-600 mb-8 italic">Referências e Fontes</h3>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[2rem] text-sm italic text-slate-600 dark:text-slate-400 leading-relaxed font-serif">
                      {cleanText(selectedBook.references)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;
