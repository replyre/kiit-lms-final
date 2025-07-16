import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Loader2,
  BookOpen,
  Calendar,
  Users,
  ClipboardList,
  Video,
  FileText,
  BarChart2,
  Clock,
  Layout,
  Activity,
  CheckCircle,
  Monitor,
} from "lucide-react";
import { VscCommentDiscussion, VscLiveShare } from "react-icons/vsc";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { getCoursesById } from "../../../services/course.service";
import { useCourse } from "../../../context/CourseContext";
import { TfiAnnouncement } from "react-icons/tfi";
import { Si1Panel } from "react-icons/si";
// Import your components
import CourseBrief from "./course/CourseBrief";
import WeeklyPlanManager from "./course/WeeklyPlanner";
import StudentTable from "./course/StudentDetail";
import AllAssignments from "../../Assignment/teacher/AllAssignments";
import LectureReview from "./course/LectureReview";
import SyllabusManager from "./course/Syllabus";
import CourseSchedule from "./course/CourseSchedule";
import AttendanceHeatMap from "./course/AttendenceHeatMap";
import AttendanceTracker from "./course/AttendanceTracker";
import AttendanceStats from "./course/AttendanceStats";
import StudentGradingTable from "./course/GradeSheet";
import { FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import TeacherHome from "./course/TeacherHome";
import AnnouncementManagement from "./course/AnnouncementManagement";
import ContentSection from "./course/Content/Content";
import SelfQuiz from "./course/Test/SelfQuiz";
import QuizCreator from "./course/Test/QuizCreator";
import DiscussionForum from "./course/DiscussionForm";
import { useAuth } from "../../../context/AuthContext";
import ProfileDropdown from "../../../utils/ProfileDropDown";
import AllActivities from "../../Activity/teacher/AllActivities";
import BlogCreator from "./course/Blog/BlogCreator";

const CourseManagement = () => {
  const [selectedOption, setSelectedOption] = useState("Home");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Get courseId from URL parameters
  const { courseID } = useParams();
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  // Get context to update it
  const { courseData, setCourseData } = useCourse();

  // Function to extract course ID from URL path
  const extractCourseIdFromPath = () => {
    const pathParts = location.pathname.split("/");
    return pathParts[pathParts.length - 1];
  };

  // Fetch course data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      // Extract course ID from URL
      const courseId = courseID || extractCourseIdFromPath();

      if (!courseId) {
        setLoading(false);
        setError("No course ID found in the URL");
        return;
      }

      try {
        setLoading(true);
        const response = await getCoursesById(courseId);

        // Update the entire course data with what we got from API
        setCourseData(response);
        console.log({ ...response });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching course data:", err);
        setError("Failed to load course data. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, [courseID, setCourseData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  // Navigate to E-Content page
  // const handleEContentClick = () => {
  //   navigate(`/teacher/econtent/${courseID}`);
  // };

  // Navigate options with icons
  const navigationOptions = {
    course: {
      title: "Course",
      icon: <BookOpen className="w-5 h-5" />,
      items: [
        { label: "Course Brief", icon: <FileText className="w-5 h-5" /> },
        { label: "Syllabus", icon: <BookOpen className="w-5 h-5" /> },
        { label: "Weekly Plan", icon: <Calendar className="w-5 h-5" /> },
        { label: "Class Schedule", icon: <Clock className="w-5 h-5" /> },
      ],
    },
    attendance: {
      title: "Students",
      icon: <Users className="w-5 h-5" />,
      items: [
        {
          label: "Mark Attendance",
          icon: <ClipboardList className="w-5 h-5" />,
        },
        { label: "Heat Map", icon: <BarChart2 className="w-5 h-5" /> },
        { label: "Status Sheet", icon: <Layout className="w-5 h-5" /> },
        {
          label: "Class List",
          icon: <Users className="w-5 h-5" />,
        },
      ],
    },
    assignment: {
      title: "Assignment",
      icon: <Activity className="w-5 h-5" />,
      items: [
        { label: "Subjective", icon: <FileText className="w-5 h-5" /> },
        { label: "Objective", icon: <Layout className="w-5 h-5" /> },
        { label: "Practical Activity", icon: <Activity className="w-5 h-5" /> },
      ],
    },
  };

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <span className="ml-2 text-lg">Loading course data...</span>
      </div>
    );
  }

  // Show error state if there was a problem
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-50 p-6 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    return (
      <div className="bg-white rounded-xl shadow-sm relative ">
        <div className="">
          {/* <div className="flex justify-between items-center absolute -top-10 right-36">
            <SaveButton urlId={courseID} />
          </div> */}

          <div className="min-h-96">
            {selectedOption === "Course Brief" && <CourseBrief />}
            {selectedOption === "Weekly Plan" && <WeeklyPlanManager />}
            {selectedOption === "Class List" && <StudentTable />}
            {selectedOption === "Subjective" && (
              <AllAssignments courseID={courseID} />
            )}
            {selectedOption === "Objective" && <QuizCreator />}
            {selectedOption === "Practical Activity" && (
              <AllActivities courseID={courseID} />
            )}
            {selectedOption === "Home" && (
              <TeacherHome setSelectedOption={setSelectedOption} />
            )}
            {selectedOption === "Recorded Lectures" && <LectureReview />}
            {selectedOption === "Syllabus" && <SyllabusManager />}
            {selectedOption === "Class Schedule" && <CourseSchedule />}
            {selectedOption === "Heat Map" && <AttendanceHeatMap />}
            {selectedOption === "Mark Attendance" && <AttendanceTracker />}
            {selectedOption === "Status Sheet" && <AttendanceStats />}
            {selectedOption === "Content" && (
              <ContentSection setSelectedOption={setSelectedOption} />
              // <BlogCreator />
            )}

            {/* Add this section for Self Test */}
            {selectedOption === "Self Test" && <SelfQuiz />}
            {selectedOption === "Create Quiz" && <QuizCreator />}
            {selectedOption === "Announcements" && (
              <AnnouncementManagement courseID={courseID} />
            )}

            {selectedOption === "Grade Sheet" && <StudentGradingTable />}
            {selectedOption === "Discussion" && <DiscussionForum />}
          </div>
        </div>
      </div>
    );
  };

  const renderDropdown = (menuKey) => {
    if (!navigationOptions[menuKey]) return null;
    const { title, icon, items } = navigationOptions[menuKey];

    return (
      <div className="relative dropdown-container">
        <button
          onClick={() => toggleDropdown(menuKey)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
            openDropdown === menuKey
              ? "bg-gray-100 text-primary"
              : "text-gray-700"
          }`}
        >
          {icon}
          <span>{title}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              openDropdown === menuKey ? "rotate-180" : ""
            }`}
          />
        </button>

        {openDropdown === menuKey && (
          <div className="absolute left-0 mt-2 w-[440px] bg-white rounded-xl shadow-lg border border-gray-200 py-4 z-50">
            <div className="grid grid-cols-2 gap-4 px-4">
              {items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setSelectedOption(item.label);
                    setOpenDropdown(null);
                  }}
                  className={`flex items-center space-x-3 p-4 rounded-lg transition-colors ${
                    selectedOption === item.label
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      selectedOption === item.label
                        ? "bg-primary/20"
                        : "bg-gray-100"
                    }`}
                  >
                    {item.icon}
                  </div>
                  <span className="font-medium text-left">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header with Logo, Profile and Logout */}
      <header className="bg-white border-b border-gray-200">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo on Left */}
            <div
              className="flex items-center"
              onClick={() => setSelectedOption("Home")}
            >
              <div className="flex-shrink-0">
                <img
                  className="h-12 w-auto"
                  src="/DhammName.png"
                  alt="Dhamm Nexus"
                />
              </div>
            </div>

            {/* Profile and Logout on Right */}
            <div className="flex items-center space-x-4">
              <abbr title="Discussions">
                <button className="p-2  rounded-full hover:bg-primary/20 transition-colors  text-secondary hover hover:text-primary">
                  <VscCommentDiscussion
                    onClick={() => setSelectedOption("Discussion")}
                  />
                </button>
              </abbr>
              <abbr title="Announcements">
                <button className="p-2  rounded-full  hover:bg-primary/20 transition-colors  text-secondary hover:text-primary">
                  <TfiAnnouncement
                    onClick={() => setSelectedOption("Announcements")}
                  />
                </button>
              </abbr>
              <ProfileDropdown role={"teacher"} />
              <abbr title="Logout">
                <button
                  className="p-2 rounded-full hover:bg-red/40 transition-colors  text-red-600"
                  onClick={() => handleLogout()}
                >
                  <FaSignOutAlt size={22} />
                </button>
              </abbr>
            </div>
          </div>
        </div>
      </header>

      {/* Course Header Banner */}
      <div className="relative h-64 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=2340&q=80"
          alt={courseData.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center">
          <div className="container mx-auto px-6">
            <h1 className="text-4xl font-bold text-white">
              {courseData.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="bg-white  shadow-sm sticky top-0 z-40">
        <div className="max-w-[80%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex  items-center justify-between h-16">
            {/* Left side - Take Class Button */}
            <button
              onClick={() => navigate(-1)}
              className="absolute left-6 top-3 z-10 border border-black flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-lg text-white hover:bg-gray-200 hover:text-black hover:shadow-md transition-all"
            >
              <ArrowLeft className="h-5 w-5 text-black" />
              <span className="text-black">Back</span>
            </button>

            {/* Navigation Items */}
            <div className="flex mx-auto items-center space-x-6 ">
              {/* Dropdown Menus */}
              {Object.keys(navigationOptions).map((key) => renderDropdown(key))}

              {/* Single Menu Items */}
              {/* <button
                onClick={() => setSelectedOption("Class List")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                  selectedOption === "Class List"
                    ? "bg-gray-100 text-primary"
                    : "text-gray-700"
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Students</span>
              </button> */}

              <button
                onClick={() => setSelectedOption("Recorded Lectures")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                  selectedOption === "Recorded Lectures"
                    ? "bg-gray-100 text-primary"
                    : "text-gray-700"
                }`}
              >
                <Video className="w-5 h-5" />
                <span>Recordings</span>
              </button>

              <button
                onClick={() => setSelectedOption("Content")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                  selectedOption === "Content"
                    ? "bg-gray-100 text-primary"
                    : "text-gray-700"
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>Content</span>
              </button>

              <button
                onClick={() => setSelectedOption("Grade Sheet")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                  selectedOption === "Grade Sheet"
                    ? "bg-gray-100 text-primary"
                    : "text-gray-700"
                }`}
              >
                <BarChart2 className="w-5 h-5" />
                <span>Grades</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className=" mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {renderContent()}
      </main>
    </div>
  );
};

export default CourseManagement;
