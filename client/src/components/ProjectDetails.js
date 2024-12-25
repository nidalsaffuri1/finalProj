import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  fetchProjectById,
  fetchTasks,
  updateNotes,
  createTask,
  updateTask,
  deleteTask,
  updateProject,
} from "../services/api";
import { toast } from "react-toastify";
import "../ProjectDetails.css";

const CHECKLIST_ITEMS = [
  "Engine Oil",
  "Brake Pads",
  "Tires",
  "Battery",
  "Coolant",
]; // Example checklist

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState("");
  const [newField, setNewField] = useState({ name: "", value: "" });
  const [checklist, setChecklist] = useState({});

  useEffect(() => {
    const loadProjectDetails = async () => {
      try {
        const projectData = await fetchProjectById(id);
        setProject(projectData);

        const taskData = await fetchTasks(id);
        setTasks(taskData);

        // Initialize checklist
        const initialChecklist =
          projectData.checklist ||
          CHECKLIST_ITEMS.reduce(
            (acc, item) => ({ ...acc, [item]: false }),
            {}
          );
        setChecklist(initialChecklist);
      } catch (error) {
        console.error("Error loading project details:", error.message);
        toast.error("Failed to load project details.");
      }
    };

    loadProjectDetails();
  }, [id]);

  const handleAddTask = async () => {
    if (!newTaskName.trim()) return toast.error("Task name cannot be empty.");
    try {
      const task = await createTask({ projectId: id, name: newTaskName });
      setTasks((prev) => [...prev, task]);
      setNewTaskName("");
      toast.success("Task added successfully!");
    } catch (error) {
      console.error("Failed to create task:", error);
      toast.error("Failed to create task.");
    }
  };

  const handleToggleTask = async (taskId, isCompleted) => {
    try {
      const updatedTask = await updateTask(taskId, { isCompleted });
      setTasks((prev) =>
        prev.map((task) => (task._id === taskId ? updatedTask : task))
      );
      toast.success("Task updated successfully!");
    } catch (error) {
      console.error("Failed to update task:", error);
      toast.error("Failed to update task.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
      toast.success("Task deleted successfully!");
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error("Failed to delete task.");
    }
  };

  const handleAddInformation = async () => {
    if (!newField.name.trim() || !newField.value.trim()) {
      return toast.error("Both name and value are required.");
    }

    const updatedFields = [...(project.dynamicFields || []), newField];

    try {
      const updatedProject = await updateProject(project._id, {
        ...project,
        dynamicFields: updatedFields,
      });

      setProject(updatedProject);
      setNewField({ name: "", value: "" });
      toast.success("Information added successfully!");
    } catch (error) {
      console.error("Failed to add information:", error.message);
      toast.error("Failed to add information.");
    }
  };

  const handleChecklistToggle = (item) => {
    setChecklist((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const handleSaveNotes = async () => {
    try {
      const updatedProject = await updateNotes(project._id, project.notes);
      setProject(updatedProject);
      toast.success("Notes updated successfully!");
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Failed to save notes.");
    }
  };

  if (!project) return <p>Loading...</p>;
  console.log(project);
  return (
    <div className="container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Project Information</h2>
        <ul>
          <li>
            <strong>Serial Number:</strong>{" "}
            {project.serialNumber || "Not Provided"}
          </li>
          <li>
            <strong>Customer Name:</strong>{" "}
            {project.customerId?.name || "Not Provided"}
          </li>
          <li>
            <strong>Customer Email:</strong>{" "}
            {project.customerId?.email || "Not Provided"}
          </li>
          <li>
            <strong>Customer Phone:</strong>{" "}
            {project.customerId?.phone || "Not Provided"}
          </li>
          <li>
            <strong>Customer Address:</strong>{" "}
            {project.customerId?.address || "Not Provided"}
          </li>
          <li>
            <strong>Truck Model:</strong> {project.truckModel || "Not Provided"}
          </li>
          <li>
            <strong>Weight:</strong> {project.weight || "Not Provided"}
          </li>
          <li>
            <strong>Phone Number:</strong>{" "}
            {project.customerId?.phone || "Not Provided"}
          </li>
          {project.dynamicFields?.map((field, index) => (
            <li key={index}>
              <strong>{field.name}:</strong> {field.value || "Not Provided"}
            </li>
          ))}
        </ul>

        {/* Notes Section */}
        <div className="notes-block">
          <h3>Notes</h3>
          <textarea
            value={project.notes || ""}
            onChange={(e) =>
              setProject((prev) => ({ ...prev, notes: e.target.value }))
            }
          ></textarea>
          <button onClick={handleSaveNotes}>Save Notes</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Tasks */}
        <h2>Tasks</h2>
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task._id}>
              <span
                style={{
                  textDecoration: task.isCompleted ? "line-through" : "none",
                }}
              >
                {task.name}
              </span>
              <button
                className="toggle-btn"
                onClick={() => handleToggleTask(task._id, !task.isCompleted)}
              >
                {task.isCompleted ? "Mark Incomplete" : "Mark Complete"}
              </button>
              <button
                className="delete-btn"
                onClick={() => handleDeleteTask(task._id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
        <input
          type="text"
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          placeholder="New Task"
        />
        <button onClick={handleAddTask}>Add Task</button>

        {/* Checklist */}
        <h2>Checklist</h2>
        <div className="checklist">
          <ul>
            {Object.keys(checklist).map((item) => (
              <li key={item}>
                <label>
                  <input
                    type="checkbox"
                    checked={checklist[item] || false}
                    onChange={() => handleChecklistToggle(item)}
                  />
                  {item}
                </label>
              </li>
            ))}
          </ul>
        </div>

        {/* Add Information */}
        <h2>Add Information</h2>
        <div className="add-info">
          <input
            type="text"
            placeholder="Field Name"
            value={newField.name}
            onChange={(e) => setNewField({ ...newField, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Field Value"
            value={newField.value}
            onChange={(e) =>
              setNewField({ ...newField, value: e.target.value })
            }
          />
          <button onClick={handleAddInformation}>+ Add</button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
