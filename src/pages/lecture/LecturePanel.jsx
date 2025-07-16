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
      className="w-full h-full rounded-lg shadow-lg"
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

  useEffect(() => {
    // Set first lecture of first module with lectures as selected
    if (course?.modules) {
      const firstModuleWithLectures = course.modules.find(
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

  if (!course || !course.modules) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const modulesWithLectures = course.modules.filter(
    (module) => module.lectures && module.lectures.length > 0
  );

  if (modulesWithLectures.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">No Lectures Available</h2>
          <p className="text-gray-600 mb-4">
            There are currently no lectures for this course.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex max-w-7xl flex-col min-h-screen bg-gray-50 relative mx-auto">
      {/* Header */}
      

      <div className="flex flex-col md:flex-row flex-1">
        {/* Left Panel - Module and Lecture List */}
        <div className="w-full md:w-1/3 lg:w-1/4 bg-white shadow-md p-4 overflow-y-auto border-r mt-10 h-fit">
          <h2 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">
            Course Modules
          </h2>

          <div className="space-y-2">
            {course.modules.map((module) => (
              <div key={module._id} className="border rounded-lg">
                <button
                  onClick={() => toggleModule(module._id)}
                  className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col items-center text-left">
                    <span className="font-medium text-sm">
                      Module {module.moduleNumber}: {module.moduleTitle}
                    </span>
                    {module.lectures && module.lectures.length > 0 && (
                      <span className="text-xs text-gray-500 mr-2">
                        ({module.lectures.length} lectures)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center">
                    {expandedModules[module._id] ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </div>
                </button>

                {expandedModules[module._id] &&
                  module.lectures &&
                  module.lectures.length > 0 && (
                    <div className="border-t">
                      {module.lectures.map((lecture, index) => (
                        <button
                          key={lecture._id}
                          onClick={() => setSelectedLecture(lecture)}
                          className={`w-full text-left p-3 pl-6 transition-all duration-200 flex items-start border-b last:border-b-0 ${
                            selectedLecture?._id === lecture._id
                              ? "bg-green-50 text-green-800"
                              : "hover:bg-gray-50 text-gray-800"
                          }`}
                        >
                          <div className="mr-3 mt-1">
                            <PlayCircle
                              size={16}
                              className={
                                selectedLecture?._id === lecture._id
                                  ? "text-green-600"
                                  : "text-gray-400"
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
                                  ? "text-green-600"
                                  : "text-gray-500"
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
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedLecture.title}
                </h2>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
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
                <div className="aspect-video w-full mb-6 rounded-lg overflow-hidden shadow-lg">
                  {getVideoComponent(selectedLecture.videoUrl)}
                </div>
              )}

              {/* Download and Reading Links */}
              {/* <div className="mb-6 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <span>Download the excel </span>
                  <button className="text-blue-600 hover:text-blue-700 underline ml-1">
                    here.
                  </button>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span>We recommend reading </span>
                  <button className="text-blue-600 hover:text-blue-700 underline ml-1">
                    this chapter
                  </button>
                  <span className="ml-1">
                    {" "}
                    on Varsity to learn more and understan                    on Varsity to learn more and understand the concepts
                    in-depth.
                  </span>
                </div>
              </div> */}

              {/* Key Takeaways */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Key takeaways from this chapter
                </h3>
                <div className="space-y-3">
                  {keyTakeaways.map((takeaway, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {takeaway}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className=" bg-gray-50 rounded-lg mb-6">
                <div className="flex items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Lecture Content
                  </h3>
                </div>
                <div className="prose max-w-none pl-7">
                  <p className="text-gray-700">{selectedLecture.content}</p>
                </div>
              </div>

              {/* AutoResizeTextbox in original position */}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-xl text-gray-600">
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
          className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg w-[60rem] h-[40rem] overflow-auto z-50"
        >
          <div className="p-4">
            <button
              onClick={() => setShowNotes(false)}
              className="text-red-500 hover:text-red-700"
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
        className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-green-700"
      >
        Notes
      </button>
    </div>
  );
}
