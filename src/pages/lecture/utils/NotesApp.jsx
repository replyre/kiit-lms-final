import React, { useState, useEffect } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Plus, Trash2, Search } from "lucide-react";

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

const NoteApp = () => {
  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem("notes");
    if (savedNotes) {
      return JSON.parse(savedNotes);
    } else {
      return [
        {
          id: generateId(),
          title: "Welcome Note",
          content:
            "# Welcome to Your Note App\n\nThis is your first note. You can:\n- Edit this note\n- Create new notes\n- Format with markdown\n- Switch between notes",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }
  });

  // Current active note
  const [activeNoteId, setActiveNoteId] = useState(() => {
    return notes[0]?.id || "";
  });

  // Search functionality
  const [searchTerm, setSearchTerm] = useState("");

  // Save to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  // Get current active note
  const activeNote = notes.find((note) => note.id === activeNoteId) || notes[0];

  // Create a new note
  const handleAddNote = () => {
    const newNote = {
      id: generateId(),
      title: "New Note",
      content: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setNotes([...notes, newNote]);
    setActiveNoteId(newNote.id);
  };

  // Delete a note
  const handleDeleteNote = (noteId) => {
    const updatedNotes = notes.filter((note) => note.id !== noteId);
    setNotes(updatedNotes);

    if (activeNoteId === noteId) {
      setActiveNoteId(updatedNotes[0]?.id || "");
    }
  };

  // Update note content
  const handleUpdateNote = (field, value) => {
    setNotes(
      notes.map((note) =>
        note.id === activeNoteId
          ? {
              ...note,
              [field]: value,
              updatedAt: new Date().toISOString(),
            }
          : note
      )
    );
  };

  // Filter notes based on search term
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-[36rem] bg-gray-100 rounded-lg shadow-lg overflow-hidden">
      {/* Sidebar */}
      <div
        className="bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out hover:w-64 w-20"
        style={{ minWidth: "5rem" }}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-800 hidden hover:block">
              Notes
            </h1>
            <button
              onClick={handleAddNote}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-700"
              title="New Note"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="relative hidden hover:block">
            <div className="flex items-center relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 pl-10 pr-4 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
        <div className="overflow-y-auto flex-grow">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
              className={`p-3 border-b border-gray-200 cursor-pointer ${
                note.id === activeNoteId
                  ? "bg-green-50 border-l-4 border-l-green-500"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-grow">
                  <h3 className="font-medium text-gray-800 truncate">
                    {note.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(note.updatedAt)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1 truncate">
                    {note.content.replace(/[#*`[\]]/g, "").slice(0, 50)}
                    {note.content.length > 50 ? "..." : ""}
                  </p>
                </div>
                {note.id === activeNoteId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note.id);
                    }}
                    className="p-1 rounded-full hover:bg-red-100 text-red-500"
                    title="Delete Note"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      {activeNote ? (
        <div className="flex-grow flex flex-col">
          {/* Note Header */}
          <div className="bg-white p-4 border-b border-gray-200">
            <input
              type="text"
              value={activeNote.title}
              onChange={(e) => handleUpdateNote("title", e.target.value)}
              className="w-full text-xl font-semibold mb-2 p-1 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
              placeholder="Note Title"
            />
          </div>

          {/* Note Content */}
          <div className="flex-grow overflow-auto bg-white p-4">
            <MDEditor
              value={activeNote.content}
              onChange={(value) => handleUpdateNote("content", value || "")}
              height="100%"
              preview="edit"
              hideToolbar={false}
            />
          </div>
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-xl text-gray-500 mb-4">No notes available</h2>
            <button
              onClick={handleAddNote}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none"
            >
              Create your first note
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteApp;