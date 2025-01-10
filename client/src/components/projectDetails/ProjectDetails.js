// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import {
//   fetchProjectById,
//   fetchTasks,
//   fetchTruckById,
//   updateNotes,
//   createTask,
//   updateTask,
//   deleteTask,
//   updateProject,
//   createProduct,
//   fetchProducts,
//   deleteProduct,
// } from "../../services/api";
// import { toast } from "react-toastify";
// import "./projectDetailss.css";

// const ProjectDetails = () => {
//   const { id } = useParams();
//   const [project, setProject] = useState(null);
//   const [truck, setTruck] = useState(null);
//   const [tasks, setTasks] = useState([]);
//   const [newTaskName, setNewTaskName] = useState("");
//   const [newField, setNewField] = useState({ name: "", value: "" });
//   const [checklist, setChecklist] = useState([]);
//   const [products, setProducts] = useState([]); // For right block
//   const [newProduct, setNewProduct] = useState({ name: "", price: "" });
//   const [isEditing, setIsEditing] = useState(false); // Toggle Edit Mode
//   const [editableProject, setEditableProject] = useState({}); // Temporary editable project data
//   const [isTasksOpen, setIsTasksOpen] = useState(false); // Toggle for Tasks section
//   const [isProductsOpen, setIsProductsOpen] = useState(false); // Toggle for Products section

//   useEffect(() => {
//     const loadProjectDetails = async () => {
//       try {
//         const projectData = await fetchProjectById(id);
//         const productData = await fetchProducts();
//         const taskData = await fetchTasks(id);

//         setProject(projectData);
//         setProducts(productData);
//         setTasks(taskData);

//         if (projectData.truckId) {
//           const truckData = await fetchTruckById(projectData.truckId);
//           setTruck(truckData);

//           setProject((prev) => ({
//             ...prev,
//             truckModel: truckData.model,
//             weightCapacity: truckData.weightCapacity,
//           }));
//         }

//         setChecklist(projectData.checklist || []);
//         loadAvailableProducts();
//       } catch (error) {
//         console.error("Error loading project details:", error.message);
//         toast.error("Failed to load project details.");
//       }
//     };

//     loadProjectDetails();
//   }, [id]);

//   const loadAvailableProducts = async () => {
//     try {
//       const productData = await fetchProducts();
//       setProducts(productData);
//     } catch (error) {
//       console.error("Failed to fetch products:", error);
//       toast.error("Failed to load available products.");
//     }
//   };

//   const handleEditClick = () => {
//     setEditableProject({
//       ...project,
//       customerName: project.customerId?.name || "",
//       customerEmail: project.customerId?.email || "",
//       customerPhone: project.customerId?.phone || "",
//       customerAddress: project.customerId?.address || "",
//       truckModel: project.truckModel || truck?.model || "",
//       weightCapacity: project.weightCapacity || truck?.weightCapacity || "",
//     });
//     setIsEditing(true);
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;

//     if (name === "truckModel" || name === "weightCapacity") {
//       setEditableProject((prev) => ({
//         ...prev,
//         truckId: {
//           ...prev.truckId,
//           [name === "truckModel" ? "model" : "weightCapacity"]: value,
//         },
//       }));
//     } else {
//       setEditableProject((prev) => ({
//         ...prev,
//         [name]: value,
//       }));
//     }
//   };

//   const handleDynamicFieldChange = (index, value) => {
//     const updatedFields = [...editableProject.dynamicFields];
//     updatedFields[index].value = value;
//     setEditableProject((prev) => ({
//       ...prev,
//       dynamicFields: updatedFields,
//     }));
//   };
//   const handleSaveChanges = async () => {
//     try {
//       const updatedProject = {
//         ...editableProject,
//         customerId: project.customerId?._id,
//         truckId: project.truckId,
//         truckModel: editableProject.truckModel,
//         weightCapacity: editableProject.weightCapacity,
//       };

//       const result = await updateProject(project._id, updatedProject);

//       // Reflect updated truck data in project state
//       setProject((prev) => ({
//         ...prev,
//         truckModel: result.truckModel,
//         weightCapacity: result.weightCapacity,
//       }));

//       setIsEditing(false);
//       toast.success("Project updated successfully!");
//     } catch (error) {
//       console.error("Failed to update project:", error);
//       toast.error("Failed to update project.");
//     }
//   };

//   const handleDeleteProduct = async (productId) => {
//     if (!window.confirm("Are you sure you want to delete this product?"))
//       return;

//     try {
//       await deleteProduct(productId); // Call delete API
//       setProducts((prev) => prev.filter((prod) => prod._id !== productId)); // Remove from state
//       toast.success("Product deleted successfully!");
//     } catch (error) {
//       toast.error("Failed to delete product.");
//     }
//   };

//   const handleChecklistToggle = async (productId) => {
//     const existingItem = checklist.find(
//       (item) =>
//         item.productId === productId || item.productId?._id === productId
//     );

//     let updatedChecklist;
//     if (existingItem) {
//       updatedChecklist = checklist.filter(
//         (item) => item.productId !== productId
//       );
//     } else {
//       const productToAdd = products.find((prod) => prod._id === productId);
//       updatedChecklist = [
//         ...checklist,
//         {
//           productId: productToAdd._id,
//           productName: productToAdd.name,
//           price: productToAdd.unitPrice,
//           checked: true,
//         },
//       ];
//     }

//     try {
//       const updatedProject = await updateProject(project._id, {
//         ...project,
//         checklist: updatedChecklist,
//       });
//       setChecklist(updatedChecklist);
//       setProject(updatedProject);
//       toast.success("Checklist updated!");
//     } catch (error) {
//       console.error("Failed to update checklist:", error);
//       toast.error("Failed to update checklist.");
//     }

//     setChecklist(updatedChecklist); // Update the state to reflect the changes
//   };

//   const handleAddTask = async () => {
//     if (!newTaskName.trim()) return toast.error("Task name cannot be empty.");
//     try {
//       const task = await createTask({ projectId: id, name: newTaskName });
//       setTasks((prev) => [...prev, task]);
//       setNewTaskName("");
//       toast.success("Task added successfully!");
//     } catch (error) {
//       console.error("Failed to create task:", error);
//       toast.error("Failed to create task.");
//     }
//   };

//   const handleToggleTask = async (taskId, isCompleted) => {
//     try {
//       const updatedTask = await updateTask(taskId, { isCompleted });
//       setTasks((prev) =>
//         prev.map((task) => (task._id === taskId ? updatedTask : task))
//       );
//       toast.success("Task updated successfully!");
//     } catch (error) {
//       console.error("Failed to update task:", error);
//       toast.error("Failed to update task.");
//     }
//   };

//   const handleDeleteTask = async (taskId) => {
//     if (!window.confirm("Are you sure you want to delete this task?")) return;
//     try {
//       await deleteTask(taskId);
//       setTasks((prev) => prev.filter((task) => task._id !== taskId));
//       toast.success("Task deleted successfully!");
//     } catch (error) {
//       console.error("Failed to delete task:", error);
//       toast.error("Failed to delete task.");
//     }
//   };

//   const handleAddInformation = async () => {
//     if (!newField.name.trim() || !newField.value.trim()) {
//       return toast.error("Both name and value are required.");
//     }

//     const updatedFields = [...(project.dynamicFields || []), newField];

//     try {
//       const updatedProject = await updateProject(project._id, {
//         dynamicFields: updatedFields, // Send only dynamicFields
//       });

//       // Update project state without overriding truck or customer data
//       setProject((prev) => ({
//         ...prev,
//         dynamicFields: updatedProject.dynamicFields,
//       }));

//       setNewField({ name: "", value: "" });
//       toast.success("Information added successfully!");
//     } catch (error) {
//       console.error("Failed to add information:", error.message);
//       toast.error("Failed to add information.");
//     }
//   };

//   const handleProductClick = (product) => {
//     const existingItemIndex = checklist.findIndex(
//       (item) => item.productId === product._id
//     );

//     if (existingItemIndex === -1) {
//       // Add product with default quantity and ensure price is treated correctly
//       const newItem = {
//         productId: product._id,
//         productName: product.name,
//         price: product.unitPrice || 0, // Ensure price is set
//         quantity: 1, // Ensure default quantity
//         checked: true,
//       };
//       setChecklist((prev) => [...prev, newItem]);
//       toast.success(`${product.name} added to checklist.`);
//     } else {
//       toast.warn(`${product.name} is already in the checklist.`);
//     }
//   };

//   // Handle Adding New Product
//   const handleAddProduct = async () => {
//     if (!newProduct.name || !newProduct.price) {
//       toast.error("Product name and price are required.");
//       return;
//     }
//     try {
//       const createdProduct = await createProduct({
//         name: newProduct.name,
//         unitPrice: parseFloat(newProduct.price),
//       });
//       setProducts((prev) => [...prev, createdProduct]);
//       setNewProduct({ name: "", price: "" });
//       toast.success("Product added successfully!");
//     } catch (error) {
//       toast.error("Failed to add product.");
//       console.error("Failed to add product:", error);
//     }
//   };

//   const handleSaveNotes = async () => {
//     if (!project.notes.trim()) {
//       return toast.error("Notes cannot be empty.");
//     }

//     try {
//       const updatedProject = await updateNotes(project._id, project.notes);

//       // Preserve customer data and other project details
//       setProject((prev) => ({
//         ...prev,
//         notes: updatedProject.notes, // Update only the notes
//       }));

//       toast.success("Notes updated successfully!");
//     } catch (error) {
//       console.error("Error saving notes:", error);
//       toast.error("Failed to save notes.");
//     }
//   };

//   const handleQuantityChange = (productId, newQuantity) => {
//     const updatedChecklist = checklist.map((item) =>
//       item.productId === productId
//         ? { ...item, quantity: parseInt(newQuantity) || 1 }
//         : item
//     );
//     setChecklist(updatedChecklist);
//   };

//   const calculateTotal = () => {
//     return checklist
//       .filter((item) => item.checked)
//       .reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
//   };

//   if (!project) return <p>Loading...</p>;
//   console.log(project);
//   return (
//     <div className="container">
//       {/* Sidebar */}
//       <div className="sidebar">
//         <h2>Project Information</h2>
//         <ul>
//           <li>
//             <strong>Serial Number:</strong>{" "}
//             {isEditing ? (
//               <input
//                 type="text"
//                 name="serialNumber"
//                 value={editableProject.serialNumber || ""}
//                 onChange={handleInputChange}
//               />
//             ) : (
//               project.serialNumber || "-"
//             )}
//           </li>
//           <li>
//             <strong>Customer Name:</strong>{" "}
//             {isEditing ? (
//               <input
//                 type="text"
//                 name="customerName"
//                 value={editableProject.customerName || ""}
//                 onChange={handleInputChange}
//               />
//             ) : (
//               project.customerId?.name || "-"
//             )}
//           </li>

//           <li>
//             <strong>Customer Email:</strong>{" "}
//             {isEditing ? (
//               <input
//                 type="email"
//                 name="customerEmail"
//                 value={editableProject.customerEmail || ""}
//                 onChange={handleInputChange}
//               />
//             ) : (
//               project.customerId?.email || "-"
//             )}
//           </li>

//           <li>
//             <strong>Customer Phone:</strong>{" "}
//             {isEditing ? (
//               <input
//                 type="text"
//                 name="customerPhone"
//                 value={editableProject.customerPhone || ""}
//                 onChange={handleInputChange}
//               />
//             ) : (
//               project.customerId?.phone || "-"
//             )}
//           </li>

//           <li>
//             <strong>Customer Address:</strong>{" "}
//             {isEditing ? (
//               <input
//                 type="text"
//                 name="customerAddress"
//                 value={editableProject.customerAddress || ""}
//                 onChange={handleInputChange}
//               />
//             ) : (
//               project.customerId?.address || "-"
//             )}
//           </li>

//           <li>
//             <strong>Truck Model:</strong>{" "}
//             {isEditing ? (
//               <input
//                 type="text"
//                 name="truckModel"
//                 value={editableProject.truckModel || ""}
//                 onChange={handleInputChange}
//               />
//             ) : (
//               project.truckModel || "-"
//             )}
//           </li>
//           <li>
//             <strong>Weight Capacity:</strong>{" "}
//             {isEditing ? (
//               <input
//                 type="number"
//                 name="weightCapacity"
//                 value={editableProject.weightCapacity || ""}
//                 onChange={handleInputChange}
//               />
//             ) : (
//               `${project.weightCapacity || "-"} kg`
//             )}
//           </li>

//           {/* Render dynamic fields if available */}
//           {project.dynamicFields?.map((field, index) => (
//             <li key={index}>
//               <strong>{field.name}:</strong>{" "}
//               {isEditing ? (
//                 <input
//                   type="text"
//                   name={`dynamic_${index}`}
//                   value={editableProject.dynamicFields[index]?.value || ""}
//                   onChange={(e) =>
//                     handleDynamicFieldChange(index, e.target.value)
//                   }
//                 />
//               ) : (
//                 field.value || "-"
//               )}
//             </li>
//           ))}
//         </ul>

//         {/* Edit / Save Button Section */}
//         <div className="button-group">
//           {isEditing ? (
//             <button className="save-btn" onClick={handleSaveChanges}>
//               Save
//             </button>
//           ) : (
//             <button className="edit-btn" onClick={handleEditClick}>
//               Edit
//             </button>
//           )}
//         </div>

//         {/* Notes Section */}
//         <div className="notes-block">
//           <h3>Notes</h3>
//           <textarea
//             value={project.notes || ""}
//             onChange={(e) =>
//               setProject((prev) => ({ ...prev, notes: e.target.value }))
//             }
//           ></textarea>
//           <button onClick={handleSaveNotes}>Save Notes</button>
//         </div>

//         {/* Add Information */}
//         <h2>Add Information</h2>
//         <div className="add-info">
//           <input
//             type="text"
//             placeholder="Field Name"
//             value={newField.name}
//             onChange={(e) => setNewField({ ...newField, name: e.target.value })}
//           />
//           <input
//             type="text"
//             placeholder="Field Value"
//             value={newField.value}
//             onChange={(e) =>
//               setNewField({ ...newField, value: e.target.value })
//             }
//           />
//           <button onClick={handleAddInformation}>+ Add</button>
//         </div>
//       </div>
//       {/* Tasks Block */}
//       <div className="block">
//         {/* Tasks */}
//         <h2>Tasks</h2>
//         <ul className="task-list">
//           {tasks.map((task) => (
//             <li key={task._id}>
//               <span
//                 style={{
//                   textDecoration: task.isCompleted ? "line-through" : "none",
//                 }}
//               >
//                 {task.name}
//               </span>
//               <button
//                 className="toggle-btn"
//                 onClick={() => handleToggleTask(task._id, !task.isCompleted)}
//               >
//                 {task.isCompleted ? "Mark Incomplete" : "Mark Complete"}
//               </button>
//               <button
//                 className="delete-btn"
//                 onClick={() => handleDeleteTask(task._id)}
//               >
//                 Delete
//               </button>
//             </li>
//           ))}
//         </ul>
//         <input
//           type="text"
//           value={newTaskName}
//           onChange={(e) => setNewTaskName(e.target.value)}
//           placeholder="New Task"
//         />
//         <button onClick={handleAddTask}>Add Task</button>
//       </div>
//       {/* Main Content */}
//       <div className="main-content">
//         {/* Checklist Block */}
//         <div className="block">
//           <h2>Checklist</h2>
//           <div className="checklist">
//             <ul>
//               {checklist.map((item) => (
//                 <li key={item.productId} className="checklist-item">
//                   <input
//                     type="checkbox"
//                     checked={item.checked}
//                     onChange={() => handleChecklistToggle(item.productId)}
//                   />
//                   {item.productName} - ${item.price} each
//                   {/* Quantity Input */}
//                   <input
//                     type="number"
//                     min="1"
//                     value={item.quantity}
//                     onChange={(e) =>
//                       handleQuantityChange(item.productId, e.target.value)
//                     }
//                     className="quantity-input"
//                   />
//                   {/* Total Price for the Item */}
//                   <span className="item-total">
//                     = ${(item.price * item.quantity).toFixed(2)}
//                   </span>
//                 </li>
//               ))}
//             </ul>
//             <div>
//               <strong>Total: ${calculateTotal().toFixed(2)}</strong>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Right Product Block */}
//       <div className="right-block">
//         <h2>Available Products</h2>
//         <ul className="product-list">
//           {products.map((product) => (
//             <li
//               key={product._id}
//               onClick={() => handleProductClick(product)} // Handles adding to checklist
//               className="product-item"
//             >
//               {product.name} - ${product.unitPrice}
//               <button
//                 className="delete-btn"
//                 onClick={(e) => {
//                   e.stopPropagation(); // Prevent triggering the parent click event
//                   handleDeleteProduct(product._id); // Delete the product
//                 }}
//               >
//                 Delete
//               </button>
//             </li>
//           ))}
//         </ul>

//         {/* Add New Product Form */}
//         <h3>Add New Product</h3>
//         <input
//           type="text"
//           placeholder="Product Name"
//           value={newProduct.name}
//           onChange={(e) =>
//             setNewProduct((prev) => ({ ...prev, name: e.target.value }))
//           }
//         />
//         <input
//           type="number"
//           placeholder="Price"
//           value={newProduct.price}
//           onChange={(e) =>
//             setNewProduct((prev) => ({ ...prev, price: e.target.value }))
//           }
//         />
//         <button onClick={handleAddProduct}>Add Product</button>
//       </div>
//     </div>
//   );
// };

// export default ProjectDetails;

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
  createProduct,
  fetchProducts,
  deleteProduct,
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
  const [products, setProducts] = useState([]); // For right block
  const [newProduct, setNewProduct] = useState({ name: "", price: "" });
  const [isEditing, setIsEditing] = useState(false); // Toggle Edit Mode
  const [editableProject, setEditableProject] = useState({}); // Temporary editable project data
  const [isTasksOpen, setIsTasksOpen] = useState(false); // Toggle for Tasks section
  const [isProductsOpen, setIsProductsOpen] = useState(false); // Toggle for Products section

  useEffect(() => {
    const loadProjectDetails = async () => {
      try {
        const projectData = await fetchProjectById(id);
        const productData = await fetchProducts();
        const taskData = await fetchTasks(id);

        setProject(projectData);
        setProducts(productData);
        setTasks(taskData);

        if (projectData.truckId) {
          const truckData = await fetchTruckById(projectData.truckId);
          setTruck(truckData);

          setProject((prev) => ({
            ...prev,
            truckModel: truckData.model,
            weightCapacity: truckData.weightCapacity,
          }));
        }

        setChecklist(projectData.checklist || []);
        loadAvailableProducts();
      } catch (error) {
        console.error("Error loading project details:", error.message);
        toast.error("Failed to load project details.");
      }
    };

    loadProjectDetails();
  }, [id]);

  const loadAvailableProducts = async () => {
    try {
      const productData = await fetchProducts();
      setProducts(productData);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to load available products.");
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
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "truckModel" || name === "weightCapacity") {
      setEditableProject((prev) => ({
        ...prev,
        truckId: {
          ...prev.truckId,
          [name === "truckModel" ? "model" : "weightCapacity"]: value,
        },
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
        truckModel: editableProject.truckModel,
        weightCapacity: editableProject.weightCapacity,
      };

      const result = await updateProject(project._id, updatedProject);

      // Reflect updated truck data in project state
      setProject((prev) => ({
        ...prev,
        truckModel: result.truckModel,
        weightCapacity: result.weightCapacity,
      }));

      setIsEditing(false);
      toast.success("Project updated successfully!");
    } catch (error) {
      console.error("Failed to update project:", error);
      toast.error("Failed to update project.");
    }
  };

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

  const handleChecklistToggle = async (productId) => {
    const existingItem = checklist.find(
      (item) =>
        item.productId === productId || item.productId?._id === productId
    );

    let updatedChecklist;
    if (existingItem) {
      updatedChecklist = checklist.filter(
        (item) => item.productId !== productId
      );
    } else {
      const productToAdd = products.find((prod) => prod._id === productId);
      updatedChecklist = [
        ...checklist,
        {
          productId: productToAdd._id,
          productName: productToAdd.name,
          price: productToAdd.unitPrice,
          checked: true,
        },
      ];
    }

    try {
      const updatedProject = await updateProject(project._id, {
        ...project,
        checklist: updatedChecklist,
      });
      setChecklist(updatedChecklist);
      setProject(updatedProject);
      toast.success("Checklist updated!");
    } catch (error) {
      console.error("Failed to update checklist:", error);
      toast.error("Failed to update checklist.");
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

  const handleProductClick = (product) => {
    const existingItemIndex = checklist.findIndex(
      (item) => item.productId === product._id
    );

    if (existingItemIndex === -1) {
      // Add product with default quantity and ensure price is treated correctly
      const newItem = {
        productId: product._id,
        productName: product.name,
        price: product.unitPrice || 0, // Ensure price is set
        quantity: 1, // Ensure default quantity
        checked: true,
      };
      setChecklist((prev) => [...prev, newItem]);
      toast.success(`${product.name} added to checklist.`);
    } else {
      toast.warn(`${product.name} is already in the checklist.`);
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

  const handleQuantityChange = (productId, newQuantity) => {
    const updatedChecklist = checklist.map((item) =>
      item.productId === productId
        ? { ...item, quantity: parseInt(newQuantity) || 1 }
        : item
    );
    setChecklist(updatedChecklist);
  };

  const calculateTotal = () => {
    return checklist
      .filter((item) => item.checked)
      .reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
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
              project.truckModel || "-"
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
              `${project.weightCapacity || "-"} kg`
            )}
          </li>

          {/* Render dynamic fields if available */}
          {project.dynamicFields?.map((field, index) => (
            <li key={index}>
              <strong>{field.name}:</strong>{" "}
              {isEditing ? (
                <input
                  type="text"
                  name={`dynamic_${index}`}
                  value={editableProject.dynamicFields[index]?.value || ""}
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

        {/* Edit / Save Button Section */}
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
      {/* Tasks Collapsible Section */}
      <div className="collapsible-section">
        <div
          className="collapsible-header"
          onClick={() => setIsTasksOpen(!isTasksOpen)}
        >
          <h3>Tasks</h3>
          <span>{isTasksOpen ? "▲" : "▼"}</span>
        </div>
        {isTasksOpen && (
          <div className="collapsible-content">
            <ul className="task-list">
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
                    className="toggle-btn"
                    onClick={() =>
                      handleToggleTask(task._id, !task.isCompleted)
                    }
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
            <button className="add-task-btn" onClick={handleAddTask}>
              Add Task
            </button>
          </div>
        )}
      </div>

      {/* Available Products Collapsible Section */}
      <div className="collapsible-section">
        <div
          className="collapsible-header"
          onClick={() => setIsProductsOpen(!isProductsOpen)}
        >
          <h3>Available Products</h3>
          <span>{isProductsOpen ? "▲" : "▼"}</span>
        </div>
        {isProductsOpen && (
          <div className="collapsible-content">
            <ul className="product-list">
              {products.map((product) => (
                <li
                  key={product._id}
                  onClick={() => handleProductClick(product)}
                  className="product-item"
                >
                  {product.name} - ${product.unitPrice}
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

            {/* Add Product Form */}
            <div className="add-product-form">
              <input
                type="text"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct((prev) => ({ ...prev, name: e.target.value }))
                }
              />
              <input
                type="number"
                placeholder="Price"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct((prev) => ({ ...prev, price: e.target.value }))
                }
              />
              <button className="add-product-btn" onClick={handleAddProduct}>
                Add Product
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Main Content */}
      <div className="main-content">
        {/* Checklist Block */}
        <div className="block">
          <h2>Checklist</h2>
          <div className="checklist">
            <ul>
              {checklist.map((item) => (
                <li key={item.productId} className="checklist-item">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => handleChecklistToggle(item.productId)}
                  />
                  {item.productName} - ${item.price} each
                  {/* Quantity Input */}
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(item.productId, e.target.value)
                    }
                    className="quantity-input"
                  />
                  {/* Total Price for the Item */}
                  <span className="item-total">
                    = ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
            <div>
              <strong>Total: ${calculateTotal().toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
