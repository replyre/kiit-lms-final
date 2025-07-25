import React, { useState, useEffect, createContext, useContext, useRef, useCallback } from 'react';
import { 
  ChevronLeft, Book, Bold, Italic, Underline, Link, 
  Plus, Type, Heading1, Heading2, Heading3, List, ListOrdered, 
  Quote, Code, Image, Video, MoreHorizontal, Trash2,
  GripVertical, X
} from 'lucide-react';
import { useCourse } from '../../../../../context/CourseContext';
import { updateCourse } from '../../../../../services/course.service';

// Block Types for the Editor
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
function ContentSection() {
  const { courseData, setCourseData } = useCourse();
  
  const [modules, setModules] = useState([]);
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [currentView, setCurrentView] = useState('modules');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (courseData?.syllabus?.modules) {
      const transformedModules = courseData.syllabus.modules.map(module => ({
        ...module,
        id: module._id,
        name: module.moduleTitle,
        chapters: module.chapters ? module.chapters.map(chapter => ({
          ...chapter,
          id: chapter._id,
          article: chapter.articles && chapter.articles.length > 0 ? {
            ...chapter.articles[0],
            id: chapter.articles[0]._id,
            chapterId: chapter._id,
          } : null
        })) : []
      }));
      setModules(transformedModules);
      if (transformedModules.length > 0 && !activeModuleId) {
        setActiveModuleId(transformedModules[0].id);
      }
    }
  }, [courseData, activeModuleId]);

  const handleUpdateCourse = async (updatedModules) => {
    try {
      // Create a deep copy of the entire course data to avoid direct mutation
      const courseDataPayload = JSON.parse(JSON.stringify(courseData));

      // Clean the modules array to remove frontend-specific properties
      const cleanedModules = updatedModules.map(m => {
        const {id, name, article, ...restOfModule} = m;
        return {
            ...restOfModule,
            chapters: m.chapters.map(c => {
                const {id, article, ...restOfChapter} = c;
                const articles = c.articles ? c.articles.map(a => {
                    const {chapterId, ...restOfArticle} = a;
                    return restOfArticle;
                }) : [];
                return { ...restOfChapter, articles };
            })
        }
      });
      
      // Replace the modules in our payload with the cleaned version
      courseDataPayload.syllabus.modules = cleanedModules;

      // The backend expects the data object, not including the ID
      const { _id, ...dataToSend } = courseDataPayload;

      const response = await updateCourse(courseData.id, dataToSend);
      setCourseData(response); // Update context with response from backend
      alert('Course updated successfully!');
    } catch (error) {
      console.error('Failed to update course:', error);
      alert('Failed to update course. Please try again.');
    }
  };

  const handleAddChapter = (moduleId, newChapterData) => {
    const newModules = modules.map(module => {
      if (module.id === moduleId) {
        const newChapter = {
         
          title: newChapterData.title,
          description: newChapterData.description,
          color: 'bg-blue-900', // Default color
          isActive: true,
          order: module.chapters.length + 1,
          articles: [], // Start with no articles
          articleCount: 0,
        };
        return {
          ...module,
          chapters: [...module.chapters, newChapter]
        };
      }
      return module;
    });
    setModules(newModules);
    handleUpdateCourse(newModules);
    setIsModalOpen(false);
  };

  const handleUpdateArticleContent = (articleId, newContent) => {
    const newModules = modules.map(module => ({
      ...module,
      chapters: module.chapters.map(chapter => {
        if (chapter.article && chapter.article.id === articleId) {
          const updatedArticle = { ...chapter.article, content: newContent };
          // Also update the article within the original articles array
          const updatedArticlesArray = chapter.articles.map(a => a._id === articleId ? updatedArticle : a);
          return {
            ...chapter,
            article: updatedArticle, // This is the quick-access object
            articles: updatedArticlesArray // This is the source array
          };
        }
        return chapter;
      })
    }));
    setModules(newModules);
  };
  
  const handleSaveChanges = () => {
    handleUpdateCourse(modules);
  };

  const contextValue = {
    currentView,
    setCurrentView,
    selectedArticle,
    setSelectedArticle,
    modules,
    activeModuleId,
    setActiveModuleId,
    updateArticleContent: handleUpdateArticleContent,
    openModal: () => setIsModalOpen(true),
    handleSaveChanges
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-50">
        {currentView === 'modules' ? <ModulesView /> : <ArticleView />}
        {isModalOpen && (
          <AddChapterModal
            moduleId={activeModuleId}
            onAddChapter={handleAddChapter}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </AppContext.Provider>
  );
}

// ==================== MODULES VIEW COMPONENTS ====================
function ModulesView() {
  const { modules, activeModuleId, openModal } = useAppContext();
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
            <button
              onClick={openModal}
              className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Chapter
            </button>
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
        alert("This chapter has no article to view.");
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
          {chapter.article ? 'VIEW FULL COURSE' : 'NO ARTICLE'}
          {chapter.article && <span className="ml-2">→</span>}
        </button>
      </div>
    </div>
  );
}


// ==================== ARTICLE VIEW WITH PREMIUM EDITOR ====================
function ArticleView() {
  const { setCurrentView, selectedArticle, handleSaveChanges } = useAppContext();
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
              Back
            </button>
            <button
              onClick={handleSaveChanges}
              className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Update Article
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex-1 bg-gray-300 rounded-full h-1">
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
        style={{ maxHeight: 'calc(100vh - 200px)' }}
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
          <PremiumTextEditor article={selectedArticle} />
        </div>
      </div>
      <FunctionalBottomToolbar scrollProgress={scrollProgress} />
    </div>
  );
}


// ==================== PREMIUM TEXT EDITOR ====================
function PremiumTextEditor({ article }) {
  const { updateArticleContent } = useAppContext();
  const [blocks, setBlocks] = useState([]);
  const [focusedBlockId, setFocusedBlockId] = useState(null);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [blockMenuPosition, setBlockMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedBlockId, setSelectedBlockId] = useState(null);

  useEffect(() => {
    if (article?.content) {
      const paragraphs = article.content.split('\n').filter(p => p.trim());
      const initialBlocks = paragraphs.map((content, index) => ({
        id: `block-${article.id}-${index}`,
        type: BLOCK_TYPES.PARAGRAPH,
        content: content.trim(),
        placeholder: 'Type / for commands'
      }));
      setBlocks(initialBlocks.length > 0 ? initialBlocks : [
        { id: `block-${article.id}-0`, type: BLOCK_TYPES.PARAGRAPH, content: '', placeholder: 'Start writing...' }
      ]);
    }
  }, [article]);

  const saveToArticle = useCallback((newBlocks) => {
    if (article) {
      const content = newBlocks.map(block => block.content).join('\n\n');
      updateArticleContent(article.id, content);
    }
  }, [article, updateArticleContent]);

  const addBlock = useCallback((afterId, type = BLOCK_TYPES.PARAGRAPH) => {
    const newBlock = {
      id: `block-${Date.now()}`,
      type,
      content: '',
      placeholder: getPlaceholder(type)
    };
    setBlocks(prev => {
      const index = prev.findIndex(block => block.id === afterId);
      const newBlocks = [...prev];
      newBlocks.splice(index + 1, 0, newBlock);
      saveToArticle(newBlocks);
      return newBlocks;
    });
    setTimeout(() => {
      document.querySelector(`[data-block-id="${newBlock.id}"]`)?.focus();
      setFocusedBlockId(newBlock.id);
    }, 0);
  }, [saveToArticle]);

  const updateBlock = useCallback((id, content) => {
    setBlocks(prev => {
      const newBlocks = prev.map(block => 
        block.id === id ? { ...block, content } : block
      );
      saveToArticle(newBlocks);
      return newBlocks;
    });
  }, [saveToArticle]);

  const changeBlockType = useCallback((id, newType) => {
    setBlocks(prev => {
      const newBlocks = prev.map(block => 
        block.id === id ? { ...block, type: newType, placeholder: getPlaceholder(newType) } : block
      );
      saveToArticle(newBlocks);
      return newBlocks;
    });
    setShowBlockMenu(false);
  }, [saveToArticle]);

  const deleteBlock = useCallback((id) => {
    if (blocks.length === 1) return;
    setBlocks(prev => {
      const newBlocks = prev.filter(block => block.id !== id);
      saveToArticle(newBlocks);
      return newBlocks;
    });
    setShowBlockMenu(false);
  }, [blocks.length, saveToArticle]);

  const handlePlusClick = useCallback((blockId, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setBlockMenuPosition({ x: rect.right + 10, y: rect.top });
    setSelectedBlockId(blockId);
    setShowBlockMenu(true);
  }, []);

  const insertMedia = useCallback((type) => {
    const url = prompt(`Enter ${type} URL:`);
    if (url && selectedBlockId) {
      const mediaBlock = {
        id: `block-${Date.now()}`,
        type: type === 'image' ? BLOCK_TYPES.IMAGE : BLOCK_TYPES.VIDEO,
        content: url,
        placeholder: ''
      };
      setBlocks(prev => {
        const index = prev.findIndex(block => block.id === selectedBlockId);
        const newBlocks = [...prev];
        newBlocks.splice(index + 1, 0, mediaBlock);
        saveToArticle(newBlocks);
        return newBlocks;
      });
    }
    setShowBlockMenu(false);
  }, [selectedBlockId, saveToArticle]);

  return (
    <div className="relative">
      {blocks.map((block) => (
        <BlockComponent
          key={block.id}
          block={block}
          isFocused={focusedBlockId === block.id}
          onFocus={() => setFocusedBlockId(block.id)}
          onBlur={() => setFocusedBlockId(null)}
          onUpdate={updateBlock}
          onAddBlock={addBlock}
          onPlusClick={handlePlusClick}
        />
      ))}
      <div className="flex items-center py-4">
        <button
          onClick={() => addBlock(blocks[blocks.length - 1]?.id)}
          className="flex items-center space-x-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add a block</span>
        </button>
      </div>
      {showBlockMenu && (
        <BlockMenu
          position={blockMenuPosition}
          onSelectType={(type) => {
            if (type === 'image' || type === 'video') {
              insertMedia(type);
            } else {
              addBlock(selectedBlockId, type);
            }
          }}
          onChangeType={(type) => changeBlockType(selectedBlockId, type)}
          onDelete={() => deleteBlock(selectedBlockId)}
          onClose={() => setShowBlockMenu(false)}
        />
      )}
    </div>
  );
}

// ==================== OTHER COMPONENTS ====================
function BlockComponent({ block, isFocused, onFocus, onBlur, onUpdate, onAddBlock, onPlusClick }) {
  const [showControls, setShowControls] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [formattingPosition, setFormattingPosition] = useState({ x: 0, y: 0 });
  const blockRef = useRef(null);

  const handleContentChange = useCallback((e) => {
    onUpdate(block.id, e.target.textContent || '');
  }, [block.id, onUpdate]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onAddBlock(block.id);
    }
  }, [block.id, onAddBlock]);

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0 && blockRef.current?.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setFormattingPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 50
      });
      setShowFormatting(true);
    } else {
      setShowFormatting(false);
    }
  }, []);

  const applyFormat = useCallback((command, value = null) => {
    document.execCommand(command, false, value);
    setShowFormatting(false);
    blockRef.current?.focus();
  }, []);

  useEffect(() => {
    if (blockRef.current && blockRef.current.textContent !== block.content) {
      blockRef.current.textContent = block.content;
    }
  }, [block.content]);

  const renderBlock = () => {
    const commonProps = {
      ref: blockRef,
      'data-block-id': block.id,
      contentEditable: block.type !== BLOCK_TYPES.IMAGE && block.type !== BLOCK_TYPES.VIDEO,
      suppressContentEditableWarning: true,
      onInput: handleContentChange,
      onFocus,
      onBlur,
      onKeyDown: handleKeyDown,
      onMouseUp: handleMouseUp,
      className: `focus:outline-none w-full ${isFocused ? 'ring-2 ring-blue-200 ring-opacity-50 rounded' : ''}`,
      style: { minHeight: '1.5rem' },
      'data-placeholder': block.placeholder
    };

    switch (block.type) {
      case BLOCK_TYPES.HEADING_1: return <h1 {...commonProps} className={`${commonProps.className} text-4xl font-bold py-3 text-gray-900`} />;
      case BLOCK_TYPES.HEADING_2: return <h2 {...commonProps} className={`${commonProps.className} text-3xl font-bold py-3 text-gray-900`} />;
      case BLOCK_TYPES.HEADING_3: return <h3 {...commonProps} className={`${commonProps.className} text-2xl font-bold py-2 text-gray-900`} />;
      case BLOCK_TYPES.QUOTE: return <blockquote {...commonProps} className={`${commonProps.className} border-l-4 border-gray-300 pl-6 py-2 italic text-lg text-gray-700`} />;
      case BLOCK_TYPES.CODE: return <pre {...commonProps} className={`${commonProps.className} bg-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto border`} />;
      case BLOCK_TYPES.BULLETED_LIST: return <div className="flex items-start py-1"><span className="text-gray-400 mt-2 mr-3">•</span><div {...commonProps} className={`${commonProps.className} flex-1 py-1`} /></div>;
      case BLOCK_TYPES.NUMBERED_LIST: return <div className="flex items-start py-1"><span className="text-gray-400 mt-2 mr-3">1.</span><div {...commonProps} className={`${commonProps.className} flex-1 py-1`} /></div>;
      case BLOCK_TYPES.IMAGE: return <div className="py-4"><img src={block.content || '/api/placeholder/600/300'} alt="Content" className="w-full h-auto rounded-lg border shadow-sm" /></div>;
      case BLOCK_TYPES.VIDEO: return <div className="py-4"><video src={block.content} controls className="w-full h-auto rounded-lg border shadow-sm" /></div>;
      default: return <p {...commonProps} className={`${commonProps.className} py-2 text-gray-800 leading-relaxed`} />;
    }
  };

  return (
    <div className="group relative" onMouseEnter={() => setShowControls(true)} onMouseLeave={() => setShowControls(false)}>
      {showControls && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-12 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => onPlusClick(block.id, e)} className="w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:border-gray-300 transition-colors" title="Add block"><Plus className="w-4 h-4 text-gray-500" /></button>
          <button className="w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:border-gray-300 transition-colors cursor-grab" title="Drag to move"><GripVertical className="w-4 h-4 text-gray-500" /></button>
        </div>
      )}
      {renderBlock()}
      {showFormatting && (
        <div className="fixed z-50 bg-gray-900 rounded-lg shadow-lg p-2 flex items-center space-x-1" style={{ left: formattingPosition.x, top: formattingPosition.y, transform: 'translateX(-50%)' }}>
          <button onClick={() => applyFormat('bold')} className="p-2 text-white hover:bg-gray-700 rounded transition-colors" title="Bold"><Bold className="w-4 h-4" /></button>
          <button onClick={() => applyFormat('italic')} className="p-2 text-white hover:bg-gray-700 rounded transition-colors" title="Italic"><Italic className="w-4 h-4" /></button>
          <button onClick={() => applyFormat('underline')} className="p-2 text-white hover:bg-gray-700 rounded transition-colors" title="Underline"><Underline className="w-4 h-4" /></button>
          <div className="w-px h-6 bg-gray-600 mx-1" />
          <button onClick={() => { const url = prompt('Enter link URL:'); if (url) applyFormat('createLink', url); }} className="p-2 text-white hover:bg-gray-700 rounded transition-colors" title="Link"><Link className="w-4 h-4" /></button>
          <button onClick={() => setShowFormatting(false)} className="p-1 text-white hover:bg-gray-700 rounded text-xs">×</button>
        </div>
      )}
    </div>
  );
}

function BlockMenu({ position, onSelectType, onChangeType, onDelete, onClose }) {
  const blockTypes = [
    { type: BLOCK_TYPES.PARAGRAPH, icon: Type, label: 'Text', shortcut: '' },
    { type: BLOCK_TYPES.HEADING_1, icon: Heading1, label: 'Heading 1', shortcut: '# + space' },
    { type: BLOCK_TYPES.HEADING_2, icon: Heading2, label: 'Heading 2', shortcut: '## + space' },
    { type: BLOCK_TYPES.HEADING_3, icon: Heading3, label: 'Heading 3', shortcut: '### + space' },
    { type: BLOCK_TYPES.BULLETED_LIST, icon: List, label: 'Bulleted List', shortcut: '- + space' },
    { type: BLOCK_TYPES.NUMBERED_LIST, icon: ListOrdered, label: 'Numbered List', shortcut: '1. + space' },
    { type: BLOCK_TYPES.QUOTE, icon: Quote, label: 'Quote', shortcut: '> + space' },
    { type: BLOCK_TYPES.CODE, icon: Code, label: 'Code', shortcut: '``` + space' },
    { type: 'image', icon: Image, label: 'Image', shortcut: '' },
    { type: 'video', icon: Video, label: 'Video', shortcut: '' }
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.block-menu')) onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div className="block-menu fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-80" style={{ left: position.x, top: position.y }}>
      <div className="px-3 pb-2"><h3 className="text-sm font-semibold text-gray-700">Add Block</h3></div>
      <div className="max-h-96 overflow-y-auto">
        {blockTypes.map((blockType) => (
          <button key={blockType.type} onClick={() => onSelectType(blockType.type)} className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center space-x-3 transition-colors">
            <blockType.icon className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">{blockType.label}</div>
              {blockType.shortcut && <div className="text-xs text-gray-500">{blockType.shortcut}</div>}
            </div>
          </button>
        ))}
      </div>
      <div className="border-t border-gray-200 mt-2 pt-2">
        <button onClick={onDelete} className="w-full px-3 py-2 text-left hover:bg-red-50 flex items-center space-x-3 transition-colors text-red-600">
          <Trash2 className="w-5 h-5" />
          <span className="text-sm font-medium">Delete Block</span>
        </button>
      </div>
    </div>
  );
}

function FunctionalBottomToolbar({ scrollProgress }) {
  const handleExplain = () => alert('Explain feature - This would provide AI explanations of selected content');
  const handleAskAI = () => {
    const question = prompt('What would you like to ask AI about this content?');
    if (question) alert(`AI Response: I'd help you with "${question}" - this would connect to an AI service`);
  };
  const handleComment = () => {
    const comment = prompt('Add a comment:');
    if (comment) alert(`Comment added: "${comment}" - this would save to the backend`);
  };
  const toggleBulletedList = () => document.execCommand('insertUnorderedList', false, null);

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-gray-900 rounded-lg px-4 py-2 flex items-center space-x-4 text-white text-sm shadow-lg">
        <button onClick={handleExplain} className="text-green-400 hover:text-green-300 transition-colors font-medium">Explain</button>
        <button onClick={handleAskAI} className="text-blue-400 hover:text-blue-300 transition-colors font-medium">Ask AI</button>
        <button onClick={handleComment} className="text-yellow-400 hover:text-yellow-300 transition-colors font-medium">Comment</button>
        <button onClick={toggleBulletedList} className="text-purple-400 hover:text-purple-300 transition-colors font-medium">Bulleted list</button>
        <div className="flex items-center space-x-1 border-l border-gray-600 pl-4 ml-2">
          <Bold className="w-4 h-4 text-gray-300" />
          <Italic className="w-4 h-4 text-gray-300" />
          <Underline className="w-4 h-4 text-gray-300" />
        </div>
        <div className="flex items-center space-x-2 border-l border-gray-600 pl-4">
          <span>Status: In Progress</span>
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span className="text-xs">({Math.round(scrollProgress)}%)</span>
        </div>
      </div>
    </div>
  );
}

function getPlaceholder(type) {
  switch (type) {
    case BLOCK_TYPES.HEADING_1: return 'Heading 1';
    case BLOCK_TYPES.HEADING_2: return 'Heading 2';
    case BLOCK_TYPES.HEADING_3: return 'Heading 3';
    case BLOCK_TYPES.QUOTE: return 'Quote';
    case BLOCK_TYPES.CODE: return 'Enter code';
    case BLOCK_TYPES.BULLETED_LIST: return 'List item';
    case BLOCK_TYPES.NUMBERED_LIST: return 'List item';
    default: return 'Type / for commands';
  }
}

// ==================== ADD CHAPTER MODAL ====================
function AddChapterModal({ moduleId, onAddChapter, onClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Please fill in both title and description.');
      return;
    }
    onAddChapter(moduleId, { title, description });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add New Chapter</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="chapter-title" className="block text-sm font-medium text-gray-700 mb-1">Chapter Title</label>
            <input
              id="chapter-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Introduction to Calculus"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="chapter-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              id="chapter-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="A brief overview of the chapter's content."
              required
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Chapter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ContentSection;
