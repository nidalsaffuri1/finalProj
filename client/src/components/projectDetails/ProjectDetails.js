import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  fetchProjectById,
  fetchTasks,
  fetchTruckById,
  updateNotes,
  createTask,
  updateTask,
  deleteTask,
  updateProject,
} from "../../services/api";
import { toast } from "react-toastify";
import "./projectDetailss.css";

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [truck, setTruck] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState("");
  const [newField, setNewField] = useState({ name: "", value: "" });
  const [checklist, setChecklist] = useState([]);

  useEffect(() => {
    const loadProjectDetails = async () => {
      try {
        const projectData = await fetchProjectById(id);
        setProject(projectData);

        if (projectData.truckId) {
          const truckData = await fetchTruckById(projectData.truckId);
          setTruck(truckData);
        }

        const taskData = await fetchTasks(id);
        setTasks(taskData);

        setChecklist(projectData.checklist || []);
      } catch (error) {
        console.error("Error loading project details:", error.message);
        toast.error("Failed to load project details.");
      }
    };

    loadProjectDetails();
  }, [id]);

  const handleChecklistToggle = async (productId) => {
    const updatedChecklist = checklist.map((item) =>
      (item.productId._id || item.productId) === productId
        ? { ...item, checked: !item.checked }
        : item
    );

    try {
      const updatedProject = await updateProject(project._id, {
        ...project,
        checklist: updatedChecklist,
      });

      // Ensure customer information is not overwritten
      setProject((prev) => ({
        ...updatedProject,
        customerId: prev.customerId, // Preserve existing customer data
      }));

      toast.success("Checklist updated successfully!");
    } catch (error) {
      toast.error("Failed to update checklist.");
      console.error("Error updating checklist:", error);
    }

    setChecklist(updatedChecklist); // Update the state to reflect the changes
  };

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

      // Preserve customer data
      setProject((prev) => ({
        ...updatedProject,
        customerId: prev.customerId,
      }));

      setNewField({ name: "", value: "" });
      toast.success("Information added successfully!");
    } catch (error) {
      console.error("Failed to add information:", error.message);
      toast.error("Failed to add information.");
    }
  };

  const handleSaveNotes = async () => {
    if (!project.notes.trim()) {
      return toast.error("Notes cannot be empty.");
    }

    try {
      const updatedProject = await updateNotes(project._id, project.notes);

      // Preserve customer data and other project details
      setProject((prev) => ({
        ...prev,
        notes: updatedProject.notes, // Update only the notes
      }));

      toast.success("Notes updated successfully!");
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Failed to save notes.");
    }
  };

  const calculateTotal = () => {
    return checklist
      .filter((item) => item.checked)
      .reduce(
        (sum, item) => sum + (item.productId?.unitPrice || item.price),
        0
      );
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
            <strong>Serial Number:</strong> {project.serialNumber || "-"}
          </li>
          <li>
            <strong>Customer Name:</strong> {project.customerId?.name || "-"}
          </li>
          <li>
            <strong>Customer Email:</strong> {project.customerId?.email || "-"}
          </li>
          <li>
            <strong>Customer Phone:</strong> {project.customerId?.phone || "-"}
          </li>
          <li>
            <strong>Customer Address:</strong>{" "}
            {project.customerId?.address || "-"}
          </li>
          <li>
            <strong>Truck Model:</strong> {truck?.model || "-"}
          </li>
          <li>
            <strong>Weight Capacity:</strong> {truck?.weightCapacity || "-"} kg
          </li>
          {project.dynamicFields?.map((field, index) => (
            <li key={index}>
              <strong>{field.name}:</strong> {field.value || "-"}
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
            {checklist.length > 0 ? (
              checklist.map((item) => (
                <li key={item._id || item.productId?._id || item.productName}>
                  <label>
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() =>
                        item.productId
                          ? handleChecklistToggle(
                              item.productId._id || item.productId
                            )
                          : console.error("Missing productId for item", item)
                      }
                    />
                    {item.productId?.name ||
                      item.productName ||
                      "Unnamed Product"}{" "}
                    - ${item.productId?.unitPrice || item.price || "0.00"}
                  </label>
                </li>
              ))
            ) : (
              <p>No products in checklist.</p>
            )}
          </ul>
          <div className="total-section">
            <strong>Total: ${calculateTotal().toFixed(2)}</strong>
          </div>
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
