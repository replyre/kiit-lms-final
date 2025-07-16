import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Book,
  CheckSquare,
  Calendar,
  Clock,
  UserCheck,
  ChevronRight,
  ArrowRight,
  BookOpen,
  Layers,
} from "lucide-react";
import {
  courses,
  assignments,
  events,
} from "../../../components/data/mockData";
import toast from "react-hot-toast";
import { getAllCourses } from "../../../services/course.service";
import calculateAttendance from "../../../utils/Functions/CalculateStudentAttendencePercentage";
import { useAuth } from "../../../context/AuthContext";
import { useCourse } from "../../../context/CourseContext";
import AssignmentStatusChart from "./AssignmentStatusChart";

const DashboardSemesterContent = ({ setActiveSection }) => {
  const navigate = useNavigate();
  const [meetingsData, setMeetingsData] = useState([]);
  const [coursesData, setCoursesData] = useState([]);
  const [loading, setLoading] = useState(true);
  console.log(coursesData);
  const allAssignmentsCount = coursesData.courses?.reduce((total, course) => {
  const assignmentsInCourse = course.assignments?.length || 0;
  return total + assignmentsInCourse;
}, 0) || 0;
  const pendingAssignmentsCount = coursesData.courses?.reduce((total, course) => {
  const pendingInCourse = course.assignments?.filter(assignment => 
    assignment.submissions.length === 0
  ).length || 0;
  return total + pendingInCourse;
}, 0) || 0;
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getAllCourses();
        setCoursesData(data);
          await fetchMeetings(); 
        setLoading(false);
      } catch (err) {
        console.log(err);
        toast.error("Failed to load courses. Please try again later.");
        setLoading(false);
      }
    };

    fetchCourses();
     
  }, []);

  const getThisWeekMeetings = () => {
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Start of week (Sunday)
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // End of week (Saturday)
  endOfWeek.setHours(23, 59, 59, 999);

  return meetingsData.filter(meeting => 
    meeting.date >= startOfWeek && meeting.date <= endOfWeek
  );
};
const fetchMeetings = async () => {
  try {
    const response = await fetch("https://meeting-backend-theta.vercel.app/api/meetings"); // Replace API_URL with your actual endpoint

    if (!response.ok) {
      throw new Error("Failed to fetch meetings");
    }

    const data = await response.json();

    // Process the data to convert string dates to Date objects
    const processedData = data.map((meeting) => ({
      ...meeting,
      date: new Date(meeting.date),
      start: new Date(meeting.start),
      end: new Date(meeting.end),
    }));

    setMeetingsData(processedData);
  } catch (err) {
    console.log(err);
    toast.error("Failed to load meetings. Please try again later.");
  }
};

  const dummyData = {
    courses,
    assignments,
    events,
  };

  const getStatusStyle = (status) => {
    const styles = {
      submitted: "text-emerald-600 bg-emerald-50 border-emerald-200",
      in_progress: "text-blue-600 bg-blue-50 border-blue-200",
      not_started: "text-gray-600 bg-gray-50 border-gray-200",
    };
    return styles[status] || styles.not_started;
  };

  const getStatusLabel = (status) => {
    const labels = {
      submitted: "Submitted",
      in_progress: "In Progress",
      not_started: "Not Started",
    };
    return labels[status] || "Not Started";
  };

  // Get counts of assignment statuses
  const assignmentCounts = {
    submitted: dummyData.assignments.filter((a) => a.status === "submitted")
      .length,
    in_progress: dummyData.assignments.filter((a) => a.status === "in_progress")
      .length,
    not_started: dummyData.assignments.filter((a) => a.status === "not_started")
      .length,
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-emerald-500 border-opacity-50 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="p-6 space-y-8">
      {/* Welcome Section */}

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            id: "Courseware",
            title: "My Courses",
            icon: <BookOpen className="h-6 w-6 text-primary" />,
            count: coursesData?.user?.totalCourses || 0,
            description: "Active Courses",
            bgClass: "bg-white",
            color: "text-primary",
          },
          {
            id: "Assignment",
            title: "Assignments",
            icon: <CheckSquare className="h-6 w-6 text-blue-600" />,
            count: pendingAssignmentsCount,
            description: "Pending Tasks",
            bgClass: "bg-white",
            color: "text-blue-600",
          },
          {
            id: "LiveClass",
            title: "Live Classes",
            icon: <Calendar className="h-6 w-6 text-purple-600" />,
            count: getThisWeekMeetings().length,
            description: "This Week",
            bgClass: "bg-white",
            color: "text-purple-600",
          },
          {
            id: "MyStats",
            title: "Attendance",
            icon: <UserCheck className="h-6 w-6 text-emerald-600" />,
            count: `${Math.round(
              calculateAttendance(coursesData.user._id, coursesData.courses)
                .overall.attendancePercentage
            ) || "-"
              }%`,
            description: "Overall Rate",
            bgClass: "bg-white",
            color: "text-emerald-600",
          },
        ].map((item, index) => (
          <div
            key={index}
            className={`${item.bgClass} p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer`}
            onClick={() => setActiveSection(item.id)}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-2 bg-gray-50 rounded-lg ${item.color}`}>
                {item.icon}
              </div>
              <h2 className="text-lg font-medium text-gray-800">
                {item.title}
              </h2>
            </div>
            <p className={`text-3xl font-bold mb-1 ${item.color}`}>
              {item.count}
            </p>
            <p className="text-gray-500 text-sm">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Courses Section */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <Book className="h-5 w-5 mr-2 text-primary" />
              Recent Courses
            </h2>
            <button
              className="text-primary hover:text-primary-dark flex items-center text-sm font-medium"
              onClick={() => setActiveSection("Courseware")}
            >
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coursesData.courses.slice(0, 4).map((course) => (
              <Link
                key={course.id}
                to={`/student/course/${course._id}`}
                className="group relative flex flex-col justify-between rounded-lg border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all duration-200 overflow-hidden"
                onClick={() => {
                  course.available
                    ? navigate(`/student/course/${course._id}`)
                    : null;
                }}
              >
                {/* Course Image */}
                <div className="relative h-40 w-full">
                  <img
                    src={course.coverImage || "/course.png"}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </div>

                {/* Course Details */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                    {course.aboutCourse}
                  </p>
                </div>

                {/* Course Footer */}
                {/* Course Footer */}
<div className="p-3 bg-gray-50 border-t border-gray-100">
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
    <div className="flex items-center">
      <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded-full truncate max-w-[120px] sm:max-w-[150px]">
        {course.semester.name}
      </span>
    </div>
    
    <div className="flex items-center space-x-3 text-xs">
      <div className="flex items-center space-x-1">
        <CheckSquare className="h-3.5 w-3.5 text-blue-500" />
        <span className="font-medium text-gray-700">{course.assignmentCount}</span>
        <span className="text-gray-500 hidden sm:inline">Assignments</span>
        <span className="text-gray-500 sm:hidden">Assign.</span>
      </div>
      <div className="w-px h-3 bg-gray-300"></div>
      <div className="flex items-center space-x-1">
        <Book className="h-3.5 w-3.5 text-emerald-500" />
        <span className="font-medium text-gray-700">{course.lectureCount}</span>
        <span className="text-gray-500 hidden sm:inline">Lectures</span>
        <span className="text-gray-500 sm:hidden">Lect.</span>
      </div>
    </div>
  </div>
</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Assignment Summary Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <Layers className="h-5 w-5 mr-2 text-primary" />
              Assignment Status
            </h2>
          </div>

         <AssignmentStatusChart 
  allAssignmentsCount={allAssignmentsCount}
  pendingAssignmentsCount={pendingAssignmentsCount}
  setActiveSection={setActiveSection}
/>
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            Upcoming Events
          </h2>
          <button
            className="text-primary hover:text-primary-dark flex items-center text-sm font-medium"
            onClick={() => setActiveSection("LiveClass")}
          >
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dummyData.events.map((event) => (
            <div
              key={event.id}
              className="group flex flex-col bg-white rounded-lg border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
              onClick={() => navigate(event.link)}
            >
              <div className="relative h-40">
                <img
                  src={event.image}
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg inline-flex items-center">
                    <Calendar className="h-3.5 w-3.5 text-primary mr-1.5" />
                    <span className="text-xs font-medium">
                      {event.date} · {event.time}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-base font-medium text-gray-800 group-hover:text-primary transition-colors mb-1">
                  {event.name}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {event.description}
                </p>
              </div>

              <div className="mt-auto border-t border-gray-100 p-3 flex items-center justify-between">
                <span className="text-xs font-medium text-primary">
                  View Event
                </span>
                <ArrowRight className="h-4 w-4 text-primary" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assignments Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <CheckSquare className="h-5 w-5 mr-2 text-primary" />
            Recent Assignments
          </h2>
          <button
            className="text-primary hover:text-primary-dark flex items-center text-sm font-medium"
            onClick={() => setActiveSection("Assignment")}
          >
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm">
                  Assignment
                </th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm">
                  Course
                </th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm">
                  Due Date
                </th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {dummyData.assignments.slice(0, 4).map((assignment) => (
                <tr
                  key={assignment.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary mr-3">
                        <CheckSquare className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-gray-800">
                        {assignment.title}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {assignment.course}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-1.5" />
                      <span className="text-sm text-gray-600">
                        {assignment.dueDate}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-medium ${getStatusStyle(
                        assignment.status
                      )}`}
                    >
                      {getStatusLabel(assignment.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardSemesterContent;
