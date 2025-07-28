import React, { useEffect, useState, useRef } from "react";
import {
  ArrowLeft,
  ChevronDown,
  BookOpen,
  Users,
  Video,
  FileText,
  BarChart2,
  MonitorPlay,
  Activity,
} from "lucide-react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getCoursesById } from "../../../services/course.service";
import { useCourse } from "../../../context/CourseContext";
import LoadingSpinner from "../../../utils/LoadingAnimation";
import MentorInfo from "../../../components/dashboard/utils/MentorInfo";
import CourseInfo from "../../../components/dashboard/utils/CourseInfo";
import WeeklyPlanTable from "../../../components/dashboard/utils/WeeklyInfo";
import SyllabusAccordion from "../../../components/dashboard/utils/SyllabusComponent";
import LectureContent from "../../../components/dashboard/utils/RecordedComponent";
import AssignmentsList from "../../../components/dashboard/utils/AssignmentComponent/AssignmentList";
import CourseDetailsComponents from "../../../components/dashboard/utils/CourseDetailsComponent";
import { TfiAnnouncement } from "react-icons/tfi";
import { FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { IoIosHome } from "react-icons/io";
import StudentHome from "./course/StudentHome";
import StudentContentSection from "./course/Content/StudentContentSection";
import SelfQuiz from "../teacher/course/Test/SelfQuiz";
import DiscussionForum from "../teacher/course/DiscussionForm";
import { useAuth } from "../../../context/AuthContext";
import { MdLiveTv } from "react-icons/md";
import LecturePanel from "../../lecture/LecturePanel";
import StudentAssignmentSection from "../../Assignment/student/ShowAssignment";
import { VscCommentDiscussion } from "react-icons/vsc";
import ProfileDropdown from "../../../utils/ProfileDropDown";
import AllAnnouncements from "./course/AllAnnouncements.jsx/AllAnnouncements";
import StudentActivitySection from "../../Activity/student/StudentActivitySection";
import { Si1Panel } from "react-icons/si";


const navigationOptions = {
  home: {
    title: "Home",
    icon: <IoIosHome className="w-5 h-5" />,
  },
  courses: {
    title: "Course",
    icon: <BookOpen className="w-5 h-5" />,
  },
  content: {
    title: "Content",
    icon: <MonitorPlay className="w-5 h-5" />,
    items: [
      { label: "Recorded", icon: <Video className="w-5 h-5" /> },
      { label: "E-Content", icon: <FileText className="w-5 h-5" /> },
    ],
  },
  assessment: {
    title: "Assessment",
    icon: <BarChart2 className="w-5 h-5" />,
    items: [
      { label: "Graded", icon: <FileText className="w-5 h-5" /> },
      { label: "Self Assessment", icon: <FileText className="w-5 h-5" /> },
      { label: "Activity", icon: <Activity className="w-5 h-5" /> },
    ],
  },
  assignment: {
    title: "Discussion",
    icon: <FileText className="w-5 h-5" />,
  },
};

const CourseDetails = () => {
  const [selectedOption, setSelectedOption] = useState("Home");
  const [openDropdown, setOpenDropdown] = useState(null);
  const { courseID } = useParams();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { courseData: course, setCourseData } = useCourse();
  const [loading, setLoading] = useState(true);
  const dropdownRefs = useRef({});

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await getCoursesById(courseID);
        setCourseData(response);
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseID, setCourseData]);

  // Add click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown) {
        const currentDropdownRef = dropdownRefs.current[openDropdown];
        if (currentDropdownRef && !currentDropdownRef.contains(event.target)) {
          setOpenDropdown(null);
        }
      }
    };

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  const renderDropdown = (menuKey) => {
    if (!navigationOptions[menuKey]) return null;
    const { title, icon, items } = navigationOptions[menuKey];

    if (!items || items.length === 0) {
      return (
        <button
          onClick={() => setSelectedOption(title)}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
        >
          {icon}
          <span>{title}</span>
        </button>
      );
    }

    return (
      <div
        className="relative dropdown-container"
        ref={(el) => (dropdownRefs.current[menuKey] = el)}
      >
        <button
          onClick={() => toggleDropdown(menuKey)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
            openDropdown === menuKey
              ? "bg-gray-100 text-emerald-600"
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
                      ? "bg-emerald-50 text-emerald-700"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      selectedOption === item.label
                        ? "bg-emerald-100"
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

  const renderContent = () => {
    switch (selectedOption) {
      case "Home":
        return <StudentHome setSelectedOption={setSelectedOption} />;
      case "Course":
        return (
          <div className="max-w-[1600px] mx-auto mt-4">
            <div className="text-3xl pl-10 font-bold">Explore Course</div>
            <div className="p-10 flex flex-col gap-2">
              {/* Mentor Info */}
              <div className="flex gap-4 ">
                <div className="flex flex-col w-[50%]">
                  <MentorInfo />
                  <SyllabusAccordion course={course} />
                </div>

                {/* Course Info */}

                <CourseInfo course={course} />
              </div>
              {/* Syllabus */}

              {/* Weekly Plan */}

              <WeeklyPlanTable course={course} />
            </div>
          </div>
        );
      case "Discussion":
        return <DiscussionForum />;
      case "Recorded":
        return <LecturePanel />;
      case "E-Content":
        return <StudentContentSection />;
      case "Graded":
        return <StudentAssignmentSection courseID={courseID} selectedID="0" />;
      case "Self Assessment":
        return <SelfQuiz />;
      case "Activity":
        return <StudentActivitySection courseID={courseID} selectedID="0" />;
      case "Assignments":
        return <AssignmentsList />;
      case "Announcements":
        return <AllAnnouncements />;
      default:
        return <div>Welcome to the Home Section</div>;
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!course) return <div>Course not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end items-center h-16">
          
           

            {/* Profile and Logout on Right */}
            <div className="flex items-center space-x-4 relative z-[1000]">
              <abbr title="Announcements">
                <button className="p-2  rounded-full  hover:bg-primary/20 transition-colors  text-primary/70 hover:text-primary">
                  <TfiAnnouncement
                    onClick={() => setSelectedOption("Announcements")}
                  />
                </button>
              </abbr>
              <ProfileDropdown role={"student"} />
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
 <Link to={"/its"} className="fixed h-16 w-16 bg-white border-black border-2 rounded  top-[60%] z-100 flex flex-col items-center justify-center"><Si1Panel className=" h-8 w-8  " /> ITS</Link>
      {/* Course Banner */}
      <div className="flex h-fit w-[90%] m-auto pt-4">
        
        <img
          src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=2340&q=80"
          alt={course.name}
          className="w-[50%] h-[350px] object-cover rounded-lg"
        />
        <div className=" inset-0  flex items-center">
          <div className="container mx-auto px-6">
            <h1 className="text-4xl font-bold text-primary">{course.title}</h1>
            <p className="text-xl text-primary/60 mt-2">
              {course.teacher?.name || "Unknown Instructor"}
            </p>
          </div>
          <button className="flex justify-center items-center gap-2 bottom-[50%] absolute  right-8 text-lg px-6 py-2 bg-primary/80 text-white rounded-lg hover:bg-primary transition-colors">
            <MdLiveTv />
            Join Live Class
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white shadow-sm fixed w-full top-0 z-40">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-6 top-3 z-10 border border-black flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-lg text-white hover:bg-gray-200 hover:text-black hover:shadow-md transition-all"
        >
          <ArrowLeft className="h-5 w-5 text-black" />
          <span className="text-black">Back</span>
        </button>
        <div className="max-w-[80%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex mx-auto items-center space-x-6">
              {Object.keys(navigationOptions).map((key) => renderDropdown(key))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto  px-4 sm:px-6 lg:px-8 py-8 ">
        {renderContent()}
      </main>
    </div>
  );
};

export default CourseDetails;
