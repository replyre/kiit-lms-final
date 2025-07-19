import React, { useState, useEffect } from "react";
import {
  courses,
  assignments,
  users,
} from "../../../../components/data/mockData";
import {
  Book,
  CheckSquare,
  Users,
  Video,
  Plus,
  TrendingUp,
  Bell,
  Calendar,
} from "lucide-react";
import ScheduleCalendar from "./ScheduleCalendar";
import AnnouncementsSection from "./AnnouncementSection";

const TeacherDashboard2 = () => {
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const teacherId = "1"; // Mock teacher ID

  const teacherCourses = courses.filter(
    (course) => course.teacherId === teacherId
  );
  const pendingAssignments = assignments.filter((assignment) =>
    teacherCourses.some((course) => course.id === assignment.courseId)
  );

  const handleOpenAnnouncementModal = () => {
    setShowAnnouncementModal(true);
  };

  const handleCloseAnnouncementModal = () => {
    setShowAnnouncementModal(false);
  };

  return (
    <div className="space-y-6  px-[15vh] py-2 max-auto w-full ">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-sf">
            Welcome back, Professor!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening in your classes today.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 ">
        {/* Non-clickable stats cards with softer colors */}
        <div className="bg-white border border-green-200 p-6 rounded-lg shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-primary">
              <Book className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Active Courses
            </h2>
          </div>
          <p className="text-4xl font-bold text-gray-800">
            {teacherCourses.length}
          </p>
          <div className="mt-4 flex items-center space-x-2 text-primary">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">4% increase from last month</span>
          </div>
        </div>

        <div className="bg-white border border-green-200 p-6 rounded-lg shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-primary">
              <Users className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Total Students
            </h2>
          </div>
          <p className="text-4xl font-bold text-gray-800">45</p>
          <div className="mt-4 flex items-center space-x-2 text-primary">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">12 new this week</span>
          </div>
        </div>

        {/* Clickable stats cards with hover effects */}
        <div className="bg-white border border-green-200 p-6 rounded-lg shadow-sm cursor-pointer transition-all hover:shadow-md hover:bg-green-50">
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-primary">
              <CheckSquare className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Pending Grades
            </h2>
          </div>
          <p className="text-4xl font-bold text-gray-800">
            {pendingAssignments.length}
          </p>
          <div className="mt-4 flex items-center space-x-2 text-primary">
            <Bell className="h-4 w-4" />
            <span className="text-sm">5 due today</span>
          </div>
        </div>

        <div className="bg-white border border-green-200 p-6 rounded-lg shadow-sm cursor-pointer transition-all hover:shadow-md hover:bg-green-50">
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-primary">
              <Video className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Upcoming Lectures
            </h2>
          </div>
          <p className="text-4xl font-bold text-gray-800">3</p>
          <div className="mt-4 flex items-center space-x-2 text-primary">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">Next: Today at 2 PM</span>
          </div>
        </div>
      </div>

      {/* Schedule and Calendar Component */}
      <ScheduleCalendar />

      {/* Announcements Component with Modal */}
      {/* <AnnouncementsSection
        showModal={showAnnouncementModal}
        onCloseModal={handleCloseAnnouncementModal}
        onOpenModal={handleOpenAnnouncementModal}
      /> */}
    </div>
  );
};

export default TeacherDashboard2;
