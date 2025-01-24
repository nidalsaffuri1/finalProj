import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  createProduct,
  fetchProducts,
  deleteProduct,
  deleteReusableTask,
  // fetchReusableTasks, // Newly added function
} from "../../services/api";
import { toast } from "react-toastify";
import "./projectDetailss.css";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [truck, setTruck] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [reusableTasks, setReusableTasks] = useState([]); // Reusable tasks
  const [newTaskName, setNewTaskName] = useState("");
  // const [newReusableTaskName, setNewReusableTaskName] = useState("");
  const [newField, setNewField] = useState({ name: "", value: "" });
  const [checklist, setChecklist] = useState([]);
  const [products, setProducts] = useState([]); // For right block
  const [newProduct, setNewProduct] = useState({ name: "", price: "" });
  const [isEditing, setIsEditing] = useState(false); // Toggle Edit Mode
  const [editableProject, setEditableProject] = useState({}); // Temporary editable project data
  // const [isTasksOpen, setIsTasksOpen] = useState(false); // Toggle for Tasks section
  const [isProductsOpen, setIsProductsOpen] = useState(false); // Toggle for Products section
  const [isReusableTasksOpen, setIsReusableTasksOpen] = useState(false); // Toggle for Reusable Tasks

  useEffect(() => {
    const loadProjectDetails = async () => {
      try {
        const projectData = await fetchProjectById(id);
        const productData = await fetchProducts();
        const taskData = await fetchTasks(id);
        // const availableReusableTasks = await fetchReusableTasks(); // Fetch reusable tasks

        setProject(projectData);
        setProducts(productData);
        setTasks(taskData);
        setChecklist(projectData.checklist || []);

        if (projectData.truckId) {
          const truckData = await fetchTruckById(projectData.truckId);
          setTruck(truckData);

          setProject((prev) => ({
            ...prev,
            truckModel: truckData.model,
            weightCapacity: truckData.weightCapacity,
          }));
        }

        loadAvailableProducts();
      } catch (error) {
        console.error("Error loading project details:", error.message);
        toast.error("Failed to load project details.");
      }
    };

    const loadReusableTasks = async () => {
      try {
        const response = await fetch("http://localhost:5000/reusable-tasks");
        const data = await response.json();

        // const tasks = await fetchReusableTasks();
        setReusableTasks(data);
      } catch (error) {
        toast.error("Failed to load reusable tasks.");
      }
    };

    const loadProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const products = await fetchProducts(token);
        setProducts(products); // Update the state with fetched products
      } catch (error) {
        toast.error("Failed to load products.");
      }
    };

    loadProjectDetails();
    loadReusableTasks();
    loadProducts();
  }, [id]);

  const handleAddReusableTaskToDaily = async (task) => {
    try {
      // Add the reusable task as a daily task
      const newTask = await createTask({ projectId: id, name: task.name });
      setTasks((prev) => [...prev, newTask]);
      toast.success(`Task "${task.name}" added to daily tasks.`);
    } catch (error) {
      console.error("Failed to add reusable task to daily tasks:", error);
      toast.error("Failed to add task.");
    }
  };

  const handleAddNewReusableTask = async () => {
    if (!newTaskName.trim()) {
      toast.error("Task name cannot be empty.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/reusable-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTaskName }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create reusable task: ${errorText}`);
      }

      const newTask = await response.json();
      setReusableTasks((prev) => [...prev, newTask]); // Update state
      setNewTaskName("");
      toast.success("Reusable task added successfully!");
    } catch (error) {
      console.error("Error adding reusable task:", error);
      toast.error("Failed to create reusable task.");
    }
  };

  const handleDeleteReusableTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await deleteReusableTask(taskId);
      setReusableTasks((prev) => prev.filter((task) => task._id !== taskId));
      toast.success("Reusable task deleted.");
    } catch (error) {
      toast.error("Failed to delete reusable task.");
    }
  };
  const loadAvailableProducts = async () => {
    try {
      const productData = await fetchProducts();
      setProducts(productData);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to load available products.");
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

  const handleEditClick = () => {
    setEditableProject({
      ...project,
      customerName: project.customerId?.name || "",
      customerEmail: project.customerId?.email || "",
      customerPhone: project.customerId?.phone || "",
      customerAddress: project.customerId?.address || "",
      truckModel: project.truckModel || truck?.model || "",
      weightCapacity: project.weightCapacity || truck?.weightCapacity || "",
    });
    console.log("Editable Project:", editableProject); // Add this line
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "truckModel" || name === "weightCapacity") {
      setEditableProject((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setEditableProject((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleDynamicFieldChange = (index, value) => {
    const updatedFields = [...editableProject.dynamicFields];
    updatedFields[index].value = value;
    setEditableProject((prev) => ({
      ...prev,
      dynamicFields: updatedFields,
    }));
  };
  const handleSaveChanges = async () => {
    try {
      const updatedProject = {
        ...editableProject,
        customerId: project.customerId?._id,
        truckId: project.truckId,
        customerName: editableProject.customerName, // Include customer details
        customerEmail: editableProject.customerEmail,
        customerPhone: editableProject.customerPhone,
        customerAddress: editableProject.customerAddress,
        truckModel: editableProject.truckModel,
        weightCapacity: editableProject.weightCapacity,
      };

      const result = await updateProject(project._id, updatedProject);
      setProject(result); // Update state with backend response
      setIsEditing(false);
      toast.success("Project updated successfully!");
    } catch (error) {
      console.error("Failed to update project:", error);
      toast.error("Failed to update project.");
    }
  };

  const saveChecklistToBackend = async (updatedChecklist) => {
    try {
      const updatedProject = await updateProject(project._id, {
        ...project,
        checklist: updatedChecklist,
      });
      setProject(updatedProject);
      toast.success("Checklist saved successfully!");
    } catch (error) {
      console.error("Failed to save checklist:", error);
      toast.error("Failed to save checklist.");
    }
  };

  // const saveChecklistToBackend = async (updatedChecklist) => {
  //   try {
  //     const updatedProject = await updateProject(project._id, {
  //       ...project,
  //       checklist: updatedChecklist,
  //     });
  //     setProject(updatedProject);
  //     toast.success("Checklist saved successfully!");
  //   } catch (error) {
  //     console.error("Failed to save checklist:", error);
  //     toast.error("Failed to save checklist.");
  //   }
  // };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await deleteProduct(productId); // Call delete API
      setProducts((prev) => prev.filter((prod) => prod._id !== productId)); // Remove from state
      toast.success("Product deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete product.");
    }
  };

  const handleAddToChecklist = (product) => {
    if (checklist.some((item) => item.productId === product._id)) {
      toast.warn(`${product.name} is already in the checklist.`);
      return;
    }

    const newItem = {
      productId: product._id,
      productName: product.name,
      price: product.unitPrice,
      quantity: 1,
      checked: true,
    };

    const updatedChecklist = [...checklist, newItem];
    setChecklist(updatedChecklist);
    saveChecklistToBackend(updatedChecklist); // Save changes to backend
  };

  const handleChecklistToggle = async (productId) => {
    console.log("Toggling product ID:", productId);

    const existingItem = checklist.find(
      (item) =>
        item.productId === productId || item.productId?._id === productId
    );

    let updatedChecklist;

    if (existingItem) {
      console.log("Unchecking product:", existingItem);
      // Remove the product from the checklist
      updatedChecklist = checklist.filter(
        (item) => item.productId !== productId
      );
    } else {
      console.log("Adding product to checklist");
      const productToAdd = products.find((prod) => prod._id === productId);

      if (!productToAdd) {
        console.error("Product not found:", productId);
        return;
      }

      updatedChecklist = [
        ...checklist,
        {
          productId: productToAdd._id,
          productName: productToAdd.name,
          price: productToAdd.unitPrice,
          quantity: 1, // Default quantity
          checked: true,
        },
      ];
    }

    console.log("Updated Checklist Before API Call:", updatedChecklist);

    try {
      // Call API to update project
      const updatedProject = await updateProject(project._id, {
        checklist: updatedChecklist,
      });

      console.log("Updated Project from Backend:", updatedProject);

      setChecklist(updatedChecklist); // Update state with new checklist
      setProject(updatedProject); // Sync state with backend
      toast.success(existingItem ? "Product removed!" : "Checklist updated!");
    } catch (error) {
      console.error("Failed to update checklist:", error);
      toast.error("Failed to update checklist.");
    }
  };

  const handleQuantityChange = (productId, quantity) => {
    const updatedChecklist = checklist.map((item) =>
      item.productId === productId
        ? { ...item, quantity: Math.max(1, parseInt(quantity) || 1) } // Ensure minimum of 1
        : item
    );
    setChecklist(updatedChecklist);
    saveChecklistToBackend(updatedChecklist);
  };

  const calculateTotal = () =>
    checklist
      .filter((item) => item.checked)
      .reduce((total, item) => total + item.price * item.quantity, 0);

  const handleAddInformation = async () => {
    if (!newField.name.trim() || !newField.value.trim()) {
      return toast.error("Both name and value are required.");
    }

    const updatedFields = [...(project.dynamicFields || []), newField];

    try {
      const updatedProject = await updateProject(project._id, {
        dynamicFields: updatedFields, // Send only dynamicFields
      });

      // Update project state without overriding truck or customer data
      setProject((prev) => ({
        ...prev,
        dynamicFields: updatedProject.dynamicFields,
      }));

      setNewField({ name: "", value: "" });
      toast.success("Information added successfully!");
    } catch (error) {
      console.error("Failed to add information:", error.message);
      toast.error("Failed to add information.");
    }
  };

  // Handle Adding New Product
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      toast.error("Product name and price are required.");
      return;
    }
    try {
      const createdProduct = await createProduct({
        name: newProduct.name,
        unitPrice: parseFloat(newProduct.price),
      });
      setProducts((prev) => [...prev, createdProduct]);
      setNewProduct({ name: "", price: "" });
      toast.success("Product added successfully!");
    } catch (error) {
      toast.error("Failed to add product.");
      console.error("Failed to add product:", error);
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

  if (!project) return <p>Loading...</p>;
  console.log(project);

  return (
    <div className="container">
      <div className="project-details">
        <div className="navigation-button">
          <button onClick={() => navigate("/current-projects")}>
            Back to Projects
          </button>
        </div>
        {/* Rest of your component */}
      </div>
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Project Information</h2>
        <ul>
          {/* Serial Number */}
          <li>
            <strong>Serial Number:</strong>{" "}
            {isEditing ? (
              <input
                type="text"
                name="serialNumber"
                value={editableProject.serialNumber || ""}
                onChange={handleInputChange}
              />
            ) : (
              project.serialNumber || "-"
            )}
          </li>

          {/* Customer Information */}
          <li>
            <strong>Customer Name:</strong>{" "}
            {isEditing ? (
              <input
                type="text"
                name="customerName"
                value={editableProject.customerName || ""}
                onChange={handleInputChange}
              />
            ) : (
              project.customerId?.name || "-"
            )}
          </li>
          <li>
            <strong>Customer Email:</strong>{" "}
            {isEditing ? (
              <input
                type="email"
                name="customerEmail"
                value={editableProject.customerEmail || ""}
                onChange={handleInputChange}
              />
            ) : (
              project.customerId?.email || "-"
            )}
          </li>
          <li>
            <strong>Customer Phone:</strong>{" "}
            {isEditing ? (
              <input
                type="text"
                name="customerPhone"
                value={editableProject.customerPhone || ""}
                onChange={handleInputChange}
              />
            ) : (
              project.customerId?.phone || "-"
            )}
          </li>
          <li>
            <strong>Customer Address:</strong>{" "}
            {isEditing ? (
              <input
                type="text"
                name="customerAddress"
                value={editableProject.customerAddress || ""}
                onChange={handleInputChange}
              />
            ) : (
              project.customerId?.address || "-"
            )}
          </li>

          {/* Truck Information */}
          <li>
            <strong>Truck Model:</strong>{" "}
            {isEditing ? (
              <input
                type="text"
                name="truckModel"
                value={editableProject.truckModel || ""}
                onChange={handleInputChange}
              />
            ) : (
              project.truckModel || truck?.model || "-"
            )}
          </li>
          <li>
            <strong>Weight Capacity:</strong>{" "}
            {isEditing ? (
              <input
                type="number"
                name="weightCapacity"
                value={editableProject.weightCapacity || ""}
                onChange={handleInputChange}
              />
            ) : (
              `${project.weightCapacity || truck?.weightCapacity || "-"} kg`
            )}
          </li>

          {/* Dynamic Fields */}
          {editableProject.dynamicFields?.map((field, index) => (
            <li key={field._id || `${field.name}_${index}`}>
              {/* Unique keys: use `_id` or fallback to name + index */}
              <strong>{field.name}:</strong>{" "}
              {isEditing ? (
                <input
                  type="text"
                  name={`dynamic_${index}`}
                  value={field.value || ""}
                  onChange={(e) =>
                    handleDynamicFieldChange(index, e.target.value)
                  }
                />
              ) : (
                field.value || "-"
              )}
            </li>
          ))}
        </ul>

        {/* Edit/Save Button Section */}
        <div className="button-group">
          {isEditing ? (
            <button className="save-btn" onClick={handleSaveChanges}>
              Save
            </button>
          ) : (
            <button className="edit-btn" onClick={handleEditClick}>
              Edit
            </button>
          )}
        </div>

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

      {/* Main Content */}
      <div className="main-content">
        <div className="tasks-products-checklist">
          {/* Available Products Section */}
          <div className="collapsible-section">
            <div
              className="collapsible-header"
              onClick={() => setIsProductsOpen(!isProductsOpen)}
            >
              <h3>
                Available Products <span>{isProductsOpen ? "▲" : "▼"}</span>
              </h3>
            </div>
            {isProductsOpen && (
              <div className="collapsible-content">
                <ul className="product-list">
                  {products.map((product) => (
                    <li
                      key={product._id}
                      onClick={() => handleAddToChecklist(product)} // Use handleAddToChecklist here
                      className="product-item"
                    >
                      {product.name} = ${product.unitPrice}
                      <button
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering parent click
                          handleDeleteProduct(product._id);
                        }}
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="add-product-form">
                  <input
                    type="text"
                    placeholder="Product Name"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                  />
                  <button
                    className="add-product-btn"
                    onClick={handleAddProduct}
                  >
                    Add Product
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Checklist Section */}
          <div className="block">
            <h2>Checklist</h2>
            <ul>
              {checklist.map((item) => (
                <li key={item.productId} className="checklist-item">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => handleChecklistToggle(item.productId)}
                  />
                  {item.productName} - ${item.price} each
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(item.productId, e.target.value)
                    }
                    className="quantity-input"
                  />
                  <span className="item-total">
                    = ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>

            <strong>Total: ${calculateTotal().toFixed(2)}</strong>
          </div>

          {/* Reusable Tasks Section */}
          <div className="block">
            <h2
              onClick={() => setIsReusableTasksOpen((prev) => !prev)}
              className="toggle-header"
            >
              Available Tasks
              <span>{isReusableTasksOpen ? "▲" : "▼"}</span>
            </h2>
            {isReusableTasksOpen && (
              <div className="dropdown">
                <ul>
                  {reusableTasks.map((task) => (
                    <li
                      key={task._id}
                      onClick={() => handleAddReusableTaskToDaily(task)}
                      className="dropdown-item"
                    >
                      {task.name}
                      <button
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the parent onClick
                          handleDeleteReusableTask(task._id);
                        }}
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="add-task-form">
                  <input
                    type="text"
                    placeholder="New Reusable Task"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                  />
                  <button
                    onClick={handleAddNewReusableTask}
                    className="add-btn"
                  >
                    Add Task
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Daily Tasks Section */}
          <div className="block">
            <h2>Daily Tasks</h2>
            <ul>
              {tasks.map((task) => (
                <li key={task._id}>
                  <span
                    style={{
                      textDecoration: task.isCompleted
                        ? "line-through"
                        : "none",
                    }}
                  >
                    {task.name}
                  </span>
                  <button
                    onClick={() =>
                      handleToggleTask(task._id, !task.isCompleted)
                    }
                  >
                    {task.isCompleted ? "Mark Incomplete" : "Mark Complete"}
                  </button>
                  <button onClick={() => handleDeleteTask(task._id)}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
