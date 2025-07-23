/**
 * LEARNING MODULE APP WITH PREMIUM TEXT EDITOR
 * 
 * Combines:
 * - Original module sidebar and chapter grid layout
 * - Premium Medium-like text editor (no cursor jumping)
 * - All functionality working properly
 */

import React, { useState, useEffect, createContext, useContext, useRef, useCallback } from 'react';
import { 
  ChevronLeft, Book, Bold, Italic, Underline, Link, 
  Plus, Type, Heading1, Heading2, Heading3, List, ListOrdered, 
  Quote, Code, Image, Video, MoreHorizontal, Trash2,
  GripVertical, Eye
} from 'lucide-react';

// ==================== DATA STRUCTURE ====================
const dummyData = {
  modules: [
    {
      id: 1,
      name: 'Mathematics',
      active: false,
      title: 'Advanced Mathematics',
      chapters: [
        {
          id: 1,
          title: 'CHAPTER 1',
          description: 'Calculus fundamentals including derivatives, integrals, and their applications in real-world problems.',
          color: 'bg-red-500',
          article: {
            id: 1,
            title: 'Calculus Fundamentals',
            content: `Calculus is the mathematical study of continuous change, in the same way that geometry is the study of shape and algebra is the study of generalizations of arithmetic operations.

It has two major branches, differential calculus and integral calculus; the former concerns instantaneous rates of change, and the slopes of curves, while integral calculus concerns accumulation of quantities, and areas under or between curves.

These fundamental concepts form the backbone of modern mathematics and are essential for understanding physics, engineering, economics, and many other fields.`,
            author: 'PROF. EMMA THOMPSON',
            date: '25 JUNE, 2025',
            time: '9:00 AM',
            image: 'https://miro.medium.com/v2/resize:fit:1400/format:webp/1*RJ8DZD1b-ipwDENqdK3WRA.png'
          }
        },
        {
          id: 2,
          title: 'CHAPTER 2',
          description: 'Linear algebra concepts including matrices, vectors, and linear transformations.',
          color: 'bg-orange-500',
          article: {
            id: 2,
            title: 'Linear Algebra Concepts',
            content: `Linear algebra is the branch of mathematics concerning linear equations, linear functions, and their representations through matrices and vector spaces.

Linear algebra is central to almost all areas of mathematics. For instance, linear algebra is fundamental in modern presentations of geometry, including for defining basic objects such as lines, planes and rotations.`,
            author: 'DR. ROBERT GARCIA',
            date: '28 JUNE, 2025',
            time: '1:45 PM',
            image: '/api/placeholder/400/300'
          }
        }
      ]
    },
    {
      id: 2,
      name: 'Physics',
      active: false,
      title: 'Classical Physics',
      chapters: [
        {
          id: 3,
          title: 'CHAPTER 1',
          description: 'Newton\'s laws of motion and their applications in mechanics.',
          color: 'bg-indigo-500',
          article: {
            id: 3,
            title: 'Newton\'s Laws of Motion',
            content: `Newton's laws of motion are three physical laws that, together, laid the foundation for classical mechanics.

The first law states that an object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force.

The second law explains how the velocity of an object changes when it is subjected to an external force.`,
            author: 'DR. JAMES MAXWELL',
            date: '30 JUNE, 2025',
            time: '11:00 AM',
            image: '/api/placeholder/400/300'
          }
        }
      ]
    },
    {
      id: 3,
      name: 'Chemistry',
      active: false,
      title: 'Organic Chemistry',
      chapters: []
    },
    {
      id: 4,
      name: 'Biology',
      active: false,
      title: 'Cell Biology',
      chapters: []
    },
    {
      id: 5,
      name: 'Computer Science',
      active: true,
      title: 'Large Language Models',
      chapters: [
        {
          id: 4,
          title: 'CHAPTER 1',
          description: 'Probability and statistics are fundamental tools for understanding data, uncertainty, and patterns.',
          color: 'bg-blue-900',
          article: {
            id: 4,
            title: 'Fundamentals of Probability and Stats',
            content: `Probability is a branch of mathematics that deals with the likelihood of events occurring. It helps us measure uncertainty by assigning a value between 0 and 1 to an event—where 0 means the event is impossible, and 1 means it is certain. For example, the probability of flipping a fair coin and getting heads is 0.5, because there are two equally likely outcomes. Probability is used in everything from weather forecasts and medical testing to gambling, finance, and machine learning.

There are different types of probability: theoretical, based on reasoning and models (like dice rolls); experimental, based on actual data and repeated trials; and subjective, based on personal judgment or estimation. Probability also involves important concepts like independent events (one event doesn't affect the other),

dependent events, conditional probability, and combinations/permutations. These concepts allow us to understand more complex scenarios—like the probability of drawing two aces in a row from a deck of cards, or predicting the risk of failure in a system.`,
            author: 'PROF. RIA SARRAF',
            date: '12 JUNE, 2025',
            time: '12:00 PM',
            image: '/api/placeholder/400/300'
          }
        },
        {
          id: 5,
          title: 'CHAPTER 2',
          description: 'Introduction to neural networks and deep learning fundamentals.',
          color: 'bg-blue-400',
          article: {
            id: 5,
            title: 'Neural Networks Fundamentals',
            content: `Neural networks are computing systems inspired by biological neural networks that constitute animal brains. Such systems "learn" to perform tasks by considering examples, generally without being programmed with task-specific rules.

A neural network is based on a collection of connected units or nodes called artificial neurons, which loosely model the neurons in a biological brain. Each connection, like the synapses in a biological brain, can transmit a signal to other neurons.

Deep learning, a subset of machine learning, uses neural networks with multiple layers to model and understand complex patterns in data.`,
            author: 'PROF. ALEX CHEN',
            date: '18 JUNE, 2025',
            time: '10:00 AM',
            image: '/api/placeholder/400/300'
          }
        },
        {
          id: 6,
          title: 'CHAPTER 3',
          description: 'Machine learning algorithms and their practical applications.',
          color: 'bg-green-400',
          article: {
            id: 6,
            title: 'Machine Learning Applications',
            content: `Machine Learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed. It focuses on the development of computer programs that can access data and use it to learn for themselves.

The process of learning begins with observations or data, such as examples, direct experience, or instruction, in order to look for patterns in data and make better decisions in the future based on the examples that we provide.

Applications of machine learning are vast and growing, including image recognition, natural language processing, recommendation systems, and autonomous vehicles.`,
            author: 'DR. SARAH JOHNSON',
            date: '15 JUNE, 2025',
            time: '2:00 PM',
            image: '/api/placeholder/400/300'
          }
        },
        {
          id: 7,
          title: 'CHAPTER 4',
          description: 'Understanding transformer models and attention mechanisms.',
          color: 'bg-purple-500',
          article: {
            id: 7,
            title: 'Transformer Models',
            content: `The Transformer is a deep learning model introduced in 2017 that has become the foundation for many state-of-the-art language models. It relies entirely on self-attention mechanisms to draw global dependencies between input and output.

The key innovation of transformers is the attention mechanism, which allows the model to focus on different parts of the input sequence when producing each part of the output sequence.

Modern large language models like GPT, BERT, and others are all based on the transformer architecture.`,
            author: 'DR. MAYA PATEL',
            date: '20 JUNE, 2025',
            time: '3:30 PM',
            image: '/api/placeholder/400/300'
          }
        },
        {
          id: 8,
          title: 'CHAPTER 5',
          description: 'Ethics and responsible AI development in large language models.',
          color: 'bg-blue-600',
          article: {
            id: 8,
            title: 'Ethics in AI',
            content: `AI ethics is a field of study that examines the ethical implications of artificial intelligence systems. It encompasses issues such as fairness, accountability, transparency, and the societal impact of AI technologies.

As AI systems become more prevalent in our daily lives, it's crucial to consider their ethical implications. This includes ensuring that AI systems are designed and deployed in ways that respect human rights, promote fairness, and minimize harm.

Key considerations include bias in AI systems, privacy concerns, job displacement, and the need for human oversight in critical decision-making processes.`,
            author: 'PROF. DAVID WILLIAMS',
            date: '22 JUNE, 2025',
            time: '11:15 AM',
            image: '/api/placeholder/400/300'
          }
        }
      ]
    },
    {
      id: 6,
      name: 'Economics',
      active: false,
      title: 'Microeconomics',
      chapters: []
    },
    {
      id: 7,
      name: 'History',
      active: false,
      title: 'World History',
      chapters: []
    },
    {
      id: 8,
      name: 'Geography',
      active: false,
      title: 'Physical Geography',
      chapters: []
    },
    {
      id: 9,
      name: 'English Literature',
      active: false,
      title: 'Modern Literature',
      chapters: []
    },
    {
      id: 10,
      name: 'Political Science',
      active: false,
      title: 'Political Theory',
      chapters: []
    }
  ]
};

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
  const [currentView, setCurrentView] = useState('modules');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [data, setData] = useState(dummyData);

  useEffect(() => {
    const savedData = localStorage.getItem('learningModuleData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setData(parsedData || dummyData);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('learningModuleData', JSON.stringify(data));
  }, [data]);

  const contextValue = {
    currentView,
    setCurrentView,
    selectedArticle,
    setSelectedArticle,
    data,
    setData
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
  const { data } = useAppContext();
  const activeModule = data.modules.find(m => m.active);

  return (
    <div className="flex h-screen">
      <ModuleSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-sm text-gray-500 mb-2">MODULE {activeModule?.id || 1}</h1>
            <h2 className="text-4xl font-bold text-gray-900 mb-8">
              {activeModule?.title || 'Select a Module'}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeModule?.chapters?.map((chapter) => (
              <ChapterCard key={chapter.id} chapter={chapter} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleSidebar() {
  const { data, setData } = useAppContext();

  const handleModuleClick = (moduleId) => {
    setData(prevData => ({
      ...prevData,
      modules: prevData.modules.map(m => ({
        ...m,
        active: m.id === moduleId
      }))
    }));
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">MODULES</h2>
      <nav className="space-y-2">
        {data.modules.map((module, index) => (
          <button
            key={module.id}
            onClick={() => handleModuleClick(module.id)}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              module.active 
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
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      <div className={`h-48 ${chapter.color} flex items-center justify-center`}>
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
          {chapter.article ? 'VIEW FULL COURSE' : 'COMING SOON'}
          <span className="ml-2">→</span>
        </button>
      </div>
    </div>
  );
}

// ==================== ARTICLE VIEW WITH PREMIUM EDITOR ====================
function ArticleView() {
  const { setCurrentView, selectedArticle } = useAppContext();
  const [scrollProgress, setScrollProgress] = useState(0);
  const contentRef = useRef(null);

  // Calculate scroll progress
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
        <div className="text-center">
          <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No article selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
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
           
          </div>

          {/* Progress Bar */}
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

      {/* Article Content */}
      <div 
        ref={contentRef}
        className="max-w-4xl mx-auto px-4 py-8 overflow-y-auto"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        {/* Article Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          {selectedArticle.title}
        </h1>

        {/* Article Image */}
        <div className="mb-8">
          <img 
            src={selectedArticle.image} 
            alt="Article" 
            className="w-full h-96 object-cover rounded-lg shadow-sm"
          />
          <div className="mt-4 text-sm text-gray-500 text-center">
            <span>{selectedArticle.time} • {selectedArticle.date}</span>
            <span className="ml-8">BY {selectedArticle.author}</span>
          </div>
        </div>

        {/* Premium Text Editor */}
        <div className="max-w-3xl mx-auto">
          <PremiumTextEditor article={selectedArticle} />
        </div>
      </div>

      {/* Functional Bottom Toolbar */}
      <FunctionalBottomToolbar scrollProgress={scrollProgress} />
    </div>
  );
}

// ==================== PREMIUM TEXT EDITOR ====================
function PremiumTextEditor({ article }) {
  const { data, setData } = useAppContext();
  const [blocks, setBlocks] = useState([]);
  const [focusedBlockId, setFocusedBlockId] = useState(null);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [blockMenuPosition, setBlockMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedBlockId, setSelectedBlockId] = useState(null);

  // Initialize blocks from article content
  useEffect(() => {
    if (article?.content) {
      const paragraphs = article.content.split('\n').filter(p => p.trim());
      const initialBlocks = paragraphs.map((content, index) => ({
        id: `block-${index + 1}`,
        type: BLOCK_TYPES.PARAGRAPH,
        content: content.trim(),
        placeholder: 'Type / for commands'
      }));
      setBlocks(initialBlocks.length > 0 ? initialBlocks : [
        { id: 'block-1', type: BLOCK_TYPES.PARAGRAPH, content: '', placeholder: 'Start writing...' }
      ]);
    }
  }, [article]);

  // Save blocks back to article
  const saveToArticle = useCallback((newBlocks) => {
    if (article) {
      const content = newBlocks.map(block => block.content).join('\n\n');
      setData(prevData => ({
        ...prevData,
        modules: prevData.modules.map(module => ({
          ...module,
          chapters: module.chapters.map(chapter => ({
            ...chapter,
            article: chapter.article && chapter.article.id === article.id 
              ? { ...chapter.article, content }
              : chapter.article
          }))
        }))
      }));
    }
  }, [article, setData]);

  // Add new block
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
      const element = document.querySelector(`[data-block-id="${newBlock.id}"]`);
      if (element) {
        element.focus();
        setFocusedBlockId(newBlock.id);
      }
    }, 0);
  }, [saveToArticle]);

  // Update block content
  const updateBlock = useCallback((id, content) => {
    setBlocks(prev => {
      const newBlocks = prev.map(block => 
        block.id === id ? { ...block, content } : block
      );
      saveToArticle(newBlocks);
      return newBlocks;
    });
  }, [saveToArticle]);

  // Change block type
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

  // Delete block
  const deleteBlock = useCallback((id) => {
    if (blocks.length === 1) return;
    
    setBlocks(prev => {
      const newBlocks = prev.filter(block => block.id !== id);
      saveToArticle(newBlocks);
      return newBlocks;
    });
    setShowBlockMenu(false);
  }, [blocks.length, saveToArticle]);

  // Handle plus button click
  const handlePlusClick = useCallback((blockId, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setBlockMenuPosition({ x: rect.right + 10, y: rect.top });
    setSelectedBlockId(blockId);
    setShowBlockMenu(true);
  }, []);

  // Insert media
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
      {/* Editor Blocks */}
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

      {/* Add Block Button */}
      <div className="flex items-center py-4">
        <button
          onClick={() => addBlock(blocks[blocks.length - 1]?.id)}
          className="flex items-center space-x-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add a block</span>
        </button>
      </div>

      {/* Block Menu */}
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

// Individual Block Component
function BlockComponent({ block, isFocused, onFocus, onBlur, onUpdate, onAddBlock, onPlusClick }) {
  const [showControls, setShowControls] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [formattingPosition, setFormattingPosition] = useState({ x: 0, y: 0 });
  const blockRef = useRef(null);

  // Handle content change without cursor jumping
  const handleContentChange = useCallback((e) => {
    const content = e.target.textContent || '';
    onUpdate(block.id, content);
  }, [block.id, onUpdate]);

  // Handle key events
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onAddBlock(block.id);
    }
  }, [block.id, onAddBlock]);

  // Handle text selection
  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    const selectedText = selection.toString();

    if (selectedText.length > 0 && blockRef.current?.contains(selection.anchorNode)) {
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

  // Apply formatting
  const applyFormat = useCallback((command, value = null) => {
    document.execCommand(command, false, value);
    setShowFormatting(false);
    blockRef.current?.focus();
  }, []);

  // Render block based on type
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
      className: `focus:outline-none ${isFocused ? 'ring-2 ring-blue-200 ring-opacity-50 rounded' : ''}`,
      style: { minHeight: '1.5rem' }
    };

    // Set initial content
    useEffect(() => {
      if (blockRef.current && blockRef.current.textContent !== block.content) {
        blockRef.current.textContent = block.content;
      }
    }, [block.content]);

    switch (block.type) {
      case BLOCK_TYPES.HEADING_1:
        return (
          <h1 
            {...commonProps} 
            className={`${commonProps.className} text-4xl font-bold py-3 text-gray-900`}
            data-placeholder={block.placeholder}
          />
        );
      
      case BLOCK_TYPES.HEADING_2:
        return (
          <h2 
            {...commonProps} 
            className={`${commonProps.className} text-3xl font-bold py-3 text-gray-900`}
            data-placeholder={block.placeholder}
          />
        );
      
      case BLOCK_TYPES.HEADING_3:
        return (
          <h3 
            {...commonProps} 
            className={`${commonProps.className} text-2xl font-bold py-2 text-gray-900`}
            data-placeholder={block.placeholder}
          />
        );
      
      case BLOCK_TYPES.QUOTE:
        return (
          <blockquote 
            {...commonProps}
            className={`${commonProps.className} border-l-4 border-gray-300 pl-6 py-2 italic text-lg text-gray-700`}
            data-placeholder={block.placeholder}
          />
        );
      
      case BLOCK_TYPES.CODE:
        return (
          <pre 
            {...commonProps}
            className={`${commonProps.className} bg-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto border`}
            data-placeholder={block.placeholder}
          />
        );
      
      case BLOCK_TYPES.BULLETED_LIST:
        return (
          <div className="flex items-start py-1">
            <span className="text-gray-400 mt-2 mr-3">•</span>
            <div 
              {...commonProps}
              className={`${commonProps.className} flex-1 py-1`}
              data-placeholder={block.placeholder}
            />
          </div>
        );
      
      case BLOCK_TYPES.NUMBERED_LIST:
        return (
          <div className="flex items-start py-1">
            <span className="text-gray-400 mt-2 mr-3">1.</span>
            <div 
              {...commonProps}
              className={`${commonProps.className} flex-1 py-1`}
              data-placeholder={block.placeholder}
            />
          </div>
        );
      
      case BLOCK_TYPES.IMAGE:
        return (
          <div className="py-4">
            <img 
              src={block.content || '/api/placeholder/600/300'} 
              alt="Content" 
              className="w-full h-auto rounded-lg border shadow-sm"
            />
          </div>
        );
      
      case BLOCK_TYPES.VIDEO:
        return (
          <div className="py-4">
            <video 
              src={block.content} 
              controls 
              className="w-full h-auto rounded-lg border shadow-sm"
            />
          </div>
        );
      
      default:
        return (
          <p 
            {...commonProps}
            className={`${commonProps.className} py-2 text-gray-800 leading-relaxed`}
            data-placeholder={block.placeholder}
          />
        );
    }
  };

  return (
    <div 
      className="group relative"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Block Controls */}
      {showControls && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-12 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => onPlusClick(block.id, e)}
            className="w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:border-gray-300 transition-colors"
            title="Add block"
          >
            <Plus className="w-4 h-4 text-gray-500" />
          </button>
          <button
            className="w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:border-gray-300 transition-colors cursor-grab"
            title="Drag to move"
          >
            <GripVertical className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      )}

      {/* Block Content */}
      {renderBlock()}

      {/* Formatting Toolbar */}
      {showFormatting && (
        <div 
          className="fixed z-50 bg-gray-900 rounded-lg shadow-lg p-2 flex items-center space-x-1"
          style={{ 
            left: formattingPosition.x,
            top: formattingPosition.y,
            transform: 'translateX(-50%)'
          }}
        >
          <button
            onClick={() => applyFormat('bold')}
            className="p-2 text-white hover:bg-gray-700 rounded transition-colors"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => applyFormat('italic')}
            className="p-2 text-white hover:bg-gray-700 rounded transition-colors"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => applyFormat('underline')}
            className="p-2 text-white hover:bg-gray-700 rounded transition-colors"
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-gray-600 mx-1" />
          <button
            onClick={() => {
              const url = prompt('Enter link URL:');
              if (url) applyFormat('createLink', url);
            }}
            className="p-2 text-white hover:bg-gray-700 rounded transition-colors"
            title="Link"
          >
            <Link className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowFormatting(false)}
            className="p-1 text-white hover:bg-gray-700 rounded text-xs"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

// Block Menu Component
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
      if (!e.target.closest('.block-menu')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div 
      className="block-menu fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-80"
      style={{ left: position.x, top: position.y }}
    >
      <div className="px-3 pb-2">
        <h3 className="text-sm font-semibold text-gray-700">Add Block</h3>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {blockTypes.map((blockType) => (
          <button
            key={blockType.type}
            onClick={() => onSelectType(blockType.type)}
            className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center space-x-3 transition-colors"
          >
            <blockType.icon className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">{blockType.label}</div>
              {blockType.shortcut && (
                <div className="text-xs text-gray-500">{blockType.shortcut}</div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="border-t border-gray-200 mt-2 pt-2">
        <button
          onClick={onDelete}
          className="w-full px-3 py-2 text-left hover:bg-red-50 flex items-center space-x-3 transition-colors text-red-600"
        >
          <Trash2 className="w-5 h-5" />
          <span className="text-sm font-medium">Delete Block</span>
        </button>
      </div>
    </div>
  );
}

// Functional Bottom Toolbar
function FunctionalBottomToolbar({ scrollProgress }) {
  const handleExplain = () => {
    alert('Explain feature - This would provide AI explanations of selected content');
  };

  const handleAskAI = () => {
    const question = prompt('What would you like to ask AI about this content?');
    if (question) {
      alert(`AI Response: I'd help you with "${question}" - this would connect to an AI service`);
    }
  };

  const handleComment = () => {
    const comment = prompt('Add a comment:');
    if (comment) {
      alert(`Comment added: "${comment}" - this would save to the backend`);
    }
  };

  const toggleBulletedList = () => {
    document.execCommand('insertUnorderedList', false, null);
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-gray-900 rounded-lg px-4 py-2 flex items-center space-x-4 text-white text-sm shadow-lg">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          <span>Timeline: Around 2 months</span>
        </div>

        <button 
          onClick={handleExplain}
          className="text-green-400 hover:text-green-300 transition-colors font-medium"
        >
          Explain
        </button>
        <button 
          onClick={handleAskAI}
          className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
        >
          Ask AI
        </button>
        <button 
          onClick={handleComment}
          className="text-yellow-400 hover:text-yellow-300 transition-colors font-medium"
        >
          Comment
        </button>
        <button 
          onClick={toggleBulletedList}
          className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
        >
          Bulleted list
        </button>

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

// Helper function to get placeholder text
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

export default ContentSection;