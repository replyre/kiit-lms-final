import React, { useState, useEffect, createContext, useContext, useRef, useCallback } from 'react';
import {
  ChevronLeft, Book, Bold, Italic, Underline, Link,
  Plus, Type, Heading1, Heading2, Heading3, List, ListOrdered,
  Quote, Code, Image as ImageIcon, Video, MoreHorizontal, Trash2,
  GripVertical, X
} from 'lucide-react';
import { useCourse } from '../../../../../context/CourseContext';
import { addChapterToModule, addArticleToChapter, updateArticle, deleteChapter } from '../../../../../services/article.service';

// --- Block Types for the Editor ---
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

// =================================================================
// CONTEXT & HOOKS
// =================================================================
const AppContext = createContext();

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppContext.Provider');
  }
  return context;
};

// =================================================================
// LOADER COMPONENT
// =================================================================
function FullScreenLoader({ text = "Processing..." }) {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex flex-col items-center justify-center z-[100]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-400"></div>
      <p className="text-white text-xl font-semibold mt-6">{text}</p>
    </div>
  );
}

// =================================================================
// MAIN APP COMPONENT
// =================================================================
function ContentSection() {
  const { courseData, setCourseData } = useCourse();

  const [modules, setModules] = useState([]);
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [currentView, setCurrentView] = useState('modules');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Updating Course...");

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
            moduleId: module._id
          } : null
        })) : []
      }));
      setModules(transformedModules);
      if (transformedModules.length > 0 && !activeModuleId) {
        setActiveModuleId(transformedModules[0].id);
      }
    }
  }, [courseData, activeModuleId]);

  const handleAddChapter = async (moduleId, newChapterData) => {
    setIsModalOpen(false);
    setLoadingText("Adding Chapter...");
    setIsLoading(true);

    try {
      const payload = { ...newChapterData, color: 'bg-blue-900' };
      const response = await addChapterToModule(courseData.id, moduleId, payload);
      if (response.success && response.chapter) {
        const newCourseData = JSON.parse(JSON.stringify(courseData));
        const moduleToUpdate = newCourseData.syllabus.modules.find(m => m._id === moduleId);
        if (moduleToUpdate) {
          if (!moduleToUpdate.chapters) moduleToUpdate.chapters = [];
          moduleToUpdate.chapters.push(response.chapter);
          setCourseData(newCourseData);
          alert('Chapter added successfully!');
        }
      } else { throw new Error(response.message || 'Failed to add chapter.'); }
    } catch (error) {
      console.error('Failed to add chapter:', error);
      alert(error.message || 'Failed to add chapter. Please try again.');
    } finally { setIsLoading(false); }
  };

  const handleDeleteChapter = async (moduleId, chapterId) => {
    if (!window.confirm('Are you sure you want to delete this chapter? This action cannot be undone.')) return;
    setLoadingText("Deleting Chapter...");
    setIsLoading(true);

    try {
      const response = await deleteChapter(courseData._id, moduleId, chapterId);
      if (response.success) {
        const newCourseData = JSON.parse(JSON.stringify(courseData));
        const moduleToUpdate = newCourseData.syllabus.modules.find(m => m._id === moduleId);
        if (moduleToUpdate) {
          moduleToUpdate.chapters = moduleToUpdate.chapters.filter(c => c._id !== chapterId);
          setCourseData(newCourseData);
          alert('Chapter deleted successfully!');
        }
      } else { throw new Error(response.message || 'Could not delete the chapter.'); }
    } catch (error) {
      console.error('Failed to delete chapter:', error);
      alert(error.message || 'Failed to delete chapter. Please try again.');
    } finally { setIsLoading(false); }
  };

  const handleAddNewArticle = (moduleId, chapterId, chapterTitle) => {
    const newArticleTemplate = {
      id: `new-${Date.now()}`,
      isNew: true,
      title: "",
      content: 'Start writing your amazing article here...\n\nYou can add different blocks like headings, lists, and images using the editor tools.',
      author: 'Admin',
      date: new Date().toISOString(),
      image: { imageUrl: 'https://placehold.co/800x400/e2e8f0/e2e8f0?text=Select+an+Image' },
      moduleId,
      chapterId,
    };
    setSelectedArticle(newArticleTemplate);
    setCurrentView('article');
  };

  // ✅ MODIFIED: Switched from 'imageUrl' to 'imageFile' to handle file uploads.
  const handleCreateArticle = async (articleData) => {
    setLoadingText("Creating Article...");
    setIsLoading(true);

    const { moduleId, chapterId, title, content, author, date, imageFile } = articleData;

    try {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('author', author);
        formData.append('date', date);

        // Append the file if it exists, with the key 'image'
        if (imageFile) {
            formData.append('image', imageFile);
        }

        const response = await addArticleToChapter(courseData.id, moduleId, chapterId, formData);

        if (response.success && response.article) {
            const newCourseData = JSON.parse(JSON.stringify(courseData));
            const moduleToUpdate = newCourseData.syllabus.modules.find(m => m._id === moduleId);
            if (moduleToUpdate) {
                const chapterToUpdate = moduleToUpdate.chapters.find(c => c._id === chapterId);
                if (chapterToUpdate) {
                    if (!chapterToUpdate.articles) chapterToUpdate.articles = [];
                    chapterToUpdate.articles.push(response.article);
                    setCourseData(newCourseData);
                    alert('Article created successfully!');
                    setCurrentView('modules');
                }
            }
        } else { throw new Error(response.message || 'Failed to create article.'); }
    } catch (error) {
        console.error('Failed to create article:', error);
        alert(error.message || 'Failed to create article. Please try again.');
    } finally { setIsLoading(false); }
  };

  const contextValue = {
    currentView, setCurrentView,
    selectedArticle, setSelectedArticle,
    modules, activeModuleId, setActiveModuleId,
    courseData, setCourseData,
    isLoading, setIsLoading,
    loadingText, setLoadingText,
    openModal: () => setIsModalOpen(true),
    handleDeleteChapter,
    handleAddNewArticle,
    handleCreateArticle
  };

  return (
    <AppContext.Provider value={contextValue}>
      {isLoading && <FullScreenLoader text={loadingText} />}
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


// =================================================================
// MODULES VIEW COMPONENTS
// =================================================================
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
              <h2 className="text-4xl font-bold text-gray-900">{activeModule?.moduleTitle || 'Select a Module'}</h2>
            </div>
            <button
              onClick={openModal}
              className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Add Chapter
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeModule?.chapters?.length > 0 ? (
              activeModule.chapters.map((chapter) => (
                <ChapterCard key={chapter.id || chapter.title} chapter={chapter} moduleId={activeModule.id} />
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
            }`}>
            <span className="text-sm font-medium text-gray-400 mr-3">{index + 1}.</span>
            {module.name}
          </button>
        ))}
      </nav>
    </div>
  );
}

function ChapterCard({ chapter, moduleId }) {
  const { setCurrentView, setSelectedArticle, handleDeleteChapter, handleAddNewArticle } = useAppContext();

  const handleChapterClick = () => {
    if (chapter.article) {
      setSelectedArticle(chapter.article);
      setCurrentView('article');
    }
  };

  const onAddArticleClick = (e) => {
    e.stopPropagation();
    handleAddNewArticle(moduleId, chapter.id, chapter.title);
  };

  const onDeleteClick = (e) => {
    e.stopPropagation();
    handleDeleteChapter(moduleId, chapter.id);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group relative flex flex-col">
      <button
        onClick={onDeleteClick}
        className="absolute top-3 right-3 z-10 p-2 bg-white/60 backdrop-blur-sm rounded-full text-red-600 hover:bg-red-100 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-all duration-200"
        title="Delete Chapter">
        <Trash2 className="w-4 h-4" />
      </button>

      <div onClick={chapter.article ? handleChapterClick : undefined} className={chapter.article ? "cursor-pointer" : ""}>
        <div className={`${chapter.color || 'bg-gray-300'} h-48 flex items-center justify-center`}>
          <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
            <Book className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">{chapter.title}</h3>
          <p className="text-gray-700 text-sm mb-4 line-clamp-3 h-16">{chapter.description}</p>
        </div>
      </div>
      
      <div className="p-6 pt-0 mt-auto">
        {chapter.article ? (
          <button
            onClick={handleChapterClick}
            className="w-full text-sm font-medium flex items-center text-blue-600 hover:text-blue-700 group-hover:text-blue-800">
            VIEW ARTICLE
            <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
          </button>
        ) : (
          <button
            onClick={onAddArticleClick}
            className="w-full bg-green-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center">
            <Plus className="w-5 h-5 mr-2" />
            Add Article
          </button>
        )}
      </div>
    </div>
  );
}


// =================================================================
// ARTICLE VIEW & EDITOR
// =================================================================
function ArticleView() {
  const {
    setCurrentView, selectedArticle, courseData, setCourseData,
    setIsLoading, setLoadingText, handleCreateArticle
  } = useAppContext();

  // Local state for all editable fields
  const [editorTitle, setEditorTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [editorAuthor, setEditorAuthor] = useState('');
  const [editorDate, setEditorDate] = useState('');
  
  // ✅ MODIFIED: State for image display URL and the actual file object.
  const [editorImage, setEditorImage] = useState('');
  const [imageFile, setImageFile] = useState(null); // Will hold the File object for upload
  
  const [scrollProgress, setScrollProgress] = useState(0);
  const contentRef = useRef(null);
  const fileInputRef = useRef(null); // ✅ NEW: Ref for the hidden file input

  useEffect(() => {
    if (selectedArticle) {
        setEditorTitle(selectedArticle.title || '');
        setEditorContent(selectedArticle.content || '');
        setEditorAuthor(selectedArticle.author || 'Admin');
        // ✅ MODIFIED: Updated placeholder text for image
        setEditorImage(selectedArticle.image?.imageUrl || 'https://placehold.co/800x400/e2e8f0/e2e8f0?text=Select+an+Image');
        
        // Format date for the datetime-local input
        const date = new Date(selectedArticle.date || Date.now());
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        setEditorDate(date.toISOString().slice(0, 16));

        // ✅ NEW: Reset the image file state when a new article is selected
        setImageFile(null);
    }
  }, [selectedArticle]);
  
  useEffect(() => {
    const calculateProgress = () => {
      if (contentRef.current) {
        const el = contentRef.current;
        const progress = el.scrollHeight > el.clientHeight ? (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100 : 0;
        setScrollProgress(progress);
      }
    };
    const el = contentRef.current;
    if (el) {
      el.addEventListener('scroll', calculateProgress);
      calculateProgress();
      return () => el.removeEventListener('scroll', calculateProgress);
    }
  }, [selectedArticle]);

  // ✅ NEW: Cleanup for blob URLs to prevent memory leaks
  useEffect(() => {
    const currentImageURL = editorImage;
    return () => {
      if (currentImageURL && currentImageURL.startsWith('blob:')) {
        URL.revokeObjectURL(currentImageURL);
      }
    };
  }, [editorImage]);

  // ✅ MODIFIED: This function now handles file uploads for article updates.
  const handleUpdate = async () => {
    if (!selectedArticle) return;
    setLoadingText("Saving Changes...");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', editorTitle);
      formData.append('author', editorAuthor);
      formData.append('content', editorContent);
      formData.append('date', new Date(editorDate).toISOString());
      
      // If a new image file was selected, append it to the form data.
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await updateArticle(selectedArticle.id, formData);
      if (response.success && response.article) {
        const newCourseData = JSON.parse(JSON.stringify(courseData));
        let articleFound = false;
        for (const mod of newCourseData.syllabus.modules) {
          for (const chap of mod.chapters) {
            const articleIndex = chap.articles?.findIndex(a => a._id === selectedArticle.id);
            if (articleIndex > -1) {
              chap.articles[articleIndex] = { ...response.article, id: response.article._id, chapterId: chap._id, moduleId: mod._id };
              articleFound = true; break;
            }
          }
          if (articleFound) break;
        }
        setCourseData(newCourseData);
        alert('Article updated successfully!');
      } else { throw new Error(response.message || 'Failed to update article'); }
    } catch (error) {
      console.error('Failed to update article:', error);
      alert(error.message || 'Failed to update article. Please try again.');
    } finally { setIsLoading(false); }
  };
  
  // ✅ MODIFIED: Now passes the imageFile object when creating an article.
  const handleSave = () => {
    if (selectedArticle?.isNew) {
      handleCreateArticle({
        moduleId: selectedArticle.moduleId,
        chapterId: selectedArticle.chapterId,
        title: editorTitle,
        content: editorContent,
        author: editorAuthor,
        date: new Date(editorDate).toISOString(),
        imageFile: imageFile // Pass the file object
      });
    } else {
      handleUpdate();
    }
  };

  // ✅ NEW: Handler for the file input change event.
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file); // Store the file object in state
      setEditorImage(URL.createObjectURL(file)); // Create a temporary URL for preview
    }
  };

  if (!selectedArticle) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center">
        <Book className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">No Article Selected</h2>
        <p className="text-gray-500 max-w-sm mt-2">Please go back and select a chapter to view or create an article.</p>
        <button
          onClick={() => setCurrentView('modules')}
          className="mt-6 flex items-center text-white bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded-lg">
          <ChevronLeft className="w-5 h-5 mr-2" />
          Back to Modules
        </button>
      </div>
    );
  }

  const isNewArticle = selectedArticle.isNew;

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentView('modules')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <ChevronLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <button
              onClick={handleSave}
              className={`font-semibold px-4 py-2 rounded-lg transition-colors ${
                isNewArticle
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}>
              {isNewArticle ? 'Create Article' : 'Update Article'}
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex-1 bg-gray-300 rounded-full h-1">
              <div
                className="bg-blue-600 h-1 rounded-full transition-all duration-150"
                style={{ width: `${scrollProgress}%` }} />
            </div>
          </div>
        </div>
      </div>
      <div
        ref={contentRef}
        className="max-w-4xl mx-auto px-4 py-8 overflow-y-auto"
        style={{ maxHeight: 'calc(100vh - 120px)' }}>
        <input
            value={editorTitle}
            onChange={(e) => setEditorTitle(e.target.value)}
            placeholder="Your Article Title..."
            className="w-full text-4xl font-bold text-gray-900 mb-8 text-center bg-transparent focus:outline-none ring-2 ring-transparent focus:ring-blue-200 rounded-md p-2"
        />
        {/* ✅ MODIFIED: Image upload UI now uses a file input. */}
        <div className="mb-8 relative group">
          <img
            src={editorImage}
            alt="Article"
            className="w-full h-96 object-cover rounded-lg shadow-sm" />
           <div
             className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center cursor-pointer"
             onClick={() => fileInputRef.current?.click()}
           >
             <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
             />
             <div className="bg-white/90 p-3 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity font-semibold text-gray-800">
                Change Image
             </div>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-500 text-center flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
            <input 
                type="datetime-local"
                value={editorDate}
                onChange={(e) => setEditorDate(e.target.value)}
                className="bg-gray-100 p-2 rounded-md border border-transparent focus:border-blue-300 focus:outline-none"
            />
            <span className="font-semibold text-gray-400">BY</span>
            <input 
                type="text"
                value={editorAuthor}
                onChange={(e) => setEditorAuthor(e.target.value)}
                className="bg-gray-100 p-2 rounded-md border border-transparent focus:border-blue-300 focus:outline-none uppercase text-center font-medium"
            />
        </div>

        <div className="max-w-3xl mx-auto mt-8">
          <PremiumTextEditor
            key={selectedArticle.id}
            article={selectedArticle}
            initialContent={editorContent}
            onContentChange={setEditorContent} />
        </div>
      </div>
      <FunctionalBottomToolbar scrollProgress={scrollProgress} />
    </div>
  );
}

function PremiumTextEditor({ article, initialContent, onContentChange }) {
  const [blocks, setBlocks] = useState([]);
  const [focusedBlockId, setFocusedBlockId] = useState(null);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [blockMenuPosition, setBlockMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedBlockId, setSelectedBlockId] = useState(null);

  useEffect(() => {
    const paragraphs = (initialContent || '').split('\n\n').filter(p => p.trim());
    const initialBlocks = paragraphs.map((content, index) => ({
      id: `block-${article.id}-${index}`,
      type: BLOCK_TYPES.PARAGRAPH,
      content: content.trim(),
      placeholder: 'Type / for commands'
    }));
    setBlocks(initialBlocks.length > 0 ? initialBlocks : [
      { id: `block-${article.id}-0`, type: BLOCK_TYPES.PARAGRAPH, content: '', placeholder: 'Start writing...' }
    ]);
  }, [article.id, initialContent]);

  const handleBlocksChange = useCallback((newBlocks) => {
    setBlocks(newBlocks);
    const contentString = newBlocks.map(block => block.content).join('\n\n');
    onContentChange(contentString);
  }, [onContentChange]);
  
  const addBlock = useCallback((afterId, type = BLOCK_TYPES.PARAGRAPH) => {
    const newBlock = { id: `block-${Date.now()}`, type, content: '', placeholder: getPlaceholder(type) };
    const index = blocks.findIndex(block => block.id === afterId);
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    handleBlocksChange(newBlocks);
    setTimeout(() => document.querySelector(`[data-block-id="${newBlock.id}"]`)?.focus(), 50);
  }, [blocks, handleBlocksChange]);

  const updateBlock = useCallback((id, content) => {
    const newBlocks = blocks.map(block => block.id === id ? { ...block, content } : block);
    handleBlocksChange(newBlocks);
  }, [blocks, handleBlocksChange]);

  const changeBlockType = useCallback((id, newType) => {
    const newBlocks = blocks.map(block => block.id === id ? { ...block, type: newType, placeholder: getPlaceholder(newType) } : block);
    handleBlocksChange(newBlocks);
    setShowBlockMenu(false);
  }, [blocks, handleBlocksChange]);

  const deleteBlock = useCallback((id) => {
    if (blocks.length === 1) return;
    const newBlocks = blocks.filter(block => block.id !== id);
    handleBlocksChange(newBlocks);
    setShowBlockMenu(false);
  }, [blocks, handleBlocksChange]);

  const handlePlusClick = useCallback((blockId, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 320;
    let newX, newY;

    if (rect.left > menuWidth) {
      newX = rect.left - menuWidth;
    } else {
      newX = rect.right;
    }
    newY = rect.top;

    const menuHeight = 400;
    if (newY + menuHeight > window.innerHeight) {
        newY = window.innerHeight - menuHeight - 10;
    }

    setBlockMenuPosition({ x: newX, y: newY });
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
      const index = blocks.findIndex(block => block.id === selectedBlockId);
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, mediaBlock);
      handleBlocksChange(newBlocks);
    }
    setShowBlockMenu(false);
  }, [selectedBlockId, blocks, handleBlocksChange]);

  return (
    <div className="relative">
      {blocks.map((block) => (
        <MemoizedBlockComponent
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
              changeBlockType(selectedBlockId, type);
            }
          }}
          onDelete={() => deleteBlock(selectedBlockId)}
          onClose={() => setShowBlockMenu(false)}
        />
      )}
    </div>
  );
}

// =================================================================
// EDITOR SUB-COMPONENTS & MODAL
// =================================================================
function BlockComponent({ block, isFocused, onFocus, onBlur, onUpdate, onAddBlock, onPlusClick }) {
  const [showControls, setShowControls] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [formattingPosition, setFormattingPosition] = useState({ x: 0, y: 0 });
  const blockRef = useRef(null);

  const handleContentChange = (e) => onUpdate(block.id, e.target.innerHTML || '');
  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onAddBlock(block.id); } };
  
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection?.toString().length > 0 && blockRef.current?.contains(selection.anchorNode)) {
      const rect = selection.getRangeAt(0).getBoundingClientRect();
      const toolbarHeight = 50;
      let newY;
      
      if (rect.top < toolbarHeight) {
        newY = rect.bottom + 10;
      } else {
        newY = rect.top - toolbarHeight;
      }

      setFormattingPosition({ 
        x: rect.left + rect.width / 2, 
        y: newY
      });
      setShowFormatting(true);
    } else {
      setShowFormatting(false);
    }
  };

  const applyFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    setShowFormatting(false);
    blockRef.current?.focus();
    const event = new Event('input', { bubbles: true });
    blockRef.current.dispatchEvent(event);
  };

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
    className: 'focus:outline-none w-full relative',
    style: { minHeight: '1.5rem' },
    'data-placeholder': block.placeholder,
    dangerouslySetInnerHTML: { __html: block.content }
  };

  const renderBlock = () => {
    switch (block.type) {
      case BLOCK_TYPES.HEADING_1: return <h1 {...commonProps} />;
      case BLOCK_TYPES.HEADING_2: return <h2 {...commonProps} />;
      case BLOCK_TYPES.HEADING_3: return <h3 {...commonProps} />;
      case BLOCK_TYPES.QUOTE: return <blockquote {...commonProps} className={`${commonProps.className} border-l-4 border-gray-300 pl-6 py-2 italic text-lg text-gray-700`} />;
      case BLOCK_TYPES.CODE: return <pre {...commonProps} className={`${commonProps.className} bg-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto border`} />;
      case BLOCK_TYPES.BULLETED_LIST: return <div className="flex items-start py-1"><span className="text-gray-400 mt-2 mr-3">•</span><div {...commonProps} className={`${commonProps.className} flex-1 py-1`} /></div>;
      case BLOCK_TYPES.NUMBERED_LIST: return <div className="flex items-start py-1"><span className="text-gray-400 mt-2 mr-3">1.</span><div {...commonProps} className={`${commonProps.className} flex-1 py-1`} /></div>;
      case BLOCK_TYPES.IMAGE: return <div className="py-4"><img src={block.content || 'https://placehold.co/600x300/e2e8f0/e2e8f0?text=Image'} alt="Content" className="w-full h-auto rounded-lg border shadow-sm" /></div>;
      case BLOCK_TYPES.VIDEO: return <div className="py-4"><video src={block.content} controls className="w-full h-auto rounded-lg border shadow-sm" /></div>;
      default: return <p {...commonProps} className={`${commonProps.className} py-2 text-gray-800 leading-relaxed`} />;
    }
  };

  return (
    <div className="group relative" onMouseEnter={() => setShowControls(true)} onMouseLeave={() => setShowControls(false)}>
      {(isFocused || showControls)  && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-12 flex items-center space-x-1 opacity-100 transition-opacity">
          <button onClick={(e) => onPlusClick(block.id, e)} className="p-1 rounded-md hover:bg-gray-200" title="Add/Change block type"><GripVertical className="w-5 h-5 text-gray-500" /></button>
        </div>
      )}
      {renderBlock()}
      {showFormatting && (
        <div className="fixed z-50 bg-gray-900 rounded-lg shadow-lg p-2 flex items-center space-x-1" style={{ left: formattingPosition.x, top: formattingPosition.y, transform: 'translateX(-50%)' }}>
          <button onClick={() => applyFormat('bold')} className="p-2 text-white hover:bg-gray-700 rounded"><Bold className="w-4 h-4" /></button>
          <button onClick={() => applyFormat('italic')} className="p-2 text-white hover:bg-gray-700 rounded"><Italic className="w-4 h-4" /></button>
          <button onClick={() => applyFormat('underline')} className="p-2 text-white hover:bg-gray-700 rounded"><Underline className="w-4 h-4" /></button>
          <div className="w-px h-6 bg-gray-600 mx-1" />
          <button onClick={() => { const url = prompt('Enter link URL:'); if (url) applyFormat('createLink', url); }} className="p-2 text-white hover:bg-gray-700 rounded"><Link className="w-4 h-4" /></button>
          <button onClick={() => setShowFormatting(false)} className="p-1 text-white hover:bg-gray-700 rounded text-xs">×</button>
        </div>
      )}
    </div>
  );
}

const MemoizedBlockComponent = React.memo(BlockComponent, (prevProps, nextProps) => {
  if (
    prevProps.block.type !== nextProps.block.type ||
    prevProps.isFocused !== nextProps.isFocused
  ) {
    return false;
  }
  if (nextProps.isFocused) {
    return true;
  }
  return prevProps.block.content === nextProps.block.content;
});

function BlockMenu({ position, onSelectType, onDelete, onClose }) {
  const blockTypes = [
    { type: BLOCK_TYPES.PARAGRAPH, icon: Type, label: 'Text' }, { type: BLOCK_TYPES.HEADING_1, icon: Heading1, label: 'Heading 1' },
    { type: BLOCK_TYPES.HEADING_2, icon: Heading2, label: 'Heading 2' }, { type: BLOCK_TYPES.HEADING_3, icon: Heading3, label: 'Heading 3' },
    { type: BLOCK_TYPES.BULLETED_LIST, icon: List, label: 'Bulleted List' }, { type: BLOCK_TYPES.NUMBERED_LIST, icon: ListOrdered, label: 'Numbered List' },
    { type: BLOCK_TYPES.QUOTE, icon: Quote, label: 'Quote' }, { type: BLOCK_TYPES.CODE, icon: Code, label: 'Code' },
    { type: 'image', icon: ImageIcon, label: 'Image' }, { type: 'video', icon: Video, label: 'Video' }
  ];
  useEffect(() => {
    const handleClickOutside = (e) => { if (!e.target.closest('.block-menu')) onClose(); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div className="block-menu fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl py-2 w-80" style={{ left: position.x, top: position.y }}>
      <div className="px-3 pb-2"><h3 className="text-sm font-semibold text-gray-700">Change Block Type</h3></div>
      <div className="max-h-96 overflow-y-auto">
        {blockTypes.map(({ type, icon: Icon, label }) => (
          <button key={type} onClick={() => onSelectType(type)} className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center space-x-3">
            <Icon className="w-5 h-5 text-gray-600" />
            <div className="text-sm font-medium text-gray-900">{label}</div>
          </button>
        ))}
      </div>
      <div className="border-t border-gray-200 mt-2 pt-2">
        <button onClick={onDelete} className="w-full px-3 py-2 text-left hover:bg-red-50 flex items-center space-x-3 text-red-600">
          <Trash2 className="w-5 h-5" />
          <span className="text-sm font-medium">Delete Block</span>
        </button>
      </div>
    </div>
  );
}

function FunctionalBottomToolbar({ scrollProgress }) {
  const handleFeatureClick = (feature) => alert(`${feature} clicked! This is a placeholder for the feature.`);
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-gray-900 rounded-lg px-4 py-2 flex items-center space-x-4 text-white text-sm shadow-lg">
        <button onClick={() => handleFeatureClick('Explain')} className="text-green-400 hover:text-green-300 font-medium">Explain</button>
        <button onClick={() => handleFeatureClick('Ask AI')} className="text-blue-400 hover:text-blue-300 font-medium">Ask AI</button>
        <div className="flex items-center space-x-2 border-l border-gray-600 pl-4">
          <span>Status:</span><span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span className="text-xs">({Math.round(scrollProgress)}%)</span>
        </div>
      </div>
    </div>
  );
}

function getPlaceholder(type) {
  const placeholders = {
    [BLOCK_TYPES.HEADING_1]: 'Heading 1', [BLOCK_TYPES.HEADING_2]: 'Heading 2',
    [BLOCK_TYPES.HEADING_3]: 'Heading 3', [BLOCK_TYPES.QUOTE]: 'Quote',
    [BLOCK_TYPES.CODE]: 'Enter code', [BLOCK_TYPES.BULLETED_LIST]: 'List item',
    [BLOCK_TYPES.NUMBERED_LIST]: 'List item',
  };
  return placeholders[type] || 'Type / for commands';
}

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
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="chapter-title" className="block text-sm font-medium text-gray-700 mb-1">Chapter Title</label>
            <input id="chapter-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500" placeholder="e.g., Introduction to Variables" required />
          </div>
          <div className="mb-6">
            <label htmlFor="chapter-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea id="chapter-description" value={description} onChange={(e) => setDescription(e.target.value)} rows="4" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500" placeholder="A brief overview of the chapter's content." required />
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Add Chapter</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ContentSection;