import React, { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const StudentTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "slNo",
    direction: "asc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Dummy data
  const initialData = [
    {
      slNo: 1,
      rollNo: "2024001",
      name: "John Smith",
      mobile: "9876543210",
      email: "john.smith@example.com",
      currentSemester: 1,
      associatedCompany: "Tech Corp",
    },
    {
      slNo: 2,
      rollNo: "2024002",
      name: "Emma Wilson",
      mobile: "9876543211",
      email: "emma.wilson@example.com",
      currentSemester: 1,
      associatedCompany: "Data Systems",
    },
    {
      slNo: 3,
      rollNo: "2024003",
      name: "Michael Brown",
      mobile: "9876543212",
      email: "michael.b@example.com",
      currentSemester: 1,
      associatedCompany: "Innovation Labs",
    },
    {
      slNo: 4,
      rollNo: "2024004",
      name: "Sarah Davis",
      mobile: "9876543213",
      email: "sarah.d@example.com",
      currentSemester: 1,
      associatedCompany: "Future Tech",
    },
    {
      slNo: 5,
      rollNo: "2024005",
      name: "James Wilson",
      mobile: "9876543214",
      email: "james.w@example.com",
      currentSemester: 1,
      associatedCompany: "Smart Solutions",
    },
    {
      slNo: 6,
      rollNo: "2024006",
      name: "Lisa Anderson",
      mobile: "9876543215",
      email: "lisa.a@example.com",
      currentSemester: 1,
      associatedCompany: "Digital Dynamics",
    },
    {
      slNo: 7,
      rollNo: "2024007",
      name: "Robert Taylor",
      mobile: "9876543216",
      email: "robert.t@example.com",
      currentSemester: 1,
      associatedCompany: "Cloud Systems",
    },
  ];

  const [data, setData] = useState(initialData);

  // Sorting function
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedData = [...data].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setData(sortedData);
  };

  // Filtering function
  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Column headers with sorting
  const SortableHeader = ({ label, sortKey }) => (
    <th
      className="px-4 py-3 cursor-pointer hover:bg-emerald-600 transition-colors"
      onClick={() => requestSort(sortKey)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <div className="flex flex-col">
          <ChevronUp
            className={`w-4 h-4 ${
              sortConfig.key === sortKey && sortConfig.direction === "asc"
                ? "text-white"
                : "text-emerald-200"
            }`}
          />
          <ChevronDown
            className={`w-4 h-4 ${
              sortConfig.key === sortKey && sortConfig.direction === "desc"
                ? "text-white"
                : "text-emerald-200"
            }`}
          />
        </div>
      </div>
    </th>
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Search Bar */}
      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search..."
          className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-emerald-500 text-white">
            <tr>
              <SortableHeader label="Sl. No." sortKey="slNo" />
              <SortableHeader label="Roll No." sortKey="rollNo" />
              <SortableHeader label="Name" sortKey="name" />
              <SortableHeader label="Mobile" sortKey="mobile" />
              <SortableHeader label="Email" sortKey="email" />
              <SortableHeader
                label="Current Semester"
                sortKey="currentSemester"
              />
              <SortableHeader
                label="Associated Company"
                sortKey="associatedCompany"
              />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.map((item) => (
              <tr key={item.slNo} className="hover:bg-gray-50">
                <td className="px-4 py-3">{item.slNo}</td>
                <td className="px-4 py-3">{item.rollNo}</td>
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3">{item.mobile}</td>
                <td className="px-4 py-3">{item.email}</td>
                <td className="px-4 py-3">{item.currentSemester}</td>
                <td className="px-4 py-3">{item.associatedCompany}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {indexOfFirstItem + 1} to{" "}
          {Math.min(indexOfLastItem, filteredData.length)} of{" "}
          {filteredData.length} entries
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentTable;
