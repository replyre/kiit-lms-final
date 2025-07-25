import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { 
  ChevronLeft, Book, Image, Video 
} from 'lucide-react';
import { useCourse } from '../../../../../context/CourseContext';

// Block Types for the Editor (used for rendering)
const BLOCK_TYPES = {
  PARAGRAPH: 'paragraph',
  HEADING_1: 'heading1',
  HEADING_2: 'heading2', 
  HEADING_3: 'heading3',
  BULLETED_LIST: 'bulleted-list',
  NUMBERED_LIST: 'numbered-list',
  QUOTE: 'quote',
  CODE: 'code',
  IMAGE: 'image',
  VIDEO: 'video'
};

// ==================== CONTEXT & HOOKS ====================
const AppContext = createContext();

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppContext.Provider');
  }
  return context;
};

// ==================== MAIN APP COMPONENT ====================
function StudentContentSection() {
  const { courseData } = useCourse();
  
  const [modules, setModules] = useState([]);
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [currentView, setCurrentView] = useState('modules');
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    if (courseData?.syllabus?.modules) {
      const transformedModules = courseData.syllabus.modules.map(module => ({
        ...module,
        id: module._id,
        name: module.moduleTitle,
        chapters: module.chapters ? module.chapters.map(chapter => ({
          ...chapter,
          id: chapter._id,
          // The article object is simplified for easy access
          article: chapter.articles && chapter.articles.length > 0 ? {
            ...chapter.articles[0],
            id: chapter.articles[0]._id,
            chapterId: chapter._id,
          } : null
        })) : []
      }));
      setModules(transformedModules);
      // Automatically select the first module if none is active
      if (transformedModules.length > 0 && !activeModuleId) {
        setActiveModuleId(transformedModules[0].id);
      }
    }
  }, [courseData, activeModuleId]);

  // Context value now only contains state and navigation functions
  const contextValue = {
    currentView,
    setCurrentView,
    selectedArticle,
    setSelectedArticle,
    modules,
    activeModuleId,
    setActiveModuleId,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-50">
        {currentView === 'modules' ? <ModulesView /> : <ArticleView />}
      </div>
    </AppContext.Provider>
  );
}

// ==================== MODULES VIEW COMPONENTS ====================
function ModulesView() {
  const { modules, activeModuleId } = useAppContext();
  const activeModule = modules.find(m => m.id === activeModuleId);

  return (
    <div className="flex h-screen">
      <ModuleSidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-sm text-gray-500 mb-2">MODULE {modules.findIndex(m => m.id === activeModuleId) + 1}</h1>
              <h2 className="text-4xl font-bold text-gray-900">
                {activeModule?.title || 'Select a Module'}
              </h2>
            </div>
            {/* "Add Chapter" button is removed */}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeModule?.chapters?.length > 0 ? (
                activeModule.chapters.map((chapter) => (
                    <ChapterCard key={chapter.id} chapter={chapter} />
                ))
            ) : (
                <div className="col-span-full text-center py-10 text-gray-500">
                    <Book className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold">No Chapters Available</h3>
                    <p className="text-sm">This module doesn't have any chapters yet.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleSidebar() {
  const { modules, activeModuleId, setActiveModuleId } = useAppContext();

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">MODULES</h2>
      <nav className="space-y-2">
        {modules.map((module, index) => (
          <button
            key={module.id}
            onClick={() => setActiveModuleId(module.id)}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              module.id === activeModuleId
                ? 'bg-blue-50 text-blue-700 font-medium' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-sm font-medium text-gray-400 mr-3">{index + 1}.</span>
            {module.name}
          </button>
        ))}
      </nav>
    </div>
  );
}

function ChapterCard({ chapter }) {
  const { setCurrentView, setSelectedArticle } = useAppContext();

  const handleChapterClick = () => {
    if (chapter.article) {
      setSelectedArticle(chapter.article);
      setCurrentView('article');
    } else {
        // Silently do nothing or show a disabled state, as handled by the button's style
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      <div className={`${chapter.color || 'bg-gray-300'} h-48 flex items-center justify-center`}>
        <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
          <Book className="w-8 h-8 text-white" />
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-sm font-semibold text-gray-500 mb-2">{chapter.title}</h3>
        <p className="text-gray-700 text-sm mb-4 line-clamp-3">{chapter.description}</p>
        <button 
          onClick={handleChapterClick}
          className={`text-sm font-medium flex items-center ${
            chapter.article 
              ? 'text-blue-600 hover:text-blue-700' 
              : 'text-gray-400 cursor-not-allowed'
          }`}
          disabled={!chapter.article}
        >
          {chapter.article ? 'READ ARTICLE' : 'NO ARTICLE'}
          {chapter.article && <span className="ml-2">→</span>}
        </button>
      </div>
    </div>
  );
}

// ==================== ARTICLE VIEW (READ ONLY) ====================
function ArticleView() {
  const { setCurrentView, selectedArticle } = useAppContext();
  const [scrollProgress, setScrollProgress] = useState(0);
  const contentRef = useRef(null);

  useEffect(() => {
    const calculateProgress = () => {
      if (contentRef.current) {
        const element = contentRef.current;
        const scrollTop = element.scrollTop;
        const scrollHeight = element.scrollHeight - element.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };
    const element = contentRef.current;
    if (element) {
      element.addEventListener('scroll', calculateProgress);
      calculateProgress();
      return () => element.removeEventListener('scroll', calculateProgress);
    }
  }, [selectedArticle]);

  if (!selectedArticle) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">No article selected or something went wrong.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentView('modules')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Back to Modules
            </button>
            {/* "Update Article" button is removed */}
          </div>
          <div className="flex items-center space-x-4">
             <span className="text-xs text-gray-500">{Math.round(scrollProgress)}% READ</span>
            <div className="flex-1 bg-gray-200 rounded-full h-1">
              <div 
                className="bg-blue-600 h-1 rounded-full transition-all duration-150"
                style={{ width: `${scrollProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div 
        ref={contentRef}
        className="max-w-4xl mx-auto px-4 py-8 overflow-y-auto"
        style={{ maxHeight: 'calc(100vh - 120px)' }} // Adjusted height
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          {selectedArticle.title}
        </h1>
        <div className="mb-8">
          <img 
            src={selectedArticle.image?.imageUrl || 'https://placehold.co/800x400/e2e8f0/e2e8f0'} 
            alt="Article" 
            className="w-full h-96 object-cover rounded-lg shadow-sm"
          />
          <div className="mt-4 text-sm text-gray-500 text-center">
            <span>{new Date(selectedArticle.date).toLocaleTimeString()} • {new Date(selectedArticle.date).toLocaleDateString()}</span>
            <span className="ml-8">BY {selectedArticle.author}</span>
          </div>
        </div>
        <div className="max-w-3xl mx-auto">
          {/* The editor is now a read-only renderer */}
          <ReadOnlyContentRenderer article={selectedArticle} />
        </div>
      </div>
    </div>
  );
}

// ==================== READ-ONLY CONTENT RENDERER ====================
function ReadOnlyContentRenderer({ article }) {
  const [blocks, setBlocks] = useState([]);

  useEffect(() => {
    if (article?.content) {
      // Split content into blocks, assuming double newline is the separator
      const paragraphs = article.content.split('\n\n').filter(p => p.trim());
      const initialBlocks = paragraphs.map((content, index) => ({
        id: `block-${article.id}-${index}`,
        // For simplicity, we'll assume most are paragraphs.
        // A more robust system would save the type with the content.
        type: BLOCK_TYPES.PARAGRAPH, 
        content: content.trim(),
      }));
      setBlocks(initialBlocks);
    }
  }, [article]);

  return (
    <div className="prose lg:prose-xl max-w-none">
      {blocks.map((block) => (
        <BlockComponent key={block.id} block={block} />
      ))}
    </div>
  );
}

function BlockComponent({ block }) {
  // This component now only renders content, without any editing capabilities.
  const renderBlock = () => {
    const contentHtml = { __html: block.content };

    switch (block.type) {
      case BLOCK_TYPES.HEADING_1: 
        return <h1 className="text-4xl font-bold py-3 text-gray-900" dangerouslySetInnerHTML={contentHtml} />;
      case BLOCK_TYPES.HEADING_2: 
        return <h2 className="text-3xl font-bold py-3 text-gray-900" dangerouslySetInnerHTML={contentHtml} />;
      case BLOCK_TYPES.HEADING_3: 
        return <h3 className="text-2xl font-bold py-2 text-gray-900" dangerouslySetInnerHTML={contentHtml} />;
      case BLOCK_TYPES.QUOTE: 
        return <blockquote className="border-l-4 border-gray-300 pl-6 py-2 italic text-lg text-gray-700" dangerouslySetInnerHTML={contentHtml} />;
      case BLOCK_TYPES.CODE: 
        return <pre className="bg-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto border"><code>{block.content}</code></pre>;
      case BLOCK_TYPES.BULLETED_LIST: 
        return <li className="py-1" dangerouslySetInnerHTML={contentHtml}></li>;
      case BLOCK_TYPES.NUMBERED_LIST: 
        return <li className="py-1" dangerouslySetInnerHTML={contentHtml}></li>;
      case BLOCK_TYPES.IMAGE: 
        return <div className="py-4"><img src={block.content || '/api/placeholder/600/300'} alt="Content" className="w-full h-auto rounded-lg border shadow-sm" /></div>;
      case BLOCK_TYPES.VIDEO: 
        return <div className="py-4"><video src={block.content} controls className="w-full h-auto rounded-lg border shadow-sm" /></div>;
      default: 
        return <p className="py-2 text-gray-800 leading-relaxed" dangerouslySetInnerHTML={contentHtml} />;
    }
  };

  return <div className="my-2">{renderBlock()}</div>;
}


export default StudentContentSection;