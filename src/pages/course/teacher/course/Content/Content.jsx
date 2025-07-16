import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Plus } from "lucide-react";
import ModuleSidebar from "./ModuleSidebar";
import ContentDisplay from "./ContentDisplay";
import AddContentModal from "./AddContentModal";
import {
  getCourseSyllabus,
  getModuleById,
  addModuleContent,
  updateContentItem,
  deleteContentItem,
} from "../../../../../services/content.service";
import toast from "react-hot-toast";
import { useUtilityContext } from "../../../../../context/UtilityContext";

const ContentSection = ({ setSelectedOption }) => {
  const { courseID } = useParams();
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const { currentModuleIndex, setCurrentModuleIndex } = useUtilityContext();
  const [currentContent, setCurrentContent] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [contentTypeToAdd, setContentTypeToAdd] = useState(null);
  const [editingContent, setEditingContent] = useState(null); // New state for editing

  useEffect(() => {
    fetchSyllabus();
  }, []);

  const fetchSyllabus = async () => {
    try {
      setLoading(true);
      const response = await getCourseSyllabus({ courseID });

      if (response.success) {
        // Check if syllabus has modules
        if (response.syllabus && response.syllabus.modules) {
          const modules = response.syllabus.modules;
          setModules(modules);

          // Auto-expand selected module if it exists
          if (modules.length > 0) {
            setExpandedModules({ [modules[currentModuleIndex]._id]: true });

            // If selected module has content, select first item
            const firstModule = modules[currentModuleIndex];
            const allContent = getAllContentSorted(firstModule);
            if (allContent.length > 0) {
              setCurrentContent(allContent[0]);
            }
          }
        } else {
          setModules([]);
        }
      } else {
        toast.error("Error loading syllabus");
      }
    } catch (error) {
      console.error("Error fetching syllabus:", error);
      toast.error("Failed to load syllabus");
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const selectModule = (index) => {
    setCurrentModuleIndex(index);
    const moduleId = modules[index]._id;

    // Expand the module if not already expanded
    if (!expandedModules[moduleId]) {
      toggleModule(moduleId);
    }

    // If module has content, select first item
    const module = modules[index];
    const allContent = getAllContentSorted(module);
    if (allContent.length > 0) {
      setCurrentContent(allContent[0]);
    } else {
      setCurrentContent(null);
    }
  };

  const selectContent = (content) => {
    setCurrentContent(content);
  };

  const getAllContentSorted = (module) => {
    if (!module) return [];

    const allContent = [];

    // Add content items if they exist
    if (module.contentItems && module.contentItems.length > 0) {
      allContent.push(...module.contentItems);
    }

    // Add resources with isResource flag if they exist
    if (module.resources && module.resources.length > 0) {
      allContent.push(
        ...module.resources.map((resource) => ({
          ...resource,
          isResource: true,
        }))
      );
    }

    // Sort by date (newest first)
    return allContent.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.uploadDate);
      const dateB = new Date(b.createdAt || b.uploadDate);
      return dateB - dateA;
    });
  };

  const handleAddContent = async (courseID, moduleId, formData) => {
    try {
      const response = await addModuleContent(courseID, moduleId, formData);

      if (response.success) {
        fetchSyllabus();
        closeModal();
      } else {
        throw new Error("Failed to add content");
      }
    } catch (error) {
      console.error("Error adding content:", error);
      toast.error("Failed to add content");
      throw error; // Re-throw to handle loading state in modal
    }
  };

  const handleUpdateContent = async (courseID, moduleId, contentId, formData) => {
    try {
      const response = await updateContentItem(courseID, moduleId, contentId, formData);

      if (response.success) {
        toast.success("Content updated successfully");
        fetchSyllabus();
        closeModal();
      } else {
        throw new Error("Failed to update content");
      }
    } catch (error) {
      console.error("Error updating content:", error);
      toast.error("Failed to update content");
      throw error; // Re-throw to handle loading state in modal
    }
  };

  const handleDeleteContent = async (courseID, moduleId, contentId) => {
    if (window.confirm("Are you sure you want to delete this content?")) {
      try {
        await deleteContentItem(courseID, moduleId, contentId);
        toast.success("Content deleted successfully");

        // Clear current content if it was deleted
        if (currentContent && currentContent._id === contentId) {
          setCurrentContent(null);
        }

        // Refresh the entire syllabus to get updated content
        fetchSyllabus();
      } catch (error) {
        console.error("Error deleting content:", error);
        toast.error("Failed to delete content");
      }
    }
  };

  const handleEditContent = (courseID, moduleId, content) => {
    setContentTypeToAdd(content.type); // Set the type of content being edited
    setEditingContent(content); // Set the content being edited
    setContentModalOpen(true); // Open the modal
  };

  const handleNextContent = () => {
    const currentModule = modules[currentModuleIndex];
    const allContent = getAllContentSorted(currentModule);

    if (!currentContent || allContent.length === 0) return;

    const currentIndex = allContent.findIndex(
      (item) => item._id === currentContent._id
    );

    if (currentIndex < allContent.length - 1) {
      // Move to next content in same module
      setCurrentContent(allContent[currentIndex + 1]);
    } else if (currentModuleIndex < modules.length - 1) {
      // Move to next module
      setCurrentModuleIndex(currentModuleIndex + 1);
      const nextModuleId = modules[currentModuleIndex + 1]._id;

      // Expand the next module
      setExpandedModules((prev) => ({
        ...prev,
        [nextModuleId]: true,
      }));

      // Select first content in next module
      const nextModule = modules[currentModuleIndex + 1];
      const nextContent = getAllContentSorted(nextModule);
      if (nextContent.length > 0) {
        setCurrentContent(nextContent[0]);
      } else {
        setCurrentContent(null);
      }
    }
  };

  const handlePreviousContent = () => {
    const currentModule = modules[currentModuleIndex];
    const allContent = getAllContentSorted(currentModule);

    if (!currentContent || allContent.length === 0) return;

    const currentIndex = allContent.findIndex(
      (item) => item._id === currentContent._id
    );

    if (currentIndex > 0) {
      // Move to previous content in same module
      setCurrentContent(allContent[currentIndex - 1]);
    } else if (currentModuleIndex > 0) {
      // Move to previous module
      setCurrentModuleIndex(currentModuleIndex - 1);
      const prevModuleId = modules[currentModuleIndex - 1]._id;

      // Expand the previous module
      setExpandedModules((prev) => ({
        ...prev,
        [prevModuleId]: true,
      }));

      // Select last content in previous module
      const prevModule = modules[currentModuleIndex - 1];
      const prevContent = getAllContentSorted(prevModule);
      if (prevContent.length > 0) {
        setCurrentContent(prevContent[prevContent.length - 1]);
      } else {
        setCurrentContent(null);
      }
    }
  };

  // Open the content add modal with specified type
  const openAddContentModal = (type) => {
    setContentTypeToAdd(type);
    setEditingContent(null); // Clear editing content for new content
    setContentModalOpen(true);
  };

  // Close modal and reset states
  const closeModal = () => {
    setContentModalOpen(false);
    setContentTypeToAdd(null);
    setEditingContent(null);
  };

  // Check if current content has next item in module
  const hasNextContent = () => {
    if (!currentContent || !modules[currentModuleIndex]) return false;

    const allContent = getAllContentSorted(modules[currentModuleIndex]);
    const currentIndex = allContent.findIndex(
      (item) => item._id === currentContent._id
    );

    return currentIndex < allContent.length - 1;
  };

  // Check if the current content is the first in all modules
  const isFirstContent = () => {
    if (!currentContent || currentModuleIndex > 0) return false;

    const allContent = getAllContentSorted(modules[0]);
    return allContent.length > 0 && allContent[0]._id === currentContent._id;
  };

  // Check if we're at the last module
  const isLastModule = currentModuleIndex === modules.length - 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Module sidebar */}
      <ModuleSidebar
        modules={modules}
        currentModuleIndex={currentModuleIndex}
        expandedModules={expandedModules}
        currentContent={currentContent}
        toggleModule={toggleModule}
        selectModule={selectModule}
        selectContent={selectContent}
        getAllContentSorted={getAllContentSorted}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Add content toolbar */}
        {modules.length > 0 && (
          <div className="bg-white p-5 border-b flex items-center gap-4 ">
            <span className="font-semibold text-lg text-secondary">
              Add Content:
            </span>
            <button
              onClick={() => openAddContentModal("text")}
              className="px-4 py-2 bg-green-100 text-green-800 hover:bg-green-200 rounded-lg flex items-center text-sm font-medium shadow-sm transition-all"
            >
              <Plus size={18} className="mr-2" /> Text
            </button>
            <button
              onClick={() => openAddContentModal("link")}
              className="px-4 py-2 bg-purple-100 text-purple-800 hover:bg-purple-200 rounded-lg flex items-center text-sm font-medium shadow-sm transition-all"
            >
              <Plus size={18} className="mr-2" /> Link
            </button>
            <button
              onClick={() => openAddContentModal("video")}
              className="px-4 py-2 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-lg flex items-center text-sm font-medium shadow-sm transition-all"
            >
              <Plus size={18} className="mr-2" /> Video
            </button>
            <button
              onClick={() => openAddContentModal("file")}
              className="px-4 py-2 bg-orange-100 text-orange-800 hover:bg-orange-200 rounded-lg flex items-center text-sm font-medium shadow-sm transition-all"
            >
              <Plus size={18} className="mr-2" /> File
            </button>
            <button
              onClick={() => setSelectedOption("Create Quiz")}
              className="px-4 py-2 bg-pink-100 text-pink-800 hover:bg-orange-200 rounded-lg flex items-center text-sm font-medium shadow-sm transition-all"
            >
              <Plus size={18} className="mr-2" /> Quiz
            </button>
          </div>
        )}

        {/* Content display */}
        {modules.length > 0 ? (
          <ContentDisplay
            content={currentContent}
            onDelete={handleDeleteContent}
            onEdit={handleEditContent}
            onNext={handleNextContent}
            onPrevious={handlePreviousContent}
            isFirstContent={isFirstContent()}
            isLastModule={isLastModule}
            hasNextContent={hasNextContent()}
            courseID={courseID}
            moduleId={modules[currentModuleIndex]?._id}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-6 bg-gray-50 rounded-lg max-w-md">
              <h3 className="text-lg font-medium mb-2">No modules found</h3>
              <p className="text-gray-600 mb-4">
                There are no modules or content available for this course
                syllabus.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit content modal */}
      {contentModalOpen && (
        <AddContentModal
          courseID={courseID}
          moduleId={modules[currentModuleIndex]?._id}
          contentType={contentTypeToAdd}
          editingContent={editingContent}
          onClose={closeModal}
          onAdd={handleAddContent}
          onUpdate={handleUpdateContent}
        />
      )}
    </div>
  );
};

export default ContentSection;