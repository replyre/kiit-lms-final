import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  GraduationCap,
  User,
  BookOpen,
  Globe,
} from "lucide-react";
import { motion } from "framer-motion";

const MentorDetails = ({ mentor }) => {
  return (
    <div className="bg-white shadow-md rounded-xl overflow-hidden transition-all">
      <button
        className="w-full flex justify-between items-center p-4 bg-gradient-to-r from-white to-grey-200 text-black font-semibold text-lg hover:opacity-90 transition-all"
      >
        <div className="flex items-center space-x-2">
          <GraduationCap className="w-5 h-5 text-red-500" />
          <span className="text-lg font-semibold">Mentor Details</span>
        </div>
      </button>

        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6 space-y-5"
        >
          <div className="flex items-center space-x-3">
            <User className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">{mentor.name}</h2>
          </div>

          <div className="flex items-center space-x-3">
            <GraduationCap className="w-6 h-6 text-green-600" />
            <p className="text-gray-700 font-medium">
              {mentor.designation} at {mentor.school}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <BookOpen className="w-16 h-6 text-yellow-600" />
            <p className="text-gray-600">{mentor.bio}</p>
          </div>

          <div className="flex items-center space-x-3">
            <Globe className="w-6 h-6 text-blue-500" />
            <div className="flex space-x-3">
              {mentor.socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm hover:bg-blue-200 transition transform hover:scale-105"
                >
                  {link.platform}
                </a>
              ))}
            </div>
          </div>
        </motion.div>
    </div>
  );
};

// Sample Data
const mentor = {
  name: "Prof. Ipsita Mohanty",
  designation: "Professor of AI & Machine Learning",
  school: "Harvard University",
  bio: "Prof. Ipsita Mohanty is a leading researcher in Artificial Intelligence and has published over 50 research papers. He specializes in deep learning, neural networks, and AI ethics. With 15+ years of experience, he has mentored numerous PhD students and contributed to AI policy discussions globally.",
  socialLinks: [
    { platform: "LinkedIn", url: "https://linkedin.com/in/johndoe" },
    {
      platform: "Scopus",
      url: "https://www.scopus.com/authid/detail.uri?authorId=123456789",
    },
    {
      platform: "Google Scholar",
      url: "https://scholar.google.com/citations?user=abc123",
    },
  ],
};

export default function MentorInfo() {
  return (
    <div className="max-w-4xl mx-auto ">
      <MentorDetails mentor={mentor} />
    </div>
  );
}
