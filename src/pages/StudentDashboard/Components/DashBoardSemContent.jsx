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
// 1. Import the context hook
import { useMeeting } from "../../../context/MeetingContext";
import toast from "react-hot-toast";
import { getAllCourses } from "../../../services/course.service";
import calculateAttendance from "../../../utils/Functions/CalculateStudentAttendencePercentage";
import AssignmentStatusChart from "./AssignmentStatusChart";

const DashboardSemesterContent = ({ setActiveSection }) => {
  const navigate = useNavigate();
  // 2. Get meetings and their state from the context
  const { meetings, loading: meetingsLoading, error: meetingsError,  } = useMeeting();
  
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

  // Function to get all assignments from all courses
  const getAllAssignments = () => {
    if (!coursesData.courses) return [];

    const assignments = [];
    coursesData.courses.forEach(course => {
      if (course.assignments && course.assignments.length > 0) {
        course.assignments.forEach(assignment => {
          assignments.push({
            ...assignment,
            courseName: course.title,
            courseId: course._id
          });
        });
      }
    });

    // Sort by due date (most recent first)
    return assignments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  };

  // Function to determine assignment status based on submissions
  const getAssignmentStatus = (assignment, userId) => {
    if (!assignment.submissions || assignment.submissions.length === 0) {
      return "not_started";
    }

    const userSubmission = assignment.submissions.find(sub => sub.student === userId);
    if (userSubmission) {
      if (userSubmission.status === "graded") {
        return "submitted";
      } else {
        return "in_progress";
      }
    }

    return "not_started";
  };

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Function to format time
  const formatTime = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
      });
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getAllCourses();
      
        setCoursesData(data);
        
      } catch (err) {
        console.log(err);
        toast.error("Failed to load courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);
  
  // Effect to handle meeting loading errors
  useEffect(() => {
    if (meetingsError) {
      toast.error("Failed to load meetings. Please try again later.");
    }
  }, [meetingsError]);


  // 4. Updated function to use meetings from context
  const getThisWeekMeetings = () => {
    if (!meetings || meetings.length === 0) return [];
    
    const now = new Date();
    // Set to the beginning of the current day
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Set to the end of the day 6 days from now
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return meetings.filter(meeting => {
      const meetingStartDate = new Date(meeting.start);
      return meetingStartDate >= today && meetingStartDate <= endOfWeek;
    });
  };
  
  // Get upcoming events from meetings
  const upcomingEvents = meetings
    ? meetings
        .filter(m => new Date(m.start) > new Date())
        .sort((a, b) => new Date(a.start) - new Date(b.start))
        .slice(0, 3)
    : [];


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

  // Handle assignment click
  const handleAssignmentClick = (assignment) => {
    navigate(`/student/assignment/${assignment.courseId}/${assignment._id}`);
  };

  // Combine loading states for the main loader
  if (loading || meetingsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-accent1 border-opacity-50 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Get recent assignments (limit to first 4)
  const recentAssignments = getAllAssignments().slice(0, 4);

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
            icon: <CheckSquare className="h-6 w-6 text-primary" />,
            count: pendingAssignmentsCount,
            description: "Pending Tasks",
            bgClass: "bg-white",
            color: "text-primary",
          },
          {
            id: "LiveClass",
            title: "Live Classes",
            icon: <Calendar className="h-6 w-6 text-primary" />,
            // 5. Count is now dynamic based on context data
            count: getThisWeekMeetings().length,
            description: "This Week",
            bgClass: "bg-white",
            color: "text-primary",
          },
          {
            id: "MyStats",
            title: "Attendance",
            icon: <UserCheck className="h-6 w-6 text-primary" />,
            count: `${Math.round(
              calculateAttendance(coursesData.user._id, coursesData.courses)
                .overall.attendancePercentage
            ) || "-"
              }%`,
            description: "Overall Rate",
            bgClass: "bg-white",
            color: "text-primary",
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
              className="text-accent1/80 hover:text-accent1 flex items-center text-sm font-medium"
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
                className="group relative flex flex-col justify-between rounded-lg border border-gray-100 hover:border-2 hover:border-accent1/30 shadow-accent1 hover:shadow-md transition-all duration-200 overflow-hidden"
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

      {/* Upcoming Events Section - Now Dynamic */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            Upcoming Live Classes
          </h2>
          <button
            className="text-accent1/80 hover:text-accent1 flex items-center text-sm font-medium"
            onClick={() => setActiveSection("LiveClass")}
          >
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.map((event) => (
              <div
                key={event._id}
                className="group flex flex-col bg-white rounded-lg border border-gray-100 hover:border-accent1/60 hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
                onClick={() => window.open(event.link, '_blank')}
              >
                <div className="relative h-40">
                  {/* Using a generic placeholder image as none is provided in the data */}
                  <img
                    src={"/course.png"}
                    alt={event.subject}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg inline-flex items-center">
                      <Calendar className="h-3.5 w-3.5 text-primary mr-1.5" />
                      <span className="text-xs font-medium">
                        {formatDate(event.start)} · {formatTime(event.start)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-base font-medium text-gray-800 group-hover:text-primary transition-colors mb-1">
                    {event.subject}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {event.description}
                  </p>
                </div>

                <div className="mt-auto border-t border-gray-100 p-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-accent1">
                    Join Class
                  </span>
                  <ArrowRight className="h-4 w-4 text-accent1" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">No Upcoming Classes</h3>
            <p className="text-gray-400">New classes scheduled by your teachers will appear here.</p>
          </div>
        )}
      </div>

      {/* Assignments Section - Now Dynamic */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <CheckSquare className="h-5 w-5 mr-2 text-primary" />
            Recent Assignments
          </h2>
          <button
            className="text-accent1/80 hover:text-accent1 flex items-center text-sm font-medium"
            onClick={() => setActiveSection("Assignment")}
          >
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>

        <div className="overflow-x-auto">
          {recentAssignments.length > 0 ? (
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
                {recentAssignments.map((assignment) => {
                  const status = getAssignmentStatus(assignment, coursesData.user._id);
                  return (
                    <tr
                      key={assignment._id}
                      className="border-b border-gray-50 hover:bg-accent2/30 cursor-pointer"
                      onClick={() => handleAssignmentClick(assignment)}
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
                        {assignment.courseName}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-1.5" />
                          <span className="text-sm text-gray-600">
                            {formatDate(assignment.dueDate)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-medium ${getStatusStyle(status)}`}
                        >
                          {getStatusLabel(status)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <CheckSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No Assignments Yet</h3>
              <p className="text-gray-400">Assignments will appear here when they are created.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardSemesterContent;