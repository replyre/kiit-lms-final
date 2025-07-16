import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import StudentModuleSidebar from "./StudentModuleSidebar";
import StudentContentDisplay from "./StudentContentDisplay";
import { getCourseSyllabus } from "../../../../../services/content.service";
import toast from "react-hot-toast";
import { useUtilityContext } from "../../../../../context/UtilityContext";

const StudentContentSection = () => {
  const { courseID } = useParams();
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const { currentModuleIndex, setCurrentModuleIndex } = useUtilityContext();
  const [currentContent, setCurrentContent] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});

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

          // Auto-expand first module if it exists
          if (modules.length > 0) {
            setExpandedModules({ [modules[currentModuleIndex]._id]: true });

            // If first module has content, select first item
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
        toast.error("Error loading course content");
      }
    } catch (error) {
      console.error("Error fetching syllabus:", error);
      toast.error("Failed to load course content");
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

  const handleNextContent = () => {
    const currentModule = modules[currentModuleIndex];
    if (!currentModule) return;

    const allContent = getAllContentSorted(currentModule);

    if (!currentContent || allContent.length === 0) {
      // If current module has no content but there are more modules,
      // move to the next module and try again
      if (currentModuleIndex < modules.length - 1) {
        const nextModuleIndex = currentModuleIndex + 1;
        setCurrentModuleIndex(nextModuleIndex);

        const nextModule = modules[nextModuleIndex];
        setExpandedModules((prev) => ({
          ...prev,
          [nextModule._id]: true,
        }));

        const nextContent = getAllContentSorted(nextModule);
        if (nextContent.length > 0) {
          setCurrentContent(nextContent[0]);
        }
      }
      return;
    }

    const currentIndex = allContent.findIndex(
      (item) => item._id === currentContent._id
    );

    if (currentIndex < allContent.length - 1) {
      // Move to the next content in the same module
      setCurrentContent(allContent[currentIndex + 1]);
    } else if (currentModuleIndex < modules.length - 1) {
      // Move to the next module
      const nextModuleIndex = currentModuleIndex + 1;
      const nextModule = modules[nextModuleIndex];

      setCurrentModuleIndex(nextModuleIndex);
      setExpandedModules((prev) => ({
        ...prev,
        [nextModule._id]: true,
      }));

      const nextContent = getAllContentSorted(nextModule);
      if (nextContent.length > 0) {
        setCurrentContent(nextContent[0]);
      } else {
        // If next module has no content, but there are more modules, try the next one
        if (nextModuleIndex < modules.length - 1) {
          handleNextContent(); // Recursive call to find next module with content
        } else {
          setCurrentContent(null);
        }
      }
    }
  };

  const handlePreviousContent = () => {
    const currentModule = modules[currentModuleIndex];
    if (!currentModule) return;

    const allContent = getAllContentSorted(currentModule);

    if (!currentContent || allContent.length === 0) {
      // If current module has no content but there are previous modules,
      // move to the previous module and try again
      if (currentModuleIndex > 0) {
        const prevModuleIndex = currentModuleIndex - 1;
        setCurrentModuleIndex(prevModuleIndex);

        const prevModule = modules[prevModuleIndex];
        setExpandedModules((prev) => ({
          ...prev,
          [prevModule._id]: true,
        }));

        const prevContent = getAllContentSorted(prevModule);
        if (prevContent.length > 0) {
          setCurrentContent(prevContent[prevContent.length - 1]);
        }
      }
      return;
    }

    const currentIndex = allContent.findIndex(
      (item) => item._id === currentContent._id
    );

    if (currentIndex > 0) {
      // Move to previous content in same module
      setCurrentContent(allContent[currentIndex - 1]);
    } else if (currentModuleIndex > 0) {
      // Move to previous module
      const prevModuleIndex = currentModuleIndex - 1;
      setCurrentModuleIndex(prevModuleIndex);

      const prevModule = modules[prevModuleIndex];
      setExpandedModules((prev) => ({
        ...prev,
        [prevModule._id]: true,
      }));

      // Select last content in previous module
      const prevContent = getAllContentSorted(prevModule);
      if (prevContent.length > 0) {
        setCurrentContent(prevContent[prevContent.length - 1]);
      } else {
        // If previous module has no content, but there are earlier modules, try the previous one
        if (prevModuleIndex > 0) {
          handlePreviousContent(); // Recursive call to find previous module with content
        } else {
          setCurrentContent(null);
        }
      }
    }
  };

  // Check if current content has next item in module
  const hasNextContent = () => {
    if (!modules[currentModuleIndex]) return false;
    if (!currentContent) return currentModuleIndex < modules.length - 1;

    const allContent = getAllContentSorted(modules[currentModuleIndex]);
    const currentIndex = allContent.findIndex(
      (item) => item._id === currentContent._id
    );

    if (currentIndex < allContent.length - 1) {
      // There is more content in the current module
      return true;
    } else if (currentModuleIndex < modules.length - 1) {
      // Check if any of the next modules have content
      for (let i = currentModuleIndex + 1; i < modules.length; i++) {
        const nextModule = modules[i];
        const nextContent = getAllContentSorted(nextModule);
        if (nextContent.length > 0) {
          return true;
        }
      }
    }

    return false;
  };

  // Check if the current content is the first in all modules
  const isFirstContent = () => {
    if (!currentContent) return currentModuleIndex === 0;
    if (currentModuleIndex > 0) {
      // Check if any previous modules have content
      for (let i = 0; i < currentModuleIndex; i++) {
        const prevModule = modules[i];
        const prevContent = getAllContentSorted(prevModule);
        if (prevContent.length > 0) {
          return false;
        }
      }
    }

    const allContent = getAllContentSorted(modules[currentModuleIndex]);
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
      <StudentModuleSidebar
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
        {/* Content display */}
        {modules.length > 0 ? (
          <StudentContentDisplay
            content={currentContent}
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
              <h3 className="text-lg font-medium mb-2">No content found</h3>
              <p className="text-gray-600">
                There are no modules or content available for this course.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentContentSection;
