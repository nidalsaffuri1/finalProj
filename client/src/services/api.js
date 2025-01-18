const API_URL = "http://localhost:5000/projects";

// Fetch all projects with pagination, sorting, and search
export const fetchProjects = async (
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  order = "desc",
  search = ""
) => {
  try {
    const url = `${API_URL}?page=${page}&limit=${limit}&sortBy=${sortBy}&order=${order}&search=${encodeURIComponent(
      search
    )}`;
    console.log("Fetching Projects from URL:", url);

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error Response:", errorText);
      throw new Error(`Failed to fetch projects: ${errorText}`);
    }

    const data = await response.json();
    console.log("Projects Response Data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching projects:", error.message);
    throw error;
  }
};

// Fetch project by ID
export const fetchProjectById = async (id) => {
  try {
    console.log("Fetching project by ID:", id);
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to fetch project details:", errorText);
      throw new Error(`Failed to fetch project details: ${errorText}`);
    }
    const data = await response.json();
    console.log("Fetched Project Details:", data);
    return data;
  } catch (error) {
    console.error("Error in fetchProjectById:", error.message);
    throw error;
  }
};

export const fetchProducts = async () => {
  try {
    const response = await fetch("http://localhost:5000/products");
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const createProject = async (projectData) => {
  try {
    console.log("Creating project with data:", projectData);

    // If customerId exists, strip out redundant fields to avoid validation issues
    const dataToSend = projectData.customerId
      ? {
          serialNumber: projectData.serialNumber,
          truckModel: projectData.truckModel,
          truckRegistrationNumber: projectData.truckRegistrationNumber,
          truckWeightCapacity: projectData.truckWeightCapacity,
          notes: projectData.notes,
          customerId: projectData.customerId,
        }
      : projectData; // Send full data if no customerId

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to create project, response:", errorText);
      throw new Error(`Failed to create project: ${errorText}`);
    }

    const data = await response.json();
    console.log("Created Project Response:", data);
    return data;
  } catch (error) {
    console.error("Error creating project:", error.message);
    throw error;
  }
};

// Update a project
export const updateProject = async (id, projectData) => {
  try {
    // Ensure `truckModel` and `weightCapacity` are part of the payload
    const payload = {
      ...projectData,
      truckModel: projectData.truckModel, // Include truck model
      weightCapacity: projectData.weightCapacity, // Include weight capacity
    };

    console.log("Updating project with data:", payload);

    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload), // Send all updated fields
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to update project:", errorText);
      throw new Error(`Failed to update project: ${errorText}`);
    }

    const data = await response.json();
    console.log("Updated Project Response:", data);
    return data;
  } catch (error) {
    console.error("Error updating project:", error.message);
    throw error;
  }
};


// services/api.js

export const deleteProduct = async (productId) => {
  try {
    const response = await fetch(
      `http://localhost:5000/products/${productId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete product");
    }

    const data = await response.json();
    console.log("Product deleted:", data);
    return data;
  } catch (error) {
    console.error("Error deleting product:", error.message);
    throw error;
  }
};

// Delete a project
export const deleteProject = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to delete project:", errorText);
      throw new Error(`Failed to delete project: ${errorText}`);
    }

    const data = await response.json();
    console.log("Deleted Project Response:", data);
    return data;
  } catch (error) {
    console.error("Error deleting project:", error.message);
    throw error;
  }
};

// Create a new product
export const createProduct = async (productData) => {
  try {
    const response = await fetch("http://localhost:5000/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to create product:", errorText);
      throw new Error(`Failed to create product: ${errorText}`);
    }

    const data = await response.json();
    console.log("Created Product Response:", data);
    return data;
  } catch (error) {
    console.error("Error creating product:", error.message);
    throw error;
  }
};

// Fetch all customers
export const fetchCustomers = async () => {
  try {
    const response = await fetch("http://localhost:5000/customers");

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to fetch customers:", errorText);
      throw new Error(`Failed to fetch customers: ${errorText}`);
    }

    const data = await response.json();
    console.log("Fetched Customers:", data);
    return data;
  } catch (error) {
    console.error("Error fetching customers:", error.message);
    throw error;
  }
};

export const fetchCustomerById = async (customerId) => {
  try {
    const response = await fetch(
      `http://localhost:5000/customers/${customerId}`
    );
    if (!response.ok) throw new Error("Failed to fetch customer details");
    const data = await response.json();
    console.log("Fetched Customer Data:", data); // Debug: Ensure data is correct
    return data;
  } catch (error) {
    console.error("Error fetching customer by ID:", error.message);
    throw error;
  }
};

// Update project notes
export const updateNotes = async (projectId, notes) => {
  try {
    const response = await fetch(`${API_URL}/${projectId}/notes`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notes }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to update notes:", errorText);
      throw new Error(`Failed to update notes: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in updateNotes:", error.message);
    throw error;
  }
};

export const fetchTruckById = async (truckId) => {
  try {
    const response = await fetch(`http://localhost:5000/trucks/${truckId}`);
    if (!response.ok) throw new Error("Failed to fetch truck details");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching truck:", error.message);
    throw error;
  }
};

export const fetchTasks = async (projectId) => {
  try {
    console.log("Fetching tasks for projectId:", projectId);
    const response = await fetch(
      `http://localhost:5000/tasks?projectId=${projectId}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to fetch tasks:", errorText);
      throw new Error(`Failed to fetch tasks: ${errorText}`);
    }

    const data = await response.json();
    console.log("Fetched Tasks:", data);
    return data;
  } catch (error) {
    console.error("Error fetching tasks:", error.message);
    throw error;
  }
};

// Fetch reusable tasks
export const fetchReusableTasks = async () => {
  try {
    const response = await fetch("http://localhost:5000/reusableTasks"); // Adjust endpoint as necessary
    if (!response.ok) {
      throw new Error("Failed to fetch reusable tasks.");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching reusable tasks:", error);
    throw error;
  }
};

// Create a new reusable task
export const createReusableTask = async (taskData) => {
  try {
    const response = await fetch("http://localhost:5000/reusable-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });
    if (!response.ok) throw new Error("Failed to create reusable task");
    return await response.json();
  } catch (error) {
    console.error("Error creating reusable task:", error);
    throw error;
  }
};

// Delete a reusable task
export const deleteReusableTask = async (taskId) => {
  try {
    const response = await fetch(
      `http://localhost:5000/reusable-tasks/${taskId}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) throw new Error("Failed to delete reusable task");
    return await response.json();
  } catch (error) {
    console.error("Error deleting reusable task:", error);
    throw error;
  }
};

// Create a new task
export const createTask = async (taskData) => {
  try {
    console.log("Creating Task with Data:", taskData); // Debug log
    const response = await fetch("http://localhost:5000/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to create task:", errorText); // Log error details
      throw new Error(`Failed to create task: ${errorText}`);
    }

    const data = await response.json();
    console.log("Created Task:", data); // Debug log
    return data;
  } catch (error) {
    console.error("Error in createTask:", error.message);
    throw error;
  }
};

// Update a task
export const updateTask = async (taskId, updateData) => {
  try {
    const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to update task:", errorText);
      throw new Error(`Failed to update task: ${errorText}`);
    }

    const data = await response.json();
    console.log("Updated Task Response:", data);
    return data;
  } catch (error) {
    console.error("Error updating task:", error.message);
    throw error;
  }
};

// Delete a task
export const deleteTask = async (taskId) => {
  try {
    const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to delete task:", errorText);
      throw new Error(`Failed to delete task: ${errorText}`);
    }

    const data = await response.json();
    console.log("Deleted Task Response:", data);
    return data;
  } catch (error) {
    console.error("Error deleting task:", error.message);
    throw error;
  }
};
