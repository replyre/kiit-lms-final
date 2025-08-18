import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  ChevronLeft,
  PlayCircle,
  Book,
  Calendar,
  Clock,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import AutoResizeTextbox from "./utils/searcbox";
import { useCourse } from "../../context/CourseContext";
import NoteApp from "./utils/NotesApp";

// Key takeaways data
const keyTakeaways = [
  "Risk and Return go hand in hand. Higher the risk, the higher the Return. Lower the risk, lower the returns.",
  "Investments help you stay ahead of inflation and build wealth over time through compound growth.",
  "Diversification across different asset classes helps reduce overall portfolio risk while maintaining growth potential.",
  "Market intermediaries like brokers, exchanges, and clearing houses facilitate smooth trading operations.",
  "Understanding market fundamentals is crucial before making any investment decisions in the stock market.",
];

// Helper function to convert video URLs to embed URLs (if needed)
const getVideoComponent = (videoUrl) => {
  return (
    <video
      className="w-full h-full rounded-lg shadow-lg dark:shadow-xl"
      controls
      controlsList="nodownload"
    >
      <source src={videoUrl} />
      Your browser does not support the video tag.
    </video>
  );
};

export default function LecturePanel() {
  const [selectedLecture, setSelectedLecture] = useState(null);
  const { courseID } = useParams();
  const { courseData: course } = useCourse();
  const [showNotes, setShowNotes] = useState(false); // State to toggle Notes section
  const [expandedModules, setExpandedModules] = useState({});
  const noteAppRef = useRef(null);
  console.log(course);

  useEffect(() => {
    // Set first lecture of first module as selected
    if (course?.syllabus?.modules) {
      const firstModuleWithLectures = course.syllabus.modules.find(
        (module) => module.lectures && module.lectures.length > 0
      );
      if (firstModuleWithLectures) {
        setSelectedLecture(firstModuleWithLectures.lectures[0]);
        // Expand the module that has the selected lecture
        setExpandedModules({ [firstModuleWithLectures._id]: true });
      }
    }
  }, [course]);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const options = { year: "numeric", month: "long", day: "numeric" };
      return date.toLocaleDateString("en-US", options);
    } catch (error) {
      return dateString;
    }
  };

  const handleOutsideClick = (e) => {
    if (noteAppRef.current && !noteAppRef.current.contains(e.target)) {
      setShowNotes(false);
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const handleLectureSelect = (lecture) => {
    console.log("Selecting lecture:", lecture.title, lecture._id); // Debug log
    setSelectedLecture(lecture);
  };

  useEffect(() => {
    if (showNotes) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showNotes]);

  // Updated to check for course.syllabus.modules
  if (!course || !course.syllabus || !course.syllabus.modules) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent1 dark:border-accent1"></div>
      </div>
    );
  }

  // Updated to filter course.syllabus.modules
  const modulesWithLectures = course.syllabus.modules.filter(
    (module) => module.lectures && module.lectures.length > 0
  );

  if (modulesWithLectures.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg border border-gray-200 dark:border-gray-600">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">No Lectures Available</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            There are currently no lectures for this course.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex max-w-7xl flex-col min-h-screen bg-gray-50 dark:bg-gray-900 relative mx-auto">
      {/* Header */}
      

      <div className="flex flex-col md:flex-row flex-1">
        {/* Left Panel - Module and Lecture List */}
        <div className="w-full md:w-1/3 lg:w-1/4 bg-white dark:bg-gray-800 shadow-md dark:shadow-lg p-4 overflow-y-auto border-r border-gray-200 dark:border-gray-600 mt-10 h-fit">
          <h2 className="font-bold text-lg mb-4 text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2">
            Course Modules
          </h2>

          <div className="space-y-2">
            {/* Updated to map over course.syllabus.modules */}
            {course.syllabus.modules.map((module) => (
              <div key={module._id} className="border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                <button
                  onClick={() => toggleModule(module._id)}
                  className="w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-gray-900 dark:text-white"
                >
                  <div className="flex flex-col items-center text-left">
                    <span className="font-medium text-sm">
                      Module {module.moduleNumber}: {module.moduleTitle}
                    </span>
                    {module.lectures && module.lectures.length > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                        ({module.lectures.length} lectures)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center">
                    {expandedModules[module._id] ? (
                      <ChevronDown size={16} className="text-gray-600 dark:text-gray-300" />
                    ) : (
                      <ChevronRight size={16} className="text-gray-600 dark:text-gray-300" />
                    )}
                  </div>
                </button>

                {expandedModules[module._id] &&
                  module.lectures &&
                  module.lectures.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-600">
                      {module.lectures.map((lecture, index) => (
                        <button
                          key={lecture._id}
                          onClick={() => handleLectureSelect(lecture)}
                          className={`w-full text-left p-3 pl-6 transition-all duration-200 flex items-start border-b border-gray-100 dark:border-gray-600 last:border-b-0 ${
                            selectedLecture?._id === lecture._id
                              ? "bg-accent1/30 dark:bg-accent1/60 text-accent1 dark:text-accent1/70"
                              : "hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          <div className="mr-3 mt-1">
                            <PlayCircle
                              size={16}
                              className={
                                selectedLecture?._id === lecture._id
                                  ? "text-accent1/30 dark:text-accent1/70"
                                  : "text-gray-400 dark:text-gray-500"
                              }
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-sm">
                              {lecture.lectureOrder}. {lecture.title}
                            </h3>
                            <p
                              className={`text-xs mt-1 ${
                                selectedLecture?._id === lecture._id
                                  ? "text-accent1/30 dark:text-accent1/70"
                                  : "text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              Lecture {lecture.lectureOrder} •{" "}
                              {formatDate(lecture.createdAt)}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Lecture Content */}
        <div className="w-full md:w-2/3 lg:w-3/4 p-6">
          {selectedLecture ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6 border border-gray-200 dark:border-gray-600">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {selectedLecture.title}
                </h2>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-1" />
                    {formatDate(selectedLecture.createdAt)}
                  </div>
                  <div className="flex items-center">
                    <Clock size={16} className="mr-1" />
                    Last updated: {formatDate(selectedLecture.updatedAt)}
                  </div>
                </div>
              </div>

              {selectedLecture.videoUrl && (
                <div className="aspect-video w-full mb-6 rounded-lg overflow-hidden shadow-lg dark:shadow-xl">
                  {getVideoComponent(selectedLecture.videoUrl)}
                </div>
              )}

              {/* Download and Reading Links */}
              {/* <div className="mb-6 space-y-2">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <span>Download the excel </span>
                  <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline ml-1">
                    here.
                  </button>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <span>We recommend reading </span>
                  <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline ml-1">
                    this chapter
                  </button>
                  <span className="ml-1">
                    {" "}
                    on Varsity to learn more and understand the concepts
                    in-depth.
                  </span>
                </div>
              </div> */}

              {/* Key Takeaways */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Key takeaways from this chapter
                </h3>
                <div className="space-y-3">
                  {keyTakeaways.map((takeaway, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-accent1 dark:bg-accent1 text-accent1/30 dark:text-accent1/30 rounded-full flex items-center justify-center text-sm font-medium mt-0.5 border border-accent1 dark:border-accent1">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {takeaway}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg mb-6 p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Lecture Content
                  </h3>
                </div>
                <div className="prose max-w-none pl-7">
                  <p className="text-gray-700 dark:text-gray-300">{selectedLecture.content}</p>
                </div>
              </div>

              {/* AutoResizeTextbox in original position */}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Select a lecture to view details
              </p>
            </div>
          )}
        </div>
      </div>
      <AutoResizeTextbox />
      {/* Notes Section */}
      {showNotes && (
        <div
          ref={noteAppRef}
          className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 shadow-lg dark:shadow-xl rounded-lg w-[60rem] h-[40rem] overflow-auto z-50 border border-gray-200 dark:border-gray-600"
        >
          <div className="p-4">
            <button
              onClick={() => setShowNotes(false)}
              className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            >
              <X size={20} />
            </button>
            <NoteApp />
          </div>
        </div>
      )}

      {/* Fixed Notes Button */}
      <button
        onClick={() => setShowNotes(true)}
        className="fixed bottom-4 right-4 bg-accnet1 dark:bg-accent1 text-white px-4 py-2 rounded-full shadow-lg dark:shadow-xl hover:bg-accent1 dark:hover:bg-accent1 transition-colors"
      >
        Notes
      </button>
    </div>
  );
}