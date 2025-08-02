import React, { useState, useEffect, useMemo } from "react";
import {
  Book,
  CheckSquare,
  Users,
  Video,
  TrendingUp,
  Bell,
  Calendar,
} from "lucide-react";

import { getAllCourses } from "../../../../services/course.service";
import ScheduleCalendar from "./ScheduleCalendar";
// 1. Import the context hook
import { useMeeting } from "../../../../context/MeetingContext";

const TeacherDashboard2 = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Get meetings and their loading state from the context
  const { meetings, loading: meetingsLoading, error: meetingsError } = useMeeting();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await getAllCourses();
        setDashboardData(data);
      } catch (err) {
        setError("Failed to load dashboard data. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // --- STATS CALCULATIONS (course & grade data still comes from dashboardData) ---

  const activeCoursesCount = dashboardData?.courses?.length || 0;

  const totalStudentsCount = useMemo(() => {
    // ... no change to this calculation
    if (!dashboardData?.courses) return 0;
    const studentIds = new Set();
    dashboardData.courses.forEach(course => {
      if (course.attendance) {
        Object.values(course.attendance).forEach(sessionStudentIds => {
          sessionStudentIds.forEach(id => studentIds.add(id));
        });
      }
    });
    return studentIds.size;
  }, [dashboardData]);

  const pendingGradesCount = useMemo(() => {
    // ... no change to this calculation
    if (!dashboardData?.courses) return 0;
    let pendingCount = 0;
    dashboardData.courses.forEach(course => {
      course.assignments?.forEach(assignment => {
        const ungradedSubmissions = assignment.submissions?.filter(sub => !sub.isGraded).length || 0;
        pendingCount += ungradedSubmissions;
      });
    });
    return pendingCount;
  }, [dashboardData]);


  // 3. RECALCULATE upcoming lectures using the meetings from the context
  const upcomingLecturesCount = useMemo(() => {
    if (!meetings) return 0;
    const now = new Date();
    // A lecture is "upcoming" if its start time is in the future
    return meetings.filter(meeting => new Date(meeting.start) > now).length;
  }, [meetings]);


  // 4. UPDATE loading and error states to consider both data sources
  if (loading || meetingsLoading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mr-3"></div>
        <p className="text-xl text-gray-600">Loading Dashboard...</p>
      </div>
    );
  }

  if (error || meetingsError) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <p className="text-xl text-red-600">{error || meetingsError}</p>
      </div>
    );
  }

  // Handle case where dashboardData might not have loaded yet
  if (!dashboardData) {
      return null;
  }

  return (
    <div className="space-y-6 px-[15vh] py-2 mx-auto w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-sf">
            Welcome back, {dashboardData.user.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening in your classes today.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Active Courses */}
        <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-primary">
              <Book className="h-6 w-6" />
            </div>
            <h2 className=" font-semibold text-gray-800">
              Active Courses
            </h2>
          </div>
          <p className="text-4xl font-bold text-gray-800">
            {activeCoursesCount}
          </p>
          <div className="mt-4 flex items-center space-x-2 text-primary">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">Across all semesters</span>
          </div>
        </div>

        {/* Total Students */}
        <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-primary">
              <Users className="h-6 w-6" />
            </div>
            <h2 className=" font-semibold text-gray-800">
              Total Students
            </h2>
          </div>
          <p className="text-4xl font-bold text-gray-800">
            {totalStudentsCount}
          </p>
          <div className="mt-4 flex items-center space-x-2 text-primary">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">Unique students enrolled</span>
          </div>
        </div>

        {/* Pending Grades */}
        <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm cursor-pointer transition-all hover:shadow-md">
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-primary">
              <CheckSquare className="h-6 w-6" />
            </div>
            <h2 className=" font-semibold text-gray-800">
              Pending Grades
            </h2>
          </div>
          <p className="text-4xl font-bold text-gray-800">
            {pendingGradesCount}
          </p>
          <div className="mt-4 flex items-center space-x-2 text-primary">
            <Bell className="h-4 w-4" />
            <span className="text-sm">Submissions to review</span>
          </div>
        </div>

        {/* Upcoming Lectures */}
        <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm cursor-pointer transition-all hover:shadow-md">
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-primary">
              <Video className="h-6 w-6" />
            </div>
            <h2 className=" font-semibold text-gray-800">
              Upcoming Lectures
            </h2>
          </div>
          <p className="text-4xl font-bold text-gray-800">
            {upcomingLecturesCount}
          </p>
          <div className="mt-4 flex items-center space-x-2 text-primary">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">Scheduled this semester</span>
          </div>
        </div>
      </div>

      {/* 5. PASS the meetings from the context to the calendar component */}
      <ScheduleCalendar events={meetings} />
    </div>
  );
};

export default TeacherDashboard2;