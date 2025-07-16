import React from "react";
import { Video, Users, Calendar } from "lucide-react";

const ScheduleCalendar = () => {
  // Get today's date for the calendar
  const today = new Date();
  const currentMonth = today.toLocaleString("default", { month: "long" });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Today's Schedule Section */}
      <div className=" bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Today's Schedule</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg hover:bg-emerald-100 cursor-pointer transition-all">
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Video className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  Introduction to Programming
                </h3>
                <p className="text-sm text-gray-600">Lecture Hall A</p>
              </div>
            </div>
            <span className="text-primary/80 font-medium  whitespace-nowrap">
              2:00 PM
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg hover:bg-green-100 cursor-pointer transition-all">
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Office Hours</h3>
                <p className="text-sm text-gray-600">Room 302</p>
              </div>
            </div>
            <span className="text-primary/80 font-medium">4:00 PM</span>
          </div>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Calendar</h2>
          <span className="text-gray-600">{currentMonth}</span>
        </div>
        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-600 bg-gray-50 border-b">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div key={day} className="py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-sm">
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - today.getDay() + 1;
              const isToday = day === today.getDate();
              const isCurrentMonth = day > 0 && day <= 31;
              return (
                <div
                  key={i}
                  className={`py-2 text-center ${
                    isToday
                      ? "bg-primary text-white rounded-lg"
                      : isCurrentMonth
                      ? "text-gray-900 hover:bg-gray-100 cursor-pointer"
                      : "text-gray-400"
                  }`}
                >
                  {isCurrentMonth ? day : ""}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Announcement Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">
          Welcome to DhammaNexus !
        </h2>

        <div className="w-full h-[300px]">
          <iframe
            className="rounded-lg w-full h-[300px]"
            src="https://www.youtube.com/embed/vfDcYz7zJio"
            title="YouTube video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCalendar;
