import React, { useState, useEffect } from "react";
import { getAllCourseAnnouncements } from "../../../../../services/announcement.service"; // Adjust the import path as needed
import { useParams } from "react-router-dom";
import { format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

const AllAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const { courseID } = useParams();

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await getAllCourseAnnouncements({ courseID });
      setAnnouncements(response.announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    let filtered = announcements;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (announcement) =>
          announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date (if applicable)
    if (filter === "recent") {
      filtered = filtered.sort(
        (a, b) => new Date(b.publishDate) - new Date(a.publishDate)
      );
    }

    setFilteredAnnouncements(filtered);
  }, [searchTerm, filter, announcements]);

  // Group announcements by week
  const groupAnnouncementsByWeek = (announcements) => {
    const grouped = {};

    announcements.forEach((announcement) => {
      const publishDate = new Date(announcement.publishDate);
      const weekStart = startOfWeek(publishDate, { weekStartsOn: 1 }); // Week starts on Monday
      const weekEnd = endOfWeek(publishDate, { weekStartsOn: 1 });
      const weekRange = `${format(weekStart, "MMM d")} - ${format(
        weekEnd,
        "MMM d"
      )}`;

      if (!grouped[weekRange]) {
        grouped[weekRange] = [];
      }
      grouped[weekRange].push(announcement);
    });

    return grouped;
  };

  const groupedAnnouncements = groupAnnouncementsByWeek(filteredAnnouncements);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-xl shadow-sm">
      <h1 className="text-2xl font-bold text-secondary mb-4">
        All Announcements
      </h1>

      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <input
          type="text"
          placeholder="Search announcements..."
          className="w-full md:w-1/2 px-4 py-2 border border-tertiary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="w-full md:w-1/4 px-4 py-2 border border-tertiary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="recent">Most Recent</option>
        </select>
      </div>

      {/* Announcements List */}
      <div className="space-y-8">
        {loading ? (
          <p className="text-center text-tertiary">Loading announcements...</p>
        ) : Object.keys(groupedAnnouncements).length > 0 ? (
          Object.keys(groupedAnnouncements).map((weekRange) => (
            <div key={weekRange}>
              <h2 className="text-lg font-semibold text-primary mb-4">
                {weekRange}
              </h2>
              <div className="space-y-4">
                {groupedAnnouncements[weekRange].map((announcement) => (
                  <div
                    key={announcement._id}
                    className="p-4 border border-tertiary/10 rounded-lg hover:shadow-md transition-all"
                  >
                    <h3 className="text-lg font-semibold text-secondary">
                      {announcement.title}
                    </h3>
                    <div className="text-sm text-tertiary mt-1">
                      {new Date(announcement.publishDate).toLocaleDateString()}{" "}
                      {new Date(announcement.publishDate).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </div>
                    {announcement.image?.imageUrl && (
                      <img
                        src={announcement.image.imageUrl}
                        alt={announcement.title}
                        className="mt-3 w-[50%] h-[300px] object-cover rounded-lg"
                      />
                    )}
                    <p className="mt-3 text-tertiary">{announcement.content}</p>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-tertiary">No announcements found.</p>
        )}
      </div>
    </div>
  );
};

export default AllAnnouncements;
