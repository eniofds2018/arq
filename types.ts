
export enum AppView {
  WRITER = 'writer',
  PROJECTS = 'projects',
  EDITOR = 'editor',
  PROGRESS = 'progress',
  LIBRARY = 'library',
  SETTINGS = 'settings',
  REVISOR = 'revisor'
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  image?: string;
  status: 'pending' | 'writing' | 'completed';
}

export interface EbookSource {
  name: string;
  content: string; // Base64 data ou texto simples
  mimeType: string;
  isBinary: boolean;
  pageCount?: number;
  error?: string;
}

export interface Ebook {
  id: string;
  title: string;
  author?: string;
  volume?: string;
  type: 'ebook' | 'magazine' | 'book' | 'article';
  theme: string;
  style?: string;
  formatting?: string;
  pagesGoal?: number;
  coverImage?: string;
  // Preferências de exibição na capa
  showTitleOnCover: boolean;
  showAuthorOnCover: boolean;
  showVolumeOnCover: boolean;
  chapters: Chapter[];
  references?: string;
  createdAt: number;
  progress: number;
  status: 'draft' | 'completed';
  sources?: EbookSource[];
}

export interface AppSettings {
  language: string;
  theme: 'light' | 'dark';
  accentColor: string;
}
