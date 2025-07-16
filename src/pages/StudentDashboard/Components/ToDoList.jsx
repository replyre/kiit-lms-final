import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { PlusCircle, X, Edit2, Save, Move } from "lucide-react";
import { Activity, BookOpen, MessageSquare, FileText } from "lucide-react";

// Define the four quadrants of Swayam
const SWAYAM_QUADRANTS = {
  VIDEO_LECTURE: {
    id: "video_lecture",
    name: "Video Lecture",
    color: "bg-blue-500",
    hoverColor: "bg-blue-600",
    icon: Activity,
  },
  READING_MATERIAL: {
    id: "reading_material",
    name: "Reading Material",
    color: "bg-rose-500",
    hoverColor: "bg-rose-600",
    icon: BookOpen,
  },
  TESTS_QUIZZES: {
    id: "tests_quizzes",
    name: "Tests and Quizzes",
    color: "bg-emerald-500",
    hoverColor: "bg-emerald-600",
    icon: FileText,
  },
  DISCUSSION_FORUM: {
    id: "discussion_forum",
    name: "Discussion Forum",
    color: "bg-amber-500",
    hoverColor: "bg-amber-600",
    icon: MessageSquare,
  },
};

// Define the Kanban columns
const INITIAL_COLUMNS = {
  todo: {
    id: "todo",
    title: "To Do",
    color: "bg-blue-300",
    taskIds: [],
  },
  inProgress: {
    id: "inProgress",
    title: "In Progress",
    color: "bg-yellow-300",
    taskIds: [],
  },
  completed: {
    id: "completed",
    title: "Completed",
    color: "bg-green-300",
    taskIds: [],
  },
};

// Define task types
const TASK_TYPES = [
  { id: "assignment", name: "Assignment" },
  { id: "project", name: "Project" },
  { id: "note", name: "Note" },
  { id: "deadline", name: "Deadline" },
  { id: "reference", name: "Reference" },
];

// Define the initial Kanban board data structure
const INITIAL_DATA = {
  tasks: {},
  columns: INITIAL_COLUMNS,
  columnOrder: ["todo", "inProgress", "completed"],
};

const SwayamKanbanBoard = () => {
  const [data, setData] = useState(INITIAL_DATA);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskColumn, setNewTaskColumn] = useState("todo");
  // Initialize with the first quadrant type
  const [newTaskQuadrant, setNewTaskQuadrant] = useState(
    SWAYAM_QUADRANTS.VIDEO_LECTURE.id
  );
  const [newTaskType, setNewTaskType] = useState(TASK_TYPES[0].id);
  const [newTaskComponent, setNewTaskComponent] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState("");
  const [editingTaskQuadrant, setEditingTaskQuadrant] = useState("");
  const [editingTaskType, setEditingTaskType] = useState("");
  const [editingTaskComponent, setEditingTaskComponent] = useState("");
  const [selectedQuadrant, setSelectedQuadrant] = useState(null);
  // Drag and drop state
  const [draggedTask, setDraggedTask] = useState(null);
  const [draggedColumn, setDraggedColumn] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [dragOverTask, setDragOverTask] = useState(null);

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedData = localStorage.getItem("swayamKanbanData");
    if (savedData) {
      try {
        setData(JSON.parse(savedData));
      } catch (e) {
        console.error("Error parsing stored data:", e);
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("swayamKanbanData", JSON.stringify(data));
  }, [data]);

  // Get quadrant name by id
  const getQuadrantName = (quadrantId) => {
    return (
      Object.values(SWAYAM_QUADRANTS).find((q) => q.id === quadrantId)?.name ||
      "Unknown"
    );
  };

  // Get task type name by id
  const getTaskTypeName = (typeId) => {
    return TASK_TYPES.find((t) => t.id === typeId)?.name || "Task";
  };

  // Add a new task
  const addTask = () => {
    if (!newTaskTitle.trim()) return;

    // Create a new task ID
    const taskId = `task-${Date.now()}`;

    // Create a new task object
    const newTask = {
      id: taskId,
      content: newTaskTitle,
      quadrant: newTaskQuadrant,
      type: newTaskType,
      component: newTaskComponent,
    };

    // Add the task to the specified column
    const column = data.columns[newTaskColumn];
    const newTaskIds = Array.from(column.taskIds);
    newTaskIds.push(taskId);

    // Update the state
    setData({
      ...data,
      tasks: {
        ...data.tasks,
        [taskId]: newTask,
      },
      columns: {
        ...data.columns,
        [newTaskColumn]: {
          ...column,
          taskIds: newTaskIds,
        },
      },
    });

    // Reset form
    setNewTaskTitle("");
    setNewTaskType(TASK_TYPES[0].id);
    setNewTaskComponent("");
    setIsAddingTask(false);
  };

  // Delete a task
  const deleteTask = (taskId) => {
    // Find which column contains the task
    let columnId;
    for (const [id, column] of Object.entries(data.columns)) {
      if (column.taskIds.includes(taskId)) {
        columnId = id;
        break;
      }
    }

    if (!columnId) return;

    // Remove the task ID from the column
    const column = data.columns[columnId];
    const newTaskIds = column.taskIds.filter((id) => id !== taskId);

    // Create a copy of the tasks object without the task
    const { [taskId]: removedTask, ...remainingTasks } = data.tasks;

    // Update the state
    setData({
      ...data,
      tasks: remainingTasks,
      columns: {
        ...data.columns,
        [columnId]: {
          ...column,
          taskIds: newTaskIds,
        },
      },
    });
  };

  // Start editing a task
  const startEditTask = (task) => {
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.content);
    setEditingTaskQuadrant(task.quadrant);
    setEditingTaskType(task.type || TASK_TYPES[0].id);
    setEditingTaskComponent(task.component || "");
  };

  // Save the edited task
  const saveEditTask = () => {
    if (!editingTaskTitle.trim()) return;

    setData({
      ...data,
      tasks: {
        ...data.tasks,
        [editingTaskId]: {
          ...data.tasks[editingTaskId],
          content: editingTaskTitle,
          quadrant: editingTaskQuadrant,
          type: editingTaskType,
          component: editingTaskComponent,
        },
      },
    });

    setEditingTaskId(null);
  };

  // Get quadrant color class
  const getQuadrantColor = (quadrantId) => {
    return (
      Object.values(SWAYAM_QUADRANTS).find((q) => q.id === quadrantId)?.color ||
      "bg-gray-300"
    );
  };

  // Function to safely render tailwind component string
  const renderTailwindComponent = (componentString) => {
    if (!componentString || typeof componentString !== "string") return null;

    try {
      // Simple sanitization - this is not production-ready!
      // In a real app, you'd want more robust sanitization
      const sanitized = componentString
        .replace(/on\w+=/gi, "") // Remove event handlers
        .replace(/javascript:/gi, ""); // Remove javascript: URLs

      // Use dangerouslySetInnerHTML to render the string as HTML
      return (
        <div
          className="mt-2 p-1 rounded border border-gray-200"
          dangerouslySetInnerHTML={{ __html: sanitized }}
        />
      );
    } catch (error) {
      console.error("Error rendering component:", error);
      return (
        <div className="text-red-500 text-xs">Error rendering component</div>
      );
    }
  };

  // Custom drag and drop handlers
  const handleDragStart = (taskId, columnId) => {
    setDraggedTask(taskId);
    setDraggedColumn(columnId);
  };

  const handleDragOver = (e, columnId, taskId = null) => {
    e.preventDefault();
    setDragOverColumn(columnId);
    setDragOverTask(taskId);
  };

  const handleDrop = (e) => {
    e.preventDefault();

    if (!draggedTask || !dragOverColumn) return;

    // Find the source column
    const sourceColumn = data.columns[draggedColumn];
    const destColumn = data.columns[dragOverColumn];

    // Don't do anything if nothing has changed
    if (draggedColumn === dragOverColumn && !dragOverTask) return;

    // Remove task from source column
    const sourceTaskIds = Array.from(sourceColumn.taskIds);
    const taskIndex = sourceTaskIds.indexOf(draggedTask);
    if (taskIndex === -1) return;
    sourceTaskIds.splice(taskIndex, 1);

    // Add task to destination column
    const destTaskIds = Array.from(destColumn.taskIds);

    if (dragOverTask) {
      // Place before the task that was dragged over
      const dropIndex = destTaskIds.indexOf(dragOverTask);
      if (dropIndex !== -1) {
        destTaskIds.splice(dropIndex, 0, draggedTask);
      } else {
        destTaskIds.push(draggedTask);
      }
    } else {
      // Place at the end of the column if no task was dragged over
      destTaskIds.push(draggedTask);
    }

    // Update state
    setData({
      ...data,
      columns: {
        ...data.columns,
        [sourceColumn.id]: {
          ...sourceColumn,
          taskIds: sourceTaskIds,
        },
        [destColumn.id]: {
          ...destColumn,
          taskIds: destTaskIds,
        },
      },
    });

    // Reset drag state
    setDraggedTask(null);
    setDraggedColumn(null);
    setDragOverColumn(null);
    setDragOverTask(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDraggedColumn(null);
    setDragOverColumn(null);
    setDragOverTask(null);
  };
  const handleQuadrantClick = (quadrantId) => {
    setSelectedQuadrant(quadrantId === selectedQuadrant ? null : quadrantId);
  };

  const getTaskCount = (quadrantId) => {
    return Object.values(data.tasks).filter(
      (task) => task.quadrant === quadrantId
    ).length;
  };
  return (
    <div className="flex flex-col min-h-screen p-6 bg-gray-100">
      {/* Swayam Quadrants Section */}
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="relative mb-16">
          {/* Center circle */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 bg-white rounded-full w-32 h-32 flex flex-col items-center justify-center shadow-lg border-4 border-gray-100">
            <span className="font-bold text-2xl text-gray-800">Tasks</span>
            <span className="text-sm text-gray-500 mt-1">
              {Object.values(data.tasks).length} Total Tasks
            </span>
          </div>

          {/* Connector lines */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-72 h-72 rounded-full border-2 border-gray-200"></div>

          {/* Quadrants Grid */}
          <div className="grid grid-cols-2 gap-6 p-8">
            {Object.values(SWAYAM_QUADRANTS).map((quadrant) => {
              const taskCount = getTaskCount(quadrant.id);
              const IconComponent = quadrant.icon;
              const isSelected = selectedQuadrant === quadrant.id;

              return (
                <div
                  key={quadrant.id}
                  className={`${quadrant.color} ${
                    isSelected
                      ? "scale-105 shadow-xl " + quadrant.hoverColor
                      : ""
                  } 
                  p-6 h-44 rounded-xl flex flex-col items-center justify-center text-white font-medium transition-all 
                  duration-300 transform cursor-pointer shadow-md hover:shadow-lg hover:scale-105`}
                  onClick={() => handleQuadrantClick(quadrant.id)}
                >
                  <div className="bg-white/20 p-3 rounded-full mb-3">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{quadrant.name}</div>
                    <div className="text-sm mt-2 bg-white/20 px-3 py-1 rounded-full">
                      {taskCount} {taskCount === 1 ? "Task" : "Tasks"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selectedQuadrant && (
          <div className="bg-white rounded-lg shadow-md p-4 mt-6 border border-gray-200 animate-fadeIn">
            <h3 className="font-bold text-lg mb-3">
              {SWAYAM_QUADRANTS[selectedQuadrant.toUpperCase()]?.name ||
                selectedQuadrant}{" "}
              Tasks
            </h3>
            <p className="text-gray-600">
              {getTaskCount(selectedQuadrant)} task(s) in this quadrant. Click
              to view details.
            </p>
          </div>
        )}
      </div>

      {/* Add Task Button */}
      <div className="mb-6 flex justify-center">
        {!isAddingTask ? (
          <motion.button
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700"
            onClick={() => setIsAddingTask(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PlusCircle size={20} />
            <span>Add New Task</span>
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold">Add New Task</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setIsAddingTask(false)}
              >
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task title"
              className="w-full p-2 border border-gray-300 rounded-md mb-3"
              autoFocus
            />
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Column
              </label>
              <select
                value={newTaskColumn}
                onChange={(e) => setNewTaskColumn(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {data.columnOrder.map((columnId) => (
                  <option key={columnId} value={columnId}>
                    {data.columns[columnId].title}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quadrant
              </label>
              <select
                value={newTaskQuadrant}
                onChange={(e) => setNewTaskQuadrant(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value={SWAYAM_QUADRANTS.VIDEO_LECTURE.id}>
                  Video Lecture
                </option>
                <option value={SWAYAM_QUADRANTS.READING_MATERIAL.id}>
                  Reading Material
                </option>
                <option value={SWAYAM_QUADRANTS.TESTS_QUIZZES.id}>
                  Tests and Quizzes
                </option>
                <option value={SWAYAM_QUADRANTS.DISCUSSION_FORUM.id}>
                  Discussion Forum
                </option>
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Type
              </label>
              <select
                value={newTaskType}
                onChange={(e) => setNewTaskType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {TASK_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Component (HTML/Tailwind)
              </label>
              <textarea
                value={newTaskComponent}
                onChange={(e) => setNewTaskComponent(e.target.value)}
                placeholder="<div class='bg-blue-100 p-2 rounded'>Your custom content here</div>"
                className="w-full p-2 border border-gray-300 rounded-md h-24"
              />
              {newTaskComponent && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Preview:</p>
                  {renderTailwindComponent(newTaskComponent)}
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <motion.button
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                onClick={addTask}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Add Task
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Kanban Board */}
      <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
        {data.columnOrder.map((columnId) => {
          const column = data.columns[columnId];
          const tasks = column.taskIds.map((taskId) => data.tasks[taskId]);

          return (
            <div
              key={column.id}
              className="flex-1 min-w-64  max-w-80"
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDrop={handleDrop}
            >
              <div
                className={`bg-gray-200 p-2 mb-2 rounded-t-lg ${
                  dragOverColumn === column.id && !dragOverTask
                    ? "bg-blue-200"
                    : ""
                }`}
              >
                <h3 className="font-bold text-center">{column.title}</h3>
              </div>
              <div
                className={`min-h-72 p-2 rounded-b-lg ${
                  dragOverColumn === column.id && !dragOverTask
                    ? "bg-blue-100"
                    : "bg-gray-100"
                }`}
              >
                {tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task.id, column.id)}
                    onDragOver={(e) => handleDragOver(e, column.id, task.id)}
                    onDragEnd={handleDragEnd}
                    className={`p-3 mb-2 rounded-md shadow-sm bg-white border-l-4 ${getQuadrantColor(
                      task.quadrant
                    ).replace("bg-", "border-")} ${
                      dragOverTask === task.id
                        ? "border-b-2 border-blue-500"
                        : ""
                    } 
                    ${draggedTask === task.id ? "opacity-50" : "opacity-100"}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 5px 10px rgba(0,0,0,0.1)",
                    }}
                  >
                    {editingTaskId === task.id ? (
                      <div>
                        <input
                          type="text"
                          value={editingTaskTitle}
                          onChange={(e) => setEditingTaskTitle(e.target.value)}
                          className="w-full p-1 border border-gray-300 rounded mb-2"
                          autoFocus
                        />
                        <select
                          value={editingTaskQuadrant}
                          onChange={(e) =>
                            setEditingTaskQuadrant(e.target.value)
                          }
                          className="w-full p-1 border border-gray-300 rounded mb-2"
                        >
                          <option value={SWAYAM_QUADRANTS.VIDEO_LECTURE.id}>
                            Video Lecture
                          </option>
                          <option value={SWAYAM_QUADRANTS.READING_MATERIAL.id}>
                            Reading Material
                          </option>
                          <option value={SWAYAM_QUADRANTS.TESTS_QUIZZES.id}>
                            Tests and Quizzes
                          </option>
                          <option value={SWAYAM_QUADRANTS.DISCUSSION_FORUM.id}>
                            Discussion Forum
                          </option>
                        </select>
                        <select
                          value={editingTaskType}
                          onChange={(e) => setEditingTaskType(e.target.value)}
                          className="w-full p-1 border border-gray-300 rounded mb-2"
                        >
                          {TASK_TYPES.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.name}
                            </option>
                          ))}
                        </select>
                        <textarea
                          value={editingTaskComponent}
                          onChange={(e) =>
                            setEditingTaskComponent(e.target.value)
                          }
                          placeholder="Custom component HTML"
                          className="w-full p-1 border border-gray-300 rounded mb-2 h-20"
                        />
                        {editingTaskComponent && (
                          <div className="mt-1 mb-2">
                            <p className="text-xs text-gray-500 mb-1">
                              Preview:
                            </p>
                            {renderTailwindComponent(editingTaskComponent)}
                          </div>
                        )}
                        <div className="flex justify-end space-x-2 mt-2">
                          <button
                            onClick={() => setEditingTaskId(null)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X size={16} />
                          </button>
                          <button
                            onClick={saveEditTask}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <Save size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <Move size={16} className="text-gray-400" />
                            <p>{task.content}</p>
                          </div>
                          <div className="flex space-x-1 ml-2">
                            <button
                              onClick={() => startEditTask(task)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Render custom component if present */}
                        {task.component &&
                          renderTailwindComponent(task.component)}

                        <div className="mt-2 flex flex-wrap gap-1">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getQuadrantColor(
                              task.quadrant
                            )} bg-opacity-20 text-gray-700`}
                          >
                            {getQuadrantName(task.quadrant)}
                          </span>

                          {task.type && (
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">
                              {getTaskTypeName(task.type)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
                {tasks.length === 0 && (
                  <div className="h-20 flex items-center justify-center text-gray-400 italic border-2 border-dashed border-gray-300 rounded-md">
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SwayamKanbanBoard;
